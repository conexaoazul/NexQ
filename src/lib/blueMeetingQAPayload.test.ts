import { describe, expect, it } from "vitest";
import type { Meeting } from "./types";
import { buildBlueMeetingQAPayload } from "./blueMeetingQAPayload";

const meeting: Meeting = {
  id: "synthetic-123",
  title: "Reunião fictícia",
  start_time: "2026-10-29T10:00:00-03:00",
  end_time: "2026-10-29T10:02:00-03:00",
  duration_seconds: 120,
  transcript: [
    { id: "a", text: "Olá, vamos validar.", speaker: "User", timestamp_ms: 1000, is_final: true, confidence: 0.9 },
    { id: "b", text: "Texto provisório", speaker: "Them", timestamp_ms: 5000, is_final: false, confidence: 0.4 },
    { id: "c", text: "Sim, confirmado.", speaker: "Them", speaker_tag: "S2", timestamp_ms: 9000, is_final: true, confidence: 0.8 },
  ],
  ai_interactions: [],
  summary: "Teste sintético.",
  config_snapshot: null,
  action_items: [{ id: "act1", text: "Conferir configurações", timestamp_ms: 9000, completed: false }],
};
const auth = { companyId: 7, consentConfirmed: true as const, consentEvidenceReference: "QA-FICTICIO-001" };

describe("Blue Meeting Odoo QA interchange (offline)", () => {
  it("exports only final segments and UTC timestamps", () => {
    const p = buildBlueMeetingQAPayload(meeting, auth);
    expect(p.external_session_id).toBe("nexq:synthetic-123");
    expect(p.started_at).toBe("2026-10-29 13:00:00");
    expect(p.ended_at).toBe("2026-10-29 13:02:00");
    expect(p.transcript).toContain("[00:00:01] Você: Olá");
    expect(p.transcript).toContain("Participante remoto (S2)");
    expect(p.transcript).not.toContain("Texto provisório");
    expect(p.action_items).toContain("[A confirmar]");
    expect(JSON.stringify(p)).not.toContain("QA-FICTICIO-001");
  });
  it("fails without auditable consent", () => {
    expect(() => buildBlueMeetingQAPayload(meeting, { ...auth, consentEvidenceReference: "" })).toThrow("authorization");
    expect(() => buildBlueMeetingQAPayload(meeting, { ...auth, consentConfirmed: false } as never)).toThrow("authorization");
  });
  it("fails on missing end time or invalid company", () => {
    expect(() => buildBlueMeetingQAPayload({ ...meeting, end_time: null }, auth)).toThrow("completed");
    expect(() => buildBlueMeetingQAPayload(meeting, { ...auth, companyId: 0 })).toThrow("company_id");
  });
  it("fails when only provisional segments exist", () => {
    expect(() => buildBlueMeetingQAPayload({ ...meeting, transcript: meeting.transcript.filter(s => !s.is_final) }, auth)).toThrow("final");
  });
});
