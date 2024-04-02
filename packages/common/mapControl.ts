import { ILanguage, resetLanguage } from "./lang";

export abstract class MapControlOptions<TLang extends ILanguage> {
    lang?: Partial<TLang>
}

export abstract class MapControl<TLang extends ILanguage> implements mapboxgl.IControl {
    private declare _element: HTMLElement;
    protected readonly lang: TLang

    get element() {
        return this._element;
    }

    /**
     *
     */
    constructor(options: MapControlOptions<TLang>, defaultLange: TLang) {
        this.lang = defaultLange;
        if (options.lang)
            resetLanguage(this.lang, options.lang);
    }

    abstract createElement(map: mapboxgl.Map): HTMLElement;
    abstract removeControl(map: mapboxgl.Map): void;
    abstract getDefaultPosition?: () => string;

    onAdd(map: mapboxgl.Map): HTMLElement {
        this._element = this.createElement(map);
        return this.element;
    }

    onRemove(map: mapboxgl.Map) {
        this.removeControl(map);
        this._element.remove();
    }
}