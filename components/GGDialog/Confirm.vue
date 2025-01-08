<template>
    <GGDialog :model-value="modelValue" @update:model-value="toggleOpenState">
        <q-card>
        <q-card-section class="row items-center">
          <q-icon/>
          <span>Вы действительно хотите {{ actionMainText }}?</span>
        </q-card-section>

        <q-card-actions align="right">
            <KTButton @click="cancelAction" label="Отмена" designType="tertiary" v-close-popup></KTButton>
            <KTButton @click="confirmAction" :label="actionButtonConfirmText" designType="tertiary" v-close-popup></KTButton>
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
const props = withDefaults(defineProps<Props>(), {
    actionMainText: "подтвердить действие",
    actionButtonConfirmText: "Подтвердить"
});
const emit = defineEmits<{
    cancel: [],
    confirm: [],
    "update:model-value": [boolean]
}>()
function cancelAction() {
    emit("cancel");
}
function confirmAction() {
    emit("confirm")
}
function toggleOpenState(newState: boolean) {
    emit("update:model-value", newState)
}
onMounted(() => {
});
</script>

<style scoped lang="scss">

</style>
