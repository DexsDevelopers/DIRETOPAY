# PAYMENT RULES — Credit Saver Pro Enterprise

## Regras Críticas para Sistemas de Pagamento

---

## ⚠️ PRIORIDADE MÁXIMA

**Todas as regras neste documento são OBRIGATÓRIAS e não negociáveis.**

---

## PRINCÍPIOS FUNDAMENTAIS

### 1. SEGURANÇA ACIMA DE TUDO

```typescript
// ✅ OBRIGATÓRIO: Zero confiança em inputs externos
function processWebhook(payload: unknown, signature: string) {
  // 1. Validar assinatura PRIMEIRO
  if (!verifySignature(payload, signature)) {
    logger.security('Invalid webhook signature', { signature });
    throw new SecurityError('Invalid signature');
  }
  
  // 2. Validar schema
  const data = webhookSchema.parse(payload);
  
  // 3. Verificar idempotência (prevenir duplicados)
  if (await isDuplicateEvent(data.eventId)) {
    return { status: 'duplicate', processed: false };
  }
  
  // 4. Processar
  return processPayment(data);
}
```

### 2. IDEMPOTÊNCIA OBRIGATÓRIA

```typescript
// ✅ OBRIGATÓRIO: Operações idempotentes
async function processCharge(chargeData: ChargeData) {
  const idempotencyKey = chargeData.idempotencyKey;
  
  // Verificar se já processamos
  const existing = await db.transactions.findUnique({
    where: { idempotencyKey }
  });
  
  if (existing) {
    logger.info('Duplicate charge request', { idempotencyKey });
    return existing;
  }
  
  // Processar com atomicidade
  return await db.$transaction(async (tx) => {
    const transaction = await tx.transactions.create({
      data: { ...chargeData, status: 'processing' }
    });
    
    // Processar pagamento
    const result = await gateway.charge(chargeData);
    
    // Atualizar com resultado
    return await tx.transactions.update({
      where: { id: transaction.id },
      data: { 
        status: result.status,
        gatewayResponse: result.raw,
        processedAt: new Date()
      }
    });
  });
}
```

### 3. ATOMICIDADE DE OPERAÇÕES

```typescript
// ✅ OBRIGATÓRIO: Transações atômicas para operações financeiras
async function transferFunds(fromId: string, toId: string, amount: Decimal) {
  return await db.$transaction(async (tx) => {
    // 1. Verificar saldo (com lock)
    const fromWallet = await tx.wallets.findUnique({
      where: { id: fromId },
      select: { balance: true }
    });
    
    if (!fromWallet || fromWallet.balance.lessThan(amount)) {
      throw new InsufficientFundsError();
    }
    
    // 2. Debitar
    await tx.wallets.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } }
    });
    
    // 3. Creditar
    await tx.wallets.update({
      where: { id: toId },
      data: { balance: { increment: amount } }
    });
    
    // 4. Registrar transação
    return await tx.transactions.create({
      data: {
        fromWalletId: fromId,
        toWalletId: toId,
        amount,
        type: 'TRANSFER',
        status: 'COMPLETED'
      }
    });
  }, {
    isolationLevel: 'Serializable'  // Máximo isolamento
  });
}
```

---

## REGRAS DE PIX

### Validação de Webhook PIX

```typescript
// ✅ OBRIGATÓRIO: Validação completa de webhook PIX
export async function handlePixWebhook(req: Request, res: Response) {
  try {
    // 1. Validar certificado/TLS
    const clientCert = req.headers['x-client-cert'];
    if (!validateBankCertificate(clientCert)) {
      return res.status(401).json({ error: 'Invalid certificate' });
    }
    
    // 2. Validar assinatura
    const signature = req.headers['x-signature'];
    const payload = req.body;
    
    if (!verifyPixSignature(payload, signature)) {
      logger.security('Invalid PIX signature', { 
        endpoint: req.path,
        ip: req.ip 
      });
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 3. Validar schema
    const data = pixWebhookSchema.parse(payload);
    
    // 4. Verificar idempotência
    if (await isDuplicatePixTransaction(data.endToEndId)) {
      return res.status(200).json({ 
        status: 'already_processed',
        endToEndId: data.endToEndId 
      });
    }
    
    // 5. Processar
    const result = await processPixPayment(data);
    
    // 6. Retornar imediatamente (não bloquear)
    return res.status(200).json({
      status: 'processed',
      endToEndId: data.endToEndId,
      internalId: result.id
    });
    
  } catch (error) {
    logger.error('PIX webhook error', { error, body: req.body });
    // Retornar 200 mesmo em erro (para não reenviar)
    // Erro é tratado internamente
    return res.status(200).json({ 
      status: 'error_logged',
      reference: errorReference 
    });
  }
}
```

### Geração de QR Code

```typescript
// ✅ OBRIGATÓRIO: QR Code PIX válido e seguro
export async function generatePixQRCode(data: PixQRCodeData) {
  // 1. Validar dados
  const validated = pixQRSchema.parse(data);
  
  // 2. Gerar txId único e idempotente
  const txId = generatePixTxId(validated);
  
  // 3. Calcular CRC16 (obrigatório para PIX)
  const payload = buildPixPayload({
    txId,
    amount: validated.amount,
    description: validated.description,
    merchantName: validated.merchantName,
    merchantCity: validated.merchantCity,
    pixKey: validated.pixKey,
  });
  
  const crc16 = calculateCRC16(payload);
  const finalPayload = `${payload}${crc16}`;
  
  // 4. Salvar transação pendente
  const transaction = await db.transactions.create({
    data: {
      txId,
      type: 'PIX_IN',
      status: 'PENDING',
      amount: validated.amount,
      description: validated.description,
      qrCodePayload: finalPayload,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)  // 30 min
    }
  });
  
  // 5. Retornar dados completos
  return {
    transactionId: transaction.id,
    txId,
    qrCodePayload: finalPayload,
    qrCodeImage: await generateQRImage(finalPayload),
    expiresAt: transaction.expiresAt
  };
}
```

---

## REGRAS DE WALLET/SALDO

### Operações de Saldo

```typescript
// ✅ OBRIGATÓRIO: Todas as operações auditadas e atômicas
class WalletService {
  async debit(walletId: string, amount: Decimal, reason: string) {
    return await db.$transaction(async (tx) => {
      // 1. Lock pessimista no registro
      const wallet = await tx.wallets.findUnique({
        where: { id: walletId },
        select: { id: true, balance: true, version: true }
      });
      
      if (!wallet) throw new WalletNotFoundError();
      
      // 2. Verificar saldo suficiente
      if (wallet.balance.lessThan(amount)) {
        throw new InsufficientFundsError(wallet.balance, amount);
      }
      
      // 3. Atualizar com versionamento (optimistic locking)
      const updated = await tx.wallets.update({
        where: { 
          id: walletId,
          version: wallet.version  // Garantir não foi modificado
        },
        data: {
          balance: { decrement: amount },
          version: { increment: 1 }
        }
      });
      
      if (!updated) {
        throw new ConcurrentModificationError();
      }
      
      // 4. Registrar entrada no ledger
      await tx.ledgerEntries.create({
        data: {
          walletId,
          type: 'DEBIT',
          amount: amount.negated(),
          balanceAfter: updated.balance,
          reason,
          metadata: { previousVersion: wallet.version }
        }
      });
      
      return updated;
    });
  }
}
```

---

## REGRAS DE RECONCILIAÇÃO

### Conciliação Diária Obrigatória

```typescript
// ✅ OBRIGATÓRIO: Reconciliação automática
export async function dailyReconciliation(date: Date) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  // 1. Buscar transações do dia
  const transactions = await db.transactions.findMany({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay },
      status: { in: ['COMPLETED', 'PENDING'] }
    }
  });
  
  // 2. Buscar registros do gateway
  const gatewayRecords = await gateway.getDailyRecords(date);
  
  // 3. Reconciliar
  const discrepancies = [];
  
  for (const tx of transactions) {
    const gatewayTx = gatewayRecords.find(r => r.reference === tx.id);
    
    if (!gatewayTx) {
      discrepancies.push({
        type: 'MISSING_GATEWAY_RECORD',
        transaction: tx,
        severity: 'HIGH'
      });
      continue;
    }
    
    if (!tx.amount.equals(gatewayTx.amount)) {
      discrepancies.push({
        type: 'AMOUNT_MISMATCH',
        transaction: tx,
        gatewayRecord: gatewayTx,
        severity: 'CRITICAL'
      });
    }
    
    if (tx.status !== mapGatewayStatus(gatewayTx.status)) {
      discrepancies.push({
        type: 'STATUS_MISMATCH',
        transaction: tx,
        gatewayRecord: gatewayTx,
        severity: 'HIGH'
      });
    }
  }
  
  // 4. Reportar discrepâncias
  if (discrepancies.length > 0) {
    await alertReconciliationTeam(discrepancies);
    await createReconciliationTicket(discrepancies);
  }
  
  // 5. Registrar resultado
  await db.reconciliationReports.create({
    data: {
      date: startOfDay,
      totalTransactions: transactions.length,
      totalGatewayRecords: gatewayRecords.length,
      discrepancies: discrepancies.length,
      status: discrepancies.length === 0 ? 'BALANCED' : 'DISCREPANCY',
      details: discrepancies
    }
  });
}
```

---

## REGRAS DE AUDITORIA

### Audit Trail Completo

```typescript
// ✅ OBRIGATÓRIO: Toda operação auditada
interface AuditContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  correlationId: string;
}

async function auditLog(
  action: string,
  entity: string,
  entityId: string,
  before: unknown,
  after: unknown,
  context: AuditContext
) {
  await db.auditLogs.create({
    data: {
      timestamp: new Date(),
      action,
      entity,
      entityId,
      before: JSON.stringify(before),
      after: JSON.stringify(after),
      userId: context.userId,
      ip: context.ip,
      userAgent: context.userAgent,
      correlationId: context.correlationId
    }
  });
}

// Uso em operações
async function updateTransaction(
  id: string, 
  data: UpdateData, 
  context: AuditContext
) {
  const before = await db.transactions.findUnique({ where: { id } });
  
  const after = await db.transactions.update({ where: { id }, data });
  
  await auditLog(
    'TRANSACTION_UPDATE',
    'Transaction',
    id,
    before,
    after,
    context
  );
  
  return after;
}
```

---

## ANTI-PATTERNS PROIBIDOS (CRÍTICO)

```typescript
// ❌ PROIBIDO: Sem validação de assinatura
app.post('/webhook/payment', (req, res) => {
  processPayment(req.body);  // ❌ Aceitando qualquer input
});

// ❌ PROIBIDO: Sem idempotência
app.post('/api/charge', async (req, res) => {
  const result = await gateway.charge(req.body);  // ❌ Duplicados possíveis
  res.json(result);
});

// ❌ PROIBIDO: Sem atomicidade
async function transfer(from: string, to: string, amount: number) {
  await db.wallets.update({ where: { id: from }, data: { balance: { decrement: amount } } });
  // ❌ Se falhar aqui, dinheiro sumiu!
  await db.wallets.update({ where: { id: to }, data: { balance: { increment: amount } } });
}

// ❌ PROIBIDO: Logs sensíveis
logger.info('Payment processed', { 
  cardNumber: req.body.cardNumber,  // ❌ Nunca logar dados de cartão!
  cvv: req.body.cvv                  // ❌ Nunca logar CVV!
});

// ❌ PROIBIDO: Expor dados internos
return res.json({
  error: `Database connection failed: ${db.url}`  // ❌ Informação sensível
});

// ❌ PROIBIDO: Sem rate limiting em endpoints financeiros
app.post('/api/withdraw', async (req, res) => {
  // ❌ Vulnerável a ataques
});
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

### Antes de Merge
- [ ] Validação de assinatura implementada
- [ ] Idempotência garantida
- [ ] Transações atômicas
- [ ] Audit trail completo
- [ ] Rate limiting configurado
- [ ] Testes de integração com gateway
- [ ] Reconciliação testada
- [ ] Rollback plan documentado
- [ ] Security review passou

### Após Deploy
- [ ] Métricas de erro monitoradas
- [ ] Reconciliação inicial executada
- [ ] Alertas configurados
- [ ] Documentação atualizada
- [ ] Runbook revisado

---

## RESUMO

**Pagamentos = Máxima Cautela**

- 🔒 **Segurança**: Zero confiança, validação total
- 🔄 **Idempotência**: Operações seguras para repetir
- ⚛️ **Atomicidade**: Tudo ou nada
- 📝 **Auditoria**: Tudo registrado
- 📊 **Reconciliação**: Balanço sempre certo
- 🚨 **Monitoramento**: Alertas imediatos

**Lembrete**: Em pagamentos, não existe "só dessa vez". Toda regra é obrigatória sempre.
