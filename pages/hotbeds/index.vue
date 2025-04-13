<template>
  <main class="b-page">
    <header class="b-header q-mb-lg">
      <div class="b-header__title-wrapper">
        <h1 class="b-header__title gg-h1">Очаги</h1>
        <div class="b-header__add-btn">
          <GGButton @click="openEmployeeDialog" label="Добавить очаг" size="medium"></GGButton>
        </div>
        <div class="b-header__add-btn--mobile">
          <GGButton
            @click="openEmployeeDialog"
            :icon="mdiPlus"
            iconColor="var(--app-white)"
            stretch="hug"
          ></GGButton>
        </div>
      </div>
      <div class="b-header__search">
        <KTInput
          v-model="searchEmployeeStr"
          @update:model-value="searchEmployee"
          label="Поиск очага"
          hideBottomSpace
          height="48px"
          :required="false"
        >
          <template #append>
            <q-icon :name="mdiMagnify" />
          </template>
        </KTInput>
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
          @click:row="(row: any) => goToEmployee(row.email)"
          @updateTable="getEmployees"
          :loading="employeesLoading"
        >
          <template v-slot:body-cell-status="slotProps">
            <div class="b-account-status">
              <div
                class="b-account-status__item gg-t-small"
                :class="{
                  'b-account-status__item--active': slotProps.row.status === 'Активен',
                  'b-account-status__item--blocked': slotProps.row.status === 'Заблокирован',
                }"
              >
                {{ slotProps.row.status }}
              </div>
            </div>
          </template>
        </CTable>
      </div>
    </section>
    <EmployeesPageAddDialog
      v-model="isEmployeeDialogOpen"
      @employeeCreated="handleEmployeeCreated"
    />
  </main>
</template>

<script setup lang="ts">
import { mdiMagnify, mdiPlus } from "@quasar/extras/mdi-v6";
import { date } from "quasar";
import { useMainStore } from "~/store/main";

interface EmployeeRaw {
  id: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  role: string;
  enabled: boolean;
  creationDate: string;
  email: string;
}
interface EmployeeData {
  personalData: {
    firstName: string;
    secondName: string;
    lastName: string;
    dateOfBirth: string;
  };
  contacts: {
    email: string;
    phoneNumber: string;
  };
  password: string;
}
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const store = useMainStore();
const debounce = useDebounce();
const STATUS_OPTIONS = [
  {
    name: "Активен",
    value: "active",
  },
  {
    name: "Заблокирован",
    value: "blocked",
  },
];
const ROLE_OPTIONS = [
  {
    name: "Оператор",
    value: "operator",
  },
  {
    name: "Администратор",
    value: "admin",
  },
];
const tableHeaders = [
  {
    name: "problemAreaType",
    align: "left",
    label: "Тип проблемы",
    field: "problemAreaType",
    sortable: true,
  },
  {
    name: "workStage",
    align: "center",
    label: "Статус работы",
    field: "workStage",
    sortable: true,
  },
  {
    name: "landType",
    align: "center",
    label: "Тип земель",
    field: "landType",
    sortable: true,
  },
  {
    name: "owner",
    align: "right",
    label: "Владелец",
    field: "owner",
    sortable: true,
  },
  {
    name: "eliminationMethod",
    align: "right",
    label: "Метод по устранению",
    field: "eliminationMethod",
    sortable: true,
  },
  {
    name: "dateCreated",
    align: "right",
    label: "Дата создания",
    field: "dateCreated",
    sortable: true,
  },
  {
    name: "dateUpdated",
    align: "right",
    label: "Дата изменения",
    field: "dateUpdated",
    sortable: true,
  },
];
const employees = ref<EmployeeRaw[]>([]);
const tableRows = computed(() =>
  employees.value.map((e) => ({
    id: e.id,
    email: e.email,
    initials: `${e.lastName} ${e.firstName} ${e.patronymic}`,
    role: ROLE_OPTIONS.find((o) => o.value === e.role)?.name ?? e.role,
    status: e.enabled ? "Активен" : "Заблокирован",
    dateCreated: date.formatDate(new Date(e.creationDate), "DD.MM.YYYY"),
  })),
);
const filters = ref<FilterItem[]>([
  {
    type: "select",
    key: "role",
    label: "Роль",
    selected: "",
    data: ROLE_OPTIONS,
  },
  {
    type: "select",
    key: "status",
    selected: "",
    label: "Статус аккаунта",
    data: STATUS_OPTIONS,
  },
  {
    type: "date-range",
    key: "status",
    selected: "",
    label: "Период создания",
  },
]);
const searchEmployeeStr = ref("");
const employeesLoading = ref(true);
const isEmployeeDialogOpen = ref(false);
function searchEmployee() {
  debounce(getEmployees, 500, "searchEmployee");
}
function openEmployeeDialog() {
  isEmployeeDialogOpen.value = true;
}
async function getEmployees() {
  employeesLoading.value = true;
  const params = new URLSearchParams();
  if (searchEmployeeStr.value) {
    params.append("search", searchEmployeeStr.value);
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
    params.append(
      "fromDate",
      tempDateConverterWillBeRemoved(filters.value[2].selected),
    );
    params.append(
      "toDate",
      tempDateConverterWillBeRemoved(filters.value[2].selected),
    );
  } else {
    const { from, to } = filters.value[2].selected as {
      from: string | null;
      to: string | null;
    };
    if (from) {
      params.append("fromDate", tempDateConverterWillBeRemoved(from));
    }
    if (to) {
      params.append("toDate", tempDateConverterWillBeRemoved(to));
    }
  }

  params.append("page", String(pagination.value.page - 1));
  params.append("size", String(pagination.value.rowsPerPage));
  const url = `${store.apiAuth}/user?${params.toString()}`;
  const response = await $fetch<{
    users: EmployeeRaw[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
  }>(url, {
    method: "GET",
    headers: { Authorization: useGetToken() },
  });
  employees.value = response.users;
  pagination.value.rowsNumber = response.totalItems;
  employeesLoading.value = false;
}

async function handleEmployeeCreated(newEmployee: EmployeeData) {
  try {
    await $fetch(`${store.apiAuth}/register/operator`, {
      method: "POST",
      headers: {
        authorization: useGetToken(),
      },
      body: {
        firstName: newEmployee.personalData.firstName,
        lastName: newEmployee.personalData.lastName,
        patronymic: newEmployee.personalData.secondName,
        email: newEmployee.contacts.email,
        password: newEmployee.password,
        number: newEmployee.contacts.phoneNumber,
        birthdate: tempDateConverterWillBeRemoved(
          newEmployee.personalData.dateOfBirth,
        ),
      },
    });
    getEmployees();
  } catch (error: any) {
    useState<Alert>("showAlert").value = {
      show: true,
      type: "error",
      text: "Ну удалось создать оператора",
    };
  }
}
function tempDateConverterWillBeRemoved(ddmmyyyy: string): string {
  const [day, month, year] = ddmmyyyy.split(".");
  return `${year}-${month}-${day}`;
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
    &__item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: max-content;
      height: 32px;
      padding: 4px 16px;
      border-radius: 16px;
      color: var(--app-white);
      &--active {
        background-color: var(--app-green-300);
      }
      &--blocked {
        background-color: var(--app-grey-300);
      }
    }
  }
}
</style>
