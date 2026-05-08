# CRITICAL WORKFLOW — Credit Saver Pro Enterprise

## Workflow para Operações de Máxima Criticidade

---

## VISÃO GERAL

Workflow de máxima segurança para operações críticas: sistema financeiro core, deploy em produção, migrations destrutivas, alterações de arquitetura.

**Características**:
- Análise extensiva obrigatória
- SAFE MODE: LOCKDOWN
- Confirmação OBRIGATÓRIA
- Modelo máximo
- Step-by-step execution

---

## QUANDO ATIVAR

### Gatilhos Obrigatórios

```yaml
critical_triggers:
  financial_system:
    - "Sistema de saldo/conta"
    - "Processamento de transações"
    - "Reconciliação financeira"
    - "Cálculo de fees/taxas"
    - "Saque/depósito"
    
  infrastructure:
    - "Deploy em produção"
    - "Alterações de arquitetura"
    - "Mudanças de infraestrutura"
    - "Migrations destrutivas"
    
  security_core:
    - "Alterações em criptografia"
    - "Mudanças em master auth"
    - "Rotação de chaves"
    - "Alterações em certificados"
    
  compliance:
    - "Alterações em audit trail"
    - "Mudanças em retenção de dados"
    - "Alterações regulatórias"
    
  single_point_of_failure:
    - "Componentes sem redundância"
    - "Alterações em sistemas únicos"
    - "Modificações irreversíveis"
```

---

## FLUXO DE EXECUÇÃO

```
┌─────────────────────────────────────────────┐
│ 1. DETECÇÃO CRÍTICA                         │
│    └── Palavras-chave de risco máximo       │
│    └── SAFE MODE: LOCKDOWN ativado          │
│    └── ⚠️ OPERAÇÃO CRÍTICA DETECTADA        │
├─────────────────────────────────────────────┤
│ 2. ANÁLISE EXTENSIVA                        │
│    └── Identificar sistema afetado          │
│    └── Mapear impacto total                 │
│    └── Avaliar riscos catastróficos         │
│    └── Análise de dependências profunda     │
│    └── Tempo: 20-30s                        │
├─────────────────────────────────────────────┤
│ 3. RELATÓRIO DE RISCO                       │
│    └── Documento formal de risco            │
│    └── Impacto financeiro estimado          │
│    └── Riscos de compliance                 │
│    └── Cenários de falha                    │
│    └── Tempo: 15-20s                        │
├─────────────────────────────────────────────┤
│ 4. PLANEJAMENTO COMPLETO                    │
│    └── Estratégia técnica detalhada         │
│    └── Plano de rollback testado            │
│    └── Pontos de não-retorno                │
│    └── Checkpoints de validação             │
│    └── Tempo: 20-30s                        │
├─────────────────────────────────────────────┤
│ 5. CONFIRMAÇÃO OBRIGATÓRIA                  │
│    └── Apresentar análise completa          │
│    └── Listar todos os riscos               │
│    └── Confirmar rollback pronto            │
│    └── ⛔ CONFIRMAÇÃO EXPLÍCITA NECESSÁRIA  │
│    └── Aguardar: "CONFIRMAR CRÍTICO"        │
├─────────────────────────────────────────────┤
│ 6. PREPARAÇÃO                               │
│    └── Verificar backups                    │
│    └── Validar rollback                     │
│    └── Confirmar ambiente                   │
│    └── Notificar stakeholders               │
├─────────────────────────────────────────────┤
│ 7. EXECUÇÃO STEP-BY-STEP                    │
│    └── Executar 1 passo                     │
│    └── Validar antes de próximo             │
│    └── Documentar cada ação                 │
│    └── Manter rollback atualizado           │
│    └── [REPETIR até concluir]               │
├─────────────────────────────────────────────┤
│ 8. VALIDAÇÃO COMPREENSIVA                   │
│    └── Testes automatizados                 │
│    └── Validação de segurança               │
│    └── Verificação de integridade           │
│    └── Teste de rollback                    │
│    └── Revisão de código                    │
├─────────────────────────────────────────────┤
│ 9. MONITORAMENTO                            │
│    └── Observação 24h (mínimo)              │
│    └── Métricas críticas                    │
│    └── Alertas configurados                 │
│    └── Plano de contingência ativo          │
├─────────────────────────────────────────────┤
│ 10. DOCUMENTAÇÃO                            │
│    └── Relatório completo                   │
│    └── Decisões documentadas                │
│    └── Lições aprendidas                    │
│    └── Atualização de runbooks              │
└─────────────────────────────────────────────┘

Total: Extensivo (qualidade > velocidade)
```

---

## PROTOCOLO DE CONFIRMAÇÃO

### Diálogo de Confirmação

```
═══════════════════════════════════════════════════
⚠️  OPERAÇÃO CRÍTICA DETECTADA  ⚠️
═══════════════════════════════════════════════════

Tarefa: [descrição]
Sistema: [sistema afetado]
Risco: [CRÍTICO/ALTO]

ANÁLISE DE IMPACTO:
├── Sistema Financeiro: SIM
├── Dados Sensíveis: SIM  
├── Disponibilidade Crítica: SIM
├── Compliance Impact: ALTO
└── Possível Perda Financeira: SIM

RISCOS IDENTIFICADOS:
1. [Risco 1 - impacto]
2. [Risco 2 - impacto]
3. [Risco 3 - impacto]

MITIGAÇÕES:
✅ Rollback testado e pronto
✅ Backup realizado
✅ Testes automatizados
✅ Equipe de plantão notificada
✅ Monitoramento reforçado

PARA PROSSEGUIR:
1. Leia todos os riscos acima
2. Confirme que rollback está pronto
3. Confirme que equipe está ciente
4. Digite: "CONFIRMAR CRÍTICO"

[Aguardando confirmação...]
```

---

## PROTOCOLOS ESPECÍFICOS

### Protocolo: Migration Destrutiva

```yaml
destructive_migration_protocol:
  pre_execution:
    - full_database_backup: "Obrigatório - reter 30 dias"
    - test_migration_dev: "Obrigatório"
    - test_rollback_dev: "Obrigatório"
    - estimate_downtime: "Documentar"
    - maintenance_window: "Agendar se >5min"
    - stakeholder_notification: "24h antes"
    
  execution:
    - verify_backup_integrity: "Checksum"
    - execute_in_transaction: "Se possível"
    - progress_monitoring: "Logs em tempo real"
    - integrity_checks: "Após cada etapa"
    
  post_execution:
    - data_validation: "Comparar amostras"
    - application_testing: "Smoke tests"
    - performance_baseline: "Verificar"
    - 24h_monitoring: "Obrigatório"
    - backup_retention: "7 dias mínimo"
```

### Protocolo: Deploy em Produção

```yaml
production_deploy_protocol:
  pre_deploy:
    - all_tests_passing: "Unit + Integration + E2E"
    - security_scan_clean: "Obrigatório"
    - performance_benchmarks: "Sem degradação"
    - staging_validation: "Obrigatório"
    - database_backup: "Se migrations"
    - rollback_plan_tested: "Obrigatório"
    - feature_flags_ready: "Se necessário"
    - monitoring_dashboards: "Configurados"
    - on_call_rotation: "Notificado"
    
  deploy:
    - canary_1_percent: "15min mínimo"
    - health_checks: "Automatizados"
    - error_rate_monitoring: "<0.1%"
    - expand_10_percent: "15min mínimo"
    - expand_50_percent: "30min mínimo"
    - full_rollout: "Se métricas OK"
    - automated_rollback: "Se thresholds violados"
    
  post_deploy:
    - 1h_active_monitoring: "Obrigatório"
    - 24h_observation: "Obrigatório"
    - business_metrics_check: "Normal"
    - error_rate_baseline: "<0.1%"
    - latency_baseline: "±10%"
    - incident_response_ready: "Ativo por 24h"
```

### Protocolo: Alteração Financeira Core

```yaml
financial_core_change_protocol:
  requirements:
    - cfo_approval: "Se impacto >$X"
    - compliance_review: "Obrigatório"
    - audit_trail: "Não pode ser desativado"
    - financial_reconciliation: "Testar antes"
    - rollback_without_data_loss: "Obrigatório"
    
  testing:
    - unit_tests: ">95% coverage"
    - integration_tests: "Todos os cenários"
    - end_to_end_tests: "Fluxo completo"
    - load_tests: "2x produção"
    - chaos_tests: "Falhas controladas"
    - reconciliation_tests: "Balanço deve fechar"
    
  deployment:
    - dark_mode: "1 semana mínimo"
    - shadow_processing: "Validar resultados"
    - gradual_cutover: "1% → 10% → 50% → 100%"
    - real_time_reconciliation: "Durante cutover"
    - 24h_manual_monitoring: "Por 7 dias"
```

---

## CHECKLIST OBRIGATÓRIO

### Pre-Execução
- [ ] Análise de risco EXTENSIVA documentada
- [ ] Todos os stakeholders notificados
- [ ] Backups verificados e acessíveis
- [ ] Rollback testado e <15min
- [ ] Planos de contingência atualizados
- [ ] Equipe de plantão escalada
- [ ] Janela de manutenção agendada (se necessário)
- [ ] Testes automatizados passando
- [ ] Confirmação explícita obtida

### Durante Execução
- [ ] Executar um passo por vez
- [ ] Validar cada passo antes de continuar
- [ ] Manter logs detalhados
- [ ] Atualizar rollback conforme necessário
- [ ] Comunicar progresso
- [ ] Abortar se qualquer anomalia

### Pós-Execução
- [ ] Todos os testes passando
- [ ] Validação de integridade completa
- [ ] Métricas normais
- [ ] Reconciliação OK (se financeiro)
- [ ] Documentação atualizada
- [ ] Post-mortem agendado (se houver issues)
- [ ] Runbooks atualizados

---

## RESUMO

**CRITICAL = Máxima Segurança**

- 🚨 **Não ignore**: Nunca pular etapas
- 🛡️ **Protegido**: Múltiplas camadas
- ✅ **Validado**: Extensivamente
- 📝 **Documentado**: Tudo registrado
- 🔄 **Reversível**: Sempre possível voltar
- 👥 **Transparente**: Todos cientes
- ⏱️ **Paciente**: Segurança > velocidade

**Lembrete**: Em operações críticas, o tempo gasto em análise é investimento, não custo.

**Nunca**:
- Ignore a confirmação obrigatória
- Execute sem rollback testado
- Deixe de notificar stakeholders
- Faça deploy sexta à tarde
- Ignore alertas durante execução

**Sempre**:
- Respeite cada etapa do protocolo
- Mantenha rollback atualizado
- Documente decisões
- Comunique progresso
- Priorize segurança sobre velocidade
