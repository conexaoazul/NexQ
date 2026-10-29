import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (e: { payload: unknown }) => void;
const listeners = new Map<string, Set<Handler>>();
const emitted: string[] = [];

vi.mock("@tauri-apps/api/event", () => ({
  listen: async (name: string, cb: Handler) => {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name)!.add(cb);
    return () => listeners.get(name)!.delete(cb);
  },
  emit: async (name: string) => {
    emitted.push(name);
  },
}));

const confirm = vi.fn();
vi.mock("@tauri-apps/plugin-dialog", () => ({
  confirm: (...args: unknown[]) => confirm(...args),
}));

const installUpdateNow = vi.fn();
vi.mock("../lib/ipc", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/ipc")>()),
  installUpdateNow: () => installUpdateNow(),
}));

const windowLabel = vi.hoisted(() => ({ value: "launcher" }));
vi.mock("@tauri-apps/api/webviewWindow", () => ({
  getCurrentWebviewWindow: () => ({ label: windowLabel.value }),
}));

import { endMeetingFromThisWindow, restartToUpdate, MEETING_END_TIMEOUT_MS } from "./useUpdater";
import { useMeetingStore } from "../stores/meetingStore";
import { useToastStore } from "../stores/toastStore";

function windowEnded(window: string) {
  listeners.get("nexq:meeting_ended")?.forEach((cb) => cb({ payload: { window } }));
}

const flush = () => vi.advanceTimersByTimeAsync(0);

describe("restartToUpdate — Blue Meeting QA fail-closed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    listeners.clear();
    emitted.length = 0;
    confirm.mockReset();
    installUpdateNow.mockReset();
    useToastStore.setState({ toasts: [] });
    useMeetingStore.setState({ activeMeeting: null });
  });

  afterEach(() => vi.useRealTimers());

  it("does not check, download or install updates while idle", async () => {
    await restartToUpdate();
    expect(confirm).not.toHaveBeenCalled();
    expect(installUpdateNow).not.toHaveBeenCalled();
    expect(emitted).not.toContain("tray_stop_meeting");
  });

  it("does not interrupt a live meeting to install updates", async () => {
    useMeetingStore.setState({ activeMeeting: { id: "qa-active" } as never });
    await restartToUpdate();
    expect(confirm).not.toHaveBeenCalled();
    expect(installUpdateNow).not.toHaveBeenCalled();
    expect(emitted).not.toContain("tray_stop_meeting");
    expect(useMeetingStore.getState().activeMeeting?.id).toBe("qa-active");
  });
});

describe("endMeetingFromThisWindow", () => {
  const endMeetingFlow = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    listeners.clear();
    emitted.length = 0;
    endMeetingFlow.mockReset().mockResolvedValue(undefined);
    windowLabel.value = "launcher";
    useMeetingStore.setState({ activeMeeting: null, overlayMeetingId: null, endMeetingFlow } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("from the launcher, ends through every window when the overlay holds the meeting", async () => {
    useMeetingStore.setState({ activeMeeting: { id: "m1" } as never, overlayMeetingId: "m1" });

    let ended: boolean | undefined;
    const run = endMeetingFromThisWindow().then((ok) => (ended = ok));
    await flush();
    expect(emitted).toContain("tray_stop_meeting");
    expect(endMeetingFlow).not.toHaveBeenCalled(); // the launcher runs it from tray_stop_meeting

    windowEnded("launcher");
    await flush();
    expect(ended).toBeUndefined(); // still waiting for the overlay to save

    windowEnded("overlay");
    await run;
    expect(ended).toBe(true);
  });

  it("reports failure when the overlay never finishes", async () => {
    useMeetingStore.setState({ activeMeeting: { id: "m1" } as never, overlayMeetingId: "m1" });
    const run = endMeetingFromThisWindow();
    await flush();
    windowEnded("launcher");
    await vi.advanceTimersByTimeAsync(MEETING_END_TIMEOUT_MS);
    expect(await run).toBe(false);
  });

  it("from the launcher, ends by itself when no overlay took the meeting", async () => {
    useMeetingStore.setState({ activeMeeting: { id: "m1" } as never, overlayMeetingId: null });
    expect(await endMeetingFromThisWindow()).toBe(true);
    expect(endMeetingFlow).toHaveBeenCalledTimes(1);
    expect(emitted).not.toContain("tray_stop_meeting");
  });

  it("the overlay ends by itself", async () => {
    windowLabel.value = "overlay";
    useMeetingStore.setState({ activeMeeting: { id: "m1" } as never, overlayMeetingId: "m1" });
    expect(await endMeetingFromThisWindow()).toBe(true);
    expect(endMeetingFlow).toHaveBeenCalledTimes(1);
    expect(emitted).not.toContain("tray_stop_meeting");
  });

  it("does nothing without a meeting", async () => {
    expect(await endMeetingFromThisWindow()).toBe(true);
    expect(endMeetingFlow).not.toHaveBeenCalled();
    expect(emitted).toHaveLength(0);
  });
});
