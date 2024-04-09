import './index.css';
import { dom } from 'wheater';
import { MapControl, MapControlOptions } from '@mlb-controls/common';
import { IDoodleContorlLanguage } from './lang';
import { Doodle, DoodleOptions } from './doodle';
import { Map } from 'mapbox-gl';


export interface DoodleControlOptions extends DoodleOptions, MapControlOptions<IDoodleContorlLanguage> {
    svg?: string;

    /**
     * 清空当前绘制回调
     */
    onClear?(): void;

    /**
     * 退出绘制
     */
    onExit?(): void;
}

export class DoodleControl extends MapControl<IDoodleContorlLanguage> {

    private drawing = false;
    private declare doodle: Doodle;
    declare stop: () => void;

    /**
     *
     */
    constructor(private options: DoodleControlOptions = {}) {
        super(options, {
            name: "画笔",
            re_draw: "重绘",
            exit: "退出"
        });

        options.svg ??= `<svg  width="20" height="20" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2828">
        <path d="M745.76 369.86l-451 537.48a18.693 18.693 0 0 1-8.46 5.74l-136.58 45.27c-13.24 4.39-26.46-6.71-24.43-20.5l20.86-142.36c0.5-3.44 1.95-6.67 4.19-9.33l451-537.48c6.65-7.93 18.47-8.96 26.4-2.31l115.71 97.1c7.92 6.64 8.96 18.46 2.31 26.39zM894.53 192.56l-65.9 78.53c-6.65 7.93-18.47 8.96-26.4 2.31l-115.71-97.1c-7.93-6.65-8.96-18.47-2.31-26.4l65.9-78.53c6.65-7.93 18.47-8.96 26.4-2.31l115.71 97.1c7.93 6.65 8.96 18.47 2.31 26.4z" fill="#6C6D6E" p-id="2829">
        </path></svg>`;
    }

    createElement(map: Map): HTMLElement {
        this.doodle = new Doodle(map, this.options);
        const doodle = this.doodle;

        const doodle_re_draw = dom.createHtmlElement('div',
            ["flex-center", "mapboxgl-ctrl-group", "maplibregl-ctrl-group"],
            [this.lang.re_draw], {
            onInit: e => {
                e.style.display = 'none';
            },
            onClick: () => {
                if (doodle.drawing) return;
                doodle_re_draw.style.display = 'none';
                doodle.clear();
                doodle.start()
                this.options.onClear?.call(this);
            }
        });

        const onStart = this.options.onStart;
        this.options.onStart = () => {
            onStart?.();
            doodle_re_draw.style.display = 'flex';
        }

        const doodle_switch_svg = dom.createHtmlElement('div',
            ["mlb-ctrl-doodle-switch-svg"],
            [], {
            onInit: e => {
                e.innerHTML = this.options.svg!
            }
        });

        const doodle_switch_span = dom.createHtmlElement('span', [], [this.lang.name]);

        const doodle_switch_div = dom.createHtmlElement('div',
            ["flex-center", "mlb-ctrl-doodle-switch", "mapboxgl-ctrl-group", "maplibregl-ctrl-group"],
            [
                doodle_switch_svg,
                doodle_switch_span
            ], {
            onClick: () => {
                // 当前正在绘制 退出绘制
                if (this.drawing) {
                    this.stop();
                } else { // 开始绘制
                    doodle_switch_svg.style.display = 'none';
                    doodle_switch_span.innerText = this.lang.exit;

                    doodle.start()
                    this.drawing = true;
                }
            }
        });

        this.stop = () => {
            this.drawing = false;
            doodle_switch_svg.style.display = '';
            doodle_re_draw.style.display = 'none';
            doodle_switch_span.innerText = `${this.lang.name}`;

            doodle.clear();
            doodle.stop();

            this.options.onClear?.call(this);
            this.options.onExit?.call(this);
        }

        return dom.createHtmlElement('div',
            ["mlb-ctrl-doodle", "maplibregl-ctrl", "mapboxgl-ctrl"],
            [doodle_re_draw, doodle_switch_div]);
    }

    removeControl(map: Map): void {
        this.doodle.destory();
    }

    getDefaultPosition?: (() => string) | undefined;
}