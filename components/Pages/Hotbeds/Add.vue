<template>
  <CDialog
    v-model="dialogVisible"
    class="b-dialog"
    :title="props.minimal ? '' : 'Добавление очага'"
    :sub-title="subTitle"
    @show="nextTick(formBindValidation)"
  >
    <div class="b-card" :class="`b-card--step-${currentStep}`">
      <q-form ref="formRef" novalidate greedy class="b-form" @submit="onSubmit">
        <template v-if="currentStep === 1 && !props.initialHotbed">
          <section class="b-form__section b-form__map">
            <q-card>
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
                :editableMarkers="[props.from === 'user' ? '' : addedHotbed?.id || '']"
              ></CMap>
            </q-card>
          </section>
        </template>
        <template v-else-if="currentStep === 2 && !props.minimal">
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
                @update:model-value="changeHotbedDensity"
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
        <template v-else-if="currentStep === 3 && !props.minimal">
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
        <template v-else-if="currentStep === 4 && !props.minimal">
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
        <template v-if="props.minimal">
          <CInputSelect
            v-model="hotbedData.problemAreaType"
            :options="store.formattedProblemAreaTypes"
            label="Тип проблемы"
          ></CInputSelect>
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
    </div>
  </CDialog>
</template>

<script setup lang="ts">
import type { Coordinate } from "ol/coordinate";
import { useMainStore } from "~/store/main";
import type { HotbedData } from "~/types/interfaces/hotbeds";

interface Props {
  modelValue: boolean;
  hotbeds?: Marker[];
  initialHotbed?: Marker | null;
  minimal?: boolean;
  from?: "user" | "employee";
}

const props = withDefaults(defineProps<Props>(), {
  minimal: false,
  from: "employee",
});
const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "hotbedCreated", hotbedData: HotbedData): void;
}>();

const store = useMainStore();
const { formRef, formBindValidation, formHasError } = useFormValidation();
const { HOTBED_WORK_STAGE_STYLES, HOTBED_DENSITIES_OPTIONS } =
  useGetStatusOptions();

const FILES_MAX_SIZE = 10_000_000;

const dialogVisible = ref(props.modelValue);
const existingHotbeds = ref<Marker[]>([]);
const hotbedEliminationMethods = ref<ItemOption[]>([]);
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
  contractingOrganization: {
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
function handleExternalHotbed(marker?: Marker | null) {
  if (!marker) return;
  existingHotbeds.value = [marker];
  isAddMarker.value = true;
  hotbedData.value.coordinate = marker.coordinate;
  hotbedData.value.coordinates = marker.coordinates || null;
  Object.assign(hotbedData.value, { ...marker.details });
  if (currentStep.value === 1) {
    currentStep.value = 2;
    updateLabels();
  }
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
    ?.isTempCreatedBy
    ? existingHotbeds.value[existingHotbeds.value.length - 1]
    : null;
});
function addTempHotbed(coordinate: Coordinate, zone?: ZoneWithDensity) {
  hotbedData.value.coordinate = coordinate;
  hotbedData.value.coordinates = zone?.coordinates || null;
  existingHotbeds.value.push({
    id: "user-temp-created",
    coordinate: coordinate,
    isTempCreatedBy: props.from === "user" ? "user" : "employee",
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
  if (
    currentStep.value === 1 ||
    (currentStep.value === 2 && props.initialHotbed)
  ) {
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
      `${store.apiV1}/geo/dict/elimination-methods/${area}`,
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
function changeHotbedDensity() {
  if (hotbedData.value.density) {
    const hotbedIndex = existingHotbeds.value.findIndex(
      (m) => m.isTempCreatedBy,
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
  emits("hotbedCreated", hotbedData.value);
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
    }>(`${store.apiV1}/file/image/upload`, {
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
  } else if (currentStep.value === 2 && props.minimal && props.initialHotbed) {
    createHotbed();
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
  } else if (currentStep.value === 2 && props.minimal) {
    cancelLabel.value = "Отмена";
    applyLabel.value = props.minimal
      ? props.from === "user"
        ? "Подтвердить"
        : "Создать"
      : "Далее";
    subTitle.value = "Выберите тип добавляемой проблемы";
  } else if (currentStep.value === 2 && props.initialHotbed) {
    cancelLabel.value = "Отмена";
    applyLabel.value = "Далее";
    subTitle.value = "Заполните данные по добавляемому очагу";
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
  currentStep.value = props.initialHotbed ? 2 : 1;
  updateLabels();
  hotbedData.value = {
    problemAreaType: "",
    landType: "",
    eliminationMethod: "",
    owner: "",
    contractingOrganization: "",
    comment: "",
    images: [],
    density: props.initialHotbed ? props.initialHotbed.details.density : null,
    coordinate: props.initialHotbed ? props.initialHotbed.coordinate : null,
    coordinates: props.initialHotbed ? props.initialHotbed.coordinates : null,
  };
  existingHotbeds.value = [];
  attachedFiles.value = [];
  isAddMarker.value = !!props.initialHotbed;
}
watch(
  () => props.hotbeds,
  (newVal) => {
    existingHotbeds.value = newVal ? [...newVal] : [];
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
    emits("update:modelValue", newVal);
  },
);
onMounted(() => {
  existingHotbeds.value = props.hotbeds || [];
  if (props.initialHotbed) {
    handleExternalHotbed(props.initialHotbed);
  }
});
watch(
  () => props.initialHotbed,
  (newVal) => handleExternalHotbed(newVal),
  { deep: true },
);
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
    div {
      width: 100%;
      height: 100%;
    }
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
    margin-bottom: 8px;
    @media screen and (max-width: $app-mobile) {
      display: block;
      .b-form__info-label {
        display: block;
        margin-bottom: 4px;
      }
    }
  }
  &__info-label {
    color: var(--app-grey-300);
    width: 222px;
    min-width: 222px;
  }
  &__info-value {
    color: var(--app-grey-500);
    display: flex;
    align-items: center;
    overflow-wrap: anywhere;
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
  max-width: 100%;
  &--step-1 {
    width: 1200px;
  }
  &--step-2 {
    width: 600px;
  }
  &--step-3 {
    width: 600px;
    .b-form {
      &__section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
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
