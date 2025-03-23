<template>
    <article class="file">
      <div class="file__preview">
        <NuxtImg v-if="true" :src="url" alt="Файл" class="file__image" />
        <video v-else-if="isVideo" controls class="file__video">
          <source :src="url" type="video/mp4" />
        </video>
        <div v-else class="file__placeholder">Файл</div>
      </div>
      <button class="file__delete" @click="emits('remove')">
        <q-icon color="red-400" :name="mdiDeleteOutline" size="24px"></q-icon>
      </button>
      <p class="file__name gg-cap">{{ fileName }}</p>
    </article>
  </template>
  
  <script setup lang="ts">
import { mdiDeleteOutline } from "@quasar/extras/mdi-v6";
interface Props {
  url: string;
}
const props = defineProps<Props>();
const emits = defineEmits<{
  remove: [];
}>();
const fileExtension = computed(() => {
  const parts = props.url.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
});

const isImage = computed(() =>
  ["jpg", "jpeg", "png", "gif", "webp"].some((ext) =>
    fileExtension.value.includes(ext),
  ),
);
const isVideo = computed(() =>
  ["mp4", "webm", "mov"].some((ext) => fileExtension.value.includes(ext)),
);

const fileName = computed(() => props.url.split("/").pop());
</script>
  
  <style scoped lang="scss">
  .file {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    width: 150px;
    
    &__preview {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: var(--app-grey-050);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
  
      img, video {
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
      transition: background-color 0.3s ease, transform 0.1s ease;
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
  