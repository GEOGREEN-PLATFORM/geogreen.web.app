<script setup lang="ts">
import type { ValidationRule } from 'quasar'
import { mdiEyeOffOutline, mdiEyeOutline } from '@quasar/extras/mdi-v6'

interface Props {
  modelValue: string
  rounded?: boolean
  outlined?: boolean
  label: string
  type?:
    | 'number'
    | 'password'
    | 'search'
    | 'textarea'
    | 'time'
    | 'text'
    | 'email'
    | 'tel'
    | 'file'
    | 'url'
    | 'date'
    | 'datetime-local'
    | undefined
  required?: boolean
  rules?: ValidationRule[]
  hideBottomSpace?: boolean
  hideErrorIcon?: boolean
  placeholder?: string
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rounded: true,
  outlined: true,
  required: true,
  rules: () => [val => (val && val.length > 0) || 'Поле не может быть пустым'],
  type: 'text',
  label: 'Метка',
  placeholder: 'Введите текст',
  hideErrorIcon: true,
  hideBottomSpace: true,
})

const emits = defineEmits<{
  'update:modelValue': [string | number | null]
}>();

const inputValue = ref(props.modelValue)
const showPassword = ref(false)
const currentType = ref(props.type)
const qInputRef = ref()

function updateValue(value: string | number | null) {
  qInputRef.value?.validate();
  emits("update:modelValue", value);
}

function togglePassword() {
  showPassword.value = !showPassword.value
  currentType.value = showPassword.value ? 'text' : 'password'
}
</script>

<template>
  <div class="kt-input-main">
    <q-input
      ref="qInputRef"
      v-model="inputValue"
      :rounded="rounded"
      :outlined="outlined"
      :label="label"
      :type="currentType"
      :rules="rules"
      lazy-rules
      :no-error-icon="hideErrorIcon"
      :hide-bottom-space="hideBottomSpace"
      :placeholder="placeholder"
      @update:model-value="updateValue"
    >
      <template #append>
        <q-icon
          v-if="type === 'password'"
          :name="showPassword ? mdiEyeOutline : mdiEyeOffOutline"
          class="cursor-pointer"
          @click="togglePassword"
        />
      </template>
    </q-input>
  </div>
</template>

<style scoped lang="scss"></style>
