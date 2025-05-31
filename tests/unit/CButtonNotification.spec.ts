import CButtonNotification from "@/components/CButton/Notification.vue";
import { mdiBellOutline, mdiBellRing } from "@quasar/extras/mdi-v6";
import { mount, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";

// Стаб для q-icon
const QIconStub = defineComponent({
  name: "q-icon",
  props: ["name", "size", "class"],
  setup(props) {
    return () => h("div", { class: props.class }, []);
  },
});

// Стаб для q-tooltip
const QTooltipStub = defineComponent({
  name: "q-tooltip",
  setup(_, { slots }) {
    return () =>
      h("div", { class: "g-green-hint q-tooltip" }, slots.default?.());
  },
});

const globalMountOptions = {
  global: {
    stubs: {
      "q-icon": QIconStub,
      "q-tooltip": QTooltipStub,
    },
  },
};

describe("CButtonNotification (unit)", () => {
  it("рендерит корректные CSS-классы по умолчанию", () => {
    const wrapper = shallowMount(CButtonNotification, {
      ...globalMountOptions,
      props: { subscribed: false },
    });

    expect(wrapper.classes()).toContain("notification-button");
    expect(wrapper.classes()).not.toContain("subscribed");
  });

  it("добавляет класс subscribed, когда subscribed=true", () => {
    const wrapper = shallowMount(CButtonNotification, {
      ...globalMountOptions,
      props: { subscribed: true },
    });

    expect(wrapper.classes()).toContain("subscribed");
  });

  it("отображает иконки с корректными именами", () => {
    const wrapper = mount(CButtonNotification, {
      ...globalMountOptions,
      props: { subscribed: false },
    });

    const icons = wrapper.findAllComponents(QIconStub);
    expect(icons.length).toBe(2);
    expect(icons[0].props("name")).toBe(mdiBellOutline);
    expect(icons[1].props("name")).toBe(mdiBellRing);
  });

  it("делает видимой нужную иконку в зависимости от статуса подписки", async () => {
    const wrapper = mount(CButtonNotification, {
      ...globalMountOptions,
      props: { subscribed: false },
    });

    const outlineIcon = wrapper.find(".outline-icon");
    const ringIcon = wrapper.find(".ring-icon");

    expect(outlineIcon.classes()).toContain("visible");
    expect(ringIcon.classes()).not.toContain("visible");

    await wrapper.setProps({ subscribed: true });
    await nextTick();

    expect(outlineIcon.classes()).not.toContain("visible");
    expect(ringIcon.classes()).toContain("visible");
  });

  it("показывает правильный текст тултипа в зависимости от подписки", async () => {
    const wrapper = mount(CButtonNotification, {
      ...globalMountOptions,
      props: {
        subscribed: false,
        tooltipSubText: "Подписаться",
        tooltipUnsubText: "Отписаться",
      },
    });

    let tooltip = wrapper.find(".g-green-hint.q-tooltip");
    expect(tooltip.text()).toBe("Подписаться");

    await wrapper.setProps({ subscribed: true });
    await nextTick();

    tooltip = wrapper.find(".g-green-hint.q-tooltip");
    expect(tooltip.text()).toBe("Отписаться");
  });

  it("показывает тултип при наведении мыши", async () => {
    const wrapper = mount(CButtonNotification, {
      ...globalMountOptions,
      props: { subscribed: false },
    });

    const tooltip = wrapper.find(".g-green-hint.q-tooltip");
    const button = wrapper.find(".notification-button");

    expect(tooltip.classes()).not.toContain("show");

    await button.trigger("mouseenter");
    expect(wrapper.vm.showTooltip).toBe(true);

    await button.trigger("mouseleave");
    expect(wrapper.vm.showTooltip).toBe(false);
  });

  it("добавляет класс hover-animation при наведении на кнопку", async () => {
    const wrapper = mount(CButtonNotification, {
      ...globalMountOptions,
      props: { subscribed: false },
    });

    const button = wrapper.find(".notification-button");
    const iconWrapper = wrapper.find(".icon-wrapper");

    expect(iconWrapper.classes()).not.toContain("hover-animation");

    await button.trigger("mouseenter");
    expect(iconWrapper.classes()).toContain("hover-animation");

    await button.trigger("mouseleave");
    expect(iconWrapper.classes()).not.toContain("hover-animation");
  });

  it("устанавливает таймаут с правильной animationDuration", async () => {
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");

    const wrapper = mount(CButtonNotification, {
      ...globalMountOptions,
      props: {
        subscribed: false,
        animationDuration: 800,
      },
    });

    await wrapper.find(".notification-button").trigger("click");

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 800);

    setTimeoutSpy.mockRestore();
  });
});
