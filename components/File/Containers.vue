<template>
  <section class="file-container">
    <p class="file-container__block-caption gg-cap">Загруженные изображения</p>
    <ul class="file-container__list">
      <li v-for="(file, index) in filesCopy" :key="getKey(file)">
        <File
          :file="file"
          @localDelete="removeLocal(index)"
          @sendDelete="removeRemote(index, $event)"
          :clearable="clearable"
          :hideCaption="hideCaption"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface ImageObj {
  previewImageId: string;
  fullImageId: string;
}
type FileOrObj = File | ImageObj;

const emit = defineEmits<{
  (e: "update:files", files: FileOrObj[]): void;
  (e: "localDelete", index: number): void;
  (e: "sendDelete", imageId: string): void;
}>();
interface Props {
  files: FileOrObj[];
  clearable?: boolean;
  hideCaption?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  raw: false,
  clearable: true,
  hideCaption: false,
});

const filesCopy = ref<FileOrObj[]>([...props.files]);

watch(
  () => props.files,
  (newVal) => {
    filesCopy.value = [...newVal];
  },
  { deep: true },
);

const getKey = (file: FileOrObj) => {
  if (file instanceof File) {
    return `${file.lastModified}_${file.name}`;
  }
  return file.fullImageId;
};

function removeLocal(index: number) {
  filesCopy.value.splice(index, 1);
  emit("update:files", filesCopy.value);
  emit("localDelete", index);
}

function removeRemote(index: number, imageId: string) {
  filesCopy.value.splice(index, 1);
  emit("update:files", filesCopy.value);
  emit("sendDelete", imageId);
}
</script>

<style scoped lang="scss">
.file-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  padding: 0px 8px;
  &__block-caption {
    padding-bottom: 4px;
    border-bottom: 1px solid var(--app-grey-050);
    width: 100%;
  }
  &__list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
}
</style>
