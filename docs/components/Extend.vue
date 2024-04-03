<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import { ExtendControl } from "../../packages/control-extend/index";

function onLoaded() {
    return () => new ExtendControl() as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>