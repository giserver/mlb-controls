<script lang="ts" setup>

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { nextTick, onMounted, onUnmounted } from 'vue';

import "./index.css";

mapboxgl.accessToken = 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w';

const props = defineProps<{
    onCreated?(map_box: mapboxgl.Map, map_libre: maplibre.Map): void,
    onLoaded?(map_box: mapboxgl.Map, map_libre: maplibre.Map): () => (mapboxgl.IControl & maplibre.IControl) | Array<mapboxgl.IControl & maplibre.IControl>;
}>();

let map_box: mapboxgl.Map;
let map_libre: maplibre.Map;

onMounted(() => {
    nextTick(() => {
        map_box = new mapboxgl.Map({
            container: "mapbox",
            attributionControl: false
        });

        map_libre = new maplibre.Map({
            container: "maplibre",
            style: 'https://demotiles.maplibre.org/style.json',
            attributionControl: false
        });

        props.onCreated?.(map_box, map_libre);

        const loadedFlags = [false, false];

        map_box.on('load', () => {
            loadedFlags[0] = true;
        });

        map_libre.on('load', () => {
            loadedFlags[1] = true;
        });

        let timeout = setInterval(() => {
            if (loadedFlags.every(x => x)) {
                clearInterval(timeout);
                const ctrlFunc = props.onLoaded?.(map_box, map_libre);
                if (ctrlFunc) {
                    const makeCtrls = () => {
                        let ctrls = ctrlFunc();
                        if (ctrls instanceof Array === false)
                            ctrls = [ctrls];
                        return ctrls;
                    }
                    makeCtrls().forEach(ctrl => {
                        map_box.addControl(ctrl);
                    });

                    makeCtrls().forEach(ctrl => {
                        map_libre.addControl(ctrl);
                    })
                }
            }
        }, 10)
    });
});

onUnmounted(() => {
    map_box.remove();
    map_libre.remove();
});
</script>

<template>
    <h3>mapbox</h3>
    <div class="map" id="mapbox"></div>

    <h3>maplibre</h3>
    <div class="map" id="maplibre"></div>
</template>