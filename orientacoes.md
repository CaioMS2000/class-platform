## **Arquitetura Pragmática com Toques de DDD**

Para uma plataforma de ensino como Hotmart/Kiwify, **eu iria de abordagem pragmática**, mas aplicando os conceitos mais valiosos do DDD sem o dogmatismo. Aqui está o porquê:

### Por que não DDD puro agora?

1.  **Overhead inicial:** DDD exige um trabalho profundo de *Domain Exploration*, *Event Storming*, *Bounded Contexts* bem definidos. Isso pode atrasar seu MVP.
2.  **Complexidade desnecessária:** Inicialmente, suas regras serão relativamente diretas (CRUD de cursos, processamento de pagamento, liberação de acesso). O DDD brilha quando as regras são tortuosas.
3.  **Curva de aprendizado:** Seu time precisa entender conceitos como *Aggregates*, *Value Objects*, *Domain Events*, *Repositories* (na visão do DDD). Isso exige maturidade técnica.

### A Abordagem Híbrida que eu sugiro (O "Melhor dos Dois Mundos")

Use a **Clean Architecture** (ou Hexagonal) como guarda-chuva, mas aplique conceitos seletivos do DDD onde o negócio é mais crítico.

#### 1. Separe por Bounded Contexts (Mesmo sem DDD formal)
Já comece separando sua aplicação em contextos. Não precisa ser microserviços, pode ser módulos dentro do mesmo projeto:

```
src/
├── contexts/
│   ├── catalog/           (Cursos, módulos, aulas)
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   │
│   ├── sales/             (Pedidos, carrinho, checkout)
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   │
│   ├── payment/           (Transações, gateways, split de comissão)
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   │
│   ├── marketing/         (Afiliados, cupons, comissões)
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   │
│   └── community/         (Fórum, anotações, progresso)
│       ├── application/
│       ├── domain/
│       └── infrastructure/
```

#### 2. Use Domain Model Ricos ONDE FAZ SENTIDO
Não faça todas as entidades anêmicas. Crie modelos ricos nos contextos críticos:

```typescript
// BOM (Domain Model Rico - Contexto de Vendas)
class Pedido {
  constructor(
    private itens: ItemPedido[],
    private cupom?: Cupom
  ) {}

  aplicarCupom(cupom: Cupom): void {
    if (!cupom.estaValido()) {
      throw new ErroCupomInvalido();
    }
    this.cupom = cupom;
    this.recalcularTotal();
  }

  adicionarItem(produto: Produto, quantidade: number): void {
    // Regra de negócio DENTRO da entidade
    if (this.itens.length >= 10) {
      throw new ErroLimiteItensExcedido();
    }
    this.itens.push(new ItemPedido(produto, quantidade));
    this.recalcularTotal();
  }

  private recalcularTotal(): void {
    // Lógica complexa de cálculos de imposto, comissão, etc
  }
}

// MAIS OU MENOS (Anêmico - Evite assim)
class PedidoService {
  aplicarCupom(pedido: Pedido, cupom: Cupom): void {
    // Toda a lógica aqui fora, pedido vira mero container de dados
    if (cupom.validade < new Date()) {
      throw new Error('Cupom expirado');
    }
    pedido.cupom = cupom;
    // recalcular aqui fora...
  }
}
```

#### 3. Aplique Value Objects Imutáveis
Use Value Objects para conceitos que não são apenas dados:

```typescript
// Value Object
class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new InvalidEmailError(email);
    }
    this.value = email;
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// Uso
class Usuario {
  constructor(
    public readonly email: Email, // Garantido que é válido
    public readonly nome: string
  ) {}
}
```

#### 4. Use Domain Events para Desacoplar Contextos
Quando algo importante acontece em um contexto, dispare eventos para que outros contextos reajam. Isso é DDD puro e MUITO útil.

```typescript
// Em SalesContext (após pagamento aprovado)
class PagamentoAprovadoEvent {
  constructor(
    public readonly pedidoId: string,
    public readonly usuarioId: string,
    public readonly produtos: Array<{id: string, preco: number}>
  ) {}
}

// Em CatalogContext (reage ao evento)
class GerarMatriculasListener {
  handle(event: PagamentoAprovadoEvent): void {
    // Cria as matrículas para o usuário nos produtos comprados
    // Isso desacopla completamente vendas de catálogo
  }
}
```

## Arquitetura Final Sugerida

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (Controllers, GraphQL Resolvers, CLI, Queue Consumers)     │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                         │
│  (Use Cases, DTOs, Command/Query Handlers)                  │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                              │
│  (Entities, Value Objects, Domain Events, Domain Services)   │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                         │
│  (Repositories, External APIs, Database, Cache, etc)        │
└─────────────────────────────────────────────────────────────┘
```

**Regras de Ouro para essa abordagem:**

1.  **Dependência sempre para dentro:** Domain não sabe de ninguém.
2.  **Casos de uso orquestram, mas não contêm regras:** O caso de uso chama o domínio, pergunta pra ele, e persiste. A lógica de negócio fica no domínio.
3.  **Contextos isolados:** Um contexto não chama o repositório do outro. Usa eventos ou um anti-corruption layer.

## Conclusão

**Vá de arquitetura pragmática com Clean Architecture** como base, mas:

- ✅ **Use Bounded Contexts** (separação modular desde o início)
- ✅ **Crie Value Objects** para conceitos críticos (Email, CPF, Dinheiro, Status)
- ✅ **Faça modelos ricos** nos contextos de negócio mais complexos (vendas, comissões)
- ✅ **Implemente Domain Events** para comunicação entre contextos
- ❌ **Evite** Event Storming exaustivo, Aggregates gigantes, Repositories com especificações complexas se não precisar

Essa abordagem te dá **80% dos benefícios do DDD com 20% do esforço**. Você mantém a flexibilidade para pivotar rápido (essencial em startup) mas com uma base sólida que não vira "macarrão" quando o negócio crescer.

Quando (e se) o negócio explodir em complexidade, você terá a base para migrar partes específicas para DDD puro sem reescrever tudo.

---

# Questionamento: "Entidades anêmicas não podem nunca existir?"

## O que são entidades anêmicas?

Entidades anêmicas são classes que **só tem dados** (getters/setters) mas **não tem comportamento** (métodos de negócio). Todo o comportamento fica em serviços/use cases.

```typescript
// ❌ Entidade Anêmica (anti-pattern)
class User {
  private name: string
  private email: string
  private password: string
  
  // Só getters/setters, sem lógica de negócio
  getName() { return this.name }
  setName(name: string) { this.name = name }
  getEmail() { return this.email }
  setEmail(email: string) { this.email = email }
  // ... etc
}

// Comportamento em serviços
class UserService {
  changeEmail(user: User, newEmail: string) {
    // Validação de email aqui
    user.setEmail(newEmail)
  }
}
```

## Quando entidades anêmicas são aceitáveis?

### 1. **DTOs/Value Objects simples**
```typescript
// ✅ OK: Value object anêmico (só dados)
class AddressDTO {
  constructor(
    public street: string,
    public city: string,
    public zipCode: string
  ) {}
}
```

### 2. **Casos onde comportamento está em camada superior**
```typescript
// ✅ OK: Entidade com estado, mas comportamento complexo delegado
class PurchaseOrder {
  constructor(
    public items: OrderItem[],
    public status: OrderStatus
  ) {}
  
  // Tem comportamento SIMPLES, mas o complexo fica em serviços
  addItem(item: OrderItem) {
    this.items.push(item)
  }
  
  // Comportamento complexo de validação de negócio
  // (ex: regras de desconto, cálculo de impostos) 
  // fica em serviços específicos
}
```

### 3. **ORM Entities (com ressalvas)**
```typescript
// ⚠️ Aceitável, mas prefira separar do domínio
@Entity()
class UserORM {
  @PrimaryGeneratedColumn()
  id: number
  
  @Column()
  name: string
  // Sem comportamento, só mapeamento do banco
}
```

## O problema NÃO é não ter métodos, é **vazar responsabilidade**

O verdadeiro problema das entidades anêmicas é que elas **vazam responsabilidade** para fora:

```typescript
// ❌ RUIM: Entidade anêmica + serviço com regras de domínio
class User { // Anêmica
  email: string
  isActive: boolean
}

class UserService {
  activateUser(user: User) {
    // ❌ Regra de DOMÍNIO vazando para serviço
    if (!user.email.includes('@')) {
      throw new Error('Invalid email')
    }
    user.isActive = true
  }
}

// ✅ BOM: Entidade rica encapsulando regras de domínio
class User {
  private constructor(
    private readonly _email: string,
    private _isActive: boolean
  ) {}
  
  static create(email: string): User {
    // Regra de domínio DENTRO da entidade
    if (!email.includes('@')) {
      throw new Error('Invalid email')
    }
    return new User(email, false)
  }
  
  activate(): void {
    // Regra de domínio DENTRO da entidade
    if (this._isActive) {
      throw new Error('User already active')
    }
    this._isActive = true
  }
  
  get email() { return this._email }
  get isActive() { return this._isActive }
}
```

## Estratégias práticas:

### 1. **Domínio rico, infraestrutura anêmica**
```typescript
// Domínio: Rica em comportamento
class Product {
  constructor(
    private price: number,
    private discount: number
  ) {}
  
  calculateFinalPrice(): number {
    return this.price * (1 - this.discount)
  }
  
  applyDiscount(percentage: number) {
    if (percentage > 50) throw new Error('Discount too high')
    this.discount = percentage
  }
}

// Infra: Anêmica (só dados)
interface ProductDTO {
  price: number
  discount: number
}
```

### 2. **Use Cases coordenam, entidades decidem**
```typescript
class CheckoutUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private paymentService: PaymentService
  ) {}
  
  async execute(input: CheckoutInput) {
    const order = await this.orderRepo.findById(input.orderId)
    
    // Order decide se pode ser finalizada
    if (!order.canBeCheckedOut()) {
      throw new Error('Order cannot be checked out')
    }
    
    // Use case coordena infraestrutura
    const payment = await this.paymentService.process(order.total)
    
    // Order atualiza seu estado
    order.markAsCheckedOut(payment.id)
    
    await this.orderRepo.save(order)
  }
}
```

## Resumo: Quando usar cada uma?

| Tipo | Onde usar | Exemplo |
|------|-----------|---------|
| **Rica (recomendada)** | Regras de negócio complexas | `Order`, `User`, `Product` |
| **Híbrida (aceitável)** | Comportamento simples + dados | `PurchaseOrder` (com addItem) |
| **Anêmica (com cautela)** | DTOs, ORM, boundary layers | `UserDTO`, `ProductORM` |

## Conclusão

Não é "nunca usar entidades anêmicas", é:
1. **Não fazer do domínio uma camada anêmica** (onde as regras de negócio deveriam estar)
2. **Ter consciência** de onde você está colocando o comportamento
3. **Separar claramente** o que é domínio (rico) do que é infraestrutura (pode ser anêmico)

O anti-pattern acontece quando **TODO** o seu domínio é anêmico e as regras de negócio ficam espalhadas em serviços.

---

**Nem todas as entidades precisam ser ricas** - e isso é perfeitamente normal!

## Entidades de diferentes camadas têm diferentes responsabilidades

### 1. **Entidades de Domínio (ricas) vs Entidades de Aplicação (pobres)**

No seu caso, alunos podem ser **entidades pobres** se:

```typescript
// ✅ PERFEITAMENTE ACEITÁVEL: Entidade de aluno pobre
class Student {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public enrolledAt: Date
  ) {}
  
  // Só comportamentos triviais, se houver
  updateName(newName: string) {
    this.name = newName
  }
}

// As regras complexas vão para outros lugares:
class EnrollmentService {
  canEnroll(student: Student, course: Course): boolean {
    // Regras complexas de matrícula AQUI
    // - Verificar se já está matriculado
    // - Verificar pré-requisitos
    // - Verificar limite de turma
    // - Verificar período de matrícula
  }
}
```

### 2. **Mas cuidado: "Pobre" não significa "anêmico"**

Pobre = poucas regras, mas ainda encapsula as que existem:

```typescript
// ❌ ANÊMICO (ruim) - dados expostos, regras vazadas
class Student {
  name: string  // público mutável
  status: string
}

// ✅ POBRE MAS ENCAPSULADO (bom) - regras simples mas protegidas
class Student {
  private _status: StudentStatus
  
  constructor(
    private _name: string,
    private _email: string
  ) {
    this._status = 'ACTIVE'
  }
  
  get name() { return this._name }
  get email() { return this._email }
  get status() { return this._status }
  
  // Única regra de negócio do aluno
  deactivate() {
    if (this._status === 'INACTIVE') {
      throw new Error('Student already inactive')
    }
    this._status = 'INACTIVE'
  }
}
```

### 3. **Exemplo real: Sistema de alunos X matrículas**

```typescript
// Entidade POBRE: Student (poucas regras)
class Student {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {}
  
  // Regra SIMPLES: nome não pode ser vazio
  changeName(newName: string) {
    if (!newName.trim()) throw new Error('Name required')
    this.name = newName
  }
}

// Entidade RICA: Enrollment (muitas regras)
class Enrollment {
  constructor(
    public studentId: string,
    public courseId: string,
    public period: string
  ) {}
  
  // Regras COMPLEXAS de matrícula
  canEnroll(): boolean {
    // - Verificar período de matrícula
    // - Verificar vagas
    // - Verificar conflito de horário
    // - Verificar pré-requisitos
  }
  
  calculatePrice(): Money {
    // - Calcular desconto por período
    // - Aplicar bolsa do aluno
    // - Calcular multa por atraso
  }
  
  validatePrerequisites(completedCourses: Course[]): boolean {
    // Lógica complexa de pré-requisitos
  }
}
```

### 4. **Onde colocar as regras então?**

```typescript
// 1. REGRAS DO ALUNO (na entidade Student)
- Nome não pode ser vazio
- Email deve ser válido
- Status pode ser ACTIVE/INACTIVE

// 2. REGRAS DE MATRÍCULA (no serviço EnrollmentService)
- Período de matrícula
- Limite de alunos por turma
- Conflito de horários
- Pré-requisitos

// 3. REGRAS DE COBRANÇA (no serviço BillingService)
- Cálculo de mensalidade
- Descontos por período
- Multas por atraso

// 4. REGRAS DE TURMA (na entidade Course)
- Capacidade máxima
- Horários disponíveis
- Professor atribuído
```

### 5. **Quando uma entidade de aluno fica rica?**

Só se o aluno tiver comportamentos complexos:

```typescript
// Se aluno tem carreira, progresso, conquistas...
class Student {
  private progress: Map<CourseId, Progress>
  private achievements: Achievement[]
  private careerPath: CareerPath
  
  // AÍ SIM tem regras complexas
  canAdvanceToNextLevel(): boolean {
    // Verificar se completou todos os cursos necessários
    // Verificar tempo mínimo
    // Verificar notas
  }
  
  unlockAchievement(achievement: Achievement) {
    // Verificar se atende requisitos
    // Calcular se é conquista especial
    // Disparar eventos
  }
}
```

## Resumo para seu caso:

```typescript
// PROVAVELMENTE ASSIM (pobre, mas ok):
class Student {
  // Dados básicos
  // Regras simples (validação de nome/email)
  // Métodos básicos (ativar/desativar)
}

// REGRAS COMPLEXAS vão para:
class EnrollmentService {  // Matrículas
class AttendanceService {  // Frequência
class GradingService {     // Notas
class PaymentService {     // Pagamentos
}
```

**Conclusão**: Não force complexidade onde não existe. Se aluno realmente só tem dados básicos, uma entidade pobre é a escolha correta. O importante é que as regras complexas estejam **em algum lugar** (serviços, value objects, outras entidades), não que **todas** as entidades sejam ricas.