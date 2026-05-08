# PRE-EXECUTION CHECKLIST

## Checklist Pré-Execução — Credit Saver Pro Enterprise

---

## PROPÓSITO

Verificar se a IA está pronta para executar uma tarefa de forma segura e eficiente.

---

## CHECKLIST UNIVERSAL

### 1. COMPREENSÃO DA TAREFA

- [ ] Entendi o que o usuário pediu
- [ ] Identifiquei o objetivo real (não apenas a solução sugerida)
- [ ] Confirmei escopo da tarefa
- [ ] Identifiquei restrições implícitas

**Se algum item não estiver claro → Perguntar ao usuário**

---

### 2. CLASSIFICAÇÃO

- [ ] Classifiquei a tarefa (LOW/MEDIUM/HIGH/CRITICAL)
- [ ] Justifiquei a classificação
- [ ] Verifiquei gatilhos de escalonamento
- [ ] Identifiquei áreas críticas envolvidas

**Resultado esperado**: `Classificação: [LEVEL] - [Justificativa]`

---

### 3. ANÁLISE DE RISCO

#### Para TODAS as tarefas:
- [ ] Identifiquei riscos potenciais
- [ ] Avaliei impacto de falhas
- [ ] Considerei edge cases

#### Para MEDIUM+:
- [ ] Analisei breaking changes
- [ ] Verifiquei backward compatibility
- [ ] Considerei impacto em usuários

#### Para HIGH+:
- [ ] Análise completa de risco documentada
- [ ] Breaking changes identificados e listados
- [ ] Impacto em produção avaliado
- [ ] Estratégia de rollback considerada

#### Para CRITICAL:
- [ ] Relatório de risco completo
- [ ] Cenários de falha mapeados
- [ ] Plano de rollback detalhado
- [ ] Stakeholders identificados

---

### 4. ARQUITETURA E PADRÕES

- [ ] Identifiquei stack tecnológica
- [ ] Detectei framework principal
- [ ] Reconheci padrões de projeto usados
- [ ] Notei convenções de nomenclatura
- [ ] Identifiquei estrutura de pastas

**Ação**: Adaptar solução aos padrões existentes

---

### 5. CONTEXTO NECESSÁRIO

- [ ] Identifiquei arquivos diretamente afetados
- [ ] Mapeei dependências necessárias
- [ ] Limitei a máximo permitido pelo nível:
  - LOW: 3 arquivos
  - MEDIUM: 6 arquivos
  - HIGH: 10 arquivos
  - CRITICAL: Ilimitado (com análise)

- [ ] Excluí arquivos irrelevantes
- [ ] Verifiquei se contexto é suficiente

---

### 6. PLANO DE EXECUÇÃO

- [ ] Defini etapas de execução
- [ ] Estabeleci ordem lógica
- [ ] Identifiquei pontos de validação
- [ ] Estimei tempo/tokens necessários

**Plano deve incluir**:
1. Arquivos a modificar (e ordem)
2. Alterações específicas por arquivo
3. Validações a realizar
4. Resultado esperado

---

### 7. CONFIRMAÇÃO

#### Nível LOW:
- [ ] Não requer confirmação
- [ ] Executar diretamente

#### Nível MEDIUM:
- [ ] Confirmação opcional
- [ ] Se complexo → pedir confirmação

#### Nível HIGH:
- [ ] Confirmação recomendada
- [ ] Mostrar: classificação + arquivos + riscos

#### Nível CRITICAL:
- [ ] Confirmação OBRIGATÓRIA
- [ ] Mostrar análise completa
- [ ] Aguardar aprovação explícita

---

## CHECKLIST POR NÍVEL

### LOW_COST Tasks

```
□ Tarefa é trivial? (CSS, texto, ajuste simples)
□ Apenas 1-3 arquivos?
□ Sem lógica de negócio?
□ Sem dependências críticas?
□ Posso executar diretamente?
```

**Se todas SIM → Executar**

---

### MEDIUM_COST Tasks

```
□ Analisei arquitetura existente?
□ Identifiquei 3-6 arquivos relevantes?
□ Detectei padrões do projeto?
□ Criei plano de execução?
□ Analisei breaking changes básicos?
□ Confirmação necessária?
```

**Se todas SIM → [Confirmar se necessário] → Executar**

---

### HIGH_COST Tasks

```
□ Análise de risco completa?
□ Todos arquivos relevantes identificados (≤10)?
□ Breaking changes mapeados?
□ Backward compatibility avaliada?
□ Estratégia de rollback definida?
□ Testes considerados?
□ Confirmação apresentada?
□ Usuário aprovou?
```

**Se todas SIM → Executar com cautela**

---

### CRITICAL_COST Tasks

```
□ SAFE MODE ativado?
□ Análise extensiva documentada?
□ Riscos catastróficos identificados?
□ Todos stakeholders mapeados?
□ Plano detalhado criado?
□ Rollback testado e pronto?
□ Backup confirmado?
□ Análise apresentada?
□ Confirmação explícita obtida?
```

**Se todas SIM → Executar step-by-step**

---

## VERIFICAÇÃO FINAL

Antes de executar qualquer código:

```
□ Estou confiante no plano?
□ Identifiquei todos os riscos?
□ Tenho contexto suficiente?
□ Selecionei modelo adequado?
□ Estou dentro do orçamento de tokens?
□ Sei como validar resultado?
□ [Se aplicável] Tenho aprovação?
```

---

## GATILHO DE PARADA

**PARE e reavalie se**:

1. ⚠️ Não entendeu o que o usuário quer
2. ⚠️ Classificação parece incorreta
3. ⚠️ Riscos não identificados
4. ⚠️ Contexto insuficiente
5. ⚠️ Arquivos críticos sem análise
6. ⚠️ Usuário não confirmou (CRITICAL)
7. ⚠️ Dúvidas sobre segurança

**Ação**: Perguntar, analisar mais, ou solicitar esclarecimento

---

## RESUMO

| Nível | Checklist | Confirmação | Ação |
|-------|-----------|-------------|------|
| LOW | 6 itens | Não | Executar |
| MEDIUM | 6 itens | Opcional | [Confirmar] → Executar |
| HIGH | 8 itens | Recomendada | Confirmar → Executar |
| CRITICAL | 9 itens | Obrigatória | Aprovação → Executar |

---

**Este checklist deve ser aplicado automaticamente antes de toda execução.**
