<template>
  <CDialog
    v-model="dialogVisible"
    class="b-dialog"
    title="Добавление мероприятия"
    @show="formBindValidation"
  >
    <template #subtitle>
      <p
        v-if="subTitle"
        class="b-dialog__subtitle"
        :class="{
          'b-dialog__subtitle--required': currentStep === 3,
        }"
      >
        {{ subTitle }}
      </p>
    </template>
    <div class="b-card" :class="`b-card--step-${currentStep}`">
      <q-form ref="formRef" novalidate greedy class="b-form" @submit="onSubmit">
        <template v-if="currentStep === 3">
          <section class="b-form__section b-form__map">
            <p class="b-form__hint gg-t-small">
              Выберите существующий на карте очаг со статусом “Создан”, чтобы добавить его в
              мероприятие
            </p>
            <q-card>
              <CMap
                :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
                addMarker="hide"
                addZone="hide"
                :markers="existingHotbeds"
                :shortInfoKeys="shortMarkerInfoNameKeys"
                :selectedMarker="currentSelectedHotbed"
                editable-markers="none"
                selectable-markers="all"
                @select-marker="handleHotbedSelected"
                @cancel-marker-selection="handleHotbedDeselected"
              ></CMap
            ></q-card>
          </section>
        </template>
        <template v-else-if="currentStep === 1">
          <section class="b-form__section">
            <div class="b-form__section-content">
              <CInput v-model="taskEventData.name" @update:model-value="" label="Название"></CInput>
              <CInputTextarea
                class="b-form__comment"
                label="Описание"
                v-model="taskEventData.description"
                bgColor="transparent"
              ></CInputTextarea>
              <CInputDate
                v-model="taskEventData.expectedDateEnd"
                label="Ожидаемая дата завершения"
                class="b-form__field"
              />
              <CInputSelect
                v-model="taskEventData.responsibleEmployee"
                use-input
                @filter="filterEmployees"
                :options="employeesOptions"
                returnObj
                label="Ответственный"
              ></CInputSelect>
            </div>
          </section>
        </template>
        <template v-else-if="currentStep === 2">
          <section class="b-form__section">
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Название:</span>
              <span class="b-form__info-value">{{ taskEventData.name }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Описание:</span>
              <span class="b-form__info-value">{{ taskEventData.description }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Ожидаемая дата завершения:</span>
              <span class="b-form__info-value">{{
                date.formatDate(taskEventData.expectedDateEnd, "DD.MM.YYYY")
              }}</span>
            </div>
            <div class="b-form__info-row gg-t-base">
              <span class="b-form__info-label">Ответственный:</span>
              <span class="b-form__info-value">{{ taskEventData.responsibleEmployee?.name }}</span>
            </div>
          </section>
        </template>
        <footer class="b-form__footer">
          <CButton @click="onBack" design-type="tertiary" :label="cancelLabel" />
          <CButton
            :label="applyLabel"
            :disabled="
              (currentStep === 2 && formHasError) ||
              (currentStep === 3 && !taskEventData.relatedHotbedId)
            "
            type="submit"
          />
        </footer>
      </q-form>
    </div>
  </CDialog>
</template>

<script setup lang="ts">
import { date } from "quasar";
import type { TaskEventData } from "~/types/interfaces/taskEvents";

interface Props {
  modelValue: boolean;
  hotbeds: Marker[];
  employeesOptions: ItemOption[];
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "taskEventCreated", taskEventData: TaskEventData): void;
  (e: "filterEmployees", val: string): void;
}>();
const { HOTBED_WORK_STAGE_STYLES } = useGetStatusOptions();
const { formRef, formBindValidation, formHasError } = useFormValidation();

const dialogVisible = ref(props.modelValue);
const existingHotbeds = ref<Marker[]>([]);
const currentSelectedHotbed = ref<Marker | null>(null);
const cancelLabel = ref("Отмена");
const applyLabel = ref("Далее");
const subTitle = ref("");
const currentStep = ref(1);
const taskEventData = ref<TaskEventData>({
  name: "",
  description: "",
  expectedDateEnd: "",
  responsibleEmployee: null,
  relatedHotbedId: "",
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
async function createTaskEvent() {
  dialogVisible.value = false;
  emits("taskEventCreated", taskEventData.value);
  resetForm();
}
function handleHotbedSelected(hotbedId: string, hotbed: Marker) {
  taskEventData.value.relatedHotbedId = hotbedId;
  currentSelectedHotbed.value = hotbed;
}
function handleHotbedDeselected(hotbedId: string) {
  taskEventData.value.relatedHotbedId = "";
  currentSelectedHotbed.value = null;
}
function filterEmployees(val: string) {
  emits("filterEmployees", val);
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
    createTaskEvent();
  }
}

function updateLabels() {
  if (currentStep.value === 1) {
    cancelLabel.value = "Отмена";
    applyLabel.value = "Далее";
    subTitle.value = "";
  } else if (currentStep.value === 2) {
    cancelLabel.value = "Назад";
    applyLabel.value = "Далее";
    subTitle.value = "Проверьте корректность введённых данных";
  } else if (currentStep.value === 3) {
    cancelLabel.value = "Назад";
    applyLabel.value = "Создать";
    subTitle.value =
      "Выберите существующий очаг проблемы для создания связи с задачей";
  }
}

function resetForm() {
  currentStep.value = 1;
  subTitle.value = "";
  cancelLabel.value = "Отмена";
  applyLabel.value = "Далее";
  taskEventData.value = {
    name: "",
    description: "",
    expectedDateEnd: "",
    responsibleEmployee: null,
    relatedHotbedId: "",
  };
}
watch(
  () => props.hotbeds,
  (newVal) => {
    existingHotbeds.value = newVal;
  },
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
  existingHotbeds.value = props.hotbeds;
});
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.b-dialog {
  &__subtitle {
    margin-top: 10px;
    font-size: 18px;
    color: var(--app-grey-300);
    &--required {
      &::after {
        content: "*";
        color: var(--app-red-500);
      }
    }
  }
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
  &__comment {
    margin-bottom: 20px;
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
    width: 162px;
    min-width: 162px;
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
  width: 600px;
  max-width: 100%;
  &--step-3 {
    width: 1200px;
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
