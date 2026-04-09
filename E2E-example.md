# Como usar num teste E2E:
```typescript
import { setupE2E, teardownE2E, getBaseUrl } from '@/test/setup-e2e'
import { cleanAllTables } from '@/test/database'

describe('POST /api/v1/auth/login', () => {
  beforeAll(() => setupE2E())
  afterAll(() => teardownE2E())
  beforeEach(() => cleanAllTables())

  it('200 com credenciais válidas', async () => {
    const res = await fetch(`${getBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'joao@test.com', password: 'senha123' }),
    })
    expect(res.status).toBe(200)
  })
})
```