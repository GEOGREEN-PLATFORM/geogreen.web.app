<template>
  <PagesAuthForm
    :button-options="pageState.buttonOpts"
    @main-button-click="handleMainAction(pageState.step + 1)"
    @sub-button-click="handleSubAction(pageState.step - 1)"
  >
    <template #form-content>
      <div class="form-content">
        <h1 class="form-content__head gg-h1">Сменить пароль</h1>
        <div class="form-content__page-step-hint gg-t-base">
          <span>{{ pageState.hintText }}</span>
        </div>
        <div class="form-content__input-fields">
          <CInput
            v-if="pageState.step === 0"
            v-model="userEmail"
            label="Почта"
            :rules="[validateEmail]"
            type="email"
            name="email"
          />
        </div>
      </div>
    </template>
    <template v-if="pageState.step === 1" #main-button>
      <CButton
        design-type="secondary"
        :disabled="sendCodeTimer !== 0"
        :loading="pageState.buttonOpts.main.loading"
        @click="sendEmail"
        ><div class="button-timer-slot">
          {{ `Отправить повторно ${sendCodeTimer !== 0 ? "через" : ""}` }}
          <span v-show="sendCodeTimer !== 0" class="button-timer-slot__time">
            {{ formattedSendTimer }}
          </span>
        </div>
      </CButton>
    </template>
  </PagesAuthForm>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

definePageMeta({
  layout: "auth",
});

const store = useMainStore();
const router = useRouter();
const { validateEmail } = useRules();
const INITIAL_STEP = 0;
const CODE_SENDING_TIMEOUT = 59;

const defaultSubButton: ButtonOptions = {
  designType: "tertiary",
  label: "Назад",
  show: true,
};
const userEmail = shallowRef(store.user?.email || "");
const codeSendingInterval = ref<NodeJS.Timeout>();
const sendCodeTimer = ref(CODE_SENDING_TIMEOUT);
const formattedSendTimer = computed(() => {
  return `00:${sendCodeTimer.value.toString().padStart(2, "0")}`;
});
const stepConfig = reactive([
  {
    mainButton: { label: "Далее", show: true },
    hintText: "Введите почту, указанную в аккаунте",
  },
  {
    mainButton: { label: "Далее", show: true },
    hintText: `На вашу электронную почту было направлено письмо, содержащее инструкцию по сбросу пароля. 
Если письмо не приходит в течение 5 минут, проверьте папку "Спам".`,
  },
]);
const pageState = reactive({
  step: INITIAL_STEP,
  hintText: stepConfig[INITIAL_STEP].hintText,
  buttonOpts: {
    main: { designType: "primary", ...stepConfig[INITIAL_STEP].mainButton },
    sub: defaultSubButton,
  } as { main: ButtonOptions; sub: ButtonOptions },
});

async function updatePageState(newStep: number) {
  try {
    if (newStep === 1) {
      await sendEmail();
    }
    pageState.step = newStep;
    if (newStep !== 1) {
      sendCodeTimer.value = CODE_SENDING_TIMEOUT;
      clearInterval(codeSendingInterval.value);
    }
    const config = stepConfig[newStep] || stepConfig[INITIAL_STEP];
    pageState.buttonOpts = {
      main: { designType: "primary", ...config.mainButton },
      sub: defaultSubButton,
    };
    pageState.hintText = config.hintText;
  } catch (err) {
    console.error(err);
  }
}

function handleMainAction(pageStep: number) {
  if (pageStep <= 1) {
    updatePageState(pageStep);
  }
}

function handleSubAction(pageStep: number) {
  if (pageStep >= 0) {
    updatePageState(pageStep);
  } else {
    goBack();
  }
}
async function sendEmail() {
  try {
    pageState.buttonOpts.main.loading = true;
    await $fetch(
      `${store.apiV1}/user/register/forgot-password/${userEmail.value?.toLowerCase()}`,
      {
        headers: {
          Authorization: useGetToken(),
        },
        method: "POST",
      },
    );
    sendCodeTimer.value = CODE_SENDING_TIMEOUT;
    clearInterval(codeSendingInterval.value);
    codeSendingInterval.value = setInterval(() => {
      sendCodeTimer.value -= 1;
      if (sendCodeTimer.value === 0) {
        clearInterval(codeSendingInterval.value);
      }
    }, 1000);
  } catch (err) {
    console.error(err);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось отправить письмо",
    };
  } finally {
    pageState.buttonOpts.main.loading = false;
  }
}
function goBack() {
  router.back();
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/pages/auth.scss";
.form-content {
  &__page-step-hint {
    text-align: center;
    margin-bottom: 16px;
  }
}
.button-timer-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  &__time {
    text-align: left;
    width: 4.2ch;
    color: var(--app-blue-600);
  }
}
</style>
