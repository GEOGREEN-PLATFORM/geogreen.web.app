export function useSetToken(item: OauthToken | null) {
  const token = useCookie<OauthToken | null>("geogreen_user_token", {
    secure: false,
  });
  token.value = item ? item : null;
}
export function useGetRefreshToken() {
  const token = useCookie<OauthToken | null>("geogreen_user_token", {
    secure: false,
  });
  if (token.value) {
    return `${token.value.refresh_token}`;
  }
  return "";
}
export function useGetToken() {
  const token = useCookie<OauthToken | null>("geogreen_user_token", {
    secure: false,
  });
  if (token.value) {
    return `Bearer ${token.value.access_token}`;
  }
  return "";
}
