import CFile from "@/components/CFile/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("CFile.vue", () => {
  it("renders the file component", () => {
    const file = new File(["test content"], "testfile.txt", {
      type: "text/plain",
    });
    const wrapper = shallowMount(CFile, {
      props: {
        file,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("renders file name when passed as prop", () => {
    const file = new File(["test content"], "testfile.txt", {
      type: "text/plain",
    });
    const wrapper = shallowMount(CFile, {
      props: {
        file,
      },
    });
    expect(wrapper.text()).toContain("testfile.txt");
  });
});
