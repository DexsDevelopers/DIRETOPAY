# OPERATION MODES

## Modos de Operação — Credit Saver Pro Enterprise

---

## VISÃO GERAL

O sistema suporta múltiplos modos de operação, cada um otimizado para diferentes cenários e necessidades.

---

## MODOS DISPONÍVEIS

### 1. DEFAULT MODE

**Descrição**: Modo padrão com classificação automática

```yaml
activation: automatic
classification: auto (LOW/MEDIUM/HIGH/CRITICAL)
model_selection: auto
context_loading: adaptive
safe_mode: conditional
```

**Comportamento**:
- Classifica tarefa automaticamente
- Seleciona modelo adequado
- Carrega contexto proporcional
- Ativa SAFE MODE quando necessário

**Uso**: Operação normal, maioria das tarefas

---

### 2. ECONOMICAL MODE

**Descrição**: Máxima economia de tokens

```yaml
activation: /MODE ECONOMICAL
classification: forced LOW (com override para critical keywords)
model: economical
token_budget: 4K max
context: minimal
analysis: none
```

**Comportamento**:
- Força modelo econômico
- Carrega mínimo contexto
- Execução direta
- Override automático se keywords críticas detectadas

**Uso**: Tarefas trivialmente simples, muitas operações pequenas

**Override Automático**:
```
Se detectar: pix, payment, auth, deploy, migration
→ Upgrade para classificação apropriada
```

---

### 3. SAFE MODE

**Descrição**: Máxima proteção e segurança

```yaml
activation: /SAFE_MODE ON ou auto (CRITICAL detection)
classification: auto (com upgrade automático)
model: premium/maximum
confirmation: mandatory for all
context: comprehensive
safe_mode: LOCKDOWN
```

**Comportamento**:
- Análise extensiva obrigatória
- Confirmação para toda operação
- Step-by-step execution
- Rollback plan required

**Uso**: Operações em produção, código crítico

---

### 4. DEEP THINKING MODE

**Descrição**: Análise profunda antes de ação

```yaml
activation: /MODE DEEP
classification: auto
model: premium
token_allocation: 50% analysis / 50% execution
context: comprehensive
planning: detailed
```

**Comportamento**:
- Análise extensiva antes de executar
- Múltiplas perspectivas consideradas
- Plano detalhado
- Recomendações incluídas

**Uso**: Problemas complexos, arquitetura, refactoring

---

### 5. ARCHITECTURE MODE

**Descrição**: Foco em arquitetura e padrões

```yaml
activation: /MODE ARCHITECTURE
classification: auto (MEDIUM+)
model: premium
focus: patterns, structure, conventions
detection: comprehensive
```

**Comportamento**:
- Análise de arquitetura priorizada
- Detecção profunda de padrões
- Recomendações arquiteturais
- Conformidade com padrões existentes

**Uso**: Refactoring, novos módulos, mudanças estruturais

---

### 6. DEBUG MODE

**Descrição**: Foco em debugging e diagnóstico

```yaml
activation: /MODE DEBUG
classification: auto
model: medium (detailed reasoning)
focus: root cause analysis
logging: verbose
```

**Comportamento**:
- Análise de causa raiz
- Explicações detalhadas
- Sugestões de debugging
- Logs e traces

**Uso**: Investigação de bugs, problemas misteriosos

---

### 7. EMERGENCY MODE

**Descrição**: Resposta rápida para situações críticas

```yaml
activation: /MODE EMERGENCY ou auto (error detection)
classification: HIGH/CRITICAL
model: premium
speed: optimized
focus: resolution
safety: maintained
```

**Comportamento**:
- Resposta rápida
- Análise concisa mas completa
- Foco em resolver problema
- Segurança mantida (não sacrificada)

**Uso**: Incidentes, hotfixes, situações urgentes

---

### 8. LEARNING MODE

**Descrição**: Foco em explicação e transferência de conhecimento

```yaml
activation: /MODE LEARNING
classification: auto
model: medium (explanatory)
focus: teaching, explanation
detail: high
```

**Comportamento**:
- Explicações detalhadas
- "Porquês" incluídos
- Alternativas apresentadas
- Conceitos ensinados

**Uso**: Code review educativo, onboarding, discussões técnicas

---

## TABELA COMPARATIVA

| Modo | Tokens | Velocidade | Análise | Confirmação | Use Case |
|------|--------|------------|---------|-------------|----------|
| DEFAULT | Adaptativo | Adaptativo | Balanceada | Condicional | Operação normal |
| ECONOMICAL | 4K | Máxima | Mínima | Nunca | Tarefas triviais |
| SAFE | 16K+ | Controlada | Extensiva | Sempre | Operações críticas |
| DEEP THINKING | 8K+ | Lenta | Profunda | Opcional | Problemas complexos |
| ARCHITECTURE | 8K+ | Moderada | Arquitetural | Opcional | Design/Refactoring |
| DEBUG | 6K+ | Moderada | Diagnóstica | Opcional | Troubleshooting |
| EMERGENCY | 8K+ | Rápida | Concisa | Recomendada | Incidentes |
| LEARNING | 6K+ | Moderada | Explicativa | Não | Educação |

---

## COMANDOS DE ATIVAÇÃO

### Ativar Modo

```
/MODE DEFAULT
/MODE ECONOMICAL
/MODE SAFE
/MODE DEEP
/MODE ARCHITECTURE
/MODE DEBUG
/MODE EMERGENCY
/MODE LEARNING
```

### Ativar SAFE MODE

```
/SAFE_MODE ON
/SAFE_MODE OFF
/SAFE_MODE STATUS
```

### Verificar Status

```
/STATUS
→ Mostra modo atual, classificação, tokens usados
```

---

## TRANSIÇÕES DE MODO

### Regras de Transição

```yaml
from_economical:
  to_safe: "Auto se critical keyword"
  to_default: "/MODE DEFAULT"
  
from_safe:
  to_default: "/SAFE_MODE OFF"
  to_economical: "Não permitido (sempre via DEFAULT)"
  
from_any:
  to_emergency: "Auto em erros críticos"
```

### Persistência

```yaml
mode_persistence:
  per_session: true
  per_conversation: true
  reset_on_new_task: false
```

---

## SELEÇÃO AUTOMÁTICA

### Heurísticas

```python
def auto_select_mode(task_description, context):
    # Keywords de emergência
    if contains_keywords(task, ['bug', 'error', 'broken', 'not working']):
        if is_critical_system(context):
            return EMERGENCY_MODE
        return DEBUG_MODE
    
    # Keywords de arquitetura
    if contains_keywords(task, ['refactor', 'architecture', 'pattern', 'structure']):
        return ARCHITECTURE_MODE
    
    # Keywords de aprendizado
    if contains_keywords(task, ['explain', 'how does', 'why', 'teach']):
        return LEARNING_MODE
    
    # Keywords de análise profunda
    if contains_keywords(task, ['analyze', 'review', 'assess']):
        return DEEP_THINKING_MODE
    
    # Default
    return DEFAULT_MODE
```

---

## INTEGRAÇÃO COM CLASSIFICAÇÃO

### Matriz Modo x Classificação

| Modo | LOW | MEDIUM | HIGH | CRITICAL |
|------|-----|--------|------|----------|
| DEFAULT | ✓ | ✓ | ✓ | ✓ |
| ECONOMICAL | ✓ | ⚠️ | ❌ | ❌ |
| SAFE | ✓ | ✓ | ✓ | ✓ (obrigatório) |
| DEEP | ✓ | ✓ | ✓ | ✓ |
| ARCHITECTURE | ✓ | ✓ | ✓ | ✓ |
| DEBUG | ✓ | ✓ | ✓ | ✓ |
| EMERGENCY | ⚠️ | ✓ | ✓ | ✓ |
| LEARNING | ✓ | ✓ | ✓ | ✓ |

✓ = Totalmente compatível
⚠️ = Com cautela
❌ = Não recomendado

---

## RESUMO

**Escolha o modo apropriado**:

- 🎯 **DEFAULT**: Maioria das tarefas
- ⚡ **ECONOMICAL**: Muitas operações simples
- 🛡️ **SAFE**: Código crítico, produção
- 🧠 **DEEP**: Problemas complexos
- 🏗️ **ARCHITECTURE**: Design e estrutura
- 🐛 **DEBUG**: Investigação
- 🚨 **EMERGENCY**: Incidentes
- 📚 **LEARNING**: Educação

**Modo correto = Eficiência máxima + Segurança garantida**
