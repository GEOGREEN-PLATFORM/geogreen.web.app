<script setup lang="ts">
interface ButtonOptions {
  designType: "primary" | "secondary" | "tertiary";
  label: string;
}
interface Props {
  buttonOptions: {
    main: ButtonOptions,
    sub: ButtonOptions,
  }
}
const props = withDefaults(defineProps<Props>(), {
  buttonOptions: () => { return {
    main: {
      designType: "primary",
      label: "Отправить",
    },
    sub: {
      designType: "secondary",
      label: "Отменить",
    }
  } }
})
const emits = defineEmits<{
  "subButtonClick": [],
  "mainButtonClick": [],
}>();

const { formRef, formBindValidation, formIsDirty, formHasError, formReset }
  = useFormValidation()

function sendActionEvent(eventType: "sub" | "main") {
  eventType === 'main' ? emits("mainButtonClick") : emits("subButtonClick");
}

function checkFormValid() {
  formRef.value
    ?.validate()
    .then((success) => {
      if (success) {
        sendActionEvent("main");
      }
      else {
        console.log('failed')
      }
    })
}

onMounted(() => {
  formBindValidation()
})
</script>

<template>
  <q-form ref="formRef" greedy class="auth-form" @submit="checkFormValid">
    <slot name="form-content" />
    <div class="auth-form__action-buttons">
      <KTButton
        :disabled="formHasError"
        :label="buttonOptions.main.label"
        :design-type="buttonOptions.main.designType"
        type="submit"
      />
      <KTButton
        :label="buttonOptions.sub.label"
        :design-type="buttonOptions.sub.designType"
        @click="sendActionEvent('sub')"
      />
    </div>
  </q-form>
</template>

<style scoped lang="scss">
.auth-form {
  width: 100%;
  &__action-buttons {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    padding: 0px 16px;
  }
}
</style>
