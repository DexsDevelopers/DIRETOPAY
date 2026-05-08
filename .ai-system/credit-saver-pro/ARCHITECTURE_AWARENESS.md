# ARCHITECTURE AWARENESS

## Consciência Arquitetural — Credit Saver Pro Enterprise

---

## VISÃO GERAL

O sistema detecta e respeita automaticamente a arquitetura existente, garantindo que todas as alterações sejam consistentes com padrões estabelecidos.

---

## DETECÇÃO AUTOMÁTICA

### Stack Detection

```typescript
interface StackDetection {
  frontend?: {
    framework: 'react' | 'vue' | 'angular' | 'svelte' | 'other';
    metaFramework?: 'next' | 'nuxt' | 'remix' | 'none';
    styling: 'tailwind' | 'css-modules' | 'styled' | 'sass' | 'other';
    state: 'redux' | 'zustand' | 'context' | 'none';
    query: 'react-query' | 'swr' | 'apollo' | 'none';
  };
  
  backend?: {
    runtime: 'node' | 'deno' | 'bun';
    framework: 'express' | 'fastify' | 'nest' | 'koa' | 'hono' | 'other';
    orm: 'prisma' | 'typeorm' | 'mongoose' | 'drizzle' | 'raw';
    auth: 'jwt' | 'session' | 'oauth' | 'custom';
  };
  
  database?: {
    type: 'sql' | 'nosql' | 'graph';
    provider: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'other';
    migrationTool?: 'prisma' | 'typeorm' | 'flyway' | 'liquibase' | 'raw';
  };
  
  infrastructure?: {
    deployment: 'docker' | 'k8s' | 'serverless' | 'vm';
    cicd: 'github-actions' | 'gitlab-ci' | 'circleci' | 'jenkins' | 'other';
    cloud?: 'aws' | 'gcp' | 'azure' | 'other';
  };
}

async function detectStack(projectPath: string): Promise<StackDetection> {
  const detection: StackDetection = {};
  
  // Detectar package.json
  const packageJson = await readFile(`${projectPath}/package.json`);
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Frontend
  if (deps.react) {
    detection.frontend = {
      framework: 'react',
      metaFramework: deps.next ? 'next' : 'none',
      styling: detectStyling(deps),
      state: detectState(deps),
      query: detectQuery(deps)
    };
  }
  
  // Backend
  if (deps.express || deps['@nestjs/core'] || deps.fastify) {
    detection.backend = {
      runtime: 'node',
      framework: detectBackendFramework(deps),
      orm: detectORM(deps),
      auth: detectAuth(deps)
    };
  }
  
  // Database
  detection.database = await detectDatabase(projectPath, deps);
  
  // Infrastructure
  detection.infrastructure = detectInfrastructure(projectPath);
  
  return detection;
}
```

### Pattern Detection

```typescript
interface ArchitecturePatterns {
  structural: {
    pattern: 'mvc' | 'mvvm' | 'layered' | 'hexagonal' | 'clean' | 'modular';
    confidence: number;
  };
  
  design: {
    repository: boolean;
    service: boolean;
    factory: boolean;
    singleton: boolean;
    dependencyInjection: boolean;
  };
  
  naming: {
    convention: 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case';
    filePattern: string;
    componentNaming: string;
  };
}

function detectPatterns(files: string[], content: string[]): ArchitecturePatterns {
  const patterns: ArchitecturePatterns = {
    structural: detectStructuralPattern(files),
    design: detectDesignPatterns(content),
    naming: detectNamingConvention(files, content)
  };
  
  return patterns;
}
```

---

## RESPEITO AOS PADRÕES

### Convenções de Nomenclatura

```typescript
// Detectar e seguir convenção existente
function generateFileName(
  purpose: string,
  type: 'component' | 'hook' | 'service' | 'util',
  existingConvention: NamingConvention
): string {
  switch (existingConvention.style) {
    case 'PascalCase':
      return `${toPascalCase(purpose)}${toPascalCase(type)}.tsx`;
    case 'camelCase':
      return `${toCamelCase(purpose)}.${type}.ts`;
    case 'kebab-case':
      return `${toKebabCase(purpose)}-${type}.ts`;
    case 'snake_case':
      return `${toSnakeCase(purpose)}_${type}.ts`;
  }
}

// Exemplos de saída baseados em convenção detectada:
// PascalCase: UserProfile.tsx, useAuth.ts
// camelCase: userProfile.tsx, useAuth.ts
// kebab-case: user-profile.tsx, use-auth.ts
// snake_case: user_profile.tsx, use_auth.ts
```

### Estrutura de Pastas

```typescript
interface FolderStructure {
  root: string;
  source: string;
  components?: string;
  services?: string;
  utils?: string;
  types?: string;
  tests?: string;
}

function detectFolderStructure(projectPath: string): FolderStructure {
  // Detectar estrutura real do projeto
  const structure: FolderStructure = {
    root: projectPath,
    source: detectSourceFolder(projectPath),
    components: findFolder(projectPath, ['components', 'ui', 'views']),
    services: findFolder(projectPath, ['services', 'api', 'lib']),
    utils: findFolder(projectPath, ['utils', 'helpers', 'tools']),
    types: findFolder(projectPath, ['types', 'interfaces', 'models']),
    tests: findFolder(projectPath, ['tests', '__tests__', 'spec'])
  };
  
  return structure;
}

function placeNewFile(
  fileType: string,
  filePurpose: string,
  structure: FolderStructure
): string {
  // Colocar arquivo no local correto baseado na estrutura existente
  const targetFolder = determineTargetFolder(fileType, structure);
  return `${targetFolder}/${generateFileName(filePurpose, fileType)}`;
}
```

---

## ADAPTAÇÃO DE CÓDIGO

### Estilo de Código

```typescript
interface CodeStyle {
  indentation: 'tab' | 2 | 4;
  quotes: 'single' | 'double';
  semicolons: boolean;
  trailingComma: 'none' | 'es5' | 'all';
  maxLineLength: number;
  importOrder: string[];
}

function detectCodeStyle(files: string[]): CodeStyle {
  const style: CodeStyle = {
    indentation: detectIndentation(files),
    quotes: detectQuoteStyle(files),
    semicolons: detectSemicolonUsage(files),
    trailingComma: detectTrailingComma(files),
    maxLineLength: detectLineLength(files),
    importOrder: detectImportOrder(files)
  };
  
  return style;
}

function adaptToCodeStyle(code: string, style: CodeStyle): string {
  // Aplicar estilo detectado ao novo código
  let adapted = code;
  
  // Indentação
  adapted = applyIndentation(adapted, style.indentation);
  
  // Aspas
  adapted = applyQuoteStyle(adapted, style.quotes);
  
  // Ponto e vírgula
  adapted = applySemicolons(adapted, style.semicolons);
  
  // Trailing commas
  adapted = applyTrailingCommas(adapted, style.trailingComma);
  
  return adapted;
}
```

### Padrões de Implementação

```typescript
// Detectar e seguir padrão de Error Handling
function detectErrorHandlingPattern(files: string[]): ErrorPattern {
  const content = readFiles(files);
  
  if (content.includes('try {') && content.includes('} catch')) {
    return 'try-catch';
  }
  
  if (content.includes('Result<') || content.includes('Either<')) {
    return 'functional';
  }
  
  if (content.includes('throw new AppError')) {
    return 'custom-error';
  }
  
  return 'unknown';
}

// Gerar código seguindo padrão detectado
function generateErrorHandling(
  operation: string,
  pattern: ErrorPattern
): string {
  switch (pattern) {
    case 'try-catch':
      return `
        try {
          ${operation}
        } catch (error) {
          logger.error('Operation failed', error);
          throw error;
        }
      `;
      
    case 'functional':
      return `
        const result = ${operation};
        if (result.isErr()) {
          return err(result.error);
        }
        return ok(result.value);
      `;
      
    case 'custom-error':
      return `
        try {
          ${operation}
        } catch (error) {
          throw new AppError('OPERATION_FAILED', error.message);
        }
      `;
  }
}
```

---

## DETECÇÃO DE ARQUITETURA

### Monorepo Detection

```typescript
interface MonorepoConfig {
  tool: 'turborepo' | 'nx' | 'lerna' | 'pnpm-workspace' | 'none';
  packages: string[];
  apps: string[];
  sharedPackages: string[];
}

function detectMonorepo(projectPath: string): MonorepoConfig | null {
  // Verificar turborepo
  if (exists(`${projectPath}/turbo.json`)) {
    return parseTurborepo(projectPath);
  }
  
  // Verificar nx
  if (exists(`${projectPath}/nx.json`)) {
    return parseNx(projectPath);
  }
  
  // Verificar pnpm workspace
  if (exists(`${projectPath}/pnpm-workspace.yaml`)) {
    return parsePnpmWorkspace(projectPath);
  }
  
  return null;
}
```

### Module Boundaries

```typescript
interface ModuleBoundaries {
  domains: string[];
  dependencies: Map<string, string[]>;
  sharedModules: string[];
  entryPoints: string[];
}

function analyzeModuleBoundaries(projectPath: string): ModuleBoundaries {
  // Analisar imports/exports para entender fronteiras
  const imports = extractAllImports(projectPath);
  const exports = extractAllExports(projectPath);
  
  return {
    domains: identifyDomains(imports, exports),
    dependencies: buildDependencyGraph(imports),
    sharedModules: identifySharedModules(imports),
    entryPoints: identifyEntryPoints(exports)
  };
}
```

---

## CONSISTÊNCIA ARQUITETURAL

### Checklist de Conformidade

```yaml
architectural_compliance:
  before_creating_file:
    - detect_existing_pattern: true
    - follow_naming_convention: true
    - place_in_correct_folder: true
    - use_existing_abstractions: true
    
  before_writing_code:
    - follow_error_handling_pattern: true
    - use_existing_types: true
    - import_from_correct_locations: true
    - follow_component_pattern: true
    
  before_modifying:
    - preserve_existing_patterns: true
    - maintain_consistency: true
    - dont_break_abstractions: true
```

### Validação

```typescript
interface ValidationResult {
  compliant: boolean;
  violations: string[];
  suggestions: string[];
}

function validateArchitecturalCompliance(
  code: string,
  architecture: ArchitecturePatterns,
  filePath: string
): ValidationResult {
  const violations: string[] = [];
  const suggestions: string[] = [];
  
  // Validar convenções de nomenclatura
  if (!matchesNamingConvention(filePath, architecture.naming)) {
    violations.push('File name does not match project convention');
    suggestions.push(`Use ${architecture.naming.convention} convention`);
  }
  
  // Validar estrutura
  if (!followsFolderStructure(filePath, architecture)) {
    violations.push('File not in correct location');
    suggestions.push(`Place in ${suggestCorrectFolder(filePath, architecture)}`);
  }
  
  // Validar padrões
  if (!followsDesignPatterns(code, architecture.design)) {
    violations.push('Code does not follow project patterns');
    suggestions.push('Use existing service/repository pattern');
  }
  
  return {
    compliant: violations.length === 0,
    violations,
    suggestions
  };
}
```

---

## RESUMO

**Architecture Awareness = Código Nativo**

- 🔍 **Detecta**: Stack, padrões, convenções
- 📋 **Registra**: Como o projeto é estruturado
- 🎯 **Segue**: Nunca impõe, sempre adapta
- ✅ **Valida**: Conformidade arquitetural

**Resultado**: Código que parece escrito pelo time original.
