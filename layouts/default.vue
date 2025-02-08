<template>
    <q-layout view="hHh lpR fFf" class="layout-container">
      <q-header class="header-container">
        <q-toolbar class="toolbar-container">
            <div class="toolbar-left gg-logo">
                <NuxtImg class="gg-logo__image" src="/icons/gg_logo.jpg" width="32px"></NuxtImg>
                <div class="gg-logo__text">GeoGreen</div>
                <div class="burger" @click="toggleMenu" :class="{
                  active: isMobileMenuOpened,
                }">
                  <div class="bar"></div>
                  <div class="bar"></div>
                  <div class="bar"></div>
              </div>
            </div>
            <div class="toolbar-right">
              <LightDarkToggle></LightDarkToggle>
              <CTabs v-model="currentPageKey" :tabs="pages" shrink></CTabs>
              <div class="login-buttons">
                <GGButton label="Войти" strech="hug" size="small"></GGButton>
                <GGButton label="Регистрация" strech="hug" design-type="secondary" size="small"></GGButton>
              </div>
              <div class="user">
                <GGButton :icon="mdiAccountOutline" strech="hug" design-type="secondary" size="small" iconColor="var(--app-grey-400)"></GGButton>
              </div>
            </div>
    </q-toolbar>
    <div class="hr-line"></div>
      </q-header>
      <!-- <div>
        <div><LightDarkToggle></LightDarkToggle>
          <div class="user">
                <GGButton :icon="mdiAccountOutline" strech="hug" design-type="secondary" size="small" iconColor="var(--app-grey-400)"></GGButton>
              </div>Y</div>
        <div>
          <CTabs v-model="currentPageKey" :tabs="pages" shrink></CTabs>
          <div class="login-buttons">
            <GGButton label="Войти" strech="hug" size="small"></GGButton>
            <GGButton label="Регистрация" strech="hug" design-type="secondary" size="small"></GGButton>
          </div>
        </div>
      </div> -->
      <q-page-container>
        <NuxtPage></NuxtPage>
      </q-page-container>
  
    </q-layout>
  </template>

<script setup lang="ts">
import { mdiAccountOutline } from "@quasar/extras/mdi-v6";
const currentPageKey = shallowRef("main");
const isMobileMenuOpened = shallowRef(false);
const pages: Tab[] = [
  {
    key: "main",
    name: "Главная",
    disabled: true,
  },
  {
    key: "hotbeds",
    name: "Очаги",
    disabled: true,
  },
  {
    key: "report",
    name: "Сообщить",
  },
  {
    key: "for-employee",
    name: "Сотруднику",
    disabled: true,
  },
];
function toggleMenu() {
  isMobileMenuOpened.value = !isMobileMenuOpened.value;
}
</script>

<style scoped lang="scss">
.layout-container {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 364px;
  $app-narrow-mobile: 364px;
    .header-container {
        padding: 0px 28px;
    }
    .toolbar-container {
        display: flex;
        justify-content: space-between;
        gap: 48px;
        height: 64px;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      .burger {
          display: none;
        }
      @media screen and (max-width: $app-laptop) {
        width: 100%;
        justify-content: space-between;
        .burger {
          display: flex;
        }
      }
      @media screen and (max-width: $app-narrow-mobile) {
        .gg-logo__text {
          display: none;
        }
      }
    }
    .gg-logo {
        display: flex;
        align-items: center;
        gap: 24px;
        &__image {

        }
        &__text {
            font-family: Montserrat;
            font-size: 32px;
            background: linear-gradient(270deg, #006D07 0%, #04700B 52%, #000000 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }
    // --- *start* 
    // comment: 08.02.2025 - подумать над перемещением в качестве props для CTabs
    :deep(.c-tabs-container .q-tabs .q-tabs__content) {
        height: 64px;
    }
    // --- *end*
    .toolbar-right {
        display: flex;
        align-items: center;
        gap: 32px;
        height: 64px;
        @media screen and (max-width: $app-laptop) {
          display: none;
        }
    }
    .login-buttons {
        display: flex;
        align-items: center;
        gap: 16px;
        @media screen and (max-width: $app-desktop) {
          display: none;
        }
    }
    .user {
        display: flex;
        align-items: center;
    }
    .burger {
        width: 40px;
        height: 28px;
        justify-content: space-between;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        .bar {
        width: 100%;
        height: 4px;
        background-color: black;
        transition: 0.3s;
        border-radius: 5px;
        }
    }
    .burger.active .bar:nth-child(1) {
          transform: translateY(12px) rotate(45deg);
      }
      .burger.active .bar:nth-child(2) {
          opacity: 0;
      }
      .burger.active .bar:nth-child(3) {
          transform: translateY(-12px) rotate(-45deg);
      }
      .hr-line {
        width: 100vw;
        position: relative;
        left: -28px;
        top: -1px;
        height: 1px;
        background-color: var(--app-grey-050);
      }
}
</style>