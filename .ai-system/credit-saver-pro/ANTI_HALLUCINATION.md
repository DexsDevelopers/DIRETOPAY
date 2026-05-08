# ANTI-HALLUCINATION — Credit Saver Pro Enterprise

## Sistema de Prevenção Contra Alucinações de IA

---

## Visão Geral

O sistema Anti-Hallucination garante que a IA nunca invente código, endpoints, estruturas ou comportamentos. Toda asserção deve ser validada contra o codebase real.

---

## MANIFESTO ANTI-HALLUCINATION

### O Que é Alucinação?

**Definição**: Quando a IA gera código baseado em:
- ❌ Suposições sobre existência de código
- ❌ Memória de outros projetos
- ❌ Padrões "comuns" não confirmados
- ❌ Convenções não verificadas
- ❌ Documentação desatualizada

### O Que NÃO é Alucinação?

**Permitido**:
- ✅ Inferir baseado em código real analisado
- ✅ Seguir padrões explícitos no codebase
- ✅ Usar convenções documentadas no projeto
- ✅ Sugerir com base em código existente similar

---

## CATEGORIAS DE PROIBIÇÃO

### 1. ENDPOINTS INVENTADOS

**Proibido**:
```javascript
❌ // Inventando endpoint que não existe
const response = await fetch('/api/user/settings', {  
  // NUNCA assumir que endpoint existe
});

❌ // Inventando método HTTP
app.patch('/api/users/:id', handler);  
// PATCH pode não ser suportado

❌ // Inventando parâmetros de query
?include=profile&expand=permissions
// NUNCA inventar parâmetros
```

**Obrigatório**:
```javascript
✅ // Validar existência primeiro
// Detectado em routes.ts:42
app.get('/api/users/:id', getUserHandler);

✅ // Confirmar parâmetros suportados
// Validação em validators.ts:15
const validParams = ['email', 'name', 'role'];
```

### 2. TABELAS INVENTADAS

**Proibido**:
```sql
❌ -- Inventando tabela
SELECT * FROM user_preferences;
-- NUNCA assumir que tabela existe

❌ -- Inventando colunas
ALTER TABLE users ADD COLUMN theme VARCHAR(50);
-- NUNCA sem verificar schema
```

**Obrigatório**:
```sql
✅ -- Verificar schema primeiro
-- Schema confirmado em schema.prisma:23
model User {
  id        String   @id
  email     String   @unique
  createdAt DateTime
}

✅ -- Usar apenas colunas existentes
SELECT id, email, createdAt FROM users;
```

### 3. VARIÁVEIS DE AMBIENTE INVENTADAS

**Proibido**:
```javascript
❌ // Inventando env vars
const apiKey = process.env.PAYMENT_GATEWAY_API_KEY;
// NUNCA sem verificar .env.example ou docs

❌ // Inventando formato
const dbUrl = process.env.DATABASE_URL_PRODUCTION;
// Pode ser DATABASE_URL apenas
```

**Obrigatório**:
```javascript
✅ // Validar antes de usar
// Confirmado em .env.example:5
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY not configured');

✅ // Verificar configuração
// Configuração em config/database.ts:8
const dbUrl = process.env.DATABASE_URL;
```

### 4. FUNÇÕES INVENTADAS

**Proibido**:
```javascript
❌ // Chamando função inexistente
const result = validateCPF(cpf);
// NUNCA sem verificar utils/

❌ // Inventando API de biblioteca
import { formatCurrency } from '@/utils';
// NUNCA sem verificar exports

❌ // Assumindo comportamento
hashPassword(password, { rounds: 12 });
// NUNCA sem verificar assinatura
```

**Obrigatório**:
```javascript
✅ // Verificar existência
// Encontrado em utils/validators.ts:42
import { validateCPF } from '@/utils/validators';

✅ // Confirmar assinatura
// Definição em utils/crypto.ts:15
hashPassword(password: string): Promise<string>
// Não aceita options
```

### 5. ESTRUTURAS INVENTADAS

**Proibido**:
```typescript
❌ // Inventando interface
interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
}
// NUNCA sem verificar types/

❌ // Inventando estado de componente
const [userSettings, setUserSettings] = useState();
// NUNCA sem verificar componente
```

**Obrigatório**:
```typescript
✅ // Verificar types existentes
// Definido em types/user.ts:12
interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

✅ // Usar estado existente
// Detectado em UserProfile.tsx:25
const [isEditing, setIsEditing] = useState(false);
```

---

## PROTOCOLO DE VALIDAÇÃO

### Checklist de Validação

```yaml
validation_protocol:
  before_asserting_existence:
    - search_codebase: "Buscar implementação real"
    - read_definition: "Ler arquivo de definição"
    - cross_reference: "Cruzar múltiplas fontes"
    - confirm_current: "Garantir que está atualizado"
    
  before_using_code:
    - verify_location: "Confirmar arquivo correto"
    - check_signature: "Validar assinatura/parâmetros"
    - verify_exports: "Confirmar que é exportado"
    - check_dependencies: "Verificar dependências"
```

### Template de Validação

```
VALIDAÇÃO DE [ITEM]

Item: validateCPF function
Status: ✅ VALIDADO

Localização:
├── Arquivo: utils/validators.ts:42
├── Export: default
├── Assinatura: (cpf: string) => boolean
└── Uso confirmado em: UserForm.tsx:28, Register.tsx:15

Dependências:
├── removeMask (interna)
└── calculateDigit (interna)

Validado em: 2025-05-07 10:45:32
```

---

## TÉCNICAS DE DETECÇÃO

### 1. Codebase Search

```python
def validate_existence(name: str, type: str) -> ValidationResult:
    """
    Busca real no codebase antes de assumir existência.
    """
    # Buscar em múltiplos lugares
    results = {
        'definition': grep(f"{type} {name}"),
        'usage': grep(f"{name}("),
        'exports': grep(f"export.*{name}"),
        'imports': grep(f"import.*{name}")
    }
    
    if not any(results.values()):
        return ValidationResult(
            valid=False,
            error=f"{type} '{name}' não encontrado no codebase",
            suggestion="Verificar nome ou criar implementação"
        )
    
    return ValidationResult(valid=True, locations=results)
```

### 2. Schema Validation

```yaml
validation_layers:
  layer_1_syntax:
    - file_exists: true
    - parseable: true
    - no_syntax_errors: true
    
  layer_2_semantic:
    - references_valid: true
    - types_compatible: true
    - exports_exist: true
    
  layer_3_runtime:
    - imports_resolve: true
    - no_circular_deps: true
    - tests_pass: true
```

### 3. Cross-Reference Validation

```
Validação Cruzada:

Asserção: "API /api/users existe"

Verificação:
✅ routes.ts:42 define GET /api/users
✅ controllers/user.ts:15 implementa handler
✅ tests/api/users.test.ts:8 testa endpoint
✅ swagger/docs.yml:120 documenta endpoint
✅ frontend/services/api.ts:25 consome endpoint

Conclusão: Endpoint CONFIRMADO em múltiplas fontes
```

---

## PATTERNS DE ALUCINAÇÃO COMUM

### Pattern 1: "Provavelmente existe"

```
❌ ERRADO:
"Vou usar o utilitário formatDate que provavelmente existe"

✅ CERTO:
"Procurando formatDate no codebase...
 Encontrado em utils/date.ts:12
 Confirmando assinatura: (date: Date, format?: string) => string
```

### Pattern 2: "Normalmente é assim"

```
❌ ERRADO:
"Normalmente projetos Next.js usam src/app, então..."

✅ CERTO:
"Verificando estrutura real do projeto...
 Estrutura detectada: app/ (no src/)
 Padrão: Next.js 14 App Router
```

### Pattern 3: "Deve ter uma função para isso"

```
❌ ERRADO:
"Deve ter um middleware de auth, vou usar authenticateUser"

✅ CERTO:
"Buscando middleware de auth...
 Encontrado: middleware/auth.ts
 Exporta: requireAuth, optionalAuth, validateToken
 Usando: requireAuth (detectado uso em routes.ts)
```

### Pattern 4: "Seguindo a convenção"

```
❌ ERRADO:
"Seguindo a convenção REST, vou criar PUT /api/users/bulk-update"

✅ CERTO:
"Analisando padrões de API existentes...
 Padrão detectado: POST para operações, PUT para updates individuais
 Usando: POST /api/users/bulk (segue padrão de /api/orders/bulk)"
```

---

## SISTEMA DE ALERTAS

### Alertas de Possível Alucinação

```
🟡 SUSPEITA: Função não encontrada em codebase
   "validateSSN" não existe em utils/
   Ações: Buscar alternativas ou criar

🟡 SUSPEITA: Endpoint não documentado
   "DELETE /api/users" não encontrado em routes
   Ações: Verificar se deve existir

🔴 BLOQUEADO: Asserção sem validação
   Tentativa de usar "process.env.SECRET_KEY"
   sem verificar .env.example
   Ações: Validar obrigatória

🔴 BLOQUEADO: Schema inexistente
   Referência a "UserSettings" não encontrada
   em schema.prisma ou types/
   Ações: Criar schema ou corrigir referência
```

---

## RECUPERAÇÃO DE ALUCINAÇÃO

### Se Alucinação for Detectada

```yaml
recovery_protocol:
  detection:
    - identify_hallucinated_item: "O que foi inventado?"
    - assess_impact: "Quanto código foi afetado?"
    - stop_propagation: "Não usar como base para mais código"
    
  correction:
    - search_real_implementation: "Encontrar o que realmente existe"
    - validate_real_alternative: "Confirmar alternativa válida"
    - replace_with_valid: "Substituir código alucinado"
    - verify_correction: "Garantir que está correto"
    
  prevention:
    - document_lesson: "Notar o que causou"
    - update_validation: "Melhorar detecção"
    - add_to_checklist: "Incluir em protocolo"
```

---

## INTEGRAÇÃO COM WORKFLOWS

### Pre-Validation Hook

```yaml
workflow:
  before_code_generation:
    - scan_for_assertions: "Identificar todas as asserções"
    - validate_assertions: "Verificar cada uma contra codebase"
    - flag_unvalidated: "Marcar não validadas"
    - require_confirmation: "Pedir confirmação se >0 unvalidated"
```

### Generation Guardrails

```python
def generate_code_with_validation(task):
    # Fase 1: Identificar necessidades
    requirements = analyze_task(task)
    
    # Fase 2: Validar existência
    for req in requirements:
        if not validate_exists(req):
            if req.critical:
                raise ValidationError(f"{req.name} não encontrado")
            else:
                req.mark_for_creation()
    
    # Fase 3: Gerar apenas com itens validados
    return generate(resolved_requirements)
```

---

## MÉTRICAS DE QUALIDADE

### KPIs Anti-Hallucination

| Métrica | Target | Descrição |
|---------|--------|-----------|
| Assertion Accuracy | >98% | Asserções que correspondem à realidade |
| Validation Rate | 100% | Código gerado com validação prévia |
| Correction Time | <30s | Tempo para corrigir alucinação detectada |
| False Positives | <2% | Alertas incorretos de alucinação |

---

## RESUMO

**Princípios Fundamentais**:

1. 🔍 **Valide Primeiro**: Nunca assuma, sempre verifique
2. 📍 **Cite Localizações**: "Arquivo.ts:linha" é obrigatório
3. 🔄 **Cruze Fontes**: Múltiplas confirmações são melhores
4. ⏱️ **Atualizado**: Verifique se informação é current
5. 🚫 **Não Suponha**: "Provavelmente" não é bom o suficiente
6. ✅ **Confirme**: Cada asserção deve ter evidência
7. 📝 **Documente**: Registre validações realizadas

**Checklist Mental**:
```
Antes de usar qualquer código/endpoint/função:
□ Já vi isso no codebase real?
□ Posso apontar o arquivo e linha?
□ Já cruzei com outras fontes?
□ Está atualizado (não descontinuado)?
□ Não estou confundindo com outro projeto?
```

**Resultado**: Código 100% baseado em realidade, zero alucinações.
