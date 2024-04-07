import { dom } from "wheater";
import { MapControl, MapControlOptions, createModal } from "@mlb-controls/common";
import { IMarkerControlLanguage } from "./lang";

import "@mlb-controls/common/dist/style.css";

export class MarkerControlOptions extends MapControlOptions<IMarkerControlLanguage> {

}

export class MarkerControl extends MapControl<IMarkerControlLanguage> {
    /**
     *
     */
    constructor(options: MarkerControlOptions) {
        super(options, {});
    }

    createElement(map: mapboxgl.Map): HTMLElement {
        return dom.createHtmlElement('div', ["mapboxgl-ctrl"], ["123"], {
            onClick: () => {
                createModal({
                    content: "测试"
                })
            }
        })
    }

    removeControl(map: mapboxgl.Map): void {
    }

    getDefaultPosition?: () => string;
}