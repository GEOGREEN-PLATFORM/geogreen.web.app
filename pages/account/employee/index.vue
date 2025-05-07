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
          <CButton @click="navigateTo('/hotbeds')" size="medium" stretch="fill"
            >Добавить очаг</CButton
          >
        </q-card>
      </section>
      <section class="b-page__right-section">
        <q-card class="b-card b-card--statistics">
          <div class="b-card__title gg-h3">Моя статистика</div>
          <div class="b-card__statistic-item">
            <div>
              <div class="gg-t-base">
                Очагов создано
                <strong>{{ 10 }}</strong>
              </div>
              <div class="gg-t-base">
                Обработано:
                <strong>{{ 1 }} ({{ 10 }}%)</strong>
              </div>
            </div>
            <q-linear-progress
              :value="10 / 100"
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
                Всего мероприятий
                <strong>{{ 1 }}</strong>
              </div>
              <div class="gg-t-base">
                Выполнено:
                <strong>{{ 1 }} ({{ 10 }}%)</strong>
              </div>
            </div>
            <q-linear-progress
              :value="10 / 100"
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
            <div class="b-request-item" @click="goToTaskEvent(closestTaskEvent.id)">
              <div class="b-request-item__left-section">
                <div style="width: max-content; flex: none">
                  <div class="gg-t-base">{{ closestTaskEvent.name }}</div>
                  <div class="gg-cap" caption>
                    до {{ date.formatDate(closestTaskEvent.endDate, "DD.MM.YYYY") }}
                  </div>
                </div>
                <div style="width: max-content" class="b-request-item__status">
                  <div
                    style="width: max-content"
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
                <CButton
                  @click.stop="navigateTo(`/task-events/${closestTaskEvent.id}`)"
                  size="small"
                >
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
  taskEventsLoading.value = true;
  const url = `${store.apiEventManager}/event/getAll`;
  const response = await $fetch<TaskEventsRequest>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
    params: {
      page: pagination.value.page - 1,
      size: pagination.value.rowsPerPage,
      operatorId: store.user?.id,
    },
  });
  myTaskEvents.value = response.content;
  pagination.value.rowsNumber = response.totalItems;
  taskEventsLoading.value = false;
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
            cursor: pointer;
            &:hover {
              background-color: var(--app-green-100);
            }
            &__left-section {
              display: flex;
              flex-direction: row;
              gap: 16px;
              min-width: max-content;
              align-items: center;
            }
          }
        }
        @media screen and (max-width: 489px) {
          .b-requests {
            .b-request-item {
              &__left-section {
                justify-content: space-between;
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
    }
  }
}
</style>
