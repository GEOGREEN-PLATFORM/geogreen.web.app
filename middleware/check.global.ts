import { useMainStore } from "~/store/main";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { getUserDataByEmail, getUserEmail } = useCheckUser();
  const { refreshToken } = useFetchTokens();
  const noAuthAllowedPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/change-password",
  ];
  try {
    if (
      !noAuthAllowedPaths.includes(to.path) &&
      !(await getUserDataByEmail(getUserEmail()))
    ) {
      if (!(await refreshToken())) {
        return navigateTo("/auth/login");
      }
    }
  } catch (e) {
    return navigateTo("/login");
  }
});
