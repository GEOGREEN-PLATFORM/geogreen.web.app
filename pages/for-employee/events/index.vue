<template>
  <main class="b-page">
    <header class="b-header q-mb-lg">
      <div class="b-header__title-wrapper">
        <h1 class="b-header__title gg-h1">Мероприятия</h1>
        <div class="b-header__add-btn">
          <CButton
            @click="openTaskEventDialog"
            label="Добавить мероприятие"
            size="medium"
          ></CButton>
        </div>
        <div class="b-header__add-btn--mobile">
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
        ></CFilter>
      </div>
      <div class="b-table">
        <CTable
          :columns="tableHeaders"
          :rows="tableRows"
          v-model:pagination="pagination"
          row-key="name"
          :slots="['workStage']"
          @click:row="(row: any) => goToTaskEvent(row.id)"
          @updateTable="getTaskEvents"
          :loading="taskEventsLoading"
        >
          <template v-slot:body-cell-workStage="slotProps">
            <div
              class="b-status-coniainter gg-t-small"
              :class="
                taskEvent_WORK_STAGE_STYLES[
                  slotProps.row.workStage as keyof typeof taskEvent_WORK_STAGE_STYLES
                ]
              "
            >
              {{ slotProps.row.workStage }}
            </div>
          </template>
        </CTable>
      </div>
    </section>
    <PagesTaskEventsAdd
      v-model="isTaskEventDialogOpen"
      :hotbeds="existingHotbeds"
      @taskEventCreated="handleTaskEventCreated"
    />
  </main>
</template>

<script setup lang="ts">
import { mdiMagnify, mdiPlus } from "@quasar/extras/mdi-v6";
import type { Coordinate } from "ol/coordinate";
import { date } from "quasar";
import { useMainStore } from "~/store/main";

interface TaskEventPageRequest {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  content: TaskEvent[];
}
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const store = useMainStore();
const existingHotbeds = ref<Marker[]>([]);
const debounce = useDebounce();
const { EVENT_STATUS_OPTIONS, EVENT_STATUS_STYLES } = useGetStatusOptions();
const tableHeaders: TableHeader[] = [
  {
    name: "name",
    align: "left",
    label: "Название",
    field: "name",
  },
  {
    name: "description",
    align: "center",
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
const taskEvents = ref<TaskEvent[]>([]);
const tableRows: ComputedRef<TableRow[]> = computed(() =>
  taskEvents.value.map((e) => ({
    id: e.id,
    problemAreaType: e.details?.problemAreaType,
    workStage: e.details?.workStage,
    landType: e.details?.landType,
    owner: e.details?.owner,
    eliminationMethod: e.details?.eliminationMethod,
    // dateCreated: date.formatDate(e.details?.dateCreated, "DD.MM.YYYY"),
    // dateUpdated: date.formatDate(e.details?.dateUpdated, "DD.MM.YYYY"),
  })),
);
const filters = ref<FilterItem[]>([
  {
    type: "select",
    key: "status",
    label: "Статус",
    selected: "",
    data: EVENT_STATUS_OPTIONS,
  },
  {
    type: "select",
    key: "operatorId",
    selected: "",
    label: "Ответственный",
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
const searchTaskEventStr = ref("");
const taskEventsLoading = ref(true);
const isTaskEventDialogOpen = ref(false);
async function handleTaskEventCreated(newTaskEvent: TaskEventData) {
  try {
    await $fetch(`${store.apiGeospatial}/geo/info`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        coordinate: newTaskEvent.coordinate,
        details: {
          owner: newTaskEvent.owner,
          landType: newTaskEvent.landType,
          contractingOrganization: newTaskEvent.contractingOrganization,
          eliminationMethod: newTaskEvent.eliminationMethod,
          images: newTaskEvent.images,
          workStage: "Создано",
          problemAreaType: newTaskEvent.problemAreaType,
          comment: newTaskEvent.comment,
          density: newTaskEvent.density,
        },
        coordinates: newTaskEvent.coordinates[0] || [],
      },
    });
    getTaskEvents();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Ну удалось создать очаг",
    };
  }
}
async function getTaskEvents() {
  taskEventsLoading.value = true;
  const params = new URLSearchParams();
  // if (searchTaskEventStr.value) {
  //   params.append("search", searchTaskEventStr.value);
  // }
  // if (filters.value[0].selected) {
  //   params.append("role", filters.value[0].selected as string);
  // }
  // if (filters.value[1].selected) {
  //   params.append("status", filters.value[1].selected as string);
  // }
  // if (filters.value[2].selected && typeof filters.value[2].selected === "string") {
  //   params.append("fromDate", tempDateConverterWillBeRemoved(filters.value[2].selected));
  //   params.append("toDate", tempDateConverterWillBeRemoved(filters.value[2].selected));
  // } else {
  //   const { from, to } = filters.value[2].selected as {
  //     from: string | null;
  //     to: string | null;
  //   };
  //   if (from) {
  //     params.append("fromDate", tempDateConverterWillBeRemoved(from));
  //   }
  //   if (to) {
  //     params.append("toDate", tempDateConverterWillBeRemoved(to));
  //   }
  // }

  params.append("page", String(pagination.value.page - 1));
  params.append("size", String(pagination.value.rowsPerPage));
  const url = `${store.apiEventManager}/events/getAll?${params.toString()}`;
  const response = await $fetch<TaskEventPageRequest>(url, {
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
function tempDateConverterWillBeRemoved(ddmmyyyy: string): string {
  const [day, month, year] = ddmmyyyy.split(".");
  return `${year}-${month}-${day}`;
}
function searchTaskEvent() {
  debounce(getTaskEvents, 500, "searchTaskEvent");
}
function openTaskEventDialog() {
  isTaskEventDialogOpen.value = true;
}
function goToTaskEvent(id: string) {
  navigateTo(`/taskEvents/${id}`);
}
onMounted(() => {
  getTaskEvents();
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
    height: 32px;
    padding: 4px 16px;
    border-radius: 16px;
    color: var(--app-white);
  }
}
</style>
