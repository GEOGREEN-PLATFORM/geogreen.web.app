<template>
  <main class="profile-page">
    <div class="profile-page__top-section">
      <section class="profile-card">
        <div class="profile-card__user-info">
          <div class="profile-card__user-header">
            <div class="avatar-container" @click="editMode && triggerFileUpload()">
              <input
                ref="fileInput"
                type="file"
                class="avatar-container__file-input"
                accept="image/*"
                @change="onFileSelected"
              />
              <img
                v-if="!isDefaultAvatar"
                :src="avatarSrc"
                alt="User avatar"
                class="avatar-container__avatar"
              />
              <div v-else class="avatar-container__avatar avatar-container__avatar--placeholder">
                <span class="avatar-container__avatar-icon">
                  <q-icon
                    :name="editMode ? mdiUpload : mdiAccountOutline"
                    color="grey-400"
                    size="32px"
                  />
                </span>
              </div>
              <div v-if="editMode" class="avatar-container__avatar-overlay">
                <q-icon :name="mdiUpload" color="grey-050" size="32px" />
              </div>
            </div>

            <div class="name-container">
              <div class="name-container__name-wrapper">
                <input
                  v-model="userData.fullName"
                  type="text"
                  class="name-container__name-input gg-h1"
                  :class="{ 'name-container__name-input--edit': editMode }"
                  :readonly="!editMode"
                />
                <span v-if="!editMode" class="name-container__block-icon" @click="openBlockDialog">
                  <q-icon :name="mdiCancel" color="red-500" size="24px" />
                </span>
              </div>
            </div>
          </div>
          <div class="profile-card__content">
            <div v-if="editMode" class="profile-card__form">
              <div class="profile-card__field">
                <div class="profile-card__field-label gg-t-big">Роль:</div>
                <div class="profile-card__field-value gg-t-base">{{ userData.role }}</div>
              </div>

              <div class="profile-card__field">
                <div class="profile-card__field-label gg-t-big">Дата рождения:</div>
                <KTInputDate
                  v-model="userData.birthDate"
                  class="profile-card__field-input"
                  height="44px"
                />
              </div>

              <div class="profile-card__field">
                <div class="profile-card__field-label gg-t-big">Email:</div>
                <KTInput
                  v-model="userData.email"
                  type="email"
                  class="profile-card__field-input"
                  height="44px"
                />
              </div>

              <div class="profile-card__field">
                <div class="profile-card__field-label gg-t-big">Номер телефона:</div>
                <KTInput
                  v-model="userData.phone"
                  type="tel"
                  class="profile-card__field-input"
                  height="44px"
                />
              </div>

              <div class="profile-card__actions">
                <GGButton
                  size="medium"
                  design-type="secondary"
                  class="profile-card__button profile-card__button--cancel"
                  @click="cancelEdit"
                >
                  Отменить
                </GGButton>

                <GGButton
                  size="medium"
                  class="profile-card__button profile-card__button--save"
                  @click="saveChanges"
                >
                  Сохранить
                </GGButton>
              </div>
            </div>

            <div v-else class="profile-card__info-list">
              <div class="profile-card__field">
                <div class="profile-card__field-label gg-t-big">Роль:</div>
                <div class="profile-card__field-value gg-t-base">{{ userData.role }}</div>
              </div>
              <div class="profile-card__field">
                <div class="profile-card__field-label gg-t-big">Дата рождения:</div>
                <div class="profile-card__field-value gg-t-base">{{ userData.birthDate }}</div>
              </div>
              <div class="profile-card__field">
                <div class="profile-card__field-label gg-t-big">Email:</div>
                <div class="profile-card__field-value gg-t-base">{{ userData.email }}</div>
              </div>
              <div class="profile-card__field">
                <div class="profile-card__field-label gg-t-big">Номер телефона:</div>
                <div class="profile-card__field-value gg-t-base">{{ userData.phone }}</div>
              </div>

              <GGButton
                size="medium"
                stretch="fill"
                class="profile-card__edit-button"
                @click="toggleEditMode"
              >
                Редактировать
              </GGButton>
            </div>
          </div>
        </div>
      </section>
      <section class="profile-page__data-card">
        <!-- Future content will go here -->
      </section>
    </div>
    <section class="profile-page__table-section">
      <!-- Future table will go here -->
    </section>
    <GGDialog
      v-model="showBlockDialog"
      action-main-text="заблокировать сотрудника"
      action-button-confirm-text="Заблокировать"
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

const initialUserData = {
  fullName: "Иванов Иван Иванович",
  role: "Оператор",
  birthDate: "19.01.1990",
  email: "ivanovivan@mail.ru",
  phone: "+7-800-555-35-35"
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
.profile-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;

  background-color: var(--app-white);
  width: 100%;
  margin: 0 auto;
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

  .profile-card {
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
    }

    &__user-info {
      width: 100%;
    }
    @media screen and (max-width: $app-laptop) {
      max-width: 100%;
    }
    &__field-input {
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
        min-width: 184px;
        color: var(--app-grey-300);
      }

      &-value {
      }

      &-input {
        margin-top: 20px;
      }
    }

    &__edit-button {
      margin-top: 24px;
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
  .avatar-container {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    background-color: var(--app-grey-050);
    cursor: pointer;
    &__file-input {
      position: absolute;
      width: 0;
      height: 0;
      opacity: 0;
    }
    &__avatar {
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

    &__avatar-overlay {
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

    &__avatar-icon {
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

  .name-container {
    flex: 1;
    &__name-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__name-input {
      background: transparent;
      border: none;
      padding: 4px 0;
      outline: none;
      width: fit-content;
      border-bottom: 1px solid transparent;

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
    }
  }
}
</style>
