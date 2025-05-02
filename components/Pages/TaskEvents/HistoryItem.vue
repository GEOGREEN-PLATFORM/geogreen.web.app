<template>
  <div class="c-history-item">
    <section class="c-history-item__top-section">
      <CAvatar></CAvatar>
      <div class="c-history-item__content">
        <div class="c-history-item__info">
          <div class="c-history-item__authorName gg-t-base">
            {{
              `${props.history.operator.lastName} ${props.history.operator.firstName} ${props.history.operator.patronymic} `
            }}
          </div>
          <div class="c-history-item__date gg-cap">
            {{ timeConverter(props.history.recordDate) }}
          </div>
        </div>
        <div
          class="c-history-item__description gg-t-small"
          v-html="props.history.description"
        ></div>
      </div>
    </section>
    <CFileContainers :files="history.photos" :clearable="false"></CFileContainers>
  </div>
</template>

<script setup lang="ts">
import type { TaskEventHistory } from "~/types/interfaces/taskEvents";

const props = defineProps<{
  history: TaskEventHistory;
}>();
const { timeConverter } = useFormatters();
</script>

<style scoped lang="scss">
.c-history-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  &__top-section {
    display: flex;
    gap: 12px;
  }
  &__content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  &__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__description {
    background-color: var(--app-white);
    border-radius: 4px;
    border: 1px solid var(--app-grey-100);
    padding: 8px;
    overflow-wrap: anywhere;
  }
}
</style>
