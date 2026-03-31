# Prompt: Wiring e DI no container

## Contexto do projeto

É um monorepo com uma API principal em `apps/main-api`. O padrão é Clean Architecture com separação em camadas:
- `domain/application` — use cases, interfaces de repositórios, interfaces de serviços (abstrações puras, sem implementação)
- `infrastructure` — implementações concretas: repositórios Drizzle, serviços de auth, controllers HTTP (Elysia)

O container de DI usa **awilix** com `InjectionMode.PROXY`.

---

## Como o container funciona

**`apps/main-api/src/container.ts`** — define o tipo do cradle e exporta o container como global:

```ts
interface CradleInterface {
  // cada chave tipada com a interface/abstração do domínio
  adminRepository: AdminRepository
  loginUseCase: LoginUseCase
  // ...
}

const _container = Object.assign(
  createContainer<CradleInterface>({ injectionMode: InjectionMode.PROXY }),
  {
    // helper tipado para que o destructuring nas factories seja tipado como CradleInterface
    asFunction<T>(fn: (cradle: CradleInterface) => T) {
      return asFunction(fn)
    },
  }
)

declare global {
  const container: typeof _container
}
```

O `container` é global (via `globalThis`), acessível em qualquer arquivo sem import.

---

**`apps/main-api/src/main.ts`** — registra apenas **shared services** (serviços usados por múltiplos módulos) e chama o registro de cada módulo:

```ts
// Shared services
container.register({
  jwtService: container.asFunction(() => new TokenService()).singleton(),
  hashVerifier: container.asFunction(() => new PasswordService()).singleton(),
  idGenerator: container.asFunction(() => new UUIDV7Generator()).singleton(),
  // ...
})

// Modules
registerAuthModule(container)
registerCatalogModule(container)

initHttpServer()
```

---

**`apps/main-api/src/modules/<modulo>/register.ts`** — cada módulo tem seu próprio arquivo de wiring que registra repos, use cases e controllers daquele módulo:

```ts
export function registerAuthModule(c: typeof container) {
  // Repositórios — factories sem dependências, instanciam direto
  c.register({
    adminRepository: c.asFunction(() => new DrizzleAdminRepository()).singleton(),
  })

  // Use cases — factories com dependências do cradle (destructuring tipado)
  c.register({
    loginUseCase: c.asFunction(
      ({ adminRepository, hashVerifier, jwtService }) =>
        new LoginUseCase({ adminRepository, hashVerifier, jwtService })
    ).singleton(),
  })

  // Controllers HTTP — recebem use cases como dependência
  c.register({
    authHttpController: c.asFunction(
      ({ loginUseCase, registerUseCase }) =>
        new AuthHttpController({ loginUseCase, registerUseCase })
    ).singleton(),
  })
}
```

Módulos existentes:
- `apps/main-api/src/modules/auth-and-users/register.ts` → `registerAuthModule()`
- `apps/main-api/src/modules/catalog/register.ts` → `registerCatalogModule()`

**Regras importantes:**
- Toda nova chave adicionada ao `CradleInterface` no `container.ts` precisa ser registrada no `register.ts` do módulo correspondente (ou no `main.ts` se for um shared service)
- O destructuring nas factories recebe nomes do cradle — se o nome da chave no cradle for `authStudentRepository` mas o use case espera `studentRepository`, o mapeamento é feito na factory: `new LoginUseCase({ studentRepository: authStudentRepository })`
- Repositórios com nomes duplicados entre módulos usam prefixo: `authStudentRepository` (auth-and-users), `learningStudentRepository` (learning), `catalogCourseRepository` (catalog), `learningCourseRepository` (learning)
- Utilitários de `@repo/core` (ex: `UUIDV7Generator`, `IdGenerator`) são usados diretamente
- Cada `register.ts` só importa classes do próprio módulo — nunca faz imports cross-module
- Shared services (jwt, hash, id generator) são registrados no `main.ts` e acessados pelo cradle nos `register.ts`

---

## O que precisa ser feito

Preciso que você faça o wiring de tudo que foi implementado e ainda não está registrado no container. Para isso:

1. Execute `git status` e identifique os arquivos TS novos ou modificados (ignore testes, schemas e arquivos não relacionados a classes)
2. Leia esses arquivos para entender as dependências de cada classe (constructor props, interfaces que implementam)
3. Identifique a qual módulo pertence cada arquivo novo pelo caminho (`modules/<modulo>/...`)
4. Adicione as novas chaves ao `CradleInterface` em `container.ts` (tipadas com as interfaces do domínio)
5. Registre as implementações concretas no `register.ts` do módulo correspondente, seguindo o padrão já existente
6. Se for um shared service novo (usado por múltiplos módulos), registre no `main.ts` ao invés do `register.ts`
7. Se houver conflito de nome com outro módulo, use o prefixo do módulo
