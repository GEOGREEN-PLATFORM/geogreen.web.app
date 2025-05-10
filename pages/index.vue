<template>
  <div class="b-page">
    <div
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
    <div class="b-page__content">
      <q-card class="b-page__map-container">
        <div id="page-map" class="b-page__map-wrapper">
          <CMap
            @add-marker="addTempHotbed"
            @edit-marker="editTempHotbed"
            @delete-marker="deleteTempHotbed"
            @forbiddenAddMarker="handleForbiddenAddTry"
            :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
            :addMarker="isAddMarker ? 'forbid' : 'enable'"
            :markers="existingHotbeds"
            :shortInfoKeys="shortMarkerInfoNameKeys"
            :selectedMarker="addedHotbed"
            :editableMarkers="[addedHotbed?.id || '']"
          ></CMap>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";
const isTop = ref(true);
const onScroll = () => {
  isTop.value = window.scrollY < 10;
  route.meta.transparentHeader = isTop.value;
};
definePageMeta({
  transparentHeader: isTop.value,
});
const colorMode = useColorMode();
const store = useMainStore();
const isMobile = ref(false);
onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  getHotbeds();
  onScroll();
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
onMounted(() => {
  isMobile.value = window.innerWidth < 364;
});
import type { Coordinate } from "ol/coordinate";
import type { HotbedData } from "~/types/interfaces/hotbeds";

const { formRef, formBindValidation, formHasError } = useFormValidation();
const { HOTBED_WORK_STAGE_STYLES, HOTBED_DENSITIES_OPTIONS } =
  useGetStatusOptions();

const FILES_MAX_SIZE = 10_000_000;

const existingHotbeds = ref<Marker[]>([]);
const hotbedEliminationMethods = ref<ItemOption[]>([]);
const attachedFiles = ref<File[]>([]);
const cancelLabel = ref("Отмена");
const applyLabel = ref("Далее");
const subTitle = ref("Отметьте на карте новый очаг проблемы");
const currentStep = ref(1);
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
async function uploadFiles(files: File[]) {
  const currentTotal = attachedFiles.value.reduce((sum, f) => sum + f.size, 0);
  const newFilesTotal = files.reduce((sum, f) => sum + f.size, 0);
  if (newFilesTotal + currentTotal > FILES_MAX_SIZE) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: `Добавляемые файлы превышают ${FILES_MAX_SIZE / 1e6} MB`,
    };
    return;
  }
  files.forEach((file) => {
    attachedFiles.value.push(file);
  });
}
function onSubmit() {
  formRef.value?.validate().then((success) => {
    if (success) {
      nextStep();
    }
  });
}
const addedHotbed = computed(() => {
  return existingHotbeds.value[existingHotbeds.value.length - 1]
    ?.isTempCreatedBy === "employee"
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
    isTempCreatedBy: "employee",
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
function editTempHotbed(hotbedId: string, marker: Marker) {
  const hotbedIndex = existingHotbeds.value.findIndex((m) => m.id === hotbedId);
  existingHotbeds.value[hotbedIndex] = marker;
  if (marker.details.density) {
    hotbedData.value.density = marker.details.density;
  }
  hotbedData.value.coordinates = marker?.coordinates || null;
}
const isAddMarker = shallowRef(false);
function onBack() {
  if (currentStep.value === 1) {
    resetForm();
  } else {
    currentStep.value--;
    updateLabels();
  }
}
async function getEliminationMethodsByArea(area: string) {
  hotbedData.value.eliminationMethod = "";
  hotbedEliminationMethods.value = (
    await $fetch<string[]>(
      `${store.apiGeospatial}/geo/dict/elimination-methods/${area}`,
      {
        method: "GET",
        headers: { Authorization: useGetToken() },
      },
    )
  ).map((elem) => ({
    name: elem,
    value: elem,
  }));
}
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
function changeHotdedsDensity() {
  if (hotbedData.value.density) {
    const hotbedIndex = existingHotbeds.value.findIndex(
      (m) => m.isTempCreatedBy === "employee",
    );
    if (hotbedIndex === -1) return;
    existingHotbeds.value[hotbedIndex].details.density = hotbedData.value
      .density as Density;
  }
}
async function createHotbed() {
  for (const file of attachedFiles.value) {
    const image = await uploadPhoto(file);
    hotbedData.value.images.push(image);
  }
  resetForm();
}
async function uploadPhoto(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await $fetch<{
      previewImageId: string;
      fullImageId: string;
    }>(`${store.apiFileServer}/file/image/upload`, {
      method: "POST",
      body: formData,
    });
    return response;
  } catch (err) {
    throw new Error("Ошибка при загрузке фото");
  }
}
function nextStep() {
  if (currentStep.value === 1) {
    currentStep.value++;
    updateLabels();
    nextTick(() => {
      formBindValidation();
    });
  } else if (currentStep.value === 2) {
    currentStep.value++;
    updateLabels();
  } else if (currentStep.value === 3) {
    currentStep.value++;
    updateLabels();
  } else if (currentStep.value === 4) {
    createHotbed();
  }
}

function updateLabels() {
  if (currentStep.value === 1) {
    cancelLabel.value = "Отмена";
    applyLabel.value = "Далее";
    subTitle.value = "Отметьте на карте новый очаг проблемы";
  } else if (currentStep.value === 2) {
    cancelLabel.value = "Назад";
    applyLabel.value = "Далее";
    subTitle.value = "Заполните данные по добавляемому очагу";
  } else if (currentStep.value === 3) {
    cancelLabel.value = "Назад";
    applyLabel.value = "Далее";
    subTitle.value = "Проверьте корректность введённых данных";
  } else if (currentStep.value === 4) {
    cancelLabel.value = "Назад";
    applyLabel.value = "Создать";
    subTitle.value = "Добавьте комментарий и изображения создаваемого очага";
  }
}

function resetForm() {
  currentStep.value = 1;
  subTitle.value = "";
  cancelLabel.value = "Отмена";
  applyLabel.value = "Далее";
  hotbedData.value = {
    problemAreaType: "",
    landType: "",
    eliminationMethod: "",
    owner: "",
    contractingOrganization: "",
    comment: "",
    images: [],
    density: null,
    coordinate: null,
    coordinates: null,
  };
  existingHotbeds.value = [];
  attachedFiles.value = [];
  isAddMarker.value = false;
}
watch(
  () => hotbedData.value,
  (newData) => {
    const details = addedHotbed.value?.details;
    if (details) {
      Object.keys(newData).forEach((key) => {
        if (Object.hasOwn(newData, key) && Object.hasOwn(details, key)) {
          // @ts-expect-error динамическое присвоение
          details[key] = newData[key];
        }
      });
    }
  },
  { deep: true },
);
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
      border-radius: 32px;
      .b-page__map-wrapper {
        height: 100%;
        width: 100%;
        border-radius: 16px;
        overflow: hidden;
      }
    }
  }
}
</style>
