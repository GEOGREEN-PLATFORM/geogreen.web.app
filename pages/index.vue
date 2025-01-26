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
        @edit-marker="editMarker"
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

const markers = ref<Marker[]>([]);
function getMarkers() {
  markers.value = [
    {
      id: "gfaefasfefdsf23424",
      coordinates: [4890670.38077, 7615726.876165 + 5000],
      details: null,
      relatedTaskId: null,
      relatedZone: {
        coordinates: [
          [
            [4885375.1307334015, 7618459.590018971],
            [4883818.244237658, 7615742.875328411],
            [4887245.484308826, 7615492.101664667],
            [4885375.1307334015, 7618459.590018971],
          ],
        ],
        density: "high",
      },
    },
  ];
}
function addMarker(coordinate: Coordinate, relatedZone?: Zone) {
  // mock api req
  markers.value.push({
    id: Math.random().toString(),
    coordinates: coordinate,
    details: null,
    relatedTaskId: null,
    relatedZone: relatedZone || null,
  });
}
function deleteMarker(id: string) {
  markers.value = markers.value.filter((marker) => marker.id !== id);
}
function editMarker(id: string, marker: Marker) {
  markers.value[markers.value.findIndex((marker) => marker.id === id)] = marker;
}
onMounted(() => {
  getMarkers();
});
</script>

<style scoped lang="scss"></style>
