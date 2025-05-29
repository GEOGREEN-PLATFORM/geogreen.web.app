<template>
  <div class="c-filter-container">
    <div class="filter-button">
      <CButton
        @click="toggleContentShow"
        size="small"
        stretch="hug"
        bg-color="var(--app-blue-050)"
        textColor="var(--app-grey-500)"
      >
        <div class="filter-button__content">
          <q-icon :name="mdiFilterOutline" color="blue-500"></q-icon>
          {{ showContent ? "Скрыть фильтры" : "Показать фильтры" }}
          <div v-show="activeFiltersCount > 0" class="filter-button__active-count">
            {{ activeFiltersCount }}
          </div>
        </div>
      </CButton>
    </div>
    <Transition name="slide-fade">
      <div v-show="showContent" class="filter-content">
        <div class="filter-items">
          <div v-for="item in filterItems" class="filter-items__item">
            <div class="filter-items__select" v-if="item.type === 'select' && item.data">
              <CInputSelect
                v-model="item.selected"
                @update:model-value="emits('update:modelValue', filterItems)"
                :options="item.data"
                :label="item.label"
                :disabled="item.disabled"
                :required="false"
                :useInput="!!item.useInput"
                @filter="(val: string) => updateDataForItem(item.key, val)"
              ></CInputSelect>
            </div>
            <div class="filter-items__date-range" v-if="item.type === 'date-range'">
              <CInputDate
                :label="item.label"
                v-model="item.selected"
                @update:model-value="emits('update:modelValue', filterItems)"
                :disabled="item.disabled"
                :required="false"
                range
              ></CInputDate>
            </div>
          </div>
        </div>
        <div class="filter-content__footer">
          <div @click="updateValue" class="filter-content__btn filter-content__btn--apply">
            Применить
          </div>
          <div @click="resetFilters" class="filter-content__btn filter-content__btn--reset">
            Сбросить
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { mdiFilterOutline } from "@quasar/extras/mdi-v6";
interface Props {
  modelValue: FilterItem[];
}
const props = defineProps<Props>();
const activeFiltersCount = ref(0);
const filterItems = ref<FilterItem[]>([]);
const showContent = ref(false);
const emits = defineEmits<{
  "update:modelValue": [FilterItem[]];
  applyFilters: [];
  resetFilters: [];
  updateDataForItem: [string, string];
}>();

function toggleContentShow() {
  showContent.value = !showContent.value;
}
function resetFilters() {
  filterItems.value = filterItems.value.map((item) => {
    if (item.type === "select") {
      return { ...item, selected: "" };
    }
    if (item.type === "date-range") {
      return { ...item, selected: { from: "", to: "" } };
    }
    return item;
  });
  calculateActiveFiltersCount();
  emits("update:modelValue", filterItems.value);
  emits("resetFilters");
}
function updateDataForItem(key: string, value: string) {
  emits("updateDataForItem", key, value);
}
function calculateActiveFiltersCount() {
  let count = 0;
  filterItems.value.forEach((item) => {
    if (item.type === "select" && item.selected) {
      count++;
    } else if (
      item.type === "date-range" &&
      typeof item.selected === "object" &&
      item.selected !== null &&
      typeof item.selected.from === "string" &&
      typeof item.selected.to === "string" &&
      (item.selected.from || item.selected.to)
    ) {
      count++;
    }
  });
  activeFiltersCount.value = count;
}
function updateValue() {
  calculateActiveFiltersCount();
  emits("update:modelValue", filterItems.value);
  emits("applyFilters");
}
onMounted(() => {
  filterItems.value = JSON.parse(JSON.stringify(props.modelValue));
});
watch(
  () => props.modelValue,
  (newVal) => {
    filterItems.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.c-filter-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  .filter-button {
    &__content {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      .filter-button__active-count {
        background-color: var(--app-blue-500);
        display: flex;
        width: 24px;
        height: 24px;
        align-items: center;
        justify-content: center;
        color: var(--app-white);
        border-radius: 50%;
      }
    }
  }
  .filter-content {
    .filter-items {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      &__item {
        margin-right: 8px;
        width: 252px;
        .filter-items__select {
        }
        .filter-items__date-range {
        }
      }
    }
    &__footer {
      display: flex;
      gap: 16px;
      .filter-content__btn {
        cursor: pointer;
        user-select: none;
        transition: color 0.1s ease;
        &--apply {
          color: var(--app-blue-300);
          &:hover {
            color: var(--app-blue-400);
          }
          &:active {
            color: var(--app-blue-500);
          }
        }
        &--reset {
          color: var(--app-grey-300);
          &:hover {
            color: var(--app-grey-400);
          }
          &:active {
            color: var(--app-grey-500);
          }
        }
      }
    }
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
