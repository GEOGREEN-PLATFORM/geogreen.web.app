import CFilterContainer from "@/components/CFilter/Index.vue";
import { mdiFilterOutline } from "@quasar/extras/mdi-v6";
// CFilterContainer.unit.test.ts
import { mount } from "@vue/test-utils";
import { Quasar } from "quasar";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

// Мок для Quasar
const $q = {
  platform: {
    is: {
      electron: false,
    },
  },
};

// Полноценные стабы для Quasar компонентов
const QBtnStub = {
  name: "QBtn",
  template: `
    <button 
      class="q-btn-stub"
      :disabled="disable"
      @click="$emit('click')"
    >
      <slot></slot>
      <span v-if="label">{{ label }}</span>
    </button>
  `,
  props: ["label", "disable"],
};
const QDateStub = {
  name: "QDate",
  template: '<div class="q-date-stub"></div>',
  props: ["modelValue"],
};
const QSelectStub = {
  name: "QSelect",
  template: `
    <div class="q-select-stub">
      <select 
        :value="modelValue" 
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option 
          v-for="option in options" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  `,
  props: ["modelValue", "options"],
};

const QIconStub = {
  name: "QIcon",
  template: '<i class="q-icon-stub"></i>',
  props: ["name", "color"],
};

const global = {
  plugins: [Quasar],
  mocks: { $q },
  stubs: {
    QBtn: QBtnStub,
    QSelect: QSelectStub,
    QDate: QDateStub,
    QIcon: QIconStub,
    Transition: true,
  },
};

describe("CFilterContainer (unit)", () => {
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

  it("рендерится и отображает базовое состояние", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: { modelValue: mockFilterItems },
    });

    await nextTick();

    const button = wrapper.findComponent(QBtnStub);
    expect(button.text()).toContain("Показать фильтры");

    // Проверяем видимость вместо существования в DOM
    expect(wrapper.find(".filter-button__active-count").isVisible()).toBe(
      false,
    );

    // Проверяем видимость контента
    expect(wrapper.find(".filter-content").isVisible()).toBe(false);
  });

  it("переключает видимость контента при клике на кнопку", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: { modelValue: mockFilterItems },
    });

    await wrapper.findComponent(QBtnStub).trigger("click");
    await nextTick();

    expect(wrapper.vm.showContent).toBe(true);
    expect(wrapper.find(".filter-content").isVisible()).toBe(true);
    expect(wrapper.findComponent(QBtnStub).text()).toContain("Скрыть фильтры");
  });

  it("обновляет счётчик активных фильтров", async () => {
    const items = JSON.parse(JSON.stringify(mockFilterItems));
    items[0].selected = "1";

    const wrapper = mount(CFilterContainer, {
      global,
      props: { modelValue: items },
    });

    await nextTick();
    await wrapper.vm.calculateActiveFiltersCount();

    expect(wrapper.vm.activeFiltersCount).toBe(1);
    expect(
      wrapper
        .findComponent(QBtnStub)
        .find(".filter-button__active-count")
        .text(),
    ).toBe("1");
  });

  it("эмитит события при применении и сбросе", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: { modelValue: mockFilterItems },
    });

    // Открываем контент через клик
    await wrapper.findComponent(QBtnStub).trigger("click");

    // Apply
    await wrapper.find(".filter-content__btn--apply").trigger("click");
    expect(wrapper.emitted("applyFilters")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();

    // Reset
    await wrapper.find(".filter-content__btn--reset").trigger("click");
    expect(wrapper.emitted("resetFilters")).toBeTruthy();
  });

  it("сбрасывает фильтры корректно", async () => {
    const items = JSON.parse(JSON.stringify(mockFilterItems));
    items[0].selected = "1";
    items[1].selected = { from: "2023-01-01", to: "2023-01-05" };

    const wrapper = mount(CFilterContainer, {
      global,
      props: { modelValue: items },
    });

    // Открываем контент через клик
    await wrapper.findComponent(QBtnStub).trigger("click");
    await wrapper.find(".filter-content__btn--reset").trigger("click");

    // Проверяем через emitted события
    const emittedData = wrapper.emitted("update:modelValue")?.[0][0];
    expect(emittedData[0].selected).toBe("");
    expect(emittedData[1].selected).toEqual({ from: "", to: "" });
  });

  it("обновляет данные через updateDataForItem", async () => {
    const wrapper = mount(CFilterContainer, {
      global,
      props: { modelValue: mockFilterItems },
    });

    wrapper.vm.updateDataForItem("test-key", "test-value");
    expect(wrapper.emitted("updateDataForItem")).toEqual([
      ["test-key", "test-value"],
    ]);
  });
});
