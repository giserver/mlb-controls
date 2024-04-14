export namespace TileTranslate {
    export namespace Google {
        export function lnglat2tile(zoom: number, lng: number, lat: number): [number, number] {
            const n = Math.pow(2, zoom);

            const xTile = Number.parseInt(((lng + 180) / 360 * n).toString());
            const yTile = Number.parseInt(((1.0 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2.0 * n).toString());

            return [xTile, yTile];
        }

        export function tile2lnglat(zoom: number, xTile: number, yTile: number): [number, number] {
            const n = Math.pow(2, zoom);

            const lng = xTile / n * 360.0 - 180;
            const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * yTile / n))) * 180 / Math.PI;

            return [lng, lat];
        }
    }
}