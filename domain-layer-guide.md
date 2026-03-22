# Domain Layer Guide

Referência arquitetural baseada em decisões e discussões do projeto. Cobre encapsulamento de regras de domínio, serviços, eventos e heurísticas práticas.

---

## O que é DDD e o que é bom design?

Este documento mistura dois tipos de conceito, e é importante saber distingui-los:

**Bom design / OOP / Clean Architecture** — princípios que existem independentemente do DDD. Você pode (e deve) aplicá-los mesmo sem adotar DDD. Exemplos: encapsulamento, separação de camadas, use case como coordenador.

**DDD** (Domain-Driven Design) — um conjunto de práticas e padrões específicos criados por Eric Evans. Divide-se em:
- *DDD estratégico*: como modelar o domínio em grandes sistemas (Bounded Contexts, Ubiquitous Language)
- *DDD tático*: padrões de implementação dentro de um contexto (Aggregates, Domain Events, Value Objects, Repositories)

Cada seção abaixo indica a qual categoria pertence.

---

## 1. Encapsulamento de regras no domínio

> **Origem: OOP / Tell, Don't Ask — não é DDD**

A diferença entre colocar regras no domínio vs. no use case parece pequena no código mas tem impacto grande na manutenção.

### Abordagem errada — regra no use case

```ts
// use case
course.status = 'published'
```

O use case *sabe demais*: sabe que publicar significa mudar o status, e qual é o valor. Se amanhã publicar também exigir que o curso tenha pelo menos 1 aula, gere um evento, ou mude `publishedAt`, você precisa lembrar de atualizar *cada use case* que faz isso. A regra está implícita, espalhada e invisível.

### Abordagem correta — regra no domínio

```ts
// use case
course.publish(lessons)

// model
publish(lessons: Lesson[]): void {
  if (lessons.length === 0) throw new DomainError('Course must have at least one lesson')
  this.status = 'published'
  this.publishedAt = new Date()
}
```

O use case não sabe *o que significa* publicar. Essa lógica fica encapsulada no modelo. Você pode adicionar validações, side effects, novos campos — tudo em um lugar.

### Por que isso importa

- **Invariantes**: o método pode lançar exceções se as condições não forem atendidas. Com `course.status = 'published'` você não tem onde colocar isso naturalmente.
- **Centralização**: a regra de "o que é publicar" existe em exatamente um lugar.

Mesmo que hoje `publish()` internamente seja só `this.status = 'published'`, o método existe para que quando a regra crescer, ela cresça *dentro do domínio*, não espalhada pelos use cases.

> **Nota**: o ponto sobre "usar o mesmo vocabulário que o domínio" (`publish` em vez de `status = 'published'`) já toca em *Ubiquitous Language*, que é DDD estratégico. Mas o encapsulamento em si é OOP puro.

---

## 2. Separação de camadas e o use case como coordenador

> **Origem: Clean Architecture / Hexagonal Architecture — não é exclusivamente DDD**

A divisão em camadas `domain`, `application` e `infrastructure` vem de padrões como Clean Architecture e Hexagonal Architecture (Ports & Adapters). O DDD é compatível com essa separação e frequentemente adotado junto, mas a separação em si é independente.

**Use case como coordenador sem regras** é consequência direta dessa separação: se as regras estão no domínio e o I/O está na infraestrutura, o use case naturalmente vira só orquestração.

---

## 3. Validação que depende de outros models

> **Origem: problema geral de design — as soluções variam de OOP simples a DDD tático**

Quando uma regra precisa de dados de outra entidade (ex: "curso precisa ter pelo menos 1 aula"), surge um tension point: o domínio não acessa repositórios, mas o use case acessa. Existem três abordagens:

### Opção 1 — Parâmetro no método *(OOP simples)*

O método do model recebe os dados necessários como parâmetro. O use case busca, o domínio valida.

```ts
// model
publish(lessons: Lesson[]): void {
  if (lessons.length === 0) throw new DomainError('...')
  this.status = 'published'
}

// use case
const lessons = await lessonsRepo.findByCourseId(course.id)
course.publish(lessons)
```

### Opção 2 — Domain Service *(DDD tático)*

Crie um serviço de domínio que recebe as entidades já carregadas como parâmetro. O use case busca os dados via repositório e passa pro serviço. A regra fica no domínio, o repositório fica no use case.

```ts
// domain/services/course-publication-service.ts
class CoursePublicationService {
  publish(course: Course, lessons: Lesson[]): void {
    if (lessons.length === 0) throw new DomainError('Course must have at least one lesson')
    course.markAsPublished()
  }
}

// application/use-cases/publish-course-use-case.ts
const lessons = await lessonsRepo.findByCourseId(course.id)
coursePublicationService.publish(course, lessons)
```

Útil quando a lógica envolve múltiplas entidades e não faz sentido pertencer a nenhuma delas individualmente.

### Opção 3 — Aggregate *(DDD tático)*

O `Course` mantém internamente uma coleção de `lessonIds` ou `Lesson[]`. Ele é o aggregate root e "conhece" suas aulas sem precisar de repositório externo.

```ts
// model — Course é aggregate root
publish(): void {
  if (this.lessons.length === 0) throw new DomainError('...')
  this.status = 'published'
}
```

**Você não é obrigado à opção 3.** As opções 1 e 2 são válidas e mais simples. A opção 3 é o que o DDD tático formaliza como Aggregate — uma solução para quando essas complexidades aparecem juntas e frequentemente. Você pode adotar as peças separadamente conforme a necessidade crescer, sem comprar o pacote completo de uma vez.

O ponto central: **o domínio nunca acessa repositórios**. O que parece exigir repositório quase sempre pode ser resolvido passando os dados já carregados como parâmetro.

---

## 4. Domain Events

> **Origem: o padrão em si é geral; a formalização (eventos como objetos do model) é DDD tático**

Quando uma ação de domínio deve emitir um evento (ex: `CoursePublished`), existem dois estilos:

### Estilo 1 — Use case despacha diretamente *(abordagem simples)*

```ts
// model
publish(lessons: Lesson[]): void {
  if (lessons.length === 0) throw new DomainError('...')
  this.status = 'published'
}

// use case
course.publish(lessons)
await courseRepo.save(course)
await eventBus.dispatch(new CoursePublished(course.id))
```

### Estilo 2 — Model coleta, use case despacha *(DDD tático)*

```ts
// model
publish(lessons: Lesson[]): void {
  if (lessons.length === 0) throw new DomainError('...')
  this.status = 'published'
  this.addDomainEvent(new CoursePublished(this.id)) // só coleta, não despacha
}

// use case
course.publish(lessons)
await courseRepo.save(course)
await eventBus.dispatch(course.pullDomainEvents()) // despacha após persistir
```

O estilo 2 é semanticamente mais rico porque o evento fica ligado à ação de domínio — quem lê o modelo sabe que publicar emite esse evento. O estilo 1 é mais simples e funciona bem para a maioria dos casos. Ambos são válidos.

---

## 5. Camadas de serviço e nomenclatura

### Domain Service *(DDD tático)*

Opera apenas com conceitos de domínio. Recebe entidades e value objects como parâmetro, aplica regras de negócio, não faz I/O.

```ts
// domain/services/course-publication-service.ts
class CoursePublicationService {
  publish(course: Course, lessons: Lesson[]): void {
    // regras de negócio aqui
  }
}
```

### Application Service / Use Case *(Clean Architecture)*

Coordena. Usa repositórios, event bus, outros serviços de infraestrutura. Não contém regras de negócio, apenas orquestração.

```ts
// application/use-cases/publish-course-use-case.ts
class PublishCourseUseCase {
  async execute(courseId: string): Promise<void> {
    const course = await this.courseRepo.findById(courseId)
    const lessons = await this.lessonsRepo.findByCourseId(courseId)
    this.coursePublicationService.publish(course, lessons)
    await this.courseRepo.save(course)
  }
}
```

### Infrastructure Service *(Clean Architecture)*

Implementa detalhes técnicos: envio de email, storage de arquivo, integrações externas.

### Convenção de nomenclatura

| Camada | Sufixo | Localização |
|--------|--------|-------------|
| Domain | `Service` | `domain/services/` |
| Application | `UseCase` ou `Handler` (CQRS) | `application/use-cases/` |
| Infrastructure | `Service` ou nome técnico | `infrastructure/` |

---

## 6. Heurísticas práticas

**Como identificar se algo é domain service:**

- Se você consegue testar sem mock de repositório ou qualquer I/O, é domain service. Se precisa mockar repositório pra testar, escorregou pra application layer.
- Se você colocasse ele na pasta `domain/` e ele não importasse nada de fora dessa pasta, faz sentido? Se sim, é domain service.

**Sobre adotar DDD tático gradualmente:**

- Não compre o DDD tático completo (aggregates, domain events no model) antes de precisar. As abordagens mais simples (parâmetro no método, use case despachando eventos) funcionam bem e são mais fáceis de manter.
- Evolua para aggregates quando regras que cruzam múltiplos models aparecerem juntas com frequência e a complexidade justificar.

**Sobre repositórios:**

- Domínio nunca acessa repositório.
- Use case busca os dados, domínio valida e transforma.
- Dados que parecem exigir repositório dentro do domínio quase sempre podem ser passados como parâmetro.
