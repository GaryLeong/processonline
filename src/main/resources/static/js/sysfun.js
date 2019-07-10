/**
 * 地图容器初始化
 */
//地图容器
let map;
//当前显示哪一个div
let labelType;
//屏幕当前高度
let winHeight;
//屏幕当前宽度
let winWidth;
//加载的Google图层
let googleLayer;
//叠加图层
let overlayLayer;
//比例尺
const projection = ol.proj.get('EPSG:3857');
//layui layer
let layuiLayer;
//layui预先加载
layui.use(['layer'], function () {
    layuiLayer = layui.layer;
});

/**
 * 页面初始化，在页面加载完成之后执行
 */
$(function () {
    //初始化地图容器
    initMap();
    winWidth = $(window).width();
    winHeight = $(window).height();
    //加载div
    $.ajax({
        url: '/map/locationPage',
        type: 'get',
        success: function (res) {
            $('#geolocatePane').html($(res));
            //加载js
            $.getScript('/js/locate/locate.js', function () {
                console.log('locationPage 加载完毕...');
            })
        }
    });

})


/**
 * 页面尺寸发生变化回调函数
 */
window.onresize = function () {
    winWidth = $(window).width();
    winHeight = $(window).height();
}

/**
 * 初始化地图
 */
function initMap() {
    //实例化比例尺控件（ScaleLine）
    var scaleLine = new ol.control.ScaleLine({
        //设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
        units: "metric"
    });
    var mousePosition = new ol.control.MousePosition({
        projection: 'EPSG:4326',
        coordinateFormat: ol.coordinate.createStringXY(4)
    });
    googleLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            //默认加载卫星影像
            url: 'http://mt0.google.cn/maps/vt?lyrs=s@773&gl=cn&x={x}&y={y}&z={z}'
        }),
        extent: [-180, -90, 180, 90]
    });
    //初始化地图容器
    map = new ol.Map({
        layers: [googleLayer],
        target: 'map', //地图容器div的ID
        view: new ol.View({
            center: [106.51, 29.55],
            projection: 'EPSG:4326',
            zoom: 10
        }),
        //加载控件到地图容器中
        controls: ol.control.defaults({
            zoom: false,
            rotate: false,
            attribution: false
        }).extend([
            scaleLine,
            mousePosition
        ])
    });

    //loadVector();

    /**
     * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
     */
    map.on('pointermove', function (e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        //获取屏幕中心坐标点
        let coord = map.getView().getCenter();
        coord = ol.coordinate.toStringXY(coord, 4);
        $("#lblLocate").text(coord);
    });
}

function loadVector() {
    //参数字段
    var wfsParams = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        maxFeatures: 5000,
        typeName: 'cite:GuiYangTest_csv',  //图层名称
        outputFormat: 'text/javascript',  //重点，不要改变
        format_options: 'callback:loadFeatures'  //回调函数声明
    };

    //使用jsonp，可以解决跨域的问题，GeoServer中的web.xml文件关于jsonp的注释要去掉，就可以支持跨域了
    var vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        loader: function (extent, resolution, projection) {  //加载函数
            var url = 'http://192.168.201.70:8080/geoserver/wfs';
            $.ajax({
                url: url,
                data: $.param(wfsParams),   //传参
                type: 'GET',
                dataType: 'jsonp',   //解决跨域的关键
                jsonpCallback: 'loadFeatures'  //回调

            });
        },
        strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
            maxZoom: 25
        })),
        projection: 'EPSG:4326'
    });
    //回调函数使用
    window.loadFeatures = function (response) {
        //vectorSource.addFeatures((new ol.format.GeoJSON()).readFeatures(response));  //载入要素
        //坐标转换，将返回的数据的坐标转换到当前使用地图的坐标系，否则，无法正常显示
        vectorSource.addFeatures((new ol.format.GeoJSON()).readFeatures(response, {
            dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
            featureProjection: 'EPSG:4326' // 设定当前地图使用的feature的坐标系
        }));  //载入要素
    };
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(vectorLayer);
}

/**
 * 加载图层数据
 * @param layerType
 */
function loadLayerData(layerType) {
    switch (layerType) {
        case "road":
            //加载wfs数据图层显示
            // var myVector = vector;
            var vectorSource = new ol.source.Vector({
                url: "/json/ajson.geojson",
                format: new ol.format.GeoJSON()
            });
            var vectorLayer = new ol.layer.Vector({
                source: vectorSource
            });
            map.addLayer(vectorLayer);
            break;
    }
}

/**
 * 加载wfs数据图层
 * @type {ol.layer.Vector} 矢量数据图层
 */
var vector = new ol.layer.Vector({
    //数据来源
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON({
            geometryName: 'the_geom'
        }),
        map: map,
        url: 'http://localhost:8081/geoserver/gary/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=' +
            'm_roadFilter_jwl_sn&outputFormat=application%2Fjson&srsname=EPSG:4326'
    }),
    //layer样式
    style: function (feature, resolution) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                width: 1
            })
        });
    }
});

/**
 * 移动地图（以要素为中心点）
 * @param {ol.Feature} feature 要素
 */
function moveTo(feature) {
    var geo = feature.getGeometry();
    var coordinate = geo.getCoordinates(); //获取要素点坐标
    map.getView().setCenter(coordinate);//设置地图中心点
}

/**
 * 展开收缩界面
 * @param type 类型
 */
function showBackground(type) {
    if ($("#" + type + "").is(":visible")) {
        $("#" + type + "").hide();
    } else {
        $("#" + type + "").show();
    }
}

/**
 * 显示控件栏
 * @param pane 面板
 * @param paneRelBtn 关联点击按钮
 */
function showMapControlClick(pane, paneRelBtn, blnShow) {
    var myPane = $("#" + pane + "");
    if (blnShow == "false") {
        myPane.prop("style", "display: none; right: -300px;");
        $("#" + paneRelBtn + "").prop("class", "none");
    } else {
        if (myPane.attr("style") == "display: none; right: -300px;") {
            myPane.prop("style", "display:block;right:0px;");
            $("#" + paneRelBtn + "").prop("class", "active");
        } else {
            myPane.prop("style", "display: none; right: -300px;");
            $("#" + paneRelBtn + "").prop("class", "none");
        }
    }
}

/**
 * 显示侧边栏
 */
function showSidebarClick() {
    var sidebar = $("#sidebar");
    if (sidebar.attr("class") == "collapsed") {
        sidebar.prop("style", "min-width: 280px; max-width: 400px; width: 20%;");
        sidebar.prop("class", "");
        var len = document.documentElement.clientWidth * 0.2;
        $('.fillD').css("margin-left", len);
    } else {
        sidebar.prop("style", "min-width: 280px; max-width: 400px; width: 400px; margin-left: -400px;");
        sidebar.prop("class", "collapsed");
        $('.fillD').css("margin-left", 0);
    }
}

/**
 * 展开/收缩折叠窗
 * @param list 折叠list
 * @param img 显示图标
 * @param href 点击href
 */
function expandWrap(list, img, href) {
    var list = $("#" + list + "");
    var img = $("#" + img + "");
    var href = $("#" + href + "");
    if (list[0].id.indexOf('background') != -1 || list[0].id.indexOf('Background') != -1) {
        if (list.attr("class") == "disclosure-wrap disclosure-wrap-background_list") {
            list.prop("class", "disclosure-wrap disclosure-wrap-background_list hide");
            img.prop("src", "/svg/iD-sprite/icons/icon-forward.svg");
            href.prop("class", "hide-toggle hide-toggle-background_list");
        } else {
            list.prop("class", "disclosure-wrap disclosure-wrap-background_list");
            img.prop("src", "/svg/iD-sprite/icons/icon-down.svg");
            href.prop("class", "hide-toggle hide-toggle-background_list expanded");
        }
    } else if (list[0].id.indexOf('overlay') != -1 || list[0].id.indexOf('Overlay') != -1) {
        if (list.attr("class") == "disclosure-wrap disclosure-wrap-overlay_list") {
            list.prop("class", "disclosure-wrap disclosure-wrap-overlay_list hide");
            img.prop("src", "/svg/iD-sprite/icons/icon-forward.svg");
            href.prop("class", "hide-toggle hide-toggle-overlay_list");
        } else {
            list.prop("class", "disclosure-wrap disclosure-wrap-overlay_list");
            img.prop("src", "/svg/iD-sprite/icons/icon-down.svg");
            href.prop("class", "hide-toggle hide-toggle-overlay_list expanded");
        }
    } else if (list[0].id.indexOf('data') != -1 || list[0].id.indexOf('Data') != -1) {
        if (list.attr("class") == "disclosure-wrap disclosure-wrap-data_layers") {
            list.prop("class", "disclosure-wrap disclosure-wrap-data_layers hide");
            img.prop("src", "/svg/iD-sprite/icons/icon-forward.svg");
            href.prop("class", "hide-toggle hide-toggle-data_layers");
        } else {
            list.prop("class", "disclosure-wrap disclosure-wrap-data_layers");
            img.prop("src", "/svg/iD-sprite/icons/icon-down.svg");
            href.prop("class", "hide-toggle hide-toggle-data_layers expanded");
        }
    } else if (list[0].id.indexOf('feature') != -1 || list[0].id.indexOf('Feature') != -1) {
        if (list.attr("class") == "disclosure-wrap disclosure-wrap-map_features") {
            list.prop("class", "disclosure-wrap disclosure-wrap-map_features hide");
            img.prop("src", "/svg/iD-sprite/icons/icon-forward.svg");
            href.prop("class", "hide-toggle hide-toggle-map_features");
        } else {
            list.prop("class", "disclosure-wrap disclosure-wrap-map_features");
            img.prop("src", "/svg/iD-sprite/icons/icon-down.svg");
            href.prop("class", "hide-toggle hide-toggle-map_features expanded");
        }
    }
}

/**
 * 选择图层切换事件
 * @param chooseLi 当前选中Li
 */
function chooseLayer(chooseLi) {
    var chooseLi = $("#" + chooseLi + "");
    chooseLi.prop("class", "active");
    var lis = $("#backgroundLayerList").children();
    for (var i = 0; i < lis.length; i++) {
        if (lis[i].id != chooseLi.attr("id")) {
            $("#" + lis[i].id + "").prop("class", "");
        }
    }
}

/**
 * 选择加载图层
 * @param layerType
 */
function chooseDataLayer(layerType) {
    //移除图层
    map.removeLayer(googleLayer);
    //根据图层类型重新加载底图
    loadDataLayer(layerType);
}

/**
 * 根据图层类型重新加载底图
 * @param layerType
 */
function loadDataLayer(layerType) {
    switch (layerType) {
        //地形
        case "terrain":
            googleLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://www.google.cn/maps/vt?lyrs=t@189&gl=cn&x={x}&y={y}&z={z}'
                }),
                extent: [-180, -90, 180, 90]
            });
            break;
        //矢量
        case "vector":
            googleLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
                }),
                extent: [-180, -90, 180, 90]
            });
            break;
        //影像
        case "raster":
            googleLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
                }),
                extent: [-180, -90, 180, 90]
            });
            break;
        //道路
        case "road":
            googleLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://www.google.cn/maps/vt?lyrs=h@189&gl=cn&x={x}&y={y}&z={z}'
                }),
                extent: [-180, -90, 180, 90]
            });
            break;
        case "bd":
            googleLayer = loadBaiduMap();
            break;
        case "bdSate":
            googleLayer = loadBaiduMapSate();
            break;
        case "amap":
            googleLayer = new ol.layer.Tile({
                title: "高德地图卫星",
                source: new ol.source.AMap({mapType: "sat"})
            });
            break;
        default:
            googleLayer = new ol.layer.GoogleMapLayer({
                layerType: ol.source.GoogleLayerType.TERRAIN
            });
            break;
    }
    //添加图层
    map.addLayer(googleLayer);
}

/**
 * 选择叠加底图
 * @param layerType 图层类型
 */
function chooseOverlayLayer(overlayChk, layerType) {
    switch (layerType) {
        //谷歌交通图
        case "road":
            var overlayChk = $("#" + overlayChk + "");
            if (overlayChk.prop('checked')) {
                overlayLayer = new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: 'http://www.google.cn/maps/vt?lyrs=h@189&gl=cn&x={x}&y={y}&z={z}'
                    }),
                    extent: [-180, -90, 180, 90]
                });
                var layers = map.getLayers();
                layers.insertAt(1, overlayLayer);
            } else {
                map.removeLayer(overlayLayer);
                var layers = map.getLayers();
                layers.remove(overlayLayer);
                if (overlayLayer != null) {
                    overlayLayer.dispose();
                    overlayLayer = null;
                }
            }
            break;
    }
}

//添加监听事件
//切换侧边栏点击事件
let sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
sidebarToggleBtn.addEventListener('click', showSidebarClick, false);
//选择数据图层切换事件
let rasterLayer = document.getElementById('rasterLayer');
rasterLayer.addEventListener("click", function () {
    chooseLayer('rasterLi');
    chooseDataLayer('raster');
}, false);
document.getElementById('terrainLayer').addEventListener("click", function () {
    chooseLayer('terrainLi');
    chooseDataLayer('terrain');
});
document.getElementById('vectorLayer').addEventListener("click", function () {
    chooseLayer('vectorLi');
    chooseDataLayer('vector');
});
document.getElementById('roadLayer').addEventListener("click", function () {
    chooseLayer('roadLi');
    chooseDataLayer('road');
});
document.getElementById('bdLayer').addEventListener("click", function () {
    chooseLayer('bdLi');
    chooseDataLayer('bd');
});
document.getElementById('bdSateLayer').addEventListener("click", function () {
    chooseLayer('bdSateLi');
    chooseDataLayer('bdSate');
});
document.getElementById('amapLayer').addEventListener("click", function () {
    chooseLayer('amapLi');
    chooseDataLayer('amap');
});
document.getElementById('overlayVectorChk').addEventListener("click", function () {
    // overlaySwitchCheck('vector', 'overlayVectorChk');
    chooseOverlayLayer('overlayVectorChk', 'road');
});
//关闭按钮事件
document.getElementById('closeLayersBtn').addEventListener("click", function () {
    showMapControlClick('backgroundPane', 'setLayersBtn');
});
document.getElementById('closeDataPaneBtn').addEventListener("click", function () {
    showMapControlClick('mapDataPane', 'setDataBtn');
});
//显示/关闭Pane
let setLayersBtn = document.getElementById('setLayersBtn');
setLayersBtn.addEventListener("click", function () {
    showMapControlClick('backgroundPane', 'setLayersBtn', '');
    showMapControlClick('mapDataPane', 'setDataBtn', 'false');
    showMapControlClick('geolocatePane', 'geolocateBtn', 'false');
});
let setDataBtn = document.getElementById('setDataBtn');
setDataBtn.addEventListener("click", function () {
    showMapControlClick('mapDataPane', 'setDataBtn', '');
    showMapControlClick('backgroundPane', 'setLayersBtn', 'false');
    showMapControlClick('geolocatePane', 'geolocateBtn', 'false');
});
let geolocateBtn = document.getElementById('geolocateBtn');
geolocateBtn.addEventListener('click', function () {
    showMapControlClick('geolocatePane', 'geolocateBtn', '');
    showMapControlClick('backgroundPane', 'setLayersBtn', 'false');
    showMapControlClick('mapDataPane', 'setDataBtn', 'false');
})
//收缩TabPane
document.getElementById('backgroundListHref').addEventListener("click", function () {
    expandWrap('layerBackgroundList', 'backgroundImg', 'backgroundListHref');
});
document.getElementById('mapDataHref').addEventListener("click", function () {
    expandWrap('mapDataLayersList', 'mapDataImg', 'mapDataHref');
});
document.getElementById('mapFeaturesHref').addEventListener("click", function () {
    expandWrap('mapFeaturesList', 'mapFeaturesImg', 'mapFeaturesHref');
});
document.getElementById('overlayHref').addEventListener("click", function () {
    expandWrap('overlayList', 'overlayImg', 'overlayHref');
});
//放大按钮
let zoomInBtn = document.getElementById('zoom-in');
zoomInBtn.addEventListener('click', zoomIn, false);

/**
 * 地图放大
 */
function zoomIn() {
    let view = map.getView();
    let zoom = view.getZoom();
    view.setZoom(zoom + 1);
}

let zoomOutBtn = document.getElementById('zoom-out');
zoomOutBtn.addEventListener('click', zoomOut, false);

/**
 * 地图放大
 */
function zoomOut() {
    let view = map.getView();
    let zoom = view.getZoom();
    view.setZoom(zoom - 1);
}