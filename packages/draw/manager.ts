import { DrawBase, DrawType } from './drawBase';
import { DrawPoint, DrawPointOptions } from './drawPoint';
import { DrawLineString, DrawLineStringOptions } from './drawLineString';
import { DrawPolygon, DrawPolygonOptions } from "./drawPolygon";

export interface DrawerTypeMap {
    "Point": {
        options: DrawPointOptions,
        drawer: DrawPoint
    },
    "LineString": {
        options: DrawLineStringOptions,
        drawer: DrawLineString
    },
    "Polygon": {
        options: DrawPolygonOptions,
        drawer: DrawPolygon
    }
}

export function createDrawer<K extends keyof DrawerTypeMap>(map: mapboxgl.Map, type: K, options: DrawerTypeMap[K]['options']): DrawerTypeMap[K]['drawer'] {
    if (type === 'Point') return new DrawPoint(map, options);
    if (type === 'LineString') return new DrawLineString(map, options);
    if (type === 'Polygon') return new DrawPolygon(map, options);

    throw Error(`can create type : ${type}`);
}

export class DrawerManager {
    private draws: Array<DrawBase>;
    private currentType?: DrawType;

    /**
     *
     */
    constructor(map: mapboxgl.Map, private options: {
        point?: DrawPointOptions,
        lineString?: DrawLineStringOptions,
        polygon?: DrawPolygonOptions,
        onStart?(): void,
        onStop?(): void,
        onClear?(): void
    } = {}) {
        this.draws = [
            new DrawPoint(map, options.point),
            new DrawLineString(map, options.lineString),
            new DrawPolygon(map, options.polygon),
        ]
    }

    get currentDraw() {
        return this.draws.find(x => x.type === this.currentType);
    }

    start(type: DrawType) {
        this.stop();
        this.currentType = type;
        this.options.onStart?.();
        this.currentDraw!.start();
    }

    stop() {
        this.currentDraw?.stop();
        this.options.onStop?.();
        this.currentType = undefined;
    }

    clear() {
        this.draws.forEach(draw => draw.clear());
        this.options.onClear?.();
    }
}