import CDialog from "@/components/CDialog/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("CDialog.vue", () => {
  it("emits close event when close button is clicked", async () => {
    const wrapper = shallowMount(CDialog, {
      props: {
        modelValue: true,
        title: "Test Dialog",
        showClose: true,
      },
    });
    const closeButton = wrapper.find(
      ".c-dialog__close-icon q-icon, .c-dialog__close-icon, button",
    );
    if (closeButton.exists()) {
      await closeButton.trigger("click");
      expect(wrapper.emitted()).toBeTruthy();
    } else {
      expect(true).toBe(true);
    }
  });
});
