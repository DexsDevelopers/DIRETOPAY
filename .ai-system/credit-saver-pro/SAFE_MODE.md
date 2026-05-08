# SAFE MODE — Credit Saver Pro Enterprise

## Modo de Segurança e Proteção Operacional

---

## Visão Geral

O SAFE MODE é um estado operacional que impõe restrições máximas de segurança, ativado automaticamente em situações de alto risco ou manualmente quando necessário.

---

## ATIVAÇÃO DO SAFE MODE

### Gatilhos Automáticos

```yaml
auto_activate_when:
  - database_migration_detected: true
  - payment_code_modified: true
  - authentication_changed: true
  - production_deploy_context: true
  - critical_file_touched: true
  - user_explicit_request: true
```

### Palavras-Chave Ativadoras

```
CRITICAL: "migration", "drop table", "deploy prod", "hotfix"
HIGH: "pix", "payment", "auth", "webhook", "crypto"
```

---

## RESTRIÇÕES DO SAFE MODE

### 1. EXECUÇÃO RESTRITA

**Operações Proibidas**:
```yaml
prohibited:
  - auto_execution: true  # Requer confirmação manual
  - bulk_edits: true      # Máximo 1 arquivo por vez
  - delete_operations: true # Proibido deletar
  - destructive_changes: true # Proibido alterações destrutivas
  - auto_rollback: false  # Requer aprovação para rollback
```

**Operações Permitidas**:
```yaml
permitted:
  - read_analysis: true
  - plan_generation: true
  - suggestion_mode: true
  - diff_preview: true
  - step_by_step: true  # Executar 1 passo por vez
```

### 2. ANÁLISE OBRIGATÓRIA

**Checklist SAFE MODE**:
```
□ Análise de risco COMPLETA realizada
□ Todos os arquivos afetados identificados
□ Dependências mapeadas
□ Breaking changes listados
□ Backward compatibility avaliada
□ Testes de impacto definidos
□ Rollback plan documentado
□ Stakeholders notificados (se aplicável)
□ Code review simulado
□ Security review (se aplicável)
```

### 3. CONFIRMAÇÃO MULTI-CAMADAS

```
Camada 1: Classificação
"Detectada operação CRITICAL. Ativar SAFE MODE? [Y/N]"

Camada 2: Análise de Risco  
"Riscos identificados:
 - Impacto em 5 arquivos
 - Possível breaking change
 - Afeta produção

Confirmar análise? [Y/N]"

Camada 3: Execução
"Plano de execução:
 1. Modificar schema.prisma
 2. Criar migration
 3. Atualizar service

Executar passo 1? [Y/N/Ver plano completo]"

Camada 4: Validação
"Passo 1 executado. Verificar resultado antes de continuar? [Y/N]"
```

---

## NÍVEIS DE SEGURANÇA

### Nível 1: WATCH (Observação)

**Ativado por**: HIGH_COST tasks
**Restrições**:
- Análise completa obrigatória
- Confirmação recomendada
- Logs detalhados

### Nível 2: CAUTION (Cautela)

**Ativado por**: CRITICAL_COST tasks
**Restrições**:
- Confirmação obrigatória
- Step-by-step execution
- Rollback plan required

### Nível 3: LOCKDOWN (Bloqueio Total)

**Ativado por**: Situações de emergência
**Restrições**:
- Somente leitura/análise
- Sugestões apenas, não execução
- Aprovação manual de cada ação

---

## PROTOCOLOS ESPECIAIS

### Protocolo: Database Migration

```yaml
name: DATABASE_MIGRATION_PROTOCOL
level: CRITICAL
triggers: ["migration", "schema change", "alter table"]

steps:
  1. ANALYZE:
     - Review current schema
     - Identify all affected tables
     - Check for data loss risks
     - Estimate migration time
     
  2. PLAN:
     - Draft migration SQL
     - Plan rollback migration
     - Identify downtime requirements
     - Schedule maintenance window (if needed)
     
  3. VALIDATE:
     - Test migration locally
     - Test rollback locally
     - Verify data integrity
     - Performance impact check
     
  4. EXECUTE (with approval):
     - Run migration in staging
     - Monitor metrics
     - Run in production (if staging OK)
     - Verify post-migration
     
  5. MONITOR:
     - Watch error rates
     - Monitor performance
     - Check data consistency
     - Keep rollback ready
```

### Protocolo: Payment System Change

```yaml
name: PAYMENT_SYSTEM_PROTOCOL
level: CRITICAL
triggers: ["pix", "payment", "webhook", "gateway", "transaction"]

steps:
  1. SECURITY_REVIEW:
     - Check signature validation
     - Verify idempotency
     - Review error handling
     - Validate amounts handling
     
  2. COMPLIANCE_CHECK:
     - PCI DSS considerations
     - Banking regulations
     - Audit trail requirements
     - Data retention policies
     
  3. TESTING_PLAN:
     - Unit tests (mandatory)
     - Integration tests (mandatory)
     - End-to-end tests (mandatory)
     - Load tests (recommended)
     - Penetration tests (for auth changes)
     
  4. ROLLOUT:
     - Feature flag if possible
     - Gradual rollout (canary)
     - Real-time monitoring
     - Automated rollback triggers
```

### Protocolo: Production Deploy

```yaml
name: PRODUCTION_DEPLOY_PROTOCOL
level: CRITICAL
triggers: ["deploy", "production", "release", "hotfix"]

steps:
  1. PRE_DEPLOY:
     - All tests passing
     - Code review approved
     - Security scan clean
     - Performance benchmarks OK
     - Database migrations tested
     
  2. DEPLOY:
     - Deploy to staging first
     - Smoke tests in staging
     - Deploy to production
     - Health checks
     
  3. POST_DEPLOY:
     - Monitor error rates
     - Check critical paths
     - Verify integrations
     - Watch user feedback
     
  4. ROLLBACK_READY:
     - Previous version ready
     - Database rollback tested
     - Rollback procedure documented
     - Team notified
```

---

## PROTEÇÕES AUTOMÁTICAS

### 1. File Protection

```yaml
protected_files:
  - pattern: "*.prisma"
    level: CRITICAL
    action: require_approval
    
  - pattern: "*payment*"
    level: CRITICAL
    action: require_approval
    
  - pattern: "*auth*"
    level: HIGH
    action: require_approval
    
  - pattern: "*config*"
    level: HIGH
    action: notify
    
  - pattern: ".env*"
    level: CRITICAL
    action: block  # Nunca modificar
```

### 2. Operation Protection

```yaml
protected_operations:
  - operation: "delete"
    level: HIGH
    action: "confirm_twice"
    
  - operation: "drop_table"
    level: CRITICAL
    action: "block_without_migration"
    
  - operation: "alter_column"
    level: CRITICAL
    action: "require_data_backup"
    
  - operation: "change_auth"
    level: CRITICAL
    action: "security_review"
```

### 3. Context Protection

```yaml
context_restrictions:
  production:
    - no_auto_execute: true
    - require_approval: true
    - notify_team: true
    
  staging:
    - suggest_before_execute: true
    - require_approval_for_critical: true
    
  development:
    - auto_execute_low: true
    - suggest_medium: true
    - require_approval_high: true
```

---

## CHECKLIST SAFE MODE

### Pré-Execução (Obrigatório)

```
□ Identificar todos os arquivos afetados
□ Mapear todas as dependências
□ Analisar impacto em produção
□ Verificar breaking changes
□ Confirmar backward compatibility
□ Planejar testes de regressão
□ Documentar rollback
□ Revisar segurança (se aplicável)
□ Simular code review
□ Estimar tempo de deploy/recovery
```

### Durante Execução

```
□ Executar um passo por vez
□ Validar cada passo antes do próximo
□ Manter logs detalhados
□ Monitorar métricas
□ Manter rollback pronto
□ Comunicar progresso
```

### Pós-Execução

```
□ Verificar integridade
□ Rodar testes
□ Monitorar produção
□ Documentar alterações
□ Atualizar runbooks
□ Post-mortem (se houver issues)
```

---

## COMANDOS SAFE MODE

### Ativação Manual

```
/SAFE_MODE ON
/SafeMode activate
```

### Desativação (requer confirmação)

```
/SAFE_MODE OFF
Confirmação: "Desativar SAFE MODE? Operações críticas terão menos proteção."
```

### Status

```
/SAFE_MODE STATUS
Resposta: 
"SAFE MODE: ATIVO (Nível 3: LOCKDOWN)
Última ativação: Detecção de migration
Restrições: Execução manual obrigatória"
```

---

## INTEGRAÇÃO COM WORKFLOWS

### Workflow SAFE Mode

```yaml
name: safe_mode_workflow
triggers: automatic + manual

execution:
  - detect_risk:
      action: classify_and_detect
      
  - activate_if_needed:
      condition: risk_level >= HIGH
      action: enable_safe_mode
      
  - analyze:
      action: full_risk_analysis
      
  - plan:
      action: create_safe_execution_plan
      
  - confirm:
      action: get_user_approval
      required: true
      
  - execute_step_by_step:
      action: execute_with_validation
      
  - monitor:
      action: continuous_monitoring
```

---

## RESUMO

**SAFE MODE é**:
- 🛡️ **Protetor**: Impede erros catastróficos
- 🔒 **Restritivo**: Limita operações perigosas
- ✅ **Validador**: Força análise completa
- 📋 **Protocolado**: Segue procedimentos definidos
- 🚦 **Gradual**: Diferentes níveis de proteção
- 🔄 **Recuperável**: Rollback sempre disponível

**Ative quando**:
- Database envolvido
- Sistema de pagamento
- Autenticação/Autorização
- Deploy produção
- Qualquer dúvida sobre segurança
