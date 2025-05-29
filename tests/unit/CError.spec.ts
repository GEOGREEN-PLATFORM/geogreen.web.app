import CError from "@/components/CError/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("CError.vue", () => {
  it("renders the error component", () => {
    const wrapper = shallowMount(CError);
    expect(wrapper.exists()).toBe(true);
  });

  it("renders default error message", () => {
    const wrapper = shallowMount(CError);
    expect(wrapper.text()).toContain("Произошла ошибка при загрузке данных");
  });
});
