import { useMainStore } from "~/store/main";

export default defineNuxtRouteMiddleware((to, from) => {
  const store = useMainStore();
  if (to.path !== "/auth/register" && to.path !== "/" && !store.user) {
    return navigateTo("/auth/register");
  }
});
