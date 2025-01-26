import { vi } from "vitest";

vi.stubGlobal("URL", { createObjectURL: () => "a nice URL" });
// eslint-disable-next-line no-restricted-globals
global.Worker = class {
  constructor() {}
  postMessage() {}
  terminate() {}
};
