<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
interface ButtonOptions {
  designType: "primary" | "secondary";
  label: string;
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

function handleMainButtonClick(regStep: number) {
  switch (regStep) {
    case (1):
      goToNextRegStep();
      updateButtonOptions(regStep);
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
function goToNextRegStep() {
  registrationStep.value++;
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
          <div v-else>
            <div>Введите код подтверждения, 
              отправленный вам на почту</div>
            <KTInputOTP></KTInputOTP>
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
  }
</style>
