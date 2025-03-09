<template>
    <div class="c-table-container">
        <q-table
            :title="title"
            :rows="rows"
            :columns="columns"
            :row-key="rowKey"
        />
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
}
const props = defineProps<Props>();
</script>

<style scoped lang="scss">

</style>