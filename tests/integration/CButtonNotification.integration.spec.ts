import CButtonNotification from "@/components/CButton/Notification.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

// Стаб для q-icon
// Стаб для q-icon
const QIconStub = defineComponent({
  name: "q-icon",
  props: ["name", "size", "class"],
  setup(props) {
    return () => h("div", { class: props.class }, []);
  },
});

// Стаб для q-tooltip (замена CHint)
const QTooltipStub = defineComponent({
  name: "q-tooltip",
  setup(_, { slots }) {
    return () =>
      h(
        "div",
        { class: "g-green-hint q-tooltip" },
        slots.default ? slots.default() : [],
      );
  },
});

// Глобальные стабы для q-icon и q-tooltip
const globalStubs = {
  "q-icon": QIconStub,
  "q-tooltip": QTooltipStub,
};

describe("CButtonNotification (integration)", () => {
  it("прокидывает событие subscribe в родительский обработчик", async () => {
    const onSubscribe = vi.fn();
    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `<CButtonNotification :subscribed="false" @subscribe="onSubscribe" />`,
      setup() {
        return { onSubscribe };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });
    await wrapper.find(".notification-button").trigger("click");
    expect(onSubscribe).toHaveBeenCalledOnce();
  });

  it("прокидывает событие unsubscribe в родительский обработчик", async () => {
    const onUnsubscribe = vi.fn();
    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `<CButtonNotification :subscribed="true" @unsubscribe="onUnsubscribe" />`,
      setup() {
        return { onUnsubscribe };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });
    await wrapper.find(".notification-button").trigger("click");
    expect(onUnsubscribe).toHaveBeenCalledOnce();
  });

  it("динамически обновляет иконки при смене prop subscribed", async () => {
    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `<CButtonNotification :subscribed="isSubscribed" />`,
      setup() {
        const isSubscribed = ref(false);
        return { isSubscribed };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });
    const vm = wrapper.vm as any;

    expect(wrapper.find(".outline-icon").classes()).toContain("visible");
    expect(wrapper.find(".ring-icon").classes()).not.toContain("visible");

    vm.isSubscribed = true;
    await nextTick();

    expect(wrapper.find(".outline-icon").classes()).not.toContain("visible");
    expect(wrapper.find(".ring-icon").classes()).toContain("visible");
  });

  it("сбрасывает loading при изменении subscribed из родительского компонента", async () => {
    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `<CButtonNotification :subscribed="isSubscribed" @subscribe="toggle" />`,
      setup() {
        const isSubscribed = ref(false);
        const toggle = () => {
          isSubscribed.value = true;
        };
        return { isSubscribed, toggle };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });

    await wrapper.find(".notification-button").trigger("click");
    // после клика анимация должна быть активна
    expect(wrapper.find(".outline-icon").classes()).toContain(
      "click-animation",
    );

    // обновление subscribed сбрасывает loading, но click-animation остаётся
    await nextTick();
    expect(wrapper.find(".outline-icon").classes()).toContain(
      "click-animation",
    );
  });

  it("отображает анимацию до изменения subscribed, затем завершает её", async () => {
    vi.useFakeTimers();

    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `<CButtonNotification :subscribed="subscribed" />`,
      setup() {
        const subscribed = ref(false);
        return { subscribed };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });

    await wrapper.find(".notification-button").trigger("click");
    expect(wrapper.find(".outline-icon").classes()).toContain(
      "click-animation",
    );

    // анимация до таймаута остаётся
    vi.advanceTimersByTime(600);
    await nextTick();
    expect(wrapper.find(".outline-icon").classes()).toContain(
      "click-animation",
    );

    // эмулируем обновление subscribed
    (wrapper.vm as any).subscribed = true;
    await nextTick();
    await nextTick();

    expect(wrapper.find(".outline-icon").classes()).not.toContain(
      "click-animation",
    );

    vi.useRealTimers();
  });

  it("интегрируется с родителем для полного цикла подписки/отписки", async () => {
    vi.useFakeTimers();

    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `
        <CButtonNotification
          :subscribed="isSubscribed"
          :animationDuration="100"
          @subscribe="handleSubscribe"
          @unsubscribe="handleUnsubscribe"
        />`,
      setup() {
        const isSubscribed = ref(false);
        const handleSubscribe = () => {
          isSubscribed.value = true;
        };
        const handleUnsubscribe = () => {
          isSubscribed.value = false;
        };
        return { isSubscribed, handleSubscribe, handleUnsubscribe };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });
    const button = wrapper.find(".notification-button");

    // Начальное состояние: outline видна
    expect(wrapper.find(".outline-icon").classes()).toContain("visible");
    expect(wrapper.find(".ring-icon").classes()).not.toContain("visible");

    // Подписываемся
    await button.trigger("click");
    await nextTick();
    // После подписки: ring видна, анимация запущена
    expect(wrapper.find(".outline-icon").classes()).not.toContain("visible");
    expect(wrapper.find(".ring-icon").classes()).toContain("visible");
    expect(wrapper.find(".ring-icon").classes()).toContain("click-animation");

    // Завершаем анимацию
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(wrapper.find(".ring-icon").classes()).not.toContain(
      "click-animation",
    );

    // Отписываемся
    await button.trigger("click");
    await nextTick();
    // После отписки: outline видна, анимация на outline
    expect(wrapper.find(".outline-icon").classes()).toContain("visible");
    expect(wrapper.find(".ring-icon").classes()).not.toContain("visible");
    expect(wrapper.find(".outline-icon").classes()).toContain(
      "click-animation",
    );

    vi.useRealTimers();
  });

  it("останавливает всплытие события click", async () => {
    const parentClick = vi.fn();
    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `
        <div @click="parentClick">
          <CButtonNotification :subscribed="false" />
        </div>`,
      setup() {
        return { parentClick };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });
    await wrapper.find(".notification-button").trigger("click");
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("показывает/скрывает тултип при наведении с корректными текстами", async () => {
    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `
        <CButtonNotification 
          :subscribed="isSubscribed"
          tooltipSubText="Подписаться на новости"
          tooltipUnsubText="Отписаться от новостей"
        />`,
      setup() {
        const isSubscribed = ref(false);
        return { isSubscribed };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });
    const button = wrapper.find(".notification-button");
    let tooltip = wrapper.find(".g-green-hint.q-tooltip");

    // Тултип скрыт по умолчанию
    expect(tooltip.classes()).not.toContain("show");
    expect(tooltip.text()).toBe("Подписаться на новости");

    // При наведении тултип показывается
    await button.trigger("mouseenter");
    tooltip = wrapper.find(".g-green-hint.q-tooltip");
    expect(tooltip.classes()).toContain("show");

    // Изменяем состояние и проверяем текст
    (wrapper.vm as any).isSubscribed = true;
    await nextTick();
    tooltip = wrapper.find(".g-green-hint.q-tooltip");
    expect(tooltip.text()).toBe("Отписаться от новостей");

    // При убирании мыши тултип скрывается
    await button.trigger("mouseleave");
    tooltip = wrapper.find(".g-green-hint.q-tooltip");
    expect(tooltip.classes()).not.toContain("show");
  });
});
