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

    private moveHandler = (e: { target: mapboxgl.Map }) => {
        this.updateLngLatLine(e.target);
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

        map.addLayer({
            id: this.id_source,
            type: 'fill',
            source: this.id_source
        });
        map.addLayer({
            id: this.id_source + "symbol",
            type: 'symbol',
            source: this.id_source,
            layout: {
                "text-field": ['get', 'value'],
                'symbol-placement': 'line'
            }
        })
        map.on('move', this.moveHandler);

        return dom.createHtmlElement('div');
    }
    removeControl(map: mapboxgl.Map): void {
        map.off("move", this.moveHandler);
    }
    getDefaultPosition?: (() => string) | undefined;


    private lngSubdivides = [15, 15, 15, 15, 10, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.1, 0.1, 0.01, 0.01, 0.001];
    private latSubdivides = [15, 15, 15, 15, 10, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.1, 0.1, 0.01, 0.01, 0.001];
    private updateLngLatLine(map: mapboxgl.Map) {
        const { lngMin, latMin, lngMax, latMax } = this.getBoundInfo(map);
        const zoom = Math.floor(map.getZoom());

        const lngSubdivide = this.lngSubdivides[zoom];
        const latSubdivide = this.latSubdivides[zoom];

        const features = new Array<GeoJSON.Feature>();
        for (let i = Math.floor(lngMin * lngSubdivide) / lngSubdivide; i <= lngMax; i += lngSubdivide) {
            features.push({
                type: 'Feature',
                properties: { value: `${i}° ${i > 0 ? 'E' : 'W'}` },
                geometry: {
                    type: 'LineString',
                    coordinates: [[i, -90], [i, 90]]
                }
            })
        }

        for (let i = Math.floor(latMin * latSubdivide) / latSubdivide; i <= latMax; i += latSubdivide) {
            features.push({
                type: 'Feature',
                properties: { value: `${i}° ${i > 0 ? 'N' : 'S'}` },
                geometry: {
                    type: 'LineString',
                    coordinates: [[-180, i], [180, i]]
                }
            })
        }

        this.updateDataSource(map, features);
    }

    private getBoundInfo(map: mapboxgl.Map) {
        const bounds = map.getBounds().toArray();
        return { lngMin: bounds[0][0], latMin: bounds[0][1], lngMax: bounds[1][0], latMax: bounds[1][1] };
    }

    private updateDataSource(map: mapboxgl.Map, features: Array<GeoJSON.Feature>) {
        (map.getSource(this.id_source) as mapboxgl.GeoJSONSource)
            .setData({
                type: 'FeatureCollection',
                features
            });
    }
}