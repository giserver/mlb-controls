import { DrawBase, DrawType } from './drawBase';
import { DrawPoint, DrawPointOptions } from './drawPoint';
import { DrawLineString, DrawLineStringOptions } from './drawLineString';
import { DrawPolygon, DrawPolygonOptions } from "./drawPolygon";

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
        this.currentDraw!.start();

        this.options.onStart?.();
    }

    stop() {
        this.currentDraw?.stop();
        this.currentType = undefined;

        this.options.onStop?.();
    }

    clear() {
        this.draws.forEach(draw => draw.clear());

        this.options.onClear?.();
    }
}