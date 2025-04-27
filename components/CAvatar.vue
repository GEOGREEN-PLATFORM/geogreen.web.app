<template>
  <div class="c-avatar" @click="">
    <input type="file" ref="fileInput" class="c-avatar__file-input" @change="" accept="image/*" />
    <img
      v-if="props.avatarSrc"
      :src="props.avatarSrc"
      alt="Аватар"
      class="c-avatar__item"
      @click="openPhoto(props.avatarSrc)"
    />
    <div v-else class="c-avatar__item c-avatar__item--placeholder">
      <span class="c-avatar__item-icon">
        <q-icon
          :name="props.editMode ? mdiUpload : mdiAccountOutline"
          color="grey-400"
          size="32px"
        ></q-icon>
      </span>
    </div>
    <div v-if="props.editMode" class="c-avatar__item-overlay">
      <q-icon :name="mdiUpload" color="grey-050" size="32px"></q-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiAccountOutline, mdiUpload } from "@quasar/extras/mdi-v6";

interface Props {
  editMode?: boolean;
  avatarSrc?: string;
}
const { openPhoto } = usePhotoViewer();
const props = withDefaults(defineProps<Props>(), {});
</script>

<style scoped lang="scss">
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.c-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--app-grey-050);
  cursor: pointer;
  @media screen and (max-width: $app-mobile) {
    width: 100%;
    height: 120px;
    border-radius: 4px;
  }
  &__file-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }
  &__item {
    width: 100%;
    height: 100%;
    object-fit: cover;

    &--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--app-grey-100);
      color: var(--app-grey-500);
    }
  }

  &__item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  &__item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
