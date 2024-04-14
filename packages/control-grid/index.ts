import { creator, dom } from 'wheater';
import { MapControl, MapControlOptions, TileTranslate } from "@mlb-controls/common";
import { IGridControlLanguage } from "./lang";
import mapboxgl from 'mapbox-gl';

type TGridType = "lnglat" | "tile";

export interface GridControlOptions extends MapControlOptions<IGridControlLanguage> {
    defaultShow?: TGridType
    lnglat?: {

    },
    tile?: {
        schema?: "xyz",
        textBuilder?(zoom: number, xTile: number, yTile: number): string
    }
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

    declare changeType: (type: TGridType) => void;

    private lastZoom = -1;
    private moveHandler = (e: { target: mapboxgl.Map }) => {

        if (this.options.defaultShow === 'lnglat')
            this.updateLngLatGrid(e.target);
        else if (this.options.defaultShow === 'tile')
            this.updateTileGrid(e.target);

        this.lastZoom = e.target.getZoom();
    }

    /**
     *
     */
    constructor(private options: GridControlOptions = {
        defaultShow: 'lnglat',
        lnglat: {

        },
        tile: {
            schema: 'xyz',
            textBuilder: (zoom, xTile, yTile) => `${zoom} / ${xTile} / ${yTile}`
        }
    }) {
        super(options, {});
    }

    createElement(map: mapboxgl.Map): HTMLElement {
        map.addSource(this.id_source, { type: 'geojson', data: { type: "FeatureCollection", features: [] } });
        this.addLayers(map);

        this.changeType = (type) => {
            this.options.defaultShow = type;

            if (this.options.defaultShow === 'lnglat')
                this.updateLngLatGrid(map);
            else
                this.updateTileGrid(map);
        }

        this.changeType(this.options.defaultShow!);

        map.on('move', this.moveHandler);
        return dom.createHtmlElement('div');
    }
    removeControl(map: mapboxgl.Map): void {
        map.off("move", this.moveHandler);
    }
    getDefaultPosition?: (() => string) | undefined;

    private updateLngLatGrid(map: mapboxgl.Map) {
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

    private updateTileGrid(map: mapboxgl.Map) {
        const { lngMin, latMin, lngMax, latMax } = this.getBoundInfo(map);
        const zoom = Math.floor(map.getZoom());

        const minTile = TileTranslate.Google.lnglat2tile(zoom, lngMin, latMax);
        const maxTile = TileTranslate.Google.lnglat2tile(zoom, lngMax, latMin);

        const min_tile_x = minTile[0] > 1 ? minTile[0] - 1 : minTile[0];
        const min_tile_y = minTile[1] > 1 ? minTile[1] - 1 : minTile[1];
        const max_tile_x = maxTile[0] + 1;
        const max_tile_y = maxTile[1] + 1;

        const features = new Array<GeoJSON.Feature>();

        for (let i = min_tile_x; i <= max_tile_x; i++) {
            // 添加竖线
            const coordinate1 = TileTranslate.Google.tile2lnglat(zoom, i, min_tile_y);
            const coordinate2 = TileTranslate.Google.tile2lnglat(zoom, i, max_tile_y);
            features.push({
                type: 'Feature',
                properties: {
                    schema: "tile",
                    type: 'vec',
                },
                geometry: {
                    type: 'LineString',
                    coordinates: [coordinate1, coordinate2]
                }
            });

            for (let j = min_tile_y; j <= max_tile_y; j++) {
                // 添加横线
                if (i === minTile[0]) {
                    const coordinate3 = TileTranslate.Google.tile2lnglat(zoom, min_tile_x, j);
                    const coordinate4 = TileTranslate.Google.tile2lnglat(zoom, max_tile_x, j);

                    features.push({
                        type: 'Feature',
                        properties: {
                            schema: "tile",
                            type: 'hor',
                        },
                        geometry: {
                            type: 'LineString',
                            coordinates: [coordinate3, coordinate4]
                        }
                    });
                }

                const coord_leftTop = TileTranslate.Google.tile2lnglat(zoom, i, j);
                const coord_rightBottom = TileTranslate.Google.tile2lnglat(zoom, i + 1, j + 1);

                //添加tile数据号码
                features.push({
                    type: 'Feature',
                    properties: {
                        schema: "tile",
                        value: this.options.tile!.textBuilder!(zoom, i, j)
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [(coord_leftTop[0] + coord_rightBottom[0]) / 2, (coord_leftTop[1] + coord_rightBottom[1]) / 2]
                    }
                });
            }
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
                ['==', ['get', 'schema'], 'tile'],
                ['==', ['get', 'type'], 'vec']
            ]
        });

        map.addLayer({
            id: this.id_layer_tile_line_hor,
            type: 'line',
            source: this.id_source,
            filter: ['all',
                ['==', ["geometry-type"], 'LineString'],
                ['==', ['get', 'schema'], 'tile'],
                ['==', ['get', 'type'], 'hor']
            ]
        });

        map.addLayer({
            id: this.id_layer_tile_symbol,
            type: 'symbol',
            source: this.id_source,
            filter: ['all',
                ['==', ["geometry-type"], 'Point'],
                ['==', ['get', 'schema'], 'tile']
            ],
            layout: {
                "text-field": ['get', 'value']
            }
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