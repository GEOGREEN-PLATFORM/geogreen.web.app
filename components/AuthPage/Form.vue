<template>
  <q-form
    ref="formRef"
    novalidate
    greedy
    class="auth-form"
    @submit="checkFormValid"
  >
    <slot name="form-content" />
    <div class="auth-form__action-buttons">
      <GGButton
        v-if="buttonOptions.main.show !== false"
        :disabled="formHasError"
        :label="buttonOptions.main.label"
        :design-type="buttonOptions.main.designType"
        :loading="buttonOptions.main.loading"
        type="submit"
      />
      <GGButton
        v-if="buttonOptions.sub.show !== false"
        :label="buttonOptions.sub.label"
        :design-type="buttonOptions.sub.designType"
        @click="sendActionEvent('sub')"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
interface Props {
  buttonOptions: {
    main: ButtonOptions;
    sub: ButtonOptions;
  };
}

withDefaults(defineProps<Props>(), {
  buttonOptions: () => {
    return {
      main: {
        designType: "primary",
        label: "Отправить",
        loading: false,
      },
      sub: {
        designType: "secondary",
        label: "Отменить",
      },
    };
  },
});
const emits = defineEmits<{
  subButtonClick: [];
  mainButtonClick: [];
}>();

const { formRef, formBindValidation, formHasError } = useFormValidation();

function sendActionEvent(eventType: "sub" | "main") {
  eventType === "main" ? emits("mainButtonClick") : emits("subButtonClick");
}

function checkFormValid() {
  formRef.value?.validate().then((success) => {
    if (success) {
      sendActionEvent("main");
    }
  });
}

onMounted(() => {
  formBindValidation();
});
</script>

<style lang="scss" scoped>
.auth-form {
  width: 100%;
  &__action-buttons {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 16px;
    padding: 0px 16px;
  }
}
</style>
