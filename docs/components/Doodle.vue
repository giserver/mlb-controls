<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import { DoodleControl } from "../../packages/control-doodle/index";

function onLoaded() {
    return () => new DoodleControl() as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>