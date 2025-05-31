<template>
  <CDialog
    v-model="dialogVisible"
    class="b-dialog"
    title="Добавление оператора"
    :sub-title="subTitle"
    @show="formBindValidation"
  >
    <div class="b-card">
      <q-form ref="formRef" novalidate greedy class="b-form" @submit="submitEmployeeData">
        <template v-if="currentStep === 1">
          <section class="b-form__section">
            <h3 class="b-form__section-title gg-h3">Личные данные</h3>
            <div class="b-form__section-content">
              <div class="b-form__fields-row">
                <CInput
                  v-model="employeeData.personalData.lastName"
                  label="Фамилия"
                  class="b-form__field"
                />
                <CInput
                  v-model="employeeData.personalData.firstName"
                  label="Имя"
                  class="b-form__field"
                />
                <CInput
                  v-model="employeeData.personalData.secondName"
                  label="Отчество"
                  class="b-form__field"
                />
              </div>
              <CInputDate
                v-model="employeeData.personalData.dateOfBirth"
                label="Дата рождения"
                class="b-form__field"
              />
            </div>
          </section>
          <section class="b-form__section">
            <h3 class="b-form__section-title gg-h3">Контакты</h3>
            <div class="b-form__section-content">
              <CInput
                v-model="employeeData.contacts.email"
                label="Email"
                hint="Электронная почта сотрудника"
                :rules="[validateEmail]"
                class="b-form__field"
              />
              <CInput
                v-model="employeeData.contacts.phoneNumber"
                label="Номер телефона"
                :required="false"
                class="b-form__field"
                :rules="[(val: string) => !val || val.length === 18 || 'Неверный формат']"
                maska="+7 (###) ###-##-##"
              />
            </div>
          </section>
        </template>
        <template v-else-if="currentStep === 2">
          <section class="b-form__section">
            <h3 class="b-form__section-title gg-h3">Личные данные</h3>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">ФИО:</span>
              <span class="b-form__info-value">{{ fullName }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Дата рождения:</span>
              <span class="b-form__info-value">{{
                date.formatDate(employeeData.personalData.dateOfBirth, "DD.MM.YYYY")
              }}</span>
            </div>
          </section>
          <section class="b-form__section">
            <h3 class="b-form__section-title gg-h3">Контакты</h3>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Email:</span>
              <span class="b-form__info-value">{{ employeeData.contacts.email }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Номер телефона:</span>
              <span class="b-form__info-value">{{ employeeData.contacts.phoneNumber }}</span>
            </div>
          </section>
        </template>
        <template v-else-if="currentStep === 3">
          <section class="b-form__section">
            <div class="b-password">
              <h3 class="b-password__title gg-h2">Пароль</h3>
              <div class="b-password__text-copy-wrapper">
                <div class="b-password__text">{{ employeeData.password }}</div>
                <CButtonCopy
                  :text="employeeData.password"
                  tooltip-initial-text="Скопировать пароль"
                  tooltip-success-text="Скопировано"
                />
              </div>
            </div>
          </section>
        </template>
        <footer class="b-form__footer">
          <CButton @click="onBack" design-type="tertiary" :label="cancelLabel" />
          <CButton
            :label="applyLabel"
            :disabled="formHasError"
            :loading="isAddLoading"
            type="submit"
          />
        </footer>
      </q-form>
    </div>
  </CDialog>
</template>

<script setup lang="ts">
import { date } from "quasar";
import { useMainStore } from "~/store/main";

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
const emits = defineEmits(["update:modelValue", "employeeCreated"]);
const dialogVisible = ref(props.modelValue);
const { formRef, formBindValidation, formHasError } = useFormValidation();
const { validateEmail } = useRules();

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
const isAddLoading = ref(false);
const store = useMainStore();
const fullName = computed(() =>
  `${employeeData.personalData.lastName} ${employeeData.personalData.firstName} ${employeeData.personalData.secondName}`.trim(),
);

function submitEmployeeData() {
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
    subTitle.value = "Сохраните пароль для сотрудника.";
    applyLabel.value = "Создать";
    employeeData.password = generatePassword();
  } else if (currentStep.value === 3) {
    addEmployee(employeeData);
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
async function addEmployee(newEmployee: EmployeeData) {
  isAddLoading.value = true;
  try {
    await $fetch(`${store.apiV1}/user/register/operator`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        firstName: newEmployee.personalData.firstName,
        lastName: newEmployee.personalData.lastName,
        patronymic: newEmployee.personalData.secondName,
        email: newEmployee.contacts.email.toLowerCase(),
        password: newEmployee.password,
        number: newEmployee.contacts.phoneNumber,
        birthdate: newEmployee.personalData.dateOfBirth,
      },
    });
    dialogVisible.value = false;
    emits("employeeCreated");
    nextTick(() => resetForm());
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось добавить оператора",
    };
  } finally {
    isAddLoading.value = false;
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

watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  },
);
watch(
  () => dialogVisible.value,
  (newVal) => {
    emits("update:modelValue", newVal);
  },
);
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;
.b-card {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  width: 600px;
  background-color: var(--app-white);
  border-radius: 12px;
}
.b-form {
  display: flex;
  flex-direction: column;
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
    margin-bottom: 8px;
    @media screen and (max-width: $app-mobile) {
      display: block;
      .b-form__info-label {
        display: block;
        margin-bottom: 4px;
      }
    }
  }
  &__info-label {
    color: var(--app-grey-300);
    min-width: 152px;
    width: 152px;
  }
  &__info-value {
    color: var(--app-grey-500);
    display: flex;
    align-items: center;
    overflow-wrap: anywhere;
  }
  &__footer {
    display: flex;
    gap: 16px;
    margin-top: 32px;
    justify-content: flex-end;
  }
}
.b-password {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  margin-bottom: 16px;
  &__text-copy-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__text {
    font-size: 32px;
    font-weight: bold;
  }
}
</style>
