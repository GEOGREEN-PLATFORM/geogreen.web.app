import { setup } from "@nuxt/test-utils";
import { mount } from "@vue/test-utils";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import OTPInput from "../../components/KTInput/OTP.vue";

describe("oTPInput", () => {
  beforeAll(async () => {
    await setup({ server: false });
  });

  it("renders the correct number of input fields based on digitCount", async () => {
    const wrapper = mount(OTPInput, {
      props: { digitCount: 6, modelValue: "" }
    });
    await nextTick();
    const inputs = wrapper.findAll("input");
    expect(inputs.length).toBe(6);
  });

  it("initializes input fields with the value from modelValue", async () => {
    const wrapper = mount(OTPInput, {
      props: { modelValue: "1234", digitCount: 4 }
    });
    await nextTick();
    const inputs = wrapper.findAll("input");
    inputs.forEach((input, index) => {
      expect(input.element.value).toBe("1234"[index]);
    });
  });

  it("clears input fields when modelValue is empty", async () => {
    const wrapper = mount(OTPInput, {
      props: { modelValue: "", digitCount: 4 }
    });
    await nextTick();
    const inputs = wrapper.findAll("input");
    inputs.forEach((input) => {
      expect(input.element.value).toBe("");
    });
  });

  it("correctly handles paste events at any index", async () => {
    const wrapper = mount(OTPInput, {
      props: { digitCount: 4, modelValue: "" }
    });
    await nextTick();
    const pastedData = "7583";
    for (let i = 0; i < 4; i++) {
      const inputs = wrapper.findAll("input");
      await inputs.at(i)?.trigger("paste", { clipboardData: { getData: () => pastedData } });
      await nextTick();

      const inputsAfterPaste = wrapper.findAll("input");
      for (let j = 0; j < pastedData.length && j < 4 - i; j++) {
        expect(inputsAfterPaste.at(i + j)?.element.value).toBe(pastedData[j]);
      }
    }
  });

  it("correctly handles input-delete event", async () => {
    const wrapper = mount(OTPInput, {
      props: { digitCount: 4, modelValue: "7654" }
    });
    await nextTick();

    const inputs = wrapper.findAll("input");
    const input = inputs.at(3);

    await input?.trigger("keydown", { key: "Backspace" });
    await nextTick();
    expect(input?.element.value).toBe("");
    await input?.setValue("9");
    await nextTick();
    expect(input?.element.value).toBe("9");
    await input?.trigger("keydown", { key: "Delete" });
    await nextTick();
    expect(input?.element.value).toBe("");
  });

  afterAll(() => {});
});
