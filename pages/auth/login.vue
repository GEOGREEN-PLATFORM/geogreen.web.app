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
    label: "Войти",
  },
  sub: {
    designType: "secondary",
    label: "У меня нет аккаунта",
  }
});

function handleMainButtonClick() {

}

function handleSubButtonClick() {
  goToRegister();
}
function goToRegister() {
  navigateTo({ path: '/auth/register' });
}
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm :button-options="buttonOptions" @main-button-click="handleMainButtonClick" @sub-button-click="handleSubButtonClick">
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