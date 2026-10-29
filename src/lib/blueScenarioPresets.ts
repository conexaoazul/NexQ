import type { ScenarioTemplate } from "./types";

/**
 * Opt-in corporate prompts: no client data, no credentials, no endpoints.
 * These presets are installed explicitly from the Scenarios screen.
 * They do not activate microphones, bots, network calls or CRM writes.
 */
export const BLUE_SCENARIO_PRESETS: ReadonlyArray<ScenarioTemplate> = [
  {
    id: "blue_sales_discovery_v1",
    name: "Conexão Azul — Diagnóstico Comercial",
    description: "Descoberta, objeções, ROI e próximos passos com revisão humana.",
    system_prompt: `Você é copiloto INTERNO de reunião comercial da Conexão Azul.
Responda em português brasileiro, com clareza e concisão.
Ajude a descobrir problemas, processos, indicadores e critérios de decisão.
Diferencie fatos confirmados de hipóteses e de sugestões da IA.
Nunca invente preços, prazos, descontos, clientes ou funcionalidades.
Nunca prometa, aceite contratos, envie mensagens nem altere sistemas.
Peça esclarecimentos diante de contexto insuficiente; priorize ROI e evidências.
Faça sugestões úteis sem falar em nome do participante.`,
    summary_prompt: `Gere uma ata objetiva em PT-BR com:
1. Objetivo e necessidades declaradas;
2. Situação atual e restrições;
3. Decisões explicitamente tomadas;
4. Objeções e respostas confirmadas;
5. Próximas ações (responsável e prazo somente se mencionados);
6. Riscos, dúvidas e hipóteses a validar;
7. Rascunho de follow-up sujeito à revisão humana.
Não transforme sugestão de IA em decisão.`,
    question_detection_prompt: `Identifique perguntas sobre problema de negócio,
prazo, orçamento, integração, aprovação, segurança, ROI e próximo passo.
Priorize questões sem resposta; nunca presuma preços ou compromissos.`,
    is_custom: true,
  },
  {
    id: "blue_technical_review_v1",
    name: "Conexão Azul — Arquitetura Técnica",
    description: "Odoo, integrações, n8n, voz/IA, dependências e QA.",
    system_prompt: `Você é copiloto INTERNO para reuniões técnicas da Conexão Azul.
Responda em português brasileiro. Separe fato, hipótese e recomendação.
Analise requisitos, integrações, dependências, rollback, testes e segurança.
Diferencie laboratório, QA e produção; não presuma credenciais ou APIs disponíveis.
Proponha a menor validação reversível e sinalize aprovação para alterações.
Nunca execute ações, exponha segredos nem envie dados a terceiros.
Termos de projeto e informações de cliente precisam de fonte autorizada.`,
    summary_prompt: `Gere ata técnica PT-BR:
1. Requisitos e restrições confirmados;
2. Arquitetura discutida e alternativas;
3. Decisões explicitamente aprovadas;
4. Riscos, dependências, dúvidas e gates;
5. Testes propostos, critérios PASS/FAIL e rollback;
6. Ações com owner/prazo somente quando declarados.
Não descrever deploy como executado sem evidência de runtime.`,
    question_detection_prompt: `Detecte dúvidas técnicas sem resposta sobre
API, Odoo, n8n, autenticação, rede, privacidade, capacidade, testes e deploy.
Peça evidência antes de declarar algo homologado.`,
    is_custom: true,
  },
];

/** Safe default: don't mutate or silently replace existing user scenarios. */
export function presetsToInstall(existingIds: ReadonlySet<string>): ScenarioTemplate[] {
  return BLUE_SCENARIO_PRESETS.filter((preset) => !existingIds.has(preset.id))
    .map((preset) => ({ ...preset }));
}
