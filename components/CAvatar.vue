<template>
  <div class="c-avatar" @click="props.editMode && triggerFileUpload()">
    <input
      type="file"
      ref="fileInput"
      class="c-avatar__file-input"
      @change="updateAvatar"
      accept="image/*"
    />
    <img
      v-if="localFileUrl"
      :src="localFileUrl"
      alt="Аватар"
      class="c-avatar__item"
      @click="openPhoto(localFileUrl)"
    />
    <div v-else class="c-avatar__item c-avatar__item--placeholder">
      <span class="c-avatar__item-icon">
        <q-icon
          :name="props.editMode ? mdiUpload : mdiAccountOutline"
          color="grey-400"
          size="32px"
        ></q-icon>
      </span>
    </div>
    <div v-if="props.editMode" class="c-avatar__item-overlay">
      <q-icon :name="mdiUpload" color="white" size="32px"></q-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiAccountOutline, mdiUpload } from "@quasar/extras/mdi-v6";

interface Props {
  editMode?: boolean;
  avatarSrc?: string;
}

const props = withDefaults(defineProps<Props>(), {});
const emits = defineEmits(["changeAvatar"]);

const { openPhoto } = usePhotoViewer();
const { getImageUrl } = useFiles();

const fileInput = ref();
const localFileUrl = ref("");
async function updateAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const fileList = input.files;
  if (!fileList || fileList.length === 0) {
    console.warn("Файл не выбран");
    return;
  }
  const file = fileList[0];
  localFileUrl.value = URL.createObjectURL(file);
  emits("changeAvatar", file);
}
function triggerFileUpload() {
  fileInput.value?.click();
}
onMounted(() => {
  if (props.avatarSrc) {
    localFileUrl.value = getImageUrl(props.avatarSrc);
  }
});
watch(
  () => props.avatarSrc,
  (newVal) => {
    if (!newVal) {
      localFileUrl.value = "";
    } else {
      localFileUrl.value = getImageUrl(newVal);
    }
  },
);
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.c-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--app-grey-050);
  cursor: pointer;
  &__file-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }
  &__item {
    width: 100%;
    height: 100%;
    object-fit: cover;

    &--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--app-grey-100);
      color: var(--app-grey-500);
    }
  }

  &__item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  &__item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
