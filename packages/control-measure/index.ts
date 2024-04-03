import { MapControl, MapControlOptions } from '@mlb-controls/common';

import { IMeasureControlLanguage } from "./lang";
import { MeasureManager, MeasureManagerOptions } from "./manager";
import { dom } from 'wheater';

export interface MeasureControlOptions extends MapControlOptions<IMeasureControlLanguage>, MeasureManagerOptions {

}

export class MeasureControl extends MapControl<IMeasureControlLanguage> {

    private _manager: MeasureManager

    get manager() {
        return this._manager;
    }

    /**
     *
     */
    constructor(private options: MeasureControlOptions) {
        super(options, {
            ending: "终点",
            MM: "毫米",
            CM: "厘米",
            M: "米",
            KM: "千米",
            M2: "平方米",
            KM2: "平方千米",
            MU: "亩"
        });
    }

    createElement(map: mapboxgl.Map): HTMLElement {
        this._manager = new MeasureManager(map, this.options, this.lang);
        this._manager.start('Polygon');
        return dom.createHtmlElement('div');
    }

    removeControl(map: mapboxgl.Map): void {

    }

    getDefaultPosition?: () => string;
}