<template>
  <q-card class="c-card-container">
    <q-list class="c-card-items">
      <q-item v-for="item in props.list" class="c-card-items__item">
        <q-item-section class="c-card-items__section">
          <q-item-label class="c-card-items__label gg-t-base">{{ item.label }}:</q-item-label>
          <div v-if="item.value" class="c-card-items__value-container">
            <div v-if="item.type === 'text'" class="c-card-items__value">{{ item.value }}</div>
            <nuxt-link
              v-else-if="item.type === 'link'"
              class="c-card-items__value c-card-items__value--link"
              :to="props.linksByLabel[item.label]"
              >{{ item.value }}</nuxt-link
            >
            <div
              class="c-card-items__value c-card-items__value--status"
              :style="statusStylesByValue[item.value]"
              v-else-if="item.type === 'status'"
            >
              {{ item.value }}
            </div>
          </div>
          <div v-else class="c-card-items__value--empty">Нет данных</div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  list: {
    label: string;
    value: string;
    type: "text" | "link" | "status";
  }[];
  linksByLabel?: Record<string, string>;
  statusStylesByValue?: Record<string, string>;
}
const props = withDefaults(defineProps<Props>(), {
  linksByLabel: () => ({}),
  statusStylesByValue: () => ({}),
});
</script>

<style scoped lang="scss">
.c-card-container {
  height: max-content;
  width: 100%;
  max-width: 440px;
  background-color: var(--app-green-050);
  border-radius: 12px;
  padding: 12px;
  .c-card-items {
    &__section {
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
    }
    &__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    &__label {
      width: 144px;
      color: var(--app-grey-400);
    }
    &__value {
      font-size: 16px;
      color: var(--app-grey-900);
      &--link {
        color: var(--app-blue-500);
      }
      &--status {
        border-radius: 16px;
        padding: 4px 16px;
      }
      &--empty {
        font-size: 14px;
        color: var(--app-grey-300);
      }
    }
  }
}
</style>
