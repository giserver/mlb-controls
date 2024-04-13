import { creator, dom } from 'wheater';
import { MapControl, MapControlOptions } from "@mlb-controls/common";
import { IGridControlLanguage } from "./lang";
import mapboxgl from 'mapbox-gl';

type GridXYZSchema = {
    type: "xyz",
}

export interface GridControlOptions extends MapControlOptions<IGridControlLanguage> {
}



export class GridControl extends MapControl<IGridControlLanguage> {
    private id_source = creator.uuid();

    readonly id_layer_lng_line = this.id_source + "_lng_line";
    readonly id_layer_lng_symbol = this.id_source + "_lng_symbol";

    readonly id_layer_lat_line = this.id_source + "_lat_line";
    readonly id_layer_lat_symbol = this.id_source + "_lat_symbol";

    readonly id_layer_tile_line_hor = this.id_source + "_tile_line_hor";
    readonly id_layer_tile_line_vec = this.id_source + "_tile_line_vec";
    readonly id_layer_tile_symbol = this.id_source + "_tile_symbol";

    private lastZoom = -1;

    private moveHandler = (e: { target: mapboxgl.Map }) => {
        this.updateLngLatLine(e.target);

        this.lastZoom = e.target.getZoom();
    }

    /**
     *
     */
    constructor(private options: GridControlOptions = {
    }) {
        super(options, {});
    }

    createElement(map: mapboxgl.Map): HTMLElement {
        map.addSource(this.id_source, { type: 'geojson', data: { type: "FeatureCollection", features: [] } });

        this.addLayers(map);


        this.updateLngLatLine(map);

        map.on('move', this.moveHandler);
        return dom.createHtmlElement('div');
    }
    removeControl(map: mapboxgl.Map): void {
        map.off("move", this.moveHandler);
    }
    getDefaultPosition?: (() => string) | undefined;

    private updateLngLatLine(map: mapboxgl.Map) {
        const intervals = [15, 12, 10, 6, 3, 2, 1, 1, 0.5, 0.3, 0.2, 0.1, 0.03, 0.02, 0.009, 0.006, 0.003, 0.001, 0.0003, 0.0001, 0.00006];
        const zoom = Math.floor(map.getZoom());
        const interval = intervals[zoom] ?? intervals.at(-1);

        if (zoom === Math.floor(this.lastZoom) && interval >= 1) {
            return;
        }

        const { lngMin, latMin, lngMax, latMax } = this.getBoundInfo(map);
        const features = new Array<GeoJSON.Feature>();

        if (interval >= 1)
            for (let l = -180; l < 180; l += interval)
                features.push({
                    type: 'Feature',
                    properties: {
                        "schema": "lnglat",
                        "type": "lng",
                        "value": `${parseFloat(l.toFixed(9))} ${l > 0 ? 'E' : 'W'}`
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: [[l, -90], [l, 90]]
                    }
                });
        else
            for (let l = Math.floor(lngMin / interval) * interval; l < Math.ceil(lngMax / interval) * interval; l += interval) {
                features.push({
                    type: 'Feature',
                    properties: {
                        "schema": "lnglat",
                        "type": "lng",
                        "value": `${parseFloat(l.toFixed(9))} ${l > 0 ? 'E' : 'W'}`
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: [[l, -90], [l, 90]]
                    }
                });
            }


        if (interval >= 1)
            for (let l = -90; l < 90; l += interval)
                features.push({
                    type: 'Feature',
                    properties: {
                        "schema": "lnglat",
                        "type": "lat",
                        "value": `${parseFloat(l.toFixed(9))} ${l > 0 ? 'N' : 'S'}`
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: [[-180, l], [180, l]]
                    }
                });

        else
            for (let l = Math.floor(latMin / interval) * interval; l < Math.ceil(latMax / interval) * interval; l += interval) {
                features.push({
                    type: 'Feature',
                    properties: {
                        "schema": "lnglat",
                        "type": "lat",
                        "value": `${parseFloat(l.toFixed(9))} ${l > 0 ? 'N' : 'S'}`
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: [[-180, l], [180, l]]
                    }
                });
            }

        this.updateDataSource(map, features);
    }

    private getBoundInfo(map: mapboxgl.Map) {
        const bounds = map.getBounds().toArray();
        return { lngMin: bounds[0][0], latMin: bounds[0][1], lngMax: bounds[1][0], latMax: bounds[1][1] };
    }

    private addLayers(map: mapboxgl.Map) {
        map.addLayer({
            id: this.id_layer_lng_line,
            type: 'line',
            source: this.id_source,
            filter: ['all',
                ['==', ["geometry-type"], "LineString"],
                ['==', ['get', 'schema'], "lnglat"],
                ['==', ['get', 'type'], 'lng']]
        });

        map.addLayer({
            id: this.id_layer_lat_line,
            type: 'line',
            source: this.id_source,
            filter: ['all',
                ['==', ["geometry-type"], "LineString"],
                ['==', ['get', 'schema'], "lnglat"],
                ['==', ['get', 'type'], 'lat']]
        });

        map.addLayer({
            id: this.id_layer_lng_symbol,
            type: 'symbol',
            source: this.id_source,
            filter: ["all",
                ['==', ["geometry-type"], 'LineString'],
                ['==', ['get', 'schema'], 'lnglat'],
                ['==', ['get', 'type'], 'lng']
            ],
            layout: {
                "text-field": ['get', 'value'],
                "symbol-placement": 'line-center',
                "symbol-spacing": 1,
            },
            paint: {
                "text-halo-color": 'white',
                'text-halo-width': 4
            }
        });

        map.addLayer({
            id: this.id_layer_lat_symbol,
            type: 'symbol',
            source: this.id_source,
            filter: ["all",
                ['==', ["geometry-type"], 'LineString'],
                ['==', ['get', 'schema'], 'lnglat'],
                ['==', ['get', 'type'], 'lat']
            ],
            layout: {
                "text-field": ['get', 'value'],
                "symbol-placement": 'line-center',
                "symbol-spacing": 1,
            },
            paint: {
                "text-halo-color": 'white',
                'text-halo-width': 4,
            }
        });

        map.addLayer({
            id: this.id_layer_tile_line_vec,
            type: 'line',
            source: this.id_source,
            filter: ["all",
                ['==', ["geometry-type"], 'LineString'],
                ['!=', ['get', 'schema'], 'lnglat'],
                ['==', ['get', 'type'], 'vec']
            ]
        });

        map.addLayer({
            id: this.id_layer_tile_line_hor,
            type: 'line',
            source: this.id_source,
            filter: ['all',
                ['==', ["geometry-type", 'LineString']],
                ['!=', ['get', 'schema'], 'lnglat'],
                ['==', ['get', 'type'], 'hor']
            ]
        });

        map.addLayer({
            id: this.id_layer_tile_symbol,
            type: 'line',
            source: this.id_source,
            filter: ['all',
                ['==', ["geometry-type", 'Point']],
                ['!=', ['get', 'schema'], 'lnglat']
            ]
        })
    }

    private updateDataSource(map: mapboxgl.Map, features: Array<GeoJSON.Feature>) {
        (map.getSource(this.id_source) as mapboxgl.GeoJSONSource)
            .setData({
                type: 'FeatureCollection',
                features
            });
    }
}