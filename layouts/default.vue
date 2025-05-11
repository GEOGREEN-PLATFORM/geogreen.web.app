<template>
  <q-layout view="hHh lpR fFf" class="layout-container">
    <q-header
      class="header-container"
      :class="{ 'header-container--transparent': route.meta?.transparentHeader }"
    >
      <q-toolbar class="toolbar-container">
        <CMenu :pages="pages"></CMenu>
      </q-toolbar>
      <div class="hr-line"></div>
    </q-header>

    <q-page-container style="height: 100dvh">
      <NuxtPage></NuxtPage>
    </q-page-container>
    <CPhotoViewer />
    <CAlert></CAlert>
  </q-layout>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

interface Page extends Tab {
  path?: string;
  nestedItems?: {
    path?: string;
    name: string;
    key: string;
    selected: boolean;
  }[];
  visible: boolean;
}
const store = useMainStore();
const route = useRoute();
const pages: Page[] = [
  {
    key: "main",
    name: !store.user || store.user?.role === "user" ? "Главная" : "Карта",
    path: "/",
    visible: true,
  },
  {
    key: "hotbeds",
    name: "Очаги",
    path: "/hotbeds",
    visible: store.user?.role !== "user",
  },
  {
    key: "report",
    name: "Сообщить",
    path: "/report-problem",
    visible: store.user?.role === "user",
  },
  {
    key: "for-employee",
    name: "Сотруднику",
    path: "/for-employee",
    hasNested: true,
    visible: store.user?.role !== "user",
    nestedItems: [
      {
        key: "employees",
        name: "Сотрудники",
        selected: false,
        path: "/employees",
      },
      {
        key: "events",
        name: "Мероприятия",
        selected: false,
        path: "/task-events",
      },
      {
        key: "applications",
        name: "Заявки",
        selected: false,
        path: "/applications",
      },
    ],
  },
];
</script>

<style scoped lang="scss">
.layout-container {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;
  background-color: var(--app-white);
  .header-container {
    padding: 0px 28px;
    background-color: var(--app-white);
    transition: background-color 0.3s ease;
    &--transparent:not(:has(.c-menu-container__mobile.opened)) {
      background-color: transparent;
      :deep(.q-tab) {
        transition:
          background-color 0.3s ease,
          color 0.3s ease;
        background-color: transparent;
        .q-focus-helper {
          transition: opacity 0.3s ease;
          opacity: 0 !important;
        }
        &:hover {
          color: var(--app-green-700);
        }
      }
      :deep(.q-tab--active) {
        color: var(--app-green-050);
      }
      :deep(.hr-line) {
        transition: background-color 0.3s ease;
        background-color: transparent;
      }
    }
  }
  .toolbar-container {
    display: flex;
    height: 64px;
  }

  .hr-line {
    width: 100vw;
    position: absolute;
    left: 0;
    height: 2px;
    top: calc(100% - 2px);
    background-color: var(--app-grey-050);
  }
}
</style>
