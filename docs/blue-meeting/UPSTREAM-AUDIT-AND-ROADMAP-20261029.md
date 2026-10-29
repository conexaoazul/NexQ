# Blue Meeting AI — auditoria de branches e integração por capacidades

Data do inventário: 29/10/2026. Resultado obtido via GitHub (branches paginadas e comparadas).

## Estado do fork

- Base original em `conexaoazul/NexQ`: `c05734ad` (2.28.0).
- `naxhq/NexQ@main` auditado: `30ae24e6` (2.28.3 + correção de ZIP). 21 commits à frente.
- `sync/upstream-nexq-v2.28.3-20261029`: sincronizado por fast-forward isolado; PR #2 draft.
- Esta branch: alterações Blue Meeting PT-BR reaplicadas sobre upstream 2.28.3, sem modificar `main`.
- PR #1: primeira implementação PT-BR em base antiga; evitar merge duplicado quando esta branch estiver validada.

## Inventário completo: 9 branches NexQ (em relação à main)

| Branch | Ahead | Behind | Decisão |
|---|---:|---:|---|
| main | — | — | Base canônica dos 21 commits |
| integrate/deps-and-pr26 | 0 | 36 | Histórico incorporado, não portar |
| integrate/pr-9 | 0 | 61 | Histórico incorporado, não portar |
| dependabot/cargo/src-tauri/wasapi-0.26.0 | 1 | 21 | Não portar: main remove dependência wasapi não usada |
| dependabot/npm_and_yarn/website/astro-7.3.3 | 1 | 87 | Website, fora do desktop; revisar isoladamente |
| dependabot/npm_and_yarn/website/devalue-5.9.4 | 1 | 87 | Dependência website; não cherry-pick |
| dependabot/npm_and_yarn/website/smol-toml-1.9.1 | 1 | 87 | Dependência website; não cherry-pick |
| dependabot/npm_and_yarn/website/tailwindcss-4.3.3 | 1 | 59 | Website, requer QA visual do site |
| dependabot/npm_and_yarn/website/vite-6.4.5 | 1 | 87 | Website, requer CI própria |

`armpro24-blip/MeetingBro`: `feat/asr-benchmark-baseline`, `feat/in-app-config-and-backend-supervisor` e `feat/whisper-turbo-option` estão 32–34 commits atrás da main e não têm commits exclusivos. O fork `conexaoazul/MeetingBro` coincide com a main examinada.

## Prioridades de upstream

**P0 antes de distribuição**: ZIP parser advisory em `30ae24e6`; não logar configuração com API key ou `auth_value` em `cf664e3` / `ea5a3e0`; revisar lockfiles e dependências.

**P1 estabilidade de reunião**: Deepgram depois de silêncio `f4e5d76`; correções unicode no log `cb5740e` e `253e88a`; janela branca/stealth `0a12b73`; catálogo Anthropic `b50d0f7`.

**P2 manutenção**: Node 24, componentes macOS/Linux, dependências de PDF/websocket, observabilidade.

Nenhuma destas evidências equivale a CI compilada em nosso fork ou a QA com áudio real.

## Matriz de reuso de outros repositórios

| Origem pública | Recurso útil | Método de adoção | Restrições / gate |
|---|---|---|---|
| [MeetingBro](https://github.com/armpro24-blip/MeetingBro) (MIT) | Resumo periódico, meeting board, preview rápido, benchmarks | Inspirar telas/UX e contratos com atribuição, sem duplicar captura | NexQ já tem STT e resumo; manter um pipeline único e testar latência |
| [WhisperLiveKit](https://github.com/QuentinFuxa/WhisperLiveKit) (Apache-2.0) | STT privado streaming, endpoint nativo `/asr`, subset Deepgram `/v1/listen`, diarização | Adaptador/backend privado opcional, sem embutir servidor em instalador | NexQ fixa host `api.deepgram.com`; compatibilidade **NÃO** é plug-and-play, requer endpoint configurável, TLS/auth e testes |
| [Vexa](https://github.com/Vexa-ai/vexa) (Apache-2.0) | Bot de reunião Meet/Teams/Zoom, API, identidade de reunião | Serviço separado no backend, conexão opt-in de sessões autorizadas | Uso de CPU/memória e risco de captura; verificar configuração STT local, consentimento e isolamento |
| [Meetily](https://github.com/Zackriya-Solutions/meetily) (licença comunitária alegada MIT no README; verificar artefato exato) | UX local, mistura de áudio, resumos com Ollama | Benchmark comparativo e padrões de UX; sem copiar edition Pro | Não importar código Pro ou recursos sujeitos a licença distinta |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | Decodificação local eficiente | Reusar serviço/algoritmo sob licença aplicável ou adapter | Medir GPU/RAM, efeitos de dupla transcrição |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | Inferência local Windows | Preferir backend já suportado no NexQ | Fixar modelos e respeitar licenças dos pesos |
| [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) | ASR online offline (streaming) | Reusar o provedor NexQ existente | Comparar WER/RTF com Whisper em pt-BR |
| [silero-vad](https://github.com/snakers4/silero-vad) | Detecção de voz e silêncio | Avaliar no pipeline STT sem duplicar VAD | Não cortar perguntas, falas curtas, sotaques, nomes |
| [pyannote-audio](https://github.com/pyannote/pyannote-audio), [WhisperX](https://github.com/m-bain/WhisperX) | Diarização e alinhamento pós-reunião | Só worker de QA/backend ou serviço opcional | Custos/modelos/licenças, identidade de falantes não confirmada |

**Política:** componentes de múltiplos upstreams devem se integrar por APIs/contratos versionados; não copiar repositórios inteiros para `src/` e não ligar vários ASRs na mesma reunião por padrão.

## Evolução por fases

**F0 — distribuição segura (bloqueante):** validar 21 commits, revisar ZIP/token/Unicode, CI Windows, build Tauri, hashes de artefatos, app id separado, sem updater upstream.

**F1 — produtividade do desktop:** PT-BR integral por keys de i18n, seletores de idioma e STT separados, perfis comercial e técnico opt-in, prompts revisáveis, RAG somente com documentos aprovados.

**F2 — eficiência:** benchmark local por máquina, VAD, WER em pt-BR com gabarito, latência p50/p95, carga CPU/RAM, detecção de silêncio e duplicidade, perfis de qualidade CPU/GPU.

**F3 — integração Odoo/n8n:** contrato de sessão normalizado, export somente de segmentos finais e após consentimento; QA read-only/dry-run primeiro, depois integração autorizada e revisão humana antes de CRM.

**F4 — multimodal e serviços:** Vexa para bot consentido, WhisperLiveKit endpoint privado, telefonia Asterisk sintética sem tocar clientes, isolamento multiempresa, observabilidade.

## Arquitetura e critérios de exclusão

- O processo Windows não grava/ouve uma reunião sem ação deliberada e autorização registrada.
- Prioridade `STT local -> LLM local`; nuvem é opt-in, com indicação de custo/tráfego.
- Nunca indexar dados privados no repo público, código-fonte, exemplo ou instalador.
- Diarização é identificação de canal/falante, não a identidade real de uma pessoa.
- Conectar Vexa ou WLK exige serviço privado, autorização, termos/licença, orçamento e rollback.
- Nenhum alerta, proposta, cobrança ou follow-up é enviado automaticamente.
- QA validada exige gabarito sintético, teste Windows real, instância Odoo QA com credenciais segregadas, retenção, logs seguros.
- Não criar fork de terceiros em massa sem ganho justificável; priorizar integração e atualização sustentável.

## Próximos passos verificáveis

1. PR #2 sincronização upstream: executar CI e review de segurança (NO MERGE até gate).
2. PR de consolidação em base 2.28.3: tsc, vitest, cargo check e smoke no Windows.
3. Rever se a UI traduzida realmente acompanha todas as janelas, incluindo as abertas separadamente.
4. Completar tradução integral de Settings/Scenarios/Audio sem alterações de UX regressivas.
5. Testar importação opcional de perfis e JSON QA offline com sessão fictícia.
6. Produzir instalador Windows **somente** após fixação de SHA, smoke e política de atualização assinada.
