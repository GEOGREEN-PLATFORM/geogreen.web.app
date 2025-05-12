<template>
  <div
    :class="['notification-button', { subscribed: props.subscribed }]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click.stop="toggleSubscribe"
  >
    <div :class="['icon-wrapper', { 'hover-animation': hover }]">
      <q-icon
        :name="mdiBellOutline"
        size="32px"
        class="notification-button__icon outline-icon"
        :class="{
          'click-animation': loading || clickAnimating,
          visible: !props.subscribed,
        }"
      />
      <q-icon
        :name="mdiBellRing"
        size="32px"
        class="notification-button__icon ring-icon"
        :class="{
          'click-animation': loading || clickAnimating,
          visible: props.subscribed,
        }"
      />
    </div>
    <span class="notification-button__tooltip" :class="{ show: showTooltip }">
      {{ props.subscribed ? tooltipUnsubText : tooltipSubText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { mdiBellOutline, mdiBellRing } from "@quasar/extras/mdi-v6";
import { defineEmits, defineProps, ref, watch, withDefaults } from "vue";

interface Props {
  subscribed: boolean;
  tooltipSubText?: string;
  tooltipUnsubText?: string;
  animationDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  tooltipSubText: "Подписаться",
  tooltipUnsubText: "Отписаться",
  animationDuration: 600,
});

const emit = defineEmits<{
  (e: "subscribe"): void;
  (e: "unsubscribe"): void;
}>();

const hover = ref(false);
const loading = ref(false);
const clickAnimating = ref(false);
const showTooltip = ref(false);

function onMouseEnter() {
  hover.value = true;
  showTooltip.value = true;
}

function onMouseLeave() {
  hover.value = false;
  showTooltip.value = false;
}

function toggleSubscribe() {
  loading.value = true;
  clickAnimating.value = true;
  if (!props.subscribed) {
    emit("subscribe");
  } else {
    emit("unsubscribe");
  }

  setTimeout(() => {
    clickAnimating.value = false;
  }, props.animationDuration);
}
watch(
  () => props.subscribed,
  () => {
    loading.value = false;
  },
);
</script>

<style scoped lang="scss">
$hover-scale: 1.1;

.notification-button {
  position: relative;
  padding: 4px;
  cursor: pointer;

  &.subscribed {
    .ring-icon {
      color: var(--app-primary);
    }
  }

  .icon-wrapper {
    position: relative;
    width: 32px;
    height: 32px;
    transition: transform 0.2s;
  }

  .hover-animation {
    transform: scale($hover-scale);
  }

  .notification-button__icon {
    position: absolute;
    top: 0;
    left: 0;
    transition:
      opacity 0.3s ease,
      transform 0.2s;
    opacity: 0;
    transform-origin: top center;
  }

  .notification-button__icon.visible {
    opacity: 1;
  }

  .notification-button__icon.click-animation {
    animation: swing 0.6s ease-out infinite;
  }

  &__tooltip {
    position: absolute;
    bottom: -36px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background-color: var(--app-grey-300);
    color: var(--app-white);
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    z-index: 1000;
    pointer-events: none;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    &.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
}

@keyframes swing {
  0% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(15deg);
  }
  30% {
    transform: rotate(-10deg);
  }
  45% {
    transform: rotate(8deg);
  }
  60% {
    transform: rotate(-6deg);
  }
  75% {
    transform: rotate(4deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
