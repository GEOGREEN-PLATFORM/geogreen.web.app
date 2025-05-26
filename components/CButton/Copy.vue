<template>
  <div
    class="copy-button"
    @mouseenter="onCopyMouseEnter"
    @mouseleave="onCopyMouseLeave"
    @click="copyText"
  >
    <q-icon
      :class="{ 'pop-animation': isAnimating }"
      :name="mdiContentCopy"
      size="32px"
      class="copy-button__icon"
    />
    <span :style="`opacity: ${Number(showTooltip)}`" class="copy-button__tooltip">{{
      tooltipText
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { mdiContentCopy } from "@quasar/extras/mdi-v6";
import { defineEmits, defineProps, ref } from "vue";

interface Props {
  text: string;
  tooltipInitialText?: string;
  tooltipSuccessText?: string;
  animationDuration?: number;
  resetDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  tooltipInitialText: "Скопировать",
  tooltipSuccessText: "Скопировано",
  animationDuration: 1000,
  resetDelay: 300,
});

const emit = defineEmits(["copy-success"]);

const tooltipText = ref(props.tooltipInitialText);
const showTooltip = ref(false);
const isAnimating = ref(false);

function onCopyMouseEnter() {
  showTooltip.value = true;
}

function onCopyMouseLeave() {
  showTooltip.value = false;
}

async function copyText() {
  const performSuccess = () => {
    tooltipText.value = props.tooltipSuccessText;
    showTooltip.value = true;
    isAnimating.value = true;
    emit("copy-success");
    setTimeout(() => {
      isAnimating.value = false;
      showTooltip.value = false;
      setTimeout(() => {
        tooltipText.value = props.tooltipInitialText;
      }, props.resetDelay);
    }, props.animationDuration);
  };

  const performFailure = () => {
    tooltipText.value = "Ошибка при копировании";
    showTooltip.value = true;
    isAnimating.value = true;
    setTimeout(() => {
      isAnimating.value = false;
      showTooltip.value = false;
      setTimeout(() => {
        tooltipText.value = props.tooltipInitialText;
      }, props.resetDelay);
    }, props.animationDuration);
  };

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(props.text);
      performSuccess();
    } catch (err) {
      console.error("Clipboard API error:", err);
      performFailure();
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: "Не удалось скопировать текст",
      };
    }
    return;
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = props.text;
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (successful) {
      performSuccess();
    } else {
      throw new Error("execCommand returned false");
    }
  } catch (err) {
    console.error("Fallback copy error:", err);
    performFailure();
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось скопировать текст",
    };
  }
}
</script>

<style scoped lang="scss">
$app-mobile: 600px;

.copy-button {
  position: relative;
  cursor: pointer;

  &:hover {
    .copy-button__icon {
      transform: scale(1.1);
    }

    .copy-button__tooltip {
      opacity: 1;
      transform: translateX(-50%) translateY(0);

      @media screen and (max-width: $app-mobile) {
        transform: translateX(-100%) translateY(0);
      }
    }
  }

  &__icon {
    transition: transform 0.2s;
  }

  &__tooltip {
    position: absolute;
    pointer-events: none;
    bottom: -32px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
    background-color: var(--app-grey-300);
    color: var(--app-white);
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    @media screen and (max-width: $app-mobile) {
      left: 100%;
      transform: translateX(-100%) translateY(10px);
    }
  }
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.pop-animation {
  animation: pop 0.5s ease;
}
</style>
