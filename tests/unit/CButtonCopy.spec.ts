import CButtonCopy from "@/components/CButton/Copy.vue";
import { mount, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Stub q-icon
const QIconStub = {
  name: "q-icon",
  props: ["name", "size"],
  template: "<i />",
};

describe("CButtonCopy (unit)", () => {
  const text = "Hello";
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // stub clipboard
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    // @ts-ignore
    global.navigator.clipboard = { writeText: writeTextMock };
  });

  it("показывает тултип при наведении и скрывает при уходе", async () => {
    const wrapper = shallowMount(CButtonCopy, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { text },
    });
    const container = wrapper.find(".copy-button");
    // hover
    await container.trigger("mouseenter");
    expect(wrapper.find(".copy-button__tooltip").attributes("style")).toContain(
      "opacity: 1",
    );
    // leave
    await container.trigger("mouseleave");
    expect(wrapper.find(".copy-button__tooltip").attributes("style")).toContain(
      "opacity: 0",
    );
  });

  it("копирует текст и анимирует и эмитит событие", async () => {
    vi.useFakeTimers();
    const wrapper = mount(CButtonCopy, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { text, animationDuration: 500, resetDelay: 200 },
    });
    const container = wrapper.find(".copy-button");
    // click
    await container.trigger("click");
    expect(writeTextMock).toHaveBeenCalledWith(text);
    // после клика: тултип и анимация включены, событие эмитится
    expect(wrapper.emitted("copy-success")).toBeTruthy();
    const icon = wrapper.find(".copy-button__icon");
    expect(icon.classes()).toContain("pop-animation");
    expect(wrapper.find(".copy-button__tooltip").text()).toBe("Скопировано");
    expect(wrapper.find(".copy-button__tooltip").attributes("style")).toContain(
      "opacity: 1",
    );
    // после animationDuration таймера
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();
    expect(icon.classes()).not.toContain("pop-animation");
    expect(wrapper.find(".copy-button__tooltip").attributes("style")).toContain(
      "opacity: 0",
    );
    // после resetDelay
    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".copy-button__tooltip").text()).toBe("Скопировать");
    vi.useRealTimers();
  });
});
