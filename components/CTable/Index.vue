<template>
  <div class="c-table-container">
    <q-table
      :title="title"
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      flat
      bordered
      table-class="c-table-container__table"
      :rows-per-page-options="[10, 20, 50, 0]"
      @row-click="onRowClick"
      v-model:pagination="paginationCopy"
      @request="updateTable"
      :loading="loading"
    >
      <template v-for="slot in props.slots" v-slot:[`body-cell-${slot}`]="slotProps">
        <q-td :props="slotProps">
          <slot :name="`body-cell-${slot}`" v-bind="slotProps"></slot>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
interface Props {
  columns: TableHeader[];
  rows: TableRow[];
  title?: string;
  rowKey?: string;
  slots?: string[];
  pagination: TablePagination;
  loading?: boolean;
}

const props = defineProps<Props>();
const paginationCopy = ref();
const emits = defineEmits<{
  "click:row": [row: TableRow];
  "update:pagination": [TablePagination];
  updateTable: [];
}>();
function onRowClick(evt: Event, row: TableRow) {
  emits("click:row", row);
}
function updateTable(request: {
  pagination: TablePagination;
  [key: string]: any;
}) {
  if (request.pagination.rowsPerPage === 0) {
    paginationCopy.value.rowsPerPage = paginationCopy.value.rowsNumber;
  } else {
    paginationCopy.value.rowsPerPage = request.pagination.rowsPerPage;
  }
  paginationCopy.value.page = request.pagination.page;
  emits("update:pagination", paginationCopy.value);
  emits("updateTable");
}
onMounted(() => {
  paginationCopy.value = props.pagination;
});
</script>

<style lang="scss">
.c-table-container {
  &__table {
    height: 100%;
    max-height: 600px;
    .q-table tbody td,
    .q-table thead th {
      font-size: 14px;
    }
    .q-table__sort-icon {
      width: 0px;
      margin: 0;
      &--right {
        right: 12px;
      }
      &--left {
        left: 12px;
      }
      &--center {
        left: 12px;
      }
    }
    .q-table thead th,
    .q-table tbody td {
      max-width: 300px;
      overflow-wrap: break-word;
      white-space: normal;
    }
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: var(--app-white);
    }
    thead tr th {
      position: sticky;
      z-index: 1;
    }
    thead tr:first-child th {
      top: 0;
    }
  }
}
</style>
