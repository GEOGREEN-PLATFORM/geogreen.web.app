import { useMainStore } from "~/store/main";

export default defineNuxtRouteMiddleware((to, from) => {
  const store = useMainStore();
  console.log(to);
  if (to.name === "report-problem-thanks") {
    if (!store.thanksForReport) {
      return navigateTo("/report-problem");
    }
    store.thanksForReport = false;
  }
});
