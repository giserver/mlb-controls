import { dom } from "wheater";
import { ExtendManager, ExtendMangerOptions } from "./ExtendManager";

export class ExtendMobileManager extends ExtendManager {

    constructor(options: ExtendMangerOptions & { wapperParent: HTMLElement }) {
        super(options);
    }

    protected createWapper(): HTMLElement {

        const wapper = dom.createHtmlElement('div',
            ["mlb-ctrl-extend-mobile-container"],
            [this.options.content]
        );

        (this.options as any).wapperParent.append(wapper);

        return wapper;
    }
}