<template>
  <CDialog :model-value="modelValue" @update:model-value="toggleOpenState">
    <q-card class="confirm-dialog">
      <q-card-section class="confirm-dialog__title">
        <span>Подтверждение</span>
      </q-card-section>
      <q-card-section class="confirm-dialog__message">
        <span>Вы действительно хотите {{ actionMainText }}?</span>
      </q-card-section>
      <q-card-actions align="right" class="confirm-dialog__actions">
        <CButton
          v-close-popup
          label="Отмена"
          design-type="tertiary"
          textColor="var(--app-blue-500)"
          @click="cancelAction"
        />
        <CButton
          v-close-popup
          :label="actionButtonConfirmText"
          design-type="primary"
          bgColor="var(--app-red-500)"
          textColor="var(--app-white)"
          @click="confirmAction"
        />
      </q-card-actions>
    </q-card>
  </CDialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  actionMainText?: string;
  actionButtonConfirmText?: string;
}

withDefaults(defineProps<Props>(), {
  actionMainText: "подтвердить действие",
  actionButtonConfirmText: "Подтвердить",
});

const emit = defineEmits<{
  cancel: [];
  confirm: [];
  "update:model-value": [boolean];
}>();

function cancelAction() {
  emit("cancel");
}

function confirmAction() {
  emit("confirm");
}

function toggleOpenState(newState: boolean) {
  emit("update:model-value", newState);
}
</script>

<style scoped lang="scss">
.confirm-dialog {
  padding: 24px;
  &__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--app-grey-900);
  }

  &__message {
    margin-top: 8px;
    font-size: 16px;
    color: var(--app-grey-900);
  }

  &__actions {
    display: flex;
    margin-top: 16px;
    flex-wrap: nowrap;
    gap: 16px;
  }
}
</style>
