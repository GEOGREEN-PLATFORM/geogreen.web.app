<template>
  <main class="b-page">
    <div v-if="!pageError">
      <div v-if="pageData.taskEvent" class="b-page__top-section">
        <div class="b-page__top-left">
          <section class="b-main-editable-card">
            <div class="b-main-editable-card__header">
              <div class="b-name">
                <input
                  type="text"
                  v-model="pageData.taskEvent.name"
                  placeholder="Введите название мероприятия"
                  class="b-name__input gg-h1"
                  @blur="saveChanges"
                />
                <span class="b-name__delete-icon" @click="openDeleteDialog">
                  <q-icon :name="mdiDeleteOutline" color="red-500" size="24px"></q-icon>
                </span>
              </div>
            </div>
            <div v-if="pageData.taskEvent" class="b-main-editable-card__content">
              <div class="b-main-editable-card__fields">
                <CInputTextarea
                  class="b-main-editable-card__comment"
                  label="Описание мероприятия"
                  v-model="pageData.taskEvent.description"
                  bg-color="transparent"
                  @blur="saveChanges"
                ></CInputTextarea>
                <div class="b-labeled-field">
                  <div class="b-labeled-field__label gg-t-big">Ответственный:</div>
                  <CInputSelect
                    v-model="pageData.taskEvent.responsibleEmployeeOption!"
                    use-input
                    @filter="filterEmployees"
                    @update:model-value="saveChanges"
                    :options="pageData.responsibleEmployeesOptions"
                    returnObj
                    height="40px"
                    class="b-labeled-field__input"
                  ></CInputSelect>
                </div>
                <div class="b-labeled-field">
                  <div class="b-labeled-field__label gg-t-big">Статус:</div>
                  <CInputSelect
                    v-model="pageData.taskEvent.statusCode"
                    @update:model-value="saveChanges"
                    :options="TASK_EVENT_STATUS_OPTIONS"
                    height="40px"
                    class="b-labeled-field__input"
                  ></CInputSelect>
                </div>
              </div>
            </div>
          </section>
          <section class="b-page__history-container">
            <div class="b-history-form">
              <CInputEditor
                class="b-history-form__editor"
                v-model="currentHistory"
                :files="currentHistoryFiles"
                @update:files="loadFilesForHistory"
              ></CInputEditor>
              <CButton
                @click="sendHistory"
                class="b-history-form__send-button"
                :icon="mdiSend"
                stretch="hug"
              ></CButton>
            </div>
          </section>
        </div>

        <section class="b-page__data-card">
          <CCardData
            :list="hotdebCardList"
            :linksByLabel="linksByLabel"
            :statusClassesByValue="TASK_EVENT_STATUS_STYLES"
          >
            <template #card-footer>
              <q-card class="b-page__card-map-container q-mt-sm">
                <CMap
                  :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
                  :markers="pageData.existingHotbeds"
                  :selectedMarker="relatedHotbed"
                  :shortInfoKeys="shortMarkerInfoNameKeys"
                  @check-detail-info="(hotbedId: string) => navigateTo(`/hotbeds/${hotbedId}`)"
                  hide-controls
                ></CMap></q-card></template
          ></CCardData>
        </section>
      </div>
      <section class="b-page__bottom-section">
        <h2 class="gg-h2">История</h2>
        <section class="b-page__history-container">
          <div class="b-history-form">
            <CInputEditor
              class="b-history-form__editor"
              v-model="currentHistory"
              :files="currentHistoryFiles"
              @update:files="loadFilesForHistory"
            ></CInputEditor>
            <CButton
              @click="sendHistory"
              class="b-history-form__send-button"
              :icon="mdiSend"
              stretch="hug"
            ></CButton>
          </div>
        </section>
        <PagesTaskEventsHistoryItem
          v-for="item in pageData.taskEventHistory"
          class="history-item"
          :key="item.id"
          :history="item"
        ></PagesTaskEventsHistoryItem>
      </section>
      <CDialogConfirm
        v-model="showDeleteDialog"
        actionMainText="удалить мероприятие"
        actionButtonConfirmText="Удалить"
        :state="deleteDialogState"
        @cancel="cancelDeleteAction"
        @confirm="confirmDeleteAction"
      />
    </div>
    <CError v-else :error="pageError" @refresh="refresh"></CError>
  </main>
</template>

<script setup lang="ts">
import { mdiDeleteOutline, mdiSend } from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { useMainStore } from "~/store/main";
import type { Employee, EmployeesRequest } from "~/types/interfaces/employees";
import type {
  TaskEvent,
  TaskEventHistory,
} from "~/types/interfaces/taskEvents";
interface TaskEventsHistoryRequest extends ServerPagination {
  content: TaskEventHistory[];
}
interface PageData {
  taskEvent: TaskEvent | null;
  responsibleEmployeesOptions: ItemOption[];
  existingHotbeds: Marker[];
  taskEventHistory: TaskEventHistory[];
  errEmployees: string | null;
  errHotbeds: string | null;
  errHistory: string | null;
}
const store = useMainStore();
const route = useRoute();
const {
  HOTBED_WORK_STAGE_STYLES,
  TASK_EVENT_STATUS_OPTIONS,
  TASK_EVENT_STATUS_STYLES,
} = useGetStatusOptions();
const { uploadPhoto } = useFiles();

const editMode = ref(false);
const showDeleteDialog = ref(false);
const currentHistoryFiles = ref<(File | ImageObj)[]>([]);
const currentHistory = ref("");
const deleteDialogState = ref<"success" | "error" | "loading">("success");
const relatedHotbed = ref<Marker>();
const hotdebCardList = ref<CardItem[]>([]);
const linksByLabel = computed<Record<string, string>>(() => ({
  Ответственный: `/for-employee/employees/${pageData.value.taskEvent?.responsibleEmployeeOption?.value}`,
  "Автор мероприятия": `/for-employee/employees/${pageData.value.taskEvent?.author?.id}`,
  Очаг: `/hotbeds/${pageData.value.taskEvent?.geoPointId}`,
}));
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
const {
  data: pageData,
  error: pageError,
  refresh,
} = await useAsyncData<PageData>(
  `task-event-page-${route.params.id}`,
  async () => {
    const taskEvent = await getTaskEvent();
    const [rEmp, rHot, rHist] = await Promise.allSettled([
      getEmployees(),
      getHotbeds(),
      getHistory(),
    ]);
    return {
      taskEvent,
      responsibleEmployeesOptions:
        rEmp.status === "fulfilled" ? rEmp.value : [],
      existingHotbeds: rHot.status === "fulfilled" ? rHot.value : [],
      taskEventHistory: rHist.status === "fulfilled" ? rHist.value : [],
      errEmployees:
        rEmp.status === "rejected"
          ? "Не удалось получить список сотрудников"
          : null,
      errHotbeds:
        rHot.status === "rejected" ? "Не удалось получить очаги проблем" : null,
      errHistory:
        rHist.status === "rejected"
          ? "Не удалось получить историю мероприятия"
          : null,
    };
  },
  {
    dedupe: "defer",
    default: () => ({
      taskEvent: null,
      responsibleEmployeesOptions: [],
      existingHotbeds: [],
      taskEventHistory: [],
      errEmployees: null,
      errHotbeds: null,
      errHistory: null,
    }),
  },
);
if (pageData.value) {
  if (pageData.value?.taskEvent) {
    updateTaskEventCardList();
    await getRelatedHotbed();
  }
  if (pageData.value.errEmployees) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: pageData.value.errEmployees,
    };
  }
  if (pageData.value.errHotbeds) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: pageData.value.errHotbeds,
    };
  }
  if (pageData.value.errHistory) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: pageData.value.errHistory,
    };
  }
}

async function getTaskEvent() {
  try {
    const response = await $fetch<TaskEvent>(
      `${store.apiV1}/event/${route.params.id}`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
      },
    );
    return {
      ...response,
      responsibleEmployeeOption: {
        name: `${response.operator?.lastName} ${response.operator?.firstName} ${response.operator?.patronymic}`,
        value: response.operator?.id,
      },
    };
  } catch (error: any) {
    console.error(error);
    throw new AppError("Не удалось получить мероприятие", {
      statusCode: error.response.status,
    });
  }
}
async function getEmployees(search?: string) {
  const res = await $fetch<EmployeesRequest>(`${store.apiV1}/user/search`, {
    method: "GET",
    headers: {
      authorization: useGetToken(),
    },
    params: {
      page: 0,
      size: 1000,
      role: "operator",
      search: search,
    },
  });
  return res.users.map((user: Employee) => ({
    name: `${user.lastName} ${user.firstName} ${user.patronymic}`,
    value: user.id,
  }));
}
async function getHotbeds() {
  const url = `${store.apiV1}/geo/info/getAll`;
  const response = await $fetch<Marker[]>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  return response;
}
async function loadFilesForHistory(files: (File | ImageObj)[]) {
  const localFiles = files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file instanceof File) {
      localFiles[i] = await uploadPhoto(file);
    }
  }
  currentHistoryFiles.value = localFiles;
}
async function sendHistory() {
  try {
    await $fetch(`${store.apiV1}/event/${route.params.id}/history`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        recordType: "Наблюдение",
        recordDate: new Date().toISOString(),
        description: currentHistory.value,
        photos: currentHistoryFiles.value,
        operatorId: store.user?.id,
      },
    });
    currentHistory.value = "";
    currentHistoryFiles.value = [];
    try {
      pageData.value.taskEventHistory = await getHistory();
    } catch (error: any) {
      console.error(error);
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: "Нe удалось получить историю мероприятия",
      };
    }
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Нe удалось обновить историю",
    };
  }
}
async function getHistory() {
  const response = await $fetch<TaskEventsHistoryRequest>(
    `${store.apiV1}/event/${route.params.id}/history`,
    {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  return response.content;
}
async function getRelatedHotbed() {
  try {
    const response = await $fetch<Marker>(
      `${store.apiV1}/geo/info/${pageData.value.taskEvent?.geoPointId}`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
      },
    );
    relatedHotbed.value = response;
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Нe удалось получить очаг проблемы, связанный с мероприятием",
    };
  }
}
async function saveChanges() {
  try {
    const response = await $fetch<TaskEvent>(
      `${store.apiV1}/event/${route.params.id}`,
      {
        method: "PATCH",
        headers: {
          authorization: useGetToken(),
        },
        body: {
          statusCode: pageData.value.taskEvent?.statusCode,
          name: pageData.value.taskEvent?.name,
          endDate: pageData.value.taskEvent?.endDate,
          description: pageData.value.taskEvent?.description,
          operatorId:
            pageData.value.taskEvent?.responsibleEmployeeOption?.value,
        },
      },
    );
    pageData.value.taskEvent = {
      ...response,
      responsibleEmployeeOption: {
        name: `${response.operator?.lastName} ${response.operator?.firstName} ${response.operator?.patronymic}`,
        value: response.operator?.id,
      },
    };
    editMode.value = false;
    updateTaskEventCardList();
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось изменить данные мероприятия",
    };
  }
}

function openDeleteDialog() {
  showDeleteDialog.value = true;
}

function cancelDeleteAction() {
  showDeleteDialog.value = false;
}

async function confirmDeleteAction() {
  await deleteTaskEvent();
}
async function deleteTaskEvent() {
  try {
    deleteDialogState.value = "loading";
    await $fetch(`${store.apiV1}/event/${route.params.id}`, {
      method: "DELETE",
      headers: {
        authorization: useGetToken(),
      },
    });
    deleteDialogState.value = "success";
    showDeleteDialog.value = false;
    useState<Alert>("showAlert").value = {
      show: true,
      type: "success",
      text: "Мероприятие успешно удалено",
    };
    navigateTo("/for-employee/task-events");
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось удалить мероприятие",
    };
    deleteDialogState.value = "error";
  }
}
async function filterEmployees(search: string) {
  try {
    pageData.value.responsibleEmployeesOptions = await getEmployees(search);
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Нe удалось получить список сотрудников",
    };
  }
}
function updateTaskEventCardList() {
  hotdebCardList.value = [
    {
      label: "Статус",
      value: pageData.value.taskEvent?.statusCode,
      type: "status",
    },
    {
      label: "Ответственный",
      value: pageData.value.taskEvent?.operator?.id
        ? `${pageData.value.taskEvent.operator?.lastName} ${pageData.value.taskEvent.operator?.firstName} ${pageData.value.taskEvent.operator?.patronymic}`
        : "",
      type: "link",
    },
    {
      label: "Автор мероприятия",
      value: pageData.value.taskEvent?.author?.id
        ? `${pageData.value.taskEvent.author?.lastName} ${pageData.value.taskEvent.author?.firstName} ${pageData.value.taskEvent.author?.patronymic}`
        : "",
      type: "link",
    },
    {
      label: "Дата создания",
      value: pageData.value.taskEvent?.startDate
        ? date.formatDate(
            new Date(pageData.value.taskEvent.startDate),
            "DD.MM.YYYY",
          )
        : "",
      type: "text",
    },
    {
      label: "Ожидаемая дата завершения",
      value: pageData.value.taskEvent?.endDate
        ? date.formatDate(
            new Date(pageData.value.taskEvent.endDate),
            "DD.MM.YYYY",
          )
        : "",
      type: "text",
    },
    {
      label: "Дата изменения",
      value: pageData.value.taskEvent?.lastUpdateDate
        ? date.formatDate(
            new Date(pageData.value.taskEvent.lastUpdateDate),
            "DD.MM.YYYY",
          )
        : "",
      type: "text",
    },
    {
      label: "Очаг",
      value: pageData.value.taskEvent?.geoPointId ? "Подробнее" : "",
      type: "link",
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
    gap: 48px;
    justify-content: space-between;
    margin-bottom: 24px;
    @media screen and (max-width: $app-laptop) {
      flex-direction: column;
    }
  }
  &__top-left {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  &__card-map-container {
    height: 220px;
    border-radius: 12px !important;
    overflow: hidden;
  }
  &__history-container {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    width: 100%;
    max-width: 900px;
    @media screen and (max-width: $app-laptop) {
      display: none;
    }
  }
  .b-history-form {
    display: flex;
    gap: 24px;
    align-items: center;
    flex: 1 1 auto;
    width: 100%;
    max-width: 100%;
    &__editor {
      width: calc(100% - 50px - 24px);
      max-width: calc(100% - 50px - 24px);
    }
    &__send-button {
      min-width: max-content;
    }
  }
  &__bottom-section {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    .history-item {
      margin: 32px 0px 48px 0px;
    }
    .b-page__history-container {
      display: none;
      @media screen and (max-width: $app-laptop) {
        display: block;
      }
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
    .b-labeled-field {
      display: flex;
      min-height: 64px;
      height: 64px;
      align-items: center;

      gap: 12px;

      &__label {
        min-width: 196px;
        color: var(--app-grey-300);
        @media screen and (max-width: $app-mobile) {
          min-width: 140px;
          width: 140px;
          font-size: 14px;
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
        max-width: calc(100% - 196px);
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
    width: 100%;
    &__input {
      background: transparent;
      border: none;
      padding: 4px 0;
      outline: none;
      width: 100%;
      border-bottom: 1px solid var(--app-grey-300);
      color: var(--app-grey-500);
      transition: border-color 0.3s ease;
      &:hover {
        border-bottom: 1px solid var(--app-green-300);
      }
      &:focus {
        border-bottom: 1px solid var(--app-green-500);
      }
      &[readonly] {
        cursor: default;
      }
    }
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
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex: 1 1 auto;
  }
}
</style>
