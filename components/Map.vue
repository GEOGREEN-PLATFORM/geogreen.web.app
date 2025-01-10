<template>
  <ClientOnly>
    <ol-map
      ref="gGMap"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      class="g-green-map"
      :controls="[]"
      @click="handleMapClick"
      @precompose.once="configureMap"
      @pointermove="handleMapPointerMove"
    >
      <ol-view
        :center="gGreenOlMap.center"
        :rotation="gGreenOlMap.rotation.value"
        :resolution="gGreenOlMap.resolution.value"
        :projection="gGreenOlMap.projection"
      />
      <ol-tile-layer>
        <ol-source-xyz :url="gGreenOlMap.url" />
      </ol-tile-layer>
      <ol-control-bar ref="controlBar">
        <ol-toggle-control
          html="Добавить маркер"
          class-name="g-green-control-bar__marker g-green-control-bar__marker--add"
          :on-toggle="toggleMarkerAdd"
        />
      </ol-control-bar>
      <ol-interaction-clusterselect
        ref="featureSelect"
        :point-radius="64"
        @select="
          (event: SelectEvent) => {
            console.log('wtf');
            gGreenCluster.selectMarker.call(gGreenCluster, event);
          }
        "
      >
        <ol-style>
          <ol-style-icon :src="markerIconSrc" :scale="1" />
        </ol-style>
      </ol-interaction-clusterselect>

      <ol-animated-clusterlayer :animation-duration="500" :distance="40">
        <ol-source-vector
          :features="gGreenCluster.markerFeatures.value"
          :format="gGreenCluster.geoJSON"
        />

        <ol-style
          :override-style-function="gGreenCluster.overrideStyleFunction"
        >
          <ol-style-icon :src="markerIconSrc" :scale="1" />
          <ol-style-circle :radius="48">
            <ol-style-stroke color="black" :width="1" line-cap="round" />
            <ol-style-fill color="black" />
          </ol-style-circle>
          <ol-style-text>
            <ol-style-fill color="white" />
          </ol-style-text>
        </ol-style>
      </ol-animated-clusterlayer>
      <ol-overlay
        v-for="[id, marker] in gGreenCluster.markersPopupOpened.value"
        :key="id"
        :position="marker.coordinates"
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
          <ul v-if="marker.details" class="data-list">
            <li v-for="[name, value] in marker.details" :key="name">
              <div class="data-list__name">{{ name }}</div>
              <div class="data-list__value">{{ value }}</div>
            </li>
          </ul>
          <div v-else class="popup-marker__no-data">Данные не найдены</div>
          <div class="popup-marker__divider" />
          <ul class="actions-label">
            <li class="actions-label__action" @click="suggestDeleteMarker(id)">
              <span class="actions-label__text">Удалить метку</span>
              <img
                class="actions-label__icon"
                src="/icons/delete_outline.svg"
              />
            </li>
            <li class="actions-label__action">
              <span class="actions-label__text">Добавить зону</span>
              <img class="actions-label__icon" src="/icons/plus.svg" />
            </li>
            <li class="actions-label__action">
              <span class="actions-label__text">Подробнее</span>
              <img
                class="actions-label__icon"
                src="/icons/arrow_link_outline.svg"
              />
            </li>
          </ul>
        </div>
      </ol-overlay>
    </ol-map>
    <GGDialogConfirm
      v-model="confirmationDialog.isOpened"
      :action-main-text="confirmationDialog.mainText"
      :action-button-confirm-text="confirmationDialog.buttonText"
      @confirm="gGreenCluster.deleteMarker.call(gGreenCluster)"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Feature, MapBrowserEvent } from "ol";
import type { Coordinate } from "ol/coordinate";
import type { FeatureLike } from "ol/Feature";
import type { Geometry } from "ol/geom";
import type { SelectEvent } from "ol/interaction/Select";
import type CircleStyle from "ol/style/Circle";
import { mdiClose } from "@quasar/extras/mdi-v6";
import { GeoJSON } from "ol/format";
import { Icon, Style } from "ol/style.js";
import { type Reactive, type ShallowRef } from "vue";
import markerIconSrc from "/icons/hogweed_icon.png";

interface Props {
  markers: Marker[];
}

interface Marker {
  id: string;
  coordinates: Coordinate;
  details?: {
    square: number;
    owner?: string;
    landType?: string;
    contractingOrganization?: string;
    workStatus?: string;
    eliminationMethod?: string;
    photos?: string[];
  } | null;
  relatedTaskId?: string | null;
  relatedZone?: Coordinate[] | null;
}

const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
});
const emit = defineEmits<{
  addMarker: [coordinate: Coordinate];
  deleteMarker: [id: string];
}>();

const mapRef = useTemplateRef("gGMap");
const controlBarRef = useTemplateRef("controlBar");
const featureSelectRef = useTemplateRef("featureSelect");

class ConfirmationDialog {
  public mainText?: string;
  public buttonText?: string;
  public isOpened: boolean;

  constructor() {
    this.isOpened = false;
  }

  open(mainText: string, buttonText: string) {
    this.mainText = mainText;
    this.buttonText = buttonText;
    this.isOpened = true;
  }
}
const confirmationDialog = shallowRef(new ConfirmationDialog());

class GGreenOlMap {
  public resolution: ShallowRef<number>;
  public rotation: ShallowRef<number>;
  public center: Coordinate;
  public interactionType: ShallowRef<string>;
  public readonly projection = "EPSG:3857";
  public readonly url =
    "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png";

  constructor() {
    this.center = reactive([4890670.38077, 7615726.876165]);
    this.resolution = shallowRef(36);
    this.rotation =  shallowRef(0);
    this.interactionType = shallowRef("none");
  }
}
const gGreenOlMap = shallowRef(new GGreenOlMap());

class GGreenCluster {
  public readonly markerIcon: Icon;
  public markersPopupOpened: Ref<Map<string, Marker>>;
  public markerFeatures: Ref<Feature<Geometry>[]>;
  public markersDict: Map<string, Marker>;
  public geoJSON = new GeoJSON();
  public markerIdToDelete: ShallowRef<string>;

  constructor(markerIconSrc: string, markers: Marker[]) {
    this.markersPopupOpened = ref(new Map());
    this.markerIcon = new Icon({
      src: markerIconSrc,
    });
    this.markerIdToDelete = shallowRef("");
    this.markersDict = this.convertMarkersToDictionary(markers);
    this.markerFeatures = ref(this.convertMarkersToFeatures(markers)) as Ref<Feature<Geometry>[]>;
  }

  convertMarkersToFeatures(markers: Marker[]) {
    const features = markers.map(({ id, coordinates }) => ({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates,
      },
      id,
    }));
    const providerFeatureCollection = {
      type: "FeatureCollection",
      features,
    };
    return this.geoJSON.readFeatures(providerFeatureCollection);
  }

  convertMarkersToDictionary(markers: Marker[]) {
    return new Map(markers.map((marker) => [marker.id, marker]));
  }

  getMemberStyle(clusterMember: FeatureLike) {
    return new Style({
      geometry: clusterMember.getGeometry() as Geometry,
      image: this.markerIcon,
    });
  }

  selectMarker(event: SelectEvent) {
    console.log(event);
    if (event.selected[0] && event.selected[0].get("features").length === 1) {
      const markerId = event.selected[0].get("features")[0].getId();
      if (markerId && this.markersDict.get(markerId)) {
        this.openMarkerPopup(markerId);
      }
    }
  }

  deleteMarker() {
    emit("deleteMarker", this.markerIdToDelete.value);
    this.closeMarkerPopup(this.markerIdToDelete.value);
  }

  addMakrer(coordinate: Coordinate) {
    emit("addMarker", coordinate);
  }

  openMarkerPopup(markerId: string) {
    this.markersPopupOpened.value.set(markerId, this.markersDict.get(markerId)!);
  }

  closeMarkerPopup(markerId: string) {
   this.markersPopupOpened.value.delete(markerId);
  }

  overrideStyleFunction(feature: FeatureLike, style: Style) {
    const clusteredFeatures = feature.get("features");
    const size = clusteredFeatures.length;
    const colorFill = size >= 15 ? "#FF0022" : size > 5 ? "#FF8200" : "#55A231";
    const colorStroke = size >= 15 ? "#55A231" : "#FF0022";
    const radius = 16;
    if (size === 1) {
      style.getText()?.setText("");
      const styleCopyForSingleMember = style.clone();
      const newImage = gGreenCluster.value.getMemberStyle(feature).getImage();
      if (newImage) {
        styleCopyForSingleMember.setImage(newImage);
      }
      return styleCopyForSingleMember;
    } else {
      (style.getImage() as CircleStyle)?.getStroke()?.setColor(colorStroke);
      (style.getImage() as CircleStyle)?.getFill()?.setColor(colorFill);
      (style.getImage() as CircleStyle)?.setRadius(radius);
      style.getText()?.setText(size.toString());
      return style;
    }
  }
}
const gGreenCluster = shallowRef(new GGreenCluster(markerIconSrc, props.markers));

function handleCloseMarkerPopup(markerId: string) {
  gGreenCluster.value.closeMarkerPopup(markerId);
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
  if (gGreenOlMap.value.interactionType.value !== "marker_add") {
    gGreenOlMap.value.interactionType.value = "marker_add";
  } else {
    gGreenOlMap.value.interactionType.value = "none";
  }
}

function suggestDeleteMarker(id: string) {
  confirmationDialog.value.open("удалить метку", "Удалить");
  gGreenCluster.value.markerIdToDelete.value = id;
}

function handleMapClick(event: MapBrowserEvent<UIEvent>) {
  if (gGreenOlMap.value.interactionType.value === "marker_add") {
    gGreenCluster.value.addMakrer(event.coordinate);
  }
}

function configureMap() {
  const controlElement = controlBarRef.value.control.element;
  controlElement.classList.add("g-green-control-bar");
  const burgerButton = document.createElement("button");
  burgerButton.classList.add("burger-button");
  for (let i = 0; i < 3; i++) {
    const line = document.createElement("div");
    burgerButton.appendChild(line);
  }
  burgerButton.addEventListener("click", () => {
    toggleControlBar(burgerButton);
  });
  controlElement.appendChild(burgerButton);
}

function toggleControlBar(targetButton: HTMLElement) {
  targetButton.classList.toggle("is-active");
}

watch(
  () => props.markers,
  (newMarkers) => {
    gGreenCluster.value.markerFeatures.value =
      gGreenCluster.value.convertMarkersToFeatures(newMarkers);
    gGreenCluster.value.markersDict =
      gGreenCluster.value.convertMarkersToDictionary(newMarkers);
  },
  {
    deep: true,
  },
);
</script>

<style scoped lang="scss">
.g-green-map {
  height: 100%;
  width: 100%;
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
    &__close-img {
      position: absolute;
      right: 12px;
      top: 12px;
      fill: var(--app-black);
      cursor: pointer;
    }
  }
  .data-list {
    margin: 0;
    &__name {
      width: 80px;
      padding: 12px 0px;
      float: left;
      clear: both;
      &::after {
        content: ":";
      }
    }
    &__value {
      margin: 0 0 0 80px;
      padding: 12px 0px;
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
      gap: 4px;
      margin: 12px 0px;
      cursor: pointer;
      .actions-label__text {
      }
      .actions-label__icon {
        width: 24px;
        height: 24px;
        filter: var(--app-filter-grey-300);
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
    gap: 16px;
    position: absolute;
    left: -180px;
    top: calc(50% - 250px / 2);
    width: 220px;
    height: 250px;
    transform: none;
    padding: 48px 16px;
    transition: transform 0.3s ease;
    border-radius: 0px 4px 4px 0px;
    .ol-button.g-green-control-bar__marker {
      width: 100%;
      left: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: inherit;
        padding: 4px 8px;
        height: auto;
        line-height: normal;
        font-size: 14px;
        font-weight: 500;
        border-radius: 8px;
        font-family: Montserrat;
        color: var(--app-black);
        appearance: none;
        cursor: pointer;
        background-color: var(--app-green-050);
        transition: background-color 0.2s ease;
        &::after {
          background-image: url("/icons/hogweed_icon.png");
          background-size: 24px 24px;
          display: inline-block;
          width: 24px;
          height: 24px;
          content: "";
        }
        &:hover {
          background-color: var(--app-green-100);
        }
      }
      &.ol-active {
        button {
          color: var(--app-black);
          background-color: var(--app-green-500);
        }
      }
      &--delete {
        button {
          &::after {
            background-image: url("/icons/delete_outline.svg");
            filter: var(--app-filter-red-500);
          }
        }
      }
    }
    &:has(.burger-button.is-active) {
      transform: translateX(180px);
      .g-green-control-bar__marker {
        opacity: 1;
      }
    }
    .burger-button {
      width: 24px;
      height: 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      position: absolute;
      right: 8px;
      top: 8px;
      appearance: none;
      background: transparent;
      outline: none;
      div {
        width: 24px;
        height: 2px;
        background-color: var(--app-white);
        transition:
          transform 0.3s ease,
          opacity 0.3s ease;
      }
      &.is-active {
        div:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        div:nth-child(2) {
          opacity: 0;
        }
        div:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }
      }
    }
  }
  .g-green-marker-popup-container {
    top: -22px;
  }
}
</style>
