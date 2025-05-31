import CInputMain from "@/components/CInput/Index.vue";
// tests/integration/CInput.integration.spec.ts
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

// Подменяем <q-input> на нативный <input> для интеграции
const global = {
  stubs: {
    "q-input": {
      props: ["modelValue"],
      emits: ["update:model-value", "blur"],
      methods: {
        validate() {}, // заглушка
      },
      template: `
        <input
          class="inner"
          :value="modelValue"
          @input="$emit('update:model-value', $event.target.value)"
          @blur="$emit('blur')"
        />
      `,
    },
  },
};

describe("CInputMain (integration)", () => {
  it("двусторонняя привязка: v-model обновляет prop и обратно", async () => {
    const wrapper = mount(CInputMain, {
      global,
      props: { modelValue: "hello" },
    });
    await nextTick();
    // 1) Изначально внутреннее <input> отражает modelValue
    const input = wrapper.find("input.inner");
    expect((input.element as HTMLInputElement).value).toBe("hello");

    // 2) Пользователь вводит новое значение
    await input.setValue("world");
    await nextTick();
    // 3) Компонент эмитит update:modelValue с правильным аргументом
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["world"]);
  });

  it("если заданы собственные rules, они перебивают required‑правило", () => {
    // «Всегда плохое» правило
    const alwaysBad = [(v: unknown) => v === "OK" || "fail"];
    const wrapper = mount(CInputMain, {
      global,
      props: {
        modelValue: "",
        rules: alwaysBad,
        required: true,
      },
    });

    // После mounted в vm.validationRules лежит наш массив
    expect(wrapper.vm.validationRules).toStrictEqual(alwaysBad);
  });
});
