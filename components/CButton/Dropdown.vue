<template>
  <div class="c-button-main" :class="{ 'button-icon': icon }">
    <q-btn-dropdown
      :class="{
        [designType]: true,
        disabled,
        [stretch]: true,
        [size]: true,
        icon: icon,
      }"
      no-caps
      :label="!props.icon ? label : ''"
      :rounded="buttonDesignTypeSettings.rounded"
      :outline="buttonDesignTypeSettings.outline"
      :flat="buttonDesignTypeSettings.flat"
      :disable="disabled"
      :type="type"
      :loading="loading"
      :icon="icon"
      :style="`background-color: ${bgColor}; color: ${textColor}`"
      v-model="contentOpened"
      :menu-offset="[0, 12]"
      ><slot></slot
    ></q-btn-dropdown>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
  designType?: "primary" | "secondary" | "tertiary";
  stretch?: "fill" | "hug";
  disabled?: boolean;
  type?: "submit";
  loading?: boolean;
  size?: "large" | "medium" | "small";
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  textColor?: string;
}
const props = withDefaults(defineProps<Props>(), {
  rounded: true,
  designType: "primary",
  stretch: "fill",
  disabled: false,
  size: "large",
});
const buttonDesignTypeSettings = ref({
  outline: false,
  rounded: true,
  flat: false,
  loading: false,
});
const contentOpened = ref(false);
onMounted(() => {
  buttonDesignTypeSettings.value.flat = props.designType === "tertiary";
});
</script>

<style scoped lang="scss">
.c-button-main {
  display: flex;
  width: 100%;
  &:has(.hug) {
    width: fit-content;
  }
  .primary {
    background: var(--app-green-500);
    color: var(--app-white);
  }
  .secondary {
    background: var(--app-green-050);
    color: var(--app-grey-500);
  }
  .tertiary {
    color: var(--app-green-500);
  }
  .primary.disabled {
    background: var(--app-grey-050);
  }
  .secondary.disabled {
    color: var(--app-grey-100);
  }
  .tertiary.disabled {
    color: var(--app-grey-100);
  }
  .large {
    height: 56px;
  }
  .medium {
    height: 48px;
  }
  .small {
    height: 40px;
    font-size: 14px;
    border-radius: 8px;
  }
  .icon {
    height: 40px;
    padding: 8px 10px;
    border-radius: 12px;
  }
}
</style>

<style lang="scss">
.c-button-main {
  .q-btn--rounded {
    border-radius: 12px;
  }
  .q-btn {
    height: 52px;
    width: 100%;
    font-size: 16px;
    &::before {
      box-shadow: none;
    }
  }
  .q-btn.hug {
    width: fit-content;
  }
  .q-btn.disabled {
    opacity: 1 !important;
  }
  .q-btn-dropdown__arrow.q-btn-dropdown__arrow-container {
    display: none;
  }
}
.c-button-main.button-icon {
  .q-btn__content {
    .q-icon {
      color: v-bind(iconColor);
    }
  }
}
</style>
