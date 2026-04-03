# Fluxo de Upload de Vídeo em Plataformas de Ensino: Orquestração entre Frontend, Backend e Serviço de Vídeo

## Introdução

Em plataformas de ensino online, o cadastro de uma aula com vídeo não é uma operação atômica. Diferentemente de um formulário convencional onde todos os dados são enviados em um único request, a presença de um arquivo de vídeo introduz um fluxo de múltiplas etapas que precisa ser orquestrado pelo frontend em coordenação com o backend da aplicação e o serviço de vídeo (seja ele um MediaCMS self-hosted, Bunny Stream, Cloudflare Stream ou qualquer outro). Este documento descreve esse fluxo em detalhes, incluindo os cuidados necessários para lidar com falhas e inconsistências.

## O Princípio: Separação entre Metadados e Binário

Conforme discutido no contexto de uploads com URLs pré-assinadas, a API da aplicação nunca recebe o binário do vídeo. Ela recebe apenas metadados leves: título, descrição, módulo ao qual a aula pertence e, crucialmente, a referência ao vídeo que já foi armazenado no serviço externo. Isso implica que o frontend é um participante ativo do processo, responsável por orquestrar as múltiplas etapas e garantir que a sequência seja completada corretamente.

## O Fluxo Completo em Três Etapas

### Etapa 1: Solicitação de Autorização de Upload

O instrutor preenche o formulário da aula (título, descrição, módulo, etc.) e seleciona o arquivo de vídeo. Neste momento, o frontend não dispara tudo de uma vez. Ele primeiro faz um request ao backend solicitando autorização para o upload — por exemplo, `POST /api/uploads/request`.

O backend, ao receber essa solicitação, realiza as seguintes operações: valida que o usuário autenticado tem permissão para criar aulas; gera as credenciais necessárias para upload direto ao serviço de vídeo (seja uma URL pré-assinada, headers pré-assinados no caso do Bunny Stream, ou um token de upload do MediaCMS); opcionalmente define restrições como tipos de arquivo permitidos, tamanho máximo e expiração das credenciais; e devolve essas informações ao frontend.

### Etapa 2: Upload Direto ao Serviço de Vídeo

Com as credenciais em mãos, o frontend realiza o upload do arquivo diretamente para o serviço de vídeo, sem que os bytes passem pelo backend da aplicação. Durante essa etapa, o frontend tem controle total sobre o request e pode exibir uma barra de progresso ao instrutor, indicando o andamento da transferência.

Para arquivos grandes, o upload idealmente utiliza um protocolo resumível como o TUS, que permite transferência em chunks e retomada em caso de falha de conexão, evitando que o instrutor precise recomeçar o upload do zero.

Ao concluir o upload com sucesso, o serviço de vídeo devolve ao frontend uma referência ao vídeo recém-armazenado — tipicamente um video ID, uma key, ou um identificador único. Em paralelo, o serviço inicia automaticamente o processamento do vídeo (transcoding para múltiplas resoluções, fragmentação HLS), que acontece de forma assíncrona e independente das próximas etapas do fluxo.

### Etapa 3: Registro da Aula no Backend

Somente após a confirmação de que o upload foi concluído com sucesso, o frontend faz o segundo request ao backend — por exemplo, `POST /api/lessons` — enviando os metadados textuais da aula junto com a referência do vídeo obtida na etapa anterior.

O payload desse request contém exclusivamente dados leves: título, descrição, módulo, a referência ao vídeo (video ID ou key), e opcionalmente metadados como o nome original do arquivo, content-type e tamanho. O backend persiste a aula no banco de dados com a referência ao vídeo e a aula passa a existir no sistema, embora o vídeo possa ainda estar em processamento no serviço de vídeo.

## O Problema dos Vídeos Órfãos

O fluxo descrito acima possui uma janela de vulnerabilidade entre a conclusão do upload (Etapa 2) e o registro da aula (Etapa 3). Nesse intervalo, diversas situações podem interromper o processo: o instrutor pode fechar o navegador, a conexão de rede pode cair, o instrutor pode simplesmente desistir, ou o request da Etapa 3 pode falhar por qualquer motivo no backend.

O resultado é um vídeo órfão — um arquivo que foi armazenado e possivelmente já está sendo processado no serviço de vídeo, mas que não está associado a nenhum registro no banco de dados da aplicação. Esses vídeos órfãos ocupam espaço de storage e geram custos sem propósito.

### Estratégia de Mitigação: Limpeza Periódica

A abordagem mais simples para lidar com vídeos órfãos é implementar uma rotina de limpeza (um cron job ou task agendada) que periodicamente verifica no serviço de vídeo quais uploads foram realizados mas nunca foram referenciados por nenhum registro no banco de dados da aplicação. Após um período seguro de espera (tipicamente 24 a 48 horas), esses vídeos são deletados automaticamente.

### Estratégia de Mitigação: Registro Prévio em Estado de Rascunho

Uma abordagem mais robusta é inverter parcialmente o fluxo. Na Etapa 1, além de gerar as credenciais de upload, o backend já cria um registro de aula em estado "rascunho" ou "pendente" no banco de dados, associando-o ao upload esperado. Quando o frontend completa a Etapa 3, o backend atualiza o registro existente para o estado "publicado", preenchendo os metadados restantes.

Essa abordagem oferece várias vantagens: o backend já sabe que existe um upload em andamento e pode monitorá-lo; se o fluxo for interrompido, o registro em rascunho sinaliza claramente que algo ficou incompleto; e o instrutor pode, ao voltar à plataforma, encontrar o rascunho e retomar o processo, inclusive reaproveitando o vídeo que já foi uploadado.

## Considerações Sobre o Papel do Frontend

O frontend não é um mero formulário passivo nesse fluxo. Ele é um orquestrador que precisa gerenciar a sequência de operações, tratar erros em cada etapa, e fornecer feedback visual ao instrutor durante todo o processo. Isso significa que o frontend precisa conhecer os detalhes técnicos da integração: ele precisa saber que existe uma etapa de solicitação de credenciais, que o upload vai direto para um serviço externo, e que o registro final é uma operação separada.

Na prática, essa complexidade é tipicamente encapsulada em um componente ou hook reutilizável (como um `useVideoUpload` em React, por exemplo) que abstrai as três etapas e expõe ao restante da aplicação uma interface simplificada com estados como "idle", "requesting", "uploading", "registering" e "done", acompanhados de informações de progresso e callbacks de erro.

## Conclusão

O cadastro de uma aula com vídeo em uma plataforma de ensino é intrinsecamente um fluxo de múltiplas etapas, consequência direta da decisão arquitetural de não trafegar binários pelo backend da aplicação. O frontend assume o papel de orquestrador, coordenando a solicitação de credenciais, o upload direto ao serviço de vídeo e o registro final dos metadados. A principal fragilidade desse fluxo — a possibilidade de vídeos órfãos — é mitigada por meio de rotinas de limpeza periódica ou, de forma mais robusta, pela criação prévia de registros em estado de rascunho que sinalizam uploads incompletos.
