<template>
  <section class="file-container">
    <ul class="file-container__list">
      <li v-for="(file, index) in files">
        <File :key="file" :url="file" @remove="removeFile(index)" />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface Props {
  fileUrls: string[];
}
const props = defineProps<Props>();

const files = ref<string[]>([]);
const removeFile = (index: number) => {
  files.value.splice(index, 1);
};
onMounted(() => {
  files.value = [...props.fileUrls];
});
watch(
  () => props.fileUrls,
  (newValue) => {
    files.value = [...newValue];
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
