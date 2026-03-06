# Clean Architecture: Domínio Puro e Inversão de Dependências

## Introdução

A Clean Architecture, popularizada por Robert C. Martin (Uncle Bob), estabelece princípios fundamentais para criar sistemas sustentáveis, testáveis e de fácil manutenção. O núcleo dessa arquitetura é o **domínio**, que deve ser completamente isolado de detalhes externos como frameworks, bancos de dados e bibliotecas.

## O Princípio da Inversão de Dependência (DIP)

O DIP estabelece que:

1. **Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações**
2. **Abstrações não devem depender de detalhes. Detalhes devem depender de abstrações**

## O Problema Comum: Acoplamento com Geração de IDs

### Código Problemático

```typescript
// ❌ VIOLAÇÃO - Domínio acoplado à implementação
import { randomUUID } from 'node:crypto'  // Dependência de infraestrutura!

export class UniqueEntityID {
  private value: string

  constructor(value?: string) {
    this.value = value ?? randomUUID()  // Acoplamento direto
  }
}
```

**Problemas:**
- Domínio depende de detalhe de infraestrutura
- Impossível trocar estratégia de geração sem modificar o domínio
- Testes unitários precisam lidar com valores aleatórios reais
- Viola o DIP

## A Solução Correta: Contratos no Domínio, Implementações na Infra

### 1. Definindo o Contrato no Domínio

```typescript
// domain/ports/id-generator.port.ts
export interface IdGenerator {
  generate(): string;
  validate?(id: string): boolean;  // Opcional, se o domínio precisar
}

// domain/entities/unique-entity-id.ts
import { IdGenerator } from '../ports/id-generator.port';

export class UniqueEntityID {
  private value: string

  constructor(idGenerator: IdGenerator, value?: string) {
    if (value) {
      this.value = value
    } else {
      this.value = idGenerator.generate()  // ✅ Usa abstração
    }
  }
}
```

### 2. Implementando na Infraestrutura

```typescript
// infrastructure/id-generators/uuid.generator.ts
import { randomUUID } from 'node:crypto';
import { IdGenerator } from '../../domain/ports/id-generator.port';  // ✅ Importa do domínio

export class UuidGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
  
  validate(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}

// infrastructure/id-generators/sequential.generator.ts
import { IdGenerator } from '../../domain/ports/id-generator.port';

export class SequentialGenerator implements IdGenerator {
  private counter = 0;
  
  generate(): string {
    return (++this.counter).toString().padStart(10, '0');
  }
}
```

### 3. Composição na Raiz da Aplicação

```typescript
// main.ts - Application entry point
import { UuidGenerator } from './infrastructure/id-generators/uuid.generator';
import { User } from './domain/entities/user.entity';

const idGenerator = new UuidGenerator();  // Escolha da implementação
const user = new User(idGenerator, 'John');  // Injeção da dependência
```

## O Que Pertence ao Domínio

### 1. Entities (Entidades)

Objetos com identidade única e ciclo de vida próprio.

```typescript
// domain/entities/user.entity.ts
export class User {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private name: string,
    private status: UserStatus
  ) {}

  static create(email: Email, name: string, idGenerator: IdGenerator): User {
    if (!name.trim()) throw new Error('Name is required');
    
    return new User(
      new UserId(idGenerator),  // Usa o contrato, não implementação
      email,
      name,
      UserStatus.ACTIVE
    );
  }

  deactivate(): void {
    if (this.status === UserStatus.BLOCKED) {
      throw new Error('Cannot deactivate blocked user');
    }
    this.status = UserStatus.INACTIVE;
  }
}
```

### 2. Value Objects (Objetos de Valor)

Imutáveis, definidos por seus atributos, sem identidade própria.

```typescript
// domain/value-objects/email.value-object.ts
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new InvalidEmailError(email);
    }
    this.value = email.toLowerCase();
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }
}

// domain/value-objects/money.value-object.ts
export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {
    if (amount < 0) throw new NegativeMoneyError();
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError();
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

### 3. Domain Events (Eventos de Domínio)

Representam algo que aconteceu no domínio.

```typescript
// domain/events/domain-event.interface.ts
export interface DomainEvent {
  occurredAt: Date;
  getAggregateId(): string;
}

// domain/events/user-created.event.ts
export class UserCreatedEvent implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly userId: string,
    public readonly userEmail: string
  ) {
    this.occurredAt = new Date();
  }

  getAggregateId(): string {
    return this.userId;
  }
}
```

### 4. Domain Services (Serviços de Domínio)

Operações que não pertencem naturalmente a uma entidade.

```typescript
// domain/services/price-calculator.service.ts
export class PriceCalculator {
  constructor(
    private readonly taxCalculator: TaxCalculatorPort,
    private readonly discountPolicy: DiscountPolicyPort
  ) {}

  calculateTotal(items: OrderItem[], customer: Customer): Money {
    const subtotal = this.calculateSubtotal(items);
    const discounts = this.discountPolicy.apply(subtotal, customer);
    const taxes = this.taxCalculator.calculate(subtotal);
    
    return subtotal
      .subtract(discounts)
      .add(taxes);
  }

  private calculateSubtotal(items: OrderItem[]): Money {
    return items.reduce(
      (total, item) => total.add(item.price.multiply(item.quantity)),
      Money.zero()
    );
  }
}
```

### 5. Domain Policies (Políticas de Domínio)

Regras de negócio complexas que podem variar.

```typescript
// domain/policies/shipping-policy.interface.ts
export interface ShippingPolicy {
  calculateShipping(items: OrderItem[], destination: Address): Money;
  getEstimatedDays(destination: Address): number;
}

// domain/policies/free-shipping-policy.ts
export class FreeShippingPolicy implements ShippingPolicy {
  calculateShipping(items: OrderItem[], destination: Address): Money {
    return Money.zero();  // Frete grátis
  }

  getEstimatedDays(destination: Address): number {
    return 5;
  }
}
```

### 6. Domain Specifications (Especificações)

Regras de negócio reutilizáveis e combináveis.

```typescript
// domain/specifications/specification.interface.ts
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

// domain/specifications/order-specifications.ts
export class OrderEligibleForDiscount implements Specification<Order> {
  constructor(private readonly minValue: Money) {}

  isSatisfiedBy(order: Order): boolean {
    return order.total.isGreaterThanOrEqual(this.minValue);
  }
}
```

### 7. Domain Repositories (Interfaces)

Contratos para persistência, definidos no domínio.

```typescript
// domain/repositories/user-repository.port.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findActiveUsers(): Promise<User[]>;
}
```

### 8. Domain Errors (Erros de Domínio)

Erros específicos do negócio.

```typescript
// domain/errors/domain-error.ts
export abstract class DomainError extends Error {
  abstract readonly type: string;
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// domain/errors/user.errors.ts
export class UserAlreadyExistsError extends DomainError {
  readonly type = 'USER_ALREADY_EXISTS';
  
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
```

### 9. Domain Constants e Enums

Valores fixos do negócio.

```typescript
// domain/constants/user-status.ts
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING'
}

// domain/constants/business-rules.ts
export const BUSINESS_RULES = {
  MAX_ORDER_ITEMS: 50,
  MINIMUM_ORDER_VALUE: 10.00,
  FREE_SHIPPING_THRESHOLD: 200.00
} as const;
```

### 10. Domain Factories (Fábricas)

Criação de objetos complexos.

```typescript
// domain/factories/order.factory.ts
export class OrderFactory {
  constructor(private readonly idGenerator: IdGenerator) {}

  createDraft(customer: Customer, items: OrderItem[]): Order {
    if (items.length === 0) {
      throw new EmptyOrderError();
    }

    return Order.create({
      id: this.idGenerator.generate(),
      customerId: customer.id,
      items,
      status: OrderStatus.DRAFT,
      createdAt: new Date(),
      total: this.calculateTotal(items)
    });
  }

  private calculateTotal(items: OrderItem[]): Money {
    return items.reduce(
      (total, item) => total.add(item.price.multiply(item.quantity)),
      Money.zero()
    );
  }
}
```

## O Que NÃO Pertence ao Domínio

```typescript
// ❌ NÃO PERTENCE - Infraestrutura
import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { Redis } from 'ioredis';

// ❌ NÃO PERTENCE - Frameworks
import { Injectable } from '@nestjs/common';
import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// ❌ NÃO PERTENCE - Detalhes de transporte
import { IsEmail, IsString } from 'class-validator';
import { Request, Response } from 'express';
```

## Padrões de Implementação

### 1. Factory Pattern com Injeção

```typescript
// domain/factories/entity.factory.ts
export abstract class EntityFactory<T, E extends Entity<T>> {
  constructor(protected readonly idGenerator: IdGenerator) {}

  protected createId(): string {
    return this.idGenerator.generate();
  }

  abstract create(props: T): E;
}
```

### 2. Repository Pattern

```typescript
// domain/repositories/base.repository.ts
export abstract class BaseRepository<T extends Entity<any>> {
  constructor(protected readonly idGenerator: IdGenerator) {}

  protected generateEntityId(): string {
    return this.idGenerator.generate();
  }

  abstract save(entity: T): Promise<void>;
  abstract findById(id: string): Promise<T | null>;
}
```

### 3. Strategy Pattern para Múltiplos Geradores

```typescript
// domain/ports/id-generator.port.ts
export enum IdGeneratorType {
  UUID = 'UUID',
  SEQUENTIAL = 'SEQUENTIAL',
  SNOWFLAKE = 'SNOWFLAKE'
}

export interface IdGenerator {
  generate(): string;
  getType(): IdGeneratorType;
}
```

## Benefícios da Abordagem Correta

### 1. Testabilidade

```typescript
// tests/unit/user.spec.ts
describe('User', () => {
  it('should create with generated id', () => {
    // Mock da interface, não da implementação
    const mockIdGenerator: IdGenerator = {
      generate: () => 'fixed-id-for-test'
    };
    
    const user = User.create('John', mockIdGenerator);
    expect(user.id).toBe('fixed-id-for-test');
  });
});
```

### 2. Flexibilidade

```typescript
// main.ts - Diferentes estratégias por ambiente
const idGenerator = process.env.NODE_ENV === 'test' 
  ? new SequentialGenerator()  // IDs previsíveis para testes
  : new UuidGenerator();        // UUID para produção

const user = new User(idGenerator, 'John');
```

### 3. Isolamento do Domínio

```typescript
// O domínio NÃO MUDA quando trocamos:
- De UUID para Snowflake IDs
- De MongoDB para PostgreSQL
- De REST para GraphQL
- De SendGrid para AWS SES
```

## Visualização das Camadas

```
                    ┌─────────────────────┐
                    │   ENTRY POINTS      │
                    │  (Controllers, CLI) │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │   APPLICATION       │
                    │   (Use Cases)       │
                    └─────────┬───────────┘
                              │
┌─────────────────────────────┼─────────────────────────────┐
│                    ┌─────────▼───────────┐               │
│                    │       DOMAIN         │               │
│                    │    (Entities, Ports) │◄───┐          │
│                    └─────────┬───────────┘    │          │
│           D O M Í N I O       │                 │          │
│                              │                 │ IMPLEMENTA│
│                    ┌─────────▼───────────┐    │          │
│                    │   INFRASTRUCTURE    │────┘          │
│                    │ (Repositories, etc) │                │
│                    └─────────────────────┘                │
└───────────────────────────────────────────────────────────┘
```

## Conclusão

A chave para uma arquitetura limpa e sustentável é:

1. **Domínio define os contratos** (interfaces/ports) do que precisa
2. **Infraestrutura implementa** esses contratos
3. **Nunca importar infraestrutura no domínio**
4. **Inverter as dependências**: infraestrutura depende do domínio, nunca o contrário

**O domínio é o "rei" que dá ordens através de contratos, e a infraestrutura são os "súditos" que implementam esses contratos. O rei não precisa saber como os súditos farão o trabalho, apenas o que precisa ser feito.**

Essa abordagem garante:
- ✅ Código testável
- ✅ Flexibilidade para trocar implementações
- ✅ Isolamento de regras de negócio
- ✅ Baixo acoplamento
- ✅ Alta coesão
- ✅ Manutenibilidade a longo prazo

Lembre-se: **Se algo expressa regras, conceitos ou comportamentos do negócio, pertence ao domínio. Se é um detalhe técnico de COMO fazer algo, fica fora do domínio.**
