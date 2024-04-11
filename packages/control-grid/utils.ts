//地球周长一半，单位米
var grithHalf = 20037508.3427892;
//将经纬度转为墨卡托坐标
function lonlat2Mercator(lng: number, lat: number) {
    if (lat > 85.051128)
        lat = 85.051128;
    if (lat < -85.051128)
        lat = -85.051128;

    var x = lng * grithHalf / 180;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * grithHalf / 180;
    return [x, y];
}


// 瓦片编号转经纬度
function tile2lng(x: number, z: number) {
    return (x / Math.pow(2, z) * 360 - 180);
}

function tile2lat(y: number, z: number) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

//通过经纬度与级别获取瓦片行列号
export function lnglat2tile(lng: number, lat: number, zoom: number) {
    //此级别下瓦片的行列数
    var num = parseInt(Math.pow(2, zoom).toString());
    var cellsize = grithHalf * 2 / num;

    //经纬度转墨卡托
    var np = lonlat2Mercator(lng, lat);
    var x = parseInt(((np[0] + grithHalf) / cellsize).toString());
    x = Math.max(0, x);
    x = Math.min(x, parseInt((Math.pow(2, zoom) - 1).toString()));
    var y = parseInt(((grithHalf - np[1]) / cellsize).toString());
    y = Math.max(0, y);
    y = Math.min(y, parseInt((Math.pow(2, zoom) - 1).toString()));
    return [x, y];
}

export function tile2lnglat(zoom: number, xlng: number, ylat: number) {
    var lng = tile2lng(xlng, zoom);
    var lat = tile2lat(ylat, zoom);
    return [lng, lat];
}