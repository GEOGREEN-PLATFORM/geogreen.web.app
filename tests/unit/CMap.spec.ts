import MapComponent from "@/components/CMap.vue";
import { type VueWrapper, mount } from "@vue/test-utils";
import { Quasar } from "quasar";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Helper to create a fake OL feature
function createFakeFeature(id: string, hasGeometry = true) {
  return {
    get: (prop: string) =>
      prop === "features"
        ? [
            {
              getId: () => id,
              getGeometry: () => ({
                getExtent: () => [0, 0, 10, 10],
                getType: () => "Point",
                getCoordinates: () => [1, 2],
              }),
            },
          ]
        : undefined,
    getId: () => id,
    getGeometry: () => ({
      getExtent: () => [0, 0, 10, 10],
      getType: () => (hasGeometry ? "Point" : null),
      getCoordinates: () => [3, 4],
    }),
  } as any;
}

describe("MapComponent.vue", () => {
  let wrapper: VueWrapper<any>;

  const stubs = {
    ClientOnly: { template: "<div><slot/></div>" },
    "ol-map": { template: '<div id="gg-map"><slot/></div>' },
    "ol-view": true,
    "ol-tile-layer": true,
    "ol-source-xyz": true,
    "ol-control-bar": true,
    "ol-toggle-control": true,
    "ol-interaction-clusterselect": true,
    "ol-style": true,
    "ol-style-icon": true,
    "ol-style-circle": true,
    "ol-style-stroke": true,
    "ol-style-fill": true,
    "ol-style-text": true,
    "ol-vector-layer": true,
    "ol-source-vector": true,
    "ol-interaction-draw": true,
    "ol-animated-clusterlayer": true,
    "ol-geolocation": true,
    "ol-overlay": true,
    "ol-fullscreen-control": true,
    "ol-zoom-control": true,
    "q-icon": true,
    CDialogConfirm: true,
    CLoader: true,
    CButton: true,
    COptions: true,
    CHint: true,
  };

  beforeEach(() => {
    wrapper = mount(MapComponent, {
      props: {
        markers: [],
        shortInfoKeys: { status: { name: "Status", type: "status" } },
        dataStatusClasses: { ok: "ok-class" },
      },
      global: {
        stubs,

        plugins: [Quasar],
        mocks: {
          $q: {
            dark: {
              isActive: false,
            },
          },
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders core container and map element", () => {
    expect(wrapper.find(".map-container").exists()).toBe(true);
    expect(wrapper.find("#gg-map").exists()).toBe(true);
  });
  it("applies non-interactive class based on dataLoading prop", async () => {
    await wrapper.setProps({ dataLoading: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#gg-map").classes()).toContain("non-interactive");

    await wrapper.setProps({ dataLoading: false });
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#gg-map").classes()).not.toContain("non-interactive");
  });

  it("toggleMarkerAdd toggles interactionType", () => {
    expect(wrapper.vm.gGreenOlMap.interactionType).toBe("none");
    wrapper.vm.toggleMarkerAdd();
    expect(wrapper.vm.gGreenOlMap.interactionType).toBe("marker_add");
    wrapper.vm.toggleMarkerAdd();
    expect(wrapper.vm.gGreenOlMap.interactionType).toBe("none");
  });

  it("toggleZoneAdd toggles zone_add interaction and resets clusterId", () => {
    wrapper.vm.gGreenCluster.currentSelectedMarkerId = "123";
    wrapper.vm.toggleZoneAdd();
    expect(wrapper.vm.gGreenOlMap.interactionType).toBe("zone_add");
    expect(wrapper.vm.gGreenCluster.currentSelectedMarkerId).toBe("");
    wrapper.vm.toggleZoneAdd();
    expect(wrapper.vm.gGreenOlMap.interactionType).toBe("none");
  });

  it("toggleAllZonesVisibility shows and hides zonesFeatures", async () => {
    await wrapper.setProps({
      markers: [{ id: "a", coordinate: [1, 1], coordinates: [[1, 1]] }],
    });
    await wrapper.vm.$nextTick();

    wrapper.vm.toggleAllZonesVisibility();
    expect(wrapper.vm.isAllZonesVisible).toBe(true);
    expect(wrapper.vm.gGreenCluster.zonesFeatures.length).toBeGreaterThan(0);

    wrapper.vm.toggleAllZonesVisibility();
    expect(wrapper.vm.isAllZonesVisible).toBe(false);
    expect(wrapper.vm.gGreenCluster.zonesFeatures).toEqual([]);
  });

  it("emits addMarker when clicking map in marker_add mode", () => {
    wrapper.vm.toggleMarkerAdd();
    wrapper.vm.handleMapClick({ coordinate: [5, 6] });
    expect(wrapper.emitted("addMarker")).toHaveLength(1);
    expect(wrapper.emitted("addMarker")![0]).toEqual([[5, 6], undefined]);
  });

  it("handleMapClick does not emit when not in marker_add", () => {
    // Directly call the handler instead of emitting on the stub
    wrapper.vm.handleMapClick({ coordinate: [7, 8] });
    expect(wrapper.emitted("addMarker")).toBeUndefined();
  });

  it("openConfirmationDialog and deleteMarker flow", async () => {
    // open dialog
    wrapper.vm.openConfirmationDialog("text", "btn");
    expect(wrapper.vm.confirmationDialog.isOpened).toBe(true);
    expect(wrapper.vm.confirmationDialog.mainText).toBe("text");
    // set selectedMarkerId and call delete
    wrapper.vm.gGreenCluster.currentSelectedMarkerId = "m1";
    wrapper.vm.deleteMarker();
    expect(wrapper.emitted("deleteMarker")![0]).toEqual(["m1"]);
    expect(wrapper.vm.confirmationDialog.isOpened).toBe(false);
    expect(wrapper.vm.confirmationDialog.state).toBe("success");
  });

  it("createZone emits editMarker for existing marker and addMarker for new", () => {
    // подготовка
    wrapper.vm.gGreenCluster.markersDict.set("m2", {
      id: "m2",
      details: { density: "LOW" },
      coordinate: [1, 2],
      coordinates: [[1, 2]],
    });
    wrapper.vm.gGreenCluster.currentSelectedMarkerId = "m2";

    const fakeEvent = {
      feature: {
        getGeometry: () => ({
          getExtent: () => [0, 0, 2, 2],
          getCoordinates: () => [[1, 1]],
        }),
      },
    };

    // существующий маркер
    wrapper.vm.createZone(fakeEvent);
    // The second argument of the first call to 'editMarker' should have id 'm2'
    const editMarkerArgs = wrapper.emitted("editMarker")![0];
    expect((editMarkerArgs as any)[1].id).toBe("m2");

    // новый маркер
    wrapper.vm.gGreenCluster.currentSelectedMarkerId = "";
    wrapper.vm.createZone(fakeEvent);
    expect(wrapper.emitted("addMarker")).toBeDefined();
  });

  it("selectMarker sets currentSelectedMarkerId and opens popup", () => {
    wrapper.vm.gGreenCluster.markersDict.set("f1", {
      id: "f1",
      details: { density: "default" },
    });

    const fake = {
      selected: [createFakeFeature("f1")],
      get: (key: string) =>
        key === "features" ? [{ getId: () => "f1" }] : undefined,
    };

    wrapper.vm.selectMarker(fake as any);

    expect(wrapper.vm.gGreenCluster.currentSelectedMarkerId).toBe("f1");
    expect(wrapper.vm.gGreenCluster.markersPopupOpened.has("f1")).toBe(true);
  });

  it("handleMapPointerMove toggles cursor style", () => {
    const fakeEl = { style: { cursor: "" } };
    const fakeEvt = {
      pixel: [0, 0],
      target: { hasFeatureAtPixel: () => true, getTargetElement: () => fakeEl },
    };
    wrapper.vm.handleMapPointerMove(fakeEvt);
    expect(fakeEl.style.cursor).toBe("pointer");
    // no feature
    fakeEvt.target.hasFeatureAtPixel = () => false;
    wrapper.vm.handleMapPointerMove(fakeEvt);
    expect(fakeEl.style.cursor).toBe("");
  });

  it("checkFullscreenAvailability alerts when disabled", () => {
    vi.stubGlobal("alert", vi.fn());
    Object.defineProperty(document, "fullscreenEnabled", {
      value: false,
      configurable: true,
    });
    wrapper.vm.checkFullscreenAvailability();
    expect(alert).toHaveBeenCalled();
  });

  it("ensureGeolocationEnabled prompt and deny flow", async () => {
    const fakeQuery = vi.fn().mockResolvedValue({ state: "denied" });
    Object.defineProperty(globalThis, "navigator", {
      value: { permissions: { query: fakeQuery }, geolocation: {} },
      configurable: true,
    });
    vi.stubGlobal("alert", vi.fn());

    const result = await wrapper.vm.ensureGeolocationEnabled();
    expect(fakeQuery).toHaveBeenCalledWith({ name: "geolocation" });
    expect(result).toBe(false);
    expect(alert).toHaveBeenCalled();
  });

  it("convertMarkersToFeatures and convertZonesToFeatures produce arrays", () => {
    const markers = [
      {
        id: "z1",
        coordinate: [1, 2],
        coordinates: [[1, 2]],
        details: { density: "MIDDLE" },
      },
    ];
    const features = wrapper.vm.convertMarkersToFeatures(markers);
    expect(Array.isArray(features)).toBe(true);
    const zfeatures = wrapper.vm.convertZonesToFeatures(markers);
    expect(Array.isArray(zfeatures)).toBe(true);
  });
});
