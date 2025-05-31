<template>
  <CDialog :model-value="modelValue" @update:model-value="toggleOpenState" type="confirm">
    <div class="confirm-dialog">
      <q-card-section class="confirm-dialog__title">
        <span>Подтверждение</span>
      </q-card-section>
      <q-card-section class="confirm-dialog__message">
        <span>Вы действительно хотите {{ actionMainText }}?</span>
      </q-card-section>
      <q-card-actions align="right" class="confirm-dialog__actions">
        <CButton v-close-popup label="Отмена" design-type="tertiary" @click="cancelAction" />
        <CButton
          :label="actionButtonConfirmText"
          :loading="props.state === 'loading'"
          design-type="primary"
          :bgColor="props.negative ? 'var(--app-red-500)' : 'var(--app-green-500)'"
          textColor="var(--app-white)"
          @click="confirmAction"
        />
      </q-card-actions>
    </div>
  </CDialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  actionMainText?: string;
  actionButtonConfirmText?: string;
  negative?: boolean;
  state?: "success" | "error" | "loading";
}

const props = withDefaults(defineProps<Props>(), {
  actionMainText: "подтвердить действие",
  actionButtonConfirmText: "Подтвердить",
  negative: true,
  state: "success",
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
