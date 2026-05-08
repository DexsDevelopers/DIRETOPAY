# EXECUTION POLICY — Credit Saver Pro Enterprise

## Política de Execução e Segurança Operacional

---

## PRINCÍPIOS FUNDAMENTAIS

### 1. SEGURANÇA SOBRE VELOCIDADE
**Nunca** comprometa segurança por velocidade de execução.

### 2. MÍNIMO IMPACTO
**Sempre** minimize o escopo e impacto das alterações.

### 3. PRESERVAÇÃO DE ESTABILIDADE
**Sempre** preserve código funcional e estável.

### 4. VALIDAÇÃO ANTES DE EXECUÇÃO
**Nunca** execute sem análise de risco apropriada.

---

## FLUXO DE EXECUÇÃO PADRONIZADO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLASSIFICAÇÃO                                            │
│    └─ Determinar nível de custo e risco                     │
├─────────────────────────────────────────────────────────────┤
│ 2. DETECÇÃO                                                 │
│    └─ Identificar arquitetura, stack, padrões               │
├─────────────────────────────────────────────────────────────┤
│ 3. ANÁLISE DE RISCO                                         │
│    └─ Avaliar impacto, dependências, regressões             │
├─────────────────────────────────────────────────────────────┤
│ 4. SELEÇÃO DE MODELO                                        │
│    └─ Escolher modelo apropriado ao risco                 │
├─────────────────────────────────────────────────────────────┤
│ 5. PLANEJAMENTO                                             │
│    └─ Criar plano mínimo de execução                        │
├─────────────────────────────────────────────────────────────┤
│ 6. CONFIRMAÇÃO (se necessário)                              │
│    └─ Obter aprovação para operações críticas               │
├─────────────────────────────────────────────────────────────┤
│ 7. EXECUÇÃO                                                 │
│    └─ Realizar edições focadas                              │
├─────────────────────────────────────────────────────────────┤
│ 8. VALIDAÇÃO                                                │
│    └─ Verificar integridade e impacto                       │
└─────────────────────────────────────────────────────────────┘
```

---

## POLÍTICAS POR NÍVEL

### LOW_COST Execution Policy

**Permissões**:
- ✅ Execução direta sem confirmação
- ✅ Até 3 arquivos simultâneos
- ✅ Edições simples e diretas
- ✅ Auto-validação visual

**Restrições**:
- ❌ Não modificar arquivos de configuração core
- ❌ Não alterar dependências
- ❌ Não modificar mais de 20 linhas por arquivo
- ❌ Não tocar em arquivos marcados como protegidos

**Checklist**:
```
□ Tarefa realmente trivial?
□ Apenas arquivos de UI/estilo?
□ Sem impacto em lógica de negócio?
□ Sem dependências críticas?
```

---

### MEDIUM_COST Execution Policy

**Permissões**:
- ✅ Execução com planejamento
- ✅ Até 6 arquivos
- ✅ Modificações em lógica de negócio
- ✅ Criação de novos componentes/ funções

**Restrições**:
- ❌ Não modificar autenticação
- ❌ Não modificar pagamentos
- ❌ Não alterar APIs públicas existentes
- ❌ Não modificar database schema
- ❌ Não alterar mais de 50 linhas por arquivo

**Checklist**:
```
□ Plano de execução documentado?
□ Arquivos identificados e analisados?
□ Dependências mapeadas?
□ Testes considerados?
□ Breaking changes analisados?
```

---

### HIGH_COST Execution Policy

**Permissões**:
- ✅ Execução com análise profunda
- ✅ Até 10 arquivos
- ✅ Modificações em sistemas críticos
- ✅ Alterações em schemas (com cautela)

**Restrições**:
- ❌ NUNCA sem análise de impacto
- ❌ NUNCA sem verificar compatibilidade
- ❌ NUNCA destruir código sem fallback
- ❌ NUNCA alterar sem confirmar comportamento

**Requisitos Obrigatórios**:
```
□ Análise de risco documentada
□ Impacto backward compatibility avaliado
□ Fallbacks identificados
□ Testes de regressão considerados
□ Breaking changes documentados (se houver)
□ Code review simulado
□ Confirmação recomendada
```

---

### CRITICAL_COST Execution Policy

**Permissões**:
- ✅ Execução com máxima cautela
- ✅ Arquivos ilimitados (análise necessária)
- ✅ Modificações em sistemas financeiros/core
- ✅ Breaking changes (com documentação)

**Restrições**:
- ❌ **NUNCA** sem confirmação explícita
- ❌ **NUNCA** sem rollback plan
- ❌ **NUNCA** sem análise de segurança
- ❌ **NUNCA** em produção sem validação

**Requisitos Obrigatórios**:
```
□ Análise de risco EXTENSIVA
□ Impacto completo documentado
□ Rollback plan detalhado
□ Testes de regressão OBRIGATÓRIOS
□ Breaking changes documentados
□ Code review REAL (outro par de olhos)
□ Segurança validada
□ Performance impact avaliado
□ Confirmação EXPLÍCITA do usuário
□ Aprovação de stakeholders (se aplicável)
```

---

## POLÍTICA DE EDIÇÃO

### Regras Universais de Edição

1. **Linha a Linha**: Edite apenas o necessário, linha por linha
2. **Preserve Formatação**: Mantenha estilo existente
3. **Não Reordene**: Não mude ordem de funções/imports sem motivo
4. **Comentários Mínimos**: Não adicione comentários explicativos desnecessários
5. **Imports**: Não altere imports não relacionados à tarefa

### Limites de Edição

| Nível | Máx. Linhas/Arquivo | Máx. Arquivos | Máx. Total |
|-------|---------------------|---------------|------------|
| LOW | 20 | 3 | 60 |
| MEDIUM | 50 | 6 | 300 |
| HIGH | 100 | 10 | 1000 |
| CRITICAL | Ilimitado | Ilimitado | Análise |

---

## POLÍTICA DE ARQUIVOS PROTEGIDOS

### Lista de Arquivos CRÍTICOS (Nunca tocar sem CRITICAL_COST)

```
# Configurações Core
.env
.env.production
.env.staging
docker-compose.yml
docker-compose.prod.yml
kubernetes/
.github/workflows/deploy.yml

# Segurança
src/config/auth.ts
src/config/security.ts
src/middleware/auth.ts
src/middleware/permission.ts
src/utils/crypto.ts
src/utils/hash.ts

# Pagamentos
src/modules/payment/
src/modules/pix/
src/modules/transaction/
src/modules/wallet/
src/services/payment/
src/webhooks/

# Database
prisma/schema.prisma
database/migrations/
*.migration.sql

# Deploy
scripts/deploy.sh
scripts/deploy-prod.sh
Dockerfile
Dockerfile.prod
```

---

## POLÍTICA DE GIT

### Commits por Nível

**LOW_COST**:
- Commit message: `[low] Descrição breve`
- Pode ser amend/force push em branch pessoal
- Não requer PR review

**MEDIUM_COST**:
- Commit message: `[medium] Descrição`
- Branch feature/
- PR opcional
- Não force push em branches compartilhadas

**HIGH_COST**:
- Commit message: `[high] Descrição detalhada`
- Branch feature/ ou fix/
- PR obrigatório
- Code review necessário
- Não rebase após push compartilhado

**CRITICAL_COST**:
- Commit message: `[critical] Descrição completa`
- Branch feature/critical- ou hotfix/
- PR obrigatório
- Code review obrigatório (2 aprovadores)
- Testes automatizados passando
- QA sign-off
- Nunca force push

---

## POLÍTICA DE ROLLBACK

### Níveis de Rollback

**LOW**: Revert de commit simples
```bash
git revert HEAD
```

**MEDIUM**: Revert de feature branch
```bash
git revert -m 1 <merge-commit>
```

**HIGH**: Rollback planejado
```bash
# Deploy de versão anterior
./scripts/rollback.sh <previous-version>
# Notificar stakeholders
# Verificar integridade
```

**CRITICAL**: Rollback de emergência
```bash
# Parar deploy
# Reverter imediatamente
# Notificar imediatamente
# Post-mortem obrigatório
```

---

## POLÍTICA DE VALIDAÇÃO

### Checklist de Validação Pós-Execução

**Todos os níveis**:
- [ ] Código compila/executa sem erros
- [ ] Não há erros de sintaxe óbvios
- [ ] Imports não quebrados
- [ ] Sem console.log/debug esquecidos

**MEDIUM+**:
- [ ] Funcionalidade testada manualmente
- [ ] Sem regressões óbvias
- [ ] Documentação atualizada (se necessário)

**HIGH+**:
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Análise de segurança concluída
- [ ] Performance não degradada

**CRITICAL**:
- [ ] Todos os testes passando
- [ ] Code review aprovado
- [ ] QA validou
- [ ] Segurança aprovou
- [ ] Documentação completa
- [ ] Rollback testado

---

## ESCALAÇÃO DE INCIDENTES

### Se algo der errado:

**Nível 1 - Problema Local**:
- Reverter alteração
- Corrigir e reexecutar
- Documentar aprendizado

**Nível 2 - Impacto Moderado**:
- Parar alterações relacionadas
- Reverter para estado estável
- Análise de causa raiz
- Correção com mais validação

**Nível 3 - Impacto Crítico**:
- **PARAR TUDO**
- Reverter imediatamente
- Notificar stakeholders
- Incident response
- Post-mortem detalhado

---

## MENSAGENS DE POLÍTICA

Mensagens padrão para diferentes situações:

**Confirmação Recomendada**:
```
Esta é uma operação HIGH_COST. Recomendo confirmação:
- Impacto: 8 arquivos
- Risco: Médio
- Sistema: Pagamento
Prosseguir? [Y/N/Analisar]
```

**Confirmação Obrigatória**:
```
⚠️ OPERAÇÃO CRÍTICA DETECTADA ⚠️

Esta alteração afeta: Sistema Financeiro Core
Risco: ALTO
Rollback: Requer plano detalhado

REQUERIDO:
- [ ] Entendo o impacto
- [ ] Rollback está preparado
- [ ] Testes estão prontos
- [ ] Stakeholders foram notificados

Digite "CONFIRMAR CRÍTICO" para prosseguir:
```

---

## IMPLEMENTAÇÃO

Esta política deve ser:
1. Carregada como contexto inicial
2. Aplicada automaticamente a cada operação
3. Reforçada em casos de violação
4. Auditada para melhoria contínua
