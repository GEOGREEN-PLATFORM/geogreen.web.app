<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
interface ButtonOptions {
  designType: "primary" | "secondary" | "tertiary"
  label: string
  loading?: boolean;
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
    label: "Войти",
    loading: false,
  },
  sub: {
    designType: "secondary",
    label: "У меня нет аккаунта",
  }
});
function sendLogin() {
  //запрос к апи
  buttonOptions.value.main.loading = true;
  setTimeout(() => goToMainPage(), 5000); 
}

function goToMainPage() {
  buttonOptions.value.main.loading = false;
  navigateTo({ path: '/' });
}
function goToRegister() {
  navigateTo({ path: '/auth/register' });
}
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm :button-options="buttonOptions" @main-button-click="sendLogin" @sub-button-click="goToRegister">
        <template #form-content>
          <div class="form-content">
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
  }
</style>