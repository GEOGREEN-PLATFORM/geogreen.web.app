<template>
  <main class="b-page">
    <header class="b-header q-mb-lg">
      <div class="b-header__title-wrapper">
        <h1 class="b-header__title gg-h1">Мероприятия</h1>
        <div v-if="store.user?.role === 'admin'" class="b-header__add-btn">
          <CButton
            @click="openTaskEventDialog"
            label="Добавить мероприятие"
            size="medium"
          ></CButton>
        </div>
        <div v-if="store.user?.role === 'admin'" class="b-header__add-btn--mobile">
          <CButton
            @click="openTaskEventDialog"
            :icon="mdiPlus"
            iconColor="var(--app-white)"
            stretch="hug"
          ></CButton>
        </div>
      </div>
      <div class="b-header__search">
        <CInput
          v-model="searchTaskEventStr"
          @update:model-value="searchTaskEvent"
          label="Поиск мероприятия"
          hideBottomSpace
          height="48px"
          :required="false"
        >
          <template #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </CInput>
      </div>
    </header>
    <section class="b-page__content">
      <div class="b-filter q-mb-lg">
        <CFilter
          v-model="filters"
          @apply-filters="getTaskEvents"
          @reset-filters="getTaskEvents"
          @update-data-for-item="updateDataForFilterItem"
        ></CFilter>
      </div>
      <div class="b-table">
        <CTable
          :columns="tableHeaders"
          :rows="tableRows"
          v-model:pagination="pagination"
          row-key="name"
          :slots="['statusCode']"
          @click:row="(row: any) => goToTaskEvent(row.id)"
          @updateTable="getTaskEvents"
          :loading="taskEventsLoading"
        >
          <template v-slot:body-cell-statusCode="slotProps">
            <div
              class="b-status-coniainter gg-t-small"
              :class="
                TASK_EVENT_STATUS_STYLES[
                  slotProps.row.statusCode as keyof typeof TASK_EVENT_STATUS_STYLES
                ]
              "
            >
              {{ slotProps.row.statusCode }}
            </div>
          </template>
        </CTable>
      </div>
    </section>
    <PagesTaskEventsAdd
      v-model="isTaskEventDialogOpen"
      :hotbeds="existingHotbeds"
      :employeesOptions="addDialogEmployeesOptions"
      @taskEventCreated="handleTaskEventCreated"
      @filterEmployees="searchEmployeesByName"
    />
  </main>
</template>

<script setup lang="ts">
import { mdiMagnify, mdiPlus } from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { useMainStore } from "~/store/main";
import type { Employee, EmployeesRequest } from "~/types/interfaces/employees";
import type { TaskEvent, TaskEventData } from "~/types/interfaces/taskEvents";

interface TaskEventsRequest extends ServerPagination {
  content: TaskEvent[];
}
const store = useMainStore();
const debounce = useDebounce();
const { TASK_EVENT_STATUS_OPTIONS, TASK_EVENT_STATUS_STYLES } =
  useGetStatusOptions();

const existingHotbeds = ref<Marker[]>([]);
const addDialogEmployeesOptions = ref<ItemOption[]>([]);
const searchTaskEventStr = ref("");
const taskEventsLoading = ref(true);
const isTaskEventDialogOpen = ref(false);
const taskEvents = ref<TaskEvent[]>([]);
const pagination = ref<TablePagination>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const tableHeaders: TableHeader[] = [
  {
    name: "name",
    align: "left",
    label: "Название",
    field: "name",
  },
  {
    name: "description",
    align: "left",
    label: "Описание",
    field: "description",
  },
  {
    name: "statusCode",
    align: "center",
    label: "Статус",
    field: "statusCode",
  },
  {
    name: "operatorName",
    align: "left",
    label: "Ответственный",
    field: "operatorName",
  },
  {
    name: "startDate",
    align: "right",
    label: "Дата создания",
    field: "startDate",
  },
  {
    name: "lastUpdateDate",
    align: "right",
    label: "Дата последнего изменения",
    field: "lastUpdateDate",
  },
  {
    name: "endDate",
    align: "right",
    label: "Ожидаемая дата завершения",
    field: "endDate",
  },
];
const tableRows: ComputedRef<TableRow[]> = computed(() =>
  taskEvents.value.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    statusCode: TASK_EVENT_STATUS_OPTIONS.find((o) => o.value === e.statusCode)
      ?.name,
    operatorName: `${e.operator?.lastName} ${e.operator?.firstName} ${e.operator?.patronymic}`,
    startDate: date.formatDate(new Date(e.startDate), "DD.MM.YYYY"),
    lastUpdateDate: date.formatDate(new Date(e.lastUpdateDate), "DD.MM.YYYY"),
    endDate: date.formatDate(new Date(e.endDate), "DD.MM.YYYY"),
  })),
);
const filters = ref<FilterItem[]>([
  {
    type: "select",
    key: "status",
    label: "Статус",
    selected: "",
    data: TASK_EVENT_STATUS_OPTIONS,
  },
  {
    type: "select",
    key: "operatorId",
    selected: "",
    label: "Ответственный",
    useInput: true,
    data: [],
  },
  {
    type: "date-range",
    key: "startDate",
    selected: "",
    label: "Период создания",
  },
  {
    type: "date-range",
    key: "updateDate",
    selected: "",
    label: "Период изменения",
  },
  {
    type: "date-range",
    key: "endDate",
    selected: "",
    label: "Период завершения",
  },
]);
async function handleTaskEventCreated(newTaskEvent: TaskEventData) {
  try {
    await $fetch(`${store.apiEventManager}/events`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        geoPointId: newTaskEvent.relatedHotbedId,
        name: newTaskEvent.name,
        description: newTaskEvent.description,
        endDate: newTaskEvent.expectedDateEnd,
        operatorId: newTaskEvent.responsibleEmployee?.value,
        authorId: store.user?.id,
        eventType: "Наблюдение",
        problemAreaType: "Борщевик",
        startDate: new Date().toISOString(),
      },
    });
    getTaskEvents();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось создать мероприятие",
    };
  }
}
async function getEmployees(
  reqSource?: "filter" | "addDialog",
  search?: string,
) {
  try {
    const res = await $fetch<EmployeesRequest>(`${store.apiAuth}/user`, {
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
    if (reqSource === "filter" && filters.value[1].type === "select") {
      filters.value[1].data = formatEmployeesToOptions(res.users || []);
    } else if (reqSource === "addDialog") {
      addDialogEmployeesOptions.value = formatEmployeesToOptions(
        res.users || [],
      );
    }
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Нe удалось получить сотрудников",
    };
  }
}
function formatEmployeesToOptions(employees: Employee[]): ItemOption[] {
  return employees.map((e) => ({
    name: `${e.lastName} ${e.firstName} ${e.patronymic}`,
    value: e.id,
  }));
}
function searchEmployeesByName(name: string) {
  getEmployees("addDialog", name);
}
function updateDataForFilterItem(key: string, value: string) {
  if (key === "operatorId") {
    getEmployees("filter", value);
  }
}
async function getTaskEvents() {
  taskEventsLoading.value = true;
  const params = new URLSearchParams();
  if (searchTaskEventStr.value) {
    params.append("search", searchTaskEventStr.value);
  }
  if (filters.value[0].selected) {
    params.append("status", filters.value[0].selected as string);
  }
  if (filters.value[1].selected) {
    params.append("operatorId", filters.value[1].selected as string);
  }
  if (
    filters.value[2].selected &&
    typeof filters.value[2].selected === "string"
  ) {
    params.append("startFirstDate", filters.value[2].selected);
    params.append("startSecondDate", filters.value[2].selected);
  } else {
    const { from, to } = filters.value[2].selected as {
      from: string | null;
      to: string | null;
    };
    if (from) {
      params.append("startFirstDate", from);
    }
    if (to) {
      params.append("startSecondDate", to);
    }
  }
  if (
    filters.value[4].selected &&
    typeof filters.value[4].selected === "string"
  ) {
    params.append("endFirstDate", filters.value[4].selected);
    params.append("endSecondDate", filters.value[4].selected);
  } else {
    const { from, to } = filters.value[4].selected as {
      from: string | null;
      to: string | null;
    };
    if (from) {
      params.append("endFirstDate", from);
    }
    if (to) {
      params.append("endSecondDate", to);
    }
  }
  if (
    filters.value[3].selected &&
    typeof filters.value[3].selected === "string"
  ) {
    params.append("updateFirstDate", filters.value[3].selected);
    params.append("updateSecondDate", filters.value[3].selected);
  } else {
    const { from, to } = filters.value[3].selected as {
      from: string | null;
      to: string | null;
    };
    if (from) {
      params.append("updateFirstDate", from);
    }
    if (to) {
      params.append("updateSecondDate", to);
    }
  }
  params.append("page", String(pagination.value.page - 1));
  params.append("size", String(pagination.value.rowsPerPage));
  const url = `${store.apiEventManager}/events/getAll?${params.toString()}`;
  const response = await $fetch<TaskEventsRequest>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  taskEvents.value = response.content;
  pagination.value.rowsNumber = response.totalItems;
  taskEventsLoading.value = false;
}
async function getHotbeds() {
  const url = `${store.apiGeospatial}/geo/info/getAll`;
  const response = await $fetch<Marker[]>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  existingHotbeds.value = response;
}
function searchTaskEvent() {
  debounce(getTaskEvents, 500, "searchTaskEvent");
}
function openTaskEventDialog() {
  isTaskEventDialogOpen.value = true;
}
function goToTaskEvent(id: string) {
  navigateTo(`/for-employee/task-events/${id}`);
}
onMounted(() => {
  getTaskEvents();
  getEmployees();
  getHotbeds();
});
</script>

<style scoped lang="scss">
.b-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;
  padding: 24px 32px;
  .b-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
    @media screen and (max-width: $app-laptop) {
      flex-wrap: wrap;
      gap: 16px;
    }
    &__title-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      @media screen and (max-width: $app-mobile) {
        justify-content: center;
        gap: 24px;
      }
    }
    &__add-btn {
      width: 40%;
      max-width: 288px;
      min-width: max-content;
      &--mobile {
        display: none;
      }
      @media screen and (max-width: $app-mobile) {
        display: none;
        &--mobile {
          display: block;
        }
      }
    }
    &__search {
      width: 60%;
      max-width: 412px;
      @media screen and (max-width: $app-mobile) {
        width: 100%;
        max-width: 100%;
      }
    }
  }
  .b-status-coniainter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    margin: 0 auto;
    height: 32px;
    padding: 4px 16px;
    border-radius: 16px;
    color: var(--app-white);
  }
}
</style>
