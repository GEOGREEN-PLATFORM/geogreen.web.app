<template>
  <section
    class="drag-drop-container"
    :class="{
      'is-dragover': isDragOver,
      'has-bg': background,
    }"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="drag-drop-container__content">
      <div>
        <p class="drag-drop-container__main-text gg-t-big">
        Перетащите сюда ваши файлы
        </p>
        <p class="drag-drop-container__sub-text q-mt-sm gg-cap">JPG, PNG, Max 20MB</p>
      </div>
      <p class="drag-drop-container__main-text gg-t-big">или</p>
      <GGButton 
        label="Выберите файл" 
        size="small"
        stretch="hug"
        design-type="secondary" 
        @click="triggerFileInput"
      ></GGButton>
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        :accept="accept"
        v-show="false"
        @change="handleFileInput"
      />
    </div>
    </section>
</template>

<script lang="ts" setup>
defineProps({
  multiple: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: "image/jpeg, image/png",
  },
  background: {
    type: String,
    default: "",
  },
});

const emits = defineEmits<{
  add: [File[]];
}>();

const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files) {
    emitFiles(Array.from(files));
  }
};

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    emitFiles(Array.from(files));
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const emitFiles = (files: File[]) => {
  emits("add", files);
};
</script>

<style scoped lang="scss">
.drag-drop-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  padding: 56px 24px;
  border-radius: 8px;
  transition: background-color 0.3s, border-color 0.3s;
  cursor: pointer;
  &__content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 12px;
    color: var(--app-grey-500);
    text-align: center;
    .drag-drop-container__main-text {
        font-weight: bold;
    }
    .drag-drop-container__sub-text {
      font-weight: normal;
    }
  }

}
.drag-drop-container.is-dragover {
    border-color: var(--app-blue-500);
    background-color: var(--app-blue-050);
}
.drag-drop-container.has-bg {
    background-color: var(--app-white);
}

</style>
