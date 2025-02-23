<template>
  <AuthPageForm
    :button-options="buttonOptions"
    @main-button-click="sendRegister"
  >
    <template #form-content>
      <div class="form-content">
        <h1 class="form-content__head gg-h1">Создать аккаунт</h1>
        <div class="form-content__input-fields">
          <div class="form-content__inline-block">
            <KTInput v-model="userData.firstName" label="Имя" />
            <KTInput v-model="userData.lastName" label="Фамилия" />
          </div>
          <KTInput v-model="userData.email" label="Почта" type="email" autocomplete="new-email"/>
          <KTInput v-model="userData.password" label="Пароль" type="password" autocomplete="new-password"/>
          <KTInput v-model="userData.repeatedPassword" label="Подтвердите пароль" autocomplete="new-password" type="password"/>
        </div>
      </div>
    </template>
    <template #form-footer>
      <div class="form-footer">
        <div class="form-footer__have-account">Уже есть аккаунт? <NuxtLink to="/auth/login" class="action-label">Войти</NuxtLink></div>
        <div class="form-footer__accept-rules-block gg-cap">
          Продолжая, вы соглашаетесь 
          с <span class="link-label">условиями использования</span> 
          и&nbsp;<span class="link-label">политикой конфидецинальности</span>
        </div>
      </div>
    </template>
  </AuthPageForm>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const userData = ref<UserRegisterData>({
  password: "",
  repeatedPassword: "",
  firstName: "",
  lastName: "",
  email: "",
});

const buttonOptions = ref<{ main: ButtonOptions; sub: ButtonOptions }>({
  main: {
    designType: "primary",
    label: "Зарегистрироваться",
    loading: false,
  },
  sub: {
    show: false,
  },
});

function sendRegister() {
  // запрос к апи
  buttonOptions.value.main.loading = true;
  setTimeout(() => goToMainPage(), 5000);
}

function goToMainPage() {
  buttonOptions.value.main.loading = false;
  navigateTo({ path: "/" });
}
</script>

<style lang="scss" scoped>
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

@use "@/assets/styles/pages/auth.scss";
.form-content {
  &__inline-block {
    display: flex;
    min-width: 100%;
    gap: 24px;
    @media screen and (max-width: $app-mobile) {
      flex-direction: column;
      gap: 8px;
    }
  }
}
.form-footer {
  &__have-account {
    text-align: center;
  }
  &__accept-rules-block {
    text-align: center;
  }
}
</style>
