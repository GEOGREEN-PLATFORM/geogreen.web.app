<template>
  <article class="file">
    <div class="file__preview">
      <NuxtImg
        @click="openPhoto(localUrl)"
        v-if="isImage"
        :src="localUrl"
        alt="Файл"
        class="file__image"
      />
      <video v-else-if="isVideo" controls class="file__video">
        <source :src="localUrl" :type="videoType" />
      </video>
      <div v-else class="file__placeholder">Файл</div>
    </div>
    <button v-if="clearable" class="file__delete" @click="onDelete">
      <q-icon color="red-400" :name="mdiDeleteOutline" size="24px" />
    </button>
    <p v-if="!hideCaption && isLocalFile" class="file__name gg-cap">{{ fileName }}</p>
  </article>
</template>

<script setup lang="ts">
import { mdiDeleteOutline } from "@quasar/extras/mdi-v6";
import { useMainStore } from "~/store/main";

interface ImageObj {
  previewImageId: string;
  fullImageId: string;
}
type FileOrObj = File | ImageObj;
const store = useMainStore();

interface Props {
  file: FileOrObj;
  clearable?: boolean;
  hideCaption?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  raw: false,
  clearable: true,
  hideCaption: false,
});
const emits = defineEmits<{
  (e: "remove"): void;
  (e: "localDelete"): void;
  (e: "sendDelete", imageId: string): void;
}>();
const { openPhoto } = usePhotoViewer();

const localUrl = ref<string>("");

const isLocalFile = computed(() => props.file instanceof File);

const fileName = computed(() =>
  isLocalFile.value ? (props.file as File).name : "",
);

const fileExtension = computed(() => {
  const name = isLocalFile.value ? (props.file as File).name : "";
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
});

const isImage = computed(
  () =>
    !isLocalFile.value ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension.value),
);
const isVideo = computed(
  () =>
    isLocalFile.value && ["mp4", "webm", "mov"].includes(fileExtension.value),
);
const videoType = computed(() => `video/${fileExtension.value}`);

onMounted(async () => {
  if (isLocalFile.value) {
    localUrl.value = URL.createObjectURL(props.file as File);
  } else {
    const res = await fetch(
      `${store.apiFileServer}/file/image/download/${(props.file as ImageObj).fullImageId}`,
    );
    const blob = await res.blob();
    localUrl.value = URL.createObjectURL(blob);
  }
});

function onDelete() {
  if (isLocalFile.value) {
    emits("localDelete");
  } else {
    emits("sendDelete", (props.file as ImageObj).fullImageId);
  }
  emits("remove");
}
</script>

<style scoped lang="scss">
.file {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  width: 118px;
  &__preview {
    width: 100%;
    width: 118px;
    height: 64px;
    background: var(--app-grey-050);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    img,
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__placeholder {
    font-size: 14px;
    color: var(--app-black);
  }

  &__delete {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: -4px;
    width: fit-content;
    right: -4px;
    background-color: var(--app-white);
    border-radius: 4px;
    border: none;
    box-shadow: 1px -1px 1px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition:
      background-color 0.3s ease,
      transform 0.1s ease;
    &:hover {
      background-color: var(--app-grey-050);
    }
    &:active {
      transform: translateY(2px);
    }
  }

  &__name {
    margin-top: 4px;
    text-align: center;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    color: var(--app-grey-300);
  }
}
</style>
