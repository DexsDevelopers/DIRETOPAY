# CHEAP TASK EXAMPLES

## Exemplos de Tarefas de Baixo Custo — Credit Saver Pro Enterprise

---

## VISÃO GERAL

Esta página documenta exemplos de tarefas classificadas como **LOW_COST**, demonstrando:
- Como identificar tarefas triviais
- Quanto contexto carregar
- Como executar eficientemente
- Respostas apropriadas

---

## EXEMPLO 1: Ajuste de CSS

### Tarefa
```
"Torna o header azul em vez de cinza"
```

### Classificação
```yaml
level: LOW_COST
reason: Pure UI, no logic, single component
confidence: 99%
```

### Análise
```
Keywords: "color", "header", "CSS"
Pattern: Visual styling only
Risk: None
Complexity: Trivial
```

### Contexto Carregado
| Arquivo | Motivo | Linhas |
|---------|--------|--------|
| Header.module.css | Estilos do header | 45 |
| Header.tsx | Estrutura JSX | 30 |

### Execução
```css
/* ANTES */
.header {
  background-color: #gray;
  padding: 1rem;
}

/* DEPOIS */
.header {
  background-color: #blue;
  padding: 1rem;
}
```

### Resposta
```
✅ Concluído
Arquivo: Header.module.css
Alteração: background-color: #blue
Tempo: 3s
Tokens: ~400
```

---

## EXEMPLO 2: Texto/Label

### Tarefa
```
"Muda o botão de 'Salvar' para 'Guardar Alterações'"
```

### Classificação
```yaml
level: LOW_COST
reason: Text only, no logic
confidence: 99%
```

### Contexto Carregado
| Arquivo | Motivo | Linhas |
|---------|--------|--------|
| UserForm.tsx | Form com botão | 80 |

### Execução
```tsx
// ANTES
<button type="submit">Salvar</button>

// DEPOIS  
<button type="submit">Guardar Alterações</button>
```

### Resposta
```
✅ Concluído
Arquivo: UserForm.tsx:45
Alteração: 1 linha
Tempo: 2s
Tokens: ~300
```

---

## EXEMPLO 3: Ícone

### Tarefa
```
"Adiciona ícone de alerta no campo de senha"
```

### Classificação
```yaml
level: LOW_COST
reason: UI enhancement, no logic
confidence: 95%
```

### Contexto Carregado
| Arquivo | Motivo | Linhas |
|---------|--------|--------|
| PasswordInput.tsx | Componente do input | 40 |
| (icon library já conhecida do projeto) | | |

### Execução
```tsx
import { AlertCircle } from 'lucide-react';

// ANTES
<div className="password-field">
  <input type="password" />
</div>

// DEPOIS
<div className="password-field">
  <AlertCircle className="warning-icon" />
  <input type="password" />
</div>
```

### Resposta
```
✅ Concluído
Arquivo: PasswordInput.tsx
Alteração: +2 linhas (import + JSX)
Tempo: 5s
Tokens: ~600
```

---

## EXEMPLO 4: Configuração

### Tarefa
```
"Aumenta o timeout da API para 10 segundos"
```

### Classificação
```yaml
level: LOW_COST
reason: Config tweak, no logic change
confidence: 90%
```

### Contexto Carregado
| Arquivo | Motivo | Linhas |
|---------|--------|--------|
| api.config.ts | Configuração da API | 20 |

### Execução
```typescript
// ANTES
const API_TIMEOUT = 5000;

// DEPOIS
const API_TIMEOUT = 10000;
```

### Resposta
```
✅ Concluído
Arquivo: api.config.ts
Alteração: 1 valor
Tempo: 2s
Tokens: ~250
```

---

## EXEMPLO 5: Comentário

### Tarefa
```
"Adiciona JSDoc à função calculateTotal"
```

### Classificação
```yaml
level: LOW_COST
reason: Documentation, no logic change
confidence: 99%
```

### Contexto Carregado
| Arquivo | Motivo | Linhas |
|---------|--------|--------|
| utils/calculate.ts | Função existente | 30 |

### Execução
```typescript
// ANTES
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// DEPOIS
/**
 * Calcula o total de uma lista de itens
 * @param items - Lista de itens com preço
 * @returns Soma total dos preços
 */
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Resposta
```
✅ Concluído
Arquivo: utils/calculate.ts
Alteração: +5 linhas (JSDoc)
Tempo: 4s
Tokens: ~450
```

---

## PADRÕES COMUNS

### Características LOW_COST

| Característica | Descrição |
|----------------|-----------|
| Impacto | Visual/textual apenas |
| Lógica | Nenhuma ou trivial |
| Arquivos | 1-3 |
| Linhas | <20 por arquivo |
| Risco | Zero |
| Testes | Não necessários |
| Review | Opcional |

### Keywords Indicativas

```
CSS: color, background, font, spacing, margin, padding, border
Visual: icon, image, layout, align, flex, grid
Texto: label, text, copy, message, wording, translation
Config: timeout, limit, flag, toggle, env
Docs: comment, JSDoc, README, example
```

---

## ANTI-EXEMPLOS

### O Que NÃO é LOW_COST

```
❌ "Implementa sistema de tema dark/light"
→ Envolve state, lógica, múltiplos componentes = MEDIUM

❌ "Adiciona validação de formulário"
→ Lógica de negócio = MEDIUM

❌ "Cria componente de calendário"
→ Complexidade alta = MEDIUM

❌ "Ajusta sistema de autenticação"
→ Security = HIGH

❌ "Muda schema do banco"
→ Database = HIGH
```

---

## ESTATÍSTICAS

### Médias LOW_COST

| Métrica | Média | Range |
|---------|-------|-------|
| Tempo | 5s | 2-15s |
| Tokens | 500 | 200-1500 |
| Arquivos | 1.5 | 1-3 |
| Linhas editadas | 3 | 1-15 |
| Confirmação necessária | 0% | - |

---

## RESUMO

**LOW_COST = Eficiência máxima**

- 🎯 Foco absoluto
- ⚡ Velocidade total  
- 📉 Tokens mínimos
- ✅ Execução direta

**Quando usar**: CSS, texto, ícones, configs, docs.

**Quando NÃO usar**: Lógica, auth, payments, database.
