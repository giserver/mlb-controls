import { dom } from "wheater";
import { ExtendManager, ExtendMangerOptions } from "./ExtendManager";
import { TControlPostion } from "@mlb-controls/common";

export class ExtendPCManager extends ExtendManager {

    constructor(options: ExtendMangerOptions & { position: TControlPostion; }) {
        super(options);
    }

    protected createWapper(): HTMLElement {
        const wapper = dom.createHtmlElement('div',
            ["mlb-ctrl-extend-pc-container", ...(this.options as any).position.split('-')],
            [this.options.content]);

        this.options.controller.append(wapper);

        return wapper;
    }
}