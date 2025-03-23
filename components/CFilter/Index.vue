<template>
    <div class="c-filter-container">
        <div class="filter-button">
            <GGButton @click="toggleContentShow" size="small" stretch="hug" bg-color="var(--app-blue-050)" textColor="var(--app-grey-500)">
                <div class="filter-button__content">
                <q-icon :name="mdiFilterOutline" color="blue-500"></q-icon>
                {{ showContent ? 'Скрыть фильтры' : 'Показать фильтры' }}
                <div v-show="activeFiltersCount > 0" class="filter-button__active-count">{{ activeFiltersCount }}</div>
                </div>
            </GGButton>
        </div>
        <Transition name="slide-fade">
        <div v-show="showContent" class="filter-content">
            <div class="filter-items">
                <div v-for="item in filterItems" class="filter-items__item">
                    <div class="filter-items__select" v-if="item.type === 'select' && item.data">
                        <KTInputSelect v-model="item.selected as string" :options="item.data" :label="item.label"></KTInputSelect>
                    </div>
                    <div class="filter-items__date-range" v-if="item.type === 'date-range'">
                        <KTInputDate :label="item.label + ' с'" v-model="item.selected[0]"></KTInputDate>
                        <span class="filter-items__date-range-divider"></span>
                        <KTInputDate :label="item.label + ' по'" v-model="item.selected[1]"></KTInputDate>
                    </div>
                </div>
            </div>
            <div class="filter-content__footer">
                <div @click="updateValue" class="filter-content__btn  filter-content__btn--apply">Применить</div>
                <div @click="resetFilters" class="filter-content__btn filter-content__btn--reset">Сбросить</div>
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
      return { ...item, selected: ["", ""] };
    }
    return item;
  });
  calculateActiveFiltersCount();
  emits("update:modelValue", filterItems.value);
}
function calculateActiveFiltersCount() {
  let count = 0;
  filterItems.value.forEach((item) => {
    if (item.type === "select" && item.selected) {
      count++;
    } else if (
      item.type === "date-range" &&
      Array.isArray(item.selected) &&
      (item.selected[0] || item.selected[1])
    ) {
      count++;
    }
  });
  activeFiltersCount.value = count;
}
function updateValue() {
  calculateActiveFiltersCount();
  emits("update:modelValue", filterItems.value);
}
onMounted(() => {
  filterItems.value = props.modelValue;
});
</script>

<style scoped lang="scss">
.c-filter-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
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
            gap: 32px;
            &__item {
                .filter-items__select {
                    width: 252px;
                }
                .filter-items__date-range {
                    display: flex;
                    width: calc(252px * 2 + 56px);
                    .filter-items__date-range-divider {
                        min-width: 24px;
                        height: 2px;
                        background-color: var(--app-grey-050);
                        display: inline-block;
                        margin: 28px 12px;
                    }
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

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
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