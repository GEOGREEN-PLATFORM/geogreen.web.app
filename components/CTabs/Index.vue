<template>
  <div class="c-tabs-container">
    <q-tabs
      :vertical="vertical"
      stretch
      active-bg-color="green-050"
      :model-value="currentTabKey"
      @update:model-value="updateTab"
      indicator-color="green-500"
      class="c-tabs"
    >
      <q-tab
        content-class="c-tabs__content"
        :ripple="{ color: 'green-200' }"
        class="c-tabs__item text-grey-500"
        :class="{
          'has-nested': tab.hasNested,
        }"
        no-caps
        v-for="tab in props.tabs"
        :name="tab.key"
        :key="tab.key"
        :label="tab.hasNested ? '' : tab.name"
        :disable="tab.disabled"
      >
        <slot :name="tab.key">
          <q-btn-dropdown
            v-if="tab.hasNested"
            class="c-tabs__item-dropdown"
            content-class="c-tabs__dropdown-content"
            auto-close
            flat
            stretch
            :label="tab.name"
            :ripple="false"
            no-caps
          >
            <q-list class="c-tabs__dropdown-list">
              <q-item
                v-for="item in tab.nestedItems"
                :key="item.key"
                :class="{
                  active: item.selected,
                }"
                @click="handleNestedTabClick(tab, item.key)"
                clickable
              >
                <q-item-section>{{ item.name }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </slot>
      </q-tab>
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | Tab;
  tabs: Tab[];
  shrink?: boolean;
  vertical?: boolean;
  height?: string;
  returnObj?: boolean;
}
const currentTabKey = shallowRef("");

const props = withDefaults(defineProps<Props>(), {
  shrink: false,
  vertical: false,
  height: "64px",
});
const emits = defineEmits<{
  "update:modelValue": [string | Tab];
  selectNested: [Tab, string];
}>();

function getTabByKey(key: string) {
  return props.tabs.find((tab) => tab.key === key);
}
function updateTab(newTabKey: string) {
  if (!getTabByKey(newTabKey)?.hasNested) {
    currentTabKey.value = newTabKey;
    if (props.returnObj) {
      emits("update:modelValue", getTabByKey(newTabKey) as Tab);
    } else {
      emits("update:modelValue", newTabKey);
    }
  }
}
function handleNestedTabClick(tab: Tab, nestedKey: string) {
  currentTabKey.value = tab.key;
  emits("update:modelValue", tab);
  emits("selectNested", tab, nestedKey);
}
onMounted(() => {
  currentTabKey.value = props.returnObj
    ? (props.modelValue as Tab)?.key
    : (props.modelValue as string);
});
watch(
  () => props.modelValue,
  () => {
    currentTabKey.value = props.returnObj
      ? (props.modelValue as Tab)?.key
      : (props.modelValue as string);
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
  :global(.c-tabs__dropdown-content) {
    background-color: var(--app-green-050);
    margin-top: 4px !important;
    border-radius: 0px 0px 8px 8px;
    @media screen and (max-width: $app-laptop) {
      width: calc(90vw - 1px);
    }
  }
  :global(.c-tabs__dropdown-content .c-tabs__dropdown-list .active) {
    background-color: var(--app-green-200);
  }
  :deep(.c-tabs) {
    .c-tabs__item {
      &.has-nested {
        padding: 0;
      }
    }
    .c-tabs__item-dropdown {
      height: 100%;
      font-size: 16px;
    }
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
