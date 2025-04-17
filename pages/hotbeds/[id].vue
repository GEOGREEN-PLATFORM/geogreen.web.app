<template>
  <main class="b-page">
    <div class="b-page__top-section">
      <section class="b-profile-card">
        <div class="b-profile-card__user-header">
          <div class="b-name">
            <div class="gg-h1">{{ hotbed?.details?.problemAreaType }}</div>
            <span class="b-name__block-icon" @click="openDeleteDialog">
              <q-icon :name="mdiDeleteOutline" color="red-500" size="24px"></q-icon>
            </span>
          </div>
        </div>
        <div v-if="pageLoaded" class="b-profile-card__content">
          <div class="b-profile-card__form">
            <KTInputTextarea
              class="report-form__comment"
              placeholder="Кратко опишите проблему"
              v-model="hotbed.details.comment"
              @blur="saveChanges"
            ></KTInputTextarea>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Мероприятие:</div>
              <KTInputSelect
                v-model="hotbed.relatedTaskId"
                disabled
                class="b-labeled-field__input"
              ></KTInputSelect>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Статус работы:</div>
              <KTInputSelect
                v-model="hotbed.details.workStage"
                @update:model-value="saveChanges"
                :options="WORK_STAGES"
                class="b-labeled-field__input"
              ></KTInputSelect>
            </div>
            <div class="b-profile-card__form-actions">
              <GGButton
                @click="toggleEditMode"
                size="medium"
                class="b-profile-card__button b-profile-card__button--save"
              >
                Еще
              </GGButton>
            </div>
          </div>
        </div>
      </section>
      <section class="b-page__data-card">
        <CCardData
          :list="hotdebCardList"
          :linksByLabel="linksByLabel"
          :statusStylesByValue="statusStylesByValue"
        ></CCardData>
      </section>
    </div>
    <section class="b-page__table-section">
      <!-- Future table will go here -->
    </section>
    <GGDialogConfirm
      v-model="showBlockDialog"
      actionMainText="удалить очаг"
      actionButtonConfirmText="Удалить"
      @cancel="cancelBlockAction"
      @confirm="confirmBlockAction"
    />
    <PagesHotbedsEdit v-model="editMode" :hotbed="hotbed" />
  </main>
</template>

<script setup lang="ts">
import {
  mdiAccountOutline,
  mdiCancel,
  mdiDeleteOutline,
  mdiUpload,
} from "@quasar/extras/mdi-v6";
import { ref } from "vue";
import { useMainStore } from "~/store/main";

const editMode = ref(false);
const isDefaultAvatar = ref(true);
const avatarSrc = ref("");
const showBlockDialog = ref(false);
const store = useMainStore();
const route = useRoute();
const fileInput = ref<HTMLInputElement>();
const { openPhoto } = usePhotoViewer();
const hotbed = ref();
const hotdebCardList = ref();
const linksByLabel = ref({});
const statusStylesByValue = ref({
  Создано: "color: var(--app-white); background-color: var(--app-grey-200)",
  "В работе":
    "color: var(--app-white); background-color: var(--app-orange-300)",
  Выполнено: "color: var(--app-white); background-color: var(--app-green-400)",
});
const WORK_STAGES = [
  {
    name: "Создано",
    value: "Создано",
  },
  {
    name: "В работе",
    value: "В работе",
  },
  {
    name: "Выполнено",
    value: "Выполнено",
  },
];
const pageLoaded = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}

function cancelEdit() {
  editMode.value = false;
}

async function saveChanges() {
  try {
    const response = await $fetch(
      `${store.apiGeospatial}/geo/info/${route.params.id}`,
      {
        method: "PATCH",
        headers: {
          authorization: useGetToken(),
        },
        body: hotbed.value,
      },
    );
    hotbed.value = response;
    updateHotdedCardList();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Ну удалось изменить данные очага",
    };
  }
  editMode.value = false;
}

function openDeleteDialog() {
  showBlockDialog.value = true;
}

function cancelBlockAction() {
  showBlockDialog.value = false;
}

async function confirmBlockAction() {
  await deleteHotbed();
  showBlockDialog.value = false;
}
async function deleteHotbed() {
  await $fetch(
    `${store.apiAuth}/register/${route.params.id}/enabled/${false}`,
    {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  useState<Alert>("showAlert").value = {
    show: true,
    type: "success",
    text: "Учетная запись сотрудника заблокирована",
  };
}
function triggerFileUpload() {
  fileInput.value?.click();
}
async function getHotbed() {
  const response = await $fetch<any>(
    `${store.apiGeospatial}/geo/info/${route.params.id}`,
    {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  hotbed.value = response;
  updateHotdedCardList();
  pageLoaded.value = true;
}
function updateHotdedCardList() {
  hotdebCardList.value = [
    {
      label: "Статус работы",
      value: hotbed.value.details.workStage,
      type: "status",
    },
    {
      label: "Мероприятие",
      value: hotbed.value.relatedTaskId ? "Подробнее" : "",
      type: "link",
    },
    {
      label: "Тип земель",
      value: hotbed.value.details.landType,
      type: "text",
    },
    {
      label: "Владелец",
      value: hotbed.value.details.owner,
      type: "text",
    },
    {
      label: "Метод по устранению",
      value: hotbed.value.details.eliminationMethod,
      type: "text",
    },
    {
      label: "Дата создания",
      value: "",
      type: "text",
    },
    {
      label: "Дата изменения",
      value: "",
      type: "text",
    },
  ];
}
function convertFromServerTempWillBeRemoved(date: string | null) {
  if (!date) return "";
  return `${date.split(" ")?.[0].split("-")[0]}.${date.split(" ")?.[0].split("-")[1]}.${date.split(" ")?.[0].split("-")[2]}`;
}
function tempDateConverterWillBeRemoved(ddmmyyyy: string): string {
  const [day, month, year] = ddmmyyyy.split(".");
  return `${day}-${month}-${year}`;
}
function onFileSelected(event: Event) {
  const file = event.target?.files[0];
  if (file) {
    uploadPhoto(file);
  }
}
async function uploadPhoto(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await $fetch<{ fullImageId: string }>(
      `${store.apiFileServer}/file/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    return response.fullImageId;
  } catch (err) {
    throw new Error("Ошибка при загрузке фото");
  }
}
onMounted(() => {
  getHotbed();
});
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
    justify-content: space-between;
    margin-bottom: 24px;
    @media screen and (max-width: $app-laptop) {
      flex-direction: column;
    }
  }
  .b-profile-card {
    background-color: var(--app-white);
    padding: 24px;
    padding-top: 0px;
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
    &__form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    &__form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
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
    &__block-icon {
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
  }
  &__table-section {
    background-color: var(--app-grey-100);
    border-radius: 8px;
    width: 100%;
    min-height: 360px;
  }
}
</style>
