# class-platform

Backend e frontend de uma plataforma de ensino (modelo Hotmart/Kiwify): catálogo de cursos,
autenticação e, em construção, acompanhamento de progresso de aprendizado. Projeto de
portfólio, em desenvolvimento ativo — a seção [Estado atual](#estado-atual-e-limitações-conhecidas)
é honesta sobre o que já funciona e o que ainda não.

## Tour de 30 segundos

- **Monorepo Turborepo** com `apps/main-api` (Bun + Elysia, REST) e `apps/main-frontend`
  (React 19 + Vite), mais `packages/core` (kernel de domínio compartilhado) e `packages/shared`
  (schemas Typebox compartilhados entre API e frontend, base do cliente gerado via OpenAPI).
- **Clean Architecture com bounded contexts pragmáticos** — `domain` → `application` →
  `infrastructure`, dependência sempre pra dentro, sem o overhead de DDD formal. Por quê:
  [ADR 001 — Clean Architecture pragmática](apps/main-api/docs/adr/001-clean-architecture-pragmatica-bounded-contexts.md).
- **Autenticação:** JWT (RS256) com rotação de refresh token e detecção de replay, login social
  via Google OAuth 2.0/PKCE, três papéis de usuário (`admin`, `instructor`, `student`).
- 58 arquivos de teste no backend (unitários com `ts-mockito`, mais suítes de integração e
  end-to-end separadas).

## Tour de 5 minutos

### Arquitetura

Veja os diagramas C4 (Context + Container) em
[docs/architecture/c4-context-and-container.md](docs/architecture/c4-context-and-container.md).
Resumo: uma SPA (`main-frontend`) consome a API (`main-api`) via REST; a API persiste em
PostgreSQL (Drizzle) e usa Redis para o estado OAuth (PKCE); o login social passa pelo Google.

### Decisões arquiteturais registradas (ADR)

- [Clean Architecture pragmática + bounded contexts, sem DDD completo](apps/main-api/docs/adr/001-clean-architecture-pragmatica-bounded-contexts.md)
- [Separação de responsabilidades do `JwtService`](apps/main-api/src/modules/auth-and-users/docs/adr/001-jwt-service-separation-of-concerns.md)
- [Onde colocar a lógica de media/upload](apps/main-api/src/modules/catalog/docs/adr/001-media-upload-placement.md)

### Módulos do backend (`apps/main-api/src/modules`)

| Módulo | O que faz | Estado |
|---|---|---|
| `auth-and-users` | Cadastro/login, JWT + refresh token, OAuth Google/PKCE, papéis admin/instructor/student | Em uso |
| `catalog` | CRUD de cursos, módulos, aulas e categorias; navegação pública do catálogo | Em uso |
| `learning` | Progresso do aluno, matrícula, acompanhamento de aulas assistidas | Código existe, ainda não registrado no bootstrap |

## Rodando localmente

Pré-requisitos: [Bun](https://bun.com) `>=1.3`, PostgreSQL, Redis.

```sh
bun install
```

Configure `apps/main-api/.env` com (ver `apps/main-api/src/config/env/index.ts` para o schema
completo validado com Zod):

```
DATABASE_URL=
JWT_PRIVATE_KEY=      # par RS256
JWT_PUBLIC_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
OAUTH_FRONTEND_CALLBACK_URL=
REDIS_URL=redis://localhost:6380
```

Subir tudo (API + frontend) via Turborepo:

```sh
bun run dev
```

Ou individualmente:

```sh
cd apps/main-api && bun run dev        # API em Bun --watch, Swagger em /doc
cd apps/main-frontend && bun run dev   # Vite dev server
```

### Testes (backend)

```sh
cd apps/main-api
bun test                # unitários
bun run test:integration
bun run test:e2e
bun run test:cov
```

## Estado atual e limitações conhecidas

- O módulo `learning` tem código de domínio mas ainda não está ligado ao bootstrap da API —
  não é possível assistir aulas/acompanhar progresso via API hoje.
- Upload de mídia (vídeo via Bunny Stream, imagens via S3) está **decidido** (ver ADR) mas
  **não implementado** ainda.
- O frontend está em construção; autenticação (store + provider) é o trabalho mais recente.
- Migrar refresh tokens de Postgres para Redis é uma oportunidade identificada, mas ainda sem
  decisão registrada — hoje só o estado OAuth usa Redis.
- Sem pipeline de deploy/infra como código ainda; o projeto roda localmente.

## Stack

**Backend:** Bun, Elysia, Drizzle ORM, PostgreSQL, Redis, Awilix (DI), Zod, `jose` (JWT).
**Frontend:** React 19, Vite, TanStack Router/Query, Zustand, Tailwind, shadcn/ui, Orval (cliente
gerado a partir do OpenAPI da API).
**Compartilhado:** TypeScript, Biome, Turborepo, Husky + lint-staged.
