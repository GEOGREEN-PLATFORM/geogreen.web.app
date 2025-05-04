<template>
  <CDialog v-model="dialogVisible" class="b-dialog" @show="formBindValidation">
    <q-card class="b-card">
      <header class="b-card__header">
        <h2 class="b-card__title gg-h2">Управление аккаунтом</h2>
        <p v-if="subTitle" class="b-card__subtitle">{{ subTitle }}</p>
      </header>
      <q-form ref="formRef" novalidate greedy class="b-form" @submit="submitEmployeeData">
        <template v-if="currentStep === 1">
          <section class="b-form__section">
            <div class="b-form__section-content">
              <div class="b-form__avatar-container">
                <CAvatar></CAvatar>
              </div>
              <div class="b-form__fields-row">
                <CInput v-model="employeeData.lastName" label="Фамилия" class="b-form__field" />
                <CInput v-model="employeeData.firstName" label="Имя" class="b-form__field" />
              </div>
              <CInput
                v-model="employeeData.phoneNumber"
                label="Номер телефона"
                :required="false"
                class="b-form__field"
                :rules="[(val: string) => !val || val.length === 18 || 'Неверный формат']"
                maska="+7 (###) ###-##-##"
              />
              <COptions
                v-model="employeeData.sendNotificantions"
                inline
                type="toggle"
                :options="[
                  {
                    label:
                      'Хочу получать уведомления об изменениях по моим сообщениям о проблемах на электронную почту',
                    value: employeeData.sendNotificantions,
                  },
                ]"
              />
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
    </q-card>
  </CDialog>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

interface Props {
  modelValue: boolean;
  user: User;
}
interface UserAccountData {
  firstName: string;
  secondName: string;
  lastName: string;
  phoneNumber: string;
  sendNotificantions: boolean;
}

const props = defineProps<Props>();
const emits = defineEmits(["update:modelValue", "employeeCreated"]);
const dialogVisible = ref(props.modelValue);
const { formRef, formBindValidation, formHasError } = useFormValidation();

const employeeData = reactive<UserAccountData>({
  firstName: "",
  secondName: "",
  lastName: "",
  phoneNumber: "",
  sendNotificantions: false,
});

const cancelLabel = ref("Отмена");
const applyLabel = ref("Далее");
const subTitle = ref("");
const currentStep = ref(1);
const isAddLoading = ref(false);
const store = useMainStore();

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
async function addEmployee(newEmployee: UserAccountData) {
  isAddLoading.value = true;
  try {
    await $fetch(`${store.apiAuth}/user/register/operator`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        patronymic: newEmployee.secondName,
        number: newEmployee.phoneNumber,
      },
    });
    dialogVisible.value = false;
    emits("employeeCreated");
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось создать оператора",
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
  employeeData.firstName = "";
  employeeData.secondName = "";
  employeeData.lastName = "";
  employeeData.phoneNumber = "";
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

onMounted(() => {
  if (!props.user) {
    return;
  }
  employeeData.firstName = props.user.firstName;
  employeeData.secondName = props.user.patronymic;
  employeeData.lastName = props.user.lastName;
  employeeData.phoneNumber = props.user.number;
});
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;
.b-card {
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
