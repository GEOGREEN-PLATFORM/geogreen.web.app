import { defineStore } from "pinia";

interface MainState {
  portalHttpProtocol: string;
  protocolWS: string;
  portalApiPort: string;
  portalApiHost: string;
  portalKeycloakUrl: string;
  user: User | null;
  problemAreaTypes: string[];
  landTypes: string[];
  thanksForReport: boolean;
}

export const useMainStore = defineStore("main", {
  state: (): MainState => ({
    portalHttpProtocol:
      process.env?.PORTAL_HTTP_PROTOCOL ||
      (useRuntimeConfig().public.PORTAL_HTTP_PROTOCOL as string),
    protocolWS:
      process.env?.PORTAL_SOCKETS_PROTOCOL ||
      (useRuntimeConfig().public.PORTAL_SOCKETS_PROTOCOL as string),
    portalApiPort:
      process.env?.PORTAL_API_PORT ||
      (useRuntimeConfig().public.PORTAL_API_PORT as string),
    portalApiHost:
      process.env?.PORTAL_API_HOST ||
      (useRuntimeConfig().public.PORTAL_API_HOST as string),
    portalKeycloakUrl:
      process.env?.PORTAL_KEYCLOAK_URL ||
      (useRuntimeConfig().public.PORTAL_KEYCLOAK_URL as string),
    user: null,
    problemAreaTypes: [],
    landTypes: [],
    thanksForReport: false,
  }),
  getters: {
    apiV1: (state) => {
      return `${state.portalHttpProtocol}://${state.portalApiHost}:${state.portalApiPort}`;
    },
    apiKeycloak: (state) => {
      return `${state.portalHttpProtocol}://${state.portalKeycloakUrl}`;
    },
    formattedProblemAreaTypes: (state) => {
      return state.problemAreaTypes.map((el) => ({
        name: el,
        value: el,
      }));
    },
    formattedLandTypes: (state) => {
      return state.landTypes.map((el) => ({
        name: el,
        value: el,
      }));
    },
  },
  actions: {
    async initDicts() {
      const { data } = await useAsyncData("storeDicts", async () => {
        if (!this.problemAreaTypes.length) {
          this.problemAreaTypes = await $fetch(
            `${this.apiV1}/geo/dict/problem-area-types`,
          );
        }
        if (!this.landTypes.length) {
          this.landTypes = await $fetch(`${this.apiV1}/geo/dict/land-types`);
        }
        return "filled";
      });
    },
    logout() {
      this.user = null;
      useSetToken(null);
      navigateTo("/auth/login");
    },
  },
});
