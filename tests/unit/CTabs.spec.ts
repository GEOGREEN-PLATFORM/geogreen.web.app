import CTabs from "@/components/CTabs/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("CTabs.vue", () => {
  it("renders the tabs component", () => {
    const wrapper = shallowMount(CTabs);
    expect(wrapper.exists()).toBe(true);
  });

  it("renders tab titles when passed as props", () => {
    const tabs = [
      { title: "Tab 1", value: 1 },
      { title: "Tab 2", value: 2 },
    ];
    const wrapper = shallowMount(CTabs, {
      props: { tabs },
    });
    expect(wrapper.props().tabs).toEqual(tabs);
  });
});
