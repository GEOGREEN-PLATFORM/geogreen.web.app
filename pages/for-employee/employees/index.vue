<template>
    <main class="employees-page">
        <section class="employees-page__header">
            <h1 class="employees-page__title gg-h1">Сотрудники</h1>
            <div class="employees-page__actions-wrapper">
                <GGButton class="employees-page__add-employee" label="Добавить сотрудника" size="medium"></GGButton>
                <KTInput class="employees-page__search-employee" v-model="searchEmployee" label="Поиск сотрудника" hideBottomSpace height="48px" :required="false">
                    <template #append>
                        <q-icon
                            :name="mdiMagnify"
                        />
                    </template>
                </KTInput>
            </div>
        </section>
        <section class="employees-page__content">
            <div class="filter-container">
                <CFilter v-model="filters"></CFilter>
            </div>
            <div class="table-container">
              <CTable :columns="tableHeaders" :rows="tableRows" row-key="name"></CTable>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { mdiMagnify } from "@quasar/extras/mdi-v6";
const filters = reactive<FilterItem[]>([
  {
    type: "select",
    key: "role",
    label: "Роль",
    selected: "",
    data: [
      {
        name: "Оператор",
        value: "operator",
      },
      {
        name: "Администратор",
        value: "administrator",
      },
    ],
  },
  {
    type: "select",
    key: "status",
    selected: "",
    label: "Статус аккаунта",
    data: [
      {
        name: "Активен",
        value: "active",
      },
      {
        name: "Заблокирован",
        value: "blocked",
      },
    ],
  },
  {
    type: "date-range",
    key: "status",
    selected: ["", ""],
    label: "Дата создания",
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
  },
];
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
        padding: 24px 0px;
        .employees-page__actions-wrapper {
            display: flex;
            align-items: center;
            width: 728px;
            gap: 32px;
            .employees-page__add-employee {
                width: 40%;
            }
            .employees-page__search-employee {
                width: 60%;
            }
        }
    }
}
</style>