import useFormatters from "@/composables/useFormatters";
import { describe, expect, it, vi } from "vitest";

global.fillDateByZero = vi.fn((n) => n);
global.useNumWord = vi.fn(() => "минут");

describe("useFormatters composable", () => {
  const { timeConverter } = useFormatters();

  it("returns undefined for empty date", () => {
    expect(timeConverter("")).toBeUndefined();
  });

  it("returns today for today date", () => {
    const now = new Date();
    const dateStr = now.toISOString();
    expect(timeConverter(dateStr)).toContain("сегодня");
  });

  it("returns yesterday for yesterday date", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString();
    expect(timeConverter(dateStr)).toContain("вчера");
  });

  it("returns year for past year", () => {
    const dateStr = "2020-01-01T12:00:00.000Z";
    expect(timeConverter(dateStr)).toContain("2020");
  });
});
