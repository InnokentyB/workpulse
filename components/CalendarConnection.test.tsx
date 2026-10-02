import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CalendarConnection } from "./CalendarConnection";

afterEach(() => vi.unstubAllGlobals());

it("shows configuration instructions when Google OAuth is unavailable", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ configured: false, connected: false })));
  render(<CalendarConnection />);
  expect(await screen.findByText(/needs local OAuth configuration/i)).toBeDefined();
  expect(screen.queryByRole("button", { name: /check next 8 hours/i })).toBeNull();
});

it("selects the primary calendar and shows bounded availability without event details", async () => {
  const fetcher = vi.fn(async (input: string) => {
    if (input.endsWith("/session")) return Response.json({ configured: true, connected: true });
    if (input.endsWith("/calendars")) return Response.json({ calendars: [
      { id: "primary", name: "Personal", primary: true },
      { id: "work", name: "Work", primary: false },
    ] });
    if (input.includes("availability")) return Response.json({ busy: [], context: { isBusy: false,
      minutesToNextMeeting: null, currentBusyEnd: null }, timeMin: "2026-10-02T09:00:00Z", timeMax: "2026-10-02T17:00:00Z" });
    throw new Error(`Unexpected request: ${input}`);
  });
  vi.stubGlobal("fetch", fetcher);
  render(<CalendarConnection />);
  expect(await screen.findByText("Personal (primary)")).toBeDefined();
  expect((screen.getByRole("checkbox", { name: /personal/i }) as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByRole("checkbox", { name: "Work" }));
  fireEvent.click(screen.getByRole("button", { name: /check next 8 hours/i }));
  expect(await screen.findByRole("heading", { name: "Free now" })).toBeDefined();
  expect(screen.getByText(/five-minute window is available/i)).toBeDefined();
  await waitFor(() => expect(fetcher.mock.calls.some(([url]) =>
    url.includes("calendarId=primary") && url.includes("calendarId=work"))).toBe(true));
});
