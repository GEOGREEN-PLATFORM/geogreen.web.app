import CButtonCopy from "@/components/CButton/Copy.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";

const QIconStub = {
  name: "q-icon",
  props: ["name", "size"],
  template: "<i />",
};

describe("CButtonCopy (integration)", () => {
  it("родитель получает событие copy-success и может реагировать", async () => {
    const onSuccess = vi.fn();
    // stub clipboard
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();

    const Parent = defineComponent({
      components: { CButtonCopy },
      template: `<CButtonCopy text="Foo" @copy-success="onSuccess"/>`,
      setup() {
        return { onSuccess };
      },
    });
    const wrapper = mount(Parent, {
      global: { stubs: { "q-icon": QIconStub } },
    });
    await wrapper.findComponent(CButtonCopy).trigger("click");
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("интеграционно показывает и сбрасывает тултип в родителе", async () => {
    vi.useFakeTimers();
    const Parent = defineComponent({
      components: { CButtonCopy },
      template: `<CButtonCopy text="Bar" :animationDuration="300" :resetDelay="100" ref="btn"/>`,
      setup() {
        const btn = ref<InstanceType<typeof CButtonCopy>>();
        return { btn };
      },
    });
    const wrapper = mount(Parent, {
      global: { stubs: { "q-icon": QIconStub } },
    });
    const copyCmp = wrapper.findComponent(CButtonCopy);

    // до клика initial tooltip
    expect(copyCmp.find(".copy-button__tooltip").text()).toBe("Скопировать");
    // клик
    await copyCmp.trigger("click");
    // сразу после click
    expect(copyCmp.find(".copy-button__tooltip").text()).toBe("Скопировано");
    // после animationDuration
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(copyCmp.find(".copy-button__tooltip").attributes("style")).toContain(
      "opacity: 0",
    );
    // после resetDelay
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(copyCmp.find(".copy-button__tooltip").text()).toBe("Скопировать");
    vi.useRealTimers();
  });
});
