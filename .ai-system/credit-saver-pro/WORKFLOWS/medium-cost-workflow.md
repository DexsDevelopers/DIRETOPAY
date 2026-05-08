# MEDIUM COST WORKFLOW — Credit Saver Pro Enterprise

## Workflow para Tarefas de Custo Médio

---

## VISÃO GERAL

Workflow balanceado para tarefas moderadas: CRUD, APIs simples, integrações, componentes reutilizáveis.

**Características**:
- Análise planejada
- Contexto focado
- Confirmação opcional
- Modelo médio

---

## QUANDO USAR

### Critérios de Aplicação

```yaml
applicable_when:
  - crud_operations: "Create, Read, Update, Delete"
  - api_endpoints: "GET, POST simples"
  - ui_components: "Reutilizáveis, complexidade média"
  - form_validation: "Validações de formulário"
  - data_fetching: "Hooks, queries, mutations"
  - simple_integration: "APIs externas simples"
  - refactoring: "Refatorações controladas"
  
not_applicable_when:
  - payment_processing: "qualquer sistema financeiro"
  - authentication: "login, registro, sessões"
  - authorization: "permissões, roles"
  - database_schema: "migrations, alterações"
  - webhooks: "callbacks, eventos externos"
  - crypto: "criptografia, hashing"
  - production_deploy: "deploy em produção"
```

---

## FLUXO DE EXECUÇÃO

```
┌─────────────────────────────────────────────┐
│ 1. RECEBER TAREFA                           │
│    └── Descrição do usuário                 │
├─────────────────────────────────────────────┤
│ 2. CLASSIFICAR                              │
│    └── MEDIUM_COST confirmado               │
│    └── Estimativa: tokens, arquivos          │
│    └── Tempo: 1-2s                          │
├─────────────────────────────────────────────┤
│ 3. ANÁLISE DE CONTEXTO                      │
│    └── Identificar arquivos (3-6)           │
│    └── Mapear dependências                  │
│    └── Detectar padrões                     │
│    └── Tempo: 3-5s                          │
├─────────────────────────────────────────────┤
│ 4. PLANEJAMENTO                             │
│    └── Estrutura da solução                 │
│    └── Arquivos a modificar                 │
│    └── Ordem de execução                    │
│    └── Tempo: 2-3s                          │
├─────────────────────────────────────────────┤
│ 5. CONFIRMAÇÃO (OPCIONAL)                   │
│    └── Se operação complexa                 │
│    └── Mostrar plano                        │
│    └── Aguardar OK                          │
├─────────────────────────────────────────────┤
│ 6. EXECUÇÃO                                 │
│    └── Implementar conforme plano           │
│    └── Preservar padrões                    │
│    └── Tempo: 10-20s                        │
├─────────────────────────────────────────────┤
│ 7. VALIDAÇÃO                                │
│    └── Sintaxe                              │
│    └── Integração                           │
│    └── Consistência                         │
│    └── Tempo: 3-5s                          │
├─────────────────────────────────────────────┤
│ 8. DOCUMENTAÇÃO                             │
│    └── Sumário de alterações                │
│    └── Arquivos modificados                 │
│    └── Breaking changes (se houver)         │
└─────────────────────────────────────────────┘

Total: 20-40 segundos
```

---

## CONFIGURAÇÃO

```yaml
workflow_config:
  classification: MEDIUM_COST
  model: medium
  max_tokens: 8192
  max_files: 6
  max_lines_per_file: 50
  confirmation_required: optional
  analysis_depth: moderate
  execution_mode: planned
  
context_settings:
  load_strategy: "focused"
  include_tests: false
  include_dependencies: true
  include_similar_examples: true
  compression: "medium"
  
execution_limits:
  max_edits_per_file: 25
  preserve_formatting: true
  auto_lint: true
  validate_types: true
```

---

## ANÁLISE DE CONTEXTO

### Estratégia de Carregamento

```
FASE 1: Identificar Entry Points
├── Buscar por keywords da tarefa
├── Identificar arquivos principais
└── Máximo: 3 arquivos core

FASE 2: Mapear Dependências
├── Imports diretos dos arquivos core
├── Utils e helpers compartilhados
├── Types e interfaces
└── Máximo: 3 arquivos adicionais

FASE 3: Exemplos Similares
├── Buscar implementações similares
├── Identificar padrões do projeto
└── Usar como referência
```

---

## EXEMPLOS DE USO

### Exemplo 1: CRUD de Usuários

```
USUÁRIO: "Cria endpoint GET /api/users com paginação"

CLASSIFICAÇÃO: MEDIUM_COST

ANÁLISE:
1. Buscar: routes existentes, controller pattern
2. Encontrar: /api/orders estrutura similar
3. Identificar: pagination já existe em orders

PLANO:
1. Criar userController.ts (padrão de ordersController)
2. Adicionar rota em routes.ts
3. Implementar paginação (reusar de orders)

EXECUÇÃO:
- Criar controller com listUsers
- Implementar skip/limit
- Retornar formato padrão

VALIDAÇÃO:
- Tipos consistentes
- Padrão de erro igual
- Paginação funcional

RESULTADO: 2 arquivos, funcionalidade completa
```

### Exemplo 2: Componente Reutilizável

```
USUÁRIO: "Cria componente de tabela com sorting"

CLASSIFICAÇÃO: MEDIUM_COST

ANÁLISE:
1. Buscar: tabelas existentes
2. Encontrar: UserTable, OrderTable
3. Identificar: padrão comum, extrair abstração

PLANO:
1. Criar DataTable component
2. Extrair lógica comum
3. Props: data, columns, onSort
4. Usar em UserTable (refatorar)

EXECUÇÃO:
- Component genérico
- Tipagem com generics
- Estilos reutilizados

RESULTADO: 1 novo componente + refatoração leve
```

### Exemplo 3: Hook Customizado

```
USUÁRIO: "Cria hook useLocalStorage"

CLASSIFICAÇÃO: MEDIUM_COST

ANÁLISE:
1. Verificar: hooks existentes
2. Padrão: useSessionStorage similar
3. Estrutura: seguir padrão de useSessionStorage

PLANO:
1. Criar useLocalStorage.ts
2. Seguir interface de useSessionStorage
3. Adicionar tipagem genérica
4. Tratar erros de JSON.parse

EXECUÇÃO:
- Hook completo
- Testes básicos
- Documentação JSDoc

RESULTADO: 1 arquivo, reutilizável
```

---

## CHECKLIST DE QUALIDADE

### Pré-Execução
- [ ] Arquivos relevantes identificados (≤6)
- [ ] Padrões do projeto detectados
- [ ] Dependências mapeadas
- [ ] Plano de execução claro

### Durante Execução
- [ ] Seguir padrões existentes
- [ ] Preservar compatibilidade
- [ ] Manter consistência de tipos
- [ ] Código limpo e legível

### Pós-Execução
- [ ] Sintaxe válida
- [ ] Sem erros de import
- [ ] Tipos consistentes
- [ ] Código funcional
- [ ] Documentação adequada

---

## PONTOS DE ATENÇÃO

### Evitar

```yaml
avoid:
  - over_engineering: "Não criar abstrações prematuras"
  - breaking_changes: "Manter compatibilidade"
  - unnecessary_tests: "Não adicionar testes sem pedir"
  - documentation_bloat: "Não documentar óbvio"
  - feature_creep: "Não adicionar 'enquanto está aqui'"
```

### Garantir

```yaml
ensure:
  - code_quality: "Seguir padrões do projeto"
  - type_safety: "Tipagem completa"
  - error_handling: "Tratar erros adequadamente"
  - consistency: "Manter consistência com codebase"
```

---

## RESUMO

**MEDIUM COST = Equilíbrio**

- 📊 **Planejado**: Análise antes de agir
- 🎯 **Focado**: Contexto relevante apenas
- ⚖️ **Balanceado**: Qualidade sem excesso
- ✅ **Consciente**: Impacto considerado

**Use quando**: CRUD, APIs, componentes, integrações.

**Não use quando**: Financeiro, segurança, database crítico.
