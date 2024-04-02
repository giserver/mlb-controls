<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import { MeasureControl } from "../../packages/control-measure/index";

function onLoaded() {
    return () => new MeasureControl({}) as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>