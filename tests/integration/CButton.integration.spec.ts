import CButtonMain from "@/components/CButton/Index.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";

// Тот же stub, что и в unit‑тестах
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
  emits: ["click"],
  template: `
    <button
      :disabled="disable"
      :style="style"
      @click="!disable && $emit('click', $event)"
    ><slot/></button>
  `,
};

const globalStubs = {
  "q-btn": QBtnStub,
  "q-icon": true,
};

describe("CButtonMain (integration)", () => {
  it("прокидывает клик в родительский обработчик", async () => {
    const onClick = vi.fn();
    const Parent = defineComponent({
      components: { CButtonMain },
      template: `<CButtonMain @click="onClick">Press</CButtonMain>`,
      setup() {
        return { onClick };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });
    await wrapper.find("button").trigger("click");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("динамически обновляет дизайн при смене prop designType", async () => {
    const Parent = defineComponent({
      components: { CButtonMain },
      template: `<CButtonMain :designType="type">Btn</CButtonMain>`,
      setup() {
        const type = ref<"primary" | "secondary" | "tertiary">("primary");
        return { type };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });
    const vm = wrapper.vm as any;
    const btnStub = () => wrapper.findComponent(QBtnStub);

    // по умолчанию класс primary
    expect(btnStub().classes()).toContain("primary");

    vm.type = "secondary";
    await nextTick();
    expect(btnStub().classes()).toContain("secondary");

    vm.type = "tertiary";
    await nextTick();
    expect(btnStub().classes()).toContain("tertiary");
  });
  it("при клике родитель переключает loading и кнопка меняет prop loading", async () => {
    const Parent = defineComponent({
      components: { CButtonMain },
      template: `<CButtonMain :loading="isLoading" @click="toggle">Load</CButtonMain>`,
      setup() {
        const isLoading = ref(false);
        const toggle = () => {
          isLoading.value = !isLoading.value;
        };
        return { isLoading, toggle };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });
    const btn = wrapper.findComponent(QBtnStub);

    // изначально loading = false
    expect(btn.props("loading")).toBe(false);

    // клик — loading становится true
    await wrapper.find("button").trigger("click");
    await nextTick();
    expect(btn.props("loading")).toBe(true);

    // ещё раз клик — loading снова false
    await wrapper.find("button").trigger("click");
    await nextTick();
    expect(btn.props("loading")).toBe(false);
  });

  it("при disabled=true клик не вызывает toggle, button.disable остаётся true", async () => {
    const onClick = vi.fn();
    const Parent = defineComponent({
      components: { CButtonMain },
      template: `<CButtonMain :disabled="isDisabled" @click="onClick">Press</CButtonMain>`,
      setup() {
        const isDisabled = ref(true);
        return { isDisabled, onClick };
      },
    });

    const wrapper = mount(Parent, { global: { stubs: globalStubs } });
    const btn = wrapper.find("button");

    // disabled = true
    expect(wrapper.findComponent(QBtnStub).props("disable")).toBe(true);

    // попытка клика — событие не прокидывается
    await btn.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });
  it('при designType="tertiary" кнопка становится flat и сбрасывает outline/rounded', async () => {
    const wrapper = mount(CButtonMain, {
      global: { stubs: globalStubs },
      props: { designType: "tertiary" },
    });
    await nextTick();
    const qb = wrapper.findComponent(QBtnStub);
    expect(qb.props("flat")).toBe(true);
    expect(qb.props("outline")).toBe(false);
    expect(qb.props("rounded")).toBe(true);
  });
});
