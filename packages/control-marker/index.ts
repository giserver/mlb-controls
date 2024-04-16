import { creator, deep, dom } from "wheater";
import { MapControl, MapControlOptions } from "@mlb-controls/common";
import { ExtendControl, ExtendControlOptions } from "@mlb-controls/extend";
import { IMarkerControlLanguage } from "./lang";
import { getMapMarkerSpriteImages } from "./symbol-icon";
import { MarkerManager } from "./manager";
import { TMarkerFeature, GeometryStyle, MarkerLayer, Events } from "./types";
import { createFeaturePropertiesEditModal } from "./modal";
import { LayerCatalog } from "./catalog";

import "./index.css"
import "@mlb-controls/common/dist/style.css";
import "@mlb-controls/extend/dist/style.css";
import { DrawBaseOptions, DrawerManager } from "@mlb-controls/draw";

export interface MarkerControlOptions extends MapControlOptions<IMarkerControlLanguage>, Omit<Omit<ExtendControlOptions, "os">, "content"> {
    defaultStyle?: GeometryStyle;
    layers?: MarkerLayer[];
    features?: TMarkerFeature[];
    events?: Events;

    /**
     * 停止其他控件，防止地图事件冲突，如测量等
     */
    beforeDraw?(): void;
}

export class MarkerControl extends MapControl<IMarkerControlLanguage> {
    private extendControl: ExtendControl;
    private markerContainer: HTMLDivElement;

    /**
     *
     */
    constructor(private options: MarkerControlOptions) {
        super(options, {
            confirm: "确认",
            cancel: "取消",

            title: "标注",
            searchPlaceholder: "请输入标注名称",
            nameText: '名称',

            newMarkerName: "标注",
            newLayer: "新建图层",
            chooseLayer: "选择图层",

            markerName: "标注名称",
            fontSize: "大小",
            fontColor: "颜色",
            iconText: "图形",
            iconSize: "图形大小",
            iconColor: "图形颜色",
            textHaloWidth: "轮廓宽度",
            textHaloColor: "轮廓颜色",
            lineWidth: "宽度",
            lineColor: "颜色",
            polygonColor: "颜色",
            polygonOpacity: "透明度",
            polygonOutlineWidth: "宽度",
            polygonOutlineColor: "颜色",

            defaultLayerName: "默认图层",
            fileType: "文件类型",

            newItem: "新增",
            editItem: "编辑",
            importItem: "导入",
            exportItem: "导出",
            deleteItem: "删除",
            visibility: "显隐",
            cannotDeleteLastLayer: "无法删除最后一个图层",

            warn: "警告",

            word: "文字",
            point: "点",
            pointIcon: '图标',
            line: "线",
            outline: "轮廓线",
            polygon: '面',

            edit_graph: '编辑图形',
            area: '面积',
            length: '长度',

            proj: '投影',
            lat_0: "纬度原点",
            lon_0: "中央子午线",
            x_0: "东向加常数",
            y_0: "北向加常数",
            towgs84: "七参数"
        });

        this.options.icon1 ??= dom.createHtmlElement('div', [], [], {
            onInit: e => {
                e.innerHTML = `<svg width="20" height="20" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4066" >
                <path d="M256 544V768h64v128H128v-128h64V128h64v32c81.152 42.688 178.56 42.688 292.224 0 113.728-42.688 229.632-42.688 347.776 0v384c-134.208-42.688-250.048-42.688-347.52 0-97.408 42.688-194.944 42.688-292.48 0z" p-id="4067">
                </path>
            </svg>`
            }
        }).querySelector('svg')!;

        this.options.features ??= [];
        this.options.events ??= {};

        // 添加默认图层
        if (!options.layers || options.layers.length === 0) {
            const layer = {
                id: creator.uuid(),
                name: this.lang.defaultLayerName,
                date: Date.now()
            }
            options.layers = [layer];
            options.events?.onLayerCreate?.(layer);
        }

        this.markerContainer = dom.createHtmlElement("div", ["mlb-ctrl-marker"], []);
        this.extendControl = new ExtendControl({
            ...this.options,
            content: this.markerContainer,
            os: "pc"
        });
    }

    createElement(map: mapboxgl.Map): HTMLElement {
        getMapMarkerSpriteImages(images => {
            images.forEach((v, k) => {
                map.addImage(k, v.data, { sdf: true });
            });
        });

        const manager = new MarkerManager(map, {
            features: this.options.features!,
            layers: this.options.layers!,
        });

        const lastPropertiesCache: { name: string, layerId: string, style: GeometryStyle } = {
            name: "",
            layerId: "",
            style: {
                textSize: 14,
                textColor: 'black',
                textHaloColor: 'white',
                textHaloWidth: 1,

                pointIcon: "标1.png",
                pointIconColor: "#ff0000",
                pointIconSize: 0.3,

                lineColor: '#0000ff',
                lineWidth: 3,

                polygonColor: '#0000ff',
                polygonOpacity: 0.5,
                polygonOutlineColor: '#000000',
                polygonOutlineWidth: 2,
            }
        }
        deep.setProps(this.options.defaultStyle ?? {}, lastPropertiesCache.style, { skipEmpty: true });
        lastPropertiesCache.layerId = this.options.layers![0].id;
        lastPropertiesCache.name = this.lang.newMarkerName;

        const drawOptions = {
            once: true,
            onDrawed: (id, geometry) => {
                drawerManager.clear();
                const featrue = {
                    type: 'Feature',
                    id,
                    geometry,
                    properties: {
                        id,
                        date: Date.now(),
                        name: lastPropertiesCache.name,
                        layerId: lastPropertiesCache.layerId,
                        style: {
                            ...lastPropertiesCache.style
                        }
                    }
                } as TMarkerFeature;

                manager.addOrUpdateFeature(featrue);

                createFeaturePropertiesEditModal(featrue, {
                    mode: 'create',
                    layers: manager.getLayers(),
                    lang: this.lang,
                    onCancel: () => {
                        // 取消保存新创建的feature
                        manager.removeFeature(featrue.properties.id);
                    },
                    onConfirm: () => {
                        this.options.events!.onMarkerCreate?.(featrue);
                    },
                    onPropChange: () => {
                        manager.reRender();
                    }
                });
            }
        } as DrawBaseOptions;

        const drawerManager = new DrawerManager(map, {
            onStart: this.options.beforeDraw,
            point: {
                ...drawOptions
            },
            lineString: {
                ...drawOptions
            },
            polygon: {
                ...drawOptions
            }
        });



        this.extendControl.onAdd(map);

        this.markerContainer.append(...this.options.layers!.map(l => new LayerCatalog(l.id, manager, this.lang).element));

        return this.extendControl.element;
    }

    removeControl(map: mapboxgl.Map): void {
        this.extendControl.onRemove(map);
    }

    getDefaultPosition = () => {
        return this.extendControl.getDefaultPosition();
    };
}