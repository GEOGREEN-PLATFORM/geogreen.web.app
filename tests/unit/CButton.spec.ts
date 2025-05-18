import CButtonMain from "@/components/CButton/Index.vue";
import { mdiCheck } from "@quasar/extras/mdi-v6";
import { mount, shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";

// Stub для q-btn
const QBtnStub = {
  name: "q-btn",
  props: [
    "label",
    "rounded",
    "outline",
    "flat",
    "disable",
    "type",
    "loading",
    "icon",
    "iconRight",
    "style",
  ],
  template: '<button :style="style"><slot/></button>',
};

// Общие настройки для mount/shallowMount
const globalMountOptions = {
  global: {
    stubs: {
      "q-btn": QBtnStub,
      "q-icon": true,
    },
  },
};

describe("CButtonMain (unit)", () => {
  it("рендерит нужные CSS‑классы по умолчанию", () => {
    const wrapper = shallowMount(CButtonMain, globalMountOptions);
    const classes = wrapper.classes();
    expect(classes).toContain("c-button-main");
    expect(classes).not.toContain("button-icon");
  });

  it("добавляет класс button-icon, когда передан prop icon", () => {
    const wrapper = shallowMount(CButtonMain, {
      ...globalMountOptions,
      props: { icon: mdiCheck },
    });
    expect(wrapper.classes()).toContain("button-icon");
  });
  it("не передаёт label в q-btn, когда указан icon", () => {
    const wrapper = mount(CButtonMain, {
      ...globalMountOptions,
      props: { label: "Test", icon: "foo" },
    });
    const qb = wrapper.findComponent(QBtnStub);
    expect(qb.props("label")).toBe("");
  });

  it('устанавливает flat=true, когда designType="tertiary"', async () => {
    const wrapper = mount(CButtonMain, {
      ...globalMountOptions,
      props: { designType: "tertiary" },
    });
    await nextTick();
    expect((wrapper.vm as any).buttonDesignTypeSettings.flat).toBe(true);
  });

  it("прокидывает disabled, type, loading и иконки в q-btn", () => {
    const props = {
      disabled: true,
      type: "submit" as const,
      loading: true,
      icon: "user",
      appendIcon: "arrow_right",
    };
    const wrapper = mount(CButtonMain, {
      ...globalMountOptions,
      props,
    });
    const qb = wrapper.findComponent(QBtnStub);
    expect(qb.props("disable")).toBe(true);
    expect(qb.props("type")).toBe("submit");
    expect(qb.props("loading")).toBe(true);
    expect(qb.props("icon")).toBe("user");
    expect(qb.props("iconRight")).toBe("arrow_right");
  });

  it("применяет размер через CSS‑класс size", () => {
    const wrapperSmall = shallowMount(CButtonMain, {
      ...globalMountOptions,
      props: { size: "small" },
    });
    expect(wrapperSmall.findComponent(QBtnStub).classes()).toContain("small");

    const wrapperMedium = shallowMount(CButtonMain, {
      ...globalMountOptions,
      props: { size: "medium" },
    });
    expect(wrapperMedium.findComponent(QBtnStub).classes()).toContain("medium");

    const wrapperDefault = shallowMount(CButtonMain, globalMountOptions);
    expect(wrapperDefault.findComponent(QBtnStub).classes()).toContain("large");
  });

  it("добавляет inline‑стили bgColor и textColor", () => {
    const wrapper = mount(CButtonMain, {
      ...globalMountOptions,
      props: { bgColor: "red", textColor: "blue" },
    });
    const qb = wrapper.findComponent(QBtnStub);
    const style = qb.attributes("style") || "";
    expect(style).toContain("background-color: red");
    expect(style).toContain("color: blue");
  });

  it("рендерит slot‑контент внутри кнопки", () => {
    const wrapper = mount(CButtonMain, {
      ...globalMountOptions,
      slots: { default: '<span class="inner">Click me</span>' },
    });
    expect(wrapper.find("span.inner").text()).toBe("Click me");
  });
});
