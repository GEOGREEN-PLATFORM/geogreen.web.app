import { useMainStore } from "~/store/main";

export default function useFiles() {
  const store = useMainStore();
  async function uploadPhoto(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await $fetch<ImageObj>(
        `${store.apiV1}/file/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      return response;
    } catch (err) {
      throw new Error("Ошибка при загрузке фото");
    }
  }
  function getImageUrl(imageId: string) {
    return `${store.apiV1}/file/image/download/${imageId}`;
  }
  return {
    uploadPhoto,
    getImageUrl,
  };
}
