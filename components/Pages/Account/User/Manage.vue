<template>
  <CDialog v-model="dialogVisible" class="b-dialog" @show="formBindValidation">
    <q-card class="b-card">
      <header class="b-card__header">
        <h2 class="b-card__title gg-h2">Управление аккаунтом</h2>
        <p v-if="subTitle" class="b-card__subtitle">{{ subTitle }}</p>
      </header>
      <q-form ref="formRef" novalidate greedy class="b-form" @submit="submitUserData">
        <template v-if="currentStep === 1">
          <section class="b-form__section">
            <div class="b-form__section-content">
              <div class="b-form__submit-email gg-t-base">
                <span class="text-orange-500">Электронная почта не подтверждена.</span
                ><span class="text-green-500 cursor-pointer">Нажмите, чтобы подтвердить</span>
              </div>
              <div class="b-form__avatar-container">
                <CAvatar
                  class="b-form__avatar"
                  :avatar-src="userData.image?.fullImageId"
                  @change-avatar="updateAvatar"
                  edit-mode
                ></CAvatar>
              </div>
              <div class="b-form__fields-row">
                <CInput v-model="userData.lastName" label="Фамилия" class="b-form__field" />
                <CInput v-model="userData.firstName" label="Имя" class="b-form__field" />
              </div>
              <CInput
                v-model="userData.phoneNumber"
                label="Номер телефона"
                :required="false"
                class="b-form__field"
                :rules="[(val: string) => !val || val.length === 18 || 'Неверный формат']"
                maska="+7 (###) ###-##-##"
              />
              <CInputSwitch
                v-model="userData.sendNotificantions"
                label="Хочу получать уведомления об изменениях по моим сообщениям о проблемах на электронную почту"
              />
            </div>
          </section>
        </template>
        <footer class="b-form__footer">
          <CButton @click="onBack" design-type="tertiary" :label="cancelLabel" />
          <CButton
            :label="applyLabel"
            :disabled="formHasError"
            :loading="isDataSending"
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
  lastName: string;
  phoneNumber: string;
  sendNotificantions: boolean;
  image: ImageObj | null;
  changedImage: File | null;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "managedAccount"): void;
}>();
const dialogVisible = ref(props.modelValue);
const { formRef, formBindValidation, formHasError } = useFormValidation();
const { uploadPhoto } = useFiles();
const userData = reactive<UserAccountData>({
  firstName: "",
  lastName: "",
  phoneNumber: "",
  sendNotificantions: false,
  image: null,
  changedImage: null,
});

const cancelLabel = ref("Отмена");
const applyLabel = ref("Сохранить");
const subTitle = ref("");
const currentStep = ref(1);
const isDataSending = ref(false);
const store = useMainStore();

function updateAvatar(file: File) {
  userData.changedImage = file;
}
function submitUserData() {
  formRef.value?.validate().then((success) => {
    if (success) {
      nextStep();
    }
  });
}

function onBack() {
  resetForm();
  dialogVisible.value = false;
}
function nextStep() {
  manageAccount(userData);
}
async function manageAccount(updatedAccountData: UserAccountData) {
  isDataSending.value = true;
  try {
    if (updatedAccountData.changedImage) {
      userData.image = await uploadPhoto(updatedAccountData.changedImage);
    }
    await $fetch(`${store.apiAuth}/user/search/${props.user.email}`, {
      method: "PATCH",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        firstName: updatedAccountData.firstName,
        lastName: updatedAccountData.lastName,
        number: updatedAccountData.phoneNumber,
        image: updatedAccountData.image,
      },
    });
    dialogVisible.value = false;
    emits("managedAccount");
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось изменить данные аккаунта",
    };
  } finally {
    isDataSending.value = false;
  }
}
function resetForm() {
  userData.firstName = "";
  userData.lastName = "";
  userData.phoneNumber = "";
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
  userData.firstName = props.user.firstName;
  userData.lastName = props.user.lastName;
  userData.phoneNumber = props.user.number || "";
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
  &__section-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  &__fields-row {
    display: flex;
    gap: 24px;
    @media screen and (max-width: $app-mobile) {
      flex-direction: column;
      gap: 0px;
    }
  }
  &__field {
    flex: 1;
    max-width: 434px;
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
  &__avatar-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px 0px;
    .b-form__avatar {
      width: 64px;
      height: 64px;
    }
  }
  &__submit-email {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
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
