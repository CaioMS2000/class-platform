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