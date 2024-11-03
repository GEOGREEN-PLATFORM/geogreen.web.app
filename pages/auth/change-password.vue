<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
interface ButtonOptions {
  designType: "primary" | "secondary" | "tertiary"
  label: string
  loading?: boolean;
  show?: boolean
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
const router = useRouter();
const currentPageStep = ref(1);
const showAuthError = ref(false);
const pageStateByStep = ref<{
  buttonOptions: {main: ButtonOptions, sub: ButtonOptions}
  hintText: string
}>({
  buttonOptions: {
    main: {
    designType: "primary",
    label: "Далее",
    show: true,
  },
  sub: {
    designType: "tertiary",
    label: "Назад",
    show: true,
  }
  },
  hintText: "Введите почту, указанную в аккаунте",
});


function handleMainButtonClick(pageStep: number) {
  updatePageState(pageStep + 1);
}

function handleSubButtonClick(pageStep: number) {
  if (pageStep > 1) {
    updatePageState(pageStep - 1);
  }
  else {
    goBack();
  }
}

function updatePageState(newPageStep: number) {
  currentPageStep.value = newPageStep;
  switch (newPageStep) {
    case (1):
      pageStateByStep.value.buttonOptions = {
        main: {
      designType: "primary",
      label: "Далее",
      show: true,
    },
    sub: {
      designType: "tertiary",
      label: "Назад",
      show: true,    
      show: true,
    }
      }
      pageStateByStep.value.hintText = "Введите почту, указанную в аккаунте";
      break;
    case (2):
    pageStateByStep.value.buttonOptions = {
        main: {
      designType: "primary",
      label: "Далее",
      show: false,
    },
    sub: {
      designType: "tertiary",
      label: "Назад",
      show: true,
    }
      }
      pageStateByStep.value.hintText = "Введите код, отправленный на вашу почту";
      break;
    case (3):
    pageStateByStep.value.buttonOptions = {
        main: {
      designType: "primary",
      label: "Сменить пароль",
      show: true,
    },
    sub: {
      designType: "tertiary",
      label: "Назад",
      show: true,
    }
      }
      pageStateByStep.value.hintText = "Придумайте новый пароль";
      break;
    default:
      pageStateByStep.value.buttonOptions = {
          main: {
        designType: "primary",
        label: "Далее",
        show: true,
      },
      sub: {
        designType: "tertiary",
        label: "Назад",
        show: true,    
      }
        }
      pageStateByStep.value.hintText = "Введите почту, указанную в аккаунте";
      break;
  }
}

function goToMainPage() {
  showAuthError.value = true;
  // navigateTo({ path: '/' });
}
function goBack() {
  router.back();
}
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm :button-options="pageStateByStep.buttonOptions" @main-button-click="handleMainButtonClick(currentPageStep)" @sub-button-click="handleSubButtonClick(currentPageStep)">
        <template #form-content>
          <div class="form-content">
            <div class="form-content__page-step-hint text-center">
            <span>{{ pageStateByStep.hintText }}</span>
          </div>
            <div class="form-content__input-fields">
            <KTInput v-if="currentPageStep === 1" v-model="userData.email" label="Почта" />
            <KTInputOTP v-if="currentPageStep === 2"></KTInputOTP>
            <KTInput v-if="currentPageStep === 3" v-model="userData.email" label="Новый пароль" />
            <KTInput v-if="currentPageStep === 3" v-model="userData.email" label="Повторите пароль" />
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
    margin-top: 84px;
    margin-bottom: 56px;
    padding: 0px 16px;
    gap: 8px;
    &__input-fields {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    &__auth-error-block {
    }
    &__info-text {
      font-weight: 400;
      font-style: italic;
      font-size: 16px;
      color: var(--app-blue-9);
      &--error {
        color: var(--app-red-10);
        font-style: normal;
        font-weight: 500;
      }
    }
    &__page-step-hint {
      font-size: 14px;
      font-weight: 400;
      line-height: 17.07px;
    }
  }
</style>