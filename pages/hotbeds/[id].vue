<template>
  <main class="b-page">
    <div v-if="!pageError">
      <div class="b-page__top-section">
        <section class="b-main-editable-card">
          <div class="b-main-editable-card__header">
            <div class="b-name">
              <div class="gg-h1">{{ pageData.hotbed?.details?.problemAreaType }}</div>
              <span class="b-name__delete-icon" @click="openDeleteDialog">
                <q-icon :name="mdiDeleteOutline" color="red-500" size="24px"></q-icon>
              </span>
            </div>
          </div>
          <div v-if="pageData.hotbed" class="b-main-editable-card__content">
            <div class="b-main-editable-card__fields">
              <CInputTextarea
                class="b-main-editable-card__comment"
                placeholder="Оставьте комментарий по очагу"
                v-model="pageData.hotbed.details.comment"
                bg-color="transparent"
                @blur="saveChanges()"
              ></CInputTextarea>
              <div class="b-labeled-field">
                <div class="b-labeled-field__label gg-t-big">Мероприятие:</div>
                <CInputSelect
                  v-model="pageData.hotbed.relatedTaskId"
                  disabled
                  :options="[]"
                  height="40px"
                  class="b-labeled-field__input"
                ></CInputSelect>
              </div>
              <div class="b-labeled-field">
                <div class="b-labeled-field__label gg-t-big">Статус работы:</div>
                <CInputSelect
                  v-model="pageData.hotbed.details.workStage"
                  @update:model-value="saveChanges()"
                  height="40px"
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
        <q-card>
          <CMap
            v-if="pageData.hotbed"
            :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
            :markers="pageData.existingHotbeds"
            :selected-marker="pageData.hotbed"
            :non-checkable-markers="[pageData.hotbed.id]"
            :shortInfoKeys="shortMarkerInfoNameKeys"
          ></CMap
        ></q-card>
      </section>
      <CDialogConfirm
        v-model="showDeleteDialog"
        actionMainText="удалить очаг"
        actionButtonConfirmText="Удалить"
        :state="deleteDialogState"
        @cancel="cancelDeleteAction"
        @confirm="confirmDeleteAction"
      />
      <PagesHotbedsEdit
        v-if="pageData.hotbed"
        v-model="editMode"
        :hotbed="pageData.hotbed"
        @hotbed-updated="editHotbed"
        :edit-state="fullDataEditState"
      />
    </div>
    <CError v-else :error="pageError" @refresh="refresh"></CError>
  </main>
</template>

<script setup lang="ts">
import { mdiDeleteOutline } from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { useMainStore } from "~/store/main";

interface PageData {
  hotbed: Marker | null;
  existingHotbeds: Marker[];
}

const { HOTBED_WORK_STAGE_OPTIONS, HOTBED_WORK_STAGE_STYLES } =
  useGetStatusOptions();
const store = useMainStore();
const route = useRoute();
const editMode = ref(false);
const showDeleteDialog = ref(false);
const hotdebCardList = ref<CardItem[]>([]);
const linksByLabel = ref<Record<string, string>>({});
const initialHotbed = ref<Marker | null>(null);
const fullDataEditState = shallowRef<"success" | "error" | "loading">(
  "success",
);
const deleteDialogState = shallowRef<"success" | "error" | "loading">(
  "success",
);
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

function toggleEditMode() {
  editMode.value = !editMode.value;
}
const {
  data: pageData,
  error: pageError,
  refresh,
} = await useAsyncData<PageData>(
  `hotbed-page-${route.params.id}`,
  async () => {
    const [hotbed, existingHotbeds] = await Promise.all([
      getHotbed(),
      getHotbeds(),
    ]);
    return { hotbed, existingHotbeds };
  },
  {
    dedupe: "defer",
    default: () => ({
      hotbed: null,
      existingHotbeds: [] as Marker[],
    }),
  },
);
if (pageData.value.hotbed) {
  initialHotbed.value = structuredClone(toRaw(pageData.value.hotbed));
  updateHotdedCardList();
}
async function getHotbeds() {
  try {
    const url = `${store.apiV1}/geo/info/getAll`;
    const response = await $fetch<Marker[]>(url, {
      method: "GET",
      headers: { Authorization: useGetToken() },
    });
    return response;
  } catch (error: any) {
    console.error(error);
    throw new AppError("Не удалось получить данные очага", {
      statusCode: error.response.status,
    });
  }
}

async function getHotbed() {
  try {
    const response = await $fetch<Marker>(
      `${store.apiV1}/geo/info/${route.params.id}`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
      },
    );
    return response;
  } catch (error: any) {
    console.error(error);
    throw new AppError("Не удалось получить данные очага", {
      statusCode: error.response.status,
    });
  }
}
async function saveChanges(fullEditHotbed?: Marker) {
  try {
    fullDataEditState.value = "loading";
    const response = await $fetch<Marker>(
      `${store.apiV1}/geo/info/${route.params.id}`,
      {
        method: "PATCH",
        headers: {
          authorization: useGetToken(),
        },
        body: fullEditHotbed || pageData.value.hotbed,
      },
    );
    pageData.value.hotbed = response;
    updateHotdedCardList();
    editMode.value = false;
    fullDataEditState.value = "success";
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось изменить данные очага",
    };
    pageData.value.hotbed = structuredClone(toRaw(initialHotbed.value));
    fullDataEditState.value = "error";
  }
}

function openDeleteDialog() {
  showDeleteDialog.value = true;
}

function cancelDeleteAction() {
  showDeleteDialog.value = false;
}

async function confirmDeleteAction() {
  await deleteHotbed();
}
async function deleteHotbed() {
  try {
    deleteDialogState.value = "loading";
    await $fetch(`${store.apiV1}/geo/info/${route.params.id}`, {
      method: "DELETE",
      headers: {
        authorization: useGetToken(),
      },
    });
    showDeleteDialog.value = false;
    deleteDialogState.value = "success";
    useState<Alert>("showAlert").value = {
      show: true,
      type: "success",
      text: "Очаг успешно удален",
    };
    navigateTo("/hotbeds");
  } catch (error: any) {
    console.error(error);
    deleteDialogState.value = "error";
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось удалить очаг",
    };
  }
}
async function editHotbed(hotbedData: Marker) {
  saveChanges(hotbedData);
}
function updateHotdedCardList() {
  hotdebCardList.value = [
    {
      label: "Статус работы",
      value: pageData.value.hotbed?.details.workStage,
      type: "status",
    },
    {
      label: "Мероприятие",
      value: pageData.value.hotbed?.relatedTaskId ? "Подробнее" : "",
      type: "link",
    },
    {
      label: "Тип земель",
      value: pageData.value.hotbed?.details.landType,
      type: "text",
    },
    {
      label: "Владелец",
      value: pageData.value.hotbed?.details.owner,
      type: "text",
    },
    {
      label: "Метод по устранению",
      value: pageData.value.hotbed?.details.eliminationMethod,
      type: "text",
    },
    {
      label: "Дата создания",
      value: date.formatDate(
        pageData.value.hotbed?.details?.creationDate,
        "DD.MM.YYYY",
      ),
      type: "text",
    },
    {
      label: "Дата изменения",
      value: date.formatDate(
        pageData.value.hotbed?.details?.creationDate,
        "DD.MM.YYYY",
      ),
      type: "text",
    },
  ];
}
</script>

<style scoped lang="scss">
.b-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;
  display: flex;
  flex-direction: column;
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
      @media screen and (max-width: $app-mobile) {
        gap: 12px;
      }
      &__label {
        min-width: 196px;
        color: var(--app-grey-300);
        @media screen and (max-width: $app-mobile) {
          min-width: 140px;
          width: 140px;
          overflow-wrap: break-word;
          font-size: 14px;
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
        @media screen and (max-width: $app-mobile) {
          margin-left: 0px;
          max-width: calc(100% - 140px - 12px);
        }
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
    @media screen and (max-width: $app-laptop) {
      display: flex;
      justify-content: center;
    }
  }
  &__map-section {
    display: flex;
    div {
      border-radius: 8px;
      overflow: hidden;
      width: 100%;
      display: flex;
      flex: 1 1 auto;
      min-height: 500px;
      height: 600px;
      max-height: calc(100dvh - 64px - 24px);
      @media screen and (max-width: $app-mobile) {
        min-height: calc(100dvh - 64px - 24px);
      }
    }
  }
}
</style>
