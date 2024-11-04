<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const userData = ref<UserAuthData>({
  login: '',
  password: '',
})
const showAuthError = ref(false)
const buttonOptions = ref<{ main: ButtonOptions, sub: ButtonOptions }>({
  main: {
    designType: 'primary',
    label: 'Войти',
    loading: false,
  },
  sub: {
    designType: 'secondary',
    label: 'У меня нет аккаунта',
  },
})

function sendLogin() {
  // запрос к апи
  buttonOptions.value.main.loading = true
  setTimeout(() => goToMainPage(), 5000)
}

function goToMainPage() {
  buttonOptions.value.main.loading = false
  showAuthError.value = true
  // navigateTo({ path: '/' });
}

function goToRegister() {
  navigateTo({ path: '/auth/register' })
}
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm :button-options="buttonOptions" @main-button-click="sendLogin" @sub-button-click="goToRegister">
        <template #form-content>
          <div class="form-content">
            <div v-show="showAuthError" class="form-content__auth-error-block text-center">
              <span class="form-content__info-text form-content__info-text--error">
                Логин или пароль введены неверно
              </span>
            </div>
            <div class="form-content__input-fields">
              <KTInput v-model="userData.login" label="Логин" />
              <KTInput
                v-model="userData.password"
                label="Пароль"
                type="password"
              />
            </div>
            <div class="form-content__forgot-password-block text-right">
              <span class="form-content__info-text">
                <NuxtLink to="/auth/change-password">Забыли пароль?</NuxtLink>
              </span>
            </div>
          </div>
        </template>
      </AuthPageForm>
    </NuxtLayout>
  </div>
</template>

<style lang="scss" scoped>
  .form-content {
    margin-top: 84px;
    margin-bottom: 56px;
    padding: 0px 16px;
    gap: 8px;
  }
</style>
