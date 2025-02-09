<template>
    <div class="c-menu-container">
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
        <Transition name="slide-left">
          <div v-show="isMobileMenuOpened" class="c-menu-container__mobile">
        <div class="menu-top">
            <LightDarkToggle></LightDarkToggle>
          <div class="user">
                <GGButton :icon="mdiAccountOutline" strech="hug" design-type="secondary" size="small" iconColor="var(--app-grey-400)"></GGButton>
              </div><q-icon :name="mdiCog" color="grey-500" size="32px"></q-icon></div>
        <div class="menu-bottom">
          <CTabs v-model="currentPageKey" :tabs="pages" shrink vertical></CTabs>
          <div class="login-buttons">
            <GGButton label="Войти" strech="fill" size="medium"></GGButton>
            <GGButton label="Регистрация" strech="fill" design-type="secondary" size="medium"></GGButton>
          </div>
        </div>
      </div>
    </Transition>
    </div>

    
</template>

<script setup lang="ts">
import { mdiAccountOutline, mdiCog } from "@quasar/extras/mdi-v6";
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
.c-menu-container {
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 440px;
$app-narrow-mobile: 364px;


display: flex;
justify-content: space-between;
width: 100%;
gap: 48px;
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
      &__mobile {
        position: fixed;
        top: 64px;
        right: 0;
        height: 100vh;
        width: 90vw;
        border-left: 1px solid var(--app-grey-300);
        box-shadow: -2px 2px 2px rgba(0,0,0, 0.25);
        background-color: var(--app-white);
        .menu-top {
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            padding: 14px 8px;
            border-bottom: 1px solid var(--app-grey-300);
            box-shadow: 2px 2px 4px rgba(0,0,0, 0.25);
            margin-bottom: 24px;
        }
        .menu-bottom {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            width: 100%;
            :deep(.c-tabs-container) {
                width: 100%;
            }
            :deep(.c-tabs-container .q-tabs) {
                width: 100%;
            }
            :deep(.tabs__item) {
                justify-content: flex-end;
            }
            :deep(.c-tabs-container .q-tabs .q-tabs__content) {
                height: unset;  
                .tabs__content {
                    height: 64px;
                }
                .q-tab {
                    width: 100%;
                }
            }
            .login-buttons {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100%;
              gap: 24px;
              padding: 0px 20vw;
              margin-top: 24px;
              @media screen and (max-width: $app-mobile) {
                padding: 0px 24px;
              }
            }
        }
      }
}
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}
</style>