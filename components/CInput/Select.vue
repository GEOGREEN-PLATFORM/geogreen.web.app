<template>
  <div
    class="c-input-select"
    :class="{
      required: required,
    }"
  >
    <q-select
      :model-value="modelValue"
      @update:model-value="selectValue"
      :options="props.options"
      :outlined="outlined"
      :label="label"
      ref="qInputRef"
      :rounded="rounded"
      :rules="validationRules"
      :no-error-icon="hideErrorIcon"
      :hide-bottom-space="hideBottomSpace"
      :placeholder="placeholder"
      :name="name"
      :option-value="optionValue"
      :option-label="optionLabel"
      :disable="disabled"
      :hint="hint"
      :use-input="useInput"
      input-debounce="300"
      @filter="filterList"
      :emit-value="!returnObj"
      :map-options="!returnObj"
      clearable
      :popup-content-style="listStyles"
      @popup-show="updateListWidth"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import type { QSelect, ValidationRule } from "quasar";

interface Props {
  modelValue: string | ItemOption | null;
  rounded?: boolean;
  outlined?: boolean;
  label?: string;
  required?: boolean;
  rules?: ValidationRule[];
  hideBottomSpace?: boolean;
  hideErrorIcon?: boolean;
  placeholder?: string;
  name?: string;
  options: ItemOption[];
  height?: string;
  optionValue?: string;
  optionLabel?: string;
  hint?: string;
  disabled?: boolean;
  useInput?: boolean;
  returnObj?: boolean;
  readonly?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rounded: true,
  outlined: true,
  required: true,
  disabled: false,
  rules: () => [],
  placeholder: "",
  hideErrorIcon: true,
  hideBottomSpace: false,
  height: "56px",
  optionValue: "value",
  optionLabel: "name",
  useInput: false,
});
const emits = defineEmits<{
  "update:modelValue": [string];
  filter: [string];
}>();
const validationRules = ref<ValidationRule[]>([]);
const qInputRef = ref();
function selectValue(value: string) {
  emits("update:modelValue", value);
}
function filterList(
  val: string,
  update: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
) {
  update(() => {
    emits("filter", val);
  });
}
const listStyles = ref({});
async function updateListWidth() {
  await nextTick();
  const el = qInputRef.value?.$el as HTMLElement;
  if (el) {
    const control = el.querySelector<HTMLElement>(".q-field__control");
    if (control) {
      const w = control.getBoundingClientRect().width;
      listStyles.value = { width: `${w}px` };
    }
  }
}
onMounted(() => {
  if (props.required) {
    validationRules.value = [(val) => !!val || "Не может быть пустым"];
  } else {
    validationRules.value = props.rules;
  }
});
</script>

<style lang="scss">
.c-input-select {
  width: 100%;
  .q-field--outlined.q-field--rounded .q-field__control {
    border-radius: 16px;
  }
  .q-field--outlined .q-field__control:before {
    border: 1px solid var(--app-grey-300);
  }
  .q-field--outlined .q-field__control:after {
    border: 1px solid transparent;
  }
  .q-field--outlined .q-field__control:hover:after {
    border-color: var(--app-green-300);
    border-width: 1px;
  }
  .q-field--outlined .q-field__control:hover:before {
    border: 1px solid transparent;
  }
  .q-field--outlined.q-field--highlighted .q-field__control:after {
    border-color: var(--app-green-500);
    border-width: 1px;
  }
  .q-field--outlined.q-field--highlighted .q-field__control:before {
    border: 1px solid transparent;
  }
  .q-field--outlined.q-field--highlighted.q-field--error .q-field__control:after {
    border-color: var(--app-red-500);
  }
  .q-field--outlined.q-field--highlighted.q-field--error .q-field__control:before {
    border-color: transparent;
  }
  .q-field--outlined.q-field--highlighted.q-field--error {
    .q-field__label {
      color: var(--input-label);
    }
  }
  .q-field--outlined.q-field--highlighted.q-field--focused {
    .q-field__label {
      color: var(--app-green-500);
    }
  }
  .q-field__label {
    top: 50%;
    transform: translateY(-50%) scale(1);
    color: var(--input-label);
    will-change: transform;
    transition:
      transform 0.36s cubic-bezier(0.4, 0, 0.2, 1),
      max-width 0.324s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.3s ease;
  }
  .q-field--highlighted .q-field__label {
    color: currentColor;
  }
  .q-field--float .q-field__label {
    transform: translateY(-100%) scale(0.85);
  }
  .q-field__native:-webkit-autofill + .q-field__label,
  .q-field__input:-webkit-autofill + .q-field__label {
    transform: translateY(-100%) scale(0.85);
  }
  .q-field__native,
  .q-field__input {
    color: var(--app-grey-500);
    caret-color: var(--app-green-500);
    flex-wrap: nowrap;
  }
  .q-field--labeled .q-field__native {
    line-height: 20px;
  }
  .q-field__control {
    height: v-bind(height);
    min-height: v-bind(height);
  }
  .q-field__marginal {
    height: v-bind(height);
    min-height: v-bind(height);
  }
  &:not(:has(.q-field--labeled)) {
    .q-field__native {
      height: v-bind(height);
      min-height: v-bind(height);
    }
  }
  input[type="password"]:not(:placeholder-shown) {
    font-family: Verdana;
    letter-spacing: 0.1em;
    color: var(--input-label);
  }
  input {
    font-size: 16px;
  }
  &:not(:has(.q-field--labeled)) .q-textarea .q-field__native {
    padding: 16px 0px;
  }
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    background-clip: text !important;
    -webkit-text-fill-color: var(--app-grey-500);
    box-shadow: inset 0 0 20px 20px transparent;
  }
}
.c-input-select.required {
  .q-field__label {
    &::after {
      content: "*";
      color: var(--app-red-500);
    }
  }
}
.q-menu {
  max-height: 400px;
}
</style>
