# LOW COST WORKFLOW — Credit Saver Pro Enterprise

## Workflow para Tarefas de Baixo Custo

---

## VISÃO GERAL

Workflow otimizado para tarefas triviais: CSS, texto, ajustes simples, componentes básicos.

**Características**:
- Execução rápida
- Mínima análise
- Sem confirmação obrigatória
- Modelo econômico

---

## QUANDO USAR

### Critérios de Aplicação

```yaml
applicable_when:
  - css_changes: "cores, spacing, layout básico"
  - text_updates: "labels, mensagens, copy"
  - simple_components: "botões, inputs, cards simples"
  - config_tweaks: "valores, flags, opções"
  - minor_fixes: "correções triviais de bug"
  - documentation: "comentários, README updates"
  
not_applicable_when:
  - logic_changes: "qualquer lógica de negócio"
  - api_changes: "endpoints, contratos"
  - database: "schemas, queries"
  - auth: "autenticação, autorização"
  - payment: "qualquer sistema financeiro"
```

---

## FLUXO DE EXECUÇÃO

```
┌─────────────────────────────────────────────┐
│ 1. RECEBER TAREFA                           │
│    └── Descrição do usuário                 │
├─────────────────────────────────────────────┤
│ 2. CLASSIFICAR                              │
│    └── LOW_COST confirmado                  │
│    └── Tempo: <1s                           │
├─────────────────────────────────────────────┤
│ 3. IDENTIFICAR ARQUIVOS                     │
│    └── Máximo 3 arquivos                    │
│    └── Busca direcionada                    │
│    └── Tempo: <2s                           │
├─────────────────────────────────────────────┤
│ 4. ANALISAR PATTERN                         │
│    └── Convenções existentes                │
│    └── Tempo: <2s                           │
├─────────────────────────────────────────────┤
│ 5. EXECUTAR                                 │
│    └── Edição mínima                        │
│    └── Preservar formatação                 │
│    └── Tempo: <5s                           │
├─────────────────────────────────────────────┤
│ 6. VALIDAR                                  │
│    └── Sintaxe OK                           │
│    └── Sem regressão óbvia                  │
│    └── Tempo: <2s                           │
├─────────────────────────────────────────────┤
│ 7. CONFIRMAR                                │
│    └── "Concluído"                          │
└─────────────────────────────────────────────┘

Total: <12 segundos
```

---

## CONFIGURAÇÃO

```yaml
workflow_config:
  classification: LOW_COST
  model: economical
  max_tokens: 4096
  max_files: 3
  max_lines_per_file: 20
  confirmation_required: false
  analysis_depth: minimal
  execution_mode: direct
  
context_settings:
  load_strategy: "targeted"
  include_tests: false
  include_dependencies: false
  include_documentation: false
  compression: "high"
  
execution_limits:
  max_edits_per_file: 10
  preserve_formatting: true
  auto_lint: true
```

---

## EXEMPLOS DE USO

### Exemplo 1: Ajuste de CSS

```
USUÁRIO: "Deixa o botão de submit azul em vez de verde"

CLASSIFICAÇÃO: LOW_COST
ARQUIVOS: 1 (Button.module.css ou similar)

EXECUÇÃO:
1. Buscar arquivo de estilos do botão
2. Encontrar: background-color: green
3. Alterar para: background-color: blue
4. Verificar: nenhum outro estilo afetado

RESULTADO: Concluído em 1 arquivo, 1 linha alterada
```

### Exemplo 2: Texto/Label

```
USUÁRIO: "Muda 'Salvar' para 'Guardar Alterações'"

CLASSIFICAÇÃO: LOW_COST
ARQUIVOS: 1-2 (componente + possível i18n)

EXECUÇÃO:
1. Buscar "Salvar" no codebase
2. Encontrar: <button>Salvar</button>
3. Alterar para: <button>Guardar Alterações</button>
4. Verificar: apenas UI, sem lógica

RESULTADO: Concluído, 1 arquivo, 1 label alterada
```

### Exemplo 3: Componente Simples

```
USUÁRIO: "Adiciona um ícone de alerta no header"

CLASSIFICAÇÃO: LOW_COST
ARQUIVOS: 2 (Header.tsx, possível ícone já existente)

EXECUÇÃO:
1. Abrir Header.tsx
2. Verificar: ícones existem (lucide/react)
3. Adicionar: <AlertCircle className="..." />
4. Estilizar conforme padrão do projeto

RESULTADO: Concluído, 1 arquivo, ~5 linhas
```

---

## ANTI-PATTERNS A EVITAR

### ❌ Proibido neste workflow

```
1. Analisar mais de 3 arquivos
2. Abrir arquivos não relacionados
3. Refatorar código "enquanto está aqui"
4. Adicionar comentários explicativos
5. Mudar imports não relacionados
6. Reformatar arquivo inteiro
7. Verificar testes (exceto se explicitamente pedido)
8. Analisar impacto em outros componentes
```

### ✅ Obrigatório neste workflow

```
1. Abrir apenas arquivos necessários
2. Editar apenas linhas relevantes
3. Preservar formatação existente
4. Ser direto e eficiente
5. Concluir rapidamente
6. Validar sintaxe básica
```

---

## MENSAGENS DE STATUS

```
Iniciando: "Ajustando [tarefa]..."

Durante:
- "Localizando arquivo..."
- "Aplicando alteração..."

Concluindo:
- "✅ Concluído: [arquivo] modificado"
- "📝 Alteração: [descrição breve]"

Se erro:
- "⚠️ Não encontrado: [o que faltou]"
- "💡 Sugestão: [alternativa]"
```

---

## CHECKLIST

### Pré-Execução
- [ ] Tarefa é realmente trivial?
- [ ] Apenas UI/estilo/texto?
- [ ] Sem lógica de negócio?

### Execução
- [ ] Arquivos relevantes identificados (<3)
- [ ] Padrões do projeto seguidos
- [ ] Apenas edições necessárias

### Pós-Execução
- [ ] Sintaxe válida
- [ ] Formatação preservada
- [ ] Sem regressões óbvias

---

## RESUMO

**LOW COST = Eficiência máxima**

- ⚡ **Rápido**: <12 segundos
- 🎯 **Focado**: Apenas o necessário
- 📝 **Simples**: Sem análise profunda
- ✅ **Direto**: Execução imediata

**Use quando**: CSS, texto, ajustes visuais simples.

**Não use quando**: Lógica, API, database, segurança.
