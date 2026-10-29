import { beforeEach, describe, expect, it, vi } from "vitest";

// Keep storage local to this test: no OS, Tauri runtime, network or secrets.
vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(async () => ({
    set: vi.fn(async () => undefined),
    get: vi.fn(async () => null),
  })),
}));
import { useScenarioStore } from "../stores/scenarioStore";
import { BUILT_IN_SCENARIOS } from "./scenarios";

describe("Blue Meeting scenario editing safety", () => {
  beforeEach(() => {
    useScenarioStore.setState({
      activeScenarioId: "team_meeting",
      customScenarios: [],
      scenarioOverrides: {},
    });
  });

  it("resetting a single prompt retains all other overrides", () => {
    const store = useScenarioStore.getState();
    store.updatePrompt("team_meeting", "system_prompt", "Revisado em português");
    store.updatePrompt("team_meeting", "summary_prompt", "Resumo distinto");
    store.resetPromptOverride("team_meeting", "system_prompt");
    const next = useScenarioStore.getState();
    expect(next.scenarioOverrides.team_meeting).toEqual({
      summary_prompt: "Resumo distinto",
    });
    expect(next.getActiveTemplate().summary_prompt).toBe("Resumo distinto");
    expect(next.getActiveTemplate().system_prompt).toBe(BUILT_IN_SCENARIOS[0].system_prompt);
  });

  it("editing a custom scenario retains its identity and other prompts", () => {
    const first = { ...BUILT_IN_SCENARIOS[0], id: "blue-qa-test", is_custom: true };
    const store = useScenarioStore.getState();
    store.createCustomScenario(first);
    store.setActiveScenario(first.id as never);
    store.updateCustomScenario(first.id, { system_prompt: "Apenas este campo" });
    const next = useScenarioStore.getState();
    expect(next.activeScenarioId).toBe(first.id);
    expect(next.customScenarios).toHaveLength(1);
    expect(next.customScenarios[0].system_prompt).toBe("Apenas este campo");
    expect(next.customScenarios[0].summary_prompt).toBe(first.summary_prompt);
  });

  it("ignores duplicate scenario IDs to avoid repeat imports", () => {
    const first = { ...BUILT_IN_SCENARIOS[0], id: "blue-qa-duplicate", is_custom: true };
    const store = useScenarioStore.getState();
    store.createCustomScenario(first);
    store.createCustomScenario(first);
    expect(useScenarioStore.getState().customScenarios).toHaveLength(1);
  });
});
