<template>
  <main class="b-page">
    <div v-if="pageLoaded && taskEvent" class="b-page__top-section">
      <div class="b-page__top-left">
        <section class="b-main-editable-card">
          <div class="b-main-editable-card__header">
            <div class="b-name">
              <input
                type="text"
                v-model="taskEvent.name"
                placeholder="Введите название мероприятия"
                class="b-name__input gg-h1"
                @blur="
                  () => {
                    store.user?.role === 'admin' && saveChanges();
                  }
                "
                :readonly="store.user?.role !== 'admin'"
              />
              <span
                v-if="store.user?.role === 'admin'"
                class="b-name__delete-icon"
                @click="openDeleteDialog"
              >
                <q-icon :name="mdiDeleteOutline" color="red-500" size="24px"></q-icon>
              </span>
            </div>
          </div>
          <div v-if="pageLoaded && taskEvent" class="b-main-editable-card__content">
            <div class="b-main-editable-card__fields">
              <CInputTextarea
                class="b-main-editable-card__comment"
                label="Описание мероприятия"
                v-model="taskEvent.description"
                bg-color="transparent"
                @blur="saveChanges"
                :readonly="store.user?.role !== 'admin'"
              ></CInputTextarea>
              <div class="b-labeled-field">
                <div class="b-labeled-field__label gg-t-big">Ответственный:</div>
                <CInputSelect
                  v-model="taskEvent.responsibleEmployeeOption!"
                  use-input
                  @filter="filterEmployees"
                  @update:model-value="saveChanges"
                  :options="responsibleEmployeesOptions"
                  returnObj
                  height="40px"
                  class="b-labeled-field__input"
                  :readonly="store.user?.role !== 'admin'"
                ></CInputSelect>
              </div>
              <div class="b-labeled-field">
                <div class="b-labeled-field__label gg-t-big">Статус:</div>
                <CInputSelect
                  v-model="taskEvent.statusCode"
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
            <div class="b-page__card-map-container q-mt-sm">
              <CMap
                v-if="!isHotbedsLoading"
                :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
                :markers="existingHotbeds"
                :selectedMarker="relatedHotbed"
                :shortInfoKeys="shortMarkerInfoNameKeys"
                hide-controls
              ></CMap></div></template
        ></CCardData>
      </section>
    </div>
    <section class="b-page__bottom-section">
      <h2 class="gg-h2">История</h2>
      <PagesTaskEventsHistoryItem
        v-for="item in taskEventHistory"
        class="history-item"
        :key="item.id"
        :history="item"
      ></PagesTaskEventsHistoryItem>
    </section>
    <CDialogConfirm
      v-model="showDeleteDialog"
      actionMainText="удалить мероприятие"
      actionButtonConfirmText="Удалить"
      @cancel="cancelDeleteAction"
      @confirm="confirmDeleteAction"
    />
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
const taskEvent = ref<TaskEvent>();
const currentHistoryFiles = ref<(File | ImageObj)[]>([]);
const currentHistory = ref("");
const taskEventHistory = ref<TaskEventHistory[]>([]);
const relatedHotbed = ref<Marker>();
const pageLoaded = ref(false);
const hotdebCardList = ref<CardItem[]>([]);
const linksByLabel = computed<Record<string, string>>(() => ({
  Ответственный: `/for-employee/employees/${taskEvent.value?.responsibleEmployeeOption?.value}`,
  "Автор мероприятия": `/for-employee/employees/${taskEvent.value?.author?.id}`,
  Очаг: `/hotbeds/${taskEvent.value?.geoPointId}`,
}));
const existingHotbeds = ref<Marker[]>([]);
const responsibleEmployeesOptions = ref<ItemOption[]>([]);
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
async function getEmployees(search?: string) {
  try {
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
    responsibleEmployeesOptions.value = res.users.map((user: Employee) => ({
      name: `${user.lastName} ${user.firstName} ${user.patronymic}`,
      value: user.id,
    }));
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Нe удалось получить сотрудников",
    };
  }
}
async function getHotbeds() {
  isHotbedsLoading.value = true;
  const url = `${store.apiV1}/geo/info/getAll`;
  const response = await $fetch<Marker[]>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  existingHotbeds.value = response;
  isHotbedsLoading.value = false;
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
    getHistory();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Нe удалось отправить комментарии",
    };
  }
}
async function getHistory() {
  try {
    const response = await $fetch<TaskEventsHistoryRequest>(
      `${store.apiV1}/event/${route.params.id}/history`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
      },
    );
    taskEventHistory.value = response.content;
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Нe удалось получить комментарии",
    };
  }
}
async function getRelatedHotbed() {
  const response = await $fetch<Marker>(
    `${store.apiV1}/geo/info/${taskEvent.value?.geoPointId}`,
    {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  relatedHotbed.value = response;
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
          statusCode: taskEvent.value?.statusCode,
          name: taskEvent.value?.name,
          endDate: taskEvent.value?.endDate,
          description: taskEvent.value?.description,
          operatorId: taskEvent.value?.responsibleEmployeeOption?.value,
        },
      },
    );
    taskEvent.value = {
      ...response,
      responsibleEmployeeOption: {
        name: `${response.operator?.lastName} ${response.operator?.firstName} ${response.operator?.patronymic}`,
        value: response.operator?.id,
      },
    };
    updateTaskEventCardList();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось изменить данные мероприятия",
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
  await deleteTaskEvent();
  showDeleteDialog.value = false;
}
async function deleteTaskEvent() {
  await $fetch(`${store.apiV1}/event/${route.params.id}`, {
    method: "DELETE",
    headers: {
      authorization: useGetToken(),
    },
  });
  useState<Alert>("showAlert").value = {
    show: true,
    type: "success",
    text: "Мероприятие успешно удалено",
  };
  navigateTo("/for-employee/task-events");
}
function filterEmployees(search: string) {
  getEmployees(search);
}
async function getTaskEvent() {
  const response = await $fetch<TaskEvent>(
    `${store.apiV1}/event/${route.params.id}`,
    {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  taskEvent.value = {
    ...response,
    responsibleEmployeeOption: {
      name: `${response.operator?.lastName} ${response.operator?.firstName} ${response.operator?.patronymic}`,
      value: response.operator?.id,
    },
  };
  updateTaskEventCardList();
  await getRelatedHotbed();
  pageLoaded.value = true;
}
function updateTaskEventCardList() {
  hotdebCardList.value = [
    {
      label: "Статус",
      value: taskEvent.value?.statusCode,
      type: "status",
    },
    {
      label: "Ответственный",
      value: taskEvent.value?.operator?.id
        ? `${taskEvent.value.operator?.lastName} ${taskEvent.value.operator?.firstName} ${taskEvent.value.operator?.patronymic}`
        : "",
      type: "link",
    },
    {
      label: "Автор мероприятия",
      value: taskEvent.value?.author?.id
        ? `${taskEvent.value.author?.lastName} ${taskEvent.value.author?.firstName} ${taskEvent.value.author?.patronymic}`
        : "",
      type: "link",
    },
    {
      label: "Дата создания",
      value: taskEvent.value?.startDate
        ? date.formatDate(new Date(taskEvent.value.startDate), "DD.MM.YYYY")
        : "",
      type: "text",
    },
    {
      label: "Ожидаемая дата завершения",
      value: taskEvent.value?.endDate
        ? date.formatDate(new Date(taskEvent.value.endDate), "DD.MM.YYYY")
        : "",
      type: "text",
    },
    {
      label: "Дата изменения",
      value: taskEvent.value?.lastUpdateDate
        ? date.formatDate(
            new Date(taskEvent.value.lastUpdateDate),
            "DD.MM.YYYY",
          )
        : "",
      type: "text",
    },
    {
      label: "Очаг",
      value: taskEvent.value?.geoPointId ? "Подробнее" : "",
      type: "link",
    },
  ];
}
onMounted(() => {
  getTaskEvent();
  getHotbeds();
  getEmployees();
  getHistory();
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
    .history-item {
      margin: 32px 0px 48px 0px;
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
        max-width: calc(100% - 196px);
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
