<template>
  <main v-if="store.user" class="b-page">
    <section class="b-header">
      <h1 class="b-header__title gg-h1">Аккаунт</h1>
    </section>
    <section class="b-page__content">
      <section class="b-page__left-section">
        <q-card class="b-card b-card--profile">
          <div><CAvatar class="b-card__avatar" :avatar-src="store.user?.image?.fullImageId" /></div>
          <div class="b-card__name-container">
            <span class="b-card__name-text text-center gg-h3">{{
              `${store.user?.firstName} ${store.user?.lastName}`
            }}</span>
            <q-icon
              :name="store.user?.isEmailVerified ? mdiCheckCircleOutline : mdiAlertCircleOutline"
              :color="store.user?.isEmailVerified ? 'green-500' : 'orange-500'"
              size="24px"
            >
              <CHint>
                {{
                  store.user?.isEmailVerified
                    ? "Электронная почта подтверждена"
                    : "Электронная почта не подтверждена. Для подтверждения перейдите в управление аккаунтом"
                }}
              </CHint>
            </q-icon>
          </div>
          <div class="b-card__email-container">
            <span class="b-card__email-text gg-t-small">{{ store.user?.email }}</span>
          </div>
          <CButton size="medium" stretch="hug" @click="openManageAccountDialog"
            >Управлять аккаунтом</CButton
          >
        </q-card>

        <q-card class="b-card b-card--map">
          <div class="b-card__title gg-h3">Миникарта</div>
          <CMap
            class="b-card__map"
            hide-controls
            :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
            :markers="existingHotbeds"
            :shortInfoKeys="shortMarkerInfoNameKeys"
          ></CMap>
        </q-card>

        <q-card class="b-card b-card--new-report">
          <div class="b-card__title gg-h3">Новое сообщение</div>
          <CButton @click="navigateTo('/report-problem')" size="medium" stretch="fill"
            >Сообщить об очаге</CButton
          >
        </q-card>
      </section>
      <section class="b-page__right-section">
        <q-card class="b-card b-card--statistics">
          <div class="b-card__title gg-h3">Моя статистика</div>
          <div class="b-card__statistic-item">
            <div>
              <div class="gg-t-base">
                Всего сообщений об очагах:
                <strong>{{ totalReports }}</strong>
              </div>
              <div class="gg-t-base">
                Принято:
                <strong>{{ completedReports }} ({{ completionRate }}%)</strong>
              </div>
            </div>
            <q-linear-progress
              :value="completionRate / 100"
              color="green-500"
              track-color="green-300"
              rounded
              size="10px"
              class="b-statistics__progress"
            />
          </div>
        </q-card>
        <q-card class="b-card b-card--my-reports">
          <div class="b-card__title gg-h3">Мои сообщения о проблемах</div>
          <q-list v-if="reports.length" class="b-requests">
            <q-item
              v-for="(report, idx) in reports"
              :key="idx"
              @click="openRequestDetailsDialog(report)"
              class="b-request-item"
            >
              <q-item-section class="b-request-item__left-section">
                <q-item-section
                  class="b-request-item__text-info"
                  style="width: max-content; flex: none"
                >
                  <q-item-label class="b-request-item__name gg-t-base">{{
                    report.problemAreaType
                  }}</q-item-label>
                  <q-item-label caption class="gg-cap"
                    >от {{ date.formatDate(report.createDate, "DD.MM.YYYY") }}</q-item-label
                  >
                </q-item-section>
                <q-item-section style="width: max-content" class="b-request-item__status">
                  <div
                    style="width: max-content; margin: 0"
                    :class="[APPLICATION_STATUS_STYLES[report.status], 'base-status-container']"
                  >
                    {{ report.status }}
                  </div>
                </q-item-section>
              </q-item-section>
              <q-item-section class="b-request-item__right-section" side>
                <CButtonNotification
                  :subscribed="!!myNotifications.find((n) => n.elementId === report.id)"
                  tooltipSubText="Уведомлять об изменениях на почту"
                  tooltip-unsub-text="Отписаться от уведомлений"
                  @subscribe="subscribeToReportNotifications(report.id)"
                  @unsubscribe="deleteSubscriptionIdByReportId(report.id)"
                ></CButtonNotification>
                <CButton @click="openRequestDetailsDialog(report)" size="small">Подробнее</CButton>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="gg-t-base" style="color: var(--app-grey-400)">
            Вы ещё не сообщали о проблемах
          </div>
        </q-card>
        <q-card class="b-card b-card--my-achievements">
          <div class="b-card__title gg-h3">Достижения</div>
          <div class="gg-t-normal" style="color: var(--app-grey-400)">Скоро</div>
        </q-card>
        <q-card class="b-card b-card--leaderboard">
          <div class="b-card__title gg-h3">Топ гео‑гринеры</div>
          <div class="gg-t-normal" style="color: var(--app-grey-400)">Скоро</div>
        </q-card>
      </section>
    </section>
    <PagesAccountManage
      v-model="dialogManageAccount"
      :user="store.user"
      @managedAccount="handleaAccountManaged"
    ></PagesAccountManage>
    <CDialog v-model="isRequestDetailsOpen" center-content class="b-dialog">
      <div v-if="selectedDetailsRequest" class="b-request-card">
        <header class="b-request-card__header">
          <div class="b-request-card__title-wrapper">
            <h2 class="b-request-card__title gg-h2">
              {{ selectedDetailsRequest.problemAreaType }}
            </h2>
            <div class="b-request-card__status">
              <div
                :class="[
                  APPLICATION_STATUS_STYLES[selectedDetailsRequest.status],
                  'base-status-container',
                ]"
              >
                {{ selectedDetailsRequest.status }}
              </div>
            </div>
          </div>
          <span class="b-request-card__timestamp gg-caption">
            Отправлено {{ timeConverter(selectedDetailsRequest.createDate) }}
          </span>
        </header>
        <section class="b-request-card__content q-mb-lg">
          <button
            class="b-request-card__open-map-button gg-t-small"
            @click="viewOnMap(selectedDetailsRequest)"
          >
            Посмотреть очаг на карте
          </button>
          <section class="b-request-card__main-info">
            <p class="b-request-card__comment gg-t-base">
              {{ selectedDetailsRequest.userComment }}
            </p>
            <div class="b-request-card__images">
              <CFileContainers
                :files="selectedDetailsRequest.images"
                :clearable="false"
                hide-caption
              ></CFileContainers>
            </div>
          </section>
        </section>
      </div>
    </CDialog>
    <CDialog
      v-model="isRequestMapOpen"
      full-content
      show-close
      close-align="left"
      close-icon-style="outlined"
      class="b-dialog"
    >
      <div class="b-dialog__content">
        <CMap
          :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
          :markers="existingHotbeds"
          :shortInfoKeys="shortMarkerInfoNameKeys"
          hide-controls
          :selectedMarker="selectedRequestMapHotbed"
        ></CMap>
      </div>
    </CDialog>
  </main>
</template>

<script setup lang="ts">
import {
  mdiAlertCircleOutline,
  mdiCheckCircleOutline,
  mdiCheckOutline,
} from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { useMainStore } from "~/store/main";
import type { ApplicationData } from "~/types/interfaces/applications";
import type { NotificationData } from "~/types/interfaces/notifications";
interface ApplicationsRequest extends ServerPagination {
  content: ApplicationData[];
}
interface NotificationsRequest extends ServerPagination {
  subscriptions: NotificationData[];
}
const store = useMainStore();
const { HOTBED_WORK_STAGE_STYLES, APPLICATION_STATUS_STYLES } =
  useGetStatusOptions();
const { timeConverter } = useFormatters();
const hotbedsLoading = ref(true);
const selectedRequestMapHotbed = ref<Marker | null>(null);
const isRequestMapOpen = ref(false);
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
const existingHotbeds = ref<Marker[]>([]);
const myNotifications = ref<NotificationData[]>([]);
const isRequestDetailsOpen = ref(false);
const selectedDetailsRequest = ref<ApplicationData | null>(null);
const paginationApplications = reactive({
  page: 0,
  size: 100,
  totalElements: 0,
  totalPages: 0,
});
const paginationNotifications = reactive({
  page: 0,
  size: 100,
  totalElements: 0,
  totalPages: 0,
});
const requestsLoading = shallowRef(true);
const dialogManageAccount = shallowRef(false);
const reports = ref<ApplicationData[]>([]);

const totalReports = computed(() => reports.value.length);
const completedReports = computed(
  () => reports.value.filter((r) => r.status === "Одобрена").length,
);
const completionRate = computed(() =>
  totalReports.value > 0
    ? Math.round((completedReports.value / totalReports.value) * 100)
    : 0,
);
async function getHotbeds() {
  try {
    hotbedsLoading.value = true;
    const params = new URLSearchParams();
    const url = `${store.apiV1}/geo/info/getAll?${params.toString()}`;
    const response = await $fetch<Marker[]>(url, {
      method: "GET",
      headers: { Authorization: useGetToken() },
    });
    existingHotbeds.value = response;
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось получить список очагов проблем",
    };
  } finally {
    hotbedsLoading.value = false;
  }
}
async function viewOnMap(request: ApplicationData) {
  await getHotbeds();
  existingHotbeds.value.push({
    id: "user-temp-created",
    coordinate: request.coordinates,
    isTempCreatedBy: "user",
    details: {
      square: 0,
      owner: "",
      landType: "",
      contractingOrganization: "",
      workStage: "",
      eliminationMethod: "",
      images: [],
      problemAreaType: request.problemAreaType,
      comment: "",
      density: null,
    },
    relatedTaskId: null,
    coordinates: [],
  });
  selectedRequestMapHotbed.value =
    existingHotbeds.value[existingHotbeds.value.length - 1];
  isRequestMapOpen.value = true;
}
function handleaAccountManaged(updatedUser: User) {
  store.user = updatedUser;
}
async function getMyNotifications() {
  try {
    const response = await $fetch<NotificationsRequest>(
      `${store.apiV1}/notification/subscribe/get-all/${store.user?.email}`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
        params: {
          page: paginationNotifications.page,
          size: paginationNotifications.size,
        },
      },
    );
    myNotifications.value = response.subscriptions;
    paginationNotifications.totalElements = response.totalItems;
  } catch (error) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось получить список уведомлений",
    };
  }
}
async function getMyRequests() {
  try {
    requestsLoading.value = true;
    const response = await $fetch<ApplicationsRequest>(
      `${store.apiV1}/user-marker/getAll`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
        params: {
          page: paginationApplications.page,
          size: paginationApplications.size,
        },
      },
    );
    reports.value = [...reports.value, ...response.content];
    paginationApplications.totalElements = response.totalItems;
    paginationApplications.totalPages = response.totalPages;
  } catch (error) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось получить список сообщений о проблемах",
    };
  } finally {
    requestsLoading.value = false;
  }
}
async function subscribeToReportNotifications(userReportId: string) {
  try {
    await $fetch(`${store.apiV1}/notification/subscribe`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        elementId: userReportId,
        email: store.user?.email,
        type: "Заявка",
      },
    });
    getMyNotifications();
  } catch (err) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось подписаться на уведомление",
    };
  }
}
async function deleteSubscriptionIdByReportId(userReportId: string) {
  try {
    await $fetch(
      `${store.apiV1}/notification/subscribe/${store.user?.email}/delete-by-element-id/${userReportId}`,
      {
        method: "DELETE",
        headers: {
          authorization: useGetToken(),
        },
      },
    );
    getMyNotifications();
  } catch (err) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось отписаться от уведомления",
    };
  }
}
function openRequestDetailsDialog(request: ApplicationData) {
  isRequestDetailsOpen.value = true;
  selectedDetailsRequest.value = request;
}
function openManageAccountDialog() {
  dialogManageAccount.value = true;
}
onMounted(() => {
  getHotbeds();
  getMyRequests();
  getMyNotifications();
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

  &__content {
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
            background-color: var(--app-green-050);
            border-radius: 12px;
            padding: 16px;
            margin: 16px 0px;
            overflow-wrap: anywhere;
            min-width: max-content;
            &__name {
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              max-width: 200px;
            }
            &:hover {
              background-color: var(--app-green-100);
            }
            &__left-section {
              display: flex;
              flex-direction: row;
              gap: 8px;
              align-items: center;
            }
            &__right-section {
              display: flex;
              flex-direction: row;
              flex-wrap: nowrap;
              align-items: center;
              justify-content: center;
              gap: 16px;
            }
          }
        }
        @media screen and (max-width: 489px) {
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
}
.b-request-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: var(--app-green-050);
  width: 860px;
  max-width: 860px;
  border-radius: 16px;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
  }
  &__title-wrapper {
    display: flex;
    gap: 12px;
    @media screen and (max-width: $app-narrow-mobile) {
      justify-content: space-between;
      width: 100%;
    }
  }
  &__timestamp {
    color: var(--app-grey-400);
  }
  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;
    width: 100%;
  }
  &__open-map-button {
    color: var(--app-blue-500);
    cursor: pointer;
    padding: 8px 0px;
    @media screen and (max-width: $app-narrow-mobile) {
      margin: 0 auto;
    }
  }
  &__comment {
    display: flex;
    padding: 8px 12px;
    background-color: var(--app-white);
    color: var(--app-grey-500);
    align-items: flex-start;
    justify-content: flex-start;
    border-radius: 8px;
    min-width: 516px;
    height: 112px;
    overflow: auto;
    @media screen and (max-width: $app-laptop) {
      width: 100%;
      height: 84px;
      min-width: 120px;
    }
    @media screen and (max-width: $app-mobile) {
      min-height: 84px;
      max-height: 120px;
      height: max-content;
    }
  }
  &__images {
    width: 100%;
  }
  &__footer {
    display: flex;
    width: 100%;
    @media screen and (max-width: $app-mobile) {
      flex-direction: column;
      gap: 16px;
    }
  }
  &__main-info {
    display: flex;
    align-items: flex-start;
    width: 100%;
    gap: 56px;
    @media screen and (max-width: $app-laptop) {
      flex-wrap: wrap;
      gap: 16px;
    }
  }
  @media screen and (max-width: $app-laptop) {
    width: 100%;
  }
}
.b-dialog {
  &__content {
    width: 80dvw;
    height: 90dvh;
    max-width: 80dvw;
  }
}
</style>
