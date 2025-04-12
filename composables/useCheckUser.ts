import { useMainStore } from "~/store/main";
export default function useCheckUser() {
  const store = useMainStore();
  function saveUserEmail(email: string) {
    const savedEmail = useCookie<string | null>("geogreen_user_email");
    savedEmail.value = email;
  }
  function getUserEmail() {
    const savedEmail = useCookie<string | null>("geogreen_user_email");
    return savedEmail.value || "";
  }
  async function getUserDataByEmail(email: string) {
    try {
      if (email) {
        const user = await $fetch<User>(`${store.apiAuth}/user/${email}`, {
          method: "GET",
          headers: { Authorization: useGetToken() },
        });
        if (user) {
          store.user = user;
        } else {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  return {
    saveUserEmail,
    getUserDataByEmail,
    getUserEmail,
  };
}
