# BEFORE EDITING CHECKLIST

## Checklist Pré-Edição — Credit Saver Pro Enterprise

---

## PROPÓSITO

Garantir que toda edição seja segura, mínima e preserve a integridade do código.

---

## PRINCÍPIOS FUNDAMENTAIS

**Antes de editar qualquer arquivo, lembre-se:**

> Edite o mínimo necessário. Preserve código funcional.

---

## CHECKLIST DE PREPARAÇÃO

### 1. VERIFICAÇÃO DO ARQUIVO

- [ ] Arquivo existe e está acessível
- [ ] Tenho permissão para editar (não protegido CRITICAL sem aprovação)
- [ ] Arquivo é realmente necessário para a tarefa
- [ ] Linhas a editar foram identificadas

**Se arquivo protegido CRITICAL → Verificar SAFE MODE e aprovações**

---

### 2. BACKUP MENTAL

- [ ] Li e entendi o trecho a ser editado
- [ ] Identifiquei dependências do trecho
- [ ] Entendi o contexto (função/classe/componente)
- [ ] Notei possíveis side effects

---

### 3. PLANEJAMENTO DA EDIÇÃO

- [ ] Defini exatamente o que mudar
- [ ] Identifiquei linhas específicas (não "arquivo todo")
- [ ] Planejei preservar formatação
- [ ] Considerei imports necessários

**Formato do plano**:
```
Arquivo: [path]
Linhas: [X-Y]
Alteração: [descrição específica]
Preservar: [o que não mudar]
```

---

### 4. CONSISTÊNCIA

- [ ] Estilo de código do arquivo será preservado
- [ ] Convenções de nomenclatura seguidas
- [ ] Padrões do projeto respeitados
- [ ] Tipos consistentes

---

## LIMITES DE EDIÇÃO

### Por Nível

| Nível | Max Linhas/Arquivo | Max Edições | Reformatar? |
|-------|-------------------|-------------|-------------|
| LOW | 20 | 10 | NUNCA |
| MEDIUM | 50 | 25 | NUNCA |
| HIGH | 100 | 50 | NUNCA |
| CRITICAL | Ilimitado | Análise | Com cautela |

### Regras Universais

- [ ] Não reformatar arquivo inteiro
- [ ] Não reordenar imports sem motivo
- [ ] Não alterar comentários existentes
- [ ] Não mudar estilo de código
- [ ] Não adicionar linhas em branco extras
- [ ] Não remover código funcional não relacionado

---

## VERIFICAÇÃO PRÉ-EDIÇÃO

### Para Cada Edição

```
□ Esta linha precisa realmente mudar?
□ A alteração é mínima possível?
□ Vou preservar o resto intacto?
□ Não estou criando inconsistência?
□ Tipos/imports continuam corretos?
```

### Para Cada Arquivo

```
□ Li o contexto antes de editar?
□ Entendi o que a função/classe faz?
□ Minha alteração não quebra nada?
□ Mantive formatação original?
□ Não adicionei código desnecessário?
```

---

## ANTI-PATTERNS A EVITAR

### ❌ PROIBIDO

```javascript
// 1. NUNCA reformate arquivo inteiro
// ❌ Antes
function foo() {
  return 1;
}
// ❌ Depois (reformatado tudo)
function foo()
{
    return 1;
}

// 2. NUNCA edite mais que o necessário
// ❌ Tarefa: mudar return
function calculate() {
  const x = 1;  // ❌ Editado sem necessidade
  const y = 2;  // ❌ Editado sem necessidade
  return x + y; // ✅ Apenas isso deveria mudar
}

// 3. NUNCA adicione comentários desnecessários
// ❌ Tarefa: fix bug
function fix() {
  // Fixed the bug here <- ❌ Comentário óbvio
  return correctedValue;
}

// 4. NUNCA altere imports não relacionados
// ❌ Tarefa: mudar função
import { foo } from 'bar';  // ❌ Reordenado sem necessidade
import { baz } from 'qux';   // ❌ Reordenado sem necessidade

// 5. NUNCA remova código funcional "por limpeza"
// ❌ Tarefa: adicionar feature
function existing() {
  // Código funcional removido ❌
  // nova feature adicionada
}
```

### ✅ OBRIGATÓRIO

```javascript
// 1. SEMPRE edite apenas o necessário
// Tarefa: mudar valor de retorno
function calculate() {
  const x = 1;  // ✅ Preservado
  const y = 2;  // ✅ Preservado  
  return x * y; // ✅ Alterado apenas aqui
}

// 2. SEMPRE preserve formatação
function foo() {
  return 1;  // ✅ Mesma formatação
}

// 3. SEMPRE mantenha imports intactos (exceto se necessário)
import { foo, bar } from 'baz';  // ✅ Preservado

// 4. SEMPRE adicione imports apenas no topo
// ✅ Novo import no topo, ordenado alfabeticamente
import { newUtil } from './utils';
```

---

## CHECKLIST DE QUALIDADE

### Após Cada Edição

- [ ] Sintaxe está correta?
- [ ] Tipos consistentes?
- [ ] Imports não quebrados?
- [ ] Sem referências perdidas?
- [ ] Código compila/executa?

### Antes de Salvar

- [ ] Revisar alterações
- [ ] Confirmar que são mínimas
- [ ] Garantir que funcionalidade é preservada
- [ ] Verificar sem conflitos

---

## GATILHO DE REVISÃO

**Reavalie se:**

1. ⚠️ Estou editando mais de 20% do arquivo
2. ⚠️ Mudei mais de 10 linhas sem necessidade
3. ⚠️ Reformatei código não relacionado
4. ⚠️ Removi código sem entender o que fazia
5. ⚠️ Alterações estão fora do escopo da tarefa

**Ação**: Reverter e refazer com foco maior

---

## RESUMO

```
ANTES DE EDITAR:
1. Verificar arquivo (existência, permissão)
2. Fazer backup mental (ler e entender)
3. Planejar edição mínima
4. Verificar consistência
5. Confirmar limites (linhas, edições)

DURANTE EDIÇÃO:
1. Alterar apenas o necessário
2. Preservar tudo mais intacto
3. Manter formatação
4. Não adicionar extras

APÓS EDIÇÃO:
1. Validar sintaxe
2. Confirmar minimalidade
3. Garantir integridade
```

---

**Edição mínima = Qualidade máxima**
