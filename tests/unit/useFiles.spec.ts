import useFiles from "@/composables/useFiles";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("useFiles composable", () => {
  let store: any;
  beforeEach(() => {
    store = { apiV1: "http://api", user: null };
    (globalThis as any).useMainStore = vi.fn(() => store);
    (globalThis as any).$fetch = Object.assign(
      vi.fn(async (url: string) => {
        if (url.includes("upload")) return { id: "imgid" };
        throw new Error("Ошибка при загрузке фото");
      }),
      { raw: vi.fn(), create: vi.fn() },
    );
  });

  it("uploads photo successfully", async () => {
    const { uploadPhoto } = useFiles();
    const file = new File(["test"], "test.png");
    const res = await uploadPhoto(file);
    expect(res).toEqual({ id: "imgid" });
  });

  it("throws error on upload fail", async () => {
    (globalThis as any).$fetch = Object.assign(
      vi.fn(async () => {
        throw new Error("Ошибка при загрузке фото");
      }),
      { raw: vi.fn(), create: vi.fn() },
    );
    const { uploadPhoto } = useFiles();
    await expect(uploadPhoto(new File([""], "fail.png"))).rejects.toThrow(
      "Ошибка при загрузке фото",
    );
  });
});
