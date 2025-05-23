import { useMainStore } from "~/store/main";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const store = useMainStore();
  const { getUserDataByEmail, getUserEmail } = useCheckUser();
  const { refreshToken } = useFetchTokens();
  const noAuthAllowedPathNames = [
    "auth-login",
    "auth-register",
    "auth-change-password",
    "docs-privacy",
  ];
  const userAllowedPathNames = [
    ...noAuthAllowedPathNames,
    "hotbeds",
    "hotbeds-id",
    "report-problem",
    "report-problem-thanks",
    "account-user",
    "index",
  ];
  const employeeAllowedPathNames = [
    ...userAllowedPathNames.filter((name) => name !== "account-user"),
    "for-employee-employees",
    "for-employee-employees-id",
    "for-employee-applications",
    "for-employee-applications-id",
    "for-employee-task-events",
    "for-employee-task-events-id",
    "account-employee",
    "account-user",
  ];
  // if (
  //   !noAuthAllowedPathNames.includes(to.name as string) &&
  //   !(await getUserDataByEmail(getUserEmail()))
  // ) {
  //   if (!(await refreshToken())) {
  //     return navigateTo("/auth/login");
  //   }
  // }
  // const currentRoleAllowedPathNames = store.user
  //   ? store.user.role === "user"
  //     ? userAllowedPathNames
  //     : employeeAllowedPathNames
  //   : noAuthAllowedPathNames;
  // if (!currentRoleAllowedPathNames.includes(to.name as string)) {
  //   return navigateTo("/auth/login");
  // }
});
