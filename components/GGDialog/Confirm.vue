<template>
  <GGDialog :model-value="modelValue" @update:model-value="toggleOpenState">
    <q-card>
      <q-card-section class="row items-center">
        <q-icon />
        <span>Вы действительно хотите {{ actionMainText }}?</span>
      </q-card-section>

      <q-card-actions align="right">
        <GGButton
          v-close-popup
          label="Отмена"
          design-type="tertiary"
          @click="cancelAction"
        />
        <GGButton
          v-close-popup
          :label="actionButtonConfirmText"
          design-type="tertiary"
          @click="confirmAction"
        />
      </q-card-actions>
    </q-card>
  </GGDialog>
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
  "cancel": [];
  "confirm": [];
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
onMounted(() => {});
</script>

<style scoped lang="scss"></style>
