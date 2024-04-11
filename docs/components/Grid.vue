<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import { GridControl } from "../../packages/control-grid/index";

function onLoaded() {
    return () => new GridControl() as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>