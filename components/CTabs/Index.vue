<template>
    <div class="c-tabs-container">
        <q-tabs :vertical="vertical" :shrink="shrink" active-bg-color="green-050" v-model="currentTab" @update:model-value="updateTab" indicator-color="green-500" class="tabs">
            <q-tab  
            content-class="tabs__content" :ripple="{ color: 'green-200'}" class="tabs__item text-grey-500" no-caps v-for="tab in props.tabs" 
            :name="tab.key" :key="tab.key" :label="tab.name">
            <slot :name="tab.key"></slot>
        </q-tab>
        </q-tabs>
    </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  tabs: Tab[];
  shrink?: boolean;
  vertical?: boolean;
}
const currentTab = shallowRef("");

const props = withDefaults(defineProps<Props>(), {
  shrink: false,
  vertical: false,
});
const emits = defineEmits<{
  "update:modelValue": [string];
}>();
function updateTab(newTab: string) {
  emits("update:modelValue", newTab);
}
onMounted(() => {
  currentTab.value = props.modelValue;
});
</script>

<style scoped lang="scss">
.c-tabs-container {
    .tabs {
        &__item {
            font-size: 16px;
        }
        :deep(.q-hoverable:hover > .q-focus-helper) {
            background: var(--app-green-050);
            opacity: 1;
        }
        :deep(.q-focus-helper:before) {
            background: none;
        }
        :deep(.tabs__content .q-tab__label) {
            font-size: 16px;
        }
        :deep(.q-tab__indicator) {
          z-index: 1;
        }
    }
}
</style>