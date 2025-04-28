import { defineStore } from "pinia";

interface MainState {
  portalApiGeospatial: string;
  portalApiFileServer: string;
  portalApiPhotoAnalyse: string;
  portalApiUserReport: string;
  portalApiAuth: string;
  portalApiKeycloak: string;
  portalApiEventManager: string;
  protocol: string;
  protocolWS: string;
  user: User | null;
  problemAreaTypes: ProblemAreaTypes[];
  landTypes: string[];
  thanksForReport: boolean;
}

export const useMainStore = defineStore("main", {
  state: (): MainState => ({
    portalApiGeospatial:
      process.env?.PORTAL_API_GEOSPATIAL ||
      (useRuntimeConfig().public.PORTAL_API_GEOSPATIAL as string),
    portalApiFileServer:
      process.env?.PORTAL_API_FILE_SERVER ||
      (useRuntimeConfig().public.PORTAL_API_FILE_SERVER as string),
    portalApiPhotoAnalyse:
      process.env?.PORTAL_API_PHOTO_ANALYSE ||
      (useRuntimeConfig().public.PORTAL_API_PHOTO_ANALYSE as string),
    portalApiUserReport:
      process.env?.PORTAL_API_USER_REPORT ||
      (useRuntimeConfig().public.PORTAL_API_USER_REPORT as string),
    portalApiAuth:
      process.env?.PORTAL_API_AUTH ||
      (useRuntimeConfig().public.PORTAL_API_AUTH as string),
    portalApiKeycloak:
      process.env?.PORTAL_API_KEYCLOAK ||
      (useRuntimeConfig().public.PORTAL_API_KEYCLOAK as string),
    protocol:
      process.env?.PORTAL_HTTP_PROTOCOL ||
      (useRuntimeConfig().public.PORTAL_HTTP_PROTOCOL as string),
    protocolWS:
      process.env?.PORTAL_SOCKETS_PROTOCOL ||
      (useRuntimeConfig().public.PORTAL_SOCKETS_PROTOCOL as string),
    portalApiEventManager:
      process.env?.PORTAL_API_EVENT_MANAGER ||
      (useRuntimeConfig().public.PORTAL_API_EVENT_MANAGER as string),
    user: null,
    problemAreaTypes: [],
    landTypes: [],
    thanksForReport: false,
  }),
  getters: {
    apiGeospatial: (state) => {
      return `${state.protocol}://${state.portalApiGeospatial}`;
    },
    apiFileServer: (state) => {
      return `${state.protocol}://${state.portalApiFileServer}`;
    },
    apiPhotoAnalyse: (state) => {
      return `${state.protocol}://${state.portalApiFileServer}`;
    },
    apiEventManager: (state) => {
      return `${state.protocol}://${state.portalApiEventManager}`;
    },
    apiUserReport: (state) => {
      return `${state.protocol}://${state.portalApiUserReport}`;
    },
    apiAuth: (state) => {
      return `${state.protocol}://${state.portalApiAuth}`;
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
    apiKeycloak: (state) => {
      return `${state.protocol}://${state.portalApiKeycloak}`;
    },
    // wsURL: (state) => {
    //   return `${state.protocolWS}://${state.host}/`;
    // },
    // wsRaw: (state) => {
    //   return `${state.protocol}://${state.host}/webSocket`;
    // },
    // baseURL: (state) => {
    //   return `${state.protocol}://${state.host}:`;
    // },
  },
});
