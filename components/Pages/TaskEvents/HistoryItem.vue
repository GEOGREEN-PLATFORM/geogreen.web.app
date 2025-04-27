<template>
  <div class="c-history-item">
    <section class="c-history-item__top-section">
      <CAvatar></CAvatar>
      <div class="c-history-item__content">
        <div class="c-history-item__info">
          <div class="c-history-item__authorName gg-t-base">{{ props.history.operatorName }}</div>
          <div class="c-history-item__date gg-cap">{{ props.history.recordDate }}</div>
        </div>
        <div class="c-history-item__description gg-t-small">{{ props.history.description }}</div>
      </div>
    </section>
    <CFileContainers :files="history.photos" :clearable="false"></CFileContainers>
  </div>
</template>

<script setup lang="ts">
interface TaskEventHistory {
  id: string;
  eventId: string;
  recordDate: string;
  recordType: string;
  description: string;
  photos: ImageObj[];
  operatorName: string;
  operatorId: string;
  createDate: string;
}

const props = defineProps<{
  history: TaskEventHistory;
}>();
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
