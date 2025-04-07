<template>
  <main class="b-page">
    <header class="b-header q-my-lg">
      <div class="b-header__title-wrapper">
        <h1 class="b-header__title gg-h1">Заявки</h1>
      </div>
    </header>
    <section class="b-content">
      <div class="b-filter q-mb-lg">
        <CFilter v-model="filters"></CFilter>
      </div>
      <q-card v-for="request in requests" class="b-request-card">
        <header class="b-request-card__header">
          <div class="b-request-card__title">
            <h2 class="b-request-card__title gg-h2">{{ request.problemType.code }}</h2>
            <div class="b-reliability-photo-icon">
              <q-icon :name="mdiCheck" size="24px" color="green-500" />
            </div>
          </div>
          <span class="b-request-card__timestamp gg-caption"> {{ request.createDate }} </span>
        </header>
        <div class="b-request-card__line justify-start">
          <button class="b-request-card__map-button g-label-button gg-t-small" @click="viewOnMap">
            Посмотреть очаг на карте
          </button>
        </div>

        <section class="b-request-card__line request-card__content">
          <p class="b-request-card__comment gg-t-base">{{ request.userComment }}</p>
          <div class="request-card__images">
            <FileContainers :files="formatToUrl(request.images)"></FileContainers>
          </div>
        </section>
        <footer class="b-request-card__line justify-between">
          <GGButton @click="approveRequest" label="Принять заявку" stretch="hug"></GGButton>
          <GGButton
            @click="rejectRequest"
            label="Отклонить заявку"
            bg-color="var(--app-red-500)"
            stretch="hug"
          ></GGButton>
        </footer>
      </q-card>
    </section>
  </main>
</template>

<script setup lang="ts">
import { mdiCheck } from "@quasar/extras/mdi-v6";
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
  });
}
function formatToUrl(images: string[]) {
  return images.map(
    (image) => `${store.apiFileServer}/file/image/download/${image}`,
  );
}
function approveRequest() {
  emits("approve");
}

function rejectRequest() {}

function viewOnMap() {
  emits("viewMap");
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
  .b-account-status {
    display: flex;
    justify-content: center;
    align-items: center;
    &__item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: max-content;
      height: 32px;
      padding: 4px 16px;
      border-radius: 16px;
      color: var(--app-white);
      &--active {
        background-color: var(--app-green-300);
      }
      &--blocked {
        background-color: var(--app-grey-300);
      }
    }
  }
  .b-request-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--app-green-050);
    width: 860px;
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    &__timestamp {
      color: var(--app-grey-400);
    }
    &__title {
      display: flex;
    }
    &__map-button {
      color: var(--app-blue-500);
    }
    &__comment {
      display: flex;
      padding: 8px 12px;
      background-color: var(--app-white);
      color: var(--app-grey-500);
      align-items: flex-start;
      justify-content: flex-start;
      border-radius: 8px;
      width: 516px;
      height: 112px;
    }
    &__line {
      display: flex;
      align-items: center;
      width: 100%;
    }
  }
}
</style>
