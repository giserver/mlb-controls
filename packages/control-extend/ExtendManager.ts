export interface ExtendMangerOptions {
    controller: HTMLElement;
    content: HTMLElement;
    defaultExtended?: boolean;
    onExtendChange?(value: boolean): void;
}

export abstract class ExtendManager {
    private extended = false;
    readonly wapper: HTMLElement;

    constructor(protected options: ExtendMangerOptions) {
        this.wapper = this.createWapper();
        this.wapper.classList.add("mlb-ctrl-extend-wapper");
        this.wapper.addEventListener('click', e => {
            e.stopPropagation();
        })

        options.defaultExtended ??= false;
        this.extended = options.defaultExtended;
        this.extend(this.extended);

        options.controller.addEventListener('click', () => {
            this.extend(!this.extended);
        });
    }

    extend(value: boolean) {
        this.extended = value;
        value ? this.wapper.classList.remove('hidden') : this.wapper.classList.add('hidden');
        this.options.onExtendChange?.(value);
    }

    protected abstract createWapper(): HTMLElement;
}
