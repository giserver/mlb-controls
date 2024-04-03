import { dom } from 'wheater';
import './index.css';
import { Map } from 'mapbox-gl';

export interface ExtendMangerOptions {
    controller: HTMLElement;
    responder: HTMLElement;
    defaultExtended?: boolean;
    onExtendChange?(value: boolean): void;
}

export abstract class ExtendManager {
    private extended = false;

    constructor(protected options: ExtendMangerOptions) {
        this.extended = options.defaultExtended && true;
        this.extend(this.extended);

        options.controller.addEventListener('click', () => {
            this.extended = !this.extended;
            this.extend(this.extended);
        });
    }

    extend(value: boolean) {
        this.extended = value;
        this.onExtend(value);
        this.options.onExtendChange?.(value);
    }

    protected abstract onExtend(value: boolean): void;
}

export class ExtendPCManager extends ExtendManager {

    constructor(options: ExtendMangerOptions) {
        super(options);
    }

    protected onExtend(value: boolean): void {
        value ?
            this.options.responder.classList.remove('hidden') :
            this.options.responder.classList.add("hidden");
    }
}

export class ExtendMobileManager extends ExtendManager {

    constructor(options: ExtendMangerOptions) {
        super(options);
    }

    protected onExtend(value: boolean): void {

    }
}

export class ExtendControl implements mapboxgl.IControl {
    onAdd(map: Map): HTMLElement {
        const container = dom.createHtmlElement('div', [], ["里面的内容"]);
        const element = dom.createHtmlElement('div',
            ["maplibregl-ctrl-group", "maplibregl-ctrl", "mapboxgl-ctrl", "mapboxgl-ctrl-group"], ["extend", container]);

        new ExtendPCManager({
            responder: container,
            controller: element
        })

        return element;
    }
    onRemove(map: Map): void {
    }
    getDefaultPosition?: () => string;

}