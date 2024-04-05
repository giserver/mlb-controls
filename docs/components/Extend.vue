<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import { ExtendControl } from "../../packages/control-extend/index";
import { dom } from "wheater";

function onLoaded() {
    return () => [
        new ExtendControl({
            content: dom.createHtmlElement("div", [], ["top-right extend control"], {
                onInit: e => {
                    e.style.width = "100px";
                    e.style.background = "white";
                    e.style.color = 'red'
                }
            })
        }) as any,

        new ExtendControl({
            position: 'top-left',
            content: dom.createHtmlElement("div", [], ["top-left extend control"], {
                onInit: e => {
                    e.style.width = "100px";
                    e.style.background = "white";
                    e.style.color = 'red'
                }
            })
        }) as any,

        new ExtendControl({
            position: 'bottom-right',
            content: dom.createHtmlElement("div", [], ["bottom-right extend control"], {
                onInit: e => {
                    e.style.width = "100px";
                    e.style.background = "white";
                    e.style.color = 'red'
                }
            })
        }) as any,

        new ExtendControl({
            position: 'bottom-left',
            content: dom.createHtmlElement("div", [], ["bottom-left extend control"], {
                onInit: e => {
                    e.style.width = "100px";
                    e.style.background = "white";
                    e.style.color = 'red'
                }
            })
        }) as any,
    ];
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>