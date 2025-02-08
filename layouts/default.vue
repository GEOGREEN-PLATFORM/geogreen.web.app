<template>
    <q-layout view="hHh lpR fFf" class="layout-container">
      <q-header class="header-container">
        <q-toolbar class="toolbar-container">
            <CMenu></CMenu>
    </q-toolbar>
    <div class="hr-line"></div>
      </q-header>

      <q-page-container>
        <NuxtPage></NuxtPage>
      </q-page-container>
  
    </q-layout>
  </template>

<script setup lang="ts">

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