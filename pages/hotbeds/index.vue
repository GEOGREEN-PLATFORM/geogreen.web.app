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
      <div class="b-header__search">
        <CInput
          v-model="searchHotbedStr"
          @update:model-value="searchHotbed"
          label="Поиск очага"
          hideBottomSpace
          height="48px"
          :required="false"
        >
          <template #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </CInput>
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
      :hotbeds="hotbeds"
      @hotbedCreated="handleHotbedCreated"
    />
  </main>
</template>

<script setup lang="ts">
import { mdiMagnify, mdiPlus } from "@quasar/extras/mdi-v6";
import type { Coordinate } from "ol/coordinate";
import { date } from "quasar";
import { useMainStore } from "~/store/main";
interface HotbedData {
  problemAreaType: string;
  landType: string;
  eliminationMethod: string;
  owner: string;
  contractingOrganization: string;
  comment: string;
  images: ImageObj[];
  density: Density;
  coordinate: Coordinate | null;
  coordinates: Coordinate[];
}
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const store = useMainStore();
const debounce = useDebounce();
const { HOTBED_WORK_STAGE_OPTIONS, HOTBED_WORK_STAGE_STYLES } =
  useGetStatusOptions();
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
  {
    type: "date-range",
    key: "dateUpdated",
    selected: "",
    label: "Период изменения",
  },
]);
const searchHotbedStr = ref("");
const hotbedsLoading = ref(true);
const isHotbedDialogOpen = ref(false);
async function handleHotbedCreated(newHotbed: HotbedData) {
  try {
    await $fetch(`${store.apiGeospatial}/geo/info`, {
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
          density: newHotbed.density,
        },
        coordinates: newHotbed.coordinates?.[0] || null,
      },
    });
    getHotbeds();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось добавить очаг",
    };
  }
}
async function getHotbeds() {
  hotbedsLoading.value = true;
  const params = new URLSearchParams();
  if (searchHotbedStr.value) {
    params.append("search", searchHotbedStr.value);
  }
  if (filters.value[0].selected) {
    params.append("role", filters.value[0].selected as string);
  }
  if (filters.value[1].selected) {
    params.append("status", filters.value[1].selected as string);
  }
  if (
    filters.value[2].selected &&
    typeof filters.value[2].selected === "string"
  ) {
    params.append("fromDate", filters.value[2].selected);
    params.append("toDate", filters.value[2].selected);
  } else {
    const { from, to } = filters.value[2].selected as {
      from: string | null;
      to: string | null;
    };
    if (from) {
      params.append("fromDate", from);
    }
    if (to) {
      params.append("toDate", to);
    }
  }

  params.append("page", String(pagination.value.page - 1));
  params.append("size", String(pagination.value.rowsPerPage));
  const url = `${store.apiGeospatial}/geo/info/getAll?${params.toString()}`;
  const response = await $fetch<Marker[]>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  hotbeds.value = response;
  // pagination.value.rowsNumber = response.totalItems;
  hotbedsLoading.value = false;
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
