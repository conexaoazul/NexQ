# Instalação segura — NexQ original → Blue Meeting AI

**Não desinstale o NexQ original.** A edição Blue Meeting é um build separado
de desenvolvimento, sem instalador validado ou publicação nesta etapa.

## Antes de instalar

1. Encerrar reunião e fechar NexQ (inclusive ícone da bandeja).
2. Exportar pelo próprio NexQ os registros e resumos desejados.
3. Fazer backup manual do diretório de dados indicado pelo aplicativo em
   Configurações > Geral e guardar em local privado. Não adicionar backup ao Git.
4. Conferir app/versão de origem, hashes do instalador e retenção de dados.
5. Não presumir que banco, chaves e arquivos de configuração de uma instalação
   podem ser copiados para outra. Preservar a origem intacta.

## Mudanças de identidade da edição Blue

- Nome: Blue Meeting AI (Conexão Azul / baseada em NexQ, com atribuição MIT).
- Identificador Tauri separado do original (visando instalação lado a lado).
- Atualizador do upstream **não** será usado; construir distribuição e assinar
  atualização em canal próprio somente após QA de ponta a ponta.
- Idioma de interface pt-BR por padrão, inglês opcional.
- Idioma de transcrição é configuração separada; pt-BR não se aplica
  automaticamente ao STT nem muda o idioma dos modelos.

## Preparação inicial

1. Testar microfone e áudio do sistema com fixture sintética antes de reunião real.
2. Escolher motor de transcrição local e testar precisão em pt-BR; evitar
   Web Speech se for requisito que áudio não deixe a máquina.
3. Selecionar um LLM local autorizado (Ollama) ou endpoint privado permitido.
4. Em Context Intelligence, importar `CONTEXT-PUBLIC-PTBR.md` somente se aprovado.
5. Ajustar Ações de IA / Cenários com `PROMPTS-PTBR.md`, sem sobrescrever
   automaticamente as configurações pessoais.
6. Habilitar captura somente depois de informar participantes e registrar autorização.
7. Validar uso de CPU/RAM, latência, duplicação de áudio, RAG e ausência de tráfego inesperado.

## Gate para instalador e produção

- `npm ci && npm test && npm run build` aprovados;
- build Tauri/Windows x64 e smoke real executados em estação de QA;
- licença e atribuição preservadas, artefatos assinados quando aplicável;
- testes PT-BR/EN e renderização com acentos;
- importação de contexto manual/opt-in, confidencialidade e retenção revisadas;
- nenhuma atualização do fork apontando para release do upstream;
- migração do original documentada sem copiar credenciais às cegas.

Até esses gates concluídos: **NO RELEASE / NO AUTO UPDATE / NO REINSTALL**.
