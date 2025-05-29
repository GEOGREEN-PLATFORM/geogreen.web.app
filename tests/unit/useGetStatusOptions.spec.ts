import useGetStatusOptions from "@/composables/useGetStatusOptions";
import { describe, expect, it } from "vitest";

describe("useGetStatusOptions composable", () => {
  it("returns all status/role/density options and styles", () => {
    const options = useGetStatusOptions();
    expect(options.EMPLOYEE_ACCOUNT_STATUS_OPTIONS).toBeDefined();
    expect(options.EMPLOYEE_ACCOUNT_STATUS_STYLES).toBeDefined();
    expect(options.EMPLOYEE_ROLE_OPTIONS).toBeDefined();
    expect(options.HOTBED_WORK_STAGE_OPTIONS).toBeDefined();
    expect(options.HOTBED_WORK_STAGE_STYLES).toBeDefined();
    expect(options.HOTBED_DENSITIES_OPTIONS).toBeDefined();
    // Check at least one value for each
    expect(options.EMPLOYEE_ACCOUNT_STATUS_OPTIONS.length).toBeGreaterThan(0);
    expect(
      Object.keys(options.EMPLOYEE_ACCOUNT_STATUS_STYLES).length,
    ).toBeGreaterThan(0);
    expect(options.EMPLOYEE_ROLE_OPTIONS.length).toBeGreaterThan(0);
    expect(options.HOTBED_WORK_STAGE_OPTIONS.length).toBeGreaterThan(0);
    expect(
      Object.keys(options.HOTBED_WORK_STAGE_STYLES).length,
    ).toBeGreaterThan(0);
    expect(options.HOTBED_DENSITIES_OPTIONS.length).toBeGreaterThan(0);
  });
});
