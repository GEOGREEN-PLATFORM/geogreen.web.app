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
              v-if="!isDefaultAvatar"
              :src="avatarSrc"
              alt="User avatar"
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
              class="b-name__name-input gg-h1"
              :class="{ 'b-name__name-input--edit': editMode }"
              :readonly="!editMode"
            />
            <span v-if="!editMode" class="block-icon" @click="openBlockDialog">
              <q-icon :name="mdiCancel" color="red-500" size="24px"></q-icon>
            </span>
          </div>
        </div>
        <div class="b-profile-card__content">
          <div v-if="editMode" class="b-profile-card__form">
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Роль:</div>
              <div class="b-labeled-field__value gg-t-base">{{ userData.role }}</div>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Дата рождения:</div>
              <KTInputDate
                v-model="userData.birthDate"
                class="b-labeled-field__input"
                height="44px"
              ></KTInputDate>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Email:</div>
              <KTInput
                v-model="userData.email"
                type="email"
                class="b-labeled-field__input"
                height="44px"
              ></KTInput>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Номер телефона:</div>
              <KTInput
                v-model="userData.phone"
                type="tel"
                class="b-labeled-field__input"
                height="44px"
              ></KTInput>
            </div>

            <div class="b-profile-card__actions">
              <GGButton
                @click="cancelEdit"
                size="medium"
                design-type="secondary"
                class="b-profile-card__button b-profile-card__button--cancel"
              >
                Отменить
              </GGButton>

              <GGButton
                @click="saveChanges"
                size="medium"
                class="b-profile-card__button b-profile-card__button--save"
              >
                Сохранить
              </GGButton>
            </div>
          </div>
          <div v-else class="b-profile-card__info-list">
            <div class="b-profile-card__field">
              <div class="b-profile-card__field-label gg-t-big">Роль:</div>
              <div class="b-profile-card__field-value gg-t-base">{{ userData.role }}</div>
            </div>
            <div class="b-profile-card__field">
              <div class="b-profile-card__field-label gg-t-big">Дата рождения:</div>
              <div class="b-profile-card__field-value gg-t-base">{{ userData.birthDate }}</div>
            </div>
            <div class="b-profile-card__field">
              <div class="b-profile-card__field-label gg-t-big">Email:</div>
              <div class="b-profile-card__field-value gg-t-base">{{ userData.email }}</div>
            </div>
            <div class="b-profile-card__field">
              <div class="b-profile-card__field-label gg-t-big">Номер телефона:</div>
              <div class="b-profile-card__field-value gg-t-base">{{ userData.phone }}</div>
            </div>

            <GGButton
              @click="toggleEditMode"
              size="medium"
              stretch="fill"
              class="b-profile-card__edit-button"
            >
              Редактировать
            </GGButton>

            <GGButton
              @click="openBlockDialog"
              size="medium"
              stretch="fill"
              bg-color="var(--app-red-500)"
              class="b-profile-card__block-button"
            >
              Заблокировать
            </GGButton>
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
    <GGDialogConfirm
      v-model="showBlockDialog"
      actionMainText="заблокировать сотрудника"
      actionButtonConfirmText="Заблокировать"
      @cancel="cancelBlockAction"
      @confirm="confirmBlockAction"
    />
  </main>
</template>

<script setup lang="ts">
import { mdiAccountOutline, mdiCancel, mdiUpload } from "@quasar/extras/mdi-v6";
import { ref } from "vue";

const editMode = ref(false);
const isDefaultAvatar = ref(true);
const avatarSrc = ref("");
const showBlockDialog = ref(false);
const fileInput = ref(null);
const { openPhoto } = usePhotoViewer();
const initialUserData = {
  fullName: "Иванов Иван Иванович",
  role: "Оператор",
  birthDate: "19.01.1990",
  email: "ivanovivan@mail.ru",
  phone: "+7-800-555-35-35",
};

const userData = ref({ ...initialUserData });

function toggleEditMode() {
  editMode.value = !editMode.value;
}

function cancelEdit() {
  userData.value = { ...initialUserData };
  editMode.value = false;
}

function saveChanges() {
  // Here you would typically send the updated data to an API
  console.log("Saving user data:", userData.value);

  // Update the initial data with the new values
  Object.assign(initialUserData, userData.value);

  // Exit edit mode
  editMode.value = false;
}

function openBlockDialog() {
  showBlockDialog.value = true;
}

function cancelBlockAction() {
  showBlockDialog.value = false;
}

function confirmBlockAction() {
  console.log("User blocked:", userData.value.fullName);
  showBlockDialog.value = false;
  // Here you would add the logic to block the user
}

function triggerFileUpload() {
  fileInput.value.click();
}

function onFileSelected(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarSrc.value = e.target.result;
      isDefaultAvatar.value = false;
    };
    reader.readAsDataURL(file);
  }
}
</script>

<style scoped lang="scss">
.b-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;

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
    &__field-input {
      margin-left: -12px;
    }
    &__content {
      width: 100%;
    }
    &__info-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    &__field {
      display: flex;
      min-height: 64px;
      height: 64px;
      align-items: center;

      &-label {
        min-width: 196px;
        color: var(--app-grey-300);
        @media screen and (max-width: $app-mobile) {
          min-width: 140px;
          width: 140px;
          overflow-wrap: break-word;
        }
      }

      &-value {
        overflow-wrap: anywhere;
      }

      &-input {
        margin-top: 20px;
      }
    }

    &__edit-button {
      margin-top: 24px;
    }
    &__block-button {
      display: none;
      margin-top: 12px;
      @media screen and (max-width: $app-mobile) {
        display: block;
      }
    }
    &__form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    &__button {
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

  .b-name {
    display: flex;
    align-items: center;
    gap: 8px;
    &__name-input {
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

    .block-icon {
      cursor: pointer;
      @media screen and (max-width: $app-mobile) {
        display: none;
      }
    }
    @media screen and (max-width: $app-mobile) {
      max-width: 100%;
      &__name-input {
        width: 100%;
      }
    }
  }
}
</style>
