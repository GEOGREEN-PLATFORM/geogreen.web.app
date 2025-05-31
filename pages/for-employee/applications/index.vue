<template>
  <main class="b-page">
    <div v-if="!pageError" class="b-page__content-wrapper">
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
              <q-card
                v-for="(request, index) in pageData.requests"
                :key="request.id"
                class="b-request-card"
              >
                <header class="b-request-card__header">
                  <div class="b-request-card__title-wrapper">
                    <h2 class="b-request-card__title gg-h2">{{ request.problemAreaType }}</h2>
                    <div class="b-request-card__reliability-icon">
                      <q-icon
                        :name="request.photoVerification ? mdiCheck : mdiAlert"
                        size="24px"
                        :color="request.photoVerification ? 'green-500' : 'red-500'"
                      >
                        <CHint>
                          {{
                            request.photoVerification
                              ? "Загруженные изображения достоверны"
                              : request.images.length > 0
                                ? "Загруженные изображения не достоверны"
                                : "Нет загруженных изображений"
                          }}
                        </CHint></q-icon
                      >
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
      <CDialog
        v-model="isMapOpen"
        full-content
        close-icon-style="outlined"
        close-align="left"
        class="b-dialog"
      >
        <q-card class="b-dialog__content">
          <CMap
            :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
            :markers="existingHotbedsByType"
            :shortInfoKeys="shortMarkerInfoNameKeys"
            hide-controls
            :selectedMarker="selectedHotbed"
            :dataLoading="hotbedsLoading"
          ></CMap>
        </q-card>
      </CDialog>
    </div>
    <CError v-else :error="pageError" @refresh="refresh"></CError>
  </main>
</template>

<script setup lang="ts">
import { mdiAlert, mdiCheck } from "@quasar/extras/mdi-v6";
import { useMainStore } from "~/store/main";
import type { ApplicationData } from "~/types/interfaces/applications";

interface ApplicationsRequest extends ServerPagination {
  content: ApplicationData[];
}
interface PageData {
  requests: ApplicationData[];
  totalItems: number;
  totalPages: number;
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
const hotbedsLoading = shallowRef(true);
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

const pagination = reactive({
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
});
const {
  data: pageData,
  error: pageError,
  refresh,
} = await useAsyncData<PageData>(
  "requests",
  async () => {
    return await getUserRequests();
  },
  {
    dedupe: "defer",
    default: () => ({
      requests: [],
      totalItems: 0,
      totalPages: 0,
    }),
  },
);
if (pageData.value) {
  pagination.totalElements = pageData.value.totalItems;
  pagination.totalPages = pageData.value.totalPages;
}
async function applyFilters() {
  pagination.page = 0;
  try {
    requestsLoading.value = true;
    const data = await getUserRequests();
    pageData.value.requests = data.requests;
    pagination.totalElements = pageData.value.totalItems = data.totalItems;
    pagination.totalPages = pageData.value.totalPages = data.totalPages;
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось получить список заявок",
    };
  } finally {
    requestsLoading.value = false;
  }
}
async function getUserRequests() {
  try {
    const response = await $fetch<ApplicationsRequest>(
      `${store.apiV1}/user-marker/getAll`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
        params: {
          page: pagination.page,
          size: pagination.size,
          status: "Создана",
          problemType: filters.value[0]?.selected || undefined,
          startDate:
            (filters.value[1]?.selected as DateRange)?.from || undefined,
          endDate: (filters.value[1]?.selected as DateRange)?.to || undefined,
        },
      },
    );
    return {
      requests: response.content,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
    };
  } catch (error: any) {
    console.error(error);
    throw new AppError("Не удалось получить список заявок", {
      statusCode: error.response.status,
    });
  }
}
async function loadMore(index: number, done: (stop?: boolean) => void) {
  if (pagination.page < pagination.totalPages) {
    pagination.page++;
    try {
      requestsLoading.value = true;
      const data = await getUserRequests();
      pageData.value.requests = [...pageData.value.requests, ...data.requests];
      pagination.totalElements = pageData.value.totalItems = data.totalItems;
      pagination.totalPages = pageData.value.totalPages = data.totalPages;
    } catch (error: any) {
      console.error(error);
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: "Не удалось получить список заявок",
      };
    } finally {
      requestsLoading.value = false;
    }
  }
  done();
}
async function getExistingHotbedsOfProblemsByType(type: string) {
  try {
    hotbedsLoading.value = true;
    const data = await $fetch<Marker[]>(
      `${store.apiV1}/geo/info/getAll/${type}`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
      },
    );
    existingHotbedsByType.value = data;
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
async function approveRequest(id: string) {
  try {
    const response = await $fetch(`${store.apiV1}/user-marker/${id}`, {
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
    removeRequestFromList(id);
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось одобрить заявку",
    };
  }
}

async function rejectRequest(id: string) {
  try {
    const response = await $fetch(`${store.apiV1}/user-marker/${id}`, {
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
    removeRequestFromList(id);
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось отклонить заявку",
    };
  }
}
function removeRequestFromList(id: string) {
  pageData.value.requests = pageData.value.requests.filter(
    (request) => request.id !== id,
  );
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
    relatedTaskIds: null,
    coordinates: [],
  });
  selectedHotbed.value =
    existingHotbedsByType.value[existingHotbedsByType.value.length - 1];
  isMapOpen.value = true;
}
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
  &__content-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
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
    height: 80dvh;
    width: 1200px;
    max-width: 100%;
  }
}
</style>
