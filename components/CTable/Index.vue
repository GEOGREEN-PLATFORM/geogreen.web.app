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
  columns: {
    name: string;
    label: string;
    align?: "left" | "right" | "center" | undefined;
    sortable?: boolean;
    field: string | ((row: unknown) => unknown);
  }[];
  rows: {
    name: string;
    [fieldName: string]: string | number;
  }[];
  title: string;
  rowKey?: string;
  slots?: string[];
}
const props = defineProps<Props>();
const emits = defineEmits<{
  "click:row": [row: unknown];
}>();
function onRowClick(evt: Event, row: unknown) {
  emits("click:row", row);
}
</script>

<style lang="scss">
.c-table-container {
  &__table {
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
  }
}
</style>
