# Blue Meeting AI — handoff de homologação Windows (sem execução automática)

**Objetivo:** comprovar build, PT-BR, isolamento de instalações e áudio local. Este documento não autoriza instalar, gravar reuniões de clientes ou executar deploy.

Revisar PR #2 (upstream) e PR #3 (edição Blue) e usar o SHA exato do teste. A instalação atual do NexQ `com.nexq.app` deve permanecer intacta.

## Preflight Windows — estação QA

- Windows 10/11 x64, RAM ≥8 GB (16 GB recomendados para LLM/STT local), espaço suficiente e ambiente de teste isolado.
- Node recomendado do CI: 24 LTS; Rust toolchain estável; Visual Studio C++ Build Tools / Windows SDK; Git.
- Não usar credenciais pessoais nem áudio de cliente. Preparar fixture consentida e gabarito de transcrição pt-BR.
- Registrar `git rev-parse HEAD`, versão das ferramentas, CPU, RAM, GPU, Windows, teste de dispositivo WASAPI e fones.
- Verificar que o repositório está limpo; não executar scripts remotos de instalação sem revisão.

## Comandos de build / QA

```powershell
git checkout feat/blue-meeting-v2.28.3-consolidated-20261029
git status --short
git rev-parse HEAD
node --version
rustc --version

npm ci
npx tsc --noEmit
npm test
npm run build

Push-Location src-tauri
cargo check
Pop-Location

# Gerar instalador apenas na estação QA autorizada, após PASS:
npm run tauri build
```

Atenção: `npm run tauri build` depende de toolchain local e pode baixar dependências/ONNX; não confundir geração local com release pública ou instalação. Nunca executar como administrador sem necessidade.

## Checklist de software

- [ ] Instalador assinado ou SHA-256 registrado, origem do build conferida
- [ ] `productName=Blue Meeting AI`, `identifier=com.conexaoazul.blue.meeting` (diferente do NexQ original)
- [ ] Atualizações upstream **desabilitadas**; endpoint da edição aponta apenas ao fork; nenhum download automático
- [ ] Tela Geral: alternar português/inglês sem mudar o idioma STT
- [ ] Wizard, menus, acentos, acessibilidade e labels de botão funcionam em ambos idiomas
- [ ] Cenários: clicar `Adicionar perfis` cria exatamente 2 perfis e repetir não duplica
- [ ] Nenhum perfil corporativo aplicado automaticamente sobre configuração do usuário
- [ ] Piloto com microfone e áudio do sistema, transcrição dos dois lados e VAD sem perda de fala após pausa
- [ ] Desativar gravação de áudio bruto por padrão; autorização registrada para qualquer captura real
- [ ] Medir WER/latência CPU/RAM com gravação fictícia vs gabarito
- [ ] Verificar logs, ausência de chaves, Unicode (acentos), ausência de envios externos indevidos
- [ ] Abrir/fechar overlay não deixa janela branca; sem regressão do modo privacidade
- [ ] Export Odoo offline: segmentos finais, UTC, empresa autorizada e consentimento; sem POST/CRM
- [ ] Testar instalação lado a lado, backup separado, rollback e desinstalação sem afetar NexQ original

## Gate Odoo

`blueMeetingQAPayload.ts` apenas normaliza dados em memória. Não está conectado a botão de exportação nem a transporte de rede.

Antes de qualquer escrita: homologar o `BlueApps19/blue_meeting_ai`, resolver issue #1349 em ambiente protegido, dar credencial técnica QA e validar acl/isolamento multiempresa e readback. Não usar `--apply` enquanto bloqueado.

## Critérios de NO-GO

Qualquer falha de compilação/CI, vazamento de token, captura sem consentimento, migração não reversível, interferência na instalação original, perda de falas, WER não aceitável, atribuição de identidade não confirmada, editor sem garantia de armazenamento privado, dependência/copyright sem revisão, release não assinado.

**Estado inicial:** código em draft sem CI/QA Windows comprovada; NO RELEASE.
