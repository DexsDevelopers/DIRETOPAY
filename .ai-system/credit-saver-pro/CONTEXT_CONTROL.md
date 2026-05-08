# CONTEXT CONTROL — Credit Saver Pro Enterprise

## Sistema de Controle e Otimização de Contexto

---

## Visão Geral

O sistema de controle de contexto gerencia eficientemente a informação carregada, garantindo que apenas dados relevantes sejam processados, minimizando tokens desperdiçados e maximizando precisão.

---

## PRINCÍPIOS DE CONTROLE

### 1. RELEVANCE FILTERING
**Carregue apenas contexto diretamente relevante à tarefa atual.**

### 2. PROGRESSIVE LOADING
**Carregue contexto gradualmente, conforme necessidade demonstrada.**

### 3. SMART UNLOADING
**Descarte contexto antigo quando não mais necessário.**

### 4. FOCUSED SCOPE
**Mantenha o foco na tarefa, evitando "exploração" desnecessária.**

---

## NÍVEIS DE CONTEXTO

### Nível 0: Task Description Only
**Uso**: Classificação inicial
```
Input: Descrição da tarefa
Output: Estimativa de complexidade e classificação
Tokens: ~200-500
```

### Nível 1: Essential Metadata
**Uso**: Planejamento básico
```
Carrega:
├── Estrutura de diretórios (superficial)
├── Arquivo de configuração principal (package.json, etc)
├── 1-2 arquivos exemplares do tipo alvo
└── Interfaces/schemas relacionados

Tokens: ~1000-2000
```

### Nível 2: Working Context
**Uso**: Execução de tarefas LOW/MEDIUM
```
Carrega:
├── Arquivos diretamente afetados (1-3)
├── Dependências imediatas
├── Utils/types compartilhados
└── Exemplos similares

Tokens: ~2000-4000
```

### Nível 3: Extended Context
**Uso**: Análise HIGH/CRITICAL
```
Carrega:
├── Sistema completo afetado
├── Dependências de dependências
├── Testes relacionados
├── Documentação técnica
└── Histórico de alterações similares

Tokens: ~4000-8000
```

### Nível 4: Comprehensive Analysis
**Uso**: Operações CRITICAL
```
Carrega:
├── Todo o contexto disponível
├── Múltiplas fontes cruzadas
├── Análise histórica
└── Documentação extensiva

Tokens: 8000+
```

---

## ESTRATÉGIA DE CARREGAMENTO

### Algoritmo de Seleção de Arquivos

```python
def select_context_files(task_description, project_structure):
    # Fase 1: Classificação
    classification = classify_task(task_description)
    
    # Fase 2: Palavras-chave
    keywords = extract_keywords(task_description)
    
    # Fase 3: Busca direcionada
    candidates = search_files(keywords, project_structure)
    
    # Fase 4: Ranqueamento por relevância
    ranked = rank_by_relevance(candidates, task_description)
    
    # Fase 5: Seleção por nível
    if classification == LOW_COST:
        return ranked[:3]  # Top 3
    elif classification == MEDIUM_COST:
        return ranked[:6]  # Top 6
    elif classification == HIGH_COST:
        return ranked[:10]  # Top 10
    else:  # CRITICAL
        return ranked  # Todos relevantes + análise manual
```

### Critérios de Relevância

**Alta Relevância (prioridade 1)**:
- Arquivos mencionados explicitamente na tarefa
- Arquivos com nomes contendo keywords
- Arquivos importados por arquivos alvo
- Interfaces/schemas de dados envolvidos

**Média Relevância (prioridade 2)**:
- Arquivos no mesmo diretório/módulo
- Arquivos com funcionalidade similar
- Utils compartilhados
- Configurações de ambiente

**Baixa Relevância (prioridade 3)**:
- Arquivos relacionados indiretamente
- Testes de arquivos relacionados
- Documentação geral

**Não Relevante (excluir)**:
- node_modules, vendor, .git
- Arquivos de build
- Logs, caches
- Assets binários
- Código obsoleto/comentado

---

## TÉCNICAS DE FILTRAGEM

### 1. Semantic Filtering

```
Tarefa: "Ajustar validação de email no formulário de cadastro"

Keywords: email, validation, form, cadastro, register

Arquivos identificados:
✅ src/components/RegisterForm.tsx (contém "email", "validation")
✅ src/utils/validators.ts (contém "emailValidation")
✅ src/types/user.ts (contém interface com email)

Arquivos excluídos:
❌ src/components/Dashboard.tsx (não contém keywords)
❌ src/api/products.ts (módulo diferente)
❌ src/utils/date.ts (não relacionado)
```

### 2. Dependency Tracing

```javascript
// Arquivo alvo: RegisterForm.tsx
import { validateEmail } from '@/utils/validators';
import { UserType } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';

// Dependências a carregar:
// 1. @/utils/validators.ts (direta)
// 2. @/types/user.ts (direta)
// 3. @/hooks/useAuth.ts (direta)
// 4. Arquivos importados por validators.ts (indireta, nível 1)
// 5. Arquivos importados por useAuth.ts (indireta, nível 1)
```

### 3. Similarity Matching

```
Tarefa: "Criar componente de lista de transações"

Buscar exemplos similares:
- Lista de usuários (UserList.tsx) ← Mais similar
- Lista de produtos (ProductList.tsx) ← Similar
- Grid genérico (DataGrid.tsx) ← Similaridade média
- Detalhe de item (ItemDetail.tsx) ← Menos similar
```

---

## CONTROLE DE ESCOPO

### Scope Definition

```yaml
scope_current:
  task: "Implementar validação de PIX"
  primary_files: [pixValidation.ts, pixService.ts]
  related_files: [types/pix.ts, utils/validation.ts]
  excluded: [userService.ts, productModule/, tests/e2e/]
  
scope_boundaries:
  max_depth: 2  # Não seguir imports além de 2 níveis
  max_files: 8
  max_lines_per_file: 200
  follow_tests: false
```

### Escalation Triggers

**Expandir escopo quando**:
- Erro de "não encontrado" ao referenciar código
- Dependência crítica não carregada
- Inconsistência detectada entre arquivos carregados

**Manter escopo quando**:
- Tarefa bem definida e limitada
- Contexto atual é suficiente
- Risco de over-exploration é alto

---

## GESTÃO DE MEMÓRIA DE CONTEXTO

### Context Lifecycle

```
1. INIT
   └── Carregar: System prompts, regras, configurações
   
2. CLASSIFY  
   └── Carregar: Mínimo para classificação
   └── Descartar: Tudo exceto classificação
   
3. PLAN
   └── Carregar: Arquivos essenciais para planejamento
   └── Descartar: Detalhes não essenciais
   
4. EXECUTE
   └── Carregar: Arquivos de trabalho
   └── Manter: Durante edição
   
5. VALIDATE
   └── Carregar: Contexto para validação
   └── Descartar: Ao finalizar
```

### Context Pruning

**Quando descartar**:
```
Após classificação:
- Descartar: Arquivos de exemplo
- Manter: Classificação, keywords

Após planejamento:
- Descartar: Arquivos não no plano
- Manter: Plano de execução

Após execução:
- Descartar: Arquivos não modificados
- Manter: Resumo de alterações
```

---

## ANTI-PATTERNS DE CONTEXTO

### ❌ PROIBIDO

1. **Full Directory Load**: Carregar diretório inteiro sem filtro
2. **Greedy Import Following**: Seguir todos imports infinitamente
3. **Kitchen Sink**: Carregar "tudo que pode ser útil"
4. **Context Hoarding**: Nunca descartar contexto antigo
5. **Speculative Exploration**: Explorar arquivos "para entender melhor"
6. **Premature Deep Dive**: Analisar profundamente antes de necessidade

### ✅ OBRIGATÓRIO

1. **Focused Loading**: Carregar apenas o necessário
2. **Bounded Following**: Limitar profundidade de imports
3. **Need-to-Know**: Carregar quando necessidade é confirmada
4. **Active Pruning**: Descartar contexto não mais necessário
5. **Targeted Search**: Buscar específico, não explorar
6. **Justified Analysis**: Analisar apenas quando necessário

---

## MÉTRICAS DE EFICIÊNCIA

### KPIs de Contexto

| Métrica | Target | Como Medir |
|---------|--------|------------|
| Context Efficiency | >80% | Arquivos usados / Arquivos carregados |
| Token Density | Alto | Valor entregue / Tokens usados |
| Load Accuracy | >90% | Arquivos relevantes / Total carregado |
| Scope Creep | <10% | Arquivos além do limite definido |
| Pruning Efficiency | >70% | Contexto descartado / Contexto total |

### Relatório de Contexto

```
[ANÁLISE DE CONTEXTO]
Tarefa: Implementar webhook PIX
Classificação: HIGH_COST

Arquivos Carregados: 8
├── pixController.ts (usado) ✅
├── pixService.ts (usado) ✅
├── pixTypes.ts (usado) ✅
├── validation.ts (usado) ✅
├── webhookHandler.ts (usado) ✅
├── logger.ts (parcialmente usado) 🟡
├── config.ts (não usado) ❌
└── utils.ts (não usado) ❌

Eficiência: 62.5% (5/8 plenamente usados)
Tokens de contexto: 4,200
Economia vs full-load: ~65%
```

---

## CONFIGURAÇÃO DE CONTEXTO

```json
{
  "context_control": {
    "default_level": "adaptive",
    "limits": {
      "low": {
        "max_files": 3,
        "max_depth": 1,
        "include_tests": false,
        "include_docs": false
      },
      "medium": {
        "max_files": 6,
        "max_depth": 2,
        "include_tests": false,
        "include_docs": false
      },
      "high": {
        "max_files": 10,
        "max_depth": 3,
        "include_tests": true,
        "include_docs": true
      },
      "critical": {
        "max_files": 50,
        "max_depth": 5,
        "include_tests": true,
        "include_docs": true,
        "include_history": true
      }
    },
    "pruning": {
      "auto_prune": true,
      "prune_after": "task_completion",
      "keep_summary": true
    }
  }
}
```

---

## WORKFLOW DE CONTEXTO

### Exemplo Prático

```
USUÁRIO: "Adicionar validação de CPF no cadastro"

PASSO 1: Classificação (Contexto: 0)
├── Keywords: CPF, validation, cadastro, register
├── Análise: MEDIUM_COST (form validation, não financeiro)
└── Decisão: Nível 2 de contexto

PASSO 2: Carregamento Seletivo
├── Buscar: *register*, *validation*, *cpf*, *user*
├── Encontrado: RegisterForm.tsx, validators.ts, userTypes.ts
├── Dependências: useForm.ts (importado por RegisterForm)
└── Contexto carregado: 4 arquivos, 2,400 tokens

PASSO 3: Execução
├── Analisar: validators.ts contém validateEmail, mas não validateCPF
├── Decisão: Adicionar validateCPF em validators.ts
├── Usar: RegisterForm.tsx para integrar
└── Validar: userTypes.ts para garantir tipo correto

PASSO 4: Finalização
├── Contexto usado: 3 arquivos (validators, RegisterForm, userTypes)
├── Descartado: useForm.ts (não precisou modificar)
└── Eficiência: 75%
```

---

## RESUMO

**Regras Fundamentais**:

1. 🎯 **Focado**: Apenas contexto necessário
2. 📊 **Limitado**: Respeitar cotas por nível
3. 🔍 **Direcionado**: Buscar, não explorar
4. ✂️ **Eficiente**: Descartar quando não necessário
5. 📈 **Adaptativo**: Expandir só quando justificado
6. 🧹 **Limpo**: Manter contexto enxuto
7. 💡 **Inteligente**: Priorizar por relevância

**Resultado**: Contexto otimizado, tokens economizados, precisão maximizada.
