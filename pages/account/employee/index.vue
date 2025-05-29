<template>
  <main v-if="store.user" class="b-page">
    <section class="b-header">
      <h1 class="b-header__title gg-h1">Аккаунт</h1>
    </section>
    <section class="b-page__top-content">
      <section class="b-page__left-section">
        <q-card class="b-card b-card--profile">
          <div>
            <CAvatar class="b-card__avatar" :avatar-src="store.user?.image?.fullImageId" />
          </div>
          <div class="b-card__name-container">
            <span class="b-card__name-text text-center gg-h3">{{
              `${store.user?.lastName} ${store.user?.firstName} ${store.user?.patronymic}`
            }}</span>
          </div>
          <div class="b-card__email-container">
            <span class="b-card__email-text gg-t-small">{{ store.user?.email }}</span>
          </div>
          <CButton size="medium" stretch="hug" @click="openManageAccountDialog"
            >Управлять аккаунтом</CButton
          >
        </q-card>
        <q-card class="b-card b-card--new-report">
          <div class="b-card__title gg-h3">Новый очаг</div>
          <CButton @click="navigateTo('/hotbeds?addFromStart=true')" size="medium" stretch="fill"
            >Добавить очаг</CButton
          >
        </q-card>
        <q-card v-if="store.user?.role === 'admin'" class="b-card b-card--new-report">
          <div class="b-card__title gg-h3">Отчёт по очагам</div>
          <CButton @click="downloadReport" size="medium" stretch="fill" :loading="isReportLoading"
            >Скачать</CButton
          >
        </q-card>
      </section>
      <section class="b-page__right-section">
        <q-card class="b-card b-card--statistics">
          <div class="b-card__title gg-h3">Моя статистика</div>
          <div class="gg-t-base">
            Всего добавлено очагов:&nbsp;
            <strong>{{ hotbedsStatistics.allMyGeoPoints || 0 }}</strong>
          </div>
          <div class="b-card__statistic-item">
            <div>
              <div class="gg-t-base">
                Ожидают обработки:&nbsp;
                <strong
                  >{{ hotbedsStatistics.createdGeoPoints || 0 }} ({{
                    (
                      (hotbedsStatistics.createdGeoPoints /
                        (hotbedsStatistics.allMyGeoPoints || 1)) *
                      100
                    ).toFixed(0)
                  }}%)</strong
                >
              </div>
            </div>
            <q-linear-progress
              :value="
                (hotbedsStatistics.createdGeoPoints / (hotbedsStatistics.allMyGeoPoints || 1)) * 100
              "
              color="green-500"
              track-color="green-300"
              rounded
              size="10px"
              class="b-statistics__progress"
            />
          </div>
          <div class="b-card__statistic-item">
            <div>
              <div class="gg-t-base">
                В работе:&nbsp;
                <strong
                  >{{ hotbedsStatistics.processedGeoPoints || 0 }} ({{
                    (
                      (hotbedsStatistics.processedGeoPoints /
                        (hotbedsStatistics.allMyGeoPoints || 1)) *
                      100
                    ).toFixed(0)
                  }}%)</strong
                >
              </div>
            </div>
            <q-linear-progress
              :value="
                (hotbedsStatistics.processedGeoPoints / (hotbedsStatistics.allMyGeoPoints || 1)) *
                100
              "
              color="green-500"
              track-color="green-300"
              rounded
              size="10px"
              class="b-statistics__progress"
            />
          </div>
          <div class="b-card__statistic-item">
            <div>
              <div class="gg-t-base">
                Закрыто:&nbsp;
                <strong
                  >{{ hotbedsStatistics.closedGeoPoints || 0 }} ({{
                    (
                      (hotbedsStatistics.closedGeoPoints /
                        (hotbedsStatistics.allMyGeoPoints || 1)) *
                      100
                    ).toFixed(0)
                  }}%)</strong
                >
              </div>
            </div>
            <q-linear-progress
              :value="
                (hotbedsStatistics.closedGeoPoints / (hotbedsStatistics.allMyGeoPoints || 1)) * 100
              "
              color="green-500"
              track-color="green-300"
              rounded
              size="10px"
              class="b-statistics__progress"
            />
          </div>
        </q-card>
        <q-card class="b-card b-card--my-reports">
          <div class="b-card__title gg-h3">Ближайшее мероприятие</div>
          <div v-if="closestTaskEvent" class="b-requests">
            <div class="b-request-item">
              <div class="b-request-item__left-section">
                <div class="b-request-item__text-info">
                  <div class="b-request-item__name gg-t-base">{{ closestTaskEvent.name }}</div>
                  <div class="gg-cap" caption>
                    до {{ date.formatDate(closestTaskEvent.endDate, "DD.MM.YYYY") }}
                  </div>
                </div>
                <div class="b-request-item__status">
                  <div
                    :class="[
                      TASK_EVENT_STATUS_STYLES[
                        closestTaskEvent.statusCode as keyof typeof TASK_EVENT_STATUS_STYLES
                      ],
                      'base-status-container',
                    ]"
                  >
                    {{ closestTaskEvent.statusCode }}
                  </div>
                </div>
              </div>
              <div class="b-request-item__right-section">
                <CButton @click.stop="goToTaskEvent(closestTaskEvent.id)" size="small">
                  Подробнее
                </CButton>
              </div>
            </div>
          </div>
          <div v-else class="gg-t-base" style="color: var(--app-grey-400)">
            У вас нет ближайших мероприятий
          </div>
        </q-card>
      </section>
    </section>
    <section class="b-page__bottom-content">
      <q-card class="b-card b-card--my-task-events">
        <div class="b-card__title gg-h3">Мои мероприятия</div>
        <div class="b-table">
          <CTable
            :columns="tableHeaders"
            :rows="tableRows"
            v-model:pagination="pagination"
            row-key="name"
            :slots="['statusCode']"
            @click:row="(row: any) => goToTaskEvent(row.id)"
            @updateTable="getMyTaskEvents"
            :loading="taskEventsLoading"
          >
            <template v-slot:body-cell-statusCode="slotProps">
              <div
                class="base-status-container gg-t-small"
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
      </q-card>
    </section>
    <PagesAccountManage
      v-model="dialogManageAccount"
      :user="store.user"
      @managedAccount="handleaAccountManaged"
    ></PagesAccountManage>
  </main>
</template>

<script setup lang="ts">
import { date } from "quasar";
import { useMainStore } from "~/store/main";
import type { TaskEvent } from "~/types/interfaces/taskEvents";
interface TaskEventsRequest extends ServerPagination {
  content: TaskEvent[];
}
interface HotbedsStatistics {
  createdGeoPoints: number;
  processedGeoPoints: number;
  closedGeoPoints: number;
  allMyGeoPoints?: number;
}
const store = useMainStore();
const { TASK_EVENT_STATUS_OPTIONS, TASK_EVENT_STATUS_STYLES } =
  useGetStatusOptions();
const myTaskEvents = ref<TaskEvent[]>([]);
const closestTaskEvent = computed(() => {
  return myTaskEvents.value[0];
});
const pagination = ref<TablePagination>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const taskEventsLoading = shallowRef(true);
const hotbedsStatistics = ref<HotbedsStatistics>({
  createdGeoPoints: 0,
  processedGeoPoints: 0,
  closedGeoPoints: 0,
});
const isReportLoading = shallowRef(false);
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
  myTaskEvents.value.map((e) => ({
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
const dialogManageAccount = shallowRef(false);
async function getMyTaskEvents() {
  try {
    taskEventsLoading.value = true;
    const url = `${store.apiV1}/event/getAll`;
    const response = await $fetch<TaskEventsRequest>(url, {
      method: "GET",
      headers: { Authorization: useGetToken() },
      params: {
        page: pagination.value.page - 1,
        size: pagination.value.rowsPerPage,
        operatorId: store.user?.id,
        sortField: "endDate",
      },
    });
    myTaskEvents.value = response.content;
    pagination.value.rowsNumber = response.totalItems;
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось получить список мероприятий",
    };
  } finally {
    taskEventsLoading.value = false;
  }
}
async function getHotbedsStatisctics() {
  try {
    const response = await $fetch<HotbedsStatistics>(
      `${store.apiV1}/geo/info/get-statistic/${store.user?.id}`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
      },
    );
    hotbedsStatistics.value = {
      createdGeoPoints: response.createdGeoPoints || 0,
      processedGeoPoints: response.processedGeoPoints || 0,
      closedGeoPoints: response.closedGeoPoints || 0,
    };
    hotbedsStatistics.value.allMyGeoPoints =
      response.createdGeoPoints +
      response.closedGeoPoints +
      response.processedGeoPoints;
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось получить данные для статистики",
    };
  }
}
async function downloadReport() {
  try {
    isReportLoading.value = true;
    const report = await generateGeomarkerReport();
    if (report.file) {
      useFilesDownloader(report.file, report.name);
    }
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось скачать отчёт",
    };
  } finally {
    isReportLoading.value = false;
  }
}
async function generateGeomarkerReport() {
  try {
    const file = await $fetch<Blob>(`${store.apiV1}/report/general-report`, {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
    });
    return {
      file,
      name: "Общий отчёт",
    };
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось сгенерировать отчёт",
    };
    return {};
  }
}
function handleaAccountManaged(updatedUser: User) {
  store.user = updatedUser;
}

function goToTaskEvent(id: string) {
  navigateTo(`/for-employee/task-events/${id}`);
}
function openManageAccountDialog() {
  dialogManageAccount.value = true;
}
onMounted(() => {
  getMyTaskEvents();
  getHotbedsStatisctics();
});
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.b-page {
  background-color: var(--app-green-050);
  padding: 24px;
  width: 100%;
  height: 100%;
  min-height: max-content;
  @media screen and (max-width: $app-narrow-mobile) {
    padding: 12px;
  }
  .b-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
  }

  &__top-content {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    .b-page__left-section,
    .b-page__right-section {
      flex: 10000;
      display: flex;
      flex-direction: column;
      gap: 24px;
      @media screen and (max-width: $app-narrow-mobile) {
        min-width: 248px;
        flex: 1;
      }
    }
    .b-page__left-section {
      min-width: 248px;
      flex: 1;
    }
    .b-card {
      padding: 16px;
      width: 100%;
      background-color: var(--app-white);
      border-radius: 16px;
      gap: 16px;
      display: flex;
      flex-direction: column;

      &--profile {
        justify-content: center;
        align-items: center;

        .b-card__avatar {
          width: 84px;
          height: 84px;
        }

        .b-card__name-container,
        .b-card__email-container {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-wrap: anywhere;
        }
      }
      &--map {
        min-height: 286px;
        .b-card__map {
          border-radius: 16px;
          overflow: hidden;
        }
      }
      &__statistic-item {
        display: flex;
        flex-direction: column;
        gap: 12px;
        background-color: var(--app-green-050);
        border-radius: 16px;
        padding: 16px;
      }
      &--my-reports {
        .b-requests {
          max-height: 500px;
          overflow: auto;
          gap: 12px;
          &::-webkit-scrollbar {
            display: none;
          }
          .b-request-item {
            display: flex;
            width: 100%;
            gap: 16px;
            justify-content: space-between;
            background-color: var(--app-green-050);
            border-radius: 12px;
            padding: 16px;
            transition: background-color 0.3s ease;
            overflow-wrap: anywhere;
            min-width: max-content;
            &__name {
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            cursor: pointer;
            &:hover {
              background-color: var(--app-green-100);
            }
            &__left-section {
              display: flex;
              flex-direction: row;
              gap: 16px;
              align-items: center;
            }
          }
        }
        @media screen and (max-width: 493px) {
          .b-requests {
            .b-request-item {
              min-width: unset;
              &__left-section {
                justify-content: space-between;
                width: 100%;
              }
              &__right-section {
                padding-left: 0;
              }
              &__status {
                max-width: max-content;
              }
              flex-direction: column;
            }
          }
        }
      }
    }
  }
  &__bottom-content {
    margin-top: 32px;

    .b-card--my-task-events {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 248px;
    }
  }
}
</style>
