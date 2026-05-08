# BACKEND RULES — Credit Saver Pro Enterprise

## Regras Específicas para Desenvolvimento Backend

---

## PRINCÍPIOS FUNDAMENTAIS

### 1. SEPARAÇÃO DE RESPONSABILIDADES

```typescript
// ✅ CORRETO: Responsabilidades claras
// routes.ts - Apenas roteamento
app.post('/api/users', validate(createUserSchema), userController.create);

// controller.ts - Apenas orquestração HTTP
export const userController = {
  create: async (req: Request, res: Response) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  }
};

// service.ts - Lógica de negócio
export const userService = {
  create: async (data: CreateUserInput) => {
    await validateUserData(data);
    const hashedPassword = await hashPassword(data.password);
    return userRepository.create({ ...data, password: hashedPassword });
  }
};

// repository.ts - Acesso a dados
export const userRepository = {
  create: (data: CreateUserInput) => {
    return prisma.user.create({ data });
  }
};

// ❌ ERRADO: Tudo em um lugar
app.post('/api/users', async (req, res) => {
  // Validação aqui
  // Lógica de negócio aqui
  // Acesso a dados aqui
  // Hash de senha aqui
  // Resposta aqui
  // ... 200 linhas
});
```

### 2. VALIDAÇÃO DE ENTRADA

```typescript
// ✅ CORRETO: Validação completa
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  role: z.enum(['user', 'admin']).default('user'),
});

// ❌ ERRADO: Sem validação ou validação fraca
app.post('/api/users', async (req, res) => {
  const { email, password } = req.body; // ❌ Sem validação
  // ...
});
```

---

## REGRAS DE API

### RESTful Design

```typescript
// ✅ CORRETO: RESTful consistente
// Listar
GET /api/users?page=1&limit=20
// Buscar
GET /api/users/:id
// Criar
POST /api/users
// Atualizar
PUT /api/users/:id      // Completo
PATCH /api/users/:id    // Parcial
// Deletar
DELETE /api/users/:id

// ❌ ERRADO: Inconsistente
GET /api/getUsers           // ❌ Verbo no path
GET /api/users/get/:id      // ❌ Verbo no path
POST /api/createUser        // ❌ Verbo + singular
POST /api/users/:id/update  // ❌ Verbo no path
```

### Respostas Padronizadas

```typescript
// ✅ CORRETO: Estrutura consistente
// Sucesso
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Lista
{
  "data": [{ ... }, { ... }],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Erro
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido",
    "details": [...]
  }
}

// ❌ ERRADO: Inconsistente
{ "user": { ... } }                    // ❌ Sem wrapper
{ "result": "success", "data": ... }   // ❌ Desnecessário
{ "status": 200, "body": ... }         // ❌ Redundante
```

### HTTP Status Codes

```typescript
// ✅ CORRETO: Status apropriados
200 OK           // GET sucesso
201 Created      // POST sucesso
204 No Content   // DELETE sucesso

400 Bad Request           // Dados inválidos
401 Unauthorized          // Não autenticado
403 Forbidden             // Sem permissão
404 Not Found             // Recurso não existe
409 Conflict              // Conflito (ex: email duplicado)
422 Unprocessable Entity  // Semântica inválida

500 Internal Server Error // Erro não esperado
502 Bad Gateway           // Erro upstream
503 Service Unavailable   // Manutenção/sobrecarga
```

---

## REGRAS DE SEGURANÇA

### Autenticação

```typescript
// ✅ CORRETO: JWT seguro
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ CORRETO: Proteção de rotas
app.get('/api/admin/users', 
  authMiddleware,           // Autenticação
  requireRole('admin'),     // Autorização
  userController.list
);
```

### Rate Limiting

```typescript
// ✅ CORRETO: Rate limiting por endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,                     // 5 tentativas
  message: 'Muitas tentativas de login'
});

app.post('/api/auth/login', loginLimiter, authController.login);
```

### Sanitização

```typescript
// ✅ CORRETO: Prevenir injeção
// SQL Injection - Usar ORM/parametrizado
prisma.user.findMany({ where: { email } });  // ✅ Seguro

// NoSQL Injection - Validar schemas
const userId = z.string().uuid().parse(req.params.id);  // ✅ Validado

// XSS - Sanitizar output
const sanitized = DOMPurify.sanitize(userInput);  // ✅ Sanitizado
```

---

## REGRAS DE ERROR HANDLING

### Estrutura de Erros

```typescript
// ✅ CORRETO: Erros customizados
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
  }
}

// Uso
throw new AppError(
  'USER_NOT_FOUND',
  'Usuário não encontrado',
  404
);

// Handler global
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }
  
  // Log erro não tratado
  logger.error('Unhandled error', error);
  
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    }
  });
});
```

### Logging

```typescript
// ✅ CORRETO: Logging estruturado
logger.info('User created', {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

logger.error('Payment failed', {
  error: error.message,
  userId,
  amount,
  gateway: 'stripe',
  stack: error.stack
});
```

---

## REGRAS DE PERFORMANCE

### Database

```typescript
// ✅ CORRETO: Queries otimizadas
// Selecionar apenas campos necessários
prisma.user.findMany({
  select: { id: true, name: true, email: true },
  where: { active: true },
  take: 20,
  skip: (page - 1) * 20
});

// ✅ CORRETO: Índices
// schema.prisma
model User {
  id    String @id @default(uuid())
  email String @unique  // Índice implícito
  
  @@index([createdAt])  // Índice explícito
}

// ✅ CORRETO: N+1 prevention
const users = await prisma.user.findMany();
// ❌ N+1: users.map(u => loadOrders(u.id))

// ✅ Include/Batch loading
const users = await prisma.user.findMany({
  include: { orders: true }
});
```

### Caching

```typescript
// ✅ CORRETO: Cache estratégico
const getUser = async (id: string) => {
  // Cache read
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  // Cache miss
  const user = await userRepository.findById(id);
  await redis.setex(`user:${id}`, 300, JSON.stringify(user));
  
  return user;
};

// ✅ CORRETO: Cache invalidation
const updateUser = async (id: string, data: UpdateUserInput) => {
  const user = await userRepository.update(id, data);
  await redis.del(`user:${id}`);  // Invalidar cache
  return user;
};
```

---

## REGRAS DE TESTES

### Estrutura de Testes

```typescript
// ✅ CORRETO: Testes organizados
describe('UserService', () => {
  describe('create', () => {
    it('should create user with hashed password', async () => {
      // Arrange
      const data = { email: 'test@test.com', password: 'password123' };
      
      // Act
      const user = await userService.create(data);
      
      // Assert
      expect(user.email).toBe(data.email);
      expect(user.password).not.toBe(data.password);  // Hashed
    });
    
    it('should throw if email already exists', async () => {
      // ...
    });
  });
});
```

### Mocking

```typescript
// ✅ CORRETO: Mocks apropriados
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined)
}));

// ✅ CORRETO: Database isolado
describe('User API', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });
  
  it('should create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@test.com', password: 'pass123' });
    
    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('test@test.com');
  });
});
```

---

## ANTI-PATTERNS PROIBIDOS

```typescript
// ❌ Evitar: Lógica no controller
controller.create = async (req, res) => {
  // Validação
  // Lógica de negócio
  // Acesso a dados
  // Tudo aqui
};

// ❌ Evitar: Exposição de dados sensíveis
return res.json({
  id: user.id,
  email: user.email,
  password: user.password,  // ❌ Nunca!
  ssn: user.ssn             // ❌ Nunca!
});

// ❌ Evitar: Erros genéricos
try {
  // ...
} catch (error) {
  return res.status(500).json({ error: 'Error' });  // ❌ Sem detalhes
}

// ❌ Evitar: Queries N+1
const users = await db.users.findAll();
for (const user of users) {
  user.orders = await db.orders.find({ userId: user.id });  // ❌ N+1
}

// ❌ Evitar: Sem rate limiting
app.post('/api/login', async (req, res) => {
  // ❌ Vulnerável a brute force
});
```

---

## RESUMO

**Princípios Backend**:

1. 🏗️ **Arquitetura**: Separação clara de responsabilidades
2. 🔒 **Segurança**: Zero confiança, validação completa
3. 📊 **API**: RESTful, consistente, bem documentada
4. 🛡️ **Erros**: Handling completo, logging estruturado
5. ⚡ **Performance**: Queries otimizadas, caching estratégico
6. ✅ **Testes**: Cobertura alta, testes de integração
7. 📝 **Tipos**: TypeScript estrito em toda a stack
