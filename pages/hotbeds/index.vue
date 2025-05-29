<template>
  <main class="b-page">
    <header class="b-header q-mb-lg">
      <div class="b-header__title-wrapper">
        <h1 class="b-header__title gg-h1">Очаги</h1>
        <div class="b-header__add-btn">
          <CButton @click="openHotbedDialog" label="Добавить очаг" size="medium"></CButton>
        </div>
        <div class="b-header__add-btn--mobile">
          <CButton
            @click="openHotbedDialog"
            :icon="mdiPlus"
            iconColor="var(--app-white)"
            stretch="hug"
          ></CButton>
        </div>
      </div>
    </header>
    <section class="b-page__content">
      <div class="b-filter q-mb-lg">
        <CFilter
          v-model="filters"
          @apply-filters="getHotbeds"
          @reset-filters="getHotbeds"
        ></CFilter>
      </div>
      <div class="b-table">
        <CTable
          :columns="tableHeaders"
          :rows="tableRows"
          v-model:pagination="pagination"
          row-key="name"
          :slots="['workStage']"
          @click:row="(row: any) => goToHotbed(row.id)"
          @updateTable="getHotbeds"
          :loading="hotbedsLoading"
        >
          <template v-slot:body-cell-workStage="slotProps">
            <div
              class="b-status-coniainter gg-t-small"
              :class="
                HOTBED_WORK_STAGE_STYLES[
                  slotProps.row.workStage as keyof typeof HOTBED_WORK_STAGE_STYLES
                ]
              "
            >
              {{ slotProps.row.workStage }}
            </div>
          </template>
        </CTable>
      </div>
    </section>
    <PagesHotbedsAdd
      v-model="isHotbedDialogOpen"
      :addState="addHotbedDialogState"
      @hotbedCreated="handleHotbedCreated"
    />
  </main>
</template>

<script setup lang="ts">
import { mdiMagnify, mdiPlus } from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { useMainStore } from "~/store/main";
import type { HotbedData } from "~/types/interfaces/hotbeds";
interface GeoPointsRequest extends ServerPagination {
  geoPoints: Marker[];
}
const store = useMainStore();
const route = useRoute();
const debounce = useDebounce();
const { HOTBED_WORK_STAGE_OPTIONS, HOTBED_WORK_STAGE_STYLES } =
  useGetStatusOptions();
const pagination = ref<TablePagination>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const tableHeaders: TableHeader[] = [
  {
    name: "problemAreaType",
    align: "left",
    label: "Тип проблемы",
    field: "problemAreaType",
  },
  {
    name: "workStage",
    align: "center",
    label: "Статус работы",
    field: "workStage",
  },
  {
    name: "landType",
    align: "center",
    label: "Тип земель",
    field: "landType",
  },
  {
    name: "owner",
    align: "right",
    label: "Владелец",
    field: "owner",
  },
  {
    name: "eliminationMethod",
    align: "right",
    label: "Метод по устранению",
    field: "eliminationMethod",
  },
  {
    name: "dateCreated",
    align: "right",
    label: "Дата создания",
    field: "dateCreated",
  },
  {
    name: "dateUpdated",
    align: "right",
    label: "Дата изменения",
    field: "dateUpdated",
  },
];
const addHotbedDialogState = shallowRef<"success" | "error" | "loading">(
  "success",
);
const hotbeds = ref<Marker[]>([]);
const tableRows: ComputedRef<TableRow[]> = computed(() =>
  hotbeds.value.map((e) => ({
    id: e.id,
    problemAreaType: e.details?.problemAreaType,
    workStage: e.details?.workStage,
    landType: e.details?.landType,
    owner: e.details?.owner,
    eliminationMethod: e.details?.eliminationMethod,
    dateCreated: date.formatDate(e.details?.creationDate, "DD.MM.YYYY"),
    dateUpdated: date.formatDate(e.details?.updateDate, "DD.MM.YYYY"),
  })),
);
const filters = ref<FilterItem[]>([
  {
    type: "select",
    key: "problemAreaType",
    label: "Тип проблемы",
    selected: "",
    data: store.formattedProblemAreaTypes,
  },
  {
    type: "select",
    key: "workStage",
    selected: "",
    label: "Статус работы",
    data: HOTBED_WORK_STAGE_OPTIONS,
  },
  {
    type: "select",
    key: "landType",
    selected: "",
    label: "Тип земель",
    data: store.formattedLandTypes,
  },
  {
    type: "date-range",
    key: "dateCreated",
    selected: "",
    label: "Период создания",
  },
]);
const searchHotbedStr = ref("");
const hotbedsLoading = ref(true);
const isHotbedDialogOpen = ref(false);
async function handleHotbedCreated(newHotbed: HotbedData) {
  try {
    addHotbedDialogState.value = "loading";
    await $fetch(`${store.apiV1}/geo/info`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        coordinate: newHotbed.coordinate,
        details: {
          owner: newHotbed.owner,
          landType: newHotbed.landType,
          contractingOrganization: newHotbed.contractingOrganization,
          eliminationMethod: newHotbed.eliminationMethod,
          images: newHotbed.images,
          workStage: "Создано",
          problemAreaType: newHotbed.problemAreaType,
          comment: newHotbed.comment,
          density: newHotbed.density === "default" ? null : newHotbed.density,
          operatorId: store.user?.id,
        },
        coordinates: newHotbed.coordinates || null,
      },
    });
    addHotbedDialogState.value = "success";
    isHotbedDialogOpen.value = false;
    getHotbeds();
  } catch (error: any) {
    console.error(error);
    addHotbedDialogState.value = "error";
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось добавить очаг",
    };
  }
}
async function getHotbeds() {
  try {
    hotbedsLoading.value = true;
    let fromDateParam = "";
    let toDateParam = "";
    if (
      filters.value[3].selected &&
      typeof filters.value[3].selected === "string"
    ) {
      fromDateParam = filters.value[3].selected;
      toDateParam = filters.value[3].selected;
    } else {
      const { from, to } = filters.value[3].selected as {
        from: string | null;
        to: string | null;
      };
      fromDateParam = from || "";
      toDateParam = to || "";
    }
    if (fromDateParam && toDateParam && fromDateParam === toDateParam) {
      const startDate = new Date(fromDateParam);
      const endDate = new Date(toDateParam);
      const startOfDay = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      );
      const endOfDay = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate() + 1,
      );
      fromDateParam = startOfDay.toISOString();
      toDateParam = endOfDay.toISOString();
    }
    const url = `${store.apiV1}/geo/info`;
    const response = await $fetch<GeoPointsRequest>(url, {
      method: "GET",
      headers: { Authorization: useGetToken() },
      params: {
        search: searchHotbedStr.value || undefined,
        workStage: filters.value[1].selected || undefined,
        problemAreaType: filters.value[0].selected || undefined,
        landType: filters.value[2].selected || undefined,
        fromDate: fromDateParam || undefined,
        toDate: toDateParam || undefined,
        page: pagination.value.page - 1,
        size: pagination.value.rowsPerPage,
      },
    });
    hotbeds.value = response.geoPoints;
    pagination.value.rowsNumber = response.totalItems;
  } catch (error: any) {
    console.error(error);
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось получить очаги проблем",
    };
  } finally {
    hotbedsLoading.value = false;
  }
}
function searchHotbed() {
  debounce(getHotbeds, 500, "searchHotbed");
}
function openHotbedDialog() {
  isHotbedDialogOpen.value = true;
}
function goToHotbed(id: string) {
  navigateTo(`/hotbeds/${id}`);
}
onMounted(() => {
  getHotbeds();
  if (route.query.addFromStart) {
    openHotbedDialog();
  }
});
</script>

<style scoped lang="scss">
.b-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;
  padding: 24px 32px;
  .b-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
    @media screen and (max-width: $app-laptop) {
      flex-wrap: wrap;
      gap: 16px;
    }
    &__title-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      @media screen and (max-width: $app-mobile) {
        justify-content: center;
        gap: 24px;
      }
    }
    &__add-btn {
      width: 40%;
      max-width: 288px;
      min-width: max-content;
      &--mobile {
        display: none;
      }
      @media screen and (max-width: $app-mobile) {
        display: none;
        &--mobile {
          display: block;
        }
      }
    }
    &__search {
      width: 60%;
      max-width: 412px;
      @media screen and (max-width: $app-mobile) {
        width: 100%;
        max-width: 100%;
      }
    }
  }
  .b-status-coniainter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    margin: 0 auto;
    height: 32px;
    padding: 4px 16px;
    border-radius: 16px;
    color: var(--app-white);
  }
}
</style>
