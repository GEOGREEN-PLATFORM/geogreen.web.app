<template>
  <PagesAuthForm :button-options="buttonOptions" @main-button-click="sendLogin">
    <template #form-content>
      <h1 class="form-content__head gg-h1">Войти в аккаунт</h1>
      <div class="form-content">
        <div class="form-content__input-fields">
          <CInput
            v-model="userData.email"
            label="Почта"
            :rules="[validateEmail]"
            name="email"
            type="email"
          />
          <CInput
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
  </PagesAuthForm>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

definePageMeta({
  layout: "auth",
});

const store = useMainStore();
const { setAccessToken } = useFetchTokens();
const { validateEmail, validatePassword } = useRules();
const { saveUserEmail, getUserDataByEmail } = useCheckUser();
const userData = ref<UserAuthData>({
  email: "",
  password: "",
});
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
      saveUserEmail(userData.value.email);
      await getUserDataByEmail(userData.value.email);
      goToMainPage();
    } else {
      buttonOptions.value.main.loading = false;
    }
  } catch (error) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Возникла ошибка во время авторизации",
    };
    buttonOptions.value.main.loading = false;
  }
}

function goToMainPage() {
  navigateTo({ path: "/" });
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
