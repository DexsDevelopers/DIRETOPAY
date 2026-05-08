# HIGH COST WORKFLOW — Credit Saver Pro Enterprise

## Workflow para Tarefas de Alto Custo e Risco

---

## VISÃO GERAL

Workflow rigoroso para tarefas críticas: pagamentos, autenticação, webhooks, database.

**Características**:
- Análise profunda obrigatória
- Contexto amplo
- Confirmação recomendada
- Modelo premium

---

## QUANDO USAR

### Critérios de Aplicação (OBRIGATÓRIO)

```yaml
applicable_when:
  payment_systems:
    - "PIX"
    - "Cartão de crédito"
    - "Gateway de pagamento"
    - "Wallet/Saldo"
    - "Transações financeiras"
    
  authentication_authorization:
    - "Login/Registro"
    - "JWT/Sessões"
    - "Permissões/Roles"
    - "OAuth/SSO"
    - "2FA/MFA"
    
  webhooks_callbacks:
    - "Webhooks externos"
    - "Callbacks de pagamento"
    - "Notificações assíncronas"
    - "Eventos de sistema"
    
  database_operations:
    - "Alterações de schema"
    - "Migrations não-triviais"
    - "Queries complexas"
    - "Índices/Performance"
    
  security:
    - "Criptografia"
    - "Hashing de senhas"
    - "Validação de assinaturas"
    - "Sanitização de dados"
    
  production_systems:
    - "APIs de produção"
    - "Sistemas core"
    - "Integrações críticas"
```

---

## FLUXO DE EXECUÇÃO

```
┌─────────────────────────────────────────────┐
│ 1. RECEBER TAREFA                           │
│    └── Descrição do usuário                 │
│    └── Análise inicial de criticidade       │
├─────────────────────────────────────────────┤
│ 2. CLASSIFICAÇÃO                            │
│    └── HIGH_COST confirmado                 │
│    └── Gatilhos de segurança ativados       │
│    └── SAFE MODE: WATCH                     │
├─────────────────────────────────────────────┤
│ 3. ANÁLISE DE RISCO                         │
│    └── Identificar impactos                 │
│    └── Avaliar dependências                 │
│    └── Detectar breaking changes            │
│    └── Tempo: 10-15s                        │
├─────────────────────────────────────────────┤
│ 4. ANÁLISE DE CONTEXTO                      │
│    └── Carregar sistema completo            │
│    └── Mapear fluxos existentes             │
│    └── Identificar padrões                  │
│    └── Tempo: 15-20s                        │
├─────────────────────────────────────────────┤
│ 5. PLANEJAMENTO DETALHADO                   │
│    └── Estrutura técnica                    │
│    └── Sequência de implementação           │
│    └── Pontos de validação                  │
│    └── Mitigações de risco                  │
│    └── Tempo: 10-15s                        │
├─────────────────────────────────────────────┤
│ 6. CONFIRMAÇÃO                              │
│    └── Apresentar análise completa          │
│    └── Mostrar plano detalhado              │
│    └── Listar riscos                        │
│    └── Aguardar aprovação                   │
│    └── [RECOMENDADO]                        │
├─────────────────────────────────────────────┤
│ 7. EXECUÇÃO COM VALIDAÇÃO                   │
│    └── Implementar por etapas               │
│    └── Validar cada etapa                   │
│    └── Preservar segurança                  │
│    └── Tempo: 30-60s                        │
├─────────────────────────────────────────────┤
│ 8. VALIDAÇÃO EXTENSIVA                      │
│    └── Sintaxe e tipos                      │
│    └── Segurança                            │
│    └── Integridade do fluxo                 │
│    └── Compatibilidade                      │
│    └── Tempo: 10-15s                        │
├─────────────────────────────────────────────┤
│ 9. DOCUMENTAÇÃO                             │
│    └── Sumário completo                     │
│    └── Arquivos e alterações                │
│    └── Riscos mitigados                     │
│    └── Recomendações                        │
└─────────────────────────────────────────────┘

Total: 75-125 segundos
```

---

## ANÁLISE DE RISCO OBRIGATÓRIA

### Template de Análise

```markdown
## ANÁLISE DE RISCO — HIGH COST

### Classificação
Nível: HIGH
Sistema: [Pagamento/Auth/Database/Webhook]

### Impactos Identificados
- **Arquivos Afetados**: [N] arquivos
- **APIs Impactadas**: [listar]
- **Database**: [sim/não - detalhes]
- **Integrações Externas**: [listar]

### Riscos
- **Segurança**: [nível - justificativa]
- **Performance**: [nível - justificativa]
- **Disponibilidade**: [nível - justificativa]
- **Dados**: [nível - justificativa]

### Mitigações
- [ ] Testes automatizados
- [ ] Validação de entrada
- [ ] Error handling robusto
- [ ] Logging adequado
- [ ] Rate limiting (se aplicável)
- [ ] Circuit breaker (se aplicável)

### Breaking Changes
- [ ] Nenhum
- [ ] Compatibilidade mantida
- [ ] Deprecation necessário

### Recomendações
- Feature flag: [sim/não]
- Canary deploy: [recomendado/obrigatório]
- Observação pós-deploy: [24h/1h/imediato]
```

---

## PROTOCOLOS ESPECIAIS

### Protocolo: Pagamento

```yaml
payment_protocol:
  pre_implementation:
    - review_current_flow: "Entender fluxo existente"
    - check_security_requirements: "PCI, assinaturas"
    - validate_idempotency: "Crítico para pagamentos"
    - plan_rollback: "Como reverter?"
    
  implementation:
    - validate_all_inputs: "Zero confiança"
    - log_all_operations: "Audit trail completo"
    - handle_all_errors: "Graceful degradation"
    - implement_retry_logic: "Com idempotência"
    
  validation:
    - unit_tests: ">90% cobertura"
    - integration_tests: "Com gateway sandbox"
    - security_review: "Obrigatório"
    - financial_reconciliation: "Testar"
```

### Protocolo: Autenticação

```yaml
auth_protocol:
  security_checklist:
    - password_hashing: "bcrypt/Argon2"
    - jwt_validation: "Signature + claims"
    - session_management: "Secure, httpOnly"
    - rate_limiting: "Prevenir brute force"
    - mfa_support: "Se aplicável"
    
  implementation:
    - zero_trust: "Validar tudo"
    - least_privilege: "Mínimo necessário"
    - defense_in_depth: "Múltiplas camadas"
    - audit_logging: "Todas as ações"
```

### Protocolo: Webhook

```yaml
webhook_protocol:
  security:
    - signature_validation: "Obrigatório"
    - ip_whitelist: "Se possível"
    - replay_protection: "Prevenir replay"
    - payload_size_limit: "Proteger contra DoS"
    
  reliability:
    - idempotency: "Mesmo evento = mesmo resultado"
    - acknowledgment: "Retornar 200 apenas após processar"
    - retry_logic: "Exponential backoff"
    - dead_letter_queue: "Para falhas"
    - timeout_handling: "Não bloquear"
```

---

## EXEMPLOS DE USO

### Exemplo 1: Webhook PIX

```
USUÁRIO: "Implementa webhook de confirmação PIX"

CLASSIFICAÇÃO: HIGH_COST
SAFE MODE: ATIVADO

ANÁLISE DE RISCO:
- Sistema: Financeiro (PIX)
- Risco: ALTO (movimentação de dinheiro)
- Segurança: Validação de assinatura obrigatória
- Idempotência: Crítico (recebimento duplicado)

CONTEXTO CARREGADO:
- Fluxo de pagamento existente
- Estrutura de webhooks
- Utils de validação
- Schemas de dados

PLANO:
1. Criar handler de webhook
2. Implementar validação de assinatura
3. Adicionar idempotência
4. Integrar com fluxo de confirmação
5. Adicionar logging extensivo

VALIDAÇÃO:
- Segurança: assinatura validada
- Lógica: idempotência implementada
- Fluxo: integração correta
- Error handling: completo

CONFIRMAÇÃO: Recomendada devido a risco financeiro
```

### Exemplo 2: Migration de Transações

```
USUÁRIO: "Adiciona coluna 'processed_at' em transactions"

CLASSIFICAÇÃO: HIGH_COST
SAFE MODE: ATIVADO

ANÁLISE DE RISCO:
- Sistema: Database crítico
- Risco: ALTO (dados financeiros)
- Impacto: Potencial downtime
- Rollback: Deve ser possível

ANÁLISE:
- Schema atual: 10M+ registros
- Tipo de alteração: ADD COLUMN (baixo risco)
- Default value: NULL (seguro)
- Índice: Não necessário inicialmente

PLANO:
1. Criar migration (ADD COLUMN)
2. Testar em ambiente de staging
3. Verificar performance
4. Documentar rollback

VALIDAÇÃO:
- Migration: sintaxe correta
- Performance: sem degradação
- Rollback: script preparado

CONFIRMAÇÃO: Obrigatória - database em produção
```

---

## CHECKLIST OBRIGATÓRIO

### Pre-Execução
- [ ] Análise de risco completa
- [ ] Todos os arquivos relevantes identificados
- [ ] Fluxo existente mapeado
- [ ] Breaking changes identificados
- [ ] Mitigações planejadas
- [ ] Plano de execução detalhado
- [ ] Confirmação obtida (se recomendada)

### Durante Execução
- [ ] Seguir plano etapa por etapa
- [ ] Validar cada etapa
- [ ] Preservar segurança
- [ ] Manter idempotência (se aplicável)
- [ ] Adicionar logging adequado
- [ ] Implementar error handling

### Pós-Execução
- [ ] Todos os testes passando
- [ ] Segurança validada
- [ ] Integração verificada
- [ ] Documentação completa
- [ ] Recomendações de deploy
- [ ] Pontos de observação identificados

---

## RESUMO

**HIGH COST = Máxima Cautela**

- 🛡️ **Protegido**: Análise de risco obrigatória
- 🔍 **Profundo**: Contexto amplo
- ✅ **Validado**: Múltiplas verificações
- 📝 **Documentado**: Completo e detalhado
- 🚨 **Consciente**: Criticidade sempre presente

**Use quando**: Pagamentos, auth, webhooks, database.

**Nunca ignore**: Análise de risco, segurança, confirmação.
