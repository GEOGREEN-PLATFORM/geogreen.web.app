import CMenu from "@/components/CMenu/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("CMenu.vue", () => {
  it("renders the menu component", () => {
    const wrapper = shallowMount(CMenu, {
      props: {
        pages: [{ visible: true }],
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("renders menu items when passed as props", () => {
    const wrapper = shallowMount(CMenu, {
      props: {
        pages: [{ visible: true }, { visible: true }],
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
