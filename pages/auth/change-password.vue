<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})
const INITIAL_STEP = 1;
class PageState {
  private currentStep: number;
  private hintText: string;
  private currentButtonOpts: { main: ButtonOptions, sub: ButtonOptions };

  private readonly defaultSubButton: ButtonOptions = { designType: 'tertiary', label: 'Назад', show: true };

  private readonly stepConfig = {
    1: {
      mainButton: { label: 'Далее', show: true },
      hintText: 'Введите почту, указанную в аккаунте'
    },
    2: {
      mainButton: { label: 'Далее', show: false },
      hintText: 'Введите код, отправленный на вашу почту'
    },
    3: {
      mainButton: { label: 'Сменить пароль', show: true },
      hintText: 'Придумайте новый пароль'
    },
  };

  constructor() {
    this.currentStep = INITIAL_STEP;
    this.hintText = this.stepConfig[INITIAL_STEP].hintText;
    this.currentButtonOpts = {
      main: { designType: 'primary', ...this.stepConfig[INITIAL_STEP].mainButton },
      sub: this.defaultSubButton
    };
  }

  get step() {
    return this.currentStep;
  }

  get hint() {
    return this.hintText;
  }

  get buttonOptions() {
    return this.currentButtonOpts;
  }

  update(newStep: number) {
    this.currentStep = newStep;
    if (Object.hasOwn(this.stepConfig, newStep)) {
      const config = this.stepConfig[newStep as (1 | 2 | 3)] || this.stepConfig[INITIAL_STEP];
      this.currentButtonOpts = {
        main: { designType: 'primary', ...config.mainButton },
        sub: this.defaultSubButton
      };
      this.hintText = config.hintText;
    }
  }
}

const pageState = ref(new PageState())
const userData = ref({
  email: '',
  password: '',
  repeatedPassword: '',
  confirmationCode: '',
})
const router = useRouter()

function handleMainButtonClick(pageStep: number) {
  if (pageStep < 3) {
    pageState.value.update(pageStep + 1)
  }
  else {
    sendChangePassword();
  }

}

function handleSubButtonClick(pageStep: number) {
  if (pageStep > 1) {
    pageState.value.update(pageStep - 1)
  }
  else {
    goBack()
  }
}

function sendChangePassword() {

}

function goToMainPage() {
  showAuthError.value = true
  // navigateTo({ path: '/' });
}

function goBack() {
  router.back()
}
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm :button-options="pageState.buttonOptions" @main-button-click="handleMainButtonClick(pageState.step)" @sub-button-click="handleSubButtonClick(pageState.step)">
        <template #form-content>
          <div class="form-content">
            <div class="form-content__page-step-hint text-center">
              <span>{{ pageState.hint }}</span>
            </div>
            <div class="form-content__input-fields">
              <KTInput v-if="pageState.step === 1" v-model="userData.email" label="Почта" />
              <KTInputOTP @is-full="" v-if="pageState.step === 2" v-model="userData.confirmationCode"/>
              <KTInput v-if="pageState.step === 3" v-model="userData.password" type="password" label="Новый пароль" />
              <KTInput v-if="pageState.step === 3" v-model="userData.repeatedPassword" type="password" label="Повторите пароль" />
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
