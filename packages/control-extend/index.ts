import { dom, validator } from 'wheater';
import { TControlPostion, TOS } from '@mlb-controls/common';
import { ExtendMobileManager } from './ExtendMobileManager';
import { ExtendPCManager } from './ExtendPCManager';
import { ExtendManager } from './ExtendManager';

import './index.css';

export interface ExtendControlOptions {

    /**
     * 对应组件在地图上显示的位置，必须通过设置此值修改组件位置I（禁止使用map.addControl(xxx, "bottom-left")）
     * 
     * 默认：”top-right“
     * 
     * 该值用于确定弹出组件显示的元素相对于弹出组件按钮的位置
     */
    position?: TControlPostion;

    /**
     * 弹出组件显示的元素
     */
    content: HTMLElement;

    /**
     * 默认是否弹出
     * 
     * 默认：false
     */
    defaultExtended?: boolean;

    /**
     * 弹出变化时回调函数
     * @param value true-弹出  false-关闭
     */
    onExtendChange?(value: boolean): void;

    /**
     * 弹出组件关闭时 按钮显示的图案元素
     */
    icon1?: HTMLElement | SVGElement;

    /**
     * 弹出组件打开时 按钮显示的图案元素
     */
    icon2?: HTMLElement | SVGSVGElement;

    /**
     * 系统类型，pc-普通电脑浏览器  mobile-手机浏览器
     * 
     * 默认：pc
     */
    os?: TOS
}

export class ExtendControl implements mapboxgl.IControl {
    private declare _element: HTMLElement;
    private declare _extendManager: ExtendManager;

    get element() {
        return this._element;
    }

    get manager() {
        return this._extendManager;
    }

    /**
     *
     */
    constructor(private options: ExtendControlOptions) {
        options.position ??= "top-right";

        const direction_left = dom.createHtmlElement('div', [], [], {
            onInit: e => {
                e.innerHTML = `<svg width="16" height="16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8309" ><path d="M193.194667 512L547.072 59.904A10.666667 10.666667 0 0 0 538.709333 42.666667H435.541333a21.589333 21.589333 0 0 0-16.810666 8.106666L78.336 485.717333a42.666667 42.666667 0 0 0 0 52.650667l340.48 434.858667c4.010667 5.12 10.24 8.106667 16.810667 8.106666h102.997333c8.96 0 13.909333-10.24 8.448-17.237333L193.194667 512z m405.333333 0L952.405333 59.904A10.666667 10.666667 0 0 0 944.042667 42.666667H840.874667a21.589333 21.589333 0 0 0-16.810667 8.106666l-340.48 434.944a42.666667 42.666667 0 0 0 0 52.650667l340.48 434.858667c4.010667 5.12 10.24 8.106667 16.810667 8.106666h102.997333c8.96 0 13.909333-10.24 8.448-17.237333L598.528 512z" fill="#000000" p-id="8310"></path></svg>`
            }
        }).querySelector('svg');
        const direction_right = dom.createHtmlElement('div', [], [], {
            onInit: e => {
                e.innerHTML = `<svg width="16" height="16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7329" ><path d="M540.245333 485.717333L199.850667 50.773333A21.162667 21.162667 0 0 0 183.04 42.666667H79.957333A10.666667 10.666667 0 0 0 71.68 59.904L425.472 512 71.594667 964.096a10.666667 10.666667 0 0 0 8.448 17.237333h102.997333c6.570667 0 12.8-3.072 16.810667-8.106666l340.48-434.858667a42.666667 42.666667 0 0 0 0-52.650667z m405.333334 0L605.184 50.773333A21.162667 21.162667 0 0 0 588.373333 42.666667H485.376a10.666667 10.666667 0 0 0-8.448 17.237333L830.805333 512l-353.877333 452.096a10.666667 10.666667 0 0 0 8.362667 17.237333h103.082666c6.570667 0 12.8-3.072 16.810667-8.106666l340.48-434.858667a42.666667 42.666667 0 0 0 0-52.650667z" fill="#000000" p-id="7330"></path></svg>`
            }
        }).querySelector('svg');

        const isRight = options.position.endsWith("right");
        options.icon1 ??= isRight ? direction_left : direction_right;
        options.icon2 ??= isRight ? direction_right : direction_left;

        options.os ??= validator.os.isMobile() ? "mobile" : "pc";
    }

    onAdd(map: mapboxgl.Map): HTMLElement {

        this._element = dom.createHtmlElement('div',
            ["mlb-ctrl-extend", "maplibregl-ctrl-group", "maplibregl-ctrl", "mapboxgl-ctrl", "mapboxgl-ctrl-group"],
            [this.options.icon1!, this.options.icon2]);

        const onExtendChange = (value: boolean) => {
            this.options.onExtendChange?.(value);
            if (value) {
                this.options.icon1!.style.display = "none";
                this.options.icon2!.style.display = "";
            } else {
                this.options.icon1!.style.display = "";
                this.options.icon2!.style.display = "none";
            }
        }

        this._extendManager = this.options.os === 'pc' ?
            new ExtendPCManager({
                position: this.options.position!,
                content: this.options.content,
                controller: this._element,
                defaultExtended: this.options.defaultExtended,
                onExtendChange
            }) :
            new ExtendMobileManager({
                wapperParent: map.getContainer(),
                content: this.options.content,
                controller: this._element,
                defaultExtended: this.options.defaultExtended,
                onExtendChange
            });

        return this._element;
    }

    onRemove(map: mapboxgl.Map): void {
        this._extendManager.wapper.remove();
        this._element.remove();
    }

    getDefaultPosition() {
        return this.options.position!;
    }
}