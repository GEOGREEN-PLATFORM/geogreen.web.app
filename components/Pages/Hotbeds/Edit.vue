<template>
  <CDialog v-model="dialogVisible" class="b-dialog">
    <q-card class="b-dialog__container" :class="`b-dialog__container--step-${currentStep}`">
      <header class="b-dialog__header">
        <h2 class="b-dialog__title gg-h2">Добавление очага</h2>
        <p v-if="subTitle" class="b-dialog__subtitle">{{ subTitle }}</p>
      </header>
      <q-form ref="formRef" novalidate greedy class="b-dialog__form" @submit="onSubmit">
        <template v-if="currentStep === 1">
          <section class="b-dialog__section">
            <div class="b-dialog__section-content">
              <CInputSelect
                v-model="localHotbedData.details.problemAreaType"
                @update:model-value="getEliminationMethodsByArea"
                :options="store.formattedProblemAreaTypes"
                label="Тип проблемы"
              ></CInputSelect>
              <CInputSelect
                v-model="localHotbedData.details.landType"
                :options="store.formattedLandTypes"
                label="Тип земель"
              ></CInputSelect>
              <CInputSelect
                v-model="localHotbedData.details.eliminationMethod"
                :options="hotbedEliminationMethods"
                :disabled="!localHotbedData.details.problemAreaType"
                :hint="!localHotbedData.details.problemAreaType ? 'Выберите тип проблемы' : ''"
                label="Метод по устранению"
              ></CInputSelect>
              <CInputSelect
                v-model="localHotbedData.details.density"
                :options="HOTBED_DENSITIES_OPTIONS"
                label="Плотность распространения"
              ></CInputSelect>
              <CInput
                v-model="localHotbedData.details.owner"
                label="Владелец"
                required
                class="b-dialog__field"
              />
              <CInput
                v-model="localHotbedData.details.contractingOrganization"
                label="Подрядная организация"
                required
                class="b-dialog__field"
              />
            </div>
          </section>
        </template>
        <template v-else-if="currentStep === 2">
          <section class="b-dialog__section">
            <fieldset class="b-dialog__fieldset">
              <legend class="b-dialog__legend gg-h3 q-mb-sm">Фотографии</legend>
              <CDragDrop
                @add="uploadFiles"
                class="b-dialog__upload-file-container"
                :maxSize="FILES_MAX_SIZE"
              ></CDragDrop>
              <section v-if="attachedFiles.length > 0" class="b-dialog__added-images">
                <CFileContainers v-model:files="attachedFiles"></CFileContainers>
              </section>
            </fieldset>
          </section>
        </template>

        <footer class="b-dialog__footer">
          <CButton @click="onBack" design-type="tertiary" :label="cancelLabel" />
          <CButton :label="applyLabel" :disabled="formHasError" type="submit" />
        </footer>
      </q-form>
    </q-card>
  </CDialog>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";
interface Props {
  modelValue: boolean;
  hotbed: any;
}

const { HOTBED_WORK_STAGE_STYLES, HOTBED_DENSITIES_OPTIONS } =
  useGetStatusOptions();
const { uploadPhoto } = useFiles();
const localHotbedData = ref({} as any);
const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue", "hotbedUpdated"]);
const store = useMainStore();
const dialogVisible = ref(props.modelValue);
const { formRef, formBindValidation, formHasError } = useFormValidation();

watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  },
);
watch(dialogVisible, (newVal) => {
  emit("update:modelValue", newVal);
});
const hotbedEliminationMethods = ref();
const FILES_MAX_SIZE = 10_000_000;
const attachedFiles = ref<File[]>([]);
const cancelLabel = ref("Отмена");
const applyLabel = ref("Далее");
const subTitle = ref("Измените данные по очагу");
const currentStep = ref(1);
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
  localHotbedData.value.eliminationMethod = "";
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
async function updateHotbed() {
  localHotbedData.value.details.images = [];
  for (const file of attachedFiles.value) {
    let image = null;
    if (file instanceof File) {
      image = await uploadPhoto(file);
    } else {
      image = file;
    }
    localHotbedData.value.details.images.push(image);
  }
  emit("hotbedUpdated", localHotbedData.value);
}
function nextStep() {
  if (currentStep.value === 1) {
    currentStep.value++;
    updateLabels();
  } else if (currentStep.value === 2) {
    updateHotbed();
  }
}

function updateLabels() {
  if (currentStep.value === 1) {
    cancelLabel.value = "Отмена";
    applyLabel.value = "Далее";
    subTitle.value = "Измените данные по очагу";
  } else if (currentStep.value === 2) {
    cancelLabel.value = "Назад";
    applyLabel.value = "Сохранить";
    subTitle.value = "Измените изображения очага";
  }
}

function resetForm() {
  currentStep.value = 1;
  subTitle.value = "";
  cancelLabel.value = "Отмена";
  applyLabel.value = "Далее";
}
onMounted(() => {
  if (!props.hotbed) {
    return;
  }
  localHotbedData.value = props.hotbed;
  attachedFiles.value = props.hotbed.details.images;
});
watch(
  () => props.hotbed,
  (newVal) => {
    if (!newVal) {
      return;
    }
    localHotbedData.value = newVal;
    attachedFiles.value = newVal.details.images;
  },
);
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.b-dialog {
  &__container {
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
  &__form {
    display: flex;
    flex-direction: column;
  }
  &__section {
    padding-top: 20px;
  }
  &__map {
    height: 60vh;
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
