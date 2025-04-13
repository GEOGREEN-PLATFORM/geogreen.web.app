<template>
  <main class="b-page">
    <header class="b-page__header q-my-lg">
      <div class="b-page__title-wrapper">
        <h1 class="b-page__title gg-h1">Заявки</h1>
      </div>
    </header>
    <section class="b-page__content">
      <div class="b-filter q-mb-lg">
        <CFilter v-model="filters"></CFilter>
      </div>
      <q-scroll-area class="b-page__requests-container">
        <section class="b-page__requests">
          <q-card v-for="request in requests" class="b-request-card">
            <header class="b-request-card__header">
              <div class="b-request-card__title-wrapper">
                <h2 class="b-request-card__title gg-h2">{{ request.problemType.code }}</h2>
                <div class="b-request-card__reliability-icon">
                  <q-icon
                    :name="request.photoVerification ? mdiCheck : mdiAlert"
                    size="24px"
                    :color="request.photoVerification ? 'green-500' : 'red-500'"
                  />
                </div>
              </div>
              <span class="b-request-card__timestamp gg-caption"> {{ request.createDate }} </span>
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
                  <FileContainers
                    :files="formatToUrl(request.images)"
                    :clearable="false"
                    hide-caption
                  ></FileContainers>
                </div>
              </section>
            </section>
            <footer class="b-request-card__footer justify-between">
              <div>
                <GGButton @click="approveRequest(request.id)" label="Принять заявку"></GGButton>
              </div>
              <div>
                <GGButton
                  @click="rejectRequest(request.id)"
                  label="Отклонить заявку"
                  bg-color="var(--app-red-500)"
                ></GGButton>
              </div>
            </footer>
          </q-card>
        </section>
      </q-scroll-area>
    </section>
    <GGDialog v-model="isMapOpen" class="b-dialog">
      <div class="b-dialog__content">
        <Map
          :dataStatusStyles="workStageStyles"
          :markers="existingHotbedsByType"
          :shortInfoKeys="shortMarkerInfoNameKeys"
          hide-controls
          :selectedMarker="selectedHotbed"
        ></Map>
      </div>
    </GGDialog>
  </main>
</template>

<script setup lang="ts">
import { mdiAlert, mdiCheck } from "@quasar/extras/mdi-v6";
import { useMainStore } from "~/store/main";

interface RequestData {
  id: string;
  x: number;
  y: number;
  userPhone?: string;
  userEmail?: string;
  userComment?: string;
  images: string[];
  status: string;
  createDate: string;
  operatorComment: string;
  photoVerification: boolean;
  updateDate: string;
  operatorName: null;
  operatorId: null;
  problemAreaType: string;
}
const store = useMainStore();
const PROBLEM_AREA_TYPE_OPTIONS = [
  {
    name: "Борщевик",
    value: "Борщевик",
  },
  {
    name: "Свалка",
    value: "Свалка",
  },
  {
    name: "Пожар",
    value: "Пожар",
  },
];
const shortMarkerInfoNameKeys = ref({
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
const workStageStyles = {
  Создано: "background-color: var(--app-blue-400)",
  "В работе": "background-color: var(--app-green-400)",
  Завершено: "background-color: var(--app-grey-400)",
};
const isMapOpen = shallowRef(false);
const existingHotbedsByType = ref<Marker[]>([]);
const selectedHotbed = ref<Marker>();
const filters = reactive<FilterItem[]>([
  {
    type: "select",
    key: "problemAreaType",
    label: "Тип проблемы",
    selected: "",
    data: PROBLEM_AREA_TYPE_OPTIONS,
  },
  {
    type: "date-range",
    key: "periodCreated",
    selected: "",
    label: "Период создания",
  },
]);

const requests = ref<RequestData[]>([]);
async function getUserRequests() {
  requests.value = await $fetch(`${store.apiUserReport}/report/getAll`, {
    method: "GET",
    headers: {
      authorization: useGetToken(),
    },
  });
}
async function getExistingHotbedsOfProblemsByType(
  problemAreaType: ProblemAreaTypes,
) {
  const data = await $fetch<Marker[]>(
    `${store.apiGeospatial}/geo/info/getAll/${problemAreaType}`,
  );
  existingHotbedsByType.value = data;
}
function formatToUrl(images: string[]) {
  return images.map(
    (image) => `${store.apiFileServer}/file/image/download/${image}`,
  );
}
async function approveRequest(id: string) {
  requests.value = await $fetch(`${store.apiUserReport}/report/${id}`, {
    method: "PUT",
  });
  getUserRequests();
}

async function rejectRequest(id: string) {
  requests.value = await $fetch(`${store.apiUserReport}/report/${id}`, {
    method: "PUT",
    body: {
      statusCode: "Отклонена",
      operatorComment: "тут много борщевика",
      operatorId: "fae85f64-5717-4562-b3fc-2c963f66afa6",
      operatorName: "Иванов И.И.",
    },
  });
  getUserRequests();
}

async function viewOnMap(request: RequestData) {
  await getExistingHotbedsOfProblemsByType(request.problemType.code);
  existingHotbedsByType.value.push({
    id: "user-temp-created",
    coordinate: [request.x, request.y],
    userTempCreated: true,
    details: {
      square: 21879072,
      owner: "",
      landType: "",
      contractingOrganization: "",
      workStage: "",
      eliminationMethod: "",
      images: [],
      problemAreaType: request.problemType.code,
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
