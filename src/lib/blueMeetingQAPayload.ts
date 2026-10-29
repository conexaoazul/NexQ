import type { Meeting, TranscriptSegment } from "./types";

/**
 * Offline-only interchange adapter for Odoo 19 QA blue.meeting.session.
 * This function does not access files/network or upload meetings.
 * The caller must establish real participant authorization and QA environment gates.
 */
export interface BlueMeetingQAExportOptions {
  companyId: number;
  consentConfirmed: true;
  consentEvidenceReference: string;
  leadId?: number;
  partnerId?: number;
}
export interface BlueMeetingQAPayload {
  name: string;
  company_id: number;
  provider: "desktop";
  external_session_id: string;
  consent_confirmed: true;
  state: "completed";
  transcript: string;
  language_code: "pt-BR";
  started_at: string;
  ended_at?: string;
  summary?: string;
  action_items?: string;
  lead_id?: number;
  partner_id?: number;
}

const MAX_SEGMENTS = 5000;
const MAX_TRANSCRIPT_CHARS = 500000;

/** Display transcript offsets instead of confusing relative time with wall clock. */
function offset(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
}
function odooUtc(iso: string): string {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) throw new Error("Invalid meeting timestamp");
  return t.toISOString().slice(0, 19).replace("T", " ");
}
function positiveId(id: number, field: string): number {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`Invalid ${field}`);
  return id;
}
function label(segment: TranscriptSegment): string {
  if (segment.speaker === "User") return "Você";
  if (segment.speaker === "Them" || segment.speaker === "Interviewer") {
    const tag = segment.speaker_tag?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
    return tag ? `Participante remoto (${tag})` : "Participante remoto";
  }
  return "Participante não identificado";
}
function renderTranscript(parts: readonly TranscriptSegment[]): string {
  const finals = parts.filter((p) => p.is_final && p.text.trim().length > 0);
  if (finals.length === 0) throw new Error("No final transcript segments");
  if (finals.length > MAX_SEGMENTS) throw new Error("Too many transcript segments");
  const transcript = finals
    .map((p) => {
      if (!Number.isFinite(p.timestamp_ms) || p.timestamp_ms < 0)
        throw new Error("Invalid transcript timestamp");
      // No raw speaker names, speaker identity still requires human verification.
      return `[${offset(p.timestamp_ms)}] ${label(p)}: ${p.text.trim()}`;
    })
    .join("\n");
  if (transcript.length > MAX_TRANSCRIPT_CHARS)
    throw new Error("Transcript exceeds QA limit");
  return transcript;
}

/**
 * Explicit consent evidence ref is validated but intentionally NOT included
 * in the Odoo payload: the currently deployed QA contract has no such field.
 * Store the evidence in an approved private registry, never commit it to Git.
 */
export function buildBlueMeetingQAPayload(
  meeting: Meeting,
  options: BlueMeetingQAExportOptions,
): BlueMeetingQAPayload {
  positiveId(options.companyId, "company_id");
  if (options.consentConfirmed !== true || !options.consentEvidenceReference?.trim())
    throw new Error("Recorded participant authorization required");
  if (!meeting.id?.trim() || !meeting.title?.trim()) throw new Error("Missing meeting identity");
  if (!meeting.end_time) throw new Error("Meeting must be completed before export");
  if (options.leadId !== undefined) positiveId(options.leadId, "lead_id");
  if (options.partnerId !== undefined) positiveId(options.partnerId, "partner_id");
  const started_at = odooUtc(meeting.start_time);
  const ended_at = odooUtc(meeting.end_time);
  if (ended_at < started_at) throw new Error("Meeting end precedes start");
  const payload: BlueMeetingQAPayload = {
    name: meeting.title.trim(),
    company_id: options.companyId,
    provider: "desktop",
    external_session_id: `nexq:${meeting.id.trim()}`,
    consent_confirmed: true,
    state: "completed",
    transcript: renderTranscript(meeting.transcript),
    language_code: "pt-BR",
    started_at,
    ended_at,
  };
  if (meeting.summary?.trim()) payload.summary = meeting.summary.trim();
  // Actions are suggestions until validated by a human; never auto-assign CRM tasks.
  if (meeting.action_items?.length) {
    payload.action_items = meeting.action_items.map((a) => a.text.trim()).filter(Boolean)
      .map((t) => `[A confirmar] ${t}`).join("\n");
  }
  if (options.leadId !== undefined) payload.lead_id = options.leadId;
  if (options.partnerId !== undefined) payload.partner_id = options.partnerId;
  return payload;
}
