import { creator } from 'wheater';
import centroid from '@turf/centroid'
import bbox from '@turf/bbox'
import { TMarkerFeature, MarkerLayer } from './types';


export interface MarkerManagerOptions {
    map: mapboxgl.Map

    features: TMarkerFeature[];

    layers: MarkerLayer[];
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

    constructor(private options: MarkerManagerOptions) {

        this.options.map.addSource(this.id, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: options.features
            }
        });

        this.layers.forEach(x => this.options.map.addLayer(x));
    }

    /**
     * 平移到指定Feature
     * @param id 
     * @param options 
     */
    easeTo(id: string, options: Omit<mapboxgl.EaseToOptions, "center">) {
        const feature = this.getFeature(id);
        if (feature) {
            const center = centroid(feature as any);
            this.options.map.easeTo({
                center: center.geometry.coordinates as [number, number],
                ...options
            });
        }

        throw Error(`feature id not found: ${id} `);
    }

    /**
     * 地图fit bounds 到 Feature
     * @param id 
     * @param options 
     */
    fitTo(id: string, options: mapboxgl.FitBoundsOptions = {}) {
        const feature = this.getFeature(id);
        if (feature) {
            const box = bbox(feature as any);
            options.maxZoom ??= 20;
            options.padding ??= 50;

            this.options.map.fitBounds([box[0], box[1], box[2], box[3]], options);
        }

        throw Error(`feature id not found: ${id} `);
    }

    /**
     * 获取 feature
     * @param id 
     * @returns 
     */
    getFeature(id: string) {
        return this.options.features.find(x => x.properties.id === id);
    }

    /**
     * 根据图层id获取图层下的features
     * @param layerId 
     * @returns 
     */
    getFeaturesByLayerId(layerId: string) {
        return this.options.features.filter(x => x.properties.layerId === layerId);
    }

    /**
     * 通过id获取图层配置
     * @param id 
     * @returns 
     */
    getLayer(id: string) {
        const layer = this.options.layers.find(x => x.id === id);
        if (!layer) throw Error(`layer id not existed: ${id}`);
        return layer;
    }

    /**
     * 获取所有图层
     * @returns 
     */
    getLayers() {
        return this.options.layers;
    }

    /**
     * 增加或更新Feature
     * @param feature 
     */
    addOrUpdateFeature(feature: TMarkerFeature) {
        const existedFeature = this.options.features.find(x => x.properties.id === feature.properties.id);
        if (existedFeature) {
            existedFeature.geometry = feature.geometry;
            existedFeature.properties = feature.properties;
        } else {
            this.options.features.push(feature);
        }

        this.reRender();
    }

    /**
     * 删除Feature
     * @param id 
     * @returns 
     */
    removeFeature(id: string) {
        const index = this.options.features.findIndex(x => x.properties.id === id);
        if (index < 0) return;
        this.options.features.splice(index, 1);
        this.reRender();
    }

    /**
     * 删除整个图层
     * @param id
     * @returns 
     */
    removeLayer(id: string) {
        const index = this.options.layers.findIndex(x => x.id === id);
        if (index < 0) return;

        this.options.layers.splice(index, 1);
        if (this.hiddenLayerIds.has(id))
            this.hiddenLayerIds.delete(id);

        this.options.features = this.options.features.filter(x => x.properties.layerId !== id);
        this.reRender();
    }

    /**
     * 删除多个图层
     * @param ids 
     */
    removeLayers(ids: string[]) {
        ids.forEach(id => {
            const index = this.options.layers.findIndex(x => x.id === id);
            if (index < 0) return;

            this.options.layers.splice(index, 1);
            if (this.hiddenLayerIds.has(id))
                this.hiddenLayerIds.delete(id);
        });

        this.options.features = this.options.features.filter(x => !ids.includes(x.properties.layerId));
        this.reRender();
    }

    /**
     * 设置图形显示或者隐藏
     * @param value 是否显示 ture-显示 false-隐藏
     */
    setVisible(value: boolean) {
        this.layers.forEach(x => {
            this.options.map.setLayoutProperty(x.id, "visibility", value ? "visible" : "none");
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
     * 
     * @param ids 
     * @param value 
     */
    setVisibleByLayers(ids: string[], value: boolean) {
        ids.forEach(id => {
            if (value) {
                this.hiddenLayerIds.delete(id);
            } else if (!this.hiddenLayerIds.has(id)) {
                this.hiddenLayerIds.set(id, id);
            }
        });

        this.reRender();
    }

    /**
     * 重绘所有图形
     */
    reRender() {
        (this.options.map.getSource(this.id) as mapboxgl.GeoJSONSource)
            .setData({
                type: "FeatureCollection",
                features: this.options.features.filter(x => !this.hiddenLayerIds.has(x.properties.layerId))
            });
    }
}