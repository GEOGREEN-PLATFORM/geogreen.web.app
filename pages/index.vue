<template>
  <div
    style="
      height: 100vh;
      width: 100vw;
      display: flex;
      justify-content: center;
      align-items: center;
    "
  >
    <div style="width: 100vw; height: 100vh">
      <Map
        :markers="markers"
        @add-marker="addMarker"
        @delete-marker="deleteMarker"
      />
      <div class="text-center" @click="navigateTo('/auth/register')">
        В регистрацию
      </div>
      ТЕСТИРОВАНИЕ ACTIONS
      <!-- <GGDialogConfirm v-model="showConfirm"></GGDialogConfirm> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Coordinate } from "ol/coordinate";

const markers = ref<Marker[]>([
  {
    id: "gfaefasfefdsf23424",
    coordinates: [4890670.38077, 7615726.876165 + 5000],
    details: null,
    relatedTaskId: null,
    relatedZone: null,
  },
]);
function addMarker(coordinate: Coordinate) {
  // mock api req
  markers.value.push({
    id: Math.random().toString(),
    coordinates: coordinate,
    details: null,
    relatedTaskId: null,
    relatedZone: null,
  });
}
function deleteMarker(id: string) {
  markers.value = markers.value.filter((marker) => marker.id !== id);
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
</script>

<style scoped lang="scss"></style>
