<template>
  <ClientOnly>
    <ol-map
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      class="g-green-map"
      id="gg-map"
      :controls="[]"
      @click="handleMapClick"
      @precompose.once="configureMap"
      @pointermove="handleMapPointerMove"
      ref="mapRef"
    >
      <ol-view
        :center="gGreenOlMap.center"
        :rotation="gGreenOlMap.rotation"
        :resolution="gGreenOlMap.resolution"
        :projection="gGreenOlMap.projection"
      />
      <ol-tile-layer>
        <ol-source-xyz :url="gGreenOlMap.url" />
      </ol-tile-layer>
      <ol-control-bar ref="controlBar" v-if="!hideControls">
        <ol-toggle-control
          v-if="props.addMarker !== 'hide'"
          html="Добавить маркер"
          class-name="g-green-control-bar__item g-green-control-bar__marker"
          :on-toggle="toggleMarkerAdd"
        />
        <ol-toggle-control
          v-if="props.addZone !== 'hide'"
          html="Добавить зону"
          class-name="g-green-control-bar__item g-green-control-bar__zone"
          :on-toggle="toggleZoneAdd"
        />
        <ol-toggle-control
          v-if="props.toggleVisibility !== 'hide'"
          :key="isAllZonesVisible"
          :html="isAllZonesVisible ? 'Скрыть все зоны' : 'Показать все зоны'"
          :class-name="`g-green-control-bar__item g-green-control-bar__zones-visible ${isAllZonesVisible ? 'g-green-control-bar__zones-visible--off' : ''}`"
          :on-toggle="toggleAllZonesVisibility"
        />
      </ol-control-bar>
      <ol-interaction-clusterselect
        v-if="gGreenOlMap.interactionType !== 'zone_add'"
        ref="featureSelect"
        :point-radius="64"
        @select="selectMarker"
      >
        <ol-style :override-style-function="overrideMarkerStyleFunction">
          <ol-style-icon :src="markerIconDefaultSrc" :scale="1" />
          <ol-style-circle :radius="48">
            <ol-style-stroke color="black" :width="1" line-cap="round" />
            <ol-style-fill color="black" />
          </ol-style-circle>
          <ol-style-text>
            <ol-style-fill color="white" />
          </ol-style-text>
        </ol-style>
      </ol-interaction-clusterselect>

      <ol-vector-layer>
        <ol-source-vector :features="gGreenCluster.zonesFeatures" :format="gGreenCluster.geoJSON" />
        <ol-style :override-style-function="overrideZoneStyleFunction" />
      </ol-vector-layer>
      <ol-vector-layer>
        <ol-source-vector :key="upKey">
          <ol-interaction-draw
            v-if="gGreenOlMap.interactionType === 'zone_add'"
            type="Polygon"
            @drawend="createZone"
          >
            <ol-style
              :override-style-function="() => getPolygonStyleByDensity(gGreenZone.density)"
            />
          </ol-interaction-draw>
          <ol-style :override-style-function="() => getPolygonStyleByDensity(gGreenZone.density)" />
        </ol-source-vector>
      </ol-vector-layer>
      <ol-animated-clusterlayer :animation-duration="500" :distance="40">
        <ol-source-vector
          :features="gGreenCluster.markerFeatures"
          :format="gGreenCluster.geoJSON"
        />
        <ol-style :override-style-function="overrideMarkerStyleFunction">
          <ol-style-icon :src="markerIconDefaultSrc" :scale="1" />
          <ol-style-circle :radius="48">
            <ol-style-stroke color="black" :width="1" line-cap="round" />
            <ol-style-fill color="black" />
          </ol-style-circle>
          <ol-style-text>
            <ol-style-fill color="white" />
          </ol-style-text>
        </ol-style>
      </ol-animated-clusterlayer>
      <ol-geolocation
        ref="geolocationRef"
        :projection="gGreenOlMap.projection"
        @change:position="geoLocChange"
      >
        <template>
          <ol-vector-layer :zIndex="2">
            <ol-source-vector>
              <ol-feature ref="positionFeature">
                <ol-geom-point :coordinates="gGreenOlMap.geolocation"></ol-geom-point>
                <ol-style>
                  <ol-style-icon :src="myLocationIcon" :scale="0.1"></ol-style-icon>
                </ol-style>
              </ol-feature>
            </ol-source-vector>
          </ol-vector-layer>
        </template>
      </ol-geolocation>
      <ol-overlay
        v-for="[id, marker] in Array.from(gGreenCluster.markersPopupOpened.entries())"
        :key="id"
        :position="marker.coordinate"
        :auto-pan="true"
        class-name="g-green-marker-popup-container"
        positioning="bottom-center"
      >
        <div class="popup-marker">
          <q-icon
            class="popup-marker__close-img"
            :name="mdiClose"
            size="24px"
            @click="handleCloseMarkerPopup(id)"
          />
          <div
            v-if="marker.isTempCreatedBy"
            class="popup-marker__user-created text-center gg-t-base q-py-sm"
          >
            {{
              marker.isTempCreatedBy === "user"
                ? store.user?.role === "user"
                  ? "Вы сообщаете об этом очаге"
                  : "Пользователь сообщает об этом очаге"
                : "Вы добавляете этот очаг"
            }}
          </div>
          <ul v-if="marker.details" class="data-list">
            <li
              v-for="[name, value] in Object.entries(marker.details || {}).filter(
                ([name, value]) =>
                  marker.isTempCreatedBy === 'user'
                    ? name === 'problemAreaType'
                      ? true
                      : false
                    : shortInfoKeys[name],
              )"
              :key="name"
              class="data-list__item"
            >
              <div class="data-list__name">{{ shortInfoKeys[name].name }}</div>
              <div v-if="value" class="data-list__value">
                <div v-if="shortInfoKeys[name].type === 'text'">{{ value }}</div>
                <div
                  v-else-if="shortInfoKeys[name].type === 'status' && typeof value === 'string'"
                  :class="getStatusClasses(value)"
                  class="data-list__status-block"
                >
                  {{ value }}
                </div>
              </div>
              <div v-else class="data-list__value--empty">Не указано</div>
            </li>
          </ul>
          <div v-else class="popup-marker__no-data">Данные не найдены</div>
          <div
            v-if="
              store.user?.role !== 'user' || (marker.isTempCreatedBy && store.user?.role === 'user')
            "
            class="popup-marker__divider"
          />
          <ul class="actions-label">
            <li
              class="actions-label__action"
              v-if="
                props.editableMarkers === 'all' ||
                (Array.isArray(props.editableMarkers) && props.editableMarkers?.includes(marker.id))
              "
            >
              <q-icon
                class="actions-label__icon actions-label__icon--blue"
                :name="mdiInformation"
                size="24px"
              >
                <CHint>
                  Выбранный маркер будет автоматически перемещён внутрь
                  {{ marker.coordinates?.length ? "измененной" : "добавленной" }} зоны
                </CHint>
              </q-icon>
              <span class="actions-label__text" @click="addZone(id)"
                >{{ marker.coordinates?.length ? "Изменить" : "Добавить" }} зону</span
              >
              <q-icon
                class="actions-label__icon"
                :name="marker.coordinates?.length ? mdiPencil : mdiPlus"
              />
            </li>
            <li
              class="actions-label__action"
              v-if="
                props.editableMarkers === 'all' ||
                (Array.isArray(props.editableMarkers) && props.editableMarkers?.includes(marker.id))
              "
            >
              <span class="actions-label__text">Плотность:</span>
              <COptions
                v-model="marker.details.density"
                inline
                :options="densityOptions"
                @update:model-value="updateFeatures(id, marker)"
              />
            </li>
            <li
              class="actions-label__action"
              v-if="
                !marker.isTempCreatedBy &&
                (props.nonCheckableMarkers === 'none' ||
                  (Array.isArray(props.nonCheckableMarkers) &&
                    !props.nonCheckableMarkers?.includes(marker.id)))
              "
            >
              <CButton
                label="Подробнее"
                size="small"
                stretch="fill"
                design-type="secondary"
                @click="checkDetailInfo(marker.id)"
              ></CButton>
            </li>
            <li
              class="actions-label__action"
              v-if="
                props.selectableMarkers === 'all' ||
                (typeof Array.isArray(props.selectableMarkers) &&
                  props.selectableMarkers?.includes(marker.id))
              "
            >
              <CButton
                v-if="marker.id !== props.selectedMarker?.id"
                @click="externalSelectMarker(marker)"
                label="Выбрать"
                size="small"
                stretch="fill"
              ></CButton>
              <CButton
                v-else
                @click="externalCancelMarkerSelection(marker)"
                label="Отменить выбор"
                size="small"
                stretch="fill"
                design-type="tertiary"
              ></CButton>
            </li>
            <li
              class="actions-label__action"
              v-else-if="
                (marker.isTempCreatedBy === 'employee' && store.user?.role !== 'user') ||
                (marker.isTempCreatedBy === 'user' && store.user?.role === 'user')
              "
            >
              <CButton
                label="Удалить"
                size="small"
                stretch="fill"
                bg-color="var(--app-red-500)"
                @click="suggestDeleteMarker(marker.id)"
              ></CButton>
            </li>
            <li class="actions-label__action">
              <slot name="custom-action"></slot>
            </li>
            <li v-if="marker.isTempCreatedBy" class="actions-label__action">
              <slot name="custom-temp-action"></slot>
            </li>
          </ul>
        </div>
      </ol-overlay>
      <ol-fullscreen-control @click="checkFullscreenAvailability" />
      <ol-zoom-control :zoomInLabel="plusElem" :zoomOutLabel="minusElem" />
      <div class="geolocation-control">
        <button
          class="geolocation-btn"
          @click="centerOnGeolocation"
          :title="
            gGreenOlMap.geolocation.length ? 'Центрировать по геолокации' : 'Геолокация недоступна'
          "
        >
          <q-icon :name="mdiCrosshairsGps" size="24px"></q-icon>
        </button>
      </div>
    </ol-map>
    <CDialogConfirm
      v-model="confirmationDialog.isOpened"
      :action-main-text="confirmationDialog.mainText"
      :action-button-confirm-text="confirmationDialog.buttonText"
      @confirm="deleteMarker"
    />
    <div v-show="false" class="html-control-elements">
      <img src="/icons/plus.svg" ref="plusElem" />
      <img src="/icons/minus.svg" ref="minusElem" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  mdiClose,
  mdiCrosshairsGps,
  mdiInformation,
  mdiPencil,
  mdiPlus,
} from "@quasar/extras/mdi-v6";
import type { Feature, MapBrowserEvent, View } from "ol";
import type { MapControls, SelectCluster } from "ol-ext";
import type { FeatureLike } from "ol/Feature";
import type Geolocation from "ol/Geolocation";
import type { ObjectEvent } from "ol/Object";
import type { Coordinate } from "ol/coordinate";
import { getCenter } from "ol/extent";
import { GeoJSON } from "ol/format";
import type { Geometry } from "ol/geom";
import type { DrawEvent } from "ol/interaction/Draw";
import type { SelectEvent } from "ol/interaction/Select";
import { Circle, Fill, Icon, Stroke, Style } from "ol/style.js";
import type CircleStyle from "ol/style/Circle";
import { useMainStore } from "~/store/main";
import markerIconDefaultSrc from "/icons/map_marker_default.png";
import markerIconGreenSrc from "/icons/map_marker_green.png";
import markerIconOrangeSrc from "/icons/map_marker_orange.png";
import markerIconRedSrc from "/icons/map_marker_red.png";
import myLocationIcon from "/icons/my_location.png";

interface Props {
  markers: Marker[];
  shortInfoKeys: MapPopupShortInfoKeys;
  dataStatusClasses: {
    [key: string]: string;
  };
  addZone?: "hide" | "enable" | "forbid";
  addMarker?: "hide" | "enable" | "forbid";
  toggleVisibility?: "hide" | "enable" | "forbid";
  hideControls?: boolean;
  selectedMarker?: Marker | null;
  editableMarkers?: "all" | "none" | string[];
  selectableMarkers?: "all" | "none" | string[];
  nonCheckableMarkers?: "all" | "none" | string[];
  dataLoading?: boolean;
  defaultInteractionType?: "zone_add" | "marker_add" | "none";
}
const store = useMainStore();
const mapRef = ref();
const view = ref<View>();
const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
  addZone: "enable",
  addMarker: "enable",
  toggleVisibility: "enable",
  nonCheckableMarkers: "none",
  hideControls: false,
});
const emit = defineEmits<{
  addMarker: [coordinate: Coordinate, zone?: ZoneWithDensity];
  deleteMarker: [id: string];
  editMarker: [id: string, marker: Marker];
  selectMarker: [id: string, marker: Marker];
  cancelMarkerSelection: [id: string];
  checkDetailInfo: [id: string];
  forbiddenAddMarker: [];
}>();

const $q = useQuasar();
const confirmationDialog = reactive({
  isOpened: false,
  mainText: "",
  buttonText: "",
});
const plusElem = ref<HTMLElement>();
const minusElem = ref<HTMLElement>();

const markersSrcByDensity = ref({
  default: markerIconDefaultSrc,
  LOW: markerIconGreenSrc,
  MIDDLE: markerIconOrangeSrc,
  HIGH: markerIconRedSrc,
});

const densityOptions = [
  {
    value: "LOW",
    color: "green-500",
    keepColor: true,
  },
  {
    value: "MIDDLE",
    color: "orange-500",
    keepColor: true,
  },
  {
    value: "HIGH",
    color: "red-500",
    keepColor: true,
  },
];

const isAllZonesVisible = ref(false);
const upKey = ref(0);
const controlBarRef = useTemplateRef<MapControls>("controlBar");
const featureSelectRef = useTemplateRef<SelectCluster>("featureSelect");
const geolocationRef = useTemplateRef<{ geoLoc: Geolocation }>(
  "geolocationRef",
);
const gGreenOlMap = reactive({
  center: [4890670.38077, 7615726.876165] as Coordinate,
  resolution: 36,
  rotation: 0,
  interactionType: "none",
  projection: "EPSG:3857",
  url: "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png",
  geolocation: [] as Coordinate,
});

const gGreenZone = reactive({
  density: "default" as Density,
});

const gGreenCluster = reactive({
  markersPopupOpened: new Map<string, Marker>(),
  markerFeatures: [] as Feature<Geometry>[],
  zonesFeatures: [] as Feature<Geometry>[],
  markersDict: new Map<string, Marker>(),
  currentSelectedMarkerId: "",
  geoJSON: new GeoJSON(),
});

function openConfirmationDialog(mainText: string, buttonText: string) {
  confirmationDialog.mainText = mainText;
  confirmationDialog.buttonText = buttonText;
  confirmationDialog.isOpened = true;
}

function convertMarkersToFeatures(markers: Marker[]) {
  const features = markers
    .filter((marker) => marker.coordinate)
    .map((marker) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: marker.coordinate! },
      id: marker.id,
    }));
  const providerFeatureCollection = {
    type: "FeatureCollection",
    features,
  };
  return gGreenCluster.geoJSON.readFeatures(providerFeatureCollection);
}
async function centerOnGeolocation() {
  const ok = await ensureGeolocationEnabled();
  if (!ok) return;
  const userPosition = geolocationRef.value?.geoLoc.getPosition();
  if (userPosition) {
    gGreenOlMap.center = userPosition;
    gGreenOlMap.geolocation = userPosition;
    nextTick(() => {
      if (gGreenOlMap.geolocation.length) {
        if (mapRef.value?.map) {
          const view = mapRef.value.map.getView();
          view.animate({
            center: gGreenOlMap.geolocation,
            zoom: 16,
            duration: 1000,
          });
        }
      }
    });
  }
}
async function ensureGeolocationEnabled() {
  if (!("permissions" in navigator) || !("geolocation" in navigator)) {
    alert("Геолокация не поддерживается вашим браузером.");
    return false;
  }
  const status = await navigator.permissions.query({ name: "geolocation" });
  if (status.state === "granted") {
    return true;
  }
  if (status.state === "prompt") {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => {
          alert("Без доступа к геолокации функционал будет ограничен.");
          resolve(false);
        },
      );
    });
  }
  if (status.state === "denied") {
    alert(
      "Не можем определить ваше местоположение.\n\n" +
        "Включите геолокацию в настройках браузера или устройства.",
    );
    return false;
  }
}
function checkFullscreenAvailability() {
  if (!document.fullscreenEnabled) {
    alert("Полноэкранный режим в вашем браузере отключён.");
  }
}
function convertZonesToFeatures(markers: Marker[]) {
  const features = markers
    .filter((marker) => marker.coordinates)
    .map((marker) => ({
      type: "Feature",
      properties: { density: marker.details?.density || "default" },
      geometry: {
        type: "Polygon",
        coordinates:
          marker.coordinates?.length === 1
            ? marker.coordinates
            : [marker.coordinates],
      },
      id: marker.id,
    }));
  const providerFeatureCollection = {
    type: "FeatureCollection",
    features,
  };
  return gGreenCluster.geoJSON.readFeatures(providerFeatureCollection);
}

function convertMarkersToDictionary(markers: Marker[]) {
  return new Map(markers.map((marker) => [marker.id as string, marker]));
}
const geoLocChange = (event: ObjectEvent) => {
  gGreenOlMap.geolocation = event.target.getPosition();
};
function getMemberStyle(clusterMember: FeatureLike) {
  const features = clusterMember.get("features");
  if (!features || !features.length) return null;
  const markerId = features[0].getId();
  const marker = gGreenCluster.markersDict.get(markerId);
  return new Style({
    geometry: clusterMember.getGeometry() as Geometry,
    image: getMarkerIconByDensity(marker?.details?.density || "default"),
  });
}

function selectMarker(event: SelectEvent) {
  const selected = event.selected[0];
  if (selected && selected.get("features")?.length === 1) {
    const markerId = selected.get("features")[0].getId();
    gGreenCluster.currentSelectedMarkerId = markerId;
    const marker = gGreenCluster.markersDict.get(markerId);
    if (marker) {
      gGreenCluster.zonesFeatures = convertZonesToFeatures(
        Array.from(gGreenCluster.markersDict.values()),
      );
      openMarkerPopup(markerId);
    }
  } else {
    gGreenCluster.currentSelectedMarkerId = "";
  }
}

function deleteMarker() {
  emit("deleteMarker", gGreenCluster.currentSelectedMarkerId);
  closeMarkerPopup(gGreenCluster.currentSelectedMarkerId);
}

function addMakrer(coordinate: Coordinate, zone?: ZoneWithDensity) {
  if (props.addMarker === "enable") {
    emit("addMarker", coordinate, zone);
  } else {
    emit("forbiddenAddMarker");
  }
}

function openMarkerPopup(markerId: string) {
  const marker = gGreenCluster.markersDict.get(markerId);
  if (marker) {
    gGreenCluster.markersPopupOpened.set(markerId, marker);
  }
}
function closeAllMarkerPopup() {
  gGreenCluster.markersPopupOpened.clear();
}
function closeMarkerPopup(markerId: string) {
  gGreenCluster.markersPopupOpened.delete(markerId);
}
function externalSelectMarker(marker: Marker) {
  emit("selectMarker", marker.id, marker);
}
function externalCancelMarkerSelection(marker: Marker) {
  emit("cancelMarkerSelection", marker.id);
}

function addZone(markerId: string) {
  gGreenOlMap.interactionType = "zone_add";
  closeMarkerPopup(markerId);
  gGreenCluster.currentSelectedMarkerId = markerId;
  const marker = gGreenCluster.markersDict.get(markerId);
  gGreenZone.density = marker?.details?.density || "default";
}

function overrideZoneStyleFunction(feature: FeatureLike, _: Style) {
  return getPolygonStyleByDensity(feature.getProperties().density);
}

function overrideMarkerStyleFunction(feature: FeatureLike, style: Style) {
  const clusteredFeatures = feature.get("features") || [feature];
  if (!clusteredFeatures) return;
  const innerFeature = clusteredFeatures[0];
  const geomType = innerFeature.getGeometry().getType();
  if (geomType !== "Point") {
    return overrideZoneStyleFunction(feature, style);
  }
  const size = clusteredFeatures.length;
  const colorFill = size >= 15 ? "#ff546b" : size > 5 ? "#ffab54" : "#8dc175";
  const colorStroke = "#1E1E1E";
  const radius = 16;
  style.getText()?.setFont("13px Montserrat");
  style.getText()?.setJustify("center");
  style.getText()?.getFill()?.setColor(colorStroke);
  if (size === 1) {
    style.getText()?.setText("");
    const styleCopyForSingleMember = style.clone();
    const newImage = getMemberStyle(feature)?.getImage();
    if (newImage) {
      styleCopyForSingleMember.setImage(newImage);
    }
    return styleCopyForSingleMember;
  }
  (style.getImage() as CircleStyle)?.getStroke()?.setColor(colorStroke);
  (style.getImage() as CircleStyle)?.getFill()?.setColor(colorFill);
  (style.getImage() as CircleStyle)?.setRadius(radius);
  style.getText()?.setText(size.toString());
  return style;
}

function getMarkerIconByDensity(
  density?: "default" | "LOW" | "MIDDLE" | "HIGH",
) {
  return new Icon({
    src: markersSrcByDensity.value[density || "default"],
  });
}
function getStatusClasses(status: string) {
  return props.dataStatusClasses[status];
}
function updateFeatures(id: string, marker: Marker) {
  gGreenCluster.zonesFeatures = convertZonesToFeatures(
    Array.from(gGreenCluster.markersDict.values()),
  );
  gGreenCluster.markerFeatures = convertMarkersToFeatures(
    Array.from(gGreenCluster.markersDict.values()),
  );
  emit("editMarker", id, marker);
}

function toggleAllZonesVisibility() {
  isAllZonesVisible.value = !isAllZonesVisible.value;
  gGreenOlMap.interactionType = "none";
  if (isAllZonesVisible.value) {
    gGreenCluster.zonesFeatures = convertZonesToFeatures(props.markers);
  } else {
    gGreenCluster.zonesFeatures = [];
  }
}

function handleCloseMarkerPopup(markerId: string) {
  closeMarkerPopup(markerId);
  deselectFeatures();
}

function handleMapPointerMove(event: MapBrowserEvent<UIEvent>) {
  const hit = event.target.hasFeatureAtPixel(event.pixel);
  event.target.getTargetElement().style.cursor = hit ? "pointer" : "";
}

function deselectFeatures() {
  featureSelectRef.value.select.getFeatures().clear();
}

function toggleMarkerAdd() {
  gGreenOlMap.interactionType =
    gGreenOlMap.interactionType !== "marker_add" ? "marker_add" : "none";
}

function toggleZoneAdd() {
  if (gGreenOlMap.interactionType !== "zone_add") {
    gGreenCluster.currentSelectedMarkerId = "";
    gGreenZone.density = "default";
    gGreenOlMap.interactionType = "zone_add";
  } else {
    gGreenOlMap.interactionType = "none";
  }
}

function suggestDeleteMarker(id = "") {
  openConfirmationDialog("удалить очаг", "Удалить");
  gGreenCluster.currentSelectedMarkerId = id;
}

function handleMapClick(event: MapBrowserEvent<UIEvent>) {
  if (gGreenOlMap.interactionType === "marker_add") {
    addMakrer(event.coordinate);
  }
}

function getPolygonStyleByDensity(density: Density) {
  let fillColor = "";
  switch (density) {
    case "LOW":
      fillColor = "rgba(177, 212, 160, 0.8)";
      break;
    case "MIDDLE":
      fillColor = "rgba(255, 198, 138, 0.8)";
      break;
    case "HIGH":
      fillColor = "rgba(255, 138, 153, 0.8)";
      break;
    default:
      fillColor = "rgba(152, 152, 152, 0.8)";
      break;
  }
  return new Style({
    stroke: new Stroke({
      color: "#1E1E1E",
      width: 1,
    }),
    fill: new Fill({
      color: fillColor,
    }),
    image: new Circle({
      radius: 6,
      fill: new Fill({
        color: fillColor,
      }),
      stroke: new Stroke({
        color: "#1E1E1E",
        width: 1,
      }),
    }),
  });
}

function configureMap() {
  const controlElement = controlBarRef.value?.control.element;
  if (!controlElement) return;
  controlElement.classList.add("g-green-control-bar");
  const burgerButton = document.createElement("button");
  burgerButton.setAttribute("type", "button");
  burgerButton.classList.add("burger-button");
  const toggleIcon = document.createElement("img");
  toggleIcon.classList.add("bar-toggle-icon");
  toggleIcon.setAttribute("src", "/icons/chevrons_left.svg");
  burgerButton.appendChild(toggleIcon);
  toggleIcon.addEventListener("click", () => {
    toggleControlBar(burgerButton);
  });
  controlElement.appendChild(burgerButton);
}

function toggleControlBar(targetButton: HTMLElement) {
  targetButton.classList.toggle("is-active");
}
function checkDetailInfo(id: string) {
  emit("checkDetailInfo", id);
}
function createZone(event: DrawEvent) {
  if (gGreenCluster.currentSelectedMarkerId && event.feature) {
    const marker = gGreenCluster.markersDict.get(
      gGreenCluster.currentSelectedMarkerId,
    );
    if (marker) {
      marker.coordinate = getCenter(event.feature.getGeometry()!.getExtent());
      marker.coordinates = event.feature.getGeometry()!.getCoordinates();
      if (marker.details) {
        marker.details.density = gGreenZone.density;
      }
      toggleZoneAdd();
      emit("editMarker", gGreenCluster.currentSelectedMarkerId, marker);
    }
    gGreenCluster.currentSelectedMarkerId = "";
  } else if (event.feature) {
    const coordinate = getCenter(event.feature.getGeometry()!.getExtent());
    const zoneCoordinates = event.feature.getGeometry()!.getCoordinates();
    addMakrer(coordinate, {
      coordinates: zoneCoordinates,
      density: gGreenZone.density,
    });
  }
  upKey.value++;
}
onMounted(() => {
  if (Array.isArray(props.markers)) {
    gGreenCluster.markersDict = convertMarkersToDictionary(props.markers);
    gGreenCluster.markerFeatures = convertMarkersToFeatures(props.markers);
    gGreenCluster.zonesFeatures = convertZonesToFeatures(
      Array.from(gGreenCluster.markersDict.values()),
    );
  }
  if (props.defaultInteractionType) {
    nextTick(() => {
      switch (props.defaultInteractionType) {
        case "marker_add":
          (
            document.querySelector(
              ".g-green-control-bar__marker button",
            ) as HTMLButtonElement
          )?.click();
          break;
      }
    });
  }
});
watch(
  () => props.selectedMarker,
  (newVal, oldVal) => {
    if (!newVal) {
      closeMarkerPopup(oldVal?.id || "");
    }
  },
);
watch(
  () => props.markers,
  (newMarkers) => {
    if (Array.isArray(newMarkers)) {
      gGreenCluster.markersDict = convertMarkersToDictionary(newMarkers);
      gGreenCluster.markerFeatures = convertMarkersToFeatures(newMarkers);
      gGreenCluster.zonesFeatures = convertZonesToFeatures(
        Array.from(gGreenCluster.markersDict.values()),
      );
      if (newMarkers.length === 0) {
        if (gGreenCluster.markersPopupOpened.size) {
          closeAllMarkerPopup();
          deselectFeatures();
        }
      }
    }
  },
  { deep: true },
);
// const onMapClick = (event: MouseEvent) => {
//   const mapElement = mapRef.value?.map?.getTargetElement();
//   if (!mapElement) return;
//   const clickedInside = (event.target as Element).closest
//     ? (event.target as Element).closest(`#${mapElement.id}`) === mapElement
//     : event.target === mapElement;

//   mapElement.classList.toggle("is-active", clickedInside);
// };
onMounted(() => {
  gGreenOlMap.url = `https://tiles.stadiamaps.com/tiles/${$q.dark.isActive ? "alidade_smooth_dark" : "osm_bright"}/{z}/{x}/{y}@2x.png`;
  if (props.markers?.length) {
    gGreenCluster.markersDict = convertMarkersToDictionary(props.markers);
    gGreenCluster.markerFeatures = convertMarkersToFeatures(props.markers);
    gGreenCluster.zonesFeatures = convertZonesToFeatures(
      Array.from(gGreenCluster.markersDict.values()),
    );
  }
  if (props.selectedMarker?.id) {
    gGreenCluster.currentSelectedMarkerId = props.selectedMarker.id;
    openMarkerPopup(props.selectedMarker.id);
    const marker = gGreenCluster.markersDict.get(props.selectedMarker.id);
    if (marker) {
      gGreenOlMap.center = marker.coordinate as Coordinate;
      gGreenOlMap.resolution = 16;
    }
  }
});
watch(
  () => $q.dark.isActive,
  () => {
    gGreenOlMap.url = `https://tiles.stadiamaps.com/tiles/${$q.dark.isActive ? "alidade_smooth_dark" : "osm_bright"}/{z}/{x}/{y}@2x.png`;
  },
);
// onBeforeUnmount(() => {
//   document.removeEventListener("click", onMapClick);
// });
</script>

<style scoped lang="scss">
.g-green-map {
  height: 100%;
  width: 100%;
  // &:not(.is-active) * {
  //   pointer-events: none;
  // }
  .popup-marker {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: var(--app-white);
    border-radius: 16px;
    border: 1px var(--app-grey-100) solid;
    padding: 32px 16px 12px 16px;
    width: 300px;
    &__divider {
      height: 1px;
      width: 80%;
      background-color: var(--app-grey-100);
      margin: 0 auto;
    }
    &__no-data {
      display: flex;
      justify-content: center;
    }
    &__user-created {
    }
    &__close-img {
      position: absolute;
      right: 12px;
      top: 12px;
      fill: var(--app-black);
      cursor: pointer;
    }
    &:has(.actions-label:empty) {
      .popup-marker__divider {
        display: none;
      }
    }
  }
  .data-list {
    margin: 0;
    display: flex;
    flex-direction: column;
    &__item {
      display: flex;
      gap: 16px;
      align-items: center;
      cursor: default;
      user-select: auto;
      .data-list__name {
        font-size: 13px;
        min-width: 120px;
        max-width: 120px;
        padding: 8px 0px;
        color: var(--app-grey-400);
        &::after {
          content: ":";
        }
      }
      .data-list__value {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 8px 0px;
        overflow-wrap: anywhere;
        .data-list__status-block {
          font-size: 13px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4px 8px;
          color: var(--app-white);
          border-radius: 12px;
          height: 24px;
        }
        &--empty {
          color: var(--app-grey-200);
        }
      }
    }
  }
  .actions-label {
    list-style: none;
    margin: 0;
    padding: 0;
    &__action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 12px 0px;
      cursor: pointer;
      &:empty {
        display: none;
      }
      .actions-label__text {
      }
      .actions-label__icon {
        width: 24px;
        height: 24px;
        filter: var(--app-filter-grey-300);
        .actions-label__icon-hint {
          font-size: 14px;
        }
      }
      .actions-label__icon--blue {
        filter: unset;
        fill: var(--app-blue-300);
      }
    }
  }
}
</style>

<style lang="scss">
.g-green-map {
  .ol-control.ol-bar.g-green-control-bar {
    display: flex;
    flex-direction: column;
    background: var(--app-white);
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 2px 1px 2px rgb(0, 0, 0, 0.2);
    width: 44px;
    height: fit-content;
    padding: 48px 0px 8px 0px;
    transition: width 0.3s ease;
    border-radius: 0px 16px 16px 0px;
    overflow: hidden;
    z-index: 1;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(233, 233, 233, 0.3);
      z-index: -1;
    }
    .ol-button.g-green-control-bar__item {
      width: 100%;
      left: 0;
      transition: opacity 0.3s ease;
      button {
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-width: max-content;
        width: inherit;
        padding: 12px 10px;
        border-radius: 0 !important;
        height: auto;
        line-height: normal;
        font-size: 14px;
        font-weight: 500;
        border-radius: 8px;
        gap: 16px;
        color: var(--app-grey-300);
        appearance: none;
        cursor: pointer;
        background-color: transparent;
        transition: background-color 0.3s ease;
        &::before {
          background-size: 24px 24px;
          display: inline-block;
          width: 24px;
          height: 24px;
          content: "";
        }
        &:hover {
          background-color: var(--app-grey-050);
        }
      }
      &.ol-active {
        button {
          background-color: var(--app-grey-050);
        }
      }
    }
    .ol-button.g-green-control-bar__marker {
      button::before {
        background-image: url("/icons/bar_marker.svg");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
        filter: var(--app-filter-red-300);
        width: 24px;
        height: 24px;
      }
    }
    .ol-button.g-green-control-bar__zone {
      button::before {
        background-image: url("/icons/bar_zone.svg");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
        filter: var(--app-filter-orange-300);
        width: 24px;
        height: 24px;
      }
    }
    .ol-button.g-green-control-bar__zones-visible {
      button::before {
        content: url("/icons/eye_off_outline.svg");
        filter: var(--app-filter-grey-300);
        width: 24px;
        height: 24px;
      }
    }
    .ol-button.g-green-control-bar__zones-visible--off {
      button::before {
        content: url("/icons/eye_outline.svg");
        filter: var(--app-filter-grey-300);
        width: 24px;
        height: 24px;
      }
    }
    &:has(.burger-button.is-active) {
      width: 195px;
      .burger-button img {
        transform: rotate(0deg);
      }
    }
    .burger-button {
      width: 100%;
      height: 48px;
      display: flex;
      gap: 4px;
      padding-left: 10px;
      justify-content: flex-start;
      align-items: center;
      margin: 0;
      cursor: default;
      position: absolute;
      top: 0;
      appearance: none;
      background: var(--app-white);
      outline: none;
      margin-bottom: 8px;
      img {
        cursor: pointer;
        transition: transform 0.3s ease;
        transform: rotate(180deg);
        width: 24px;
        height: 24px;
        filter: var(--app-filter-grey-300);
      }
    }
  }
  .g-green-marker-popup-container {
    top: -22px;
  }
  .ol-full-screen.ol-control {
    button {
      background-color: var(--app-white);
      color: var(--app-white);
      right: 1px;
      position: absolute;
      cursor: pointer;
      width: 40px;
      height: 40px;
      box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.25);
      border-radius: 4px;
      margin: 0;
      &::after {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        content: "";
        display: inline-block;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
        width: 28px;
        height: 28px;
        filter: var(--app-filter-grey-300);
      }
      &.ol-full-screen-false::after {
        background-image: url("/icons/fullscreen.svg");
      }
      &.ol-full-screen-true::after {
        background-image: url("/icons/fullscreen_exit.svg");
      }
      &:focus {
        outline: unset;
      }
      &:hover {
        outline: 1px solid var(--app-grey-400);
      }
    }
  }
  .ol-zoom.ol-control {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background-color: transparent;
    right: 7px;
    left: unset;
    top: 50%;
    transform: translateY(-50%);
    button {
      width: 40px;
      height: 40px;
      background-color: var(--app-white);
      color: var(--app-white);
      cursor: pointer;
      box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.25);
      border-radius: 4px;
      img {
        width: 28px;
        height: 28px;
        filter: var(--app-filter-grey-300);
      }
      &:focus {
        outline: unset;
      }
      &:hover {
        outline: 1px solid var(--app-grey-400);
      }
    }
  }
  .geolocation-control {
    position: absolute;
    right: 24px;
    bottom: 24px;
    z-index: 100;
    .geolocation-btn {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      background-color: var(--app-white);
      color: var(--app-white);
      cursor: pointer;
      box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.25);
      border-radius: 4px;
      background-color: var(--app-white);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &:hover {
        text-decoration: none;
        outline: 1px solid var(--app-grey-400);
      }
    }
  }
}
</style>
