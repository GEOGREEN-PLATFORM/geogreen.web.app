<template>
  <main class="report-form">
    <section class="report-form__header">
      <h1 class="report-form__title gg-h1" @click="showAlert">Сообщите о проблеме</h1>
    </section>

    <section class="report-form__content">
      <q-form ref="formRef" novalidate greedy class="report-form__form" @submit="">
        <fieldset class="report-form__fieldset">
          <legend class="report-form__legend gg-h3 report-form__legend--required">Тип</legend>
          <div class="report-form__types">
            <button
              v-for="type in types"
              :key="type"
              :class="[
                'report-form__type-button',
                { 'report-form__type-button--active': selectedType === type },
              ]"
              type="button"
              @click="selectProblemType(type)"
            >
              {{ type }}
            </button>
          </div>
        </fieldset>
        <fieldset class="report-form__fieldset">
          <legend class="report-form__legend gg-h3 report-form__legend--required">Локация</legend>
          <p class="report-form__sub-info">
            Оставьте точку на карте, соответствующую расположению проблемы
          </p>
          <article class="report-form__map-container">
            <Map
              @add-marker="addUserHotbed"
              @delete-marker="deleteUserHotbed"
              :dataStatusStyles="workStageStyles"
              :markers="existingHotbeds"
              :shortInfoKeys="shortMarkerInfoNameKeys"
              :add-zone-enabled="false"
              :forbidAddMarker="isAddMarker"
            ></Map>
          </article>
        </fieldset>
        <fieldset class="report-form__fieldset">
          <legend class="report-form__legend gg-h3">Комментарий</legend>
          <KTInputTextarea
            class="report-form__comment"
            placeholder="Кратко опишите проблему"
            v-model="comment"
          ></KTInputTextarea>
        </fieldset>
        <fieldset class="report-form__fieldset">
          <legend class="report-form__legend gg-h3">Фотографии</legend>
          <DragDrop @add="uploadFiles" class="report-form__upload-file-container"></DragDrop>
          <section v-if="attachedFiles.length > 0" class="report-form__added-images">
            <p class="report-form__block-caption gg-cap">Загруженные изображения</p>
            <FileContainers :fileUrls="attachedFiles"></FileContainers>
          </section>
        </fieldset>
        <GGButton class="report-form__submit-button" label="Отправить"></GGButton>
      </q-form>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Coordinate } from "ol/coordinate";
import { useMainStore } from "~/store/main";
const types: ProblemAreaTypes[] = ["Борщевик", "Свалка", "Пожар"]; //TODO: fetch from server
const selectedType = ref<ProblemAreaTypes | null>(null);
const comment = ref<string>("");
const attachedFiles = ref<string[]>([]);
const store = useMainStore();
const existingHotbeds = ref<Marker[]>([]);
const isAddMarker = shallowRef(false);
function showAlert() {
  useState<Alert>("showAlert").value = {
    show: true,
    text: "Тестовыый текст для ошибка",
  };
}
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
async function getExistingHotbedsOfProblemsByType(
  problemAreaType: ProblemAreaTypes,
) {
  const data = await $fetch<Marker[]>(
    `${store.apiGeospatial}/geo/info/getAll/${problemAreaType}`,
  );
  existingHotbeds.value = data;
}
function addUserHotbed(coordinate: Coordinate) {
  if (selectedType.value) {
    existingHotbeds.value.push({
      coordinate: coordinate,
      userTempCreated: true,
      details: {
        square: 21879072,
        owner: "",
        landType: "",
        contractingOrganization: "",
        workStage: "",
        eliminationMethod: "",
        images: [],
        problemAreaType: selectedType.value,
        comment: "",
        density: null,
      },
      relatedTaskId: null,
      coordinates: [],
    });
  }
  isAddMarker.value = true;
}
function deleteUserHotbed(marker: Marker) {}
async function uploadFiles(files: File[]) {
  //api uploading
  files.forEach((file) => attachedFiles.value.push(URL.createObjectURL(file)));
  console.log(attachedFiles.value);
}
function selectProblemType(type: ProblemAreaTypes) {
  selectedType.value = type;
  getExistingHotbedsOfProblemsByType(selectedType.value);
}
const onSubmit = () => {
  console.log("Submitted:", {
    type: selectedType.value,
    comment: comment.value,
    files: attachedFiles.value,
  });
};
onMounted(() => {
  if (selectedType.value) {
    getExistingHotbedsOfProblemsByType(selectedType.value);
  }
});
</script>
<style scoped lang="scss">
.report-form {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;
  background-color: var(--app-white);
  max-width: 75vw;
  margin: 0 auto;
  padding-bottom: 24px;
  @media screen and (max-width: $app-mobile) {
    max-width: 100%;
  }
  &__header {
    display: flex;
    flex-direction: column;
    margin-top: 48px;
    gap: 12px;
    justify-content: center;
    align-items: center;
    padding: 0px 16px;
    text-align: center;
  }
  &__sub-info {
    font-size: 14px;
    color: var(--app-green-700);
    margin: 4px 0px;
  }
  &__content {
    padding: 16px;
  }
  &__fieldset {
    margin-top: 16px;
    padding-bottom: 12px;
  }
  &__legend {
  }
  &__legend--required {
    &::after {
      content: "*";
      color: var(--app-red-500);
    }
  }

  &__types {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
    .report-form__type-button {
      padding: 8px 16px;
      background: var(--app-green-050);
      border-radius: 12px;
      color: var(--app-grey-500);
      cursor: pointer;
    }
    .report-form__type-button--active {
      background: var(--app-green-500);
      color: var(--app-white);
    }
    .report-form__type-button--disabled {
      background: var(--app-grey-050);
      color: var(--app-white);
    }
  }
  &__map-container {
    width: 100%;
    height: 410px;
    border-radius: 12px;
    overflow: hidden;
    margin-top: 12px;
  }

  &__comment {
    margin-top: 12px;
    width: 560px;
    max-width: 100%;
  }
  &__upload-file-container {
    width: 100%;
    max-width: 928px;
    margin: 0 auto;
    margin-top: 12px;
  }
  &__submit-button {
    width: 364px;
    margin: 0 auto;
    margin-top: 32px;
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
}
</style>
