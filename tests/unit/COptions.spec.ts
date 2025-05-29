import COptions from "@/components/COptions/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("COptions.vue", () => {
  it("renders the options component", () => {
    const wrapper = shallowMount(COptions);
    expect(wrapper.exists()).toBe(true);
  });

  it("renders options when passed as props", () => {
    const options = [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
    ];
    const wrapper = shallowMount(COptions, {
      props: { options },
    });
    expect(wrapper.props().options).toEqual(options);
  });
});
