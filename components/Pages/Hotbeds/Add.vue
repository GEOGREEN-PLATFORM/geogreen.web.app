<template>
  <CDialog v-model="dialogVisible" class="b-dialog" @show="formBindValidation">
    <q-card class="b-card" :class="`b-card--step-${currentStep}`">
      <header class="b-card__header">
        <h2 class="b-card__title gg-h2">Добавление очага</h2>
        <p v-if="subTitle" class="b-card__subtitle">{{ subTitle }}</p>
      </header>
      <q-form ref="formRef" novalidate greedy class="b-form" @submit="onSubmit">
        <template v-if="currentStep === 1">
          <section class="b-form__section b-form__map">
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
            ></CMap>
          </section>
        </template>
        <template v-else-if="currentStep === 2">
          <section class="b-form__section">
            <div class="b-form__section-content">
              <CInputSelect
                v-model="hotbedData.problemAreaType"
                @update:model-value="getEliminationMethodsByArea"
                :options="store.formattedProblemAreaTypes"
                label="Тип проблемы"
              ></CInputSelect>
              <CInputSelect
                v-model="hotbedData.landType"
                :options="store.formattedLandTypes"
                label="Тип земель"
              ></CInputSelect>
              <CInputSelect
                v-model="hotbedData.eliminationMethod"
                :options="hotbedEliminationMethods"
                :disabled="!hotbedData.problemAreaType"
                :hint="!hotbedData.problemAreaType ? 'Выберите тип проблемы' : ''"
                label="Метод по устранению"
              ></CInputSelect>
              <CInputSelect
                v-model="hotbedData.density"
                @update:model-value="changeHotdedsDensity"
                :options="HOTBED_DENSITIES_OPTIONS"
                label="Плотность распространения"
              ></CInputSelect>
              <CInput v-model="hotbedData.owner" label="Владелец" class="b-form__field" />
              <CInput
                v-model="hotbedData.contractingOrganization"
                label="Подрядная организация"
                class="b-form__field"
              />
            </div>
          </section>
        </template>
        <template v-else-if="currentStep === 3">
          <section class="b-form__section">
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Тип проблемы:</span>
              <span class="b-form__info-value">{{ hotbedData.problemAreaType }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Тип земель:</span>
              <span class="b-form__info-value">{{ hotbedData.landType }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Метод по устранению:</span>
              <span class="b-form__info-value">{{ hotbedData.eliminationMethod }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Плотность распространения:</span>
              <span class="b-form__info-value">{{
                HOTBED_DENSITIES_OPTIONS.find((d) => d.value === hotbedData.density)?.name
              }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Владелец:</span>
              <span class="b-form__info-value">{{ hotbedData.owner }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Подрядная организация:</span>
              <span class="b-form__info-value">{{ hotbedData.contractingOrganization }}</span>
            </div>
          </section>
        </template>
        <template v-else-if="currentStep === 4">
          <section class="b-form__section">
            <fieldset class="b-form__fieldset q-mb-md">
              <legend class="b-form__legend gg-h3 q-mb-sm">Комментарий</legend>
              <CInputTextarea
                class="b-form__comment"
                placeholder="Кратко опишите проблему"
                v-model="hotbedData.comment"
              ></CInputTextarea>
            </fieldset>
            <fieldset class="b-form__fieldset">
              <legend class="b-form__legend gg-h3 q-mb-sm">Фотографии</legend>
              <CDragDrop
                @add="uploadFiles"
                class="b-form__upload-file-container"
                :maxSize="FILES_MAX_SIZE"
              ></CDragDrop>
              <section v-if="attachedFiles.length > 0" class="b-form__added-images">
                <CFileContainers v-model:files="attachedFiles" raw></CFileContainers>
              </section>
            </fieldset>
          </section>
        </template>

        <footer class="b-form__footer">
          <CButton @click="onBack" design-type="tertiary" :label="cancelLabel" />
          <CButton
            :label="applyLabel"
            :disabled="(currentStep === 2 && formHasError) || !isAddMarker"
            type="submit"
          />
        </footer>
      </q-form>
    </q-card>
  </CDialog>
</template>

<script setup lang="ts">
import type { Coordinate } from "ol/coordinate";
import { useMainStore } from "~/store/main";
interface Props {
  modelValue: boolean;
  hotbeds: Marker[];
}
interface HotbedData {
  problemAreaType: string;
  landType: string;
  eliminationMethod: string;
  owner: string;
  contractingOrganization: string;
  comment: string;
  images: ImageObj[];
  density: Density;
  coordinate: Coordinate | null;
  coordinates: Coordinate[];
}
const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue", "hotbedCreated"]);
const store = useMainStore();
const dialogVisible = ref(props.modelValue);
const { formRef, formBindValidation, formHasError } = useFormValidation();
const existingHotbeds = ref<Marker[]>([]);
const hotbedEliminationMethods = ref<ItemOption[]>([]);
const { HOTBED_WORK_STAGE_STYLES, HOTBED_DENSITIES_OPTIONS } =
  useGetStatusOptions();
const FILES_MAX_SIZE = 10_000_000;
const attachedFiles = ref<File[]>([]);
const cancelLabel = ref("Отмена");
const applyLabel = ref("Далее");
const subTitle = ref("Отметьте на карте новый очаг проблемы");
const currentStep = ref(1);
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
  coordinates: [],
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
    .isTempCreatedBy === "employee"
    ? existingHotbeds.value[existingHotbeds.value.length - 1]
    : null;
});
function addTempHotbed(coordinate: Coordinate, zone?: ZoneWithDensity) {
  hotbedData.value.coordinate = coordinate;
  hotbedData.value.coordinates = zone?.coordinates || [];
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
      problemAreaType: undefined,
      comment: "",
      density: zone?.density,
    },
    relatedTaskId: null,
    coordinates: zone?.coordinates || [],
  });
  isAddMarker.value = true;
}
function editTempHotbed(hotbedId: string, marker: Marker) {
  const hotbedIndex = existingHotbeds.value.findIndex((m) => m.id === hotbedId);
  existingHotbeds.value[hotbedIndex] = marker;
  if (marker.details.density) {
    hotbedData.value.density = marker.details.density;
  }
  hotbedData.value.coordinates = marker?.coordinates || [];
}
const isAddMarker = shallowRef(false);
function onBack() {
  if (currentStep.value === 1) {
    resetForm();
    dialogVisible.value = false;
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
  emit("hotbedCreated", hotbedData.value);
  dialogVisible.value = false;
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
    density: "default",
    coordinate: null,
    coordinates: [],
  };
}
watch(
  () => props.hotbeds,
  (newVal) => {
    existingHotbeds.value = newVal;
  },
);
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

watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  },
);
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit("update:modelValue", newVal);
  },
);
onMounted(() => {
  existingHotbeds.value = props.hotbeds;
});
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.b-dialog {
}
.b-form {
  display: flex;
  flex-direction: column;
  &__map {
    height: 60vh;
    border-radius: 8px;
    overflow: hidden;
  }
  &__section-title {
    margin-bottom: 12px;
  }
  &__section-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  &__fields-row {
    display: flex;
    gap: 12px;
    @media screen and (max-width: $app-mobile) {
      flex-direction: column;
      gap: 0px;
    }
  }
  &__field {
    flex: 1;
    max-width: 100%;
  }
  &__added-images {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
    padding: 0px 8px;
  }
  &__block-caption {
    padding-bottom: 4px;
    border-bottom: 1px solid var(--app-grey-050);
    width: 100%;
  }
  &__info-row {
    display: flex;
    gap: 4px;
  }
  &__info-label {
    color: var(--app-grey-500);
  }
  &__info-value {
    color: var(--app-grey-300);
  }
  &__footer {
    display: flex;
    gap: 16px;
    margin-top: 32px;
    justify-content: flex-end;
  }
}
.b-card {
  display: flex;
  flex-direction: column;
  background-color: var(--app-white);
  border-radius: 12px;
  padding: 24px 32px;
  width: 90%;
  max-width: 834px;
  @media screen and (max-width: $app-mobile) {
    padding: 12px 24px;
    width: 100%;
  }
  &--step-1 {
    width: 80%;
    max-width: 80%;
  }
  &--step-3 {
    .b-form {
      &__section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
  &__header {
    padding: 16px 0 20px;
  }
  &__title {
    margin: 0;
  }
  &__subtitle {
    margin-top: 10px;
    font-size: 18px;
    color: var(--app-grey-300);
  }
}
@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
.pop-animation {
  animation: pop 0.5s ease;
}
</style>
