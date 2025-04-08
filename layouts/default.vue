<template>
  <q-layout view="hHh lpR fFf" class="layout-container">
    <q-header class="header-container">
      <q-toolbar class="toolbar-container">
        <CMenu :pages="pages"></CMenu>
      </q-toolbar>
      <div class="hr-line"></div>
    </q-header>

    <q-page-container style="height: 100dvh">
      <NuxtPage></NuxtPage>
    </q-page-container>
    <PhotoViewer />
    <CAlert></CAlert>
  </q-layout>
</template>

<script setup lang="ts">
interface Page extends Tab {
  path?: string;
  nestedItems?: {
    path?: string;
    name: string;
    key: string;
    selected: boolean;
  }[];
}
const pages: Page[] = [
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
    path: "/report-problem",
  },
  {
    key: "for-employee",
    name: "Сотруднику",
    path: "/for-employee",
    hasNested: true,
    nestedItems: [
      {
        key: "employees",
        name: "Сотрудники",
        selected: false,
        path: "/employees",
      },
      {
        key: "tasks",
        name: "Задачи",
        selected: false,
        path: "/tasks",
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
  }
  .toolbar-container {
    display: flex;
    height: 64px;
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
