import { describe, expect, it } from "vitest";
import { BLUE_SCENARIO_PRESETS, presetsToInstall } from "./blueScenarioPresets";

describe("Blue Meeting optional scenario presets", () => {
  it("provides two different PT-BR professional profiles", () => {
    expect(BLUE_SCENARIO_PRESETS).toHaveLength(2);
    expect(new Set(BLUE_SCENARIO_PRESETS.map((p) => p.id)).size).toBe(2);
    for (const p of BLUE_SCENARIO_PRESETS) {
      expect(p.is_custom).toBe(true);
      expect(p.system_prompt).toContain("português brasileiro");
    }
  });
  it("never overwrites an existing profile", () => {
    const existing = new Set(["blue_sales_discovery_v1"]);
    const pending = presetsToInstall(existing);
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe("blue_technical_review_v1");
    expect(presetsToInstall(new Set(BLUE_SCENARIO_PRESETS.map((p)=>p.id)))).toHaveLength(0);
  });
  it("does not include company secrets or client-specific facts", () => {
    const text = JSON.stringify(BLUE_SCENARIO_PRESETS);
    expect(text).not.toMatch(/sk-proj-|password=|client_secret|api_key\s*[:=]|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/i);
  });
});
