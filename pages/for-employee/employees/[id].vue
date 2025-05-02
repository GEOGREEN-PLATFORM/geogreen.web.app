<template>
  <main class="b-page">
    <div class="b-page__top-section">
      <section class="b-profile-card">
        <div class="b-profile-card__user-header">
          <div class="b-avatar" @click="editMode && triggerFileUpload()">
            <input
              type="file"
              ref="fileInput"
              class="b-avatar__file-input"
              @change="onFileSelected"
              accept="image/*"
            />
            <img
              v-if="userData.image && avatarSrc"
              :src="avatarSrc"
              alt="Аватар"
              class="b-avatar__item"
              @click="openPhoto(avatarSrc)"
            />
            <div v-else class="b-avatar__item b-avatar__item--placeholder">
              <span class="b-avatar__item-icon">
                <q-icon
                  :name="editMode ? mdiUpload : mdiAccountOutline"
                  color="grey-400"
                  size="32px"
                ></q-icon>
              </span>
            </div>
            <div v-if="editMode" class="b-avatar__item-overlay">
              <q-icon :name="mdiUpload" color="grey-050" size="32px"></q-icon>
            </div>
          </div>
          <div class="b-name">
            <input
              type="text"
              v-model="userData.fullName"
              placeholder="Введите ФИО"
              class="b-name__input gg-h1"
              :class="{ 'b-name__input--edit': editMode }"
              :readonly="!editMode"
            />
            <span
              v-if="!editMode && store.user?.role === 'admin'"
              class="b-name__block-icon"
              @click="openToggleBlockDialog"
            >
              <q-icon
                :name="isEmployeeBlocked ? mdiLockOutline : mdiLockOpenOutline"
                :color="isEmployeeBlocked ? 'red-500' : 'green-500'"
                size="24px"
              ></q-icon>
            </span>
          </div>
        </div>
        <div class="b-profile-card__content">
          <q-form
            v-if="editMode"
            ref="formRef"
            novalidate
            greedy
            @submit="saveChanges"
            class="b-form"
          >
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Роль:</div>
              <div class="b-labeled-field__value gg-t-base">{{ userData.role }}</div>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Дата рождения:</div>
              <CInputDate
                v-model="userData.birthDate"
                class="b-labeled-field__input"
                height="44px"
                :required="false"
              ></CInputDate>
            </div>
            <div class="b-labeled-field b-labeled-field--required">
              <div class="b-labeled-field__label gg-t-big">Email:</div>
              <CInput
                v-model="userData.email"
                type="email"
                class="b-labeled-field__input"
                height="44px"
              ></CInput>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Номер телефона:</div>
              <CInput
                v-model="userData.phone"
                class="b-labeled-field__input"
                height="44px"
                :required="false"
                :rules="[(val: string) => !val || val.length === 18 || 'Неверный формат']"
                maska="+7 (###) ###-##-##"
              ></CInput>
            </div>
            <div class="b-form__actions">
              <CButton
                @click="cancelEdit"
                size="medium"
                design-type="secondary"
                class="b-form__button b-form__button--cancel"
              >
                Отменить
              </CButton>

              <CButton
                size="medium"
                class="b-form__button b-form__button--save"
                type="submit"
                :disabled="formHasError || isAvatarUploading"
              >
                Сохранить
              </CButton>
            </div>
          </q-form>
          <div v-else class="b-profile-card__info-list">
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Роль:</div>
              <div class="b-labeled-field__value gg-t-base">{{ userData.role }}</div>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Дата рождения:</div>
              <div
                class="b-labeled-field__value gg-t-base"
                :class="{
                  'b-labeled-field__value--empty': !userData.birthDate,
                }"
              >
                {{ userData.birthDate || "Не указано" }}
              </div>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Email:</div>
              <div class="b-labeled-field__value gg-t-base">{{ userData.email }}</div>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Номер телефона:</div>
              <div
                class="b-labeled-field__value gg-t-base"
                :class="{
                  'b-labeled-field__value--empty': !userData.birthDate,
                }"
              >
                {{ userData.phone || "Не указано" }}
              </div>
            </div>
            <CButton
              v-if="store.user?.role === 'admin'"
              @click="toggleEditMode"
              size="medium"
              stretch="fill"
              class="b-profile-card__edit-button"
            >
              Редактировать
            </CButton>
            <CButton
              v-if="store.user?.role === 'admin'"
              @click="openToggleBlockDialog"
              size="medium"
              stretch="fill"
              :bg-color="isEmployeeBlocked ? 'var(--app-red-500)' : 'var(--app-green-500)'"
              class="b-profile-card__toggle-block-button"
            >
              Заблокировать
            </CButton>
          </div>
        </div>
      </section>
      <section class="b-page__data-card">
        <!-- Future content will go here -->
      </section>
    </div>
    <section class="b-page__table-section">
      <!-- Future table will go here -->
    </section>
    <CDialogConfirm
      v-model="showBlockDialog"
      :actionMainText="isEmployeeBlocked ? 'разблокировать сотрудника' : 'заблокировать сотрудника'"
      :actionButtonConfirmText="isEmployeeBlocked ? 'Разблокировать' : 'Заблокировать'"
      :negative="!isEmployeeBlocked"
      @cancel="cancelToggleBlockAction"
      @confirm="confirmToggleBlockAction"
    />
  </main>
</template>

<script setup lang="ts">
import {
  mdiAccountOutline,
  mdiLockOpenOutline,
  mdiLockOutline,
  mdiUpload,
} from "@quasar/extras/mdi-v6";
import { ref } from "vue";
import { useMainStore } from "~/store/main";

interface UserData {
  fullName: string;
  role: string;
  birthDate: string;
  email: string;
  phone: string;
  image: ImageObj | null;
}
const editMode = ref(false);
const showBlockDialog = ref(false);
const store = useMainStore();
const isAvatarUploading = shallowRef(false);
const avatarSrc = ref("");
const route = useRoute();
const isEmployeeBlocked = ref(false);
const fileInput = ref<HTMLInputElement>();
const { openPhoto } = usePhotoViewer();
const { formRef, formBindValidation, formHasError } = useFormValidation();
const { uploadPhoto, getImageUrl } = useFiles();
const initialUserData = ref<UserData>({
  fullName: "",
  role: "",
  birthDate: "",
  email: "",
  phone: "",
  image: null,
});

const userData = ref({ ...initialUserData.value });
async function saveChanges() {
  try {
    await $fetch(
      `${store.apiAuth}/user/search/${initialUserData.value.email}`,
      {
        method: "PATCH",
        headers: {
          authorization: useGetToken(),
        },
        body: {
          firstName: userData.value.fullName.split(" ")[1],
          lastName: userData.value.fullName.split(" ")[0],
          patronymic: userData.value.fullName.split(" ")[2],
          email: userData.value.email,
          number: userData.value.phone,
          birthdate: userData.value.birthDate,
          image: userData.value.image,
        },
      },
    );
    getUser();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось сохранить изменения",
    };
  }
  editMode.value = false;
}
async function getUser() {
  const response = await $fetch<User>(
    `${store.apiAuth}/user/search/by-id/${route.params.id}`,
    {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  userData.value = {
    role: response.role === "operator" ? "Оператор" : "Администратор",
    email: response.email,
    phone: response.number || "",
    birthDate: response.birthdate || "",
    fullName: `${response.lastName} ${response.firstName} ${response.patronymic}`,
    image: response.image || null,
  };
  avatarSrc.value = userData.value.image
    ? getImageUrl(userData.value.image.fullImageId)
    : "";
  initialUserData.value = { ...userData.value };
  isEmployeeBlocked.value = !response.enabled;
}
async function confirmToggleBlockAction() {
  await toggleBlockUser();
  showBlockDialog.value = false;
}
async function toggleBlockUser() {
  await $fetch(
    `${store.apiAuth}/user/register/${initialUserData.value.email}/enabled/${!isEmployeeBlocked.value}`,
    {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  isEmployeeBlocked.value = !isEmployeeBlocked.value;
  useState<Alert>("showAlert").value = {
    show: true,
    type: "success",
    text: `Учетная запись сотрудника ${isEmployeeBlocked.value ? "заблокирована" : "разблокирована"}`,
  };
}
function toggleEditMode() {
  editMode.value = !editMode.value;
  if (editMode.value) {
    formBindValidation();
  }
}
function cancelEdit() {
  userData.value = { ...initialUserData.value };
  editMode.value = false;
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const fileList = input.files;
  if (!fileList || fileList.length === 0) {
    console.warn("Файл не выбран");
    return;
  }
  const file = fileList[0];
  isAvatarUploading.value = true;

  try {
    const uploadedUrl = await uploadPhoto(file);
    userData.value.image = uploadedUrl;
    avatarSrc.value = getImageUrl(uploadedUrl.fullImageId);
  } catch (error) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось загрузить фотографию",
    };
  } finally {
    isAvatarUploading.value = false;
  }
}
function triggerFileUpload() {
  fileInput.value?.click();
}
function openToggleBlockDialog() {
  showBlockDialog.value = true;
}

function cancelToggleBlockAction() {
  showBlockDialog.value = false;
}
onMounted(() => {
  getUser();
});
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;
.b-page {
  background-color: var(--app-white);
  width: 100%;
  padding: 24px;
  @media screen and (max-width: $app-mobile) {
    padding: 16px;
  }
  &__top-section {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    @media screen and (max-width: $app-laptop) {
      flex-direction: column;
    }
  }
  &__data-card {
    background-color: #fff5e6;
    border-radius: 8px;
    flex: 1;
    min-height: 250px;
  }
  &__table-section {
    background-color: var(--app-grey-100);
    border-radius: 8px;
    width: 100%;
    min-height: 360px;
  }
}
.b-name {
  display: flex;
  align-items: center;
  gap: 8px;
  &__input {
    background: transparent;
    border: none;
    padding: 4px 0;
    outline: none;
    width: fit-content;
    border-bottom: 1px solid transparent;
    color: var(--app-grey-500);
    &--edit {
      border-bottom: 1px solid var(--app-grey-300);
    }
    &:focus {
      border-bottom: 1px solid var(--app-green-500);
    }
    &[readonly] {
      cursor: default;
    }
  }
  &__block-icon {
    cursor: pointer;
    @media screen and (max-width: $app-mobile) {
      display: none;
    }
  }
  @media screen and (max-width: $app-mobile) {
    max-width: 100%;
    &__input {
      width: 100%;
    }
  }
}
.b-profile-card {
  background-color: var(--app-white);
  padding: 24px;
  border-radius: 8px;
  flex: 1;
  max-width: 560px;
  &__user-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    @media screen and (max-width: $app-mobile) {
      display: flex;
      flex-direction: column;
    }
  }
  @media screen and (max-width: $app-laptop) {
    max-width: 100%;
  }
  @media screen and (max-width: $app-mobile) {
    padding: 0px;
  }
  &__content {
    width: 100%;
  }
  &__info-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  &__edit-button {
    margin-top: 24px;
  }
  &__toggle-block-button {
    display: none;
    margin-top: 12px;
    @media screen and (max-width: $app-mobile) {
      display: block;
    }
  }
}
.b-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
}
.b-labeled-field {
  display: flex;
  min-height: 64px;
  height: 64px;
  align-items: center;
  &__label {
    min-width: 196px;
    color: var(--app-grey-300);
    @media screen and (max-width: $app-mobile) {
      min-width: 140px;
      width: 140px;
      overflow-wrap: break-word;
    }
  }
  &__value {
    overflow-wrap: anywhere;
    &--empty {
      color: var(--app-grey-200);
    }
  }
  &__input {
    margin-left: -12px;
    margin-top: 20px;
  }
  &--required {
    .b-labeled-field__label {
      &::after {
        content: "*";
        color: var(--app-red-500);
      }
    }
  }
}
.b-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--app-grey-050);
  cursor: pointer;
  @media screen and (max-width: $app-mobile) {
    width: 100%;
    height: 120px;
    border-radius: 4px;
  }
  &__file-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }
  &__item {
    width: 100%;
    height: 100%;
    object-fit: cover;

    &--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--app-grey-100);
      color: var(--app-grey-500);
      cursor: default;
    }
  }

  &__item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  &__item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
