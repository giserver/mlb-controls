import { dom } from "wheater";
import { createConfirmModal } from "@mlb-controls/common";
import { MarkerManager } from "./manager";
import { createFeaturePropertiesEditModal } from './modal';
import { IMarkerControlLanguage } from "./lang";



const svg_eye = `<svg width="18" height="18" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9833">
<path d="M512 832c-213.888 0-384.512-106.688-512-320 129.408-213.312 300.032-320 512-320 211.968 0 382.592 106.688 512 320-127.488 213.312-298.112 320-512 320z m0-64a256 256 0 1 0 0-512 256 256 0 0 0 0 512z m0-128a128 128 0 1 0 0-256 128 128 0 0 0 0 256z" fill="#1b1b1f" p-id="9834">
</path></svg>`;
const svg_un_eye = `<svg width="18" height="18" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9622">
<path d="M93.866667 322.773333a8.533333 8.533333 0 0 1 6.613333 3.114667c5.589333 6.848 10.261333 12.373333 14.058667 16.64 97.664 109.056 239.552 177.706667 397.482666 177.706667 162.752 0 308.48-72.917333 406.314667-187.84 1.493333-1.792 3.242667-3.882667 5.184-6.272a8.533333 8.533333 0 0 1 15.146667 5.376v9.813333l0.021333 8.32v51.754667a8.533333 8.533333 0 0 1-2.517333 6.037333 599.893333 599.893333 0 0 1-99.584 81.002667l82.474666 98.261333a8.533333 8.533333 0 0 1-1.066666 12.010667l-35.946667 30.165333a8.533333 8.533333 0 0 1-12.010667-1.045333l-89.813333-107.050667a593.045333 593.045333 0 0 1-145.450667 50.837333l44.074667 121.024a8.533333 8.533333 0 0 1-5.098667 10.944l-44.096 16.042667a8.533333 8.533333 0 0 1-10.944-5.098667l-48.448-133.098666a604.586667 604.586667 0 0 1-130.88-1.557334L390.4 714.517333a8.533333 8.533333 0 0 1-10.944 5.12l-44.096-16.064a8.533333 8.533333 0 0 1-5.12-10.944l45.184-124.096a593.066667 593.066667 0 0 1-131.584-47.744l-89.813333 107.029334a8.533333 8.533333 0 0 1-12.032 1.066666L106.026667 598.677333a8.533333 8.533333 0 0 1-1.066667-12.010666l82.474667-98.261334a599.872 599.872 0 0 1-80.981334-62.976c-4.352-4.032-10.56-10.026667-18.602666-18.005333A8.533333 8.533333 0 0 1 85.333333 401.386667v-70.101334c0-4.693333 3.84-8.533333 8.533334-8.533333z" fill="#1b1b1f" p-id="9623">
</path></svg>`;
const svg_edit = `<svg width="16" height="16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4478">
<path d="M98 607.49v132.16h130.42l391.27-396.46-130.42-132.15L98 607.49z m619.5-429.5l-65.21-66.07c-18-18.24-47.2-18.24-65.2 0l-32.6 33.04 130.42 132.15 32.61-33.05c8.65-8.76 13.5-20.65 13.5-33.04-0.01-12.38-4.87-24.27-13.52-33.03zM98 833.1h830v93.44H98V833.1z m0 0" p-id="4479" fill="#1b1b1f"></path></svg>`
const svg_export = `<svg width="16" height="16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6248">
<path d="M812.4672 301.0368L620.672 492.8192 531.1808 403.328l191.7824-191.7888-83.104-83.104-63.936-63.9296h383.5776v383.5712l-63.9296-63.9296-83.104-83.104z m-83.1104-172.608h166.2144v166.208-166.208h-166.208z m-536.9984 63.9296v639.2832h639.2832V448.0704l127.8592 127.8592v383.5712H64.4992V64.4992h383.5712L575.936 192.3584H192.3584z" fill="#1b1b1f" p-id="6249">
</path>
</svg>`;
const svg_import = `<svg width="16" height="16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4561"><path d="M947.26 577.96a54.296 54.296 0 0 0-54.296 54.288v230.376c0 0.504-0.56 1.208-1.608 1.208H110.5c-1.056 0-1.616-0.704-1.616-1.208V161.376c0-0.512 0.56-1.208 1.616-1.208h191.4a54.288 54.288 0 1 0 0-108.568H110.5C49.74 51.6 0.316 100.84 0.316 161.384v701.248c0 60.528 49.424 109.792 110.184 109.792h780.856c60.752 0 110.184-49.256 110.184-109.792V632.248a54.288 54.288 0 0 0-54.28-54.288z" fill="#1b1b1f" p-id="4562">
</path><path d="M1023.356 100.008a54.24 54.24 0 0 0-59.84-48.104c-5.344 0.592-132.504 15.096-267.216 89.432-141.632 78.16-238.824 193.08-286.072 336.552L350.692 305.76a54.28 54.28 0 1 0-102.592 35.496l106.752 308.616a54.312 54.312 0 0 0 69.088 33.552l0.632-0.224 309.424-111.584a54.296 54.296 0 0 0-36.832-102.144l-191.896 69.2c34.664-129.656 115.224-230.552 240.392-300.552 115.944-64.848 228.584-78.16 229.72-78.288a54.272 54.272 0 0 0 47.976-59.824z" fill="#1b1b1f" p-id="4563">
</path></svg>`;
const svg_delete = `<svg width="16" height="16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5516">
<path d="M143.789419 129.497462H871.060645c40.112172 0 72.825118 32.723957 72.825118 72.814108v128.660645a9.733505 9.733505 0 0 1-9.711483 9.711484H80.675785a9.733505 9.733505 0 0 1-9.711484-9.711484V202.31157c0-40.090151 32.712946-72.814108 72.825118-72.814108z m-13.356043 241.65299h753.972301c13.367054 0 24.27871 10.900645 24.27871 24.267699v546.584774c0 40.112172-32.712946 72.825118-72.825118 72.825118H178.990796c-40.112172 0-72.825118-32.712946-72.825119-72.825118V395.418151c0-13.367054 10.900645-24.267699 24.267699-24.267699zM404.744258 0h205.350538c24.13557 0 38.17428 7.31114 46.498408 32.316559 6.144 18.454022 7.960774 42.061075 11.374108 63.796301a9.733505 9.733505 0 0 1-9.601377 11.208946H356.484129a9.722495 9.722495 0 0 1-9.590366-11.208946c3.391312-21.735226 5.219097-45.34228 11.363097-63.796301C366.580989 7.31114 380.619699 0 404.744258 0z m65.723183 475.025892v439.978667c0 47.269161 73.915183 47.269161 73.915183 0V475.025892c0-58.180817-73.915183-58.180817-73.915183 0z m209.215312 0.033033v439.956645c0 47.346237 75.676903 48.227097 75.676903-0.011011V475.025892c0-59.722323-75.676903-59.722323-75.676903 0.033033z m-344.526452 0c0-59.755355-75.665892-59.755355-75.676903-0.033033v439.978667c0 48.238108 75.676903 47.357247 75.676903 0.011011V475.058925z" fill="#1b1b1f" p-id="5517">
</path></svg>`

export class LayerCatalog {

    readonly element: HTMLElement

    /**
     *
     */
    constructor(
        id: string,
        ctx: MarkerManager,
        lang: IMarkerControlLanguage) {
        const layer = ctx.getLayer(id);

        this.element = dom.createHtmlElement('div', [
            "mlb-ctrl-marker-layer", "visible"
        ], [
            dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header"], [
                dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-prefix"], [
                    dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-prefix-collapse"]),
                    dom.createHtmlElement('div', [], [layer.name])
                ]),
                dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix"], [
                    dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix-item"], [], {
                        onInit: e => e.innerHTML = svg_edit
                    }),
                    dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix-item"], [], {
                        onInit: e => e.innerHTML = svg_export
                    }),
                    dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix-item"], [], {
                        onInit: e => e.innerHTML = svg_import
                    }),
                    dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix-item"], [], {
                        onInit: e => e.innerHTML = svg_delete,
                        onClick: () => createConfirmModal({
                            title: lang.deleteItem,
                            content: layer.name,
                            onConfirm: () => {
                                ctx.removeLayer(layer.id);
                                this.element.remove();
                            }
                        })
                    })
                ], {
                    onClick: e => e.stopPropagation()
                }),
                dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix-item"], [
                    dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-visible"], [], {
                        onInit: e => e.innerHTML = svg_eye
                    }),
                    dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-hidden"], [], {
                        onInit: e => e.innerHTML = svg_un_eye
                    })
                ], {
                    onClick: (e) => {
                        const toVisible = !this.element.classList.contains("visible");
                        ctx.setVisibleByLayer(layer.id, toVisible);
                        this.element.classList.toggle("visible");

                        e.stopPropagation();
                    }
                })
            ], {
                onClick: () => this.element.classList.toggle("active")
            }),
            dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-content"], ctx.getFeaturesByLayerId(id).map(f => {
                const title = dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-content-item-name"], [f.properties.name], {
                    onInit: e => {
                        e.title = f.properties.name;
                    }
                });
                const ui_marker_item = dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-content-item"], [
                    dom.createHtmlElement("div", ["mlb-ctrl-marker-layer-content-item-prefix"], [
                        dom.createHtmlElement('div', [], []),
                        title
                    ]),
                    dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-content-item-suffix"], [
                        dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix-item"], [], {
                            onInit: e => e.innerHTML = svg_edit,
                            onClick: () => {
                                createFeaturePropertiesEditModal(f, {
                                    mode: 'update',
                                    lang,
                                    layers: ctx.getLayers(),
                                    onPropChange: () => ctx.reRender(),
                                    onConfirm: () => {
                                        title.innerText = f.properties.name;
                                        title.title = f.properties.name;
                                    }
                                });
                            }
                        }),
                        dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix-item"], [], {
                            onInit: e => e.innerHTML = svg_export
                        }),
                        dom.createHtmlElement('div', ["mlb-ctrl-marker-layer-header-suffix-item"], [], {
                            onInit: e => e.innerHTML = svg_delete,
                            onClick: () => createConfirmModal({
                                title: lang.deleteItem,
                                content: f.properties.name,
                                onConfirm: () => {
                                    ctx.removeFeature(f.properties.id);
                                    ui_marker_item.remove();
                                }
                            })
                        })
                    ])
                ], {
                    onClick: () => ctx.fitTo(f.properties.id)
                })

                return ui_marker_item;
            }))
        ])
    }
}