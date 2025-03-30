<template>
  <main class="employees-page">
    <section class="employees-page__header">
      <div class="employees-page__title-wrapper">
        <h1 class="employees-page__title gg-h1">Сотрудники</h1>
        <GGButton
          @click="openEmployeeDialog"
          class="employees-page__add-employee"
          label="Добавить оператора"
          size="medium"
        ></GGButton>
        <GGButton
          @click="openEmployeeDialog"
          class="employees-page__add-employee--mobile"
          :icon="mdiPlus"
          iconColor="var(--app-white)"
          stretch="hug"
        ></GGButton>
      </div>
      <KTInput
        class="employees-page__search-employee"
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
    </section>
    <section class="employees-page__content">
      <div class="filter-container">
        <CFilter v-model="filters"></CFilter>
      </div>
      <div class="table-container">
        <CTable
          :columns="tableHeaders"
          :rows="tableRows"
          row-key="name"
          :slots="['status']"
          @click:row="(row: any) => goToEmployee(row.id)"
        >
          <template v-slot:body-cell-status="slotProps">
            <div class="status-wrapper">
              <div
                class="account-status gg-t-small"
                :class="{
                  'account-status--active': slotProps.row.status === 'Активен',
                  'account-status--blocked': slotProps.row.status === 'Заблокирован',
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
import { mdiContentCopy, mdiMagnify, mdiPlus } from "@quasar/extras/mdi-v6";

const statusOptions = [
  {
    name: "Активен",
    value: "active",
  },
  {
    name: "Заблокирован",
    value: "blocked",
  },
];
const roleOptions = [
  {
    name: "Оператор",
    value: "operator",
  },
  {
    name: "Администратор",
    value: "administrator",
  },
];
const isEmployeeDialogOpen = ref(false);
function openEmployeeDialog() {
  isEmployeeDialogOpen.value = true;
}
function handleEmployeeCreated(newEmployeeData: unknown) {
  console.log("Создан сотрудник:", newEmployeeData);
}
const filters = reactive<FilterItem[]>([
  {
    type: "select",
    key: "role",
    label: "Роль",
    selected: "",
    data: roleOptions,
  },
  {
    type: "select",
    key: "status",
    selected: "",
    label: "Статус аккаунта",
    data: statusOptions,
  },
  {
    type: "date-range",
    key: "status",
    selected: "",
    label: "Дата/период создания",
  },
]);
const searchEmployee = ref("");
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

function goToEmployee(id: string) {
  navigateTo(`/for-employee/employees/${id}`);
}
</script>

<style scoped lang="scss">
.employees-page {
  $app-desktop: 1294px;
  $app-laptop: 960px;
  $app-mobile: 600px;
  $app-narrow-mobile: 364px;

  padding: 0px 32px;
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
    padding: 24px 0px;
    @media screen and (max-width: $app-laptop) {
      flex-wrap: wrap;
      gap: 16px;
    }
    .employees-page__title-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      @media screen and (max-width: $app-mobile) {
        justify-content: center;
        gap: 24px;
      }
    }
    .employees-page__add-employee {
      width: 40%;
      max-width: 288px;
      min-width: max-content;
      &--mobile {
        display: none;
      }
      @media screen and (max-width: $app-mobile) {
        &--mobile {
          display: block;
        }
        display: none;
      }
    }
    .employees-page__search-employee {
      width: 60%;
      max-width: 412px;
      @media screen and (max-width: $app-mobile) {
        width: 100%;
        max-width: 100%;
      }
    }
  }
  .status-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    .account-status {
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
.dialog-employee-add {
  display: flex;
  flex-direction: column;
  width: 80%;
  max-width: 784px;
  height: max-content;
  background-color: var(--app-white);
  border-radius: 12px;
  padding: 24px 32px;
  &__title {
    padding: 16px 0px 20px 0px;
    .sub-title {
      font-size: 18px;
      color: var(--app-grey-300);
      margin-top: 10px;
    }
  }
  .block {
    padding-top: 20px;
    &__name {
      margin-bottom: 12px;
    }
    &__row-fields {
      display: flex;
      gap: 12px;
    }
    &__field {
      padding-top: 12px;
      max-width: 434px;
    }
  }
  .password-container {
    display: flex;
    gap: 32px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .with-copy {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
  }
  .password {
    font-size: 32px;
    font-weight: bold;
  }
  &__footer-buttons {
    display: flex;
    gap: 16px;
    margin-top: 32px;
  }
}
</style>
