# ADR 001: Separação de responsabilidades do JwtService

**Status:** Aceito
**Data:** 2026-03-17

## Contexto

O contrato abstrato `JwtService` acumulava três responsabilidades distintas:

1. **Operações JWT** — `sign`, `verify`, `decode`
2. **Geração/hash de refresh tokens** — `generateRefreshToken`, `hashRefreshToken`
3. **Lógica de negócio** — `refreshToken` (rotação completa de tokens com detecção de replay)

Refresh tokens não são JWTs — são tokens opacos (strings aleatórias com hash). Agrupar sua geração junto com operações JWT viola o Princípio da Responsabilidade Única. Além disso, a lógica de rotação de tokens (validar, detectar replay, revogar, gerar novo par) é um caso de uso da aplicação, não uma responsabilidade de um serviço de criptografia.

## Decisão

Separar em três contratos com responsabilidades bem definidas:

### `JwtService`
Responsável exclusivamente por operações sobre JSON Web Tokens:
- `sign(payload)` — assinar um JWT
- `verify(token)` — verificar e decodificar um JWT validando assinatura e expiração
- `decode(token)` — decodificar um JWT sem verificar assinatura

### `JwtTokenGenerator`
Responsável pela geração e hash de tokens opacos:
- `generateRefreshToken()` — gerar string aleatória segura
- `hashRefreshToken(token)` — gerar hash do token para armazenamento

### `RefreshTokenUseCase`
A lógica de rotação de tokens (validar token atual, detectar replay, revogar tokens comprometidos, gerar novo par access/refresh) foi movida para um use case, onde pertence na camada de aplicação.

## Consequências

- Cada contrato tem uma única razão para mudar
- Use cases declaram explicitamente suas dependências via `UseCaseProps` (ex: `RegisterUseCase` depende de `JwtService` e `JwtTokenGenerator`, não de um serviço monolítico)
- Implementações concretas na camada de infraestrutura ficam mais focadas e testáveis
- Novos tipos de token (ex: tokens de verificação de email) podem reutilizar `JwtTokenGenerator` sem acoplar a JWT
