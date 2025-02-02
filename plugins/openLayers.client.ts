import OpenLayers from "vue3-openlayers";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(OpenLayers);
});
