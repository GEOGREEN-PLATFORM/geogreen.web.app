<template>
  <ClientOnly>
    <ol-map
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      style="height: 100%; width: 100%"
      @click="handleMapClick"
      @precompose.once="configureMap"
      class="g-green-map"
      ref="mapRef"
      :controls="[]"
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
      <ol-control-bar ref="controlBar">
      <ol-toggle-control
        html="Добавить маркер"
        className="g-green-control-bar__marker g-green-control-bar__marker--add"
        :onToggle="toggleMarkerAdd"
      />
    </ol-control-bar>
      <ol-interaction-clusterselect
        ref="featureSelect"
        :point-radius="48"
        @select="selectMarker"
      >
        <ol-style>
          <ol-style-icon :src="markerIconSrc" :scale="1" />
        </ol-style>
      </ol-interaction-clusterselect>

      <ol-animated-clusterlayer :animation-duration="500" :distance="40">
        <ol-source-vector
          :features="markerFeatures"
          :format="geoJson"
        />

        <ol-style :override-style-function="overrideStyleFunction">
          <ol-style-icon :src="markerIconSrc" :scale="1" />
          <ol-style-circle :radius="48">
            <ol-style-stroke color="black" :width="1" line-cap="round"/>
            <ol-style-fill color="black"/>
          </ol-style-circle>
          <ol-style-text>
            <ol-style-fill color="white" />
          </ol-style-text>
        </ol-style>
      </ol-animated-clusterlayer>
      <ol-overlay
      :position="marker.coordinates"
      v-for="[id, marker] in markersPopupOpened"
      :key="id"
      :autoPan="true"
      className="g-green-marker-popup-container"
      positioning="bottom-center"
    >
      <div class="popup-marker">
        <q-icon class="popup-marker__close-img" :name="mdiClose" size="24px" @click="closeMarkerPopup(id)"></q-icon>
        <ul v-if="marker.details" class="data-list">
          <li v-for="[name, value] in marker.details">
            <div class="data-list__name">{{ name }}</div>
            <div class="data-list__value">{{ value }}</div>
          </li>
        </ul>
        <div v-else class="popup-marker__no-data">
          Данные не найдены
        </div>
        <div class="popup-marker__divider"></div>
        <ul class="actions-label">
          <li @click="suggestDeleteMarker(id)" class="actions-label__action">
            <span class="actions-label__text">Удалить метку</span>
            <img class="actions-label__icon" src="/icons/delete_outline.svg">
          </li>
          <li class="actions-label__action">
            <span class="actions-label__text">Добавить зону</span>
            <img class="actions-label__icon" src="/icons/plus.svg">
          </li>
          <li class="actions-label__action">
            <span class="actions-label__text">Подробнее</span>
            <img class="actions-label__icon" src="/icons/arrow_link_outline.svg">
          </li>
        </ul>
      </div>
    </ol-overlay>
    </ol-map>
    <GGDialogConfirm @confirm="deleteMarker" v-model="confirmationDialog.isOpened" :action-main-text="confirmationDialog.mainText" :action-button-confirm-text="confirmationDialog.buttonText"></GGDialogConfirm>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { FeatureLike } from "ol/Feature";
import type { SelectEvent } from "ol/interaction/Select";
import { GeoJSON } from "ol/format";
import { Icon, Style } from "ol/style.js";
import { computed, ref } from "vue";
import markerIconSrc from "/icons/hogweed_icon.png";
import type { Geometry } from "ol/geom";
import CircleStyle from "ol/style/Circle";
import type { MapBrowserEvent } from "ol";
import type { Coordinate } from "ol/coordinate";
import { mdiClose} from "@quasar/extras/mdi-v6";
interface Marker {
  id: string;
  coordinates: Coordinate,
  details?: {
    square: number;
    owner?: string;
    landType?: string;
    contractingOrganization?: string;
    workStatus?: string;
    eliminationMethod?: string;
    photos?: string[];
  } | null
  relatedTaskId?: string | null;
  relatedZone?: Coordinate[] | null,
}
interface Props {
  markers: Marker[],
}

const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
})
const emit = defineEmits<{
  'addMarker': [coordinate: Coordinate],
  'deleteMarker': [id: string]
}>()

const mapRef = ref();
const controlBar = ref();
const featureSelect = ref();
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
const confirmationDialog = ref(new ConfirmationDialog());
class GGreenOlMap {
  public resolution: number;
  public rotation: number;
  public center: Coordinate;
  public readonly projection = "EPSG:3857";
  public readonly url =
    "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png";
  public interactionType: string;

  constructor() {
    this.center = [4890670.38077, 7615726.876165];
    this.resolution = 36;
    this.rotation = 0;
    this.interactionType = 'none'
  }

}
const gGreenOlMap = ref(new GGreenOlMap());
const markersPopupOpened = ref<Map<string, Marker>>(new Map());
const geoJson = new GeoJSON();
const markerIconElement = new Icon({
  src: markerIconSrc,
});
const markerFeatures = computed(() => {
  const features = props.markers.map(({id, coordinates}) => ({
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates,
    },
    id: id,
  }));
  const providerFeatureCollection = {
    type: "FeatureCollection",
    features,
  };
  return geoJson.readFeatures(providerFeatureCollection);
});

function clusterMemberStyle(clusterMember: FeatureLike) {
  return new Style({
    geometry: clusterMember.getGeometry() as Geometry,
    image: markerIconElement,
  });
}

const markersDict = computed(() => 
  new Map(props.markers.map(marker => [marker.id, marker]))
)
function closeMarkerPopup(id: string) {
  markersPopupOpened.value.delete(id);
  console.log(featureSelect.value)
  featureSelect.value.select.getFeatures().clear();
}
function toggleMarkerAdd() {
  gGreenOlMap.value.interactionType !== 'marker_add' ? gGreenOlMap.value.interactionType = 'marker_add' : gGreenOlMap.value.interactionType = 'none';
}
const markerToDelete = ref("");
function suggestDeleteMarker(id: string) {
  confirmationDialog.value.open('удалить метку', 'Удалить');
  markerToDelete.value = id;
}
function deleteMarker() {
  emit('deleteMarker', markerToDelete.value);
  closeMarkerPopup(markerToDelete.value);
}
function overrideStyleFunction(feature: FeatureLike, style: Style) {
  const clusteredFeatures = feature.get("features");
  const size = clusteredFeatures.length;
  const colorFill = size >= 15 ? "#FF0022" : size > 5 ? "#FF8200" : "#55A231";
  const colorStroke = size >= 15 ? "#55A231" : "#FF0022";
  const radius = 16;
  if (size === 1) {
    style.getText()?.setText("");
    const styleCopyForSingleMember = style.clone();
    const newImage = clusterMemberStyle(feature).getImage()
    if (newImage) {
      styleCopyForSingleMember.setImage(newImage);
    }
    return styleCopyForSingleMember;
  }
  else {
    (style.getImage() as CircleStyle)?.getStroke()?.setColor(colorStroke);
    (style.getImage() as CircleStyle)?.getFill()?.setColor(colorFill);
    (style.getImage() as CircleStyle)?.setRadius(radius);
    style.getText()?.setText(size.toString());
    return style;
  }
}

function handleMapClick(event: MapBrowserEvent<UIEvent>) {
  if (gGreenOlMap.value.interactionType === "marker_add") {
    emit('addMarker', event.coordinate)
  }
}

function configureMap() {
  const controlElement = controlBar.value.control.element;
  controlElement.classList.add('g-green-control-bar');
  const burgerButton = document.createElement('button');
  burgerButton.classList.add('burger-button');
  for (let i = 0; i < 3; i++) {
    const line = document.createElement('div');
    burgerButton.appendChild(line);
  }
  burgerButton.addEventListener('click', () => {
    toggleControlBar(burgerButton)
  });
  controlElement.appendChild(burgerButton);
}

function toggleControlBar(targetButton: HTMLElement) {
  targetButton.classList.toggle('is-active');
}

function selectMarker(event: SelectEvent) {
  if (event.selected[0]) {
    const markerId = event.selected[0].get('features')[0].getId();
  if (markerId && markersDict.value.get(markerId)) {
    markersPopupOpened.value.set(markerId, markersDict.value.get(markerId)!)
  }
  }
}
</script>

<style scoped lang="scss">
.g-green-map {
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
          background-image: url('/icons/hogweed_icon.png');
          background-size: 24px 24px;
          display: inline-block;
          width: 24px; 
          height: 24px;
          content:"";
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
            background-image: url('/icons/delete_outline.svg');
            filter: var(--app-filter-red-500);
          }
        }
      }
    }
    &:has( .burger-button.is-active) {
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
        transition: transform 0.3s ease, opacity 0.3s ease;
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
