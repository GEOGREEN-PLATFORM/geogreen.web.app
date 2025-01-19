<template>
    <q-tooltip class="g-green-hint">
        <slot></slot>
    </q-tooltip>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">

</style>

<style lang="scss">
.g-green-hint.q-tooltip {
    font-size: 14px;
    width: 300px;
    text-align: center;
    background: var(--app-grey-300);
}
</style>