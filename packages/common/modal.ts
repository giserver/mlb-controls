import { dom } from "wheater";
import { ILanguage } from "./mapControl";

/**
 * 使dom可以拖拽
 * @param drag 被拖拽的dom
 * @param handle 鼠标操控的dom
 */
export function makeDomDraggable(dom: HTMLElement, handle?: HTMLElement) {
    let initX = 0;
    let initY = 0;
    let isDrag = false;
    let top = getCss(dom, 'top')
    let left = getCss(dom, 'left')

    handle ??= dom;

    handle.style.cursor = "move";
    handle.addEventListener('mousedown', e => {
        isDrag = true;
        initX = e.clientX;
        initY = e.clientY;
    })

    document.addEventListener('mousemove', e => {
        if (isDrag) {
            const nowY = e.clientY - initY + top;
            const nowX = e.clientX - initX + left;
            dom.style.top = nowY + 'px'
            dom.style.left = nowX + 'px'
        }
    })

    document.addEventListener('mouseup', e => {
        isDrag = false;
        top = getCss(dom, 'top');
        left = getCss(dom, 'left');
    })

    function getCss(ele: HTMLElement, prop: any) {
        return parseInt(ele.style[prop].split('px')[0])
    }
}

export interface ModalOptions {
    content: HTMLElement | string,
    title?: string,
    onCancel?(): void,
}

/**
 * 创建modal
 * @param options 
 * @returns 
 */
export function createModal(options: ModalOptions): [HTMLElement, () => void] {
    const header = dom.createHtmlElement('div', ['mlb-ctrl-modal-header'], [
        dom.createHtmlElement('div', ['mlb-ctrl-modal-header-title'], [options.title ?? '']),
        dom.createHtmlElement('div', [], [], {
            onInit: e => {
                e.innerHTML = `<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2620" >
                <path d="M572.16 512l183.466667-183.04a42.666667 42.666667 0 1 0-60.586667-60.586667L512 451.84l-183.04-183.466667a42.666667 42.666667 0 0 0-60.586667 60.586667l183.466667 183.04-183.466667 183.04a42.666667 42.666667 0 0 0 0 60.586667 42.666667 42.666667 0 0 0 60.586667 0l183.04-183.466667 183.04 183.466667a42.666667 42.666667 0 0 0 60.586667 0 42.666667 42.666667 0 0 0 0-60.586667z" p-id="2621" fill="#8a8a8a">
                </path></svg>`
                e.style.cursor = "pointer";
            },
            onClick: () => {
                options.onCancel?.call(undefined);
                modal.remove();
            }
        })
    ]);


    const container = dom.createHtmlElement('div', ['mlb-ctrl-modal-container'],
        [header, options.content]
    );

    const modal = dom.createHtmlElement('div', ['mlb-ctrl-modal'], [container]);
    document.body.append(modal);

    container.style.top = '0';
    container.style.left = `${(modal.clientWidth - container.clientWidth) / 2}px`;
    makeDomDraggable(container, header)

    const escPress = (e: KeyboardEvent) => {
        if (e.code.toLocaleLowerCase() === 'escape') {
            document.removeEventListener('keydown', escPress);
            options.onCancel?.call(undefined);
            modal.remove();
        }
    }
    document.addEventListener('keydown', escPress);

    const remove = () => {
        modal.remove();
        document.removeEventListener('keydown', escPress);
    }
    return [container, remove];
}

export interface IConfirmModelLanguage extends ILanguage {
    confirm: string
    cancel: string
}

export interface ConfirmModalOptions extends ModalOptions {
    onConfirm?(): void,
    withCancel?: boolean,
    lang?: Partial<IConfirmModelLanguage>
}

/**
 * 创建确认modal
 * @param options
 */
export function createConfirmModal(options: ConfirmModalOptions) {
    const lang = options.lang ?? {};
    lang.cancel ??= "取消";
    lang.confirm ??= "确认";

    options.withCancel ??= true;
    const [container, remove] = createModal(options);

    const confirmBtn = dom.createHtmlElement('button', ['mlb-ctrl-btn', 'mlb-ctrl-btn-confirm']);
    const cancleBtn = dom.createHtmlElement('button', ['mlb-ctrl-btn', 'mlb-ctrl-btn-default']);
    confirmBtn.innerText = lang.confirm;
    cancleBtn.innerText = lang.cancel;

    confirmBtn.addEventListener('click', () => {
        options.onConfirm?.call(undefined);
        remove();
    });
    cancleBtn.addEventListener('click', () => {
        options.onCancel?.call(undefined);
        remove();
    });

    const footDiv = dom.createHtmlElement('div', ['mlb-ctrl-modal-foot'], [confirmBtn]);
    if (options.withCancel)
        footDiv.append(cancleBtn);
    container.append(footDiv);
}