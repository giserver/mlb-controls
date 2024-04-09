import { IConfirmModelLanguage, ILanguage } from "@mlb-controls/common";

export interface IMarkerControlLanguage extends ILanguage, IConfirmModelLanguage {
    title: string,
    searchPlaceholder: string,
    nameText: string

    newMarkerName: string,
    newLayer: string,
    chooseLayer: string,

    markerName: string,
    fontSize: string,
    fontColor: string,
    iconText: string,
    iconSize: string,
    iconColor: string,
    textHaloWidth: string,
    textHaloColor: string,
    lineWidth: string,
    lineColor: string,
    polygonColor: string,
    polygonOpacity: string,
    polygonOutlineWidth: string,
    polygonOutlineColor: string,

    defaultLayerName: string,
    fileType: string,

    newItem: string,
    editItem: string,
    importItem: string,
    exportItem: string,
    deleteItem: string,
    visibility: string,
    cannotDeleteLastLayer: string,

    warn: string,
    confirm: string,
    cancel: string,

    word: string,
    point: string,
    pointIcon: string,
    line: string,
    outline: string,
    polygon: string,

    edit_graph: string,
    area: string,
    length: string,

    proj: string,
    lat_0: string,
    lon_0: string,
    x_0: string,
    y_0: string,
    towgs84: string
}