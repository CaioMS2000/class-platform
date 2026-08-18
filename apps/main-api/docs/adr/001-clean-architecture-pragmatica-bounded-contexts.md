# ADR 001: Clean Architecture pragmática com bounded contexts, sem DDD completo

**Status:** Aceito
**Data:** Março de 2026

## Contexto

O class-platform é uma plataforma de ensino (modelo Hotmart/Kiwify) em fase inicial, com
regras de negócio majoritariamente diretas neste estágio (CRUD de cursos/módulos/aulas,
autenticação). Antes de escrever a primeira linha de domínio, havia duas dúvidas de fundo:

1. Adotar DDD completo desde o início (Event Storming, Bounded Contexts formais, Aggregates
   com invariantes complexas, Domain Events como mecanismo central), ou uma abordagem mais
   pragmática?
2. Organizar o código por camada técnica global (`controllers/`, `services/`, `repositories/`
   na raiz do projeto) ou por contexto de negócio?

## Opções consideradas

### DDD completo desde o início

- **Prós:** modelagem mais rica e correta desde o começo; menos retrabalho se o domínio crescer
  em complexidade de verdade.
- **Contras:** exige Domain Exploration/Event Storming e Aggregates bem desenhados antes mesmo
  do MVP existir, além de maturidade de time nesses conceitos. As primeiras features (CRUD de
  catálogo, autenticação) ainda não têm regras de negócio tortuosas o suficiente pra justificar
  esse overhead — o DDD brilha quando as regras são complexas, e neste estágio elas não são.

### Estrutura técnica simples, sem separação por contexto

- **Prós:** menos pastas, mais rápido para começar.
- **Contras:** à medida que o domínio cresce (`catalog`, `auth-and-users`, `learning`, e
  futuramente `sales`/`payment`), compartilhar `controllers/services/repositories` genéricos
  tende a criar acoplamento cruzado difícil de desfazer depois — mexer na autenticação já
  passaria a tocar arquivos que também servem o catálogo.

### Clean Architecture como guarda-chuva + bounded contexts pragmáticos (escolhida)

- Separar a aplicação em contextos de negócio como módulos (`auth-and-users`, `catalog`,
  `learning`, ...), cada um com suas próprias camadas `domain/`, `application/`,
  `infrastructure/`.
- Dentro de cada contexto, aplicar Clean Architecture (dependência sempre para dentro: domain
  não conhece infraestrutura) sem exigir Aggregates formais ou Event Storming exaustivo.
- Modelos ricos apenas onde a regra de negócio já é real hoje (ex: rotação de refresh token na
  entidade de auth), sem forçar riqueza artificial em entidades que ainda só têm dados básicos
  (ex: `Student`).

## Decisão

Adotar Clean Architecture pragmática com separação por bounded contexts — módulos
`auth-and-users` e `catalog` hoje, `learning` em construção, com contextos futuros (`sales`,
`payment`) seguindo o mesmo padrão — sem exigir as práticas mais pesadas do DDD formal.

Regras adotadas:

1. **Dependência sempre para dentro:** `domain` não conhece `application` nem
   `infrastructure`.
2. **Casos de uso orquestram, o domínio decide:** a lógica de negócio fica nas entidades;
   `application/use-cases` chama o domínio, pergunta pra ele, e persiste — não contém regra de
   negócio própria.
3. **Contextos não chamam o repositório uns dos outros diretamente:** comunicação entre
   contextos passa por um `EventBus` (`packages/core/src/events/event-bus`), evitando
   acoplamento direto entre módulos.

## Consequências

- O MVP não ficou bloqueado por modelagem exaustiva de domínio antes de existir código
  funcionando.
- A estrutura de módulos já isola mudanças: alterar autenticação não deveria tocar em arquivos
  do catálogo, e vice-versa.
- Entidades como `Student` podem permanecer "pobres" (poucas regras) sem violar o princípio,
  desde que as regras que existem fiquem encapsuladas nelas e não vazem para serviços externos;
  entidades com regras de negócio reais ficam ricas.
- **Dívida assumida conscientemente:** sem Aggregates formais, cada caso de uso é responsável
  por garantir a consistência entre entidades relacionadas (ex: `Course` e seus `Module`s) — não
  há um único ponto de entrada que force essa invariante. Se o domínio crescer em complexidade
  (ex: regras de checkout com múltiplos itens e cupons no futuro contexto `sales`), vale
  revisitar essa decisão pontualmente para os contextos mais críticos, sem precisar reescrever
  os demais.
