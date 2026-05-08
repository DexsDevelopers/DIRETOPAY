# TASK CLASSIFICATION — Credit Saver Pro Enterprise

## Sistema Automático de Classificação de Tarefas

---

## Visão Geral

O sistema de classificação determina automaticamente o nível de custo, risco e complexidade de qualquer tarefa, guiando a seleção de modelo, estratégia de execução e proteções necessárias.

---

## NÍVEIS DE CLASSIFICAÇÃO

### LOW_COST
**Definição**: Tarefas triviais, de baixo risco e alta previsibilidade

**Características**:
- Impacto limitado a 1-3 arquivos
- Sem dependências críticas
- Sem risco de regressão
- Padrões simples e repetitivos
- Validação visual suficiente

**Exemplos**:
- Ajustes de CSS (cores, espaçamentos, fontes)
- Textos e labels
- Componentes UI simples (botões, inputs)
- Configurações de tema
- Pequenos ajustes de layout
- Correções ortográficas
- Comentários e documentação leve

**Configuração**:
```yaml
model: economical
max_tokens: 4096
max_files: 3
max_context_lines: 200
confirmation_required: false
reasoning_depth: minimal
execution_strategy: direct
risk_level: none
```

---

### MEDIUM_COST
**Definição**: Tarefas moderadas, com alguma complexidade e risco controlado

**Características**:
- Impacto em 3-6 arquivos
- Dependências bem definidas
- Risco de regressão baixo a médio
- Padrões conhecidos e estabelecidos
- Requer teste funcional

**Exemplos**:
- CRUD operations completos
- APIs REST simples
- Integrações com serviços externos
- Componentes reutilizáveis
- Validações de formulário
- Queries de banco de dados simples
- Lógica de negócio não-crítica

**Configuração**:
```yaml
model: medium
max_tokens: 8192
max_files: 6
max_context_lines: 500
confirmation_required: optional
reasoning_depth: moderate
execution_strategy: planned
risk_level: low
```

---

### HIGH_COST
**Definição**: Tarefas complexas, críticas para segurança ou estabilidade

**Características**:
- Impacto em 6-10 arquivos ou mais
- Dependências críticas
- Risco de regressão significativo
- Requer análise profunda
- Afeta dados ou segurança

**Exemplos**:
- Sistemas de pagamento (PIX, cartão)
- Autenticação e autorização
- Webhooks e callbacks
- Banco de dados (schemas, migrations)
- APIs de produção
- Criptografia e hashing
- Sistema de sessões
- Filas e workers críticos
- Real-time features

**Configuração**:
```yaml
model: premium
max_tokens: 16384
max_files: 10
max_context_lines: 1000
confirmation_required: recommended
reasoning_depth: deep
execution_strategy: analyzed
risk_level: medium
analysis_required: true
impact_assessment: required
```

---

### CRITICAL_COST
**Definição**: Tarefas de máxima criticidade, onde erros causam danos severos

**Características**:
- Impacto potencial em sistema inteiro
- Dados financeiros ou sensíveis envolvidos
- Risco de perda financeira
- Risco legal ou regulatório
- Exige máxima cautela

**Exemplos**:
- Sistemas financeiros core (saldo, transações)
- Webhooks bancários e gateways
- Criptografia de dados sensíveis
- Deploy em produção
- Migrations destrutivas
- Alterações em autenticação master
- Sistema de autorização
- APIs públicas documentadas
- Breaking changes intencionais

**Configuração**:
```yaml
model: maximum_intelligence
max_tokens: 32768
max_files: unlimited
max_context_lines: unlimited
confirmation_required: MANDATORY
reasoning_depth: maximum
execution_strategy: validated
risk_level: high
critical_analysis: required
impact_assessment: mandatory
rollback_plan: required
review_simulation: required
documentation: required
```

---

## SISTEMA DE DETECÇÃO AUTOMÁTICA

### Palavras-Chave de Escalonamento

#### LOW_COST Keywords
```
css, style, color, font, spacing, margin, padding
text, label, button, input, component ui
layout, align, flex, grid, responsive
icon, image, visual, theme, config theme
documentation, comment, readme, example
```

#### MEDIUM_COST Keywords
```
crud, api, endpoint, route, controller
component, hook, util, helper, service
database query, find, filter, sort
form, validation, schema
integration, fetch, request, response
```

#### HIGH_COST Keywords
```
payment, pix, transaction, gateway, webhook
callback, notification, charge, refund
auth, jwt, token, session, login, password, encrypt, hash
database, migration, schema, model, prisma, sequelize
production, deploy, build, release, ci/cd
security, permission, role, access, authorize
crypto, encryption, decrypt, signature, certificate
queue, worker, job, background, async, realtime
websocket, socket, event, stream, live
```

#### CRITICAL_COST Keywords
```
financial, banking, money, balance, wallet
withdraw, deposit, transfer, payout
bank webhook, bank api, financial gateway
user balance, account balance, ledger, accounting
compliance, regulatory, legal, audit, audit trail
critical migration, destructive change, drop table
production deploy, live deploy, hotfix
master auth, root access, super admin
core system, critical path, single point of failure
```

### Algoritmo de Classificação

```python
def classify_task(description: str, context: dict) -> TaskLevel:
    score = 0
    
    # Keyword analysis
    score += count_critical_keywords(description) * 10
    score += count_high_keywords(description) * 5
    score += count_medium_keywords(description) * 2
    
    # Context analysis
    if involves_financial_data(context):
        score += 15
    if affects_production(context):
        score += 10
    if modifies_database_schema(context):
        score += 8
    if touches_authentication(context):
        score += 7
    
    # File impact analysis
    estimated_files = estimate_file_impact(description)
    if estimated_files > 10:
        score += 5
    if estimated_files > 20:
        score += 10
    
    # Classification
    if score >= 20:
        return CRITICAL_COST
    elif score >= 12:
        return HIGH_COST
    elif score >= 5:
        return MEDIUM_COST
    else:
        return LOW_COST
```

---

## MATRIZ DE DECISÃO

| Fator | LOW | MEDIUM | HIGH | CRITICAL |
|-------|-----|--------|------|----------|
| **Complexidade** | Baixa | Média | Alta | Máxima |
| **Risco** | Nenhum | Baixo | Médio | Alto |
| **Impacto Arquivos** | 1-3 | 3-6 | 6-10 | 10+ |
| **Tokens Estimados** | <4K | <8K | <16K | <32K |
| **Confirmação** | Não | Opcional | Recomendada | **Obrigatória** |
| **Modelo** | Econômico | Médio | Premium | Máximo |
| **Análise de Risco** | Não | Básica | Completa | Extensiva |
| **Testes** | Visual | Funcional | Regressão | Todos |
| **Rollback** | Não | Não | Planejado | Obrigatório |
| **Documentação** | Mínima | Básica | Completa | Extensiva |

---

## REGRAS DE OVERRIDE

### Situações que FORÇAM upgrade de classificação:

1. **Palavras CRITICAL detectadas** → Mínimo HIGH_COST
2. **Contexto de produção** → +1 nível
3. **Dados financeiros** → Mínimo HIGH_COST
4. **Auth/Security** → Mínimo HIGH_COST
5. **Database migrations** → Mínimo HIGH_COST
6. **Primeira alteração no projeto** → +1 nível
7. **Arquivos de configuração core** → +1 nível

### Situações que PERMITEM downgrade (com cautela):

1. **Testes automatizados robustos** → -1 nível (máximo)
2. **Ambiente de desenvolvimento isolado** → -1 nível (máximo)
3. **Rollback trivial identificado** → -1 nível (máximo)
4. **Tarefa puramente aditiva** → pode reduzir análise

---

## IMPLEMENTAÇÃO PRÁTICA

### Exemplo de Classificação Automática

```
Tarefa: "Ajustar cor do botão de submit no formulário de login"

Análise:
- Keywords: color, button, form, login
- Detectado "login" → possível HIGH_COST
- Contexto: CSS puro, arquivo de estilos
- Impacto: 1 arquivo
- Risco: Visual apenas

Classificação Final: LOW_COST
Justificativa: Apesar de "login", é apenas ajuste CSS
```

```
Tarefa: "Implementar webhook de confirmação PIX"

Análise:
- Keywords: webhook, pix, confirmation
- Detectado "pix" e "webhook" → HIGH_COST mínimo
- Contexto: Sistema de pagamentos
- Impacto: Múltiplos arquivos (routes, handlers, validation)
- Risco: Financeiro, dados sensíveis

Classificação Final: CRITICAL_COST
Justificativa: Webhook PIX = sistema financeiro core
```

---

## INTEGRAÇÃO COM SISTEMA

A classificação deve ser exibida ao usuário antes da execução:

```
[CLASSIFICAÇÃO AUTOMÁTICA]
Nível: HIGH_COST
Modelo: Premium (GPT-4/Claude Opus)
Tokens estimados: ~8K
Arquivos: 6-8
Confirmação: Recomendada

Riscos identificados:
- Sistema de pagamento
- Webhook externo
- Validação de assinatura

Deseja prosseguir? [S/N/Analisar mais]
```
