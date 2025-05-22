import CButtonNotification from "@/components/CButton/Notification.vue";
import { mdiBellOutline, mdiBellRing } from "@quasar/extras/mdi-v6";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";

// Стаб для q-icon
const QIconStub = defineComponent({
  name: "q-icon",
  props: ["name", "size", "class"],
  setup(props) {
    return () => h("div", { class: props.class }, []);
  },
});
const globalStubs = {
  "q-icon": QIconStub,
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

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });
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

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });
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

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });
    const vm = wrapper.vm as any;

    // По умолчанию видна иконка outline
    expect(wrapper.find(".outline-icon").classes()).toContain("visible");
    expect(wrapper.find(".ring-icon").classes()).not.toContain("visible");

    // После изменения subscribed меняются видимые иконки
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

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });

    // Клик вызывает loading и активирует анимацию
    await wrapper.find(".notification-button").trigger("click");
    expect(wrapper.find(".outline-icon").classes()).toContain(
      "click-animation",
    );

    // Изменение props.subscribed сбрасывает loading, но анимация продолжается
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

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });

    // Клик — компонент запускает анимацию
    await wrapper.find(".notification-button").trigger("click");
    expect(wrapper.find(".outline-icon").classes()).toContain(
      "click-animation",
    );

    // Анимация всё ещё активна до изменения subscribed
    vi.advanceTimersByTime(600);
    await nextTick();
    expect(wrapper.find(".outline-icon").classes()).toContain(
      "click-animation",
    );

    // Изменяем subscribed вручную (как будто из родителя)
    wrapper.vm.subscribed = true;
    await nextTick();
    await nextTick(); // на случай, если внутри компонента Watcher

    // Анимация должна завершиться
    expect(wrapper.find(".outline-icon").classes()).not.toContain(
      "click-animation",
    );

    vi.useRealTimers();
  });

  it("интегрируется с родительским компонентом для полного цикла подписки/отписки", async () => {
    vi.useFakeTimers();

    const Parent = defineComponent({
      components: { CButtonNotification },
      template: `
        <CButtonNotification 
          :subscribed="isSubscribed" 
          :animationDuration="100"
          @subscribe="handleSubscribe" 
          @unsubscribe="handleUnsubscribe" 
        />
      `,
      setup() {
        const isSubscribed = ref(false);
        const handleSubscribe = vi.fn(() => {
          isSubscribed.value = true;
        });
        const handleUnsubscribe = vi.fn(() => {
          isSubscribed.value = false;
        });
        return { isSubscribed, handleSubscribe, handleUnsubscribe };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });
    const button = wrapper.find(".notification-button");

    // Проверяем начальное состояние
    expect(wrapper.find(".outline-icon").classes()).toContain("visible");
    expect(wrapper.find(".ring-icon").classes()).not.toContain("visible");

    // Подписываемся
    await button.trigger("click");
    expect(wrapper.vm.handleSubscribe).toHaveBeenCalledOnce();

    // Должна быть анимация и изменение иконок после подписки
    await nextTick();
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
    expect(wrapper.vm.handleUnsubscribe).toHaveBeenCalledOnce();

    // Проверяем анимацию и изменение иконок после отписки
    await nextTick();
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
        </div>
      `,
      setup() {
        return { parentClick };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });

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
        />
      `,
      setup() {
        const isSubscribed = ref(false);
        return { isSubscribed };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });
    const vm = wrapper.vm as any;
    const button = wrapper.find(".notification-button");
    const tooltip = wrapper.find(".notification-button__tooltip");

    // Тултип скрыт по умолчанию
    expect(tooltip.classes()).not.toContain("show");
    expect(tooltip.text()).toBe("Подписаться на новости");

    // При наведении тултип показывается
    await button.trigger("mouseenter");
    expect(tooltip.classes()).toContain("show");

    // Изменяем состояние подписки
    vm.isSubscribed = true;
    await nextTick();

    // Тултип обновляет текст
    expect(tooltip.text()).toBe("Отписаться от новостей");

    // При убирании мыши тултип скрывается
    await button.trigger("mouseleave");
    expect(tooltip.classes()).not.toContain("show");
  });
});
