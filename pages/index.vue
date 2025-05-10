<template>
  <div class="b-page">
    <div class="b-hero-background">
      <div class="b-hero-background__content">
        <div class="b-hero-background__text">
          МИНИМУМ УСИЛИЙ<br />
          МАКСИМУМ ВЛИЯНИЯ<br />
          GEOGREEN
        </div>
        <div class="b-hero-background__actions">
          <CButton label="Сообщить о проблеме"></CButton>
          <CButton label="К карте"></CButton>
        </div>
      </div>
    </div>
    <div class="b-page__content"></div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

const store = useMainStore();
</script>

<style scoped lang="scss">
.b-page {
  .b-hero-background {
    position: absolute;
    top: 0;
    background-image: url("/public/images/hero_main_bg.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    width: 100dvw;
    height: 100dvh;
    &__content {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 668px;
      position: relative;
      top: 20dvh;
      left: 15dvw;
    }
    &__text {
      font-family: "Russo One";
      font-size: 48px;
    }
    &__actions {
      display: flex;
      gap: 64px;
      align-items: center;
    }
  }
}
</style>
