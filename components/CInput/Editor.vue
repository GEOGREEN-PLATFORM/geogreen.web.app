<template>
  <div class="c-input-editor">
    <q-editor
      v-model="editorValue"
      @update:model-value="emits('update:modelValue', editorValue)"
      ref="editorRef"
      @paste.native.prevent="pasteCapture"
      @drop.native.prevent="dropCapture"
    />
    <CFileContainers
      v-model:files="props.files"
      hideCaption
      @update:files="(files) => emits('update:files', files)"
    ></CFileContainers>
  </div>
</template>

<script setup lang="ts">
type FileOrObj = File | ImageObj;
interface Props {
  modelValue: string;
  files?: FileOrObj[];
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  files: () => [],
});
const editorValue = ref("");
const editorRef = ref<InstanceType<typeof import("quasar").QEditor> | null>(
  null,
);
// const { uploadPhoto, getImageUrl } = useFiles();
const emits = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "update:files", files: FileOrObj[]): void;
}>();
watch(
  () => props.modelValue,
  (v) => {
    console.log(v);
    editorValue.value = v;
  },
);
onMounted(() => {
  editorValue.value = props.modelValue;
});
async function pasteCapture(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  const newFiles: File[] = [];
  for (const itm of items) {
    if (itm.type.startsWith("image/")) {
      const f = itm.getAsFile();
      if (f) newFiles.push(f);
    }
  }
  if (newFiles.length) {
    emits("update:files", [...(props.files || []), ...newFiles]);
  }
}

async function dropCapture(e: DragEvent) {
  const dt = e.dataTransfer;
  if (!dt) return;
  const newFiles: File[] = [];
  for (let i = 0; i < dt.files.length; i++) {
    const file = dt.files[i];
    if (file.type.startsWith("image/")) {
      newFiles.push(file);
    }
  }
  if (newFiles.length) {
    emits("update:files", [...(props.files || []), ...newFiles]);
  }
}
// let lastPasteTime = 0;
// onMounted(() => {
//   enableImageResize();
//   setMaxWidthForImage(); // Устанавливаем начальную максимальную ширину для изображений
//   window.addEventListener("resize", setMaxWidthForImage); // Подписываемся на изменение размера окна
// });

// onUnmounted(() => {
//   window.removeEventListener("resize", setMaxWidthForImage); // Отписываемся при удалении компонента
// });

// async function pasteCapture(e: ClipboardEvent) {
//   const now = Date.now();
//   if (now - lastPasteTime < 300) return;
//   lastPasteTime = now;

//   const items = e.clipboardData?.items;
//   if (!items) return;
//   const files: File[] = [];
//   for (const itm of items) {
//     if (itm.type.startsWith("image/")) {
//       const f = itm.getAsFile();
//       if (f) files.push(f);
//     }
//   }
//   for (const file of files) {
//     try {
//       const resp = await uploadPhoto(file);
//       insertImage(getImageUrl(resp.fullImageId));
//     } catch {}
//   }
// }

// async function dropCapture(e: DragEvent) {
//   const dt = e.dataTransfer;
//   if (!dt) return;
//   for (let i = 0; i < dt.files.length; i++) {
//     const file = dt.files[i];
//     if (!file.type.startsWith("image/")) continue;
//     try {
//       const resp = await uploadPhoto(file);
//       insertImage(getImageUrl(resp.fullImageId));
//     } catch {}
//   }
// }

// function insertImage(url: string) {
//   const edit = editorRef.value as any;
//   edit.caret.restore();
//   edit.runCmd(
//     "insertHTML",
//     `<div class="img-wrapper" style="width:auto; height:auto;">
//         <img src="${url}" class="editable-image" />
//         <div class="resize-handle tl" data-corner="tl"></div>
//         <div class="resize-handle tr" data-corner="tr"></div>
//         <div class="resize-handle bl" data-corner="bl"></div>
//         <div class="resize-handle br" data-corner="br"></div>
//         <div class="resize-handle tm" data-corner="tm"></div>
//         <div class="resize-handle bm" data-corner="bm"></div>
//         <div class="resize-handle lm" data-corner="lm"></div>
//         <div class="resize-handle rm" data-corner="rm"></div>
//       </div>`,
//   );
//   edit.focus();
// }

// function setMaxWidthForImage() {
//   const wrapper = document.querySelectorAll(".img-wrapper");
//   const maxWidth = document.documentElement.clientWidth; // Получаем ширину окна

//   wrapper.forEach((el) => {
//     const img = el.querySelector("img.editable-image") as HTMLImageElement;
//     if (img) {
//       img.style.maxWidth = `${maxWidth}px !important`; // Устанавливаем максимальную ширину с !important
//     }
//   });
// }

// function enableImageResize() {
//   const editor = document.querySelector(".q-editor__content")!;

//   let active: any = {};
//   editor.addEventListener("mousedown", (e) => {
//     const handle = (e.target as HTMLElement).closest(".resize-handle") as HTMLElement;
//     if (!handle) return;
//     e.preventDefault();

//     const wrapper = handle.closest(".img-wrapper") as HTMLElement;
//     if (!wrapper.style.width) wrapper.style.width = wrapper.offsetWidth + "px";
//     if (!wrapper.style.height) wrapper.style.height = wrapper.offsetHeight + "px";

//     active = {
//       wrapper,
//       corner: handle.dataset.corner,
//       startX: e.clientX,
//       startY: e.clientY,
//       startW: wrapper.offsetWidth,
//       startH: wrapper.offsetHeight,
//     };
//     document.addEventListener("mousemove", onMouseMove);
//     document.addEventListener("mouseup", onMouseUp);
//   });

//   function onMouseMove(e: MouseEvent) {
//     if (!active.wrapper) return;
//     const dx = e.clientX - active.startX;
//     const dy = e.clientY - active.startY;
//     let w = active.startW,
//       h = active.startH;

//     switch (active.corner) {
//       case "br":
//         w += dx;
//         h += dy;
//         break;
//       case "bl":
//         w -= dx;
//         h += dy;
//         active.wrapper.style.left = active.wrapper.offsetLeft + dx + "px";
//         break;
//       case "tr":
//         w += dx;
//         h -= dy;
//         active.wrapper.style.top = active.wrapper.offsetTop + dy + "px";
//         break;
//       case "tl":
//         w -= dx;
//         h -= dy;
//         active.wrapper.style.left = active.wrapper.offsetLeft + dx + "px";
//         active.wrapper.style.top = active.wrapper.offsetTop + dy + "px";
//         break;
//       case "tm":
//         h -= dy;
//         active.wrapper.style.top = active.wrapper.offsetTop + dy + "px";
//         break;
//       case "bm":
//         h += dy;
//         break;
//       case "lm":
//         w -= dx;
//         active.wrapper.style.left = active.wrapper.offsetLeft + dx + "px";
//         break;
//       case "rm":
//         w += dx;
//         break;
//     }

//     // Ограничиваем минимальные и максимальные размеры для изображения
//     w = Math.max(100, Math.min(w, window.innerWidth)); // Минимум 100px, максимум ширина окна
//     h = Math.max(100, Math.min(h, 300)); // Минимум 100px, максимум 300px по высоте

//     // Устанавливаем ограничения на изображение
//     const img = active.wrapper.querySelector("img.editable-image") as HTMLImageElement;
//     if (img) {
//       img.style.maxWidth = w + "px"; // Ограничиваем максимальную ширину
//     }

//     if (w > 20) active.wrapper.style.width = w + "px";
//     if (h > 20) active.wrapper.style.height = h + "px";
//   }

//   function onMouseUp() {
//     document.removeEventListener("mousemove", onMouseMove);
//     document.removeEventListener("mouseup", onMouseUp);
//     active = {};
//   }
// }
</script>
<style scoped lang="scss">
.c-input-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
<style>
/* .img-wrapper {
  display: inline-block;
  position: relative;
  margin: 10px 0;
  border: 1px dashed transparent;
  max-width: 100%;
  max-height: 300px;
  user-select: none;
}
.img-wrapper:hover {
  border-color: #007bff;
}

.editable-image {
  width: 100%;
  height: 100%;
  max-height: 300px;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border: 1px solid #007bff;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}
.img-wrapper:hover .resize-handle {
  opacity: 1;
}
.tl {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}
.tr {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}
.bl {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}
.br {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

.tm {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}
.bm {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}
.lm {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}
.rm {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
} */
</style>
