import CButtonRadio from "@/components/CButton/Radio.vue";
import { mount, shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

// Stub для q-radio
const QRadioStub = {
  name: "q-radio",
  props: ["keepColor", "color", "modelValue", "val", "label"],
  emits: ["update:model-value"],
  template:
    '<div class="q-radio" @click="$emit(\'update:model-value\', !modelValue)"></div>',
};

// Общие настройки для mount/shallowMount
const globalMountOptions = {
  global: {
    stubs: {
      "q-radio": QRadioStub,
    },
  },
};

describe("CButtonRadio (unit)", () => {
  it("рендерит нужные CSS‑классы по умолчанию", () => {
    const wrapper = shallowMount(CButtonRadio, globalMountOptions);
    const classes = wrapper.classes();
    expect(classes).toContain("с-button-radio");
  });

  it("прокидывает props в компонент q-radio", () => {
    const props = {
      modelValue: true,
      color: "green",
      keepColor: true,
    };
    const wrapper = mount(CButtonRadio, {
      ...globalMountOptions,
      props,
    });
    const qRadio = wrapper.findComponent(QRadioStub);
    expect(qRadio.props("modelValue")).toBe(true);
    expect(qRadio.props("color")).toBe("green");
    expect(qRadio.props("keepColor")).toBe(true);
  });

  it("использует значения по умолчанию, если props не переданы", () => {
    const wrapper = mount(CButtonRadio, globalMountOptions);
    const qRadio = wrapper.findComponent(QRadioStub);
    expect(qRadio.props("modelValue")).toBe(false);
  });

  it("emit update:modelValue при изменении значения", async () => {
    const wrapper = mount(CButtonRadio, {
      ...globalMountOptions,
      props: { modelValue: false },
    });

    const qRadio = wrapper.findComponent(QRadioStub);
    await qRadio.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("update:modelValue");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it('передает val="line" и label="Line" в q-radio', () => {
    const wrapper = mount(CButtonRadio, globalMountOptions);
    const qRadio = wrapper.findComponent(QRadioStub);
    expect(qRadio.props("val")).toBe("line");
    expect(qRadio.props("label")).toBe("Line");
  });

  it("эмиттит событие при эмите от q-radio", async () => {
    const wrapper = mount(CButtonRadio, {
      ...globalMountOptions,
      props: { modelValue: false },
    });

    const qRadio = wrapper.findComponent(QRadioStub);

    // Вместо тригера клика напрямую эмитим событие от q-radio
    qRadio.vm.$emit("update:model-value", true);

    // Проверяем, что компонент переэмитил событие с правильным значением
    expect(wrapper.emitted()).toHaveProperty("update:modelValue");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });
});
