import { useMainStore } from "~/store/main";
export default function useCheckUser() {
  const store = useMainStore();
  function saveUserEmail(email: string) {
    const savedEmail = useCookie<string | null>("geogreen_user_email", {
      secure: false,
    });
    savedEmail.value = email;
  }
  function getUserEmail() {
    const savedEmail = useCookie<string | null>("geogreen_user_email", {
      secure: false,
    });
    return savedEmail.value || "";
  }
  async function getUserDataByEmail(email: string) {
    try {
      if (email) {
        const user = await $fetch<User>(
          `${store.apiV1}/user/search/by-email/${email}`,
          {
            method: "GET",
            headers: { Authorization: useGetToken() },
          },
        );
        if (user) {
          store.user = user;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: "Не удалось получить данные пользователя",
      };
      return false;
    }
  }
  return {
    saveUserEmail,
    getUserDataByEmail,
    getUserEmail,
  };
}
