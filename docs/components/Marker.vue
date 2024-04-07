<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import { MarkerControl } from "../../packages/control-marker/index";

function onLoaded() {
    return () => new MarkerControl({}) as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>

<style>

</style>