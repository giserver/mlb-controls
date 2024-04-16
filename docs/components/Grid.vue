<script lang="ts" setup>
import mapboxgl from "mapbox-gl";
import MapControl from "./MapControl.vue";

import { GridControl } from "../../packages/control-grid/index";
import { LocationControl } from '../../packages/control-location/index';

function onLoaded() {
    return () => [new GridControl(), new LocationControl()] as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>