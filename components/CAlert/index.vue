<template>
  <Teleport to="body">
    <Transition name="fade">
      <q-banner v-if="item.show" class="c-alert-container" :class="item.type || 'info'">
        <div class="c-alert-container__content">
          <q-icon
            class="c-alert-container__icon"
            :name="evaAlertCircleOutline"
            size="24px"
          ></q-icon>
          <div class="c-alert-container__text gg-t-big">{{ item.text }}</div>
        </div>
      </q-banner>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { evaAlertCircleOutline } from "@quasar/extras/eva-icons";

const item = ref(useState<Alert>("showAlert"));

function closeAlert() {
  item.value = {
    show: false,
    text: " ",
    type: "info",
  };
}
watch(item, () => {
  if (item.value.show) {
    setTimeout(() => {
      closeAlert();
    }, 5000);
  }
});
</script>
<style lang="scss" scoped>
.c-alert-container {
  z-index: 10000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}
.c-alert-container.error {
  background: var(--app-red-050);
  color: var(--app-red-500);
  .c-alert-container__icon {
    fill: var(--app-red-500);
  }
}
.c-alert-container.success {
  background: var(--app-green-050);
  color: var(--app-green-500);
  .c-alert-container__icon {
    fill: var(--app-green-500);
  }
}
.c-alert-container.info {
  background: var(--app-blue-050);
  color: var(--app-blue-500);
  .c-alert-container__icon {
    fill: var(--app-blue-500);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
