export default function usePhotoViewer() {
  const photoUrl = useState("photoUrl", () => "");
  const isOpen = useState("isOpen", () => false);

  function openPhoto(url: string) {
    photoUrl.value = url;
    isOpen.value = true;
  }

  function closePhoto() {
    isOpen.value = false;
  }

  return {
    photoUrl,
    isOpen,
    openPhoto,
    closePhoto,
  };
}
