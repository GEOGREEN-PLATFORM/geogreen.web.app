<template>
  <GGDialog v-model="dialogVisible" class="b-dialog">
    <q-card class="b-dialog__container">
      <header class="b-dialog__header">
        <h2 class="b-dialog__title gg-h2">Создание оператора</h2>
        <p v-if="subTitle" class="b-dialog__subtitle">{{ subTitle }}</p>
      </header>
      <q-form ref="formRef" novalidate greedy class="b-dialog__form" @submit="onSubmit">
        <template v-if="currentStep === 1">
          <section class="b-dialog__section">
            <h3 class="b-dialog__section-title gg-h3">Личные данные</h3>
            <div class="b-dialog__section-content">
              <div class="b-dialog__fields-row">
                <KTInput
                  v-model="employeeData.personalData.lastName"
                  label="Фамилия"
                  required
                  class="b-dialog__field"
                />
                <KTInput
                  v-model="employeeData.personalData.firstName"
                  label="Имя"
                  required
                  class="b-dialog__field"
                />
                <KTInput
                  v-model="employeeData.personalData.secondName"
                  label="Отчество"
                  required
                  class="b-dialog__field"
                />
              </div>
              <KTInputDate
                v-model="employeeData.personalData.dateOfBirth"
                label="Дата рождения"
                class="b-dialog__field"
              />
            </div>
          </section>
          <section class="b-dialog__section">
            <h3 class="b-dialog__section-title gg-h3">Контакты</h3>
            <div class="b-dialog__section-content">
              <KTInput
                v-model="employeeData.contacts.email"
                label="Email"
                hint="Электронная почта сотрудника"
                class="b-dialog__field"
              />
              <KTInput
                v-model="employeeData.contacts.phoneNumber"
                label="Номер телефона"
                :required="false"
                class="b-dialog__field"
              />
            </div>
          </section>
        </template>
        <template v-else-if="currentStep === 2">
          <section class="b-dialog__section">
            <h3 class="b-dialog__section-title gg-h3">Личные данные</h3>
            <div class="b-dialog__info-row gg-t-base">
              <span class="b-dialog__info-label">ФИО:</span>
              <span class="b-dialog__info-value">{{ fullName }}</span>
            </div>
            <div class="b-dialog__info-row gg-t-base">
              <span class="b-dialog__info-label">Дата рождения:</span>
              <span class="b-dialog__info-value">{{ employeeData.personalData.dateOfBirth }}</span>
            </div>
          </section>
          <section class="b-dialog__section">
            <h3 class="b-dialog__section-title gg-h3">Контакты</h3>
            <div class="b-dialog__info-row gg-t-base">
              <span class="b-dialog__info-label">Email:</span>
              <span class="b-dialog__info-value">{{ employeeData.contacts.email }}</span>
            </div>
            <div class="b-dialog__info-row gg-t-base">
              <span class="b-dialog__info-label">Номер телефона:</span>
              <span class="b-dialog__info-value">{{ employeeData.contacts.phoneNumber }}</span>
            </div>
          </section>
        </template>
        <template v-else-if="currentStep === 3">
          <section class="b-dialog__section">
            <div class="b-dialog__password-container">
              <h3 class="b-dialog__password-title gg-h2">Пароль</h3>
              <div class="b-dialog__password-wrapper">
                <div class="b-dialog__password">{{ employeeData.password }}</div>
                <div
                  class="b-dialog__copy-wrapper"
                  @mouseenter="onCopyMouseEnter"
                  @mouseleave="onCopyMouseLeave"
                  @click="copyPassword"
                >
                  <q-icon
                    :class="{ 'pop-animation': isAnimating }"
                    :name="mdiContentCopy"
                    size="32px"
                    class="b-dialog__copy-icon"
                  />
                  <span :style="`opacity: ${Number(showTooltip)}`" class="b-dialog__copy-tooltip">{{
                    tooltipText
                  }}</span>
                </div>
              </div>
            </div>
          </section>
        </template>

        <footer class="b-dialog__footer">
          <GGButton @click="onBack" design-type="tertiary" :label="cancelLabel" />
          <GGButton :label="applyLabel" :disabled="formHasError" type="submit" />
        </footer>
      </q-form>
    </q-card>
  </GGDialog>
</template>

<script setup lang="ts">
import { mdiContentCopy } from "@quasar/extras/mdi-v6";
interface Props {
  modelValue: boolean;
}
interface EmployeeData {
  personalData: {
    firstName: string;
    secondName: string;
    lastName: string;
    dateOfBirth: string;
  };
  contacts: {
    email: string;
    phoneNumber: string;
  };
  password: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue", "employeeCreated"]);
const dialogVisible = ref(props.modelValue);
const { formRef, formBindValidation, formHasError } = useFormValidation();

watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  },
);
watch(dialogVisible, (newVal) => {
  emit("update:modelValue", newVal);
});

const employeeData = reactive<EmployeeData>({
  personalData: {
    firstName: "",
    secondName: "",
    lastName: "",
    dateOfBirth: "",
  },
  contacts: {
    email: "",
    phoneNumber: "",
  },
  password: "",
});

const cancelLabel = ref("Отмена");
const applyLabel = ref("Далее");
const subTitle = ref("");
const currentStep = ref(1);

const fullName = computed(() =>
  `${employeeData.personalData.lastName} ${employeeData.personalData.firstName} ${employeeData.personalData.secondName}`.trim(),
);

function onSubmit() {
  formRef.value?.validate().then((success) => {
    if (success) {
      nextStep();
    }
  });
}

function onBack() {
  if (currentStep.value === 1) {
    resetForm();
    dialogVisible.value = false;
  } else {
    currentStep.value--;
    updateLabels();
  }
}

function nextStep() {
  if (currentStep.value === 1) {
    currentStep.value++;
    subTitle.value = "Проверьте корректность введённых данных";
    cancelLabel.value = "Назад";
  } else if (currentStep.value === 2) {
    currentStep.value++;
    subTitle.value =
      "Сохраните пароль для сотрудника. Утерянные пароли не восстанавливаются в системе!";
    applyLabel.value = "Создать";
    employeeData.password = generatePassword();
  } else if (currentStep.value === 3) {
    emit("employeeCreated", employeeData);
    dialogVisible.value = false;
  }
}

function updateLabels() {
  if (currentStep.value === 1) {
    cancelLabel.value = "Отмена";
    applyLabel.value = "Далее";
    subTitle.value = "";
  } else if (currentStep.value === 2) {
    cancelLabel.value = "Назад";
    applyLabel.value = "Далее";
    subTitle.value = "Проверьте корректность введённых данных";
  }
}

function resetForm() {
  currentStep.value = 1;
  subTitle.value = "";
  cancelLabel.value = "Отмена";
  applyLabel.value = "Далее";
  employeeData.personalData.firstName = "";
  employeeData.personalData.secondName = "";
  employeeData.personalData.lastName = "";
  employeeData.personalData.dateOfBirth = "";
  employeeData.contacts.email = "";
  employeeData.contacts.phoneNumber = "";
  employeeData.password = "";
}

function generatePassword(): string {
  const specialChars = "@#$%&*";
  const randomStr = Math.random().toString(36).slice(-10);
  const passwordArr = randomStr
    .split("")
    .map((char) =>
      Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase(),
    );
  const index = Math.floor(Math.random() * passwordArr.length);
  passwordArr[index] =
    specialChars[Math.floor(Math.random() * specialChars.length)];
  return passwordArr.join("");
}

const tooltipText = ref("Скопировать пароль");
const showTooltip = ref(false);
const isAnimating = ref(false);

function onCopyMouseEnter() {
  showTooltip.value = true;
}

function onCopyMouseLeave() {
  showTooltip.value = false;
  if (tooltipText.value === "Скопировано") {
    tooltipText.value = "Скопировать пароль";
  }
}

function copyPassword() {
  navigator.clipboard.writeText(employeeData.password).then(() => {
    tooltipText.value = "Скопировано";
    showTooltip.value = true;
    isAnimating.value = true;
    setTimeout(() => {
      isAnimating.value = false;
      showTooltip.value = false;
      setTimeout(() => {
        tooltipText.value = "Скопировать пароль";
      }, 300);
    }, 1000);
  });
}
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.b-dialog {
  &__container {
    display: flex;
    flex-direction: column;
    width: 80%;
    max-width: 784px;
    background-color: var(--app-white);
    border-radius: 12px;
    padding: 24px 32px;
    @media screen and (max-width: $app-mobile) {
      padding: 12px 24px;
      width: 100%;
    }
  }
  &__header {
    padding: 16px 0 20px;
  }
  &__title {
    margin: 0;
  }
  &__subtitle {
    margin-top: 10px;
    font-size: 18px;
    color: var(--app-grey-300);
  }
  &__form {
    display: flex;
    flex-direction: column;
  }
  &__section {
    padding-top: 20px;
  }
  &__section-title {
    margin-bottom: 12px;
  }
  &__section-content {
    display: flex;
    flex-direction: column;
  }
  &__fields-row {
    display: flex;
    gap: 12px;
    @media screen and (max-width: $app-mobile) {
      flex-direction: column;
      gap: 0px;
    }
  }
  &__field {
    flex: 1;
    max-width: 434px;
    padding-top: 12px;
  }
  &__info-row {
    display: flex;
    gap: 4px;
  }
  &__info-label {
    color: var(--app-grey-500);
  }
  &__info-value {
    color: var(--app-grey-300);
  }
  &__password-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    margin-bottom: 16px;
  }
  &__password-title {
    margin: 0;
  }
  &__password-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__password {
    font-size: 32px;
    font-weight: bold;
  }
  &__copy-wrapper {
    position: relative;
    cursor: pointer;
    &:hover {
      .b-dialog__copy-icon {
        transform: scale(1.1);
      }
      .b-dialog__copy-tooltip {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
        @media screen and (max-width: $app-mobile) {
          transform: translateX(-100%) translateY(0);
        }
      }
    }
  }
  &__copy-icon {
    transition: transform 0.2s;
  }
  &__copy-tooltip {
    position: absolute;
    pointer-events: none;
    bottom: -32px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
    background-color: var(--app-grey-300);
    color: var(--app-white);
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
    @media screen and (max-width: $app-mobile) {
      left: 100%;
      transform: translateX(-100%) translateY(10px);
    }
  }
  &__footer {
    display: flex;
    gap: 16px;
    margin-top: 32px;
    justify-content: flex-end;
  }
}
@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
.pop-animation {
  animation: pop 0.5s ease;
}
</style>
