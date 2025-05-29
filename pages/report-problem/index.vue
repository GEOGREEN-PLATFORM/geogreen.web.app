<template>
  <main class="b-page">
    <section class="b-header">
      <h1 class="b-header__title gg-h1">Сообщите о проблеме</h1>
    </section>
    <section class="b-page__content">
      <q-form ref="formRef" novalidate greedy class="b-form" @submit="">
        <fieldset class="b-form__fieldset">
          <legend class="b-form__legend gg-h3 b-form__legend--required">Тип</legend>
          <div class="b-form__types">
            <button
              v-for="type in store.problemAreaTypes"
              :key="type"
              :class="[
                'b-form__type-button',
                {
                  'b-form__type-button--active': userReport.details.problemAreaType === type,
                },
              ]"
              type="button"
              @click="selectProblemAreaType(type)"
            >
              {{ type }}
            </button>
          </div>
        </fieldset>
        <fieldset class="b-form__fieldset">
          <legend class="b-form__legend gg-h3 b-form__legend--required">Локация</legend>
          <p class="b-form__sub-info">
            Оставьте точку на карте, соответствующую расположению проблемы. Вы можете оставить
            только один очаг на карте.
          </p>
          <article class="b-form__map-container">
            <CMap
              @add-marker="addUserHotbed"
              @delete-marker="deleteUserHotbed"
              @forbiddenAddMarker="handleForbiddenAddTry"
              :dataStatusClasses="HOTBED_WORK_STAGE_STYLES"
              :markers="existingHotbeds"
              :shortInfoKeys="shortMarkerInfoNameKeys"
              addZone="hide"
              :addMarker="isAddMarker ? 'forbid' : 'enable'"
              nonCheckableMarkers="all"
              defaultInteractionType="marker_add"
              :dataLoading="hotbedsLoading"
            ></CMap>
          </article>
        </fieldset>
        <fieldset class="b-form__fieldset">
          <legend class="b-form__legend gg-h3">Комментарий</legend>
          <CInputTextarea
            class="b-form__comment"
            placeholder="Кратко опишите проблему"
            v-model="userReport.details.comment"
          ></CInputTextarea>
        </fieldset>
        <fieldset class="b-form__fieldset">
          <legend class="b-form__legend gg-h3">Фотографии</legend>
          <CDragDrop
            @add="uploadFiles"
            class="b-form__upload-file-container"
            :maxSize="FILES_MAX_SIZE"
          ></CDragDrop>
          <section v-if="attachedFiles.length > 0" class="b-form__added-images">
            <CFileContainers v-model:files="attachedFiles" raw></CFileContainers>
          </section>
        </fieldset>
        <section class="q-my-sm" v-if="store.user?.role === 'user'">
          <CInputSwitch
            v-model="isSendNotificantion"
            label="Уведомлять на&nbsp;почту об&nbsp;изменениях по&nbsp;сообщению о&nbsp;проблеме"
          />
        </section>
        <CButton
          class="b-form__submit-button"
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
import type { ApplicationData } from "~/types/interfaces/applications";
interface UserReport {
  coordinate: Coordinate;
  details: {
    images: ImageObj[];
    problemAreaType: string;
    userId: string;
    comment: string;
  };
}
const FILES_MAX_SIZE = 10_000_000;
const attachedFiles = ref<File[]>([]);
const { uploadPhoto } = useFiles();
const isFormSending = shallowRef(false);
const store = useMainStore();
const existingHotbeds = ref<Marker[]>([]);
const hotbedsLoading = shallowRef(false);
const requiredFieldsFilled = computed(
  () => userReport.details.problemAreaType && isAddMarker.value,
);
const userReport = reactive<UserReport>({
  coordinate: [],
  details: {
    images: [],
    problemAreaType: "Борщевик",
    userId: store.user?.id || "",
    comment: "",
  },
});
const isSendNotificantion = shallowRef(false);
const isAddMarker = shallowRef(false);
const { HOTBED_WORK_STAGE_STYLES } = useGetStatusOptions();
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

function selectProblemAreaType(type: string) {
  if (userReport.details.problemAreaType !== type) {
    userReport.details.problemAreaType = type;
    existingHotbeds.value = [];
    isAddMarker.value = false;
    getExistingHotbedsOfProblemsByType(userReport.details.problemAreaType);
  }
}
async function getExistingHotbedsOfProblemsByType(type: string) {
  try {
    hotbedsLoading.value = true;
    const data = await $fetch<Marker[]>(
      `${store.apiV1}/geo/info/getAll/${type}`,
      {
        method: "GET",
        headers: {
          authorization: useGetToken(),
        },
      },
    );
    existingHotbeds.value = data;
  } catch (err: any) {
    console.error(err);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось получить список очагов проблем",
    };
  } finally {
    hotbedsLoading.value = false;
  }
}
async function sendReport() {
  isFormSending.value = true;
  try {
    for (const file of attachedFiles.value) {
      const image = await uploadPhoto(file);
      userReport.details.images.push(image);
    }
    // for (const image of userReport.details.images) {
    //   const result = await analysePhotoOnHogweedPresence(image.fullImageId);
    //   console.log("Анализ для", image, result);
    // }
    const response = await $fetch<ApplicationData>(
      `${store.apiV1}/user-marker/report`,
      {
        method: "POST",
        headers: {
          authorization: useGetToken(),
        },
        body: userReport,
      },
    );
    if (isSendNotificantion.value) {
      await subscribeToReportNotifications(response.id);
    }
    attachedFiles.value = [];
    userReport.details.images = [];
    userReport.details.problemAreaType = "";
    userReport.coordinate = [];
    isAddMarker.value = false;
    store.thanksForReport = true;
    navigateTo("/report-problem/thanks");
  } catch (err: any) {
    console.error(err);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: `Невозможно отправить сообщение о проблеме: ${err.message}`,
    };
  } finally {
    isFormSending.value = false;
  }
}
async function subscribeToReportNotifications(userReportId: string) {
  try {
    await $fetch(`${store.apiV1}/notification/subscribe`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        elementId: userReportId,
        email: store.user?.email,
        type: "Заявка",
      },
    });
  } catch (err) {
    throw new Error("Ошибка при подписке на уведомления");
  }
}
async function analysePhotoOnHogweedPresence(photoId: string) {
  try {
    return await $fetch(`${store.apiV1}/analyse`, {
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
function addUserHotbed(coordinate: Coordinate) {
  if (userReport.details.problemAreaType) {
    userReport.coordinate = coordinate;
    existingHotbeds.value.push({
      id: "user-temp-created",
      coordinate: coordinate,
      isTempCreatedBy: "user",
      details: {
        square: 0,
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
      relatedTaskIds: null,
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
function deleteUserHotbed(id: string) {
  existingHotbeds.value = existingHotbeds.value.filter(
    (m) => !m.isTempCreatedBy,
  );
  isAddMarker.value = false;
  userReport.coordinate = [];
}
function handleForbiddenAddTry() {
  useState<Alert>("showAlert").value = {
    show: true,
    text: "Вы уже добавили очаг на карту. Удалите его, чтобы добавить новый.",
  };
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
onMounted(() => {
  if (userReport.details.problemAreaType) {
    getExistingHotbedsOfProblemsByType(userReport.details.problemAreaType);
  }
});
</script>
<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;
.b-page {
  background-color: var(--app-white);
  width: 100%;
  padding-bottom: 24px;
  &__content {
    padding: 16px;
    margin: 0 auto;
    max-width: 75vw;
    @media screen and (max-width: $app-mobile) {
      max-width: 100%;
    }
  }
}
.b-header {
  display: flex;
  flex-direction: column;
  margin-top: 48px;
  gap: 12px;
  justify-content: center;
  align-items: center;
  padding: 0px 16px;
  text-align: center;
}
.b-form {
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
    .b-form__type-button {
      padding: 8px 16px;
      background: var(--app-green-050);
      border-radius: 12px;
      color: var(--app-grey-500);
      cursor: pointer;
    }
    .b-form__type-button--active {
      background: var(--app-green-500);
      color: var(--app-white);
    }
    .b-form__type-button--disabled {
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
