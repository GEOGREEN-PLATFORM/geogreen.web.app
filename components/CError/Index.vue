<template>
  <div class="c-error">
    <div class="c-error__icon">
      <q-icon name="warning_amber" size="40px" color="negative" />
    </div>
    <div class="c-error__content">
      <h1 class="c-error__title gg-h1">Произошла ошибка при загрузке данных</h1>
      <p class="c-error__message">
        {{ props.error?.message || "Неизвестная ошибка" }}
      </p>
      <div class="c-error__actions">
        <q-btn flat label="Повторить" icon="refresh" @click="$emit('refresh')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  error?: Error | any;
}

const props = defineProps<Props>();
const emit = defineEmits<(e: "refresh") => void>();
</script>

<style scoped lang="scss">
.c-error {
  display: flex;
  align-items: center;
  background-color: var(--app-red-050);
  border: 1px solid var(--app-red-100);
  border-radius: 8px;
  padding: 24px;
  gap: 16px;
  margin: 16px 0;

  &__icon {
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
  }

  &__title {
    margin: 0 0 8px;
    color: var(--app-red-600);
    font-size: 1.5rem;
    line-height: 1.2;
    text-wrap: balance;
  }

  &__message {
    margin: 0 0 16px;
    color: var(--app-grey-500);
    font-size: 1rem;
    word-break: break-word;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}
</style>
