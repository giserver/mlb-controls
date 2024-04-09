import { dom } from 'wheater';

import { ILanguage, MapControl, MapControlOptions } from "@mlb-controls/common";

import './index.css';

interface ILocationContorlLanguage extends ILanguage {
    coordinate: string;
    pitch: string;
    bearing: string,
    zoom: string
}

export interface LocationControlOptions extends MapControlOptions<ILocationContorlLanguage> {
    precision?: {
        lngLat?: number,
        pitch?: number,
        bearing?: number,
        zoom?: number
    };

    description?: string
}

export class LocationControl extends MapControl<ILocationContorlLanguage>{
    private declare mousemoveHandler: (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => void;
    private declare moveHandler: () => void;

    constructor(private options: LocationControlOptions = {}) {
        super(options, {
            coordinate: "坐标",
            pitch: "倾角",
            bearing: "方位角",
            zoom: "层级"
        });

        options.precision ??= {};
        options.precision.lngLat ??= 6;
        options.precision.bearing ??= 2;
        options.precision.pitch ??= 2;
        options.precision.zoom ??= 2;

        options.description ??= "点击复制";
    }

    createElement(map: mapboxgl.Map): HTMLElement {

        const onClick = (_: any, e: HTMLDivElement) => {
            dom.copyToClipboard(e.innerHTML.split(':')[1].trim());
        }

        const elementLngLat = dom.createHtmlElement('div', [], [this.lang.coordinate], {
            onClick
        });
        const elementPitch = dom.createHtmlElement('div', [], [this.lang.pitch + ": " + map.getPitch().toFixed(this.options.precision!.pitch)], {
            onClick
        });
        const elementZoom = dom.createHtmlElement('div', [], [this.lang.zoom + ": " + map.getZoom().toFixed(this.options.precision!.zoom)], {
            onClick
        });
        const elementHeading = dom.createHtmlElement('div', [], [this.lang.bearing + ": " + map.getBearing().toFixed(this.options.precision!.bearing)], {
            onClick
        });

        this.mousemoveHandler = (e) => {
            elementLngLat.innerText = this.lang.coordinate + `: ${e.lngLat.lng.toFixed(this.options.precision!.lngLat)} , ${e.lngLat.lat.toFixed(this.options.precision!.lngLat)}`;
        };
        this.moveHandler = () => {
            elementPitch.innerText = this.lang.pitch + ": " + map.getPitch().toFixed(this.options.precision!.pitch);
            elementZoom.innerText = this.lang.zoom + ": " + map.getZoom().toFixed(this.options.precision!.zoom);
            elementHeading.innerText = this.lang.bearing + ": " + map.getBearing().toFixed(this.options.precision!.bearing);
        }

        map.on('mousemove', this.mousemoveHandler);
        map.on('move', this.moveHandler);

        return dom.createHtmlElement('div',
            ["mlb-ctrl-location", "mapboxgl-ctrl", "maplibregl-ctrl"],
            [elementLngLat, elementPitch, elementHeading, elementZoom], {
            onInit: e => {
                e.title = this.options.description ?? ""
            }
        });
    }
    removeControl(map: mapboxgl.Map): void {
        map.off('mousemove', this.mousemoveHandler);
        map.off('move', this.moveHandler);
    }

    getDefaultPosition = () => {
        return "bottom-right";
    };
}
