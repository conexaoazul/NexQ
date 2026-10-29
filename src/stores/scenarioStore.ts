import { create } from "zustand";
import { load, Store } from "@tauri-apps/plugin-store";
import type { AIScenario, ScenarioTemplate } from "../lib/types";
import { BUILT_IN_SCENARIOS, getScenarioById } from "../lib/scenarios";

const STORE_FILE = "config.json";

// Lazy singleton for Tauri plugin-store (shared with configStore)
let storeInstance: Store | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await load(STORE_FILE, { autoSave: true, defaults: {} });
  }
  return storeInstance;
}

async function persistValue(key: string, value: unknown): Promise<void> {
  try {
    const store = await getStore();
    await store.set(key, value);
  } catch (err) {
    console.error(`[scenarioStore] Failed to persist "${key}":`, err);
  }
}

interface ScenarioState {
  activeScenarioId: AIScenario;
  customScenarios: ScenarioTemplate[];
  scenarioOverrides: Record<string, Partial<ScenarioTemplate>>;

  // Actions
  setActiveScenario: (id: AIScenario) => void;
  getActiveTemplate: () => ScenarioTemplate;
  updatePrompt: (
    scenarioId: string,
    field: keyof Pick<ScenarioTemplate, "system_prompt" | "summary_prompt" | "question_detection_prompt">,
    value: string
  ) => void;
  resetScenarioOverrides: (scenarioId: string) => void;
  resetPromptOverride: (
    scenarioId: string,
    field: keyof Pick<ScenarioTemplate, "system_prompt" | "summary_prompt" | "question_detection_prompt">,
  ) => void;
  createCustomScenario: (template: ScenarioTemplate) => void;
  updateCustomScenario: (id: string, patch: Partial<ScenarioTemplate>) => void;
  deleteCustomScenario: (id: string) => void;
  cloneScenario: (sourceId: string, newName: string) => ScenarioTemplate | null;

  // Persistence
  loadScenarioConfig: () => Promise<void>;
}

export const useScenarioStore = create<ScenarioState>((set, get) => ({
  activeScenarioId: "team_meeting",
  customScenarios: [],
  scenarioOverrides: {},

  setActiveScenario: (id) => {
    set({ activeScenarioId: id });
    persistValue("activeScenarioId", id);
  },

  getActiveTemplate: () => {
    const { activeScenarioId, customScenarios, scenarioOverrides } = get();

    // Check custom scenarios first
    const custom = customScenarios.find((s) => s.id === activeScenarioId);
    if (custom) return custom;

    // Fall back to built-in merged with overrides
    const builtIn = getScenarioById(activeScenarioId);
    if (!builtIn) {
      // Fallback to team_meeting if active scenario not found
      return BUILT_IN_SCENARIOS[0];
    }

    const overrides = scenarioOverrides[activeScenarioId];
    if (!overrides) return builtIn;

    return { ...builtIn, ...overrides };
  },

  updatePrompt: (scenarioId, field, value) => {
    set((s) => {
      const existing = s.scenarioOverrides[scenarioId] ?? {};
      const updated = {
        ...s.scenarioOverrides,
        [scenarioId]: { ...existing, [field]: value },
      };
      persistValue("scenarioOverrides", updated);
      return { scenarioOverrides: updated };
    });
  },

  resetScenarioOverrides: (scenarioId) => {
    set((s) => {
      const updated = { ...s.scenarioOverrides };
      delete updated[scenarioId];
      persistValue("scenarioOverrides", updated);
      return { scenarioOverrides: updated };
    });
  },

  resetPromptOverride: (scenarioId, field) => {
    set((s) => {
      const existing = s.scenarioOverrides[scenarioId];
      if (!existing || !(field in existing)) return s;
      const next = { ...existing };
      delete next[field];
      const updated = { ...s.scenarioOverrides };
      if (Object.keys(next).length) updated[scenarioId] = next;
      else delete updated[scenarioId];
      persistValue("scenarioOverrides", updated);
      return { scenarioOverrides: updated };
    });
  },

  createCustomScenario: (template) => {
    set((s) => {
      if (s.customScenarios.some((scenario) => scenario.id === template.id)) return s;
      const updated = [...s.customScenarios, template];
      persistValue("customScenarios", updated);
      return { customScenarios: updated };
    });
  },

  updateCustomScenario: (id, patch) => {
    // Restrict edits to prompt fields; retain ID, name and ownership.
    const changes = {
      ...(patch.system_prompt !== undefined && { system_prompt: patch.system_prompt }),
      ...(patch.summary_prompt !== undefined && { summary_prompt: patch.summary_prompt }),
      ...(patch.question_detection_prompt !== undefined && { question_detection_prompt: patch.question_detection_prompt }),
    };
    if (Object.keys(changes).length === 0) return;
    set((s) => {
      if (!s.customScenarios.some((scenario) => scenario.id === id)) return s;
      const updated = s.customScenarios.map((scenario) =>
        scenario.id === id ? { ...scenario, ...changes } : scenario,
      );
      persistValue("customScenarios", updated);
      return { customScenarios: updated };
    });
  },

  deleteCustomScenario: (id) => {
    set((s) => {
      const updated = s.customScenarios.filter((sc) => sc.id !== id);
      persistValue("customScenarios", updated);
      // If deleting active scenario, fall back to team_meeting
      const activeId = s.activeScenarioId === id ? "team_meeting" : s.activeScenarioId;
      if (activeId !== s.activeScenarioId) {
        persistValue("activeScenarioId", activeId);
      }
      return { customScenarios: updated, activeScenarioId: activeId };
    });
  },

  cloneScenario: (sourceId, newName) => {
    const state = get();

    // Find source: check custom first, then built-in
    const source =
      state.customScenarios.find((s) => s.id === sourceId) ??
      getScenarioById(sourceId);

    if (!source) return null;

    // Apply overrides for built-ins before cloning
    const overrides = state.scenarioOverrides[sourceId];
    const base = overrides ? { ...source, ...overrides } : source;

    const cloned: ScenarioTemplate = {
      ...base,
      id: `custom_${Date.now()}`,
      name: newName,
      is_custom: true,
    };

    const updated = [...state.customScenarios, cloned];
    set({ customScenarios: updated });
    persistValue("customScenarios", updated);

    return cloned;
  },

  loadScenarioConfig: async () => {
    try {
      const store = await getStore();

      const activeScenarioId = await store.get<AIScenario>("activeScenarioId");
      const customScenarios = await store.get<ScenarioTemplate[]>("customScenarios");
      const scenarioOverrides = await store.get<Record<string, Partial<ScenarioTemplate>>>("scenarioOverrides");

      set((s) => ({
        ...s,
        ...(activeScenarioId != null && { activeScenarioId }),
        ...(customScenarios != null && { customScenarios }),
        ...(scenarioOverrides != null && { scenarioOverrides }),
      }));

      console.log("[scenarioStore] Scenario config loaded");
    } catch (err) {
      console.error("[scenarioStore] Failed to load scenario config:", err);
    }
  },
}));
