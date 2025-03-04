<template>
    <div class="c-tabs-container">
        <q-tabs 
          :vertical="vertical" stretch active-bg-color="green-050" v-model="currentTab" @update:model-value="updateTab" 
          indicator-color="green-500" class="c-tabs"
        >
            <q-tab  
            content-class="c-tabs__content" :ripple="{ color: 'green-200'}" class="c-tabs__item text-grey-500" no-caps v-for="tab in props.tabs" 
            :name="tab.key" :key="tab.key" :label="tab.name" :disable="tab.disabled">
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
  height?: string;
}
const currentTab = shallowRef("");

const props = withDefaults(defineProps<Props>(), {
  shrink: false,
  vertical: false,
  height: "64px",
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
watch(
  () => props.modelValue,
  () => {
    currentTab.value = props.modelValue;
  },
);
</script>

<style scoped lang="scss">
.c-tabs-container {
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;
  display: flex;
  height: v-bind(height);
  :deep(.c-tabs) {
      .c-tabs__content {
        .q-tab__label {
          font-size: 16px;
        }
      }
      .q-focus-helper:before {
        background: none;
      }
      .q-tab__indicator {
        z-index: 1;
      }
      .q-hoverable:hover > .q-focus-helper {
        background-color: var(--app-green-050);
        opacity: 1;
      }
    }
  @media screen and (max-width: $app-laptop) {
    height: auto;
    width: 100%;
    :deep(.c-tabs) {
      width: 100%;
      .c-tabs__item {
        justify-content: flex-end;
      }
      .c-tabs__content {
        height: 64px;
      }
    }
  }
}
</style>