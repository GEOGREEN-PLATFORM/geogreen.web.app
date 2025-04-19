<template>
  <main class="report-form">
    <section class="report-form__header">
      <h1 class="report-form__title gg-h1">Сообщите о проблеме</h1>
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
                {
                  'report-form__type-button--active': userReport.details.problemAreaType === type,
                },
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
            Оставьте точку на карте, соответствующую расположению проблемы. Вы можете оставить
            только один очаг на карте.
          </p>
          <article class="report-form__map-container">
            <CMap
              @add-marker="addUserHotbed"
              @delete-marker="deleteUserHotbed"
              @forbiddenAddMarker="handleForbiddenAddTry"
              :dataStatusStyles="workStageStyles"
              :markers="existingHotbeds"
              :shortInfoKeys="shortMarkerInfoNameKeys"
              addZone="hide"
              :addMarker="isAddMarker ? 'forbid' : 'enable'"
            ></CMap>
          </article>
        </fieldset>
        <fieldset class="report-form__fieldset">
          <legend class="report-form__legend gg-h3">Комментарий</legend>
          <CInputTextarea
            class="report-form__comment"
            placeholder="Кратко опишите проблему"
            v-model="userReport.details.comment"
          ></CInputTextarea>
        </fieldset>
        <fieldset class="report-form__fieldset">
          <legend class="report-form__legend gg-h3">Фотографии</legend>
          <CDragDrop
            @add="uploadFiles"
            class="report-form__upload-file-container"
            :maxSize="FILES_MAX_SIZE"
          ></CDragDrop>
          <section v-if="attachedFiles.length > 0" class="report-form__added-images">
            <FileContainers v-model:files="attachedFiles" raw></FileContainers>
          </section>
        </fieldset>
        <CButton
          class="report-form__submit-button"
          label="Отправить"
          :disabled="!requiredFieldsFilled"
          :loading="isFormSending"
          @click="sendReport"
        ></CButton>
      </q-form>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Coordinate } from "ol/coordinate";
import { useMainStore } from "~/store/main";
interface UserReport {
  coordinate: Coordinate;
  details: {
    images: ImageIds[];
    problemAreaType: ProblemAreaTypes | "";
    userId: string;
    comment: string;
  };
}
const types: ProblemAreaTypes[] = ["Борщевик", "Свалка", "Пожар"]; //TODO: fetch from server
const FILES_MAX_SIZE = 10_000_000;
const attachedFiles = ref<File[]>([]);
const isFormSending = shallowRef(false);
const store = useMainStore();
const existingHotbeds = ref<Marker[]>([]);
const requiredFieldsFilled = computed(
  () => userReport.details.problemAreaType && isAddMarker.value,
);
const userReport = reactive<UserReport>({
  coordinate: [],
  details: {
    images: [],
    problemAreaType: "",
    userId: store.user?.id || "",
    comment: "",
  },
});
const router = useRouter();
const isAddMarker = shallowRef(false);
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
    {
      method: "GET",
      headers: {
        authorization: useGetToken(),
      },
    },
  );
  existingHotbeds.value = data;
}
function handleForbiddenAddTry() {
  useState<Alert>("showAlert").value = {
    show: true,
    text: "Вы уже добавили очаг на карту. Удалите его, чтобы добавить новый.",
  };
}
function addUserHotbed(coordinate: Coordinate) {
  if (userReport.details.problemAreaType) {
    userReport.coordinate = coordinate;
    existingHotbeds.value.push({
      id: "user-temp-created",
      coordinate: coordinate,
      isTempCreatedBy: "user",
      details: {
        square: 21879072,
        owner: "",
        landType: "",
        contractingOrganization: "",
        workStage: "",
        eliminationMethod: "",
        images: [],
        problemAreaType: userReport.details.problemAreaType,
        comment: "",
        density: null,
      },
      relatedTaskId: null,
      coordinates: [],
    });
    isAddMarker.value = true;
  } else {
    useState<Alert>("showAlert").value = {
      show: true,
      text: "Выберите тип проблемы",
    };
  }
}
function deleteUserHotbed(marker: Marker) {
  existingHotbeds.value = existingHotbeds.value.filter(
    (m) => !m.isTempCreatedBy,
  );
  isAddMarker.value = false;
  userReport.coordinate = [];
}
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
function selectProblemType(type: ProblemAreaTypes) {
  userReport.details.problemAreaType = type;
  getExistingHotbedsOfProblemsByType(userReport.details.problemAreaType);
}
async function sendReport() {
  isFormSending.value = true;
  try {
    for (const file of attachedFiles.value) {
      const image = await uploadPhoto(file);
      userReport.details.images.push(image);
    }
    for (const image of userReport.details.images) {
      const result = await analysePhotoOnHogweedPresence(image.fullImageId);
      console.log("Анализ для", image, result);
    }
    await $fetch(`${store.apiUserReport}/report`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: userReport,
    });
    attachedFiles.value = [];
    userReport.details.images = [];
    userReport.details.problemAreaType = "";
    userReport.coordinate = [];
    isAddMarker.value = false;
    store.thanksForReport = true;
    navigateTo("/report-problem/thanks");
  } catch (err: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: `Невозможно отправить отчёт: ${err.message}`,
    };
  } finally {
    isFormSending.value = false;
  }
}

async function analysePhotoOnHogweedPresence(photoId: string) {
  try {
    return await $fetch(`${store.apiPhotoAnalyse}/analyse`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: { photoId },
    });
  } catch (err) {
    throw new Error("Ошибка при анализе фото");
  }
}
async function uploadPhoto(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await $fetch<ImageIds>(
      `${store.apiFileServer}/file/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    return response;
  } catch (err) {
    throw new Error("Ошибка при загрузке фото");
  }
}
onMounted(() => {
  if (userReport.details.problemAreaType) {
    getExistingHotbedsOfProblemsByType(userReport.details.problemAreaType);
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
    width: 100%;
    margin-top: 24px;
  }
}
</style>
