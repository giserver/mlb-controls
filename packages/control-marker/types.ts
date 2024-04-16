export interface GeometryStyle {
    textSize?: number,
    textColor?: string,
    textHaloWidth?: number,
    textHaloColor?: string,

    pointIcon?: string,
    pointIconSize?: number,
    pointIconColor?: string,

    lineColor?: string,
    lineWidth?: number,

    polygonColor?: string,
    polygonOpacity?: number,
    polygonOutlineColor?: string,
    polygonOutlineWidth?: number
}

export interface MarkerFeatrueProperties {
    id: string,
    name: string,
    layerId: string,
    date: number,
    style: GeometryStyle
}

export interface MarkerLayer {
    id: string,
    name: string,
    date: number
}

export type TMarkerFeature = GeoJSON.Feature<GeoJSON.Geometry, MarkerFeatrueProperties>;

export type ExportGeoJsonType = TMarkerFeature | GeoJSON.FeatureCollection<GeoJSON.Geometry, MarkerFeatrueProperties>;

export interface Events {
    onLayerCreate?(properties: MarkerLayer): Promise<void>,
    onLayerRemove?(properties: MarkerLayer): Promise<void>,
    onLayerRename?(properties: MarkerLayer): Promise<void>,

    onMarkerCreate?(feature: TMarkerFeature): Promise<void>,
    onMarkerRemove?(feature: TMarkerFeature): Promise<void>,
    onMarkerUpdate?(feature: TMarkerFeature): Promise<void>
}