<template>
  <section class="file-container">
    <ul class="file-container__list">
      <li v-for="(file, index) in filesCopy" :key="getKey(file)">
        <File
          :file="file"
          @localDelete="removeLocal(index)"
          @sendDelete="removeRemote(index, $event)"
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

const props = defineProps<{
  files: FileOrObj[];
}>();
const emit = defineEmits<{
  (e: "update:files", files: FileOrObj[]): void;
  (e: "localDelete", index: number): void;
  (e: "sendDelete", imageId: string): void;
}>();

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
  &__list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
}
</style>
