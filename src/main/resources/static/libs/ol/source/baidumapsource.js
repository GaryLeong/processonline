/**
 * 加载百度地图
 * @returns {ol.layer.Tile}
 */
function loadBaiduMap() {
    //数据源信息
    var attribution = new ol.control.Attribution({
        html: 'Copyright:&copy; 2015 Baidu, i-cubed, GeoEye'
    });
    //地图范围
    var extent = [-20037508.34, -20037508.34, 20037508.34, 20037508.34];
    //瓦片大小
    var tileSize = 256;
    //瓦片参数原点
    var origin = [0, 0];
    //百度地图在线服务地址
    var urlTemplate = "http://online2.map.bdimg.com/tile/?qt=tile&x=" + '{x}' + "&y=" + '{y}' + "&z=" + '{z}' + "&styles=pl&udt=20141219&scaler=1";
    //通过范围计算得到地图分辨率数组resolutions
    var resolutions = getResolutions(extent, tileSize);
    //实例化百度地图数据源
    var baiduSource = new ol.source.TileImage({
        attributions: [attribution],
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            //判断返回的当前级数的行号和列号是否包含在整个地图范围内
            if (this.tileGrid != null) {
                var tileRange = this.tileGrid.getTileRangeForExtentAndZ(extent, tileCoord[0], tileRange);
                if (!tileRange.contains(tileCoord)) {
                    return;
                }
            }
            var z = tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];
            return urlTemplate.replace('{z}', z.toString())
                .replace('{y}', y.toString())
                .replace('{x}', x.toString());
        },
        projection: ol.proj.get('EPSG:3857'), //投影坐标系
        tileGrid: new ol.tilegrid.TileGrid({
            origin: origin, //原点，数组类型，如[0,0],
            resolutions: resolutions, //分辨率数组
            tileSize: tileSize //瓦片图片大小
        })
    });
    //实例化百度地图瓦片图层
    var baiduLayer = new ol.layer.Tile({
        source: baiduSource
    });
    //添加Baidu地图图层
    //map.addLayer(baiduLayer);
    return baiduLayer;
}

/**
 * 加载百度卫星地图
 * @returns {ol.layer.Tile}
 */
function loadBaiduMapSate() {
    //数据源信息
    var attribution = new ol.control.Attribution({
        html: 'Copyright:&copy; 2015 Baidu, i-cubed, GeoEye'
    });
    //地图范围
    var extent = [-20037508.34, -20037508.34, 20037508.34, 20037508.34];
    //瓦片大小
    var tileSize = 256;
    //瓦片参数原点
    var origin = [0, 0];
    //百度地图在线服务地址
    var urlTemplate = "https://ss1.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/starpic/?qt=satepc&u=x=" + '{x}' + ";y=" + '{y}' + ";z=" + '{z}' + ";v=009;type=sate&fm=46&app=webearth2&v=009&udt=20190425";
    //通过范围计算得到地图分辨率数组resolutions
    var resolutions = getResolutions(extent, tileSize);
    //实例化百度地图数据源
    var baiduSource = new ol.source.TileImage({
        attributions: [attribution],
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            //判断返回的当前级数的行号和列号是否包含在整个地图范围内
            if (this.tileGrid != null) {
                var tileRange = this.tileGrid.getTileRangeForExtentAndZ(extent, tileCoord[0], tileRange);
                if (!tileRange.contains(tileCoord)) {
                    return;
                }
            }
            var z = tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];
            return urlTemplate.replace('{z}', z.toString())
                .replace('{y}', y.toString())
                .replace('{x}', x.toString());
        },
        projection: ol.proj.get('EPSG:3857'), //投影坐标系
        tileGrid: new ol.tilegrid.TileGrid({
            origin: origin, //原点，数组类型，如[0,0],
            resolutions: resolutions, //分辨率数组
            tileSize: tileSize //瓦片图片大小
        })
    });
    //实例化百度地图瓦片图层
    var baiduLayer = new ol.layer.Tile({
        source: baiduSource
    });
    //map.addLayer(baiduLayer); //添加Baidu地图图层
    return baiduLayer;
}

/**
 * 通过范围计算得到地图分辨率数组resolutions
 * @param extent
 * @param tileSize
 * @returns {any[]}
 */
function getResolutions(extent, tileSize) {
    var width = ol.extent.getWidth(extent);
    var height = ol.extent.getHeight(extent);
    var maxResolution = (width <= height ? height : width) / (tileSize);//最大分辨率
    var resolutions = new Array(16);
    var z;
    for (var z = 0; z < 16; ++z) {
        resolutions[z] = maxResolution / Math.pow(2, z);
    }
    return resolutions; //返回分辩率数组resolutions
}

/**
 * 重新设置地图视图
 * @param {ol.Coordinate} center 中心点
 * @param {number} zoom 缩放级数
 */
function setMapView(center, zoom) {
    var view = map.getView(); //获取地图视图
    view.setCenter(center); //平移地图
    view.setZoom(zoom); //地图缩放
}