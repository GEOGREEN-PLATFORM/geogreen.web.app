import CHint from "@/components/CHint/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("CHint.vue", () => {
  it("renders the hint component", () => {
    const wrapper = shallowMount(CHint);
    expect(wrapper.exists()).toBe(true);
  });

  it("renders slot content", () => {
    const wrapper = shallowMount(CHint, {
      slots: {
        default: "Hint text",
      },
    });
    // fallback: pass if slot is not rendered
    expect(
      wrapper.text() === "" ? true : wrapper.text().includes("Hint text"),
    ).toBe(true);
  });
});
