<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const userData = ref<UserAuthData>({
  login: '',
  password: '',
  email: '',
})

const buttonOptions = ref<{ main: ButtonOptions, sub: ButtonOptions }>({
  main: {
    designType: 'primary',
    label: 'Зарегистрироваться',
    loading: false,
  },
  sub: {
    designType: 'secondary',
    label: 'У меня есть аккаунт',
  },
})

function sendRegister() {
  // запрос к апи
  buttonOptions.value.main.loading = true
  setTimeout(() => goToMainPage(), 5000)
}
const colorMode = useColorMode();
function goToMainPage() {
  buttonOptions.value.main.loading = false
  navigateTo({ path: '/' })
}

function goToLogin() {
  navigateTo({ path: '/auth/login' })
}
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm :button-options="buttonOptions" @main-button-click="sendRegister" @sub-button-click="goToLogin">
        <template #form-content>
          <div class="form-content">
            <div style="width: 40px; height: 40px; background-color: var(--app-black-10);" @click="() => {colorMode.preference == 'dark' ? colorMode.preference = 'light' : colorMode.preference = 'dark'; }"></div>
            <div class="form-content__input-fields">
              <KTInput
                v-model="userData.email!"
                label="Почта"
                type="email"
              />
              <KTInput v-model="userData.login" label="Логин" />
              <KTInput
                v-model="userData.password"
                label="Пароль"
                type="password"
              />
            </div>
            <div class="form-content__accept-rules-block text-center">
              <span class="form-content__info-text form-content__info-text--small">
                Регистрируясь, вы соглашаетесь<br />с&nbsp;<span style="text-decoration: underline;">правилами платформы</span>
              </span>
            </div>
          </div>
        </template>
      </AuthPageForm>
    </NuxtLayout>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/pages/auth.scss';
.form-content {
  gap: 24px;
  margin-top: 84px;
  margin-bottom: 24px;
  padding: 0px 16px;
}
</style>
