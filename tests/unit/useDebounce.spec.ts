import { useDebounce } from "@/composables/useDebounce";
import { describe, expect, it, vi } from "vitest";

describe("useDebounce composable", () => {
  it("debounces function calls by key", () => {
    vi.useFakeTimers();
    const debounce = useDebounce();
    const fn = vi.fn();
    debounce(fn, 100, "key1");
    debounce(fn, 100, "key1"); // should clear previous
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("debounces multiple keys independently", () => {
    vi.useFakeTimers();
    const debounce = useDebounce();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    debounce(fn1, 50, "a");
    debounce(fn2, 100, "b");
    vi.advanceTimersByTime(50);
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(50);
    expect(fn2).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
