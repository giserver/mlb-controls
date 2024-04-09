<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import { MarkerControl } from "../../packages/control-marker/index";

function onLoaded() {
    return () => new MarkerControl({
        layers: [{
                id: "35ebd84f-1c75-42b3-ba76-568cac847cf5",
                name: "test",
                date: Date.now()
            },{
                id: "35ebd84f-1c75-42b3-ba76-568cac847cf1",
                name: "test1",
                date: Date.now()
            }],
        featureCollection:{ "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [[[120.33795166015392, 31.155843389096844], [120.33245849609165, 30.95466933754993], [120.68470764159827, 30.975865573909786], [120.64350891112883, 31.155843389096844], [120.33795166015392, 31.155843389096844]]] }, "properties": { "id": "2dae1cb3-f2f9-4c34-b500-8288ed258639", "name": "标注", "layerId": "35ebd84f-1c75-42b3-ba76-568cac847cf5", "date": 1703034323051, "style": { "textSize": 14, "textColor": "black", "textHaloColor": "white", "textHaloWidth": 1, "pointIcon": "标1.png", "pointIconColor": "#ff0000", "pointIconSize": 0.3, "lineColor": "#0000ff", "lineWidth": 3, "polygonColor": "#0000ff", "polygonOpacity": 0.5, "polygonOutlineColor": "#000000", "polygonOutlineWidth": 2 } }, "id": "2dae1cb3-f2f9-4c34-b500-8288ed258639" }, { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[120.2605379098901, 30.869971361182337], [120.38410169141792, 30.8711497871234], [120.48501211299799, 30.88764622882202], [120.57974434550329, 30.878220038493666], [120.66212019985676, 30.84581043692205], [120.72184269426003, 30.848167868226483]] }, "properties": { "id": "04abb291-814c-4ad1-9f98-6277cdcefd27", "name": "标注", "layerId": "35ebd84f-1c75-42b3-ba76-568cac847cf5", "date": 1703036360925, "style": { "textSize": 19, "textColor": "#00ffff", "textHaloColor": "#000000", "textHaloWidth": 1, "pointIcon": "标1.png", "pointIconColor": "#ff0000", "pointIconSize": 0.3, "lineColor": "#ff0000", "lineWidth": 6, "polygonColor": "#0000ff", "polygonOpacity": 0.5, "polygonOutlineColor": "#000000", "polygonOutlineWidth": 2 } }, "id": "04abb291-814c-4ad1-9f98-6277cdcefd27" }, { "type": "Feature", "geometry": { "type": "Point", "coordinates": [120.2530240890847, 31.09089416247764] }, "properties": { "id": "55942abd-dc73-4f45-9247-2a7926339bde", "name": "标注", "layerId": "35ebd84f-1c75-42b3-ba76-568cac847cf5", "date": 1703036400053, "style": { "textSize": 19, "textColor": "#00ffff", "textHaloColor": "#000000", "textHaloWidth": 1, "pointIcon": "标1.png", "pointIconColor": "#ff0000", "pointIconSize": 0.3, "lineColor": "#ff0000", "lineWidth": 6, "polygonColor": "#0000ff", "polygonOpacity": 0.5, "polygonOutlineColor": "#000000", "polygonOutlineWidth": 2 } }, "id": "55942abd-dc73-4f45-9247-2a7926339bde" }] }
    }) as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>