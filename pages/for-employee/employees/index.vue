<template>
  <main class="b-page">
    <header class="b-header q-mb-lg">
      <div class="b-header__title-wrapper">
        <h1 class="b-header__title gg-h1">Сотрудники</h1>
        <div v-if="store.user?.role === 'admin'" class="b-header__add-btn">
          <CButton label="Добавить оператора" size="medium" @click="openEmployeeDialog"></CButton>
        </div>
        <div v-if="store.user?.role === 'admin'" class="b-header__add-btn--mobile">
          <CButton
            :icon="mdiPlus"
            iconColor="var(--app-white)"
            stretch="hug"
            @click="openEmployeeDialog"
          ></CButton>
        </div>
      </div>
      <div class="b-header__search">
        <CInput
          v-model="searchEmployeeStr"
          label="Поиск сотрудника"
          hideBottomSpace
          height="48px"
          :required="false"
          @update:model-value="searchEmployee"
        >
          <template #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </CInput>
      </div>
    </header>
    <section class="b-content">
      <div class="b-filter q-mb-lg">
        <CFilter
          v-model="filters"
          @apply-filters="getEmployees"
          @reset-filters="getEmployees"
        ></CFilter>
      </div>
      <div class="b-table">
        <CTable
          :columns="tableHeaders"
          :rows="tableRows"
          v-model:pagination="pagination"
          row-key="name"
          :slots="['status']"
          :loading="employeesLoading"
          @click:row="(row: any) => goToEmployee(row.id)"
          @updateTable="getEmployees"
        >
          <template v-slot:body-cell-status="slotProps">
            <div class="b-account-status">
              <div
                class="b-account-status__item gg-t-small"
                :class="
                  EMPLOYEE_ACCOUNT_STATUS_STYLES[
                    slotProps.row.statusKey as keyof typeof EMPLOYEE_ACCOUNT_STATUS_STYLES
                  ]
                "
              >
                {{ slotProps.row.status }}
              </div>
            </div>
          </template>
        </CTable>
      </div>
    </section>
    <PagesEmployeesAdd v-model="isEmployeeDialogOpen" @employeeCreated="getEmployees" />
  </main>
</template>

<script setup lang="ts">
import { mdiMagnify, mdiPlus } from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { useMainStore } from "~/store/main";
import type { Employee, EmployeesRequest } from "~/types/interfaces/employees";

const store = useMainStore();
const debounce = useDebounce();
const {
  EMPLOYEE_ROLE_OPTIONS,
  EMPLOYEE_ACCOUNT_STATUS_OPTIONS,
  EMPLOYEE_ACCOUNT_STATUS_STYLES,
} = useGetStatusOptions();

const searchEmployeeStr = ref("");
const employeesLoading = ref(true);
const isEmployeeDialogOpen = ref(false);
const employees = ref<Employee[]>([]);
const pagination = ref<TablePagination>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const tableHeaders: TableHeader[] = [
  {
    name: "initials",
    align: "left",
    label: "ФИО",
    field: "initials",
    sortable: false,
  },
  {
    name: "role",
    align: "center",
    label: "Роль",
    field: "role",
    sortable: false,
  },
  {
    name: "status",
    align: "center",
    label: "Статус аккаунта",
    field: "status",
    sortable: false,
  },
  {
    name: "dateCreated",
    align: "right",
    label: "Дата создания",
    field: "dateCreated",
    sortable: false,
  },
];
const filters = ref<FilterItem[]>([
  {
    type: "select",
    key: "role",
    label: "Роль",
    selected: "",
    data: EMPLOYEE_ROLE_OPTIONS,
  },
  {
    type: "select",
    key: "status",
    selected: "",
    label: "Статус аккаунта",
    data: EMPLOYEE_ACCOUNT_STATUS_OPTIONS,
  },
  {
    type: "date-range",
    key: "status",
    selected: "",
    label: "Период создания",
  },
]);
const tableRows: ComputedRef<TableRow[]> = computed(() =>
  employees.value.map((e) => ({
    id: e.id,
    email: e.email,
    initials: `${e.lastName} ${e.firstName} ${e.patronymic}`,
    role: EMPLOYEE_ROLE_OPTIONS.find((o) => o.value === e.role)?.name ?? e.role,
    status: e.enabled ? "Активен" : "Заблокирован",
    statusKey: e.enabled ? "active" : "blocked",
    dateCreated: date.formatDate(new Date(e.creationDate), "DD.MM.YYYY"),
  })),
);
function searchEmployee() {
  debounce(getEmployees, 500, "searchEmployee");
}
async function getEmployees() {
  employeesLoading.value = true;
  let fromDateParam = "";
  let toDateParam = "";
  if (
    filters.value[2].selected &&
    typeof filters.value[2].selected === "string"
  ) {
    fromDateParam = filters.value[2].selected;
    toDateParam = filters.value[2].selected;
  } else {
    const { from, to } = filters.value[2].selected as {
      from: string | null;
      to: string | null;
    };
    fromDateParam = from || "";
    toDateParam = to || "";
  }
  const url = `${store.apiV1}/user/search`;
  try {
    const response = await $fetch<EmployeesRequest>(url, {
      method: "GET",
      headers: { Authorization: useGetToken() },
      params: {
        search: searchEmployeeStr.value || undefined,
        role: filters.value[0].selected || undefined,
        status: filters.value[1].selected || undefined,
        fromDate: fromDateParam ? fromDateParam : undefined,
        toDate: toDateParam ? toDateParam : undefined,
        page: pagination.value.page - 1,
        size: pagination.value.rowsPerPage,
      },
    });
    employees.value = response.users;
    pagination.value.rowsNumber = response.totalItems;
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Не удалось загрузить сотрудников. Попробуйте ещё раз.",
    };
  } finally {
    employeesLoading.value = false;
  }
}
function openEmployeeDialog() {
  isEmployeeDialogOpen.value = true;
}
function goToEmployee(id: string) {
  navigateTo(`/for-employee/employees/${id}`);
}
onMounted(() => {
  getEmployees();
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
  .b-account-status {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    &__item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: max-content;
      height: 32px;
      padding: 4px 16px;
      border-radius: 16px;
      color: var(--app-white);
    }
  }
}
</style>
