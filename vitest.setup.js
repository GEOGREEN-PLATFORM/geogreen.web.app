import { vi } from "vitest";

vi.stubGlobal("URL", { createObjectURL: () => "a nice URL" });
global.Worker = class {
  postMessage() {}
  terminate() {}
};
