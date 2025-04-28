<template>
  <main class="b-page">
    <div class="b-page__top-section">
      <section class="b-main-editable-card">
        <div class="b-main-editable-card__header">
          <div class="b-name">
            <div class="gg-h1">{{ hotbed?.details?.problemAreaType }}</div>
            <span class="b-name__delete-icon" @click="openDeleteDialog">
              <q-icon :name="mdiDeleteOutline" color="red-500" size="24px"></q-icon>
            </span>
          </div>
        </div>
        <div v-if="pageLoaded && hotbed" class="b-main-editable-card__content">
          <div class="b-main-editable-card__fields">
            <CInputTextarea
              class="b-main-editable-card__comment"
              placeholder="Оставьте комментарий по очагу"
              v-model="hotbed.details.comment"
              @blur="saveChanges()"
            ></CInputTextarea>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Мероприятие:</div>
              <CInputSelect
                v-model="hotbed.relatedTaskId"
                disabled
                class="b-labeled-field__input"
              ></CInputSelect>
            </div>
            <div class="b-labeled-field">
              <div class="b-labeled-field__label gg-t-big">Статус работы:</div>
              <CInputSelect
                v-model="hotbed.details.workStage"
                @update:model-value="saveChanges()"
                :options="HOTBED_WORK_STAGE_OPTIONS"
                class="b-labeled-field__input"
              ></CInputSelect>
            </div>
            <div class="b-main-editable-card__actions">
              <CButton
                @click="toggleEditMode"
                size="medium"
                class="b-main-editable-card__button b-main-editable-card__button--more"
              >
                Еще
              </CButton>
            </div>
          </div>
        </div>
      </section>
      <section class="b-page__data-card">
        <CCardData
          :list="hotdebCardList"
          :linksByLabel="linksByLabel"
          :statusClassesByValue="HOTBED_WORK_STAGE_STYLES"
        ></CCardData>
      </section>
    </div>
    <section class="b-page__map-section">
      <CMap
        v-if="!isHotbedsLoading"
        @add-marker=""
        @edit-marker=""
        :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
        :markers="existingHotbeds"
        :shortInfoKeys="shortMarkerInfoNameKeys"
      ></CMap>
    </section>
    <CDialogConfirm
      v-model="showDeleteDialog"
      actionMainText="удалить очаг"
      actionButtonConfirmText="Удалить"
      @cancel="cancelDeleteAction"
      @confirm="confirmDeleteAction"
    />
    <PagesHotbedsEdit
      v-if="hotbed"
      v-model="editMode"
      :hotbed="hotbed"
      @hotbed-updated="editHotbed"
    />
  </main>
</template>

<script setup lang="ts">
import { mdiDeleteOutline } from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { ref } from "vue";
import { useMainStore } from "~/store/main";

const editMode = ref(false);
const showDeleteDialog = ref(false);
const store = useMainStore();
const route = useRoute();
const { HOTBED_WORK_STAGE_OPTIONS, HOTBED_WORK_STAGE_STYLES } =
  useGetStatusOptions();
const hotbed = ref<Marker>();
const hotdebCardList = ref<CardItem[]>([]);
const linksByLabel = ref({});
const existingHotbeds = ref<Marker[]>([]);
const isHotbedsLoading = ref(true);
const shortMarkerInfoNameKeys = ref<MapPopupShortInfoKeys>({
  owner: {
    name: "Владелец",
    type: "text",
  },
  landType: {
    name: "Тип земель",
    type: "text",
  },
  workStage: {
    name: "Статус работы",
    type: "status",
  },
  problemAreaType: {
    name: "Тип проблемы",
    type: "text",
  },
  eliminationMethod: {
    name: "Метод по устранению",
    type: "text",
  },
  contractingOrganisation: {
    name: "Подрядная организация",
    type: "text",
  },
});
const pageLoaded = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}
async function getHotbeds() {
  isHotbedsLoading.value = true;
  const url = `${store.apiGeospatial}/geo/info/getAll`;
  const response = await $fetch<Marker[]>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  existingHotbeds.value = response;
  isHotbedsLoading.value = false;
}
async function saveChanges(fullEditHotbed?: Marker) {
  try {
    const response = await $fetch<Marker>(
      `${store.apiGeospatial}/geo/info/${route.params.id}`,
      {
        method: "PATCH",
        headers: {
          authorization: useGetToken(),
        },
        body: fullEditHotbed || hotbed.value,
      },
    );
    hotbed.value = response;
    updateHotdedCardList();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось изменить данные очага",
    };
  }
  editMode.value = false;
}

function openDeleteDialog() {
  showDeleteDialog.value = true;
}

function cancelDeleteAction() {
  showDeleteDialog.value = false;
}

async function confirmDeleteAction() {
  await deleteHotbed();
  showDeleteDialog.value = false;
}
async function deleteHotbed() {
  await $fetch(`${store.apiGeospatial}/geo/info/${route.params.id}`, {
    method: "DELETE",
    headers: {
      authorization: useGetToken(),
    },
  });
  useState<Alert>("showAlert").value = {
    show: true,
    type: "success",
    text: "Очаг успешно удален",
  };
  navigateTo("/hotbeds");
}
async function getHotbed() {
  const response = await $fetch<Marker>(
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
async function editHotbed(hotbedData: Marker) {
  saveChanges(hotbedData);
  editMode.value = false;
}
function updateHotdedCardList() {
  hotdebCardList.value = [
    {
      label: "Статус работы",
      value: hotbed.value?.details.workStage,
      type: "status",
    },
    {
      label: "Мероприятие",
      value: hotbed.value?.relatedTaskId ? "Подробнее" : "",
      type: "link",
    },
    {
      label: "Тип земель",
      value: hotbed.value?.details.landType,
      type: "text",
    },
    {
      label: "Владелец",
      value: hotbed.value?.details.owner,
      type: "text",
    },
    {
      label: "Метод по устранению",
      value: hotbed.value?.details.eliminationMethod,
      type: "text",
    },
    {
      label: "Дата создания",
      value: date.formatDate(hotbed.value?.details?.creationDate, "DD.MM.YYYY"),
      type: "text",
    },
    {
      label: "Дата изменения",
      value: date.formatDate(hotbed.value?.details?.creationDate, "DD.MM.YYYY"),
      type: "text",
    },
  ];
}
onMounted(() => {
  getHotbed();
  getHotbeds();
});
</script>

<style scoped lang="scss">
.b-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;
  display: flex;
  flex-direction: column;
  height: 100%;
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
  .b-main-editable-card {
    background-color: var(--app-white);
    padding: 24px;
    padding-top: 0px;
    border-radius: 8px;
    flex: 1;
    max-width: 560px;
    &__header {
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
    &__fields {
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
  }
  .b-name {
    display: flex;
    align-items: center;
    gap: 8px;
    &__delete-icon {
      cursor: pointer;
    }
    @media screen and (max-width: $app-mobile) {
      max-width: 100%;
    }
  }
  &__data-card {
  }
  &__map-section {
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex: 1 1 auto;
  }
}
</style>
