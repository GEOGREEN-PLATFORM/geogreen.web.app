<template>
  <CButton designType="secondary" stretch="hug" size="small" :icon="mdiDeleteOutline"></CButton>
  <CInputTextarea></CInputTextarea>
  <CDragDrop></CDragDrop>
  <CThemeToggle></CThemeToggle>
</template>

<script setup lang="ts">
import { mdiDeleteOutline } from "@quasar/extras/mdi-v6";
</script>

<style scoped lang="scss"></style>
