<template>
  <AuthPageForm
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
          <KTInput
            v-if="pageState.step === 0"
            v-model="userData.email"
            label="Почта"
          />
          <KTInputOTP
            v-if="pageState.step === 1"
            v-model:is-error="isWrongCode"
            v-model="userData.confirmationCode"
            @is-full="handleMainAction(pageState.step + 1)"
          />
          <KTInput
            v-if="pageState.step === 2"
            v-model="userData.password"
            type="password"
            label="Новый пароль"
          />
          <KTInput
            v-if="pageState.step === 2"
            v-model="userData.repeatedPassword"
            type="password"
            label="Повторите пароль"
          />
        </div>
      </div>
    </template>
  </AuthPageForm>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const INITIAL_STEP = 0;
const defaultSubButton: ButtonOptions = {
  designType: "tertiary",
  label: "Назад",
  show: true,
};
const isWrongCode = ref(false);
const stepConfig = [
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
];
const pageState = reactive({
  step: INITIAL_STEP,
  hintText: stepConfig[INITIAL_STEP].hintText,
  buttonOpts: {
    main: { designType: "primary", ...stepConfig[INITIAL_STEP].mainButton },
    sub: defaultSubButton,
  } as { main: ButtonOptions; sub: ButtonOptions },
});

function updatePageState(newStep: number) {
  pageState.step = newStep;
  const config = stepConfig[newStep] || stepConfig[INITIAL_STEP];
  pageState.buttonOpts = {
    main: { designType: "primary", ...config.mainButton },
    sub: defaultSubButton,
  };
  pageState.hintText = config.hintText;
}

const userData = ref({
  email: "",
  password: "",
  repeatedPassword: "",
  confirmationCode: "",
});
const router = useRouter();

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
</style>
