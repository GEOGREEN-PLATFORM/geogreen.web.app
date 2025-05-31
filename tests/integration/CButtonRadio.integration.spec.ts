import CButtonRadio from "@/components/CButton/Radio.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";

// Stub для q-radio
const QRadioStub = {
  name: "q-radio",
  props: ["keepColor", "color", "modelValue", "val", "label"],
  emits: ["update:model-value"],
  template: `
    <div 
      class="q-radio" 
      :class="{ 'checked': modelValue === val }"
      @click="$emit('update:model-value', modelValue === val ? null : val)"
    >
      {{ label }}
    </div>
  `,
};

const globalStubs = {
  "q-radio": QRadioStub,
};

describe("CButtonRadio (integration)", () => {
  it("работает с v-model в родительском компоненте", async () => {
    const Parent = defineComponent({
      components: { CButtonRadio },
      template: `<CButtonRadio v-model="selected" color="primary" />`,
      setup() {
        const selected = ref<string | boolean>(false);
        return { selected };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });

    // Проверяем начальное состояние
    expect((wrapper.vm as any).selected).toBe(false);

    // Кликаем на радио-кнопку
    await wrapper.find(".q-radio").trigger("click");
    await nextTick();

    // Проверяем, что значение изменилось
    expect((wrapper.vm as any).selected).toBe("line");
  });

  it("реагирует на изменение v-model извне", async () => {
    const Parent = defineComponent({
      components: { CButtonRadio },
      template: `
        <div>
          <CButtonRadio v-model="selected" color="primary" />
          <button class="toggle" @click="toggle">Toggle</button>
        </div>
      `,
      setup() {
        const selected = ref<string | boolean>(false);
        const toggle = () => {
          selected.value = selected.value === "line" ? false : "line";
        };
        return { selected, toggle };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });

    // Проверяем начальное состояние
    const radioElement = wrapper.find(".q-radio");
    expect(radioElement.classes()).not.toContain("checked");

    // Изменяем состояние извне
    await wrapper.find(".toggle").trigger("click");
    await nextTick();

    // Радио должно обновиться
    expect(radioElement.classes()).toContain("checked");

    // Изменяем снова
    await wrapper.find(".toggle").trigger("click");
    await nextTick();

    // Радио должно вернуться в исходное состояние
    expect(radioElement.classes()).not.toContain("checked");
  });

  it("передает цвет и keepColor в q-radio", async () => {
    const Parent = defineComponent({
      components: { CButtonRadio },
      template: `
        <div>
          <CButtonRadio 
            v-model="selected" 
            :color="radioColor" 
            :keep-color="keepColorFlag" 
          />
          <button @click="toggleColor">Toggle Color</button>
          <button @click="toggleKeepColor">Toggle Keep Color</button>
        </div>
      `,
      setup() {
        const selected = ref(false);
        const radioColor = ref("primary");
        const keepColorFlag = ref(false);

        const toggleColor = () => {
          radioColor.value =
            radioColor.value === "primary" ? "secondary" : "primary";
        };

        const toggleKeepColor = () => {
          keepColorFlag.value = !keepColorFlag.value;
        };

        return {
          selected,
          radioColor,
          keepColorFlag,
          toggleColor,
          toggleKeepColor,
        };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });

    // Проверяем начальные props
    let qRadio = wrapper.findComponent(QRadioStub);
    expect(qRadio.props("color")).toBe("primary");
    expect(qRadio.props("keepColor")).toBe(false);

    // Меняем цвет
    await wrapper.find("button:first-of-type").trigger("click");
    await nextTick();
    qRadio = wrapper.findComponent(QRadioStub);
    expect(qRadio.props("color")).toBe("secondary");

    // Меняем keepColor
    await wrapper.find("button:nth-of-type(2)").trigger("click");
    await nextTick();
    qRadio = wrapper.findComponent(QRadioStub);
    expect(qRadio.props("keepColor")).toBe(true);
  });

  it("сохраняет функциональность при нескольких переключениях", async () => {
    const Parent = defineComponent({
      components: { CButtonRadio },
      template: `<CButtonRadio v-model="selected" color="primary" />`,
      setup() {
        const selected = ref(false);
        return { selected };
      },
    });

    const wrapper = mount(Parent, {
      global: { stubs: globalStubs },
    });

    const radio = wrapper.find(".q-radio");
    const vm = wrapper.vm as any;

    // Первое нажатие включает
    await radio.trigger("click");
    await nextTick();
    expect(vm.selected).toBe("line");

    // Второе нажатие выключает
    await radio.trigger("click");
    await nextTick();
    expect(vm.selected).toBe(null);

    // Третье нажатие снова включает
    await radio.trigger("click");
    await nextTick();
    expect(vm.selected).toBe("line");
  });
});
