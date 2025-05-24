<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="toggleOpenState"
    @show="emits('show')"
    :auto-close="false"
    no-refocus
    backdrop-filter="blur(4px)"
    class="c-dialog"
    :class="{
      'c-dialog--confirm': props.type === 'confirm',
    }"
  >
    <q-card
      class="c-dialog__content-wrapper"
      :class="{ 'c-dialog__content-wrapper--full': props.fullContent }"
    >
      <div
        class="c-dialog__content-container"
        :style="{
          padding: props.fullContent ? '0px' : '',
        }"
      >
        <header class="c-dialog__header" v-if="props.title && !props.fullContent">
          <h2 class="c-dialog__title gg-h2">{{ props.title }}</h2>
          <slot name="subtitle">
            <p v-if="props.subTitle" class="c-dialog__subtitle">{{ props.subTitle }}</p></slot
          >
        </header>
        <div v-if="!props.fullContent" class="c-dialog__close-icon">
          <q-icon @click="toggleOpenState(false)" :name="mdiClose" size="32px"></q-icon>
        </div>
        <div class="c-dialog__content">
          <slot />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiClose } from "@quasar/extras/mdi-v6";

interface Props {
  modelValue: boolean;
  title?: string;
  subTitle?: string;
  fullContent?: boolean;
  type?: "default" | "confirm";
}
const props = withDefaults(defineProps<Props>(), {
  type: "default",
});
const emits = defineEmits<{
  "update:model-value": [boolean];
  show: [];
}>();
function toggleOpenState(newState: boolean) {
  emits("update:model-value", newState);
}
onMounted(() => {});
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.c-dialog {
  &__close-icon {
    position: absolute;
    z-index: 100;
    right: 12px;
    top: 12px;
    cursor: pointer;
  }
  &__content-wrapper {
    padding: 0;
    overflow: hidden !important;
    border-radius: 12px;
    max-width: 1200px;
    &--full {
      height: fit-content !important;
      width: fit-content !important;
      .c-dialog__content-container {
        height: fit-content !important;
        width: fit-content !important;
      }
      .c-dialog__content {
        height: fit-content !important;
        width: fit-content !important;
        display: flex;
      }
      border-radius: 12px !important;
    }
  }
  &__content-container {
    position: relative;
    overflow: auto;
    will-change: scroll-position;
    height: 100%;
    padding: 24px 32px;
    @media screen and (max-width: $app-mobile) {
      padding: 12px 24px;
    }
  }
  &__header {
    padding: 16px 0 20px;
  }
  &__title {
    margin: 0;
    text-wrap: balance;
  }
  &__subtitle {
    margin-top: 10px;
    font-size: 18px;
    color: var(--app-grey-300);
  }
  &:not(:has(.b-card__title)) {
    .b-card__subtitle {
      margin-top: 0px;
    }
    .b-card__header {
      padding-top: 0px;
    }
  }
  &--confirm {
    .c-dialog__content-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
<style lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

@media screen and (max-width: $app-narrow-mobile) {
  .c-dialog {
    .q-dialog__inner {
      padding-right: 0px;
      padding-left: 0px;
      width: 100dvw;
    }
    .c-dialog__content-wrapper {
      width: 100dvw;
      border-radius: 0px;
    }
  }
}
@media screen and (max-height: 550px) {
  .c-dialog {
    .q-dialog__inner {
      padding-top: 0px;
      padding-bottom: 0px;
    }
    .c-dialog__content-wrapper {
      height: 100dvh;
      border-radius: 0px;
      max-height: 100dvh !important;
    }
  }
}
</style>
