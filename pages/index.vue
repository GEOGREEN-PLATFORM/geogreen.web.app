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
import { useMainStore } from "~/store/main";
const store = useMainStore();
const markers = ref<Marker[]>([]);
async function getMarkers() {
  const data = await $fetch<Marker[]>(`${store.api}/geo/info/getAll`);
  console.log(data);
  if (data) {
    markers.value = data;
    console.log(markers.value);
  } else {
    markers.value = [];
  }
}
async function addMarker(coordinate: Coordinate, relatedZone?: Zone) {
  const data = await $fetch(`${store.api}/geo/info`, {
    method: "POST",
    body: {
      coordinate: coordinate,
      details: {
        square: 0,
        owner: "",
        landType: "Сельскохозяйственный",
        contractingOrganization: "",
        workStage: "Создано",
        eliminationMethod: "Механический",
        images: [],
        problemAreaType: "Борщевик",
        comment: "",
        density: relatedZone?.density,
      },
      relatedTaskId: null,
      coordinates: relatedZone?.coordinates[0] || [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    },
  });
  getMarkers();
}
async function deleteMarker(id: string) {
  const data = await $fetch(`${store.api}/geo/info/${id}`, {
    method: "DELETE",
  });
  getMarkers();
}
async function editMarker(id: string, marker: Marker) {
  marker.id = undefined;
  marker.relatedTaskId = undefined;
  marker.coordinates = marker.coordinates[0];
  const data = await $fetch(`${store.api}/geo/info/${id}`, {
    method: "PATCH",
    body: marker,
  });
  getMarkers();
}
onMounted(() => {
  getMarkers();
});
</script>

<style scoped lang="scss"></style>
