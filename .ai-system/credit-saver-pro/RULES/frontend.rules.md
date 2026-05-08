# FRONTEND RULES — Credit Saver Pro Enterprise

## Regras Específicas para Desenvolvimento Frontend

---

## PRINCÍPIOS FUNDAMENTAIS

### 1. COMPONENTES FOCADOS

```typescript
// ✅ CORRETO: Componente com responsabilidade única
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  
  if (!user) return <Skeleton />;
  
  return (
    <Card>
      <Avatar src={user.avatar} />
      <Name>{user.name}</Name>
      <Email>{user.email}</Email>
    </Card>
  );
}

// ❌ ERRADO: Componente com múltiplas responsabilidades
function UserProfile({ userId }) {
  const { data: user } = useUser(userId);
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  
  // Lógica de fetch de orders aqui
  // Lógica de navegação aqui
  // Form de edição aqui
  // ... 200 linhas
}
```

### 2. HOOKS COESOS

```typescript
// ✅ CORRETO: Hook com propósito claro
function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000,
  });
}

// ❌ ERRADO: Hook fazendo tudo
function useUserData(userId) {
  const user = useQuery(...);
  const orders = useQuery(...);
  const preferences = useQuery(...);
  const updateUser = useMutation(...);
  const deleteUser = useMutation(...);
  // ... muitas responsabilidades
}
```

---

## REGRAS DE COMPONENTES

### Props Interface

```typescript
// ✅ CORRETO: Props bem definidas
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ❌ ERRADO: Props vagas ou excessive
interface ButtonProps {
  config: any;  // Evitar any
  options: object;  // Muito vago
  ...rest: any;  // Evitar spread sem necessidade
}
```

### Composição sobre Props

```typescript
// ✅ CORRETO: Composição flexível
function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border', className)}>
      {children}
    </div>
  );
}

// Uso
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>

// ❌ ERRADO: Muitas props condicionais
function Card({ 
  title, showHeader, headerContent, 
  body, showFooter, footerContent,
  variant, size, theme 
}) {
  // Componente complexo e inflexível
}
```

---

## REGRAS DE ESTILO

### CSS-in-JS / Tailwind

```typescript
// ✅ CORRETO: Tailwind com cn() utility
import { cn } from '@/lib/utils';

function Button({ 
  variant = 'primary', 
  className,
  children 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded font-medium',
        'focus:outline-none focus:ring-2',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
    >
      {children}
    </button>
  );
}

// ❌ ERRADO: Classes dinâmicas complexas
function Button({ variant }) {
  const className = `
    btn 
    ${variant === 'primary' ? 'btn-primary' : ''}
    ${variant === 'secondary' ? 'btn-secondary' : ''}
    ${isLoading ? 'btn-loading' : ''}
    ${disabled ? 'btn-disabled' : ''}
  `;
  // Difícil de manter, não type-safe
}
```

### Responsividade

```typescript
// ✅ CORRETO: Mobile-first
function Layout() {
  return (
    <div className="
      grid 
      grid-cols-1        /* Mobile */
      md:grid-cols-2     /* Tablet */
      lg:grid-cols-3     /* Desktop */
      xl:grid-cols-4     /* Large */
    ">
      {...}
    </div>
  );
}
```

---

## REGRAS DE PERFORMANCE

### Memoização Adequada

```typescript
// ✅ CORRETO: Memo quando necessário
const ExpensiveComponent = memo(function ExpensiveComponent({ 
  data,
  onUpdate 
}: Props) {
  // Componente que renderiza frequentemente
  // com props estáveis
  return <div>{/* ... */}</div>;
});

// ✅ CORRETO: useMemo para cálculos
function DataTable({ rows }: { rows: Row[] }) {
  const processedData = useMemo(() => {
    return rows.map(processRow);
  }, [rows]);
  
  return <Table data={processedData} />;
}

// ✅ CORRETO: useCallback para handlers
function Form() {
  const [values, setValues] = useState({});
  
  const handleSubmit = useCallback(() => {
    submitForm(values);
  }, [values]);
  
  return <FormContent onSubmit={handleSubmit} />;
}

// ❌ ERRADO: Memoização prematura
function SimpleComponent({ name }) {
  // Sem necessidade - componente simples
  return useMemo(() => <div>{name}</div>, [name]);
}
```

### Code Splitting

```typescript
// ✅ CORRETO: Lazy loading para rotas pesadas
const Dashboard = lazy(() => import('./Dashboard'));
const Reports = lazy(() => import('./Reports'));

// ✅ CORRETO: Prefetch quando apropriado
function Navigation() {
  const prefetchDashboard = () => {
    import('./Dashboard');
  };
  
  return (
    <Link to="/dashboard" onMouseEnter={prefetchDashboard}>
      Dashboard
    </Link>
  );
}
```

---

## REGRAS DE ESTADO

### Estado Local vs Global

```typescript
// ✅ CORRETO: Estado local quando apropriado
function SearchInput() {
  const [query, setQuery] = useState('');  // Local - apenas este componente
  
  return (
    <input 
      value={query} 
      onChange={e => setQuery(e.target.value)} 
    />
  );
}

// ✅ CORRETO: Estado global quando necessário
function UserProfile() {
  const { user, updateUser } = useUserStore();  // Global - múltiplos componentes
  
  return <div>{user.name}</div>;
}
```

### Server State

```typescript
// ✅ CORRETO: React Query para server state
function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,  // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  
  return <UserTable users={data} />;
}
```

---

## REGRAS DE ACESSIBILIDADE

### A11y Obrigatória

```typescript
// ✅ CORRETO: Semântica e acessibilidade
function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="..."
    >
      {children}
    </button>
  );
}

// ✅ CORRETO: Labels e descrições
function Input({ label, error }: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <span id={errorId} role="alert">{error}</span>}
    </div>
  );
}

// ✅ CORRETO: Focus management
function Modal({ isOpen, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      overlayRef.current?.focus();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
```

---

## REGRAS DE FORMULÁRIOS

### Validação

```typescript
// ✅ CORRETO: Validação clara
const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />
      <Button type="submit">Login</Button>
    </form>
  );
}
```

---

## ANTI-PATTERNS PROIBIDOS

```typescript
// ❌ Evitar: Props drilling profundo
<A>
  <B user={user}>  {/* prop drilling */}
    <C user={user}>
      <D user={user} />
    </C>
  </B>
</A>

// ✅ Usar: Context ou composition

// ❌ Evitar: Re-renders desnecessários
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        {count}
      </button>
      <HeavyComponent data={stableData} /> {/* Re-render desnecessário */}
    </div>
  );
}

// ✅ Usar: React.memo ou mover estado

// ❌ Evitar: Efeitos desnecessários
function Component({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser); // Pode ser React Query
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// ✅ Usar: React Query ou SWR

// ❌ Evitar: Estados duplicados
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState(''); // ❌ Derivado
  
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
  
  // ✅ Usar: Valor computado
  const fullName = `${firstName} ${lastName}`;
}
```

---

## RESUMO

**Princípios Frontend**:

1. 🎯 **Foco**: Componentes com responsabilidade única
2. 🧩 **Composição**: Props mínimas, composição máxima
3. ⚡ **Performance**: Otimizar quando necessário, não prematuramente
4. ♿ **Acessibilidade**: Obrigatória, não opcional
5. 🎨 **Consistência**: Seguir design system
6. 📱 **Responsivo**: Mobile-first sempre
7. 🔒 **Tipo**: TypeScript estrito
