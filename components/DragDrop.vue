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
        <p class="drag-drop-container__main-text gg-t-big">Перетащите сюда ваши файлы</p>
        <p class="drag-drop-container__sub-text gg-cap">
          JPG, PNG, Max {{ props.maxSize / 1e6 }}MB
        </p>
      </div>
      <p class="drag-drop-container__main-text gg-t-big">или</p>
      <GGButton
        label="Выберите файл"
        size="small"
        stretch="hug"
        design-type="secondary"
        @click="triggerFileInput"
      />
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        :accept="accept.join(',')"
        v-show="false"
        @change="handleFileInput"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
interface Props {
  multiple?: boolean;
  accept?: string[];
  maxSize?: number;
  background?: string;
}
const props = withDefaults(defineProps<Props>(), {
  accept: () => ["image/jpeg", "image/png"],
  maxSize: 10_000_000,
  multiple: true,
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
  const dt = event.dataTransfer;
  if (!dt) return;
  emitFiles(Array.from(dt.files));
};

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  emitFiles(Array.from(target.files));
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

function processFiles(files: File[]): File[] {
  const filtered = files.filter((f) => props.accept.includes(f.type));
  if (!filtered.length) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Среди добавляемых файлов нет подходящих по формату",
    };
    return [];
  }
  let total = 0;
  const accepted: File[] = [];
  for (const f of filtered) {
    if (total + f.size <= props.maxSize!) {
      accepted.push(f);
      total += f.size;
    } else {
      break;
    }
  }
  if (!accepted.length) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: `Добавляемые файлы превышают ${props.maxSize / 1e6} MB`,
    };
    return [];
  }
  return accepted;
}

const emitFiles = (files: File[]) => {
  const acceptedFiles = processFiles(files);
  if (!acceptedFiles.length) return;
  const toEmit = props.multiple ? acceptedFiles : [acceptedFiles[0]];
  emits("add", toEmit);
};
</script>

<style scoped lang="scss">
.drag-drop-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--app-grey-100);
  padding: 56px 24px;
  border-radius: 8px;
  transition:
    background-color 0.3s,
    border-color 0.3s;
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
      margin-top: 8px;
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
