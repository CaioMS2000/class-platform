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

**`apps/main-api/src/main.ts`** — faz o wiring, registrando as implementações concretas:

```ts
// Repositórios — factories sem dependências, instanciam direto
container.register({
  adminRepository: container.asFunction(() => new DrizzleAdminRepository()).singleton(),
})

// Use cases — factories com dependências do cradle (destructuring tipado)
container.register({
  loginUseCase: container.asFunction(
    ({ adminRepository, hashVerifier, jwtService }) =>
      new LoginUseCase({ adminRepository, hashVerifier, jwtService })
  ).singleton(),
})

// Controllers HTTP — recebem use cases como dependência
container.register({
  authHttpController: container.asFunction(
    ({ loginUseCase, registerUseCase }) =>
      new AuthHttpController({ loginUseCase, registerUseCase })
  ).singleton(),
})
```

**Regras importantes:**
- Toda nova chave adicionada ao `CradleInterface` no `container.ts` precisa ser registrada no `main.ts`
- O destructuring nas factories recebe nomes do cradle — se o nome da chave no cradle for `authStudentRepository` mas o use case espera `studentRepository`, o mapeamento é feito na factory: `new LoginUseCase({ studentRepository: authStudentRepository })`
- Repositórios com nomes duplicados entre módulos usam prefixo: `authStudentRepository` (auth-and-users), `learningStudentRepository` (learning), `catalogCourseRepository` (catalog), `learningCourseRepository` (learning)
- Utilitários de `@repo/core` (ex: `UUIDV7Generator`, `IdGenerator`) são usados diretamente

---

## O que precisa ser feito

Acabei de implementar [descreva aqui o que foi implementado: use case, controller, repositório, serviço]. Preciso que você:

1. Leia os arquivos mencionados abaixo para entender as dependências de cada classe
2. Adicione as novas chaves ao `CradleInterface` em `container.ts` (tipadas com as interfaces do domínio)
3. Registre as implementações concretas no `main.ts` seguindo o padrão já existente
4. Se houver conflito de nome com outro módulo, use o prefixo do módulo

Os arquivos relevantes são:
Use 'git status' e foque nos arquivos TS
