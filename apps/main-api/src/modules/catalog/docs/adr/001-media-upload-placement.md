# ADR 001: Onde colocar a lógica de media/upload (vídeo e imagens)

**Status:** Aceito
**Data:** Abril de 2026

## Contexto

A plataforma precisa de upload de vídeos (Bunny Stream, via TUS), imagens (URLs pré-assinadas,
S3) e attachments para aulas e cursos. O fluxo de vídeo envolve múltiplas etapas (obter
credenciais → upload direto ao provedor → registrar referência) e operações assíncronas
(transcoding via webhook, limpeza de uploads órfãos). A dúvida: criar um módulo `media`
dedicado, ou manter a lógica dentro de um módulo de negócio já existente?

## Opções consideradas

### Módulo `media` dedicado

- **Prós:** separa a preocupação técnica de armazenamento de mídia do restante do domínio;
  reusável caso outros contextos precisem de upload no futuro.
- **Contras:** hoje todos os consumidores de mídia estão no `catalog`
  (`Lesson.content.videoUrl`, `Lesson.content.attachments`, `Course.thumbnail`,
  `Course.coverImage`) — nenhum outro módulo faz upload ou gerencia lifecycle de mídia. Um
  módulo separado forçaria orquestração cross-module para o que hoje é uma única operação de
  domínio (criar aula com vídeo). Mídia também não tem significado de domínio independente
  aqui: não existe "biblioteca de mídia" como feature — um vídeo é sempre conteúdo de uma aula,
  uma imagem é sempre thumbnail de um curso.

### Manter dentro do módulo `catalog` (escolhida)

- **Prós:** os únicos consumidores já estão no catalog; evita orquestração cross-module
  desnecessária; consistente com YAGNI, já que o projeto tem poucos módulos hoje e o `learning`
  sequer está registrado no bootstrap ainda.
- **Contras:** se no futuro surgir upload de mídia por outros atores (ex: submissões de alunos,
  assets de marketing/admin) ou uma biblioteca de mídia compartilhada entre contextos, a lógica
  precisa ser extraída.

## Decisão

Manter a lógica de media/upload dentro do módulo `catalog`, organizada como subdomínio de
infraestrutura:

```
catalog/
  domain/
    @types/index.ts              -- tipos de upload status
    events/                      -- VideoProcessingCompleteEvent, etc.
  application/
    services/
      media-storage-service.ts   -- interface/port para operações de mídia
    use-cases/instructor/
      request-video-upload.ts    -- gera credenciais de upload
      confirm-video-upload.ts    -- associa referência de vídeo à aula
    use-cases/internal/
      handle-video-webhook.ts    -- processa webhook de transcoding
      clean-orphaned-uploads.ts  -- job de limpeza
  infrastructure/
    media/
      bunny-stream-service.ts     -- implementa upload/status de vídeo
      s3-presigned-url-service.ts -- implementa upload de imagem
    http/routes/
      webhook-routes.ts           -- rotas de webhook
```

`MediaStorageService`, como interface na camada de aplicação, funciona como um escape hatch: se
a extração para um módulo próprio se tornar necessária, é uma mudança mecânica — move a
interface e as implementações, e os consumidores continuam dependendo via DI, sem mudar de
contrato.

Quando o webhook de transcoding confirma que o vídeo está pronto, o catalog emite
`VideoProcessingCompleteEvent` via `EventBus`. Se o `learning` precisar reagir (ex: recalcular
a duração total do curso para alunos matriculados), ele se inscreve nesse evento — mantendo os
módulos desacoplados sem precisar extrair `media` cedo demais.

## Consequências

- Nenhuma orquestração cross-module para o fluxo mais comum hoje (criar/editar aula com vídeo).
- Acoplamento consciente: a lógica de mídia vive dentro do catalog mesmo sendo, em espírito,
  uma preocupação de infraestrutura — aceito porque não há consumidor fora do catalog hoje.
- Extração futura fica barata graças ao `MediaStorageService` como port explícito; essa decisão
  pode ser revertida sem reescrever os casos de uso que o consomem.
- **Estado no momento desta decisão:** ainda não implementado. Os arquivos citados
  (`bunny-stream-service.ts`, `s3-presigned-url-service.ts`, etc.) fazem parte do plano de
  execução, não do estado atual do código.
