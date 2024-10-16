<script setup lang="ts">
import { mdiEyeOffOutline, mdiEyeOutline } from "@quasar/extras/mdi-v6";

interface Props {
  modelValue: string;
  rounded: boolean;
  outlined: boolean;
  label: string;
  type:
    | "number"
    | "password"
    | "search"
    | "textarea"
    | "time"
    | "text"
    | "email"
    | "tel"
    | "file"
    | "url"
    | "date"
    | "datetime-local"
    | undefined;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rounded: true,
  outlined: true,
  type: "password",
  label: "Логин",
});
const inputValue = ref(props.modelValue);
const showPassword = ref(false);
const currentType = ref(props.type);
function togglePassword() {
  showPassword.value = !showPassword.value;
  currentType.value = showPassword.value ? "text" : "password";
}
</script>

<template>
  <div class="kt-input-main">
    <q-input
      v-model="inputValue"
      :rounded="rounded"
      :outlined="outlined"
      :label="label"
      :type="currentType"
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
