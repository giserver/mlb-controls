<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import { LocationControl } from "../../packages/control-location/index";

function onLoaded() {
    return () => new LocationControl() as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>