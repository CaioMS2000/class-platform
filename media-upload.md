# Decisao Arquitetural: Onde Colocar a Logica de Media/Upload

## Contexto

A plataforma precisa de upload de videos (Bunny Stream, TUS), imagens (pre-signed URLs/S3) e attachments para aulas e cursos. O fluxo de video envolve multiplas etapas (credenciais -> upload direto -> registro) e operacoes assincronas (transcoding, cleanup de orfaos). A duvida: criar um modulo dedicado `media` ou manter dentro de um modulo existente?

## Recomendacao: Manter dentro do modulo Catalog

### Por que

1. **Todos os consumidores estao no Catalog** - `Lesson.content.videoUrl`, `Lesson.content.attachments`, `Course.thumbnail`, `Course.coverImage`. Nenhum outro modulo faz upload ou gerencia lifecycle de midia.

2. **Midia nao tem significado de dominio independente** - Um video nao existe sozinho; ele e o conteudo de uma aula. Uma imagem e a thumbnail de um curso. Nao existe "biblioteca de midias" como feature.

3. **Modulo separado forcaria orquestracao cross-module desnecessaria** - Criar aula com video se tornaria uma coordenacao entre dois modulos para o que e uma unica operacao de dominio.

4. **YAGNI** - O projeto tem 3 modulos, o learning ainda nao esta registrado no bootstrap. Extrair prematuramente cria complexidade sem beneficio.

### Organizacao dentro do Catalog

A logica de media fica organizada como subdomain na infraestrutura do catalog:

```
catalog/
  domain/
    @types/index.ts              -- adicionar tipos de upload status
    events/                      -- VideoProcessingCompleteEvent, etc (novo)
  application/
    services/
      media-storage-service.ts   -- interface/port para operacoes de midia (novo)
    use-cases/instructor/
      request-video-upload.ts    -- gera credenciais de upload (novo)
      confirm-video-upload.ts    -- associa video ref a aula (novo)
    use-cases/internal/
      handle-video-webhook.ts   -- processa webhook de transcoding (novo)
      clean-orphaned-uploads.ts -- job de limpeza (novo)
  infrastructure/
    media/                       -- adapters (novo)
      bunny-stream-service.ts    -- implementa video upload/status
      s3-presigned-url-service.ts -- implementa image upload
    http/routes/
      webhook-routes.ts          -- rotas de webhook (novo)
```

### Escape hatch para extracao futura

O `MediaStorageService` como interface na camada de aplicacao cria uma costura limpa. Se no futuro surgir:
- Biblioteca de midia compartilhada entre modulos
- Upload de midia por alunos (submissoes)
- Assets de admin (banners, marketing)

A extracao para modulo proprio e mecanica: move a interface + implementacoes, e os consumidores passam a depender via DI.

### Papel do EventBus

Quando o webhook de transcoding confirma que o video esta pronto, o catalog emite um `VideoProcessingCompleteEvent`. Se o learning precisar reagir (ex: recalcular duracao total do curso para alunos matriculados), ele se inscreve via EventBus. Isso mantem os modulos desacoplados sem precisar extrair media.

## Arquivos criticos

- [catalog/@types/index.ts](apps/main-api/src/modules/catalog/domain/@types/index.ts) -- evoluir `LessonContent`, adicionar tipos de status de upload
- [lesson.ts](apps/main-api/src/modules/catalog/domain/entities/lesson.ts) -- entidade que referencia video
- [course.ts](apps/main-api/src/modules/catalog/domain/entities/course.ts) -- thumbnail/coverImage
- [catalog/register.ts](apps/main-api/src/modules/catalog/register.ts) -- wiring dos novos servicos
- [container.ts](apps/main-api/src/container.ts) -- extender CradleInterface
- [event-bus.ts](packages/core/src/events/event-bus/event-bus.ts) -- primeiro uso real com eventos de video
