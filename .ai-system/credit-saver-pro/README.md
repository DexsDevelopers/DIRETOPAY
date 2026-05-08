# Credit Saver Pro Enterprise

## Framework Universal de Inteligência Operacional para IA Coding Agents

---

## Visão Executiva

O **Credit Saver Pro Enterprise** é um framework enterprise-grade que transforma qualquer IA coding agent (Windsurf, Cursor, Claude Code, Copilot, agentes autônomos) em um engenheiro de software operacionalmente inteligente.

### Objetivos Primários

- **Economia Inteligente**: Reduzir consumo de tokens sem comprometer qualidade
- **Segurança Operacional**: Proteger produção e dados críticos
- **Eficiência Contextual**: Otimizar uso de contexto e memória
- **Prevenção de Riscos**: Analisar e mitigar impactos antes da execução
- **Arquitetura Consciente**: Preservar e respeitar padrões existentes

---

## Pilares Fundamentais

### 1. Economia de Créditos (Token Economy)
Sistema inteligente de classificação de tarefas que determina automaticamente:
- Modelo ideal para cada operação
- Limite de tokens apropriado
- Profundidade de raciocínio necessária
- Estratégia de execução otimizada

### 2. Proteção de Produção (Production Guard)
Camadas de segurança para operações críticas:
- Análise de risco automática
- Validação de impacto
- Preservação de compatibilidade
- Proteção de dados sensíveis

### 3. Anti-Hallucinação
Prevenção sistemática contra:
- Endpoints inventados
- Tabelas inexistentes
- Variáveis de ambiente falsas
- Assumções arquiteturais incorretas

### 4. Anti-Overengineering
Promoção de simplicidade através de:
- Edições minimais focadas
- Preservação de código funcional
- Evitar refatorações estéticas
- Rejeitar complexidade artificial

### 5. Consciência Arquitetural
Detecção e respeito automático de:
- Stack tecnológica
- Padrões de projeto
- Convenções de nomenclatura
- Estrutura modular existente

---

## Estrutura do Sistema

```
.ai-system/credit-saver-pro/
├── README.md                    # Este documento
├── CORE_RULES.md               # Regras fundamentais
├── EXECUTION_POLICY.md         # Política de execução
├── TASK_CLASSIFICATION.md      # Classificação de tarefas
├── MODEL_ROUTING.md            # Roteamento de modelos
├── TOKEN_STRATEGY.md           # Estratégia de tokens
├── CONTEXT_CONTROL.md          # Controle de contexto
├── SAFE_MODE.md                # Modo de segurança
├── WORKFLOWS/                  # Fluxos operacionais
├── RULES/                      # Regras específicas por domínio
├── PROMPTS/                    # Prompts otimizados por modo
├── CHECKLISTS/                 # Checklists operacionais
├── EXAMPLES/                   # Exemplos práticos
├── CONFIG/                     # Configurações JSON
└── TEMPLATES/                  # Templates operacionais
```

---

## Classificação de Tarefas

### LOW_COST
**Critérios**: CSS simples, texto, pequenos componentes, ajustes rápidos  
**Modelo**: Econômico  
**Limite**: 4K tokens  
**Arquivos**: Máximo 3  
**Confirmação**: Não necessária

### MEDIUM_COST
**Critérios**: CRUD, APIs simples, integrações pequenas  
**Modelo**: Médio  
**Limite**: 8K tokens  
**Arquivos**: Máximo 6  
**Confirmação**: Opcional

### HIGH_COST
**Critérios**: Pagamentos, PIX, auth, banco de dados, produção  
**Modelo**: Premium  
**Limite**: 16K tokens  
**Arquivos**: Máximo 10  
**Confirmação**: Recomendada

### CRITICAL_COST
**Critérios**: Sistema financeiro, webhooks bancários, criptografia, deploy  
**Modelo**: Máxima inteligência  
**Limite**: 32K tokens  
**Arquivos**: Ilimitado (análise necessária)  
**Confirmação**: **OBRIGATÓRIA**

---

## Áreas Críticas (HIGH/CRITICAL)

- **Financeiro**: PIX, pagamentos, webhooks, gateways
- **Segurança**: Auth, JWT, sessões, criptografia
- **Dados**: Banco de dados, migrations, schemas
- **Infraestrutura**: Deploy, produção, filas, workers
- **Real-time**: WebSocket, realtime, eventos
- **Core**: Sistema de saldo, carteira, transações

---

## Fluxo Operacional Padrão

1. **Classificar** → Determinar nível de custo da tarefa
2. **Detectar** → Identificar riscos e criticidade
3. **Escolher** → Selecionar modelo e contexto ideal
4. **Calcular** → Estimar custo operacional
5. **Planejar** → Criar plano de execução mínimo
6. **Executar** → Realizar edições focadas
7. **Validar** → Verificar impacto e estabilidade

---

## Uso Rápido

### Para Tarefas Simples
```
Modo: LOW_COST
Instrução: "Ajustar cor do botão header"
Ação: Modelo econômico, 1 arquivo, edição mínima
```

### Para APIs
```
Modo: MEDIUM_COST
Instrução: "Criar endpoint de listagem de usuários"
Ação: Modelo médio, análise de 3-5 arquivos, confirmação opcional
```

### Para Pagamentos
```
Modo: HIGH_COST
Instrução: "Implementar webhook PIX"
Ação: Modelo premium, análise profunda, confirmação recomendada
```

### Para Produção
```
Modo: CRITICAL_COST
Instrução: "Alterar tabela de transações"
Ação: Máxima cautela, análise completa, **confirmação obrigatória**
```

---

## Integração com IDEs

### Windsurf
Carregar via `.windsurf/rules/credit-saver-pro.md`

### Cursor
Carregar via `.cursorrules` ou diretório `.cursor/rules/`

### Claude Code
Injetar via system prompt ou arquivo de configuração

### Copilot
Utilizar via custom instructions

---

## Contribuição e Versionamento

- **Versão**: 1.0.0 Enterprise
- **Atualização**: Sempre preservar regras core ao atualizar
- **Customização**: Adicionar regras específicas do projeto em `RULES/custom/`
- **Memória**: Manter aprendizados em `MEMORY/`

---

## Licença Enterprise

Este framework é projetado para uso em ambientes enterprise, fintechs, plataformas de pagamento e sistemas críticos financeiros.

**© 2025 Credit Saver Pro Enterprise** — Inteligência Operacional para IA Coding Agents
