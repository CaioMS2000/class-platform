# Oportunidades de uso do Redis

## Alta prioridade — dados temporários com TTL natural

### Refresh Tokens
- **Implementação atual:** `apps/main-api/src/modules/auth-and-users/infrastructure/database/repositories/drizzle-refresh-token-repository.ts`
- **Contrato:** `apps/main-api/src/modules/auth-and-users/domain/application/repositories/refresh-token-repository.ts`
- **Por quê Redis:** O contrato já recebe `expiresInSeconds` no `save()`. Com `SETEX` o Redis expira a chave automaticamente, sem precisar de coluna `expiresAt` nem verificação `WHERE expires_at > NOW()` nas queries.
- **Ação:** Criar `RedisRefreshTokenRepository` implementando o mesmo contrato.

### OAuth State (PKCE)
- **Implementação atual:** `apps/main-api/src/modules/auth-and-users/infrastructure/database/repositories/drizzle-oauth-state-repository.ts`
- **Por quê Redis:** Estado OAuth tem TTL de 10 minutos e não precisa de persistência durável. Hoje a expiração é gerenciada manualmente no Postgres.
- **Ação:** Criar `RedisOAuthStateRepository` com `SETEX` de 600s.

---

## Média prioridade — cache de leitura

### Catálogo (categorias, cursos, módulos, aulas)
- **Arquivos:**
  - `apps/main-api/src/modules/catalog/infrastructure/database/repositories/drizzle-category-repository.ts`
  - `apps/main-api/src/modules/catalog/infrastructure/database/repositories/drizzle-course-repository.ts`
  - `apps/main-api/src/modules/catalog/infrastructure/database/repositories/drizzle-module-repository.ts`
  - `apps/main-api/src/modules/catalog/infrastructure/database/repositories/drizzle-lesson-repository.ts`
- **Por quê Redis:** Endpoints de catálogo são read-heavy e os dados mudam pouco. Cache com TTL (ex: categorias 24h, cursos 1-6h) reduz queries no Postgres.

### Dados do usuário (findById)
- **Arquivos:** repositories de admin, instructor e student
- **Por quê Redis:** `findById` é chamado no fluxo de refresh token e nos endpoints `/me`. Cache curto (1-2h) com invalidação no update.

---

## Oportunidade nova — ainda não existe no código

### Rate Limiting
- **Endpoints candidatos:** `/login`, `/register`, `/social/*`, `/refresh`
- **Por quê Redis:** Nenhuma proteção contra brute force existe hoje. Redis com `INCR` + `EXPIRE` é o padrão para janelas deslizantes de rate limit.
