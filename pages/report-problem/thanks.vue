<template>
  <div class="report-sent-page">
    <div class="b-card">
      <h1 class="gg-h1">
        Отчет отправлен.<br />
        Спасибо за Вашу заботу о&nbsp;природе!
      </h1>
      <div class="b-heart">
        <NuxtImg src="/icons/green_heart.svg" alt="heart" />
      </div>
      <CButton @click="navigateTo('/')">На главную</CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: "only-programmatic",
});
</script>

<style lang="scss" scoped>
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

.report-sent-page {
  height: 100dvh;
  width: 100dvw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .b-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32px;
    padding: 64px;
    background-color: var(--app-green-050);
    border-radius: 16px;

    .gg-h1 {
      text-align: center;
    }

    .b-heart {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 333px;
      height: 333px;
      img {
        width: 100%;
        height: 100%;
        transform-origin: center center;
        animation: heartbeat 3s ease infinite;
        pointer-events: none;
      }
    }
  }
}
@media screen and (max-width: $app-mobile) {
  .report-sent-page {
    .b-card {
      width: 100dvw;
      height: 100dvh;
      padding: 16px;
      border-radius: 0;

      .b-heart {
        width: 100%;
        height: 222px;
      }
    }
  }
}
@keyframes heartbeat {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(93, 169, 66, 0));
  }
  10% {
    transform: scale(1.2);
    filter: drop-shadow(0 0 12px rgba(93, 169, 66, 0.4));
  }
  20% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(93, 169, 66, 0));
  }
  30% {
    transform: scale(1.15);
    filter: drop-shadow(0 0 8px rgba(93, 169, 66, 0.3));
  }
  40% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(93, 169, 66, 0));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(93, 169, 66, 0));
  }
}
</style>
