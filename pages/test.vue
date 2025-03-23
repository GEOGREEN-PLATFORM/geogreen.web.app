<template>
  <div>
    <GGButton design-type="secondary" stretch="hug" size="small" :icon="mdiDeleteOutline" />
    <KTInputTextarea />
    <DragDrop />
    <LightDarkToggle />
  </div>
</template>

<script setup lang="ts">
import { mdiDeleteOutline } from "@quasar/extras/mdi-v6";
</script>

<style scoped lang="scss"></style>
