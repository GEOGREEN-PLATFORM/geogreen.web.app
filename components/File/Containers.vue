<template>
  <section class="file-container">
    <ul class="file-container__list">
      <li v-for="(file, index) in files">
        <File
          :key="checkFilesRaw() ? (file as File).lastModified.toString() : (file as string)"
          :file="file"
          @remove="removeFile(index)"
          :raw="raw"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface Props {
  files: string[] | File[];
  raw?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  raw: false,
});

const filesCopy = ref<string[] | File[]>([]);
const emit =
  defineEmits<(e: "update:files", value: string[] | File[]) => void>();
const removeFile = (index: number) => {
  filesCopy.value.splice(index, 1);
  emit("update:files", filesCopy.value);
};
function checkFilesRaw() {
  console.log(filesCopy.value);
  if (props.raw && filesCopy.value[0] instanceof File) {
    return true;
  }
  return false;
}
onMounted(() => {
  filesCopy.value = checkFilesRaw()
    ? ([...props.files] as File[])
    : ([...props.files] as string[]);
});
watch(
  () => props.files,
  (newValue) => {
    filesCopy.value = checkFilesRaw()
      ? ([...newValue] as File[])
      : ([...newValue] as string[]);
  },
  {
    deep: true,
  },
);
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
