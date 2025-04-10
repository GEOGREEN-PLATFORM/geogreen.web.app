<template>
  <AuthPageForm :button-options="buttonOptions" @main-button-click="sendLogin">
    <template #form-content>
      <h1 class="form-content__head gg-h1">Войти в аккаунт</h1>
      <div class="form-content">
        <div class="form-content__input-fields">
          <KTInput
            v-model="userData.email"
            label="Почта"
            :rules="[validateEmail]"
            name="email"
            type="email"
          />
          <KTInput
            v-model="userData.password"
            label="Пароль"
            :rules="[validatePassword]"
            type="password"
            name="password"
          />
        </div>
        <div class="form-content__forgot-password-block text-right">
          <span class="action-label">
            <NuxtLink to="/auth/change-password">Забыли пароль?</NuxtLink>
          </span>
        </div>
      </div>
    </template>
    <template #form-footer>
      <div class="form-footer">
        <div class="form-footer__no-account">
          Еще нет аккаунта?
          <NuxtLink to="/auth/register" class="action-label">Зарегистрироваться </NuxtLink>
        </div>
      </div>
    </template>
  </AuthPageForm>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

definePageMeta({
  layout: "auth",
});

const store = useMainStore();
const { setAccessToken } = useFetchTokens();
const { validateEmail, validatePassword } = useRules();
const userData = ref<UserAuthData>({
  email: "",
  password: "",
});
const showAuthError = ref(false);
const buttonOptions = ref<{ main: ButtonOptions; sub: ButtonOptions }>({
  main: {
    designType: "primary",
    label: "Войти",
    loading: false,
  },
  sub: {
    show: false,
  },
});

async function sendLogin() {
  buttonOptions.value.main.loading = true;
  try {
    if (await setAccessToken(userData.value)) {
      store.user = {
        id: "48e3a907-7c44-4607-99d9-88bfbf60c830",
        firstName: "rjn",
        lastName: "333",
        patronymic: null,
        email: "kot2@mail.ru",
        number: null,
        birthdate: null,
        image: null,
        role: "user",
        enabled: true,
        creationDate: "2025-04-10 21:35:29",
      };
      goToMainPage();
    }
  } catch (error) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Произошла непредвиденная ошибка",
    };
  } finally {
    buttonOptions.value.main.loading = false;
  }
}

function goToMainPage() {
  buttonOptions.value.main.loading = false;
  showAuthError.value = true;
  // navigateTo({ path: '/' });
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/pages/auth.scss";
.form-content {
  position: relative;
  margin-bottom: 40px;
  &__forgot-password-block {
    position: absolute;
    bottom: -12px;
    right: 0;
  }
}
.form-footer {
  &__no-account {
    text-align: center;
  }
}
</style>
