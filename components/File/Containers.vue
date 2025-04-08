<template>
  <section class="file-container">
    <p class="file-container__block-caption gg-cap">Загруженные изображения</p>
    <ul class="file-container__list">
      <li v-for="(file, index) in files">
        <File
          :key="checkFilesRaw() ? (file as File).lastModified.toString() : (file as string)"
          :file="file"
          @remove="removeFile(index)"
          :raw="raw"
          :clearable="clearable"
          :hideCaption="hideCaption"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface Props {
  files: string[] | File[];
  raw?: boolean;
  clearable?: boolean;
  hideCaption?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  raw: false,
  clearable: true,
  hideCaption: false,
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
