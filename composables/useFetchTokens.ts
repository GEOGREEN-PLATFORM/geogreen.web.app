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
      return true;
    } catch (error) {
      useState<Alert>("showAlert").value = {
        show: true,
        type: "error",
        text: "Не удалось получить доступ",
      };
      return null;
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
    } catch (error) {
      console.error("Error fetching token:", error);
      return null;
    }
  }
  return {
    setAccessToken,
    refreshToken,
  };
}
