<template>
  <PagesAuthForm :button-options="buttonOptions" @main-button-click="sendRegister">
    <template #form-content>
      <div class="form-content">
        <h1 class="form-content__head gg-h1">Создать аккаунт</h1>
        <div class="form-content__input-fields">
          <div class="form-content__inline-block">
            <CInput v-model="userData.firstName" label="Имя" />
            <CInput v-model="userData.lastName" label="Фамилия" />
          </div>
          <CInput
            v-model="userData.email"
            label="Почта"
            :rules="[validateEmail]"
            type="email"
            name="email"
            autocomplete="new-email"
          />
          <CInput
            v-model="userData.password"
            label="Пароль"
            type="password"
            autocomplete="new-password"
            :rules="[validatePassword]"
            hint="От 8 до 20 символов"
          />
          <CInput
            v-model="userData.repeatedPassword"
            label="Подтвердите пароль"
            autocomplete="new-password"
            type="password"
            :rules="[validatePassword, (val) => val === userData.password || 'Пароли не совпадают']"
            hint="От 8 до 20 символов"
          />
        </div>
        <div class="form-content__accept-rules-block gg-cap text-center q-mt-lg">
          Продолжая, вы соглашаетесь с&nbsp;<a
            href="http://217.198.13.249:30099/docs/privacy"
            target="privacy"
            class="link-label"
            >политикой конфидецинальности</a
          >
        </div>
      </div>
    </template>
    <template #form-footer>
      <div class="form-footer">
        <div class="form-footer__have-account">
          Уже есть аккаунт? <NuxtLink to="/auth/login" class="action-label">Войти</NuxtLink>
        </div>
      </div>
    </template>
  </PagesAuthForm>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";
import type { UserRegisterData } from "~/types/interfaces/userAuth";
definePageMeta({
  layout: "auth",
});

const store = useMainStore();
const { setAccessToken } = useFetchTokens();
const { validateEmail, validatePassword } = useRules();
const { saveUserEmail } = useCheckUser();

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

async function sendRegister() {
  buttonOptions.value.main.loading = true;
  try {
    const user = await $fetch<User>(`${store.apiV1}/user/register/user`, {
      method: "POST",
      body: userData.value,
    });
    if (user) {
      store.user = {
        ...user,
        password: "",
      };
      if (
        await setAccessToken({
          email: user.email,
          password: userData.value.password,
        })
      ) {
        saveUserEmail(user.email);
        goToMainPage();
      }
    } else {
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: "Не удалось создать аккаунт",
      };
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
  margin-bottom: 24px;
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
}
</style>
