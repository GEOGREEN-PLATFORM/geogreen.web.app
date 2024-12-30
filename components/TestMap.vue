<template>
  <ClientOnly>
    <label for="count">Marker:</label>
    <input id="count" v-model.number="count" type="number" max="50000" />
    <ol-map
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      style="height: 100%; width: 100%"
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

      <ol-interaction-clusterselect
        :point-radius="20"
        @select="featureSelected"
      >
        <ol-style>
          <ol-style-stroke color="green" :width="5" />
          <ol-style-fill color="rgba(255,255,255,0.5)" />
          <ol-style-icon :src="markerIcon" :scale="1" />
        </ol-style>
      </ol-interaction-clusterselect>

      <ol-animated-clusterlayer :animation-duration="500" :distance="40">
        <ol-source-vector
          :features="geoJsonFeatures"
          :format="geoJson"
          @featuresloadstart="featuresloadstart"
          @featuresloadend="featuresloadend"
          @featuresloaderror="featuresloaderror"
        />

        <ol-style :override-style-function="overrideStyleFunction">
          <ol-style-stroke color="red" :width="1" />
          <ol-style-fill color="rgba(255,255,255,0.1)" />
          <ol-style-icon :src="markerIcon" :scale="1" />
          <ol-style-circle :radius="20">
            <ol-style-stroke color="black" :width="1" line-cap="round" />
            <ol-style-fill color="black" />
          </ol-style-circle>

          <ol-style-text>
            <ol-style-fill color="white" />
          </ol-style-text>
        </ol-style>
      </ol-animated-clusterlayer>
    </ol-map>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { FeatureLike } from "ol/Feature";
import type { SelectEvent } from "ol/interaction/Select";
import { GeoJSON } from "ol/format";
import { Icon, Style } from "ol/style.js";
import { computed, ref } from "vue";
import markerIcon from "/icons/hogweed_icon.png";

const count = ref(16);
const icon = new Icon({
  src: markerIcon,
});
class GGreenOlMap {
  public resolution: number;
  public rotation: number;
  public center: [number, number];
  public readonly projection = "EPSG:3857";
  public readonly url =
    "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png";

  constructor() {
    this.center = [4890670.38077, 7615726.876165];
    this.resolution = 36;
    this.rotation = 0;
  }
}
const gGreenOlMap = ref(new GGreenOlMap());
const arrayWith500Points = [
  [4894670.38077, 7614726.876165],
  [4895670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
  [4890670.38077, 7615726.876165],
];
const geoJson = new GeoJSON();

const geoJsonFeatures = computed(() => {
  const features = Array.from({ length: count.value }, (_, i) => {
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: arrayWith500Points[i],
      },
    };
  });

  const providerFeatureCollection = {
    type: "FeatureCollection",
    features,
  };

  return geoJson.readFeatures(providerFeatureCollection);
});
function clusterMemberStyle(clusterMember) {
  return new Style({
    geometry: clusterMember.getGeometry(),
    image: icon,
  });
}
function overrideStyleFunction(feature: FeatureLike, style) {
  const clusteredFeatures = feature.get("features");
  const size = clusteredFeatures.length;
  const colorFill = size > 20 ? "#24590B" : size > 8 ? "#58943D" : "#CAE2BF";
  const colorStroke = "#FF0022";
  const radius = 16;
  if (size === 1) {
    style.getText().setText("");
    const styleCopy = style.clone();
    styleCopy.setImage(clusterMemberStyle(feature).getImage());
    console.log(styleCopy);
    return styleCopy;
  }
  style.getImage().getStroke().setColor(colorStroke);
  style.getImage().getFill().setColor(colorFill);
  style.getImage().setRadius(radius);
  style.getText().setText(size.toString());

  return style;
}

function featureSelected(event: SelectEvent) {
  console.log(event);
}
function featuresloadstart() {
  console.log("features load start");
}
function featuresloaderror() {
  console.log("features load error");
}
function featuresloadend() {
  console.log("features load end");
}
</script>

<style scoped>
input {
  margin: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  border: 1px solid black;
  width: 100px;
}
</style>
