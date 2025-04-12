import { useMainStore } from "~/store/main";

export function useFetchTokens() {
  const store = useMainStore();
  async function setAccessToken(userAuthData: {
    email: string;
    password: string;
  }) {
    const params = new URLSearchParams({
      username: userAuthData.email,
      password: userAuthData.password,
      grant_type: "password",
      client_id: "user-client",
    });
    try {
      const response = await $fetch<OauthToken>(
        `${store.apiKeycloak}/realms/geogreen/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        },
      );
      useSetToken(response);
      return response;
    } catch (error: any) {
      if (error.status === 401) {
        useState<Alert>("showAlert").value = {
          show: true,
          type: "error",
          text: "Неверный логин или пароль",
        };
      } else {
        useState<Alert>("showAlert").value = {
          show: true,
          type: "error",
          text: "Не удалось получить доступ",
        };
      }
      return false;
    }
  }
  async function refreshToken() {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: "user-client",
      refresh_token: useGetRefreshToken(),
    });
    try {
      const response = await $fetch<OauthToken>(
        `${store.apiKeycloak}/realms/geogreen/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        },
      );
      useSetToken(response);
      return true;
    } catch (error) {
      console.error("Error fetching token:", error);
      return false;
    }
  }
  return {
    setAccessToken,
    refreshToken,
  };
}
