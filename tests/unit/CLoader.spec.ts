import CLoader from "@/components/CLoader/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("CLoader.vue", () => {
  it("renders the loader component", () => {
    const wrapper = shallowMount(CLoader);
    expect(wrapper.exists()).toBe(true);
  });
});
