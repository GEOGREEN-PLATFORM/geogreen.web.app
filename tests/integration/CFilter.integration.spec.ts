import CFilterContainer from "@/components/CFilter/Index.vue";
import CInputDate from "@/components/CInput/Date.vue";
import CInputSelect from "@/components/CInput/Select.vue";
// CFilterContainer.integration.test.ts
import { mount } from "@vue/test-utils";
import { Quasar } from "quasar";
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

const global = {
  plugins: [Quasar],
  stubs: {
    Transition: true,
  },
};

describe("CFilterContainer (integration)", () => {
  const mockFilterItems: FilterItem[] = [
    {
      key: "test-select",
      type: "select",
      label: "Test Select",
      data: [{ value: "1", name: "Option 1" }],
      selected: "",
    },
    {
      key: "test-date",
      type: "date-range",
      label: "Test Date",
      selected: { from: "", to: "" },
    },
  ];

  it("синхронизирует состояние фильтров с родительским компонентом", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: {
        modelValue: mockFilterItems,
      },
    });

    await wrapper.findComponent({ name: "QBtn" }).trigger("click");

    // Тестируем выбор в селекте
    const select = wrapper.findComponent(CInputSelect);
    await select.setValue("1");

    // Тестируем выбор даты
    const dateInput = wrapper.findComponent(CInputDate);
    await dateInput.setValue({ from: "2023-01-01", to: "2023-01-05" });

    // Применяем фильтры
    await wrapper.find(".filter-content__btn--apply").trigger("click");

    const emittedData = wrapper.emitted("update:modelValue")?.[0][0];
    expect(emittedData[0].selected).toBe("1");
    expect(emittedData[1].selected).toEqual({
      from: "2023-01-01",
      to: "2023-01-05",
    });
  });

  it("полностью сбрасывает состояние фильтров", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: {
        modelValue: mockFilterItems,
      },
    });

    // Открываем и изменяем фильтры
    await wrapper.findComponent({ name: "QBtn" }).trigger("click");
    await wrapper.findComponent(CInputSelect).setValue("1");
    await wrapper
      .findComponent(CInputDate)
      .setValue({ from: "2023-01-01", to: "2023-01-05" });

    // Сбрасываем фильтры
    await wrapper.find(".filter-content__btn--reset").trigger("click");

    // Проверяем сброс
    const emittedData = wrapper.emitted("update:modelValue")?.[0][0];
    expect(emittedData[0].selected).toBe("");
    expect(emittedData[1].selected).toEqual({ from: "", to: "" });
    expect(wrapper.find(".filter-button__active-count").isVisible()).toBe(
      false,
    );
  });

  it("обновляет данные через дочерние компоненты", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: {
        modelValue: mockFilterItems,
      },
    });

    await wrapper.findComponent({ name: "QBtn" }).trigger("click");

    // Тестируем фильтрацию в селекте
    const select = wrapper.findComponent(CInputSelect);
    select.vm.$emit("filter", "test");

    expect(wrapper.emitted("updateDataForItem")).toEqual([
      ["test-select", "test"],
    ]);
  });

  it("корректно отображает количество активных фильтров", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: {
        modelValue: mockFilterItems,
      },
    });

    // Открываем фильтры
    await wrapper.findComponent({ name: "QBtn" }).trigger("click");
    await nextTick();

    // Изменяем только селект
    const select = wrapper.findComponent(CInputSelect);
    await select.setValue("1");

    // Применяем изменения
    await wrapper.find(".filter-content__btn--apply").trigger("click");
    await nextTick();
    await nextTick();

    // Проверяем счетчик
    expect(wrapper.find(".filter-button__active-count").text()).toBe("1");
    expect(wrapper.vm.activeFiltersCount).toBe(1);
  });

  it("обрабатывает динамическое обновление modelValue", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: {
        modelValue: mockFilterItems,
      },
    });

    // Обновляем входные данные
    const newItems = JSON.parse(JSON.stringify(mockFilterItems));
    newItems[0].selected = "2";
    await wrapper.setProps({ modelValue: newItems });
    await nextTick();

    // Проверяем обновление состояния
    expect(wrapper.findComponent(CInputSelect).props("modelValue")).toBe("2");
  });
});
