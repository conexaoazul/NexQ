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
