<template>
    <div class="c-menu-container">
        <div class="toolbar-left gg-logo">
        <NuxtImg class="gg-logo__image" src="/icons/gg_logo.jpg" width="32px"></NuxtImg>
        <div class="gg-logo__text">GeoGreen</div>
        <div class="burger" @click="toggleMenu" :class="{
            active: isMobileMenuOpened,
        }">
            <div class="bar" v-for="_ in 3"></div>
        </div>
    </div>
    <div class="toolbar-right">
        <LightDarkToggle></LightDarkToggle>
        <CTabs v-model="currentPage" returnObj @update:model-value="goToPage" @select-nested="selectNestedPage" :tabs="pages" shrink></CTabs>
        <div class="login-buttons">
        <GGButton label="Войти" strech="hug" size="small" @click="navigateTo('/auth/login')"></GGButton>
        <GGButton label="Регистрация" strech="hug" design-type="secondary" size="small" @click="navigateTo('/auth/register')"></GGButton>
        </div>
        <div class="user" @click="handleAccountClick">
        <GGButton :icon="mdiAccountOutline" strech="hug" design-type="secondary" size="small" iconColor="var(--app-grey-400)"></GGButton>
        </div>
    </div>
        <Transition name="slide-left">
          <div v-show="isMobileMenuOpened" class="c-menu-container__mobile">
        <div class="menu-top">
            <LightDarkToggle></LightDarkToggle>
          <div class="user" @click="handleAccountClick">
                <GGButton :icon="mdiAccountOutline" strech="hug" design-type="secondary" size="small" iconColor="var(--app-grey-400)"></GGButton>
              </div><q-icon :name="mdiCog" color="grey-500" size="32px"></q-icon></div>
        <div class="menu-bottom">
          <CTabs v-model="currentPage" returnObj @update:model-value="goToPage" @select-nested="selectNestedPage" :tabs="pages" shrink vertical></CTabs>
          <div class="login-buttons">
            <GGButton label="Войти" strech="fill" size="medium" @click="navigateTo('/auth/login')"></GGButton>
            <GGButton label="Регистрация" strech="fill" design-type="secondary" size="medium" @click="navigateTo('/auth/register')"></GGButton>
          </div>
        </div>
      </div>
    </Transition>
    </div>

    
</template>

<script setup lang="ts">
import { mdiAccountOutline, mdiCog } from "@quasar/extras/mdi-v6";
interface Page extends Tab {
  path?: string;
  nestedItems?: {
    path?: string;
    name: string;
    key: string;
    selected: boolean;
  }[];
}
interface Props {
  pages: Page[];
}
const route = useRoute();
const props = defineProps<Props>();
const currentPage = shallowRef<Page>();
const isMobileMenuOpened = shallowRef(false);
function toggleMenu() {
  isMobileMenuOpened.value = !isMobileMenuOpened.value;
}
function goToPage(page: Page) {
  if (!page.hasNested) {
    props.pages.forEach((page) => {
      if (page.hasNested) {
        page.nestedItems?.forEach((nested) => {
          nested.selected = false;
        });
      }
    });
    navigateTo(page.path);
  }
}
function selectNestedPage(page: Page, nestedKey: string) {
  const nestedPage = page.nestedItems?.find((item) => item.key === nestedKey);
  console.log(page.nestedItems, nestedKey);
  if (nestedPage) {
    nestedPage.selected = true;
    navigateTo(`${page.path}${nestedPage.path}`);
  }
}
function handleAccountClick() {
  navigateTo("/auth/register");
}
onMounted(() => {
  props.pages.forEach((page) => {
    if (page.hasNested) {
      page.nestedItems?.forEach((nested) => {
        if (`${page.path}${nested.path}` === route.path) {
          currentPage.value = page;
          nested.selected = true;
        }
      });
    } else {
      if (page.path === route.path) {
        currentPage.value = page;
      }
    }
  });
});
</script>

<style scoped lang="scss">
.c-menu-container {
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
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
            font-size: 32px;
            background: linear-gradient(270deg, #006D07 0%, #04700B 52%, #000000 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }
    .toolbar-right {
        display: flex;
        align-items: center;
        gap: 32px;
        height: 64px;
        @media screen and (max-width: $app-laptop) {
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
        background-color: var(--app-grey-500);
        transition: transform 0.3s ease, opacity 0.3s ease;
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
        }
      }
      .login-buttons {
        display: flex;
        align-items: center;
        gap: 16px;
        @media screen and (max-width: $app-desktop) and (min-width: $app-laptop) {
          display: none;
        }
        @media screen and (max-width: $app-laptop) {
          flex-direction: column;
          width: 100%;
          gap: 24px;
          padding: 0px 20vw;
          margin-top: 24px;
        }
        @media screen and (max-width: $app-mobile) {
          padding: 0px 24px;
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