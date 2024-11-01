<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
interface ButtonOptions {
  designType: "primary" | "secondary" | "tertiary"
  label: string
  loading?: boolean
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
    label: "Зарегистрироваться",
    loading: false,
  },
  sub: {
    designType: "secondary",
    label: "У меня есть аккаунт",
  }
});

function sendRegister() {
  //запрос к апи
  buttonOptions.value.main.loading = true;
  setTimeout(() => goToMainPage(), 5000); 
}

function goToMainPage() {
  buttonOptions.value.main.loading = false;
  navigateTo({ path: '/' });
}

function goToLogin() {
  navigateTo({ path: '/auth/login' });
}
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm :button-options="buttonOptions" @main-button-click="sendRegister" @sub-button-click="goToLogin">
        <template #form-content>
          <div class="form-content">
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
