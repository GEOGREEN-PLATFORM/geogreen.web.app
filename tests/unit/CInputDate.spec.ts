import DatePickerWrapper from "@/components/CInput/Date.vue";
// tests/unit/DatePickerWrapper.spec.ts
import { mount, shallowMount } from "@vue/test-utils";
import { date } from "quasar";
import { describe, expect, it, vi } from "vitest";

vi.mock("quasar", async () => {
  const actual = await vi.importActual<any>("quasar");
  return {
    ...actual,
    date: {
      formatDate: (val: any, fmt: string) => {
        // наш упрощённый форматтер
        const d = new Date(val);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
      },
    },
  };
});

describe("DatePickerWrapper (unit)", () => {
  it("formattedDate возвращает пустую строку без modelValue", () => {
    const w = shallowMount(DatePickerWrapper);
    expect(w.vm.formattedDate).toBe("");
  });

  it("formattedDate для одиночной даты (строка)", () => {
    const iso = "2024-01-02T00:00:00.000Z";
    const w = shallowMount(DatePickerWrapper, {
      props: { modelValue: iso, range: false },
    });
    expect(w.vm.formattedDate).toBe("02.01.2024");
  });

  it("formattedDate для date-range с разными from/to", () => {
    const from = "2024-01-01T00:00:00.000Z";
    const to = "2024-01-05T00:00:00.000Z";
    const w = shallowMount(DatePickerWrapper, {
      props: { modelValue: { from, to }, range: true },
    });
    expect(w.vm.formattedDate).toBe("01.01.2024 - 05.01.2024");
  });

  it("formattedDate для date-range с одинаковыми from/to", () => {
    const d = "2024-02-02T00:00:00.000Z";
    const w = shallowMount(DatePickerWrapper, {
      props: { modelValue: { from: d, to: d }, range: true },
    });
    expect(w.vm.formattedDate).toBe("02.02.2024");
  });

  it("isValidDate правильно валидирует строки", () => {
    expect(
      ((w) => (w as any).vm.isValidDate("31.12.2024"))(
        shallowMount(DatePickerWrapper),
      ),
    ).toBe(true);
    expect(
      ((w) => (w as any).vm.isValidDate("31.02.2024"))(
        shallowMount(DatePickerWrapper),
      ),
    ).toBe(false);
    expect(
      ((w) => (w as any).vm.isValidDate("abc"))(
        shallowMount(DatePickerWrapper),
      ),
    ).toBe(false);
  });

  it("updateDate эмитит диапазон для range=true и объектного val", async () => {
    const w = shallowMount(DatePickerWrapper, { props: { range: true } });
    await w.vm.updateDate({ from: "01.05.2024", to: "02.05.2024" });
    const [[val]] = w.emitted("update:modelValue")!;
    expect(val).toHaveProperty("from");
    expect(val).toHaveProperty("to");
  });

  it("updateDate игнорит неверные форматы", async () => {
    const w = shallowMount(DatePickerWrapper, { props: { range: false } });
    await w.vm.updateDate("99.99.9999");
    expect(w.emitted("update:modelValue")).toBeUndefined();
  });
});
