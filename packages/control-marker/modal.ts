import { deep, dom } from 'wheater';
import { ConfirmModalOptions, createConfirmModal } from '@mlb-controls/common';
import { getMapMarkerSpriteImages } from './symbol-icon';
import { MarkerLayerProperties, TMarkerFeature } from './types';
import { IMarkerControlLanguage } from './lang';

type EditMode = "update" | "create";

function makeCIBEFunc(onPropChange?: <T>(v: T) => void) {
    return function createInputBindingElement<T>(v: T, k: keyof T, config?: (element: HTMLInputElement) => void) {
        const input = dom.createHtmlElement('input', ['mlb-input']);
        input.value = (v as any)[k] as string;
        config?.call(undefined, input);
        input.classList.add(input.type);

        input.addEventListener('change', e => {
            const value = (e.target as any).value;
            if (input.type === 'number') {
                const n = Number.parseFloat(value);

                // 超出限定 数据还原不执行更新操作
                if (n > Number.parseFloat(input.max) || n < Number.parseFloat(input.min)) {
                    input.value = (v as any)[k] as string;
                    return;
                }
                v[k] = n as any;
            } else
                v[k] = value;

            onPropChange?.call(undefined, v);
        });

        return input;
    }
}

function makeColorInputFunc(onPropChange?: <T>(v: T) => void) {
    const cinFunc = makeCIBEFunc(onPropChange);
    return function createColorInputBindingElement<T>(v: T, k: keyof T) {
        const container = dom.createHtmlElement('div', ['mlb-custom-color-picker']);
        const h5ColorInput = cinFunc(v, k, element => {
            element.type = "color"
        });

        const presetColors = dom.createHtmlElement('div', ['mlb-flex-center'])
        presetColors.append(...['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#000000'].map(color => {
            const item = dom.createHtmlElement('div', ['mlb-custom-color-item']);
            item.style.backgroundColor = color;

            item.addEventListener('click', () => {
                v[k] = color as any;
                h5ColorInput.value = color;
                onPropChange?.call(undefined, v);
            });

            return item;
        }));

        container.append(presetColors, h5ColorInput);
        return container;
    }
}

export function createFeaturePropertiesEditModal(
    feature: TMarkerFeature,
    options: Omit<Omit<Omit<ConfirmModalOptions, 'content'>, 'withCancel'>, 'title'> & {
        mode: EditMode,
        layers: MarkerLayerProperties[],
        onPropChange?(): void,
        lang: IMarkerControlLanguage
    }) {

    const createInputBindingElement = makeCIBEFunc(options.onPropChange);
    const createColorBindingElement = makeColorInputFunc(options.onPropChange);

    function createSelectBindingElement<T>(v: T, k: keyof T, config?: (element: HTMLSelectElement) => void) {
        const input = dom.createHtmlElement('select', ['mlb-select']);
        input.value = (v as any)[k] as string;
        config?.call(undefined, input);

        input.addEventListener('change', e => {
            v[k] = (e.target as any).value;
        });

        return input;
    }

    const lang = options.lang;
    const properties = feature.properties;

    if (options.mode === 'create' && (
        !properties.layerId ||
        !options.layers.some(x => x.id === feature.properties.layerId)))
        properties.layerId = options.layers[0].id;

    const propsCopy = deep.clone(properties);
    const geoType = feature.geometry.type;

    const content = dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit']);

    //#region 添加图层选择


    content.append(dom.createHtmlElement('div',
        ['mlb-ctrl-marker-modal-content-edit-item'],
        [dom.createHtmlElement('label', [], [lang.chooseLayer]), createSelectBindingElement(properties, 'layerId', x => {
            options.layers.forEach(l => {
                x.innerHTML += `<option value="${l.id}">${l.name}</option>`
            });
            x.value = properties.layerId;
        })]))

    //#endregion
    content.append(dom.createHtmlElement('div',
        ['mlb-ctrl-marker-modal-content-edit-item'],
        [dom.createHtmlElement('label', [], [lang.markerName]), createInputBindingElement(properties, 'name', input => {
            input.type = 'text';
            input.maxLength = 12;
        })]));


    content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-header'], [lang.word]));

    content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-divBorder'],
        [dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [dom.createHtmlElement('label', [], [lang.fontColor]), createColorBindingElement(properties.style, 'textColor')]),
        dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [dom.createHtmlElement('label', [], [lang.fontSize]),
        createInputBindingElement(properties.style, 'textSize', input => {
            input.type = 'number';
            input.min = '1';
            input.max = '30';
        })]),
        dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'],
            [dom.createHtmlElement('label', [], [lang.textHaloColor]), createColorBindingElement(properties.style, 'textHaloColor')]),
        dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'],
            [dom.createHtmlElement('label', [], [lang.textHaloWidth]), createInputBindingElement(properties.style, 'textHaloWidth', input => {
                input.type = 'number';
                input.min = '1';
                input.max = '10';
            })]),
        ]))

    if (geoType === 'Point' || geoType === 'MultiPoint') {
        getMapMarkerSpriteImages(images => {
            const imagesContainer = dom.createHtmlElement('div');
            imagesContainer.style.width = '300px';
            imagesContainer.style.height = '220px';
            imagesContainer.style.overflowY = 'auto';

            let lastClickImg: HTMLImageElement;

            images.forEach((v, k) => {
                const imgElement = dom.createHtmlElement('img');
                imgElement.src = v.url;
                imgElement.height = 30;
                imgElement.width = 30;
                imagesContainer.append(imgElement);

                imgElement.style.cursor = 'pointer';
                imgElement.style.borderRadius = '4px';
                imgElement.style.padding = '4px';

                if (properties.style.pointIcon === k) {
                    imgElement.style.backgroundColor = '#ccc';
                    lastClickImg = imgElement;
                }

                imgElement.addEventListener('click', () => {
                    if (lastClickImg)
                        lastClickImg.style.backgroundColor = '#fff';
                    imgElement.style.backgroundColor = '#ccc';
                    lastClickImg = imgElement;
                    properties.style.pointIcon = k;
                    options.onPropChange?.call(undefined);
                });
            });


            content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-header'], [lang.pointIcon]))
            content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-divBorder'], [
                dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                    dom.createHtmlElement('label', [], [lang.iconText]), imagesContainer]),
                dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                    dom.createHtmlElement('label', [], [lang.iconText]), createColorBindingElement(properties.style, 'pointIconColor')]),
                dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                    dom.createHtmlElement('label', [], [lang.iconSize]), createInputBindingElement(properties.style, 'pointIconSize', input => {
                        input.type = 'number';
                        input.min = '0.1';
                        input.step = '0.1';
                        input.max = '1';
                    })])
            ]))
        });
    }
    else if (geoType === 'LineString' || geoType === 'MultiLineString') {

        content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-header'], [lang.line]))
        content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-divBorder'], [
            dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.lineColor]), createColorBindingElement(properties.style, 'lineColor')]),
            dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.lineWidth]), createInputBindingElement(properties.style, 'lineWidth', input => {
                    input.type = 'number';
                    input.min = '1';
                    input.step = '1';
                    input.max = '10';
                })])
        ]))
    }
    else if (geoType === 'Polygon' || geoType === 'MultiPolygon') {

        content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-header'], [lang.outline]))
        content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-divBorder'], [
            dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.polygonOutlineColor]), createColorBindingElement(properties.style, 'polygonOutlineColor')]),
            dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.polygonOutlineWidth]), createInputBindingElement(properties.style, 'polygonOutlineWidth', element => {
                    element.type = 'number';
                    element.min = '1';
                    element.step = '1';
                    element.max = '10';
                })])
        ]));

        content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-header'], [lang.polygon]))
        content.append(dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-divBorder'], [
            dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.polygonColor]), createColorBindingElement(properties.style, 'polygonColor')]),
            dom.createHtmlElement('div', ['mlb-ctrl-marker-modal-content-edit-item'], [
                dom.createHtmlElement('label', [], [lang.polygonOpacity]), createInputBindingElement(properties.style, 'polygonOpacity', element => {
                    element.type = 'number'
                    element.min = '0';
                    element.step = '0.1';
                    element.max = '1';
                })])
        ]));
    }

    createConfirmModal({
        'title': options.mode === 'update' ? lang.editItem : lang.newItem,
        content,
        onCancel: () => {
            // 数据恢复
            feature.properties = propsCopy;
            options.onCancel?.call(undefined);
            options.onPropChange?.call(undefined);
        },
        onConfirm: () => {
            if (options.mode === 'create' || !deep.equal(propsCopy, feature.properties))
                options.onConfirm?.();
        }
    })
}