<template>
  <CDialog
    v-model="dialogVisible"
    class="b-dialog"
    title="Изменение очага"
    :sub-title="subTitle"
    @show="formBindValidation"
  >
    <div class="b-dialog__container" :class="`b-dialog__container--step-${currentStep}`">
      <q-form
        v-if="localHotbed"
        ref="formRef"
        novalidate
        greedy
        class="b-dialog__form"
        @submit="onSubmit"
      >
        <template v-if="currentStep === 1">
          <section class="b-dialog__section">
            <div class="b-dialog__section-content">
              <CInputSelect
                v-model="localHotbed.details.problemAreaType"
                @update:model-value="handleProblemAreaTypeChange"
                :options="store.formattedProblemAreaTypes"
                label="Тип проблемы"
              ></CInputSelect>
              <CInputSelect
                v-model="localHotbed.details.landType"
                :options="store.formattedLandTypes"
                label="Тип земель"
              ></CInputSelect>
              <CInputSelect
                v-model="localHotbed.details.eliminationMethod"
                :options="hotbedEliminationMethods"
                :disabled="!localHotbed.details.problemAreaType"
                :hint="!localHotbed.details.problemAreaType ? 'Выберите тип проблемы' : ''"
                label="Метод по устранению"
              ></CInputSelect>
              <CInputSelect
                v-model="localHotbed.details.density"
                :options="HOTBED_DENSITIES_OPTIONS"
                label="Плотность распространения"
              ></CInputSelect>
              <CInput
                v-model="localHotbed.details.owner"
                label="Владелец"
                required
                class="b-dialog__field"
              />
              <CInput
                v-model="localHotbed.details.contractingOrganization"
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
          <CButton
            :label="applyLabel"
            :loading="props.editState === 'loading'"
            :disabled="formHasError"
            type="submit"
          />
        </footer>
      </q-form>
    </div>
  </CDialog>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

interface Props {
  modelValue: boolean;
  hotbed: Marker;
  editState: "success" | "loading" | "error";
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "hotbedUpdated", value: Marker): void;
}>();

const { HOTBED_DENSITIES_OPTIONS } = useGetStatusOptions();
const { uploadPhoto } = useFiles();
const store = useMainStore();
const { formRef, formBindValidation, formHasError } = useFormValidation();

const FILES_MAX_SIZE = 10_000_000;

const localHotbed = ref<Marker>();
const dialogVisible = ref(props.modelValue);
const hotbedEliminationMethods = ref<ItemOption[]>([]);
const attachedFiles = ref<(ImageObj | File)[]>([]);
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
function handleProblemAreaTypeChange(newArea: string) {
  if (!localHotbed.value) return;
  localHotbed.value.details.eliminationMethod = "";
  getEliminationMethodsByArea(newArea);
}
async function getEliminationMethodsByArea(area: string) {
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
async function updateHotbed() {
  if (!localHotbed.value) return;
  localHotbed.value.details.images = [];
  for (const file of attachedFiles.value) {
    let image: ImageObj | null = null;
    if (file instanceof File) {
      image = await uploadPhoto(file);
    } else {
      image = file as ImageObj;
    }
    localHotbed.value.details.images.push(image);
  }
  emits("hotbedUpdated", localHotbed.value);
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
function configureData() {
  localHotbed.value = structuredClone(toRaw(props.hotbed));
  attachedFiles.value = [...props.hotbed.details.images];
  getEliminationMethodsByArea(props.hotbed.details.problemAreaType);
}
function resetForm() {
  currentStep.value = 1;
  subTitle.value = "";
  cancelLabel.value = "Отмена";
  applyLabel.value = "Далее";
  localHotbed.value = structuredClone(toRaw(props.hotbed));
  attachedFiles.value = [...props.hotbed.details.images];
}
onMounted(() => {
  if (!props.hotbed) {
    return;
  }
  configureData();
});
watch(
  () => props.hotbed,
  (newVal) => {
    if (!newVal) {
      return;
    }
    configureData();
  },
);
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  },
);
watch(dialogVisible, (newVal) => {
  emits("update:modelValue", newVal);
});
watch(
  () => props.editState,
  (newVal, oldVal) => {
    if (newVal === "success" && oldVal === "loading") {
      resetForm();
    }
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
    width: 600px;
    max-width: 100%;
  }
  &__form {
    display: flex;
    flex-direction: column;
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
