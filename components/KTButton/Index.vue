<script setup lang="ts">
interface Props {
  label: string
  designType: 'primary' | 'secondary'
  disabled?: boolean
  type?: 'submit'
}
const props = withDefaults(defineProps<Props>(), {
  label: 'Зарегистрироваться',
  rounded: true,
  designType: 'primary',
  disabled: false,
})
const buttonDesignTypeSettings = ref({
  outline: false,
  rounded: true,
})

onMounted(() => {
  buttonDesignTypeSettings.value.outline = props.designType === 'secondary'
})
</script>

<template>
  <div class="kt-button-main">
    <q-btn
      :class="{
        [designType]: true,
        disabled,
      }"
      no-caps
      :label="label"
      :rounded="buttonDesignTypeSettings.rounded"
      :outline="buttonDesignTypeSettings.outline"
      :disable="disabled"
      :type="type"
    />
  </div>
</template>

<style scoped lang="scss">
.kt-button-main {
  .primary {
    background: var(--app-blue-9);
    color: var(--app-white-1);
  }
  .secondary {
    color: var(--app-blue-9);
  }
  .primary.disabled {
    background: var(--app-black-5);
  }
  .secondary.disabled {
    color: var(--app-black-6);
  }
}
</style>
