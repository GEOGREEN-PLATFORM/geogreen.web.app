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
    host: process.env?.PORTAL_API_HOST || "",
    port: process.env?.PORTAL_PORT || "",
    protocol: process.env?.PORTAL_HTTP_PROTOCOL || "",
    protocolWS: process.env?.PORTAL_SOCKETS_PROTOCOL || "",
    serverHost: process.env?.PORTAL_INTERNAL_SERVER_HOST || "",
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
    },
  },
});
