<template>
  <div class="c-menu-container">
    <div class="toolbar-left gg-logo">
      <NuxtImg class="gg-logo__image" src="/icons/gg_logo.png" width="64px"></NuxtImg>
      <div class="gg-logo__text">GeoGreen</div>
      <div
        class="burger"
        @click="toggleMenu"
        :class="{
          active: isMobileMenuOpened,
        }"
      >
        <div class="bar" v-for="_ in 3"></div>
      </div>
    </div>
    <div class="toolbar-right">
      <CThemeToggle></CThemeToggle>
      <CTabs
        v-model="currentPage"
        returnObj
        @update:model-value="(tab: string | Tab) => goToPage(tab as Tab)"
        @select-nested="selectNestedPage"
        :tabs="visiblePages"
        shrink
      ></CTabs>
      <div v-if="!store.user" class="login-buttons">
        <CButton
          label="Войти"
          strech="hug"
          size="small"
          @click="navigateTo('/auth/login')"
        ></CButton>
        <CButton
          label="Регистрация"
          strech="hug"
          design-type="secondary"
          size="small"
          @click="navigateTo('/auth/register')"
        ></CButton>
      </div>
      <div class="user">
        <CButtonDropdown
          :icon="mdiAccountOutline"
          strech="hug"
          design-type="secondary"
          size="small"
          iconColor="var(--app-grey-400)"
        >
          <q-card class="user__menu-dropdown">
            <CButton
              label="Открыть аккаунт"
              size="small"
              @click="goToAccount"
              :append-icon="mdiArrowTopRight"
            ></CButton>
            <CButton
              label="Выйти из аккаунта"
              size="small"
              @click="logout"
              :append-icon="mdiLogout"
              design-type="secondary"
            ></CButton>
          </q-card>
        </CButtonDropdown>
      </div>
    </div>
    <Transition name="slide-left">
      <div v-show="isMobileMenuOpened" class="c-menu-container__mobile">
        <div class="menu-top">
          <CThemeToggle></CThemeToggle>
          <div class="user">
            <CButtonDropdown
              :icon="mdiAccountOutline"
              strech="hug"
              design-type="secondary"
              size="small"
              iconColor="var(--app-grey-400)"
            >
              <q-card class="user__menu-dropdown">
                <CButton
                  label="Открыть аккаунт"
                  size="small"
                  @click="goToAccount"
                  :append-icon="mdiArrowTopRight"
                ></CButton>
                <CButton
                  label="Выйти из аккаунта"
                  @click="logout"
                  size="small"
                  :append-icon="mdiLogout"
                  design-type="secondary"
                ></CButton>
              </q-card>
            </CButtonDropdown>
          </div>
          <q-icon :name="mdiCog" color="grey-500" size="32px"></q-icon>
        </div>
        <div class="menu-bottom">
          <CTabs
            v-model="currentPage"
            returnObj
            @update:model-value="(tab: string | Tab) => goToPage(tab as Tab)"
            @select-nested="selectNestedPage"
            :tabs="visiblePages"
            shrink
            vertical
          ></CTabs>
          <div v-if="!store.user" class="login-buttons">
            <CButton
              label="Войти"
              strech="fill"
              size="medium"
              @click="navigateTo('/auth/login')"
            ></CButton>
            <CButton
              label="Регистрация"
              strech="fill"
              design-type="secondary"
              size="medium"
              @click="navigateTo('/auth/register')"
            ></CButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/store/main";
import {
  mdiAccountOutline,
  mdiArrowTopRight,
  mdiCog,
  mdiLogout,
} from "@quasar/extras/mdi-v6";

interface Page extends Tab {
  path?: string;
  visible?: boolean;
  hasNested?: boolean;
  nestedItems?: {
    path?: string;
    name: string;
    key: string;
    selected: boolean;
  }[];
}

const props = defineProps<{ pages: Page[] }>();
const store = useMainStore();
const route = useRoute();

const currentPage = shallowRef<Page>();
const isMobileMenuOpened = shallowRef(false);

function toggleMenu() {
  isMobileMenuOpened.value = !isMobileMenuOpened.value;
}
function logout() {
  store.logout();
}
function goToAccount() {
  if (store.user?.role === "user") {
    navigateTo("/account/user");
  } else if (store.user) {
    navigateTo("/account/employee");
  }
}
function syncTabsWithRoute() {
  props.pages.forEach((p) =>
    p.nestedItems?.forEach((n) => {
      n.selected = false;
    }),
  );
  let foundPage: Page | undefined = undefined;
  let foundNested: (typeof props.pages)[0]["nestedItems"][0] | undefined =
    undefined;
  for (const page of props.pages) {
    if (page.hasNested) {
      const hit = page.nestedItems?.find((n) =>
        route.path.startsWith(`${page.path}${n.path}`),
      );
      if (hit) {
        foundPage = page;
        foundNested = hit;
        break;
      }
    } else if (
      page.path &&
      ((route.path === page.path && page.path === "/") ||
        (page.path !== "/" && route.path.startsWith(page.path)))
    ) {
      foundPage = page;
      break;
    }
  }
  if (foundPage) {
    currentPage.value = foundPage;
    if (foundNested) {
      foundNested.selected = true;
    }
  } else {
    currentPage.value = undefined;
  }
}

onMounted(syncTabsWithRoute);
watch(
  () => route.path,
  () => {
    syncTabsWithRoute();
    if (isMobileMenuOpened.value) {
      isMobileMenuOpened.value = false;
    }
  },
);

async function goToPage(page: Page) {
  if (!page.hasNested && page.path) {
    props.pages.forEach((p) =>
      p.nestedItems?.forEach((n) => {
        n.selected = false;
      }),
    );
    await navigateTo(page.path);
  }
}

async function selectNestedPage(page: Page, nestedKey: string) {
  const nested = page.nestedItems?.find((n) => n.key === nestedKey);
  if (!nested) return;
  props.pages.forEach((p) =>
    p.nestedItems?.forEach((n) => {
      n.selected = false;
    }),
  );
  nested.selected = true;
  await navigateTo(`${page.path}${nested.path}`);
}

const visiblePages = computed(() => props.pages.filter((p) => p.visible));

function handleAccountClick() {
  if (store.user?.role === "user") {
    navigateTo("/account/user");
  } else if (store.user) {
    navigateTo("/account/employee");
  } else {
    navigateTo("/auth/register");
  }
}
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
    &__image {
    }
    &__text {
      font-size: 32px;
      background: linear-gradient(270deg, #006d07 0%, #04700b 52%, #000000 100%);
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
    :global(.user__menu-dropdown) {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 12px;
    }
  }
  .burger {
    width: 32px;
    height: 21px;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    .bar {
      width: 100%;
      height: 3px;
      background-color: var(--app-grey-500);
      transition:
        transform 0.3s ease,
        opacity 0.3s ease;
      border-radius: 2px;
    }
  }
  .burger.active .bar:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
  }
  .burger.active .bar:nth-child(2) {
    opacity: 0;
  }
  .burger.active .bar:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
  }
  &__mobile {
    position: fixed;
    top: 64px;
    right: 0;
    height: 100vh;
    width: 90vw;
    border-left: 1px solid var(--app-grey-300);
    box-shadow: -2px 2px 2px rgba(0, 0, 0, 0.25);
    background-color: var(--app-white);
    .menu-top {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      padding: 14px 8px;
      border-bottom: 1px solid var(--app-grey-300);
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
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
