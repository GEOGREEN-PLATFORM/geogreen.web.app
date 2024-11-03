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
            <div class="form-content__input-fields">
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
            <div class="form-content__accept-rules-block text-center">
              <span class="form-content__info-text form-content__info-text--small">
                Регистрируясь, вы соглашаетесь<br>с&nbsp;<span style="text-decoration: underline;">правилами платформы</span>
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
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 24px;
    margin-top: 84px;
    margin-bottom: 24px;
    padding: 0px 16px;
    &__input-fields {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    &__otp-hint {
      font-weight: 400;
      line-height: 17.07px;
      text-align: center;
    }
    &__accept-rules-block {
    }
    &__info-text {
      font-weight: 400;
      font-style: italic;
      font-size: 16px;
      color: var(--app-blue-9);
      &--small {
        font-size: 12px;
      }
      &--error {
        color: var(--app-red-10);
        font-style: normal;
        font-weight: 500;
      }
    }
  }
</style>
