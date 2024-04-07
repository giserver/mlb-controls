import { creator } from 'wheater';
import { MarkerFeatrueProperties, TMarkerFeature } from './types';

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

    /**
     *
     */
    constructor(private map: mapboxgl.Map, private options: {
        data: GeoJSON.FeatureCollection<GeoJSON.Geometry, MarkerFeatrueProperties>
    }) {

        this.map.addSource(this.id, {
            type: 'geojson',
            data: options.data
        });

        this.layers.forEach(x => this.map.addLayer(x));
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
                features: this.options.data.features.filter(x => !this.hiddenLayerIds.has(x.properties.id))
            });
    }
}