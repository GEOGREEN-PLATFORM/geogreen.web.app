import CDragDrop from "@/components/CDragDrop.vue";
import { shallowMount } from "@vue/test-utils";

describe("CDragDrop.vue", () => {
  it("renders the component", () => {
    const wrapper = shallowMount(CDragDrop);
    expect(wrapper.exists()).toBe(true);
  });

  it("emits drop event when dropped", async () => {
    const wrapper = shallowMount(CDragDrop);
    await wrapper.trigger("drop");
    expect(wrapper.emitted()).toHaveProperty("drop");
  });
});
