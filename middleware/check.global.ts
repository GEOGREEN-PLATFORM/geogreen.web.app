import { useMainStore } from "~/store/main";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const store = useMainStore();
  const { getUserDataByEmail, getUserEmail } = useCheckUser();
  const { refreshToken } = useFetchTokens();
  if (!(await getUserDataByEmail(getUserEmail()))) {
    await refreshToken();
  }
  const noAuthAllowedPathNames = [
    "auth-login",
    "auth-register",
    "auth-change-password",
  ];
  const userAllowedPathNames = [
    ...noAuthAllowedPathNames,
    "hotbeds",
    "report-problem",
    "index",
  ];
  const employeeAllowedPathNames = [
    ...userAllowedPathNames,
    "for-employee-employees",
    "for-employee-employees-id",
    "for-employee-applications",
    "for-employee-applications-id",
    "for-employee-task-events",
    "for-employee-task-events-id",
  ];
  const currentRoleAllowedPathNames = store.user
    ? store.user.role === "user"
      ? userAllowedPathNames
      : employeeAllowedPathNames
    : noAuthAllowedPathNames;
  if (!currentRoleAllowedPathNames.includes(to.name as string)) {
    return navigateTo("/auth/login");
  }
});
