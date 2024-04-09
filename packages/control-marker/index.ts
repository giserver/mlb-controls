import { dom } from "wheater";
import { MapControl, MapControlOptions, createModal } from "@mlb-controls/common";
import { ExtendControl, ExtendControlOptions } from "@mlb-controls/extend";
import { IMarkerControlLanguage } from "./lang";

import "./index.css"
import "@mlb-controls/common/dist/style.css";
import "@mlb-controls/extend/dist/style.css";

export interface MarkerControlOptions extends MapControlOptions<IMarkerControlLanguage>, Omit<Omit<ExtendControlOptions, "os">, "content"> {
}

export class MarkerControl extends MapControl<IMarkerControlLanguage> {
    private extendControl: ExtendControl;
    private markerContent: HTMLDivElement;

    /**
     *
     */
    constructor(private options: MarkerControlOptions) {
        super(options, {});

        this.options.icon1 ??= dom.createHtmlElement('div', [], [], {
            onInit: e => {
                e.innerHTML = `<svg width="20" height="20" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4066" >
                <path d="M256 544V768h64v128H128v-128h64V128h64v32c81.152 42.688 178.56 42.688 292.224 0 113.728-42.688 229.632-42.688 347.776 0v384c-134.208-42.688-250.048-42.688-347.52 0-97.408 42.688-194.944 42.688-292.48 0z" p-id="4067">
                </path>
            </svg>`
            }
        }).querySelector('svg');

        this.markerContent = dom.createHtmlElement("div", ["mlb-ctrl-marker"],[]);
        this.extendControl = new ExtendControl({
            ...this.options,
            content: this.markerContent,
            os: "pc"
        });
    }

    createElement(map: mapboxgl.Map): HTMLElement {
        this.extendControl.onAdd(map);
        return this.extendControl.element;
    }

    removeControl(map: mapboxgl.Map): void {
        this.extendControl.onRemove(map);
    }

    getDefaultPosition = () => {
        return this.extendControl.getDefaultPosition();
    };
}