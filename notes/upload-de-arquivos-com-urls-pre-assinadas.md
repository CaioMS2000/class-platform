# Upload de Arquivos em Plataformas Web: URLs Pré-Assinadas, Metadados e Validação

## Introdução

Em aplicações web modernas que lidam com upload de mídia e arquivos, uma das decisões arquiteturais mais importantes é como separar o tráfego de dados binários (imagens, vídeos, documentos) do tráfego de dados textuais e estruturados. Este documento aborda a abordagem padrão da indústria para resolver esse problema: o uso de URLs pré-assinadas em conjunto com serviços de object storage como Amazon S3, Google Cloud Storage e Cloudflare R2.

## O Problema: Por Que Não Enviar Arquivos no Payload Principal

Uma abordagem ingênua seria enviar o arquivo junto com os dados textuais no mesmo request HTTP, seja via multipart/form-data ou codificando o binário em Base64 dentro de um JSON. Essa abordagem apresenta diversos problemas.

Quando o arquivo trafega pelo servidor da aplicação, ele sobrecarrega a API, que precisa receber o binário inteiro, processá-lo em memória e depois reencaminhá-lo para o storage. Isso aumenta significativamente o tempo de resposta, consome memória do servidor e complica o tratamento de erros — se o upload falha no meio do caminho, tanto o arquivo quanto os dados textuais são perdidos.

A codificação em Base64 é particularmente problemática. Ela aumenta o tamanho do arquivo em aproximadamente 33%, desperdiça banda de rede e força o servidor a executar a decodificação. O único cenário em que essa abordagem se justifica minimamente é para dados extremamente pequenos, como thumbnails de poucos kilobytes que se deseja persistir inline em um campo JSON no banco de dados — e mesmo assim, é uma prática discutível.

## A Solução Padrão: URLs Pré-Assinadas

URLs pré-assinadas são o mecanismo padrão da indústria para upload de arquivos quando se utiliza object storage. O princípio fundamental é simples: o servidor da aplicação nunca manipula o binário do arquivo; quem faz o trabalho pesado de receber e armazenar os bytes é a infraestrutura do cloud provider, que foi projetada exatamente para isso.

### O Fluxo Clássico

O fluxo de upload com URLs pré-assinadas segue quatro etapas. Primeiro, o client solicita ao backend uma URL pré-assinada do tipo PUT. Em seguida, o backend gera essa URL utilizando as credenciais do bucket, configurando uma expiração curta (tipicamente entre 5 e 15 minutos), e a devolve ao client. O client então realiza o upload diretamente para o bucket, sem que os bytes passem pelo servidor da aplicação. Por fim, após a conclusão do upload, o client envia os dados textuais ao backend, incluindo a referência (key/path) do arquivo que acabou de ser armazenado.

### Variações e Alternativas

Embora as URLs pré-assinadas do tipo PUT sejam o padrão mais comum, existem variações relevantes. Para arquivos muito grandes, como vídeos, utiliza-se o multipart upload com múltiplas URLs pré-assinadas, uma para cada parte do arquivo, permitindo upload paralelo e resumível. No caso específico do S3, existe a alternativa das POST policies, onde em vez de uma URL PUT pré-assinada, gera-se uma policy assinada que o client utiliza em um POST direto para o bucket, oferecendo maior flexibilidade para controlar limites de tamanho e content-type. Há também serviços como Cloudflare Images, Uploadcare e Transloadit que oferecem endpoints de upload próprios com transformações on-the-fly, abstraindo completamente o bucket.

Para arquivos pequenos, como avatares de aproximadamente 100KB, algumas plataformas ainda aceitam multipart direto no backend por simplicidade. Embora não seja a abordagem ideal, o custo computacional é baixo o suficiente para não causar impacto significativo.

## Os Metadados no Payload da API

Uma vez que o arquivo é enviado diretamente para o bucket, o endpoint da API recebe apenas os metadados do arquivo, nunca o binário. O campo obrigatório mínimo é a key/path, pois sem ela não há como referenciar o arquivo no storage. Na prática, porém, costuma-se enviar informações adicionais.

Um payload típico inclui a key do arquivo no bucket (por exemplo, "uploads/user-123/abc-def-ghi.png"), o nome original do arquivo conforme estava na máquina do usuário, o content-type declarado (como "image/png") e o tamanho em bytes. O nome original é útil para exibição posterior ao usuário, já que a key no bucket geralmente é um UUID ou hash para evitar colisões de nome. O content-type e o tamanho servem como primeiro filtro de validação, embora, conforme discutido adiante, não sejam confiáveis por si só.

Um padrão comum e mais seguro é o backend não aceitar a key vinda do client. Nessa abordagem, o próprio backend define a key no momento de gerar a URL pré-assinada e já persiste essa referência internamente. Quando o client envia o payload final, ele apenas confirma a conclusão do upload referenciando a key que o backend gerou. Isso impede que um client malicioso envie uma key arbitrária apontando para o arquivo de outro usuário.

## Validação: O Que o Bucket Faz e o Que Ele Não Faz

Aqui reside um ponto crítico que exige atenção. Os serviços de object storage como S3, GCS e R2 são, em essência, armazenamentos "burros" no que diz respeito à validação de conteúdo. Eles recebem bytes, guardam bytes e devolvem bytes, sem inspecionar o que está sendo armazenado.

### Content-Length: Confiável

O tamanho do objeto é determinado de forma confiável pelo provider. Ele não depende do header Content-Length declarado pelo client — o servidor contabiliza os bytes que efetivamente chegaram e foram gravados via TCP. Se o client declarar um Content-Length de 1000 bytes mas enviar 5000, o provider registra 5000. Portanto, ao realizar um request HEAD no objeto, o Content-Length retornado reflete o tamanho real do arquivo armazenado.

### Content-Type: Não Confiável

O Content-Type, por outro lado, é tratado de forma completamente diferente. Os providers não realizam detecção independente do tipo de arquivo. Eles simplesmente armazenam o valor do Content-Type que o client declarou no momento do upload como um metadado opaco. Quando se faz um HEAD e se recebe "Content-Type: image/png", essa informação é apenas o que o client afirmou que o arquivo era. Nenhuma verificação foi feita pelo provider.

Isso significa que o request HEAD resolve a questão do tamanho, mas para o tipo do arquivo ele apenas devolve a declaração do client, não servindo como validação real.

### Validação Real: Magic Bytes

Para verificar o tipo de um arquivo de forma confiável, é necessário inspecionar seu conteúdo. A técnica padrão é a leitura dos magic bytes, que são os primeiros bytes do arquivo e funcionam como uma assinatura binária. Um arquivo PNG sempre começa com a sequência hexadecimal 89 50 4E 47, um JPEG com FF D8 FF, um PDF com 25 50 44 46, e assim por diante. Independentemente do que o client declarou como Content-Type, se os primeiros bytes correspondem a uma assinatura conhecida, o tipo real do arquivo está determinado.

Essa validação é inteiramente responsabilidade do desenvolvedor da aplicação. Os providers de object storage não executam essa verificação. Na prática, ela é tipicamente implementada por meio de uma função serverless (Lambda, Cloud Function, Worker) que é disparada automaticamente por um evento de upload no bucket. Quando um novo objeto é armazenado, o evento aciona a função, que lê apenas os primeiros bytes do arquivo (sem necessidade de baixar o conteúdo inteiro), verifica a assinatura, e toma a decisão cabível: se o tipo é permitido, atualiza os metadados e marca o arquivo como validado; se não é, deleta o objeto ou o move para uma área de quarentena.

## Considerações Sobre Necessidade da Validação

O nível de validação necessário depende diretamente do perfil de risco da aplicação. Para muitos cenários, a combinação de restringir o Content-Type na geração da URL pré-assinada (condicionando que o bucket só aceite, por exemplo, "image/png") com validação no lado do client já cobre a maioria dos casos de uso. Um agente mal-intencionado ainda pode burlar essas restrições forjando os headers, mas se o cenário é de baixo risco — como um aplicativo onde usuários fazem upload de fotos de perfil — o esforço adicional de implementar a pipeline completa de validação por magic bytes pode não se justificar.

Por outro lado, em plataformas que aceitam uploads públicos, que servem conteúdo diretamente para outros usuários, ou que processam documentos de forma automatizada, a validação por magic bytes é praticamente obrigatória. O risco de um upload malicioso — como um executável disfarçado de imagem — causar dano real é concreto e deve ser mitigado.

## Conclusão

A arquitetura de upload de arquivos em aplicações web modernas se sustenta sobre um princípio claro: separar o tráfego de binários do tráfego de dados estruturados. URLs pré-assinadas são o mecanismo padrão para essa separação, delegando o trabalho pesado de recepção e armazenamento ao cloud provider. A API da aplicação recebe apenas metadados leves, e a validação real do conteúdo — quando necessária — é responsabilidade exclusiva do desenvolvedor, implementada tipicamente via funções serverless que inspecionam os magic bytes dos arquivos armazenados.
