<template>
  <ClientOnly>
    <ol-map
      class="ol-map-container"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
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
    </ol-map>
  </ClientOnly>
</template>

<script setup lang="ts">
import type BaseEvent from "ol/events/Event";
import type { MapObjectEventTypes } from "ol/Map";
import type { ObjectEvent } from "ol/Object";
import { ref, shallowRef } from "vue";
class GGreenOlMap {
  public resolution: number;
  public rotation: number;
  public center: [number, number];
  public readonly projection = "EPSG:3857";
  public readonly url = "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png";

  constructor() {
    this.center = [4890670.380770, 7615726.876165];
    this.resolution = 36;
    this.rotation = 0;
  }
}
const gGreenOlMap = ref(new GGreenOlMap());
</script>

<style scoped lang="scss">
@import "vue3-openlayers/dist/vue3-openlayers.css";
.ol-map-container {
  width: 100%;
  height: 100%;
}
</style>
