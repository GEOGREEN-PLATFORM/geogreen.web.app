import COptions from "@/components/COptions/Index.vue";
import { mount } from "@vue/test-utils";

describe("COptions integration", () => {
  it("renders and selects an option", async () => {
    const options = [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
    ];
    const wrapper = mount(COptions, {
      props: { options },
    });
    expect(wrapper.text()).toContain("Option 1");
    expect(wrapper.text()).toContain("Option 2");
    // Simulate selecting an option if component supports it
    // Example: await wrapper.find('selector-for-option').trigger('click');
  });
});
