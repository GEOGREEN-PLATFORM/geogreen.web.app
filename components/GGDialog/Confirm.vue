<template>
    <GGDialog :model-value="modelValue">
        <q-card>
        <q-card-section class="row items-center">
          <q-icon/>
          <span>Вы действительно хотите {{ actionMainText }}?</span>
        </q-card-section>

        <q-card-actions align="right">
            <KTButton label="Отмена" designType="tertiary" v-close-popup></KTButton>
            <KTButton :label="actionButtonText" designType="tertiary" v-close-popup></KTButton>
        </q-card-actions>
      </q-card>
    </GGDialog>
</template>
  
<script setup lang="ts">
interface Props {
    modelValue: boolean;
    actionMainText: string;
    actionButtonText: string;
}
const props = withDefaults(defineProps<Props>(), {
    actionMainText: "подтвердить действие",
    actionButtonText: "Подтвердить"
});


onMounted(() => {
});
</script>

<style scoped lang="scss">

</style>
