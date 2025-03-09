<template>
    <div class="c-filter-container">
        <div class="filter-button">
            <GGButton size="small" stretch="hug" bg-color="var(--app-blue-050)" textColor="var(--app-grey-500)">
                <div class="filter-button__content">
                <q-icon :name="mdiFilterOutline" color="blue-500"></q-icon>
                Фильтры
                <div class="filter-button__active-count">{{ activeFiltersCount }}</div>
                </div>
            </GGButton>
        </div>
        <div class="filter-content">
            <div class="filter-items">
                <div v-for="item in items" class="filter-items__item">
                    <div class="filter-items__select" v-if="item.type === 'select'">
                        <KTInputSelect v-model="item.selected" :options="item.data" :label="item.label"></KTInputSelect>
                    </div>
                    <div class="filter-items__date-range" v-if="item.type === 'date-range'">
                        <KTInputDate></KTInputDate>
                        <span class="filter-items__date-range-divider"></span>
                        <KTInputDate></KTInputDate>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { mdiFilterOutline } from "@quasar/extras/mdi-v6";
interface Props {
  items: FilterItem[];
}
const props = defineProps<Props>();
const activeFiltersCount = ref(0);
const filterItems = ref();
</script>

<style scoped lang="scss">
.c-filter-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    .filter-button {
        &__content {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
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
            align-items: center;
            flex-wrap: wrap;
            gap: 32px;
            width: max-content;
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
                        margin: auto 12px;
                    }
                }
            }
        }
    }
}
</style>