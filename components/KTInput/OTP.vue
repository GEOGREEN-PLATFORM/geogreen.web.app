<script setup lang="ts">
interface Props {
  digitCount?: number
  modelValue: string
  isError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  digitCount: 4,
  modelValue: '',
  isError: false,
})
const emits = defineEmits<{
  'update:modelValue': [string]
  'update:isError': [boolean]
  'isFull': []
}>()
const otpCont = ref<HTMLElement>()
const digits = reactive<string[]>([])
const lastInputKey = ref('')

function setValue() {
  if (props.modelValue && props.modelValue.length === props.digitCount) {
    for (let i = 0; i < props.digitCount; i++) {
      digits[i] = props.modelValue.charAt(i)
    }
  }
  else {
    for (let i = 0; i < props.digitCount; i++) {
      digits[i] = ''
    }
  }
}
setValue()

function isDigitsFull() {
  for (const elem of digits) {
    if (elem == null || elem == undefined || elem == '') {
      return false
    }
  }
  emits('update:modelValue', digits.join(''))
  emits('isFull')
  return true
}

function focusInput() {
  emits('update:isError', false)
}

function handleInput(event: Event, index: number) {
  const data = (event as InputEvent).data
  if (!data)
    return

  nextTick(() => {
    if (otpCont.value) {
      if (isDigit(data)) {
        digits[index] = data
        const child = otpCont.value.children[index + 1] as HTMLInputElement
        if (child && child.className !== 'otp-error-message') {
          child.focus()
        }
        else {
          (otpCont.value.children[index] as HTMLInputElement).blur()
        }
      }
      else {
        digits[index] = ''
      }
    }
  })
}

function handlePaste(event: ClipboardEvent, index: number) {
  const pastedData = event.clipboardData
    ?.getData('text')
    .slice(0, props.digitCount - index)
  if (!pastedData)
    return
  nextTick(() => {
    let pastedCharInd = 0
    for (pastedCharInd; pastedCharInd < pastedData.length; pastedCharInd++) {
      if (isDigit(pastedData[pastedCharInd])) {
        digits[index + pastedCharInd] = pastedData[pastedCharInd]
      }
      else {
        digits[index + pastedCharInd] = ''
      }
    }
    if (
      index + pastedCharInd < props.digitCount
      && digits[index + pastedCharInd] === ''
    ) {
      (
        otpCont.value?.children[index + pastedCharInd] as HTMLInputElement
      ).focus()
    }
    else {
      (otpCont.value?.children[index] as HTMLInputElement).blur()
    }
  })
}

function handleKey(event: KeyboardEvent, index: number) {
  const eventKey = event.key
  lastInputKey.value = eventKey
  if (['Tab', 'Shift', 'Meta', 'Control', 'Alt'].includes(eventKey)) {
    return
  }
  if (eventKey === 'Backspace' && otpCont.value) {
    if (
      !(otpCont.value.children[index] as HTMLInputElement).value
      && index > 0
    ) {
      (otpCont.value.children[index - 1] as HTMLInputElement).focus()
    }
  }
  if (isPressedDeletingKey()) {
    digits[index] = ''
  }
}

function checkIphone(): boolean {
  const userAgent: string = navigator.userAgent
  if (/iPhone/i.test(userAgent)) {
    return true
  }
  else {
    return false
  }
}

function isDigit(value: string) {
  return new RegExp('^(\\d)$').test(value)
}

function isPressedDeletingKey() {
  return lastInputKey.value == 'Backspace' || lastInputKey.value == 'Delete'
}

onMounted(() => {
  if (!checkIphone() && otpCont.value && otpCont.value.children.length > 0) {
    (otpCont.value.children[0] as HTMLInputElement).focus()
  }
})
watch(
  () => props.modelValue,
  () => {
    setValue()
  },
)
</script>

<template>
  <div ref="otpCont" class="otp-container">
    <input
      v-for="(el, ind) in digits"
      :key="ind"
      v-model="digits[ind]"
      inputmode="numeric"
      pattern="[0-9]*"
      type="text"
      class="otp-box"
      :class="{ error: isError }"
      autocomplete="one-time-code"
      @focus="focusInput"
      @blur="isDigitsFull()"
      @input="handleInput($event, ind)"
      @paste.prevent="handlePaste($event, ind)"
      @keydown="handleKey($event, ind)"
    />
    <div v-if="isError" class="otp-error-message">
      Неверный код, попробуйте еще
    </div>
  </div>
</template>

  <style scoped lang="scss">
  .otp-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 34px;
    position: relative;
    gap: 10px;
    .otp-error-message {
      position: absolute;
      bottom: 0px;
      left: 50%;
      width: 100%;
      text-align: center;
      transform: translate(-50%, 0);
      color: var(--app-red-10);
      font-size: 16px;
      font-weight: 500;
    }
  }
  .otp-box {
    outline: none;
    appearance: none;
    border: 1px solid var(--app-black-8);
    background-color: transparent;
    width: 54px;
    height: 54px;
    color: var(--app-black);
    text-align: center;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 20px;
  }
  .error {
    border: 1px solid var(--app-red-10);
  }

  .otp-box:focus {
    border: 1px solid var(--app-blue-9);
  }

  .bounce {
    animation: pulse 0.3s ease-in-out alternate;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }

    100% {
      transform: scale(1.1);
    }
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 60px #fafafa inset !important;
    background-color: #fafafa !important;
    background-clip: content-box !important;
  }
  </style>
