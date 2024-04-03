import { deep } from 'wheater';

export interface ILanguage extends Record<string, string> {

}

export function resetLanguage<T extends ILanguage>(value: T, newValue: Partial<T>) {
    deep.setProps(newValue, value, { skipEmpty: true });
}

export function changeLanguage<T extends ILanguage>(value: T, newValue: T) {
    deep.setProps(newValue, value);
}

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