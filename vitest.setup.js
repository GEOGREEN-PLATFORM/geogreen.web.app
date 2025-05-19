import { vi } from "vitest";

vi.stubGlobal("URL", { createObjectURL: () => "a nice URL" });
global.Worker = class {
  postMessage() {}
  terminate() {}
};
import { URL } from "node:url";
// @ts-ignore
global.URL = URL;

if (!navigator.clipboard) {
  // @ts-ignore
  navigator.clipboard = {};
}

// @ts-ignore
navigator.clipboard.writeText = vi.fn().mockResolvedValue();
Object.defineProperty(global.URL, "createObjectURL", {
  writable: true,
  value: vi.fn().mockReturnValue("blob://fake"),
});
