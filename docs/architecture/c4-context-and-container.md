# Arquitetura — C4 Context e Container

Este documento cobre os dois primeiros níveis do [C4 Model](https://c4model.com/): o **System
Context** (quem usa o sistema e com o que ele conversa) e os **Containers** (as unidades
executáveis que compõem o sistema e como elas se comunicam). Os níveis Component e Code não são
usados aqui — os módulos internos do `main-api` ainda não têm complexidade que justifique o zoom
manual; ver [ADR 001](../../apps/main-api/docs/adr/001-clean-architecture-pragmatica-bounded-contexts.md)
para como esses módulos são organizados.

**Legenda de notação:** pessoas em azul escuro, o sistema em azul, sistemas/serviços externos em
cinza. Toda relação é rotulada com a ação e o protocolo — nunca só uma seta.

## Nível 1 — System Context

```mermaid
C4Context
  title System Context — class-platform

  Person(visitor, "Visitante", "Navega pelo catálogo público sem estar autenticado")
  Person(student, "Aluno", "Acessa cursos matriculados, assiste aulas")
  Person(instructor, "Instrutor", "Cria e gerencia cursos, módulos e aulas")
  Person(admin, "Administrador", "Gerencia usuários e a plataforma")

  System(platform, "class-platform", "Plataforma de ensino: catálogo de cursos, autenticação e (em construção) acompanhamento de aprendizado")

  System_Ext(google, "Google OAuth", "Provedor de login social (OAuth 2.0 / PKCE)")
  System_Ext(bunny, "Bunny Stream", "Hospedagem e transcoding de vídeo — planejado, ver ADR de media/upload")
  System_Ext(s3, "Storage compatível com S3", "Armazenamento de imagens via URL pré-assinada — planejado, ver ADR de media/upload")

  Rel(visitor, platform, "Navega pelo catálogo público", "HTTPS")
  Rel(student, platform, "Faz login e assiste aulas", "HTTPS")
  Rel(instructor, platform, "Cria e gerencia conteúdo", "HTTPS")
  Rel(admin, platform, "Administra usuários e plataforma", "HTTPS")
  Rel(platform, google, "Autentica o usuário", "HTTPS / OAuth 2.0")
  Rel(platform, bunny, "Envia vídeo e recebe status de transcoding", "HTTPS/TUS + webhook")
  Rel(platform, s3, "Envia imagens via URL pré-assinada", "HTTPS")

  UpdateRelStyle(platform, bunny, $lineStyle="dashed")
  UpdateRelStyle(platform, s3, $lineStyle="dashed")
```

Bunny Stream e o storage de imagens aparecem com linha tracejada: são integrações **planejadas**
(decididas no ADR de media/upload do módulo `catalog`), ainda não implementadas no código.

## Nível 2 — Container

```mermaid
C4Container
  title Container — class-platform

  Person(visitor, "Visitante")
  Person(student, "Aluno")
  Person(instructor, "Instrutor")
  Person(admin, "Administrador")

  System_Boundary(platform, "class-platform") {
    Container(frontend, "main-frontend", "React 19, Vite, TanStack Router/Query, Zustand", "SPA que consome a API via cliente gerado com Orval a partir do OpenAPI")
    Container(api, "main-api", "Bun, Elysia", "API REST em Clean Architecture com bounded contexts (auth-and-users, catalog, learning); expõe OpenAPI/Swagger em /doc")
    ContainerDb(postgres, "PostgreSQL", "Drizzle ORM", "Usuários, cursos, módulos, aulas, refresh tokens, contas OAuth")
    ContainerDb(redis, "Redis", "SETEX", "Estado OAuth (PKCE) com TTL natural")
  }

  System_Ext(google, "Google OAuth")

  Rel(visitor, frontend, "Usa", "HTTPS")
  Rel(student, frontend, "Usa", "HTTPS")
  Rel(instructor, frontend, "Usa", "HTTPS")
  Rel(admin, frontend, "Usa", "HTTPS")
  Rel(frontend, api, "Chama", "HTTPS / JSON (REST)")
  Rel(api, postgres, "Lê e escreve", "SQL via Drizzle")
  Rel(api, redis, "Lê e escreve estado OAuth", "SETEX / GET")
  Rel(api, google, "Troca código de autorização por token", "HTTPS / OAuth 2.0")
```

### Notas sobre o estado atual

- O módulo `learning` existe no código (`apps/main-api/src/modules/learning`) mas **ainda não
  está registrado no bootstrap** (`apps/main-api/src/bootstrap.ts` só chama
  `registerAuthModule` e `registerCatalogModule`). O diagrama mostra o container `main-api`
  como uma unidade só porque, no nível Container, os módulos internos não aparecem — mas vale
  saber que nem todo o código dentro dele está ligado ao runtime hoje.
- Redis já está em uso real (não é só uma proposta): `RedisOAuthStateRepository` é a
  implementação registrada em produção para o estado OAuth. Refresh tokens, por outro lado,
  ainda usam Postgres (`DrizzleRefreshTokenRepository`) — migrá-los para Redis é uma oportunidade
  identificada mas não decidida (sem ADR ainda).
