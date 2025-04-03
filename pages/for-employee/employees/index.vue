<template>
  <main class="b-page">
    <header class="b-header q-my-lg">
      <div class="b-header__title-wrapper">
        <h1 class="b-header__title gg-h1">Сотрудники</h1>
        <div class="b-header__add-btn">
          <GGButton @click="openEmployeeDialog" label="Добавить оператора" size="medium"></GGButton>
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
          v-model="searchEmployee"
          label="Поиск сотрудника"
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
        <CFilter v-model="filters"></CFilter>
      </div>
      <div class="b-table">
        <CTable
          :columns="tableHeaders"
          :rows="tableRows"
          row-key="name"
          :slots="['status']"
          @click:row="(row: any) => goToEmployee(row.id)"
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
    value: "administrator",
  },
];
const tableHeaders = [
  {
    name: "initials",
    align: "left",
    label: "ФИО",
    field: "initials",
    sortable: true,
  },
  {
    name: "role",
    align: "center",
    label: "Роль",
    field: "role",
    sortable: true,
  },
  {
    name: "status",
    align: "center",
    label: "Статус аккаунта",
    field: "status",
    sortable: true,
  },
  {
    name: "dateCreated",
    align: "right",
    label: "Дата создания",
    field: "dateCreated",
    sortable: true,
  },
];
const tableRows = [
  {
    initials: "Иванов Иван Иванович",
    role: "Оператор",
    status: "Активен",
    dateCreated: "23.02.2025",
    id: "213-de32-2312",
  },
];
const filters = reactive<FilterItem[]>([
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
const searchEmployee = ref("");
const isEmployeeDialogOpen = ref(false);

function openEmployeeDialog() {
  isEmployeeDialogOpen.value = true;
}

function handleEmployeeCreated(newEmployeeData: unknown) {
  console.log("Создан сотрудник:", newEmployeeData);
}

function goToEmployee(id: string) {
  navigateTo(`/for-employee/employees/${id}`);
}
</script>

<style scoped lang="scss">
.b-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;
  padding: 0px 32px;
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
