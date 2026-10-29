import { useSyncExternalStore } from "react";

/**
 * UI locale only. Speech/transcription language is configured separately.
 * The Blue Meeting edition defaults to pt-BR; users can switch to English.
 * This does not change native Tauri messages or text not yet wired to tr().
 */
export type BlueUiLocale = "pt-BR" | "en-US";
const KEY = "blue_meeting_ui_locale";
const CHANGE_EVENT = "blue-meeting-ui-locale-change";

const ptBR: Record<string, string> = {
  "Settings": "Configurações",
  "Settings navigation": "Navegação das configurações",
  "Run Setup Wizard": "Executar assistente de configuração",
  "Run setup wizard": "Executar assistente de configuração",
  "Close (Esc)": "Fechar (Esc)",
  "Close settings": "Fechar configurações",
  "Back": "Voltar",
  "Next": "Próximo",
  "Skip": "Pular",
  "Setup": "Configuração",
  "Meeting": "Reunião",
  "Audio & Devices": "Áudio e dispositivos",
  "Providers": "Provedores",
  "LLM Providers": "Provedores de IA",
  "STT Providers": "Provedores de transcrição",
  "Translation": "Tradução",
  "Intelligence": "Inteligência",
  "AI Actions": "Ações da IA",
  "Context Strategy": "Estratégia de contexto",
  "AI Scenarios": "Cenários de IA",
  "Noise Presets": "Perfis de ruído",
  "Confidence": "Confiança",
  "System": "Sistema",
  "Hotkeys": "Atalhos",
  "General": "Geral",
  "About": "Sobre",
  "Interface language": "Idioma da interface",
  "Changes only the app interface, not the spoken language used for transcription.": "Altera somente a interface, não o idioma de transcrição.",
  "Theme": "Tema",
  "Choose your preferred appearance": "Escolha a aparência do aplicativo",
  "Dark": "Escuro",
  "Light": "Claro",
  "Behavior": "Comportamento",
  "Auto-Summary": "Resumo automático",
  "Generate meeting summary when meeting ends": "Gerar um resumo ao encerrar a reunião",
  "Start on Login": "Iniciar com o Windows",
  "Launch NexQ automatically when you log in": "Abrir o assistente automaticamente ao entrar no Windows",
  "Overlay Transparency": "Transparência da janela flutuante",
  "How transparent the overlay background is": "Controle a transparência do fundo da janela flutuante",
  "Transparent": "Transparente",
  "Solid": "Opaco",
  "Data Directory": "Pasta de dados",
  "Where meeting data and recordings are stored": "Local de armazenamento das reuniões e gravações",
  "Default app data directory": "Pasta de dados padrão",
  "Change": "Alterar",
  "Select Data Directory": "Selecionar pasta de dados",
  "Context Window, Auto-Trigger, and AI instructions have moved to the": "A janela de contexto, os gatilhos automáticos e as instruções da IA agora estão na aba",
  "Step": "Etapa",
  "of": "de",
  "Welcome": "Boas-vindas",
  "Audio": "Áudio",
  "Ready": "Pronto",
  "Welcome to NexQ": "Bem-vindo ao Blue Meeting AI",
  "Audio Devices": "Dispositivos de áudio",
  "Ollama (Local LLM)": "Ollama (IA local)",
  "LM Studio (Local LLM)": "LM Studio (IA local)",
  "Not detected": "Não detectado",
  "Meeting in Progress": "Reunião em andamento",
  "Start Meeting": "Iniciar reunião",
  "Recent Meetings": "Reuniões recentes",
  "Delete All Meetings": "Excluir todas as reuniões",
  "Search meetings": "Pesquisar reuniões",
  "Context Intelligence": "Inteligência de contexto",
  // Scenario editor (prompts, profiles and actions)
  "Active Scenario": "Cenário ativo",
  "Shapes how the AI interprets the meeting context": "Define como a IA interpreta o contexto da reunião",
  "Create Custom": "Criar personalizado",
  "Clone this scenario": "Duplicar este cenário",
  "Clone": "Duplicar",
  "Create": "Criar",
  "Custom": "Personalizado",
  "custom": "personalizado",
  "Modified": "Alterado",
  "Reset all": "Restaurar tudo",
  "Reset to default": "Restaurar padrão",
  "Reset all overrides to default": "Restaurar todas as personalizações",
  "Delete this custom scenario": "Excluir este cenário personalizado",
  "Edit prompt": "Editar instrução",
  "Cancel": "Cancelar",
  "Save": "Salvar",
  "System Prompt": "Instruções do sistema",
  "Summary Prompt": "Instruções para o resumo",
  "Question Detection": "Detecção de perguntas",
  "Instructions for the AI's role and behavior during the meeting": "Define o papel e o comportamento da IA durante a reunião",
  "Structure and focus for post-meeting summaries": "Define a estrutura e o foco dos resumos da reunião",
  "Rules for detecting and prioritizing questions from transcript": "Regras para identificar e priorizar perguntas na transcrição",
  "Clone scenario as:": "Duplicar cenário como:",
  "New scenario name:": "Nome do novo cenário:",
  "e.g. Sales Call, 1:1 Meeting": "Ex.: Diagnóstico comercial, reunião individual",
  "Custom scenario": "Cenário personalizado",
  "Prompts": "Instruções da IA",
  "Team Meeting": "Reunião de equipe",
  "Lecture": "Aula",
  "Interview": "Entrevista",
  "Webinar": "Webinar",
  "Oral Exam": "Prova oral",
  // First-run audio and transcription wizard
  "Audio Setup": "Configuração de áudio",
  "Choose audio sources for you and the other party.": "Escolha as fontes de áudio da sua voz e dos demais participantes.",
  "Scanning devices...": "Verificando dispositivos...",
  "Smart Detect Sources": "Detectar fontes automaticamente",
  "Scan Results": "Resultado da verificação",
  "Active": "Ativo",
  "Silent": "Sem áudio",
  "You": "Você",
  "Them": "Participantes",
  "Audio Source": "Fonte de áudio",
  "Detecting devices...": "Procurando dispositivos...",
  "Default microphone": "Microfone padrão",
  "Default output (loopback)": "Saída padrão (loopback)",
  "Microphones": "Microfones",
  "Speakers / Output": "Alto-falantes / Saída",
  " (Default)": " (Padrão)",
  "Refresh devices": "Atualizar dispositivos",
  "Microphone Test": "Teste do microfone",
  "Test Audio": "Testar áudio",
  "Mic": "Mic.",
  "Microphone audio level": "Nível de áudio do microfone",
  "Speak now to verify your microphone...": "Fale agora para testar o microfone...",
  "Click \"Test Audio\" and speak to check": "Clique em \"Testar áudio\" e fale para verificar",
  "Speech-to-Text Setup": "Configuração da transcrição",
  "Choose how each party's audio gets transcribed.": "Escolha como a voz de cada participante será transcrita.",
  "STT Provider": "Provedor de transcrição",
  "Whisper.cpp (Local)": "Whisper.cpp (Local)",
  "Browser-native, works with microphone input": "Reconhecimento do navegador; pode precisar de internet",
  "OpenAI Whisper running locally — offline, free": "Whisper local e offline; requer modelo instalado",
  "Real-time streaming STT, high accuracy": "Transcrição em tempo real na nuvem",
  "OpenAI Whisper, excellent multilingual support": "Reconhecimento multilíngue via API externa",
  "Ultra-fast Whisper inference": "Processamento rápido via serviço externo",
  "FREE": "GRÁTIS",
  "You:": "Você:",
  "Them:": "Participantes:",
  "Web Speech API is not available for \"Them\" — it only works with the browser's microphone.": "Web Speech não captura o áudio remoto; utilize Whisper.cpp ou outro motor compatível.",
  "You're All Set!": "Configuração concluída!",
  "NexQ is ready to be your AI meeting assistant.": "Blue Meeting AI pronto para apoiar suas reuniões.",
  "Audio Configuration": "Configuração de áudio",
  "Keyboard Shortcuts": "Atalhos de teclado",
  "Go to Launcher": "Abrir painel principal",
  "Upload your resume for personalized responses": "Adicionar contexto autorizado para respostas personalizadas",
  "Trigger AI Assist": "Ativar assistente de IA",
  "During meeting": "Durante a reunião",
  "Start / End meeting": "Iniciar / encerrar reunião",
  "Global": "Global",
  "Show / Hide overlay": "Exibir / ocultar janela flutuante",
  "What to Say mode": "Modo resposta sugerida",
  "Shorten mode": "Modo resumir",
  "Follow-up mode": "Modo acompanhamento",
  "Recap mode": "Modo revisão",
  "Ask Question mode": "Modo perguntar",
  "Open Settings": "Abrir configurações",
  "Close overlay / settings": "Fechar janela flutuante / configurações",


};

function readLocale(): BlueUiLocale {
  try {
    return window.localStorage.getItem(KEY) === "en-US" ? "en-US" : "pt-BR";
  } catch {
    return "pt-BR";
  }
}
function subscribe(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
export function useBlueUiLocale(): BlueUiLocale {
  return useSyncExternalStore(subscribe, readLocale, () => "pt-BR");
}
export function setBlueUiLocale(locale: BlueUiLocale): void {
  try { window.localStorage.setItem(KEY, locale); } catch { /* ephemeral session */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function blueTr(text: string, locale: BlueUiLocale): string {
  return locale === "pt-BR" ? (ptBR[text] ?? text) : text;
}
