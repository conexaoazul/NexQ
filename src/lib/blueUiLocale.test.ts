import { describe, expect, it } from "vitest";
import { blueTr } from "./blueUiLocale";

describe("Blue Meeting UI locale", () => {
  it("translates configured menu labels to Brazilian Portuguese", () => {
    expect(blueTr("Meeting", "pt-BR")).toBe("Reunião");
    expect(blueTr("Audio & Devices", "pt-BR")).toBe("Áudio e dispositivos");
  });
  it("preserves English when selected", () => {
    expect(blueTr("Meeting", "en-US")).toBe("Meeting");
  });
  it("falls back safely for missing translations", () => {
    expect(blueTr("Untranslated key", "pt-BR")).toBe("Untranslated key");
  });
});
