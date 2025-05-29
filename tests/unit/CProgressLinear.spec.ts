import CProgressLinear from "@/components/CProgress/Linear.vue";
import { shallowMount } from "@vue/test-utils";

describe("CProgressLinear.vue", () => {
  it("renders the progress bar", () => {
    const wrapper = shallowMount(CProgressLinear);
    expect(wrapper.exists()).toBe(true);
  });
});
