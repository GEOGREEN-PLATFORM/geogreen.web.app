<template>
  <div
    class="b-page"
    :class="{
      'b-page--employee-mode': store.user?.role !== 'user',
    }"
  >
    <div
      v-if="store.user?.role === 'user'"
      class="b-hero-background"
      :class="{ 'is-dark': colorMode.preference === 'dark', scrolled: !isTop }"
    >
      <div class="b-hero-background__content">
        <div class="b-hero-background__text">
          МИНИМУМ УСИЛИЙ<br />
          МАКСИМУМ ВЛИЯНИЯ<br />
          GEOGREEN
        </div>
        <div class="b-hero-background__actions">
          <CButton
            @click="navigateTo('/report-problem')"
            label="Сообщить о проблеме"
            :size="isMobile ? 'medium' : 'large'"
          ></CButton>
          <CButton
            label="К карте"
            @click="scrollToMap"
            :size="isMobile ? 'medium' : 'large'"
          ></CButton>
        </div>
      </div>
    </div>
    <section class="b-page__content">
      <q-card class="b-card b-page__map-container">
        <h3 class="gg-h3 q-mb-md">
          Интерактивная карта<q-icon><CHint></CHint></q-icon>
        </h3>
        <ol v-if="store.user?.role === 'user'" class="gg-t-big b-card__list">
          <li>Отметьте точку на карте, соответствующую расположению проблемы</li>
          <li>
            Во всплывшем окне созданного очага нажмите кнопку "Продолжить" и укажите тип проблемы
          </li>
          <li>Подтвердите отправку сообщения</li>
        </ol>
        <div id="page-map" class="b-page__map-wrapper">
          <CMap
            @add-marker="addTempHotbed"
            @edit-marker="editHotbed"
            @delete-marker="deleteTempHotbed"
            @forbiddenAddMarker="handleForbiddenAddTry"
            :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
            :addMarker="isAddMarker ? 'forbid' : 'enable'"
            :add-zone="store.user?.role === 'user' ? 'hide' : 'enable'"
            :markers="existingHotbeds"
            :shortInfoKeys="shortMarkerInfoNameKeys"
            :selectedMarker="addedHotbed"
            :non-checkable-markers="store.user?.role === 'user' ? 'all' : 'none'"
            :editableMarkers="store.user?.role === 'user' ? 'none' : 'all'"
          >
            <template #custom-temp-action>
              <CButton
                :label="store.user?.role === 'user' ? 'Продолжить' : 'Указать данные'"
                @click="dialogVisible = true"
                size="small"
              ></CButton>
            </template>
          </CMap>
        </div>
      </q-card>
    </section>
    <PagesHotbedsAdd
      v-model="dialogVisible"
      :initial-hotbed="addedHotbed"
      :minimal="store.user?.role === 'user'"
      :from="store.user?.role === 'user' ? 'user' : 'employee'"
      @hotbed-created="handleCreatedHotbed"
    ></PagesHotbedsAdd>
  </div>
</template>

<script setup lang="ts">
import type { Coordinate } from "ol/coordinate";
import { useMainStore } from "~/store/main";
import type { HotbedData } from "~/types/interfaces/hotbeds";

definePageMeta({
  transparentHeader: true,
});

const isTop = ref(true);
const onScroll = () => {
  isTop.value = window.scrollY < 10;
  route.meta.transparentHeader = isTop.value;
};

const colorMode = useColorMode();
const store = useMainStore();
const isMobile = ref(false);
const { HOTBED_WORK_STAGE_STYLES } = useGetStatusOptions();
const existingHotbeds = ref<Marker[]>([]);
const dialogVisible = ref(false);
const hotbedsLoading = ref(false);
const route = useRoute();
const hotbedData = ref<HotbedData>({
  problemAreaType: "",
  landType: "",
  eliminationMethod: "",
  owner: "",
  contractingOrganization: "",
  comment: "",
  images: [],
  density: "default",
  coordinate: null,
  coordinates: null,
});
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

const addedHotbed = computed(() => {
  return existingHotbeds.value[existingHotbeds.value.length - 1]
    ?.isTempCreatedBy
    ? existingHotbeds.value[existingHotbeds.value.length - 1]
    : null;
});
async function getHotbeds() {
  hotbedsLoading.value = true;
  const url = `${store.apiGeospatial}/geo/info/getAll`;
  const response = await $fetch<Marker[]>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  existingHotbeds.value = response;
  // pagination.value.rowsNumber = response.totalItems;
  hotbedsLoading.value = false;
}
function scrollToMap() {
  const mapElement = document.getElementById("page-map");
  if (mapElement) {
    mapElement.scrollIntoView({ behavior: "smooth" });
  }
}
function addTempHotbed(coordinate: Coordinate, zone?: ZoneWithDensity) {
  hotbedData.value.coordinate = coordinate;
  hotbedData.value.coordinates = zone?.coordinates || null;
  existingHotbeds.value.push({
    id: "user-temp-created",
    coordinate: coordinate,
    isTempCreatedBy: store.user?.role === "user" ? "user" : "employee",
    details: {
      square: 0,
      owner: "",
      landType: "",
      contractingOrganization: "",
      workStage: "",
      eliminationMethod: "",
      images: [],
      problemAreaType: "",
      comment: "",
      density: zone?.density || null,
    },
    relatedTaskId: null,
    coordinates: zone?.coordinates || null,
  });
  isAddMarker.value = true;
}
async function editHotbed(hotbedId: string, marker: Marker) {
  if (marker.isTempCreatedBy) {
    const hotbedIndex = existingHotbeds.value.findIndex(
      (m) => m.id === hotbedId,
    );
    existingHotbeds.value[hotbedIndex] = marker;
    if (marker.details.density) {
      hotbedData.value.density = marker.details.density;
    }
    hotbedData.value.coordinates = marker?.coordinates || null;
  } else {
    try {
      await $fetch(`${store.apiGeospatial}/geo/info/${hotbedId}`, {
        method: "PATCH",
        headers: {
          authorization: useGetToken(),
        },
        body: { ...marker, coordinates: marker.coordinates?.[0] || null },
      });
    } catch (err: any) {
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: `Не удалось изменить данные очага: ${err.message}`,
      };
    }
  }
}
const isAddMarker = shallowRef(false);

function deleteTempHotbed(id: string) {
  existingHotbeds.value = existingHotbeds.value.filter(
    (hotbed) => !hotbed.isTempCreatedBy,
  );
  isAddMarker.value = false;
}
function handleForbiddenAddTry() {
  useState<Alert>("showAlert").value = {
    show: true,
    text: "Вы уже добавили очаг на карту. Удалите его, чтобы добавить новый.",
  };
}
async function handleCreatedHotbed(newHotbed: HotbedData) {
  if (store.user?.role === "user") {
    try {
      await $fetch(`${store.apiUserReport}/user-marker/report`, {
        method: "POST",
        headers: {
          authorization: useGetToken(),
        },
        body: {
          coordinate: newHotbed.coordinate,
          details: {
            images: [],
            problemAreaType: newHotbed.problemAreaType,
            userId: store.user?.id || "",
          },
        },
      });
      deleteTempHotbed("user-temp-created");
      useState<Alert>("showAlert").value = {
        show: true,
        type: "success",
        text: "Сообщение о проблеме успешно отправлено на модерацию",
      };
    } catch (err: any) {
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: `Невозможно отправить отчёт: ${err.message}`,
      };
    }
  } else if (store.user?.role === "admin" || store.user?.role === "operator") {
    try {
      await $fetch(`${store.apiGeospatial}/geo/info`, {
        method: "POST",
        headers: {
          authorization: useGetToken(),
        },
        body: {
          coordinate: newHotbed.coordinate,
          details: {
            owner: newHotbed.owner,
            landType: newHotbed.landType,
            contractingOrganization: newHotbed.contractingOrganization,
            eliminationMethod: newHotbed.eliminationMethod,
            images: newHotbed.images,
            workStage: "Создано",
            problemAreaType: newHotbed.problemAreaType,
            comment: newHotbed.comment,
            density: newHotbed.density,
          },
          coordinates: newHotbed.coordinates?.[0] || null,
        },
      });
      useState<Alert>("showAlert").value = {
        show: true,
        type: "success",
        text: "Очаг успешно добавлен на карту",
      };
      getHotbeds();
    } catch (error: any) {
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: "Не удалось добавить очаг",
      };
    }
  }
}
onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  isMobile.value = window.innerWidth < 364;
  getHotbeds();
  onScroll();
  if (store.user?.role !== "user") {
    route.meta.transparentHeader = false;
  }
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.b-page {
  width: 100%;
  height: 120dvh;
  @media screen and (max-width: $app-mobile) {
    height: 100%;
  }
  background-color: var(--app-green-050);
  .b-hero-background {
    position: absolute;
    top: 0;
    left: 50%;
    will-change: width, top, transform, background-color;
    transform: translateX(-50%);
    width: 100%;
    height: 100dvh;
    background-image: url("/public/images/hero_main_bg.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    background-blend-mode: darken;
    background-color: rgba(0, 0, 0, 0);
    transition:
      background-color 0.3s ease,
      width 0.3s ease,
      top 0.3s ease;

    &.is-dark {
      background-color: rgba(0, 0, 0, 0.5);
    }
    &.scrolled {
      @media screen and (min-width: $app-desktop) {
        width: 80%;
        top: 10dvh;
        border-radius: 24px;
      }
    }
    &__content {
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 668px;
      position: relative;
      top: 20dvh;
      left: 15dvw;
      transition:
        top 0.3s ease,
        left 0.3s ease,
        transform 0.3s ease;
      @media screen and (min-width: $app-mobile + 1) and (max-width: $app-laptop) {
        left: 50%;
        gap: 64px;
        transform: translateX(-50%);
        padding: 24px;
      }
      @media screen and (max-width: $app-mobile) {
        max-width: 100dvw;
        padding: 16px;
        left: 0;
      }
      @media screen and (max-width: $app-narrow-mobile) {
        padding: 8px;
      }
      @media screen and (max-height: 800px) and (min-width: $app-laptop + 1) {
        top: calc(50% + 65px / 2);
        transform: translateY(-50%);
      }
      @media screen and (max-height: 800px) and (max-width: $app-laptop) {
        top: calc(50% + 65px / 2);
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    &__text {
      font-family: "Russo One";
      font-size: 48px;
      @media screen and (max-width: $app-narrow-mobile) {
        font-size: 32px;
      }
      @media screen and (max-height: 600px) {
        font-size: 32px;
      }
    }
    &__actions {
      display: flex;
      gap: 64px;
      align-items: center;
      @media screen and (max-width: $app-laptop) {
        flex-direction: column;
        gap: 24px;
      }
    }
  }
  &__content {
    position: absolute;
    background-color: var(--app-green-050);
    height: 100dvh;
    width: 100%;
    top: 100dvh;
    left: 0;
    padding: 32px;
    padding-top: calc(64px + 32px);
    @media screen and (min-width: $app-desktop) {
      top: 120dvh;
    }
    @media screen and (max-width: $app-mobile) {
      padding: 8px;
      padding-top: calc(64px + 8px);
    }
    .b-page__map-container {
      height: 100%;
      width: 100%;
      padding: 16px;
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      .b-page__map-wrapper {
        height: 100%;
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
      }
    }
  }
  &--employee-mode {
    height: 100%;
    .b-page__content {
      position: static;
      padding: 32px;
      height: 100%;
      @media screen and (max-width: $app-mobile) {
        padding: 8px;
      }
    }
  }
}
.b-card__list {
  padding-left: 0;
  list-style-position: inside;
}
</style>
