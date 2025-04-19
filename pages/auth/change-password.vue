<template>
  <PagesAuthForm
    :button-options="pageState.buttonOpts"
    @main-button-click="handleMainAction(pageState.step + 1)"
    @sub-button-click="handleSubAction(pageState.step - 1)"
  >
    <template #form-content>
      <div class="form-content">
        <h1 class="form-content__head gg-h1">Сменить пароль</h1>
        <div class="form-content__page-step-hint gg-t-base">
          <span>{{ pageState.hintText }}</span>
        </div>
        <div class="form-content__input-fields">
          <CInput
            v-if="pageState.step === 0"
            v-model="userData.email"
            label="Почта"
            type="email"
            name="email"
          />
          <CInputOTP
            v-if="pageState.step === 1"
            v-model:is-error="isWrongCode"
            v-model="userData.confirmationCode"
            @is-full="handleMainAction(pageState.step + 1)"
          />
          <CInput
            v-if="pageState.step === 2"
            v-model="userData.password"
            type="password"
            label="Новый пароль"
            autocomplete="new-password"
          />
          <CInput
            v-if="pageState.step === 2"
            v-model="userData.repeatedPassword"
            type="password"
            label="Повторите пароль"
            autocomplete="new-password"
          />
        </div>
      </div>
    </template>
    <template
      v-if="pageState.step === 1 && (isWrongCode || userData.confirmationCode.length < 4)"
      #main-button
    >
      <CButton design-type="secondary" :disabled="sendCodeTimer !== 0"
        ><div class="button-timer-slot">
          {{ `Отправить код ${sendCodeTimer !== 0 ? "через" : ""}` }}
          <span v-show="sendCodeTimer !== 0" class="button-timer-slot__time">
            {{ formattedSendTimer }}
          </span>
        </div>
      </CButton>
    </template>
  </PagesAuthForm>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

definePageMeta({
  layout: "auth",
});

const INITIAL_STEP = 0;
const CODE_SENDING_TIMEOUT = 59;

const store = useMainStore();
const defaultSubButton: ButtonOptions = {
  designType: "tertiary",
  label: "Назад",
  show: true,
};
const userData = ref({
  email: "",
  password: "",
  repeatedPassword: "",
  confirmationCode: "",
});
const codeSendingInterval = ref<NodeJS.Timeout>();
const sendCodeTimer = ref(CODE_SENDING_TIMEOUT);
const formattedSendTimer = computed(() => {
  return `00:${sendCodeTimer.value.toString().padStart(2, "0")}`;
});
const router = useRouter();
const isWrongCode = ref(false);
const stepConfig = reactive([
  {
    mainButton: { label: "Далее", show: true },
    hintText: "Введите почту, указанную в аккаунте",
  },
  {
    mainButton: { label: "Далее", show: true },
    hintText: "Введите код, отправленный на вашу почту",
  },
  {
    mainButton: { label: "Сменить пароль", show: true },
    hintText: "Придумайте новый пароль",
  },
]);
const pageState = reactive({
  step: INITIAL_STEP,
  hintText: stepConfig[INITIAL_STEP].hintText,
  buttonOpts: {
    main: { designType: "primary", ...stepConfig[INITIAL_STEP].mainButton },
    sub: defaultSubButton,
  } as { main: ButtonOptions; sub: ButtonOptions },
});

async function updatePageState(newStep: number) {
  if (newStep === 1) {
    pageState.buttonOpts.main.loading = true;
    await sendCodeToEmail();
    pageState.buttonOpts.main.loading = false;
  }
  pageState.step = newStep;
  if (newStep === 1) {
    codeSendingInterval.value = setInterval(() => {
      sendCodeTimer.value -= 1;
      if (sendCodeTimer.value === 0) {
        clearInterval(codeSendingInterval.value);
      }
    }, 1000);
  } else {
    sendCodeTimer.value = CODE_SENDING_TIMEOUT;
    clearInterval(codeSendingInterval.value);
  }
  const config = stepConfig[newStep] || stepConfig[INITIAL_STEP];
  pageState.buttonOpts = {
    main: { designType: "primary", ...config.mainButton },
    sub: defaultSubButton,
  };
  pageState.hintText = config.hintText;
}

function handleMainAction(pageStep: number) {
  if (pageStep <= 2) {
    updatePageState(pageStep);
  } else {
    sendChangePassword();
  }
}

function handleSubAction(pageStep: number) {
  if (pageStep >= 0) {
    updatePageState(pageStep);
  } else {
    goBack();
  }
}

function sendChangePassword() {
  // Логика отправки запроса на смену пароля
}
async function sendCodeToEmail() {
  await $fetch(
    `${store.apiAuth}/register/forgot-password/${userData.value.email}`,
    {
      headers: {
        Authorization: useGetToken(),
      },
      method: "POST",
    },
  );
}
function goBack() {
  router.back();
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/pages/auth.scss";
.form-content {
  &__page-step-hint {
    text-align: center;
    margin-bottom: 16px;
  }
}
.button-timer-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  &__time {
    text-align: left;
    width: 4.2ch;
    color: var(--app-blue-600);
  }
}
</style>
