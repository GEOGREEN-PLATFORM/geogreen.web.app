<template>
  <main v-if="store.user" class="b-page">
    <section class="b-header">
      <h1 class="b-header__title gg-h1">Аккаунт</h1>
    </section>
    <section class="b-page__content">
      <section class="b-page__left-section">
        <q-card class="b-card b-card--profile">
          <div><CAvatar class="b-card__avatar" /></div>
          <div class="b-card__name-container">
            <span class="b-card__name-text gg-h3">{{
              `${store.user?.firstName} ${store.user?.lastName}`
            }}</span>
            <q-icon :name="mdiAlertCircleOutline" color="orange-500" size="24px" />
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
          <CButton @click="navigateTo('/report-problem')" size="medium" stretch="hug"
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
          <q-list v-if="reports.length" class="requests">
            <q-item v-for="(report, idx) in reports" :key="idx" clickable class="b-report-item">
              <section class="b-report-item__left-section">
                <q-item-section style="width: max-content; flex: none">
                  <q-item-label class="gg-t-base">{{ report.problemAreaType }}</q-item-label>
                  <q-item-label caption class="gg-cap"
                    >от {{ date.formatDate(report.createDate, "DD.MM.YYYY") }}</q-item-label
                  >
                </q-item-section>
                <q-item-section style="width: max-content" class="b-report-item__status">
                  <div style="width: max-content">{{ report.status }}</div>
                </q-item-section>
              </section>
              <q-item-section side>
                <CButton size="small">Подробнее</CButton>
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
    <PagesAccountUserManage
      v-model="dialogManageAccount"
      :user="store.user"
    ></PagesAccountUserManage>
  </main>
</template>

<script setup lang="ts">
import { mdiAlertCircleOutline } from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { useMainStore } from "~/store/main";
import type { ApplicationData } from "~/types/interfaces/applications";
interface ApplicationsRequest extends ServerPagination {
  content: ApplicationData[];
}
const store = useMainStore();
const { HOTBED_WORK_STAGE_STYLES } = useGetStatusOptions();
const hotbedsLoading = ref(true);
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
const pagination = reactive({
  page: 0,
  size: 10,
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
  hotbedsLoading.value = true;
  const params = new URLSearchParams();
  const url = `${store.apiGeospatial}/geo/info/getAll?${params.toString()}`;
  const response = await $fetch<Marker[]>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  existingHotbeds.value = response;
  hotbedsLoading.value = false;
}
async function getMyRequests() {
  requestsLoading.value = true;
  const response = await $fetch<ApplicationsRequest>(
    `${store.apiUserReport}/user-marker/getAll`,
    {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
      params: {
        page: pagination.page,
        size: pagination.size,
      },
    },
  );
  reports.value = [...reports.value, ...response.content];
  pagination.totalElements = response.totalItems;
  pagination.totalPages = response.totalPages;
  requestsLoading.value = false;
}
function openManageAccountDialog() {
  dialogManageAccount.value = true;
}
onMounted(() => {
  getHotbeds();
  getMyRequests();
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
  .b-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
  }

  &__content {
    display: flex;
    gap: 24px;

    .b-page__left-section,
    .b-page__right-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .b-page__left-section {
      max-width: max-content;
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
        gap: 12px;
      }
      .requests {
        max-height: 500px;
        overflow: auto;
      }
    }
  }
}
.requests {
  &::-webkit-scrollbar {
    display: none;
  }
}
.b-report-item {
  background-color: var(--app-green-050);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0px;
  &__left-section {
    display: flex;
    width: 100%;
    gap: 16px;
  }
}
</style>
