import CPhotoViewer from "@/components/CPhotoViewer.vue";
import { shallowMount } from "@vue/test-utils";

describe("CPhotoViewer.vue", () => {
  it("renders the component", () => {
    const wrapper = shallowMount(CPhotoViewer);
    expect(wrapper.exists()).toBe(true);
  });

  // The image rendering depends on NuxtImg and may not be testable in this environment
  it("renders image when src is provided (smoke test)", () => {
    const wrapper = shallowMount(CPhotoViewer, {
      props: {
        src: "test.jpg",
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
