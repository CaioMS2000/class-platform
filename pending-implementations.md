# Implementações pendentes — apps/main-api

> Mapeamento da camada de infraestrutura a ser implementada.
> Todos os repositórios serão implementados com Drizzle ORM (PostgreSQL).

## Status geral

| Módulo | Repositórios | Implementados | Pendentes |
|---|---|---|---|
| auth-and-users | 6 | 0 | 6 |
| catalog | 4 | 0 | 4 |
| learning | 4 | 0 | 4 |
| **Total** | **14** | **0** | **14** |

> `WatchHistoryRepository` e `NoteRepository` do módulo learning estão vazios (sem métodos) — postergados.

---

## Módulo: auth-and-users

**Interfaces em:** `src/modules/auth-and-users/domain/application/repositories/`

### AdminRepository
- `save(admin: Admin): Promise<void>`
- `update(admin: Admin): Promise<void>`
- `delete(admin: Admin): Promise<void>`
- `findById(id: UniqueId): Promise<Admin | null>`
- `getById(id: UniqueId): Promise<Admin>`
- `findByEmail(email: string): Promise<Admin | null>`
- `findMany(filters?, pagination?): Promise<Admin[]>`

### StudentRepository
- `save(student: Student): Promise<void>`
- `update(student: Student): Promise<void>`
- `delete(student: Student): Promise<void>`
- `findById(id: UniqueId): Promise<Student | null>`
- `getById(id: UniqueId): Promise<Student>`
- `findByEmail(email: string): Promise<Student | null>`
- `findMany(filters?, pagination?): Promise<Student[]>`

### InstructorRepository
- `save(instructor: Instructor): Promise<void>`
- `update(instructor: Instructor): Promise<void>`
- `delete(instructor: Instructor): Promise<void>`
- `findById(id: UniqueId): Promise<Instructor | null>`
- `getById(id: UniqueId): Promise<Instructor>`
- `findByEmail(email: string): Promise<Instructor | null>`
- `findMany(filters?, pagination?): Promise<Instructor[]>`

### RefreshTokenRepository
- `save(userId, tokenHash, expiresInSeconds, role): Promise<void>`
- `findByTokenHash(tokenHash): Promise<{ userId, used, role } | null>`
- `revoke(tokenHash): Promise<void>`
- `revokeAllForUser(userId): Promise<void>`
- `markUsed(tokenHash): Promise<void>`

### OAuthStateRepository
- `save(state, data: OAuthStateData, expiresInSeconds): Promise<void>`
- `findAndDelete(state): Promise<OAuthStateData | null>`

### OAuthAccountRepository
- `findByProviderAndAccountId(provider, providerAccountId): Promise<OAuthAccountRecord | null>`
- `save(data: { userId, provider, providerAccountId }): Promise<{ id: string }>`

**Schemas Drizzle a criar:** `users` (admins/students/instructors via role ou tabelas separadas), `refresh_tokens`, `oauth_states`, `oauth_accounts`

---

## Módulo: catalog

**Interfaces em:** `src/modules/catalog/application/repositories/`

### CategoryRepository
- `save(category: Category): Promise<void>`
- `update(category: Category): Promise<void>`
- `delete(category: Category): Promise<void>`
- `findById(id: UniqueId): Promise<Category | null>`
- `getById(id: UniqueId): Promise<Category>`
- `findBySlug(slug: string): Promise<Category | null>`
- `findMany(): Promise<Category[]>`

### CourseRepository
- `save(course: Course): Promise<void>`
- `update(course: Course): Promise<void>`
- `delete(course: Course): Promise<void>`
- `findById(id: UniqueId): Promise<Course | null>`
- `getById(id: UniqueId): Promise<Course>`
- `findBySlug(slug: string): Promise<Course | null>`
- `findMany(filters?, pagination?): Promise<Course[]>`

### ModuleRepository
- `save(module: Module): Promise<void>`
- `update(module: Module): Promise<void>`
- `delete(module: Module): Promise<void>`
- `findById(id: UniqueId): Promise<Module | null>`
- `getById(id: UniqueId): Promise<Module>`
- `findManyByCourseId(courseId: UniqueId): Promise<Module[]>`

### LessonRepository
- `save(lesson: Lesson): Promise<void>`
- `update(lesson: Lesson): Promise<void>`
- `delete(lesson: Lesson): Promise<void>`
- `findById(id: UniqueId): Promise<Lesson | null>`
- `getById(id: UniqueId): Promise<Lesson>`
- `findManyByModuleId(moduleId: UniqueId): Promise<Lesson[]>`
- `findManyByCourseId(courseId: UniqueId): Promise<Lesson[]>`

**Schemas Drizzle a criar:** `categories`, `courses`, `course_modules`, `lessons`

---

## Módulo: learning

**Interfaces em:** `src/modules/learning/application/repositories/`

> `CourseRepository` e `StudentRepository` do learning são versões simplificadas (read-only) reutilizadas do domínio — podem delegar às implementações do catalog/auth-and-users.

### EnrollmentRepository
- `findById(id: UniqueId): Promise<Enrollment | null>`
- `findStudentCourseEnrollment(studentId, courseId): Promise<Enrollment | null>`
- `findManyByStudent(studentId: UniqueId): Promise<Enrollment[]>`
- `save(enrollment: Enrollment): Promise<void>`
- `update(enrollment: Enrollment): Promise<void>`

### ProgressRepository
- `findByUserAndLesson(userId, lessonId): Promise<Progress | null>`
- `findManyByUserAndCourse(userId, courseId): Promise<Progress[]>`
- `save(progress: Progress): Promise<void>`
- `update(progress: Progress): Promise<void>`

**Schemas Drizzle a criar:** `enrollments`, `progress`

---

## Outros contratos pendentes

### JwtService (abstract class)
**Localização:** `src/modules/auth-and-users/domain/application/...` (verificar)
- `sign(payload: JWTPayload): Promise<string>`
- `verify<T>(token: string): Promise<T>`
- `decode<T>(token: string): Promise<T>`
- **Implementação existente de referência:** `JwtEncrypter` em `src/modules/auth-and-users/infrastructure/cryptography/jwt-encrypter.ts` (usa `jose`)

---

## Infraestrutura já existente (não-repositório)

| Contrato | Implementação | Localização |
|---|---|---|
| `Encrypter` | `JwtEncrypter` | `src/modules/auth-and-users/infrastructure/cryptography/jwt-encrypter.ts` |
| `PasswordService` | implementado | `src/modules/auth-and-users/infrastructure/auth/password-service.ts` |
| `TokenService` | implementado | `src/modules/auth-and-users/infrastructure/auth/token-service.ts` |
| `OAuthProviderService` | implementado | `src/modules/auth-and-users/infrastructure/auth/oauth-provider-service.ts` |

---

## Setup Drizzle

- **Config:** `apps/main-api/drizzle.config.ts` — dialect PostgreSQL, output `./drizzle`, **schema array vazio**
- **Cliente:** `apps/main-api/src/lib/drizzle.ts` — instância criada, schema comentado
- **Migrações:** nenhuma criada ainda
- **Driver:** `pg` já instalado como dependência
