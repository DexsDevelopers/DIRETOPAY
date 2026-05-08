# GIT STRATEGY — Credit Saver Pro Enterprise

## Estratégia de Versionamento e Controle de Código

---

## VISÃO GERAL

Estratégia de Git otimizada para economia de tokens, clareza operacional e segurança em todas as operações.

---

## FLUXO DE BRANCHES

### Estrutura Principal

```
main (produção)
├── develop (integração)
│   ├── feature/user-auth
│   ├── feature/payment-pix
│   └── feature/dashboard-v2
├── hotfix/critical-bug
└── release/v1.2.0
```

### Tipos de Branch

```yaml
branch_types:
  main:
    purpose: "Código em produção"
    protection: "Nenhum push direto"
    merge: "Apenas via PR aprovado"
    
  develop:
    purpose: "Integração de features"
    protection: "Nenhum push direto"
    merge: "Via PR"
    
  feature/*:
    purpose: "Desenvolvimento de features"
    origin: "develop"
    merge_target: "develop"
    naming: "feature/{task-id}-{description}"
    
  hotfix/*:
    purpose: "Correções críticas em produção"
    origin: "main"
    merge_target: "main + develop"
    naming: "hotfix/{critical-description}"
    
  release/*:
    purpose: "Preparação de release"
    origin: "develop"
    merge_target: "main"
    naming: "release/v{semver}"
```

---

## CONVENÇÃO DE COMMITS

### Formato

```
<{level}> {tipo}: {descrição}

{corpo opcional}

{footer opcional}
```

### Níveis de Commit

```yaml
commit_levels:
  [low]:
    use: "CSS, text, ajustes triviais"
    examples:
      - "[low] style: ajusta cor do header"
      - "[low] docs: atualiza comentário"
      
  [medium]:
    use: "CRUD, APIs, componentes"
    examples:
      - "[medium] feat: adiciona endpoint de usuários"
      - "[medium] fix: corrige validação de email"
      
  [high]:
    use: "Pagamentos, auth, database"
    examples:
      - "[high] feat: implementa webhook PIX"
      - "[high] fix: corrige validação JWT"
      
  [critical]:
    use: "Migrations, deploy, core system"
    examples:
      - "[critical] db: migration de transações"
      - "[critical] deploy: release v2.0.0"
```

### Tipos de Commit

```yaml
commit_types:
  feat: "Nova funcionalidade"
  fix: "Correção de bug"
  docs: "Documentação"
  style: "Formatação, semântica não muda"
  refactor: "Refatoração de código"
  perf: "Melhoria de performance"
  test: "Testes"
  chore: "Build, config, etc"
  security: "Segurança"
  db: "Database/Migrations"
```

### Exemplos

```bash
# LOW
[low] style: ajusta spacing no header
[low] docs: adiciona JSDoc ao utils

# MEDIUM
[medium] feat: implementa paginação em user list
[medium] fix: corrige memory leak no useEffect
[medium] refactor: extrai validação para utils

# HIGH
[high] feat: adiciona validação de assinatura PIX
[high] security: atualiza dependências críticas
[high] fix: corrige race condition em pagamentos

# CRITICAL
[critical] db: migration adiciona índice em transactions
[critical] deploy: configura novo worker de filas
[critical] fix: corrige cálculo de saldo (hotfix)
```

---

## POLÍTICA DE PULL REQUESTS

### Requisitos por Nível

```yaml
pr_requirements:
  low:
    description: "Mínima"
    tests: "Opcional"
    reviewers: "1"
    time: "Pode mergear imediatamente"
    
  medium:
    description: "Completa"
    tests: "Obrigatório"
    reviewers: "1"
    ci: "Deve passar"
    
  high:
    description: "Detalhada"
    template: "Obrigatório"
    tests: "Obrigatório, >80%"
    reviewers: "2 (1 senior)"
    security: "Review se tocar auth/payment"
    
  critical:
    description: "Extensiva"
    template: "Obrigatório completo"
    tests: "Obrigatório, >90%"
    reviewers: "2 seniors"
    security: "Obrigatório"
    qa: "Sign-off obrigatório"
    load_test: "Recomendado"
```

### Template de PR

```markdown
## [LEVEL]: Descrição

### Tipo de Mudança
- [ ] Feature
- [ ] Bugfix
- [ ] Refactor
- [ ] Database
- [ ] Security

### Checklist
- [ ] Código segue padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Não há secrets no código
- [ ] Performance avaliada

### Para HIGH/CRITICAL
- [ ] Análise de impacto completa
- [ ] Rollback plan documentado
- [ ] Breaking changes listados
- [ ] Stakeholders notificados

### Testing
- [ ] Unit tests: [X/Y passando]
- [ ] Integration tests: [X/Y passando]
- [ ] E2E tests: [X/Y passando]
- [ ] Manual testing: [descrever]

### Risk Assessment
- **Impacto**: [LOW/MEDIUM/HIGH/CRITICAL]
- **Risco**: [LOW/MEDIUM/HIGH]
- **Rollback**: [Fácil/Médio/Complexo]
```

---

## ESTRATÉGIA DE MERGE

### Métodos de Merge

```yaml
merge_strategies:
  squash:
    use_for: "feature branches"
    command: "git merge --squash"
    result: "1 commit limpo"
    
  rebase:
    use_for: "manter história linear"
    command: "git rebase main"
    when: "antes de merge"
    
  merge_commit:
    use_for: "hotfixes, releases"
    preserves: "história completa"
    traceability: "manter referência à branch"
```

### Quando Usar Cada Um

```bash
# Feature para develop: Squash
feature/payment-pix ──► develop
(commits intermediários squashed)

# Hotfix para main: Merge commit
hotfix/critical-bug ──► main
(preserva história de emergência)

# Release: Merge commit
release/v2.0.0 ──► main
(tag + merge commit)
```

---

## CONVENÇÕES DE CÓDIGO

### Pre-Commit Hooks

```yaml
pre_commit:
  lint:
    tool: "eslint/prettier"
    fix: "auto"
    block: "se não passar"
    
  type_check:
    tool: "tsc --noEmit"
    block: "se houver erros"
    
  test:
    scope: "relacionados ao commit"
    block: "se falhar"
    
  security:
    secrets: "detect-secrets"
    block: "se detectado"
```

### CI/CD Gates

```yaml
ci_gates:
  on_pr:
    - lint: "obrigatório"
    - type_check: "obrigatório"
    - unit_tests: "obrigatório"
    - integration_tests: "obrigatório para MEDIUM+"
    - security_scan: "obrigatório"
    - build: "obrigatório"
    
  on_merge:
    - full_test_suite: "obrigatório"
    - e2e_tests: "obrigatório para HIGH+"
    - performance_baseline: "não degradar"
```

---

## VERSIONAMENTO SEMÂNTICO

### Formato

```
v{MAJOR}.{MINOR}.{PATCH}-{prerelease}

Exemplos:
v1.0.0
v1.2.3
v2.0.0-beta.1
v2.1.0-hotfix.1
```

### Regras

```yaml
versioning:
  major:
    when: "breaking changes"
    approval: "product + tech lead"
    examples:
      - "API v1 → v2"
      - "Mudança de arquitetura"
      - "Remoção de features"
      
  minor:
    when: "features novas, backward compatible"
    examples:
      - "Nova funcionalidade"
      - "Novos endpoints"
      - "Melhorias significativas"
      
  patch:
    when: "bugfixes, sem breaking changes"
    examples:
      - "Correção de bug"
      - "Security patch"
      - "Performance fix"
```

---

## ECONOMIA DE TOKENS EM GIT

### Commits Eficientes

```bash
# ❌ Proibido: Commits granulares demais
[low] style: ajusta espaço
[low] style: ajusta outro espaço
[low] style: ajusta cor

# ✅ Obrigatório: Commits lógicos
[low] style: ajusta header (spacing + color)
```

### Descrições Concisas

```bash
# ❌ Proibido: Verbose
[medium] feat: implementa sistema de autenticação 
com JWT, bcrypt, refresh tokens, roles e 
permissões granulares usando RBAC

# ✅ Obrigatório: Direto
[medium] feat: implementa auth com JWT e RBAC
```

### Branches Limpos

```bash
# ❌ Proibido: Branches antigas
main
├── develop
├── feature/old-attempt (3 meses)
├── fix/tried-and-failed (2 meses)
└── experiment/abandoned (1 mês)

# ✅ Obrigatório: Branches ativas apenas
main
├── develop
├── feature/current-work
└── hotfix/urgent-fix
```

---

## RECUPERAÇÃO E ROLLBACK

### Estratégias

```yaml
rollback_strategies:
  code:
    command: "git revert {commit}"
    use: "manter história, desfazer mudança"
    
  merge:
    command: "git revert -m 1 {merge_commit}"
    use: "reverter merge completo"
    
  hard_reset:
    command: "git reset --hard {commit}"
    use: "APENAS branches pessoais"
    warning: "DESTRUTIVO"
    
  cherry_pick:
    command: "git cherry-pick {commit}"
    use: "aplicar commit específico"
```

### Hotfix Workflow

```bash
# 1. Criar hotfix a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. Fazer correção mínima
# ... edit ...
git add .
git commit -m "[critical] fix: corrige {descrição}"

# 3. PR direto para main (bypass develop)
# Requer 2 aprovadores

# 4. Depois, backport para develop
git checkout develop
git merge hotfix/critical-fix
```

---

## RESUMO

**Princípios Fundamentais**:

1. 🎯 **Commits lógicos**: 1 commit = 1 mudança lógica
2. 📝 **Mensagens claras**: Descrição direta, nível indicado
3. 🔄 **Processo consistente**: Mesmo fluxo para todos
4. ✅ **Qualidade garantida**: CI gates em todos os níveis
5. 🛡️ **Segurança**: Nunca comprometer proteções
6. 📊 **Rastreabilidade**: História limpa e útil
7. ⚡ **Eficiência**: Sem burocracia desnecessária para LOW

**Nunca**:
- Commitar direto em main/develop
- Ignorar falhas de CI
- Commitar secrets
- Fazer commits de WIP (work in progress)
- Deixar branches órfãs

**Sempre**:
- Testar antes de commitar
- Revisar código de outros
- Manter história limpa
- Documentar breaking changes
- Sincronizar frequentemente
