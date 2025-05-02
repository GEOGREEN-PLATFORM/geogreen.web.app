<template>
  <main class="b-page">
    <header class="b-page__header q-my-lg">
      <div class="b-page__title-wrapper">
        <h1 class="b-page__title gg-h1">Заявки</h1>
      </div>
    </header>
    <section class="b-page__content">
      <div class="b-filter q-mb-lg">
        <CFilter
          v-model="filters"
          @apply-filters="applyFilters"
          @reset-filters="applyFilters"
        ></CFilter>
      </div>
      <q-scroll-area class="b-page__requests-container">
        <q-infinite-scroll @load="loadMore" :offset="2000">
          <section class="b-page__requests">
            <q-card v-for="(request, index) in requests" :key="request.id" class="b-request-card">
              <header class="b-request-card__header">
                <div class="b-request-card__title-wrapper">
                  <h2 class="b-request-card__title gg-h2">{{ request.problemAreaType }}</h2>
                  <div class="b-request-card__reliability-icon">
                    <q-icon
                      :name="request.photoVerification ? mdiCheck : mdiAlert"
                      size="24px"
                      :color="request.photoVerification ? 'green-500' : 'red-500'"
                    />
                  </div>
                </div>
                <span class="b-request-card__timestamp gg-caption">
                  Заявка создана {{ timeConverter(request.createDate) }}
                </span>
              </header>
              <section class="b-request-card__content q-mb-lg">
                <button
                  class="b-request-card__open-map-button gg-t-small"
                  @click="viewOnMap(request)"
                >
                  Посмотреть очаг на карте
                </button>
                <section class="b-request-card__main-info">
                  <p class="b-request-card__comment gg-t-base">{{ request.userComment }}</p>
                  <div class="b-request-card__images">
                    <CFileContainers
                      :files="request.images"
                      :clearable="false"
                      hide-caption
                    ></CFileContainers>
                  </div>
                </section>
              </section>
              <footer class="b-request-card__footer justify-between">
                <div>
                  <CButton @click="approveRequest(request.id)" label="Принять заявку"></CButton>
                </div>
                <div>
                  <CButton
                    @click="rejectRequest(request.id)"
                    label="Отклонить заявку"
                    bg-color="var(--app-red-500)"
                  ></CButton>
                </div>
              </footer>
            </q-card>
          </section>
          <template v-slot:loading>
            <div v-show="requestsLoading" class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </q-scroll-area>
    </section>
    <CDialog v-model="isMapOpen" class="b-dialog">
      <div class="b-dialog__content">
        <CMap
          :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
          :markers="existingHotbedsByType"
          :shortInfoKeys="shortMarkerInfoNameKeys"
          hide-controls
          :selectedMarker="selectedHotbed"
        ></CMap>
      </div>
    </CDialog>
  </main>
</template>

<script setup lang="ts">
import { mdiAlert, mdiCheck } from "@quasar/extras/mdi-v6";
import type { Coordinate } from "ol/coordinate";
import { useMainStore } from "~/store/main";

interface ApplicationData {
  id: string;
  coordinates: Coordinate;
  userId: string;
  userComment: string;
  images: {
    previewImageId: string;
    fullImageId: string;
  }[];
  status: "Создана" | "Одобрена" | "Отклонена";
  createDate: string;
  operatorComment: string;
  photoVerification: boolean;
  updateDate: string;
  operatorName: string | null;
  operatorId: string | null;
  problemAreaType: string;
}
interface ApplicationsRequest extends ServerPagination {
  content: ApplicationData[];
}
const store = useMainStore();
const { timeConverter } = useFormatters();
const { HOTBED_WORK_STAGE_STYLES } = useGetStatusOptions();
const requestsLoading = shallowRef(true);
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
const isMapOpen = shallowRef(false);
const existingHotbedsByType = ref<Marker[]>([]);
const selectedHotbed = ref<Marker>();
const filters = ref<FilterItem[]>([
  {
    type: "select",
    key: "problemAreaType",
    label: "Тип проблемы",
    selected: "",
    data: store.formattedProblemAreaTypes,
  },
  {
    type: "date-range",
    key: "periodCreated",
    selected: { from: "", to: "" },
    label: "Период создания",
  },
]);

const requests = ref<ApplicationData[]>([]);
const pagination = reactive({
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
});
function applyFilters() {
  pagination.page = 0;
  getUserRequests("filter");
}
async function getUserRequests(source?: "filter") {
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
        problemType: filters.value[0].selected || undefined,
        startDate: (filters.value[1].selected as DateRange)?.from || undefined,
        endDate: (filters.value[1].selected as DateRange)?.to || undefined,
      },
    },
  );
  if (source === "filter") {
    requests.value = [];
  }
  requests.value = [...requests.value, ...response.content];
  pagination.totalElements = response.totalItems;
  pagination.totalPages = response.totalPages;
  requestsLoading.value = false;
}
async function loadMore(index: number, done: (stop?: boolean) => void) {
  if (pagination.page < pagination.totalPages) {
    pagination.page++;
    await getUserRequests();
  }
  done();
}
async function getExistingHotbedsOfProblemsByType(type: string) {
  const data = await $fetch<Marker[]>(
    `${store.apiGeospatial}/geo/info/getAll/${type}`,
    {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  existingHotbedsByType.value = data;
}
async function approveRequest(id: string) {
  const response = await $fetch(`${store.apiUserReport}/user-marker/${id}`, {
    method: "PATCH",
    headers: {
      authorization: useGetToken(),
    },
    body: {
      statusCode: "Одобрена",
      operatorComment: "",
      operatorId: store.user?.id || "",
    },
  });
  rejectRequestFromList(id);
}

async function rejectRequest(id: string) {
  const response = await $fetch(`${store.apiUserReport}/user-marker/${id}`, {
    method: "PATCH",
    headers: {
      authorization: useGetToken(),
    },
    body: {
      statusCode: "Отклонена",
      operatorComment: "",
      operatorId: store.user?.id || "",
    },
  });
  rejectRequestFromList(id);
}
function rejectRequestFromList(id: string) {
  requests.value = requests.value.filter((request) => request.id !== id);
}
async function viewOnMap(request: ApplicationData) {
  await getExistingHotbedsOfProblemsByType(request.problemAreaType);
  existingHotbedsByType.value.push({
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
  selectedHotbed.value =
    existingHotbedsByType.value[existingHotbedsByType.value.length - 1];
  isMapOpen.value = true;
}
onMounted(() => {
  getUserRequests();
});
</script>

<style scoped lang="scss">
.b-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;
  padding: 0px 32px;
  display: flex;
  flex-direction: column;
  height: 100%;
  @media screen and (max-width: $app-mobile) {
    padding: 0px 16px;
  }
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
    @media screen and (max-width: $app-laptop) {
      flex-wrap: wrap;
      gap: 16px;
    }
    .b-page__title-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      @media screen and (max-width: $app-mobile) {
        justify-content: center;
        gap: 24px;
      }
    }
  }
  .b-page__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    .b-page__requests-container {
      flex: 1;
      min-height: 380px;
    }
    .b-page__requests {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 16px;
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
        gap: 6px;
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
