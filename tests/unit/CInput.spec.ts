import CInputMain from "@/components/CInput/Index.vue";
import { mdiEyeOffOutline, mdiEyeOutline } from "@quasar/extras/mdi-v6";
import { type VueWrapper, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

// Stub для q-input
const QInputStub = {
  name: "q-input",
  props: [
    "modelValue",
    "rounded",
    "outlined",
    "label",
    "type",
    "rules",
    "lazyRules",
    "noErrorIcon",
    "hideBottomSpace",
    "placeholder",
    "name",
    "autogrow",
    "autocomplete",
    "mask",
    "disable",
    "hint",
    "readonly",
    "maxlength",
  ],
  template: `<div class="q-input-stub" @blur="$emit('blur')">
    <slot name="append"/>
  </div>`,
};

describe("CInputMain (unit)", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = shallowMount(CInputMain, {
      global: { stubs: { "q-input": QInputStub, "q-icon": true } },
      props: {
        modelValue: "foo",
        type: "password",
        label: "My Label",
        placeholder: "PH",
        name: "nm",
        rules: [(v: string) => v === "ok" || "bad"],
        required: true,
        rounded: false,
        outlined: false,
        hideErrorIcon: false,
        hideBottomSpace: true,
        autogrow: true,
        autocomplete: "on",
        maska: "###",
        disabled: true,
        hint: "H",
        readonly: true,
        maxLength: 5,
      },
    });
  });

  it("инициализирует inputValue из modelValue и настраивает правила required→override", async () => {
    // при onMounted inputValue === prop.modelValue
    expect(wrapper.vm.inputValue).toBe("foo");
    // поскольку props.rules задано, validationRules===props.rules
    expect(wrapper.vm.validationRules).toHaveLength(1);
    expect(typeof wrapper.vm.validationRules[0]).toBe("function");
  });

  it("рендерит q-input со всеми пропсами", () => {
    const qi = wrapper.findComponent(QInputStub);
    expect(qi.exists()).toBe(true);
    expect(qi.props("type")).toBe("password");
    expect(qi.props("label")).toBe("My Label");
    expect(qi.props("placeholder")).toBe("PH");
    expect(qi.props("name")).toBe("nm");
    expect(qi.props("rounded")).toBe(false);
    expect(qi.props("outlined")).toBe(false);
    expect(qi.props("noErrorIcon")).toBe(false);
    expect(qi.props("hideBottomSpace")).toBe(true);
    expect(qi.props("autogrow")).toBe(true);
    expect(qi.props("autocomplete")).toBe("on");
    expect(qi.props("mask")).toBe("###");
    expect(qi.props("disable")).toBe(true);
    expect(qi.props("hint")).toBe("H");
    expect(qi.props("readonly")).toBe(true);
    expect(qi.props("maxlength")).toBe(5);
  });

  it("по умолчанию скрывает глаз, потом при togglePassword меняет currentType и иконку", async () => {
    // сначала showPassword===false, currentType==='password'
    expect(wrapper.vm.showPassword).toBe(false);
    expect(wrapper.vm.currentType).toBe("password");
    // слот append содержит одну q-icon
    let eye = wrapper.find("q-icon-stub");
    expect(eye.exists()).toBe(true);
    expect(eye.attributes("name")).toBe(mdiEyeOffOutline);

    await wrapper.vm.togglePassword();
    expect(wrapper.vm.showPassword).toBe(true);
    expect(wrapper.vm.currentType).toBe("text");
    await nextTick();
    eye = wrapper.find("q-icon-stub");
    expect(eye.attributes("name")).toBe(mdiEyeOutline);
  });

  it("updateValue: вызывает validate() и эмитит update:modelValue", async () => {
    // затащим внутрь qInputRef stub с валидатором
    const fakeValidate = vi.fn();
    wrapper.vm.qInputRef = { validate: fakeValidate };
    wrapper.vm.updateValue("bar");
    // ждем nextTick
    await nextTick();
    expect(fakeValidate).toHaveBeenCalled();
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["bar"]);
  });

  it("blur событие пробрасывается наружу", async () => {
    await wrapper.findComponent(QInputStub).trigger("blur");
    expect(wrapper.emitted("blur")).toBeTruthy();
  });

  it("watch modelValue обновляет inputValue", async () => {
    await wrapper.setProps({ modelValue: "zzz" });
    expect(wrapper.vm.inputValue).toBe("zzz");
  });
});
