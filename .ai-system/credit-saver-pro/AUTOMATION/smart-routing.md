# SMART ROUTING

## Roteamento Inteligente Automático — Credit Saver Pro Enterprise

---

## VISÃO GERAL

O Smart Routing é o sistema central que decide automaticamente como processar cada tarefa, selecionando:
- Modelo ideal
- Contexto necessário
- Estratégia de execução
- Proteções aplicáveis

---

## ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART ROUTING ENGINE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │   INPUT      │ → │  CLASSIFIER  │ → │   ROUTER     │     │
│  │  PROCESSOR   │   │              │   │              │     │
│  └──────────────┘   └──────────────┘   └──────────────┘     │
│        │                  │                  │             │
│        ↓                  ↓                  ↓             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │  KEYWORD     │   │  CONTEXT     │   │  MODEL       │     │
│  │  ANALYZER    │   │  SELECTOR    │   │  SELECTOR    │     │
│  └──────────────┘   └──────────────┘   └──────────────┘     │
│                                                             │
│                         ↓                                   │
│                  ┌──────────────┐                          │
│                  │   EXECUTION  │                          │
│                  │   PLANNER    │                          │
│                  └──────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## COMPONENTES

### 1. Input Processor

**Função**: Normalizar e preparar entrada

```typescript
interface TaskInput {
  description: string;
  context?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  deadline?: Date;
}

function processInput(input: TaskInput): NormalizedTask {
  return {
    description: sanitize(input.description),
    keywords: extractKeywords(input.description),
    context: input.context || '',
    urgency: calculateUrgency(input),
    complexity: estimateComplexity(input)
  };
}
```

### 2. Keyword Analyzer

**Função**: Extrair e classificar palavras-chave

```typescript
interface KeywordAnalysis {
  primary: string[];      // Keywords principais
  secondary: string[];    // Keywords secundárias
  riskIndicators: string[]; // Indicadores de risco
  costIndicators: string[]; // Indicadores de custo
}

const keywordDatabase = {
  critical: [
    'financial', 'banking', 'pix', 'wallet', 'balance',
    'deploy production', 'migration', 'drop table',
    'root', 'admin', 'master key'
  ],
  high: [
    'payment', 'webhook', 'auth', 'jwt', 'encrypt',
    'database', 'migration', 'schema', 'production'
  ],
  medium: [
    'api', 'endpoint', 'crud', 'component', 'form',
    'refactor', 'validation'
  ],
  low: [
    'css', 'color', 'text', 'label', 'button',
    'icon', 'spacing', 'documentation'
  ]
};
```

### 3. Task Classifier

**Função**: Determinar nível de custo

```typescript
interface ClassificationResult {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  reasoning: string[];
  overrides: OverrideRule[];
}

function classifyTask(
  keywords: KeywordAnalysis,
  context: TaskContext
): ClassificationResult {
  let score = 0;
  
  // Keyword scoring
  score += keywords.critical.length * 10;
  score += keywords.high.length * 5;
  score += keywords.medium.length * 2;
  
  // Context multipliers
  if (context.isProduction) score *= 1.5;
  if (context.hasTests) score *= 0.9;
  if (context.isNewCodebase) score *= 1.2;
  
  return {
    level: scoreToLevel(score),
    confidence: calculateConfidence(keywords, context),
    reasoning: generateReasoning(keywords),
    overrides: checkOverrides(keywords, context)
  };
}
```

### 4. Context Selector

**Função**: Selecionar contexto mínimo necessário

```typescript
interface ContextSelection {
  files: string[];
  strategy: 'minimal' | 'focused' | 'comprehensive' | 'exhaustive';
  depth: number;
  compression: 'high' | 'medium' | 'low' | 'none';
}

function selectContext(
  classification: ClassificationResult,
  task: NormalizedTask
): ContextSelection {
  const limits = {
    LOW: { maxFiles: 3, depth: 1 },
    MEDIUM: { maxFiles: 6, depth: 2 },
    HIGH: { maxFiles: 10, depth: 3 },
    CRITICAL: { maxFiles: 50, depth: 5 }
  }[classification.level];
  
  const files = findRelevantFiles(task, limits);
  
  return {
    files: files.slice(0, limits.maxFiles),
    strategy: levelToStrategy(classification.level),
    depth: limits.depth,
    compression: levelToCompression(classification.level)
  };
}
```

### 5. Model Selector

**Função**: Escolher modelo ideal

```typescript
interface ModelSelection {
  model: string;
  provider: 'openai' | 'anthropic' | 'google' | 'github';
  maxTokens: number;
  temperature: number;
  reasoning: string;
}

function selectModel(
  classification: ClassificationResult,
  budget: TokenBudget
): ModelSelection {
  const modelMap = {
    LOW: { model: 'gpt-4o-mini', provider: 'openai', maxTokens: 4096 },
    MEDIUM: { model: 'gpt-4o', provider: 'openai', maxTokens: 8192 },
    HIGH: { model: 'claude-3-opus', provider: 'anthropic', maxTokens: 16384 },
    CRITICAL: { model: 'claude-3-opus', provider: 'anthropic', maxTokens: 32768 }
  };
  
  const selection = modelMap[classification.level];
  
  // Budget check
  if (budget.available < selection.maxTokens) {
    return downgradeModel(selection, budget);
  }
  
  return selection;
}
```

### 6. Execution Planner

**Função**: Criar plano de execução

```typescript
interface ExecutionPlan {
  steps: ExecutionStep[];
  validations: ValidationPoint[];
  rollbackPoints: RollbackPoint[];
  confirmationRequired: boolean;
  estimatedDuration: number;
}

interface ExecutionStep {
  order: number;
  action: string;
  target: string;
  validation: string;
  rollbackAction?: string;
}

function createExecutionPlan(
  task: NormalizedTask,
  classification: ClassificationResult,
  context: ContextSelection
): ExecutionPlan {
  const basePlan = generateBasePlan(task);
  
  return {
    steps: addValidationSteps(basePlan, classification),
    validations: defineValidations(classification),
    rollbackPoints: defineRollbackPoints(classification),
    confirmationRequired: classification.level === 'CRITICAL',
    estimatedDuration: estimateDuration(task, classification)
  };
}
```

---

## ALGORITMO DE ROTEAMENTO

```python
def route_task(task_input: TaskInput) -> RoutingDecision:
    # 1. Processar input
    task = process_input(task_input)
    
    # 2. Analisar keywords
    keywords = analyze_keywords(task.description)
    
    # 3. Classificar tarefa
    classification = classify_task(keywords, task.context)
    
    # 4. Aplicar overrides
    if should_upgrade(classification, keywords):
        classification = upgrade_classification(classification)
    
    # 5. Selecionar contexto
    context = select_context(classification, task)
    
    # 6. Selecionar modelo
    model = select_model(classification, task.budget)
    
    # 7. Criar plano
    plan = create_execution_plan(task, classification, context)
    
    # 8. Retornar decisão
    return RoutingDecision(
        classification=classification,
        context=context,
        model=model,
        plan=plan,
        safe_mode=classification.level in ['HIGH', 'CRITICAL']
    )
```

---

## REGRAS DE OVERRIDE

### Upgrade Automático

```yaml
force_upgrade_when:
  - contains: ['financial', 'bank', 'pix', 'wallet']
    to: CRITICAL
    
  - contains: ['deploy', 'production', 'migration']
    to: HIGH
    context: production_environment
    
  - contains: ['auth', 'jwt', 'password', 'encrypt']
    to: HIGH
    
  - contains: ['drop table', 'delete production', 'remove auth']
    to: CRITICAL
    alert: security_team
```

### Downgrade Controlado

```yaml
allow_downgrade_when:
  - condition: comprehensive_tests_present
    max_level: MEDIUM
    from: [CRITICAL]
    requires: test_coverage > 90%
    
  - condition: isolated_development_environment
    max_level: MEDIUM
    from: [HIGH, CRITICAL]
    requires: no_production_data
    
  - condition: trivial_change_to_critical_file
    max_level: HIGH
    from: [CRITICAL]
    requires: 
      - change_is_additive_only
      - no_logic_modification
      - rollback_is_trivial
```

---

## DECISÕES DE ROTEAMENTO

### Cenário 1: CSS Simples

```yaml
input: "Muda cor do botão para azul"
keywords: ['color', 'button']
classification:
  level: LOW
  confidence: 99%
  reasoning: ["Visual only", "No logic", "Single file"]
context:
  strategy: minimal
  maxFiles: 3
  compression: high
model:
  model: gpt-4o-mini
  maxTokens: 4096
plan:
  confirmation: false
  steps: 1
estimated:
  tokens: 500
  time: 3s
```

### Cenário 2: API CRUD

```yaml
input: "Cria endpoint GET /api/users"
keywords: ['api', 'endpoint', 'users', 'get']
classification:
  level: MEDIUM
  confidence: 95%
  reasoning: ["API endpoint", "CRUD pattern", "Medium complexity"]
context:
  strategy: focused
  maxFiles: 6
  compression: medium
model:
  model: gpt-4o
  maxTokens: 8192
plan:
  confirmation: optional
  steps: 3
estimated:
  tokens: 3000
  time: 30s
```

### Cenário 3: Webhook PIX

```yaml
input: "Implementa webhook de confirmação PIX"
keywords: ['webhook', 'pix', 'confirmation']
classification:
  level: HIGH
  confidence: 98%
  reasoning: ["Payment system", "Financial data", "Webhook external"]
  overrides: ["Financial keyword detected → minimum HIGH"]
context:
  strategy: comprehensive
  maxFiles: 10
  compression: low
model:
  model: claude-3-opus
  maxTokens: 16384
plan:
  confirmation: recommended
  steps: 5
  validations: ['signature', 'idempotency', 'security']
estimated:
  tokens: 8000
  time: 60s
```

### Cenário 4: Migration Crítica

```yaml
input: "Altera schema de transações em produção"
keywords: ['schema', 'transactions', 'production', 'alter']
classification:
  level: CRITICAL
  confidence: 100%
  reasoning: [
    "Database schema change",
    "Production environment",
    "Financial data affected"
  ]
context:
  strategy: exhaustive
  maxFiles: unlimited
  compression: none
model:
  model: claude-3-opus
  maxTokens: 32768
plan:
  confirmation: MANDATORY
  steps: 7
  validations: ['backup', 'rollback', 'test', 'staging']
  safeMode: LOCKDOWN
estimated:
  tokens: 15000
  time: 120s
```

---

## MÉTRICAS DE ROTEAMENTO

### KPIs

| Métrica | Target | Descrição |
|---------|--------|-----------|
| Classification Accuracy | >95% | Tarefas classificadas corretamente |
| Token Efficiency | >80% | Tokens usados / Tokens disponíveis |
| Context Relevance | >90% | Arquivos carregados são relevantes |
| User Satisfaction | >90% | Decisões aceitas pelo usuário |
| Safety Score | 100% | Zero incidentes por erro de roteamento |

### Monitoramento

```yaml
routing_metrics:
  per_task:
    - classification_time
    - confidence_score
    - tokens_used
    - context_files_loaded
    - context_files_relevant
    
  aggregated:
    - accuracy_by_level
    - cost_savings_vs_baseline
    - override_frequency
    - downgrade_success_rate
```

---

## RESUMO

**Smart Routing = Decisões Ótimas Automaticamente**

- 🎯 **Preciso**: Classificação correta
- ⚡ **Eficiente**: Mínimo de recursos
- 🛡️ **Seguro**: Proteções automáticas
- 📊 **Medido**: KPIs e melhoria contínua

**O sistema decide automaticamente**:
1. Quão complexa é a tarefa?
2. Quanto contexto carregar?
3. Qual modelo usar?
4. Como executar?

**Você foca no que importa: o resultado.**
