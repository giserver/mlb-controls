import { creator } from 'wheater';
import centroid from '@turf/centroid'
import bbox from '@turf/bbox'
import { TMarkerFeature, TMarkerFeatureCollection } from './types';
import { DrawBaseOptions, DrawType, DrawerManager } from '@mlb-controls/draw';



export interface MarkerManagerOptions {
    /**
     * 初始化数据
     */
    data: TMarkerFeatureCollection;

    /**
     * 绘制结束
     * 
     * 数据并没有存入MarkerManger中
     * @param id 
     * @param geometry 
     */
    onDrawed(id: string, geometry: GeoJSON.Geometry): void;

    /**
     * 在绘制之前执行，可以取消测量等占用鼠标事件的功能
     */
    beforeDraw?(): void;
}

export class MarkerManager {
    readonly id = creator.uuid();
    readonly id_layer_point = this.id + "_point";
    readonly id_layer_line = this.id + "_line";
    readonly id_layer_polygon = this.id + "_polygon";
    readonly id_layer_polygon_outline = this.id + "_polygon_outline";
    readonly id_layer_label = this.id + "_label";

    private readonly layers: mapboxgl.AnyLayer[] = [{
        id: this.id_layer_point,
        type: 'symbol',
        source: this.id,
        layout: {
            "text-field": ['get', 'name'],
            'text-size': ['get', 'textSize', ['get', 'style']],
            'icon-image': ['get', 'pointIcon', ['get', 'style']],
            'icon-size': ['get', 'pointIconSize', ['get', 'style']],
            'text-justify': 'auto',
            'text-variable-anchor': ['left', 'right', 'top', 'bottom'],
            'text-radial-offset': ['*', ['get', 'pointIconSize', ['get', 'style']], 4],
        },
        paint: {
            "text-color": ['get', 'textColor', ['get', 'style']],
            "text-halo-width": ['get', 'textHaloWidth', ['get', 'style']],
            "text-halo-color": ['get', 'textHaloColor', ['get', 'style']],
            'icon-color': ['get', 'pointIconColor', ['get', 'style']]
        },
        filter: ['==', '$type', 'Point']
    }, {
        id: this.id_layer_line,
        type: 'line',
        source: this.id,
        layout: {
        },
        paint: {
            "line-color": ['get', 'lineColor', ['get', 'style']],
            "line-width": ['get', 'lineWidth', ['get', 'style']]
        },
        filter: ['==', '$type', 'LineString']
    }, {
        id: this.id_layer_polygon,
        type: 'fill',
        source: this.id,
        layout: {
        },
        paint: {
            "fill-color": ['get', 'polygonColor', ['get', 'style']],
            "fill-opacity": ['get', 'polygonOpacity', ['get', 'style']]
        },
        filter: ['==', '$type', 'Polygon']
    }, {
        id: this.id_layer_polygon_outline,
        type: 'line',
        source: this.id,
        layout: {},
        paint: {
            "line-color": ['get', 'polygonOutlineColor', ['get', 'style']],
            "line-width": ['get', 'polygonOutlineWidth', ['get', 'style']]
        },
        filter: ['==', '$type', 'Polygon']
    }, {
        id: this.id_layer_label,
        type: 'symbol',
        source: this.id,
        layout: {
            "text-field": ['get', 'name'],
            'text-size': ['get', 'textSize', ['get', 'style']]
        },
        paint: {
            "text-color": ['get', 'textColor', ['get', 'style']],
            "text-halo-width": ['get', 'textHaloWidth', ['get', 'style']],
            "text-halo-color": ['get', 'textHaloColor', ['get', 'style']],
        },
        filter: ['!=', '$type', 'Point']
    }];

    private hiddenLayerIds = new Map<string, string>();
    private drawerManager: DrawerManager;

    constructor(private map: mapboxgl.Map, private options: MarkerManagerOptions) {

        this.map.addSource(this.id, {
            type: 'geojson',
            data: options.data
        });

        this.layers.forEach(x => this.map.addLayer(x));

        const drawOptions = {
            once: true,
            onDrawed: (id, geometry) => {
                this.drawerManager.clear();
                this.options.onDrawed(id, geometry);
            }
        } as DrawBaseOptions;

        this.drawerManager = new DrawerManager(map, {
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
    }

    /**
     * 绘制
     * @param type 
     */
    draw(type: DrawType) {
        this.options.beforeDraw?.();
        this.drawerManager.start(type);
    }

    easeTo(id: string, options: Omit<mapboxgl.EaseToOptions, "center">) {
        const feature = this.getFeature(id);
        if (feature) {
            const center = centroid(feature as any);
            this.map.easeTo({
                center: center.geometry.coordinates as [number, number],
                ...options
            });
        }

        throw Error(`feature id not found: ${id} `);
    }

    fitTo(id: string, options: mapboxgl.FitBoundsOptions={}) {
        const feature = this.getFeature(id);
        if (feature) {
            const box = bbox(feature as any);
            options.maxZoom ??= 20;
            options.padding ??= 50;

            this.map.fitBounds([box[0], box[1], box[2], box[3]], options);
        }

        throw Error(`feature id not found: ${id} `);
    }

    /**
     * 获取 feature
     * @param id 
     * @returns 
     */
    getFeature(id: string) {
        return this.options.data.features.find(x => x.properties.id === id);
    }

    /**
     * 增加或更新Feature
     * @param feature 
     */
    addOrUpdateFeature(feature: TMarkerFeature) {
        const existedFeature = this.options.data.features.find(x => x.properties.id === feature.properties.id);
        if (existedFeature) {
            existedFeature.geometry = feature.geometry;
            existedFeature.properties = feature.properties;
        } else {
            this.options.data.features.push(feature);
        }

        this.reRender();
    }

    /**
     * 删除Feature
     * @param id 
     * @returns 
     */
    removeFeature(id: string) {
        const index = this.options.data.features.findIndex(x => x.properties.id === id);
        if (index < 0) return;
        this.options.data.features.splice(index, 1);
        this.reRender();
    }

    removeLayer(id: string) {
        this.options.data.features = this.options.data.features.filter(x => x.properties.layerId !== id);
        if (this.hiddenLayerIds.has(id))
            this.hiddenLayerIds.delete(id);
        this.reRender();
    }

    /**
     * 设置图形显示或者隐藏
     * @param value 是否显示 ture-显示 false-隐藏
     */
    setVisible(value: boolean) {
        this.layers.forEach(x => {
            this.map.setLayoutProperty(x.id, "visibility", value ? "visible" : "none");
        })
    }

    /**
     * 通过图层设置图形显隐
     * @param id 图层id
     * @param value 是否显示 ture-显示 false-隐藏
     * @returns 
     */
    setVisibleByLayer(id: string, value: boolean) {
        if (value) {
            if (!this.hiddenLayerIds.has(id)) return;
            this.hiddenLayerIds.delete(id);
        } else {
            if (this.hiddenLayerIds.has(id)) return;
            this.hiddenLayerIds.set(id, id);
        }

        this.reRender();
    }

    /**
     * 重绘所有图形
     */
    reRender() {
        (this.map.getSource(this.id) as mapboxgl.GeoJSONSource)
            .setData({
                type: "FeatureCollection",
                features: this.options.data.features.filter(x => !this.hiddenLayerIds.has(x.properties.layerId))
            });
    }
}