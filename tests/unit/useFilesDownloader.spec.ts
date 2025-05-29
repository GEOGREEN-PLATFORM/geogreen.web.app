import downloadFile from "@/composables/useFilesDownloader";
import { describe, expect, it, vi } from "vitest";

describe("useFilesDownloader composable", () => {
  it("downloads file and revokes url", () => {
    const click = vi.fn();
    const remove = vi.fn();
    const appendChild = vi.fn();
    const file = new Blob(["test"], { type: "application/pdf" });
    (globalThis as any).window = {
      URL: {
        createObjectURL: vi.fn(() => "blob:url"),
        revokeObjectURL: vi.fn(),
      },
    };
    (globalThis as any).document = {
      createElement: vi.fn(() => ({
        set href(_val: string) {},
        set download(_val: string) {},
        click,
        remove,
      })),
      body: { appendChild },
    };
    (globalThis as any).date = {
      formatDate: vi.fn(() => "28.05.2025 12:00:00"),
    };
    downloadFile(file, "testfile");
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect((globalThis as any).window.URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:url",
    );
  });
});
