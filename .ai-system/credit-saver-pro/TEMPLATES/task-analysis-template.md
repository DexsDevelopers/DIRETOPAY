# TASK ANALYSIS TEMPLATE

## Template de Análise de Tarefa — Credit Saver Pro Enterprise

---

## INFORMAÇÕES GERAIS

```yaml
task_id: [auto-generated ou manual]
date: [YYYY-MM-DD HH:MM:SS]
requested_by: [usuário/sistema]
classification: [LOW/MEDIUM/HIGH/CRITICAL]
model_used: [modelo selecionado]
tokens_estimated: [número]
tokens_used: [número - preencher após]
duration: [tempo total - preencher após]
```

---

## DESCRIÇÃO DA TAREFA

### Original Request
```
[Copiar descrição exata do que foi pedido]
```

### Interpretação
```
[Explicar como entendi a tarefa]
```

### Escopo
- **Inclui**: [o que será feito]
- **Exclui**: [o que NÃO será feito]
- **Limites**: [restrições identificadas]

---

## CLASSIFICAÇÃO

### Nível Determinado
**[LOW/MEDIUM/HIGH/CRITICAL]**

### Justificativa
```
[Explicar por que este nível foi escolhido]
```

### Gatilhos de Classificação
- [ ] Keywords de baixo custo
- [ ] Keywords de médio custo  
- [ ] Keywords de alto custo
- [ ] Keywords críticas
- [ ] Contexto de produção
- [ ] Dados financeiros
- [ ] Sistema de auth
- [ ] Database migration

### Override Aplicado
- [ ] Nenhum
- [ ] Upgrade forçado: [motivo]
- [ ] Downgrade permitido: [motivo]

---

## ANÁLISE DE RISCO

### Nível de Risco
**[NONE/LOW/MEDIUM/HIGH/CRITICAL]**

### Riscos Identificados

#### Técnicos
| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| [descrição] | [Alta/Média/Baixa] | [Alto/Médio/Baixo] | [ação] |

#### de Negócio
| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| [descrição] | [Alta/Média/Baixa] | [Alto/Médio/Baixo] | [ação] |

#### de Integração
| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| [descrição] | [Alta/Média/Baixa] | [Alto/Médio/Baixo] | [ação] |

### Breaking Changes
- [ ] Nenhum
- [ ] Possíveis: [descrever]
- [ ] Confirmados: [descrever]

### Backward Compatibility
- [ ] 100% compatível
- [ ] Compatível com deprecation
- [ ] Breaking change justificado

---

## ANÁLISE DE CONTEXTO

### Stack Detectada
```yaml
frontend: [React/Vue/Angular/etc]
backend: [Node/Django/Rails/etc]
database: [PostgreSQL/Mongo/etc]
framework: [Next/Nest/Express/etc]
language: [TypeScript/JavaScript/Python/etc]
```

### Padrões Identificados
- [ ] Arquitetura: [MVC/Microservices/Modular/etc]
- [ ] Estilo de código: [indentação, convenções]
- [ ] Padrões de projeto: [Repository/Service/Factory/etc]

### Convenções
- Nomenclatura: [camelCase/snake_case/etc]
- Estrutura: [descrever]
- Imports: [padrão usado]

---

## ARQUIVOS IDENTIFICADOS

### Arquivos a Modificar

| # | Arquivo | Linhas Est. | Tipo de Alteração | Nível de Risco |
|---|---------|-------------|-------------------|----------------|
| 1 | [path] | [n] | [create/modify/delete] | [LOW/MED/HIGH] |
| 2 | [path] | [n] | [create/modify/delete] | [LOW/MED/HIGH] |
| 3 | [path] | [n] | [create/modify/delete] | [LOW/MED/HIGH] |

### Dependências
| Arquivo | Dependente de | Impacto |
|---------|---------------|---------|
| [path] | [path] | [descrição] |

### Arquivos de Referência (contexto)
| Arquivo | Motivo |
|---------|--------|
| [path] | [por que incluído] |

---

## PLANO DE EXECUÇÃO

### Estratégia
```
[Descrever abordagem geral]
```

### Passos

#### 1. [Nome do Passo]
- **Ação**: [descrever]
- **Arquivo**: [path]
- **Validação**: [como verificar]

#### 2. [Nome do Passo]
- **Ação**: [descrever]
- **Arquivo**: [path]
- **Validação**: [como verificar]

#### 3. [Nome do Passo]
- **Ação**: [descrever]
- **Arquivo**: [path]
- **Validação**: [como verificar]

---

## CONFIRMAÇÃO

### Requerida?
- [ ] Não (LOW)
- [ ] Opcional (MEDIUM)
- [ ] Recomendada (HIGH)
- [ ] Obrigatória (CRITICAL)

### Diálogo de Confirmação
```
[Se aplicável, copiar diálogo apresentado ao usuário]
```

### Resposta do Usuário
- [ ] Aprovado
- [ ] Rejeitado
- [ ] Modificações solicitadas: [descrever]

---

## EXECUÇÃO

### Realizada em
```
[início - fim]
```

### Alterações Realizadas

| Arquivo | Linhas Modificadas | Tipo | Status |
|---------|-------------------|------|--------|
| [path] | [+n/-n] | [create/modify/delete] | [ok/error] |

### Issues Encontrados
```
[Descrever qualquer problema durante execução]
```

### Soluções Aplicadas
```
[Como problemas foram resolvidos]
```

---

## VALIDAÇÃO PÓS-EXECUÇÃO

### Checklist
- [ ] Sintaxe válida
- [ ] Tipos consistentes
- [ ] Imports resolvidos
- [ ] Sem regressões óbvias
- [ ] Funcionalidade implementada
- [ ] Padrões preservados

### Testes
- [ ] Testes passando (se existentes)
- [ ] Testes novos (se solicitados)
- [ ] Validação manual

### Resultado
- [ ] Sucesso completo
- [ ] Sucesso parcial: [descrever limitações]
- [ ] Falha: [descrever]

---

## RESUMO EXECUTIVO

```
[2-3 frases resumindo o que foi feito, principais decisões e resultado]
```

### Pontos de Atenção
- [Item 1]
- [Item 2]

### Recomendações
- [Recomendação 1]
- [Recomendação 2]

### Próximos Passos (se houver)
- [Passo 1]
- [Passo 2]

---

## MÉTRICAS

| Métrica | Estimado | Real | Diferença |
|---------|----------|------|-----------|
| Tokens | [n] | [n] | [n] |
| Tempo | [n]s | [n]s | [n]s |
| Arquivos | [n] | [n] | [n] |
| Linhas | [n] | [n] | [n] |

---

## APRENDIZADOS

### O que Funcionou Bem
```
[Descrever]
```

### O que Poderia Melhorar
```
[Descrever]
```

### Ajustes no Sistema
```
[Se necessário, notas para melhorar classificação, detecção, etc]
```

---

**Template version**: 1.0.0  
**Preencido por**: [Sistema/Agente]  
**Revisado por**: [se aplicável]
