import { defineStore } from "pinia";

interface MainState {
  host: string;
  port: string;
  protocol: string;
  protocolWS: string;
  serverHost: string;
}

export const useMainStore = defineStore("main", {
  state: (): MainState => ({
    host: process.env?.PORTAL_API_HOST || (useRuntimeConfig().public.PORTAL_API_HOST as string),
    port: process.env?.PORTAL_PORT || (useRuntimeConfig().public.PORTAL_PORT as string),
    protocol:
      process.env?.PORTAL_HTTP_PROTOCOL ||
      (useRuntimeConfig().public.PORTAL_HTTP_PROTOCOL as string),
    protocolWS:
      process.env?.PORTAL_SOCKETS_PROTOCOL ||
      (useRuntimeConfig().public.PORTAL_SOCKETS_PROTOCOL as string),
    serverHost:
      process.env?.PORTAL_INTERNAL_SERVER_HOST ||
      (useRuntimeConfig().public.PORTAL_INTERNAL_SERVER_HOST as string)
  }),
  getters: {
    api: (state) => {
      return `${state.protocol}://${state.host}:${state.port}`;
    },
    wsURL: (state) => {
      return `${state.protocolWS}://${state.host}/`;
    },
    wsRaw: (state) => {
      return `${state.protocol}://${state.host}/webSocket`;
    },
    baseURL: (state) => {
      return `${state.protocol}://${state.host}:`;
    }
  }
});
