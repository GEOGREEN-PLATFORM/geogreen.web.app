import { setup } from "@nuxt/test-utils";
import { mount } from "@vue/test-utils";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import OTPInput from "../../components/KTInput/OTP.vue";

describe("oTPInput", () => {
  beforeAll(async () => {
    await setup({ server: false });
  });

  it("renders the correct number of input fields based on digitCount", () => {
    const wrapper = mount(OTPInput, {
      props: { digitCount: 6, modelValue: "" },
    });
    const inputs = wrapper.findAll("input");
    expect(inputs.length).toBe(6);
  });

  it("initializes input fields with the value from modelValue", () => {
    const wrapper = mount(OTPInput, {
      props: { modelValue: "1234", digitCount: 4 },
    });
    const inputs = wrapper.findAll("input");
    inputs.forEach((input, index) => {
      expect(input.element.value).toBe("1234"[index]);
    });
  });

  it("clears input fields when modelValue is empty", () => {
    const wrapper = mount(OTPInput, {
      props: { modelValue: "", digitCount: 4 },
    });
    const inputs = wrapper.findAll("input");
    inputs.forEach((input) => {
      expect(input.element.value).toBe("");
    });
  });

  it("correctly handles paste events at any index", async () => {
    const wrapper = mount(OTPInput, {
      props: { digitCount: 4, modelValue: "" },
    });
    const pastedData = "7583";
    for (let i = 0; i < 4; i++) {
      const inputs = wrapper.findAll("input");

      await inputs
        .at(i)
        ?.trigger("paste", { clipboardData: { getData: () => pastedData } });

      const inputsAfterPaste = wrapper.findAll("input");
      for (let j = 0; j < pastedData.length && j < 4 - i; j++) {
        expect(inputsAfterPaste.at(i + j)?.element.value).toBe(pastedData[j]);
      }
    }
  });

  it("correctly handles input-delete event", async () => {
    const wrapper = mount(OTPInput, {
      props: { digitCount: 4, modelValue: "7654" },
    });

    const inputs = wrapper.findAll("input");
    const input = inputs.at(3);

    await input?.trigger("keydown", { key: "Backspace" });
    expect(input?.element.value).toBe("");
    await input?.setValue("9");
    expect(input?.element.value).toBe("9");
    await input?.trigger("keydown", { key: "Delete" });
    expect(input?.element.value).toBe("");
  });

  it("emits isFull when all digits are entered", async () => {
    const wrapper = mount(OTPInput, {
      props: { digitCount: 4, modelValue: "" },
    });

    const inputs = wrapper.findAll("input");

    await inputs.at(0)?.setValue("1");
    await inputs.at(1)?.setValue("2");
    await inputs.at(2)?.setValue("3");
    await inputs.at(3)?.setValue("4");
    await inputs.at(3)?.trigger("blur");
    expect(wrapper.emitted("isFull")).toBeTruthy();
  });

  afterAll(() => {});
});
