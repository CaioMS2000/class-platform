# Tasks — Class Platform

Pendências de domínio e negócio identificadas durante o desenvolvimento. Infra e rotas são implicitamente necessárias para cada item e não são listadas separadamente.

---

## Catalog — Gaps do MVP

### 1. ???
**Tarefa propositalmente removida.**

---

### 2. Não existe como atribuir categorias a um curso

**Problema:** `CreateCourseUseCaseRequest` não tem campo `categories`. A entidade `Course` tem `categories: Category[]` mas não há como populá-las na criação nem na atualização.

**O que fazer:** Adicionar `categoryIds?: string[]` ao request de `CreateCourseUseCase` e `UpdateCourseUseCase`. O use case valida que as categorias existem antes de associar.

---

### 3. Default de `status` é `'published'` ao criar um curso

**Problema:** `Course.create()` usa `status = 'published'` como default. Um curso incompleto vai imediatamente para o catálogo público.

**O que fazer:** Mudar o default para `'draft'`. A publicação deve ser uma ação explícita do instrutor.

---

### 4. Separar `UpdateCourseUseCase` e `PublishCourseUseCase`

**`UpdateCourseUseCase`** (já existe — `catalog/application/use-cases/admin/`)
- Propósito: edição de metadados (título, descrição, preço, thumbnail, etc.)
- Não muda status
- Admin e instrutor (com verificação de ownership)

**`PublishCourseUseCase`** (a criar)
- Propósito: transição explícita de `draft` → `published`
- Deve validar pré-condições de negócio antes de publicar:
  - Curso tem pelo menos 1 módulo
  - Cada módulo tem pelo menos 1 aula
  - Thumbnail preenchida
- Registra `publishedAt = new Date()`
- Só o instrutor dono ou admin pode publicar

**Por que separar?** São intenções diferentes. `UpdateCourse` edita conteúdo; `PublishCourse` é uma transição de estado com regras de negócio próprias. Misturar os dois num único use case exige `if (input.status === 'published') { ... validações ... }` dentro de um use case de edição, o que viola SRP.

---

## Learning / Enrollment — Contexto ainda não implementado

Este contexto é o que desbloqueiam o fluxo completo aluno → acesso ao conteúdo.

### 5. Domínio de Enrollment

Criar o módulo `learning` com:
- Entidade `Enrollment` (studentId, courseId, status, enrolledAt, expiresAt?)
- `EnrollStudentUseCase` — pode começar sem pagamento (inscrição gratuita ou após pagamento confirmado)
- `GetEnrolledCoursesUseCase` — lista cursos em que o aluno está inscrito

### 6. Controle de acesso ao conteúdo

- `CheckEnrollmentUseCase` (ou regra no repositório) — valida se aluno tem acesso a um módulo/aula antes de servir o conteúdo
- `GetPublicLessonsUseCase` — aulas com `isFree=true` dispensam verificação de enrollment

### 7. Progresso do aluno

- Entidade `LessonProgress` (studentId, lessonId, completedAt, watchedSeconds?)
- `MarkLessonCompleteUseCase`
- `GetCourseProgressUseCase` — retorna % de conclusão por curso

---

## Auth-and-Users — Use cases self-service pendentes

### 8. Perfil self-service (baixa prioridade)

A criar em `auth-and-users/domain/application/use-cases/student/` e `.../instructor/`:
- `GetMyProfileUseCase` — recebe `requesterId` do JWT, retorna o próprio perfil
- `UpdateMyProfileUseCase` — aluno/instrutor atualiza nome, avatar, bio (não muda role nem status)

---

## Catalog — Use cases de instrutor pendentes (baixa prioridade)

A criar em `catalog/application/use-cases/instructor/`:
- `GetInstructorCourseUseCase` — retorna curso específico se o instrutor for o dono
- `GetCourseModulesUseCase` — módulos de um curso do instrutor
- `GetModuleLessonsUseCase` — aulas de um módulo do instrutor
- `UpdateCourseUseCase` (versão instrutor) — verifica ownership antes de editar
- `DeleteCourseUseCase` (versão instrutor) — verifica ownership antes de deletar

---

## Ordem sugerida de implementação

1. Resolver gaps do MVP do Catalog (#1, #2, #3, #4)
2. Criar contexto Learning/Enrollment (#5, #6)
3. Criar `PublishCourseUseCase` (#4)
4. Use cases de progresso (#7)
5. Self-service profiles (#8)
6. Use cases de instrutor restantes (#9)
