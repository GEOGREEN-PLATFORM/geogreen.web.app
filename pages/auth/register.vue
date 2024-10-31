<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
interface ButtonOptions {
  designType: "primary" | "secondary" | "tertiary"
  label: string
}
interface UserData {
  login: string
  password: string
  email: string
}
const userData = ref<UserData>({
  login: '',
  password: '',
  email: '',
})
const buttonOptions = ref<{main: ButtonOptions, sub: ButtonOptions}>({
  main: {
    designType: "primary",
    label: "Далее",
  },
  sub: {
    designType: "secondary",
    label: "У меня есть аккаунт",
  }
});
const registrationStep = ref(1);
const isWrongCode = ref(false);
const authCode = ref("");

function handleMainButtonClick(regStep: number) {
  switch (regStep) {
    case (1):
      goToNextRegStep();
      updateButtonOptions(regStep + 1);
      break;
    default:
      break;
  }
}

function handleSubButtonClick(regStep: number) {
  switch (regStep) {
    case (1):
      goToLogin();
      break;
    case (2):
      goToPrevRegStep();
      updateButtonOptions(regStep - 1);
      break;
    default:
      break;
  }
}
function updateButtonOptions(regStep: number) {
  if (regStep === 1) {
    buttonOptions.value = {
      main: {
    designType: "primary",
    label: "Далее",
  },
  sub: {
    designType: "secondary",
    label: "У меня есть аккаунт",
  }
    }
  }
  else {
    buttonOptions.value = {
      main: {
    designType: "primary",
    label: "Зарегистрироваться",
  },
  sub: {
    designType: "tertiary",
    label: "Назад",
  }
    }
  }
}
function sendAuthCode() {
  isWrongCode.value = true;
}
function goToNextRegStep() {
  registrationStep.value++;
}
function goToPrevRegStep() {
  registrationStep.value--;
}
function goToLogin() {
  navigateTo({ path: '/auth/login' });
}
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm :button-options="buttonOptions" @main-button-click="handleMainButtonClick(registrationStep)" @sub-button-click="handleSubButtonClick(registrationStep)">
        <template #form-content>
          <div class="form-content" v-if="registrationStep === 1">
            <KTInput
              v-model="userData.email"
              label="Почта"
            />
            <KTInput v-model="userData.login" label="Логин" />
            <KTInput
              v-model="userData.password"
              label="Пароль"
              type="password"
            />
          </div>
          <div class="form-content" v-else>
            <div class="form-content__otp-hint">Введите код подтверждения, 
              отправленный вам на почту</div>
            <KTInputOTP v-model="authCode" :is-error="isWrongCode" @is-full="sendAuthCode"></KTInputOTP>
          </div>
        </template>
      </AuthPageForm>
    </NuxtLayout>
  </div>
</template>

<style lang="scss" scoped>
  .form-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    margin-top: 84px;
    margin-bottom: 56px;
    padding: 0px 16px;

    &__otp-hint {
      font-weight: 400;
      line-height: 17.07px;
      text-align: center;

    }
  }
</style>
