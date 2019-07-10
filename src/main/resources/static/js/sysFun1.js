var map;            //地图容器
var labelType;      //当前显示哪一个div
var winHeight;      //屏幕当前高度
var winWidth;       //屏幕当前宽度

var popup; //弹出的Popup
var popupElement = $("#popup");
var popupContent = $("#popup-content");
var popupCloser = $("#popup-closer");

var preFeature = null;  //鼠标选中的前一要素

/**
 * 页面初始化，在页面加载完成之后执行
 */
$(function () {
    /**
     * 添加关闭按钮的单击事件（隐藏popup）
     * @return {boolean} Don't follow the href.
     */
    popupCloser.bind("click", function () {
        popup.setPosition(undefined);  //未定义popup位置
        popupCloser.blur(); //失去焦点
        return false;
    });

    initMap();                  //初始化地图容器
    initSQBtn();                //初始化实时水情滑动按钮

    winWidth = $(window).width();
    winHeight = $(window).height();
})

/**
 * 页面尺寸发生变化回调函数
 */
window.onresize = function () {
    winWidth = $(window).width();
    winHeight = $(window).height();
}

/*
*	地图容器初始化
*/
var googleLayer; //加载的Google图层
var projection = ol.proj.get('EPSG:3857');
var overlayLayer;//叠加图层

/**
 * 初始化地图
 */
function initMap() {
    //实例化比例尺控件（ScaleLine）
    var scaleLineControl = new ol.control.ScaleLine({
        //设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
        units: "metric"
    });
    //初始化Google图层
    googleLayer = new ol.layer.GoogleMapLayer({
        layerType: ol.source.GoogleLayerType.RASTER
    });
    //初始化地图容器
    map = new ol.Map({
        layers: [googleLayer],
        target: 'map', //地图容器div的ID
        view: new ol.View({
            projection: projection, //投影坐标系
            center: [12308196.042592192, 2719935.2144997073],
            minZoom: 2,
            zoom: 6
        }),
        //加载控件到地图容器中
        controls: ol.control.defaults().extend([scaleLineControl])//加载比例尺控件
    });

    /**
     * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
     */
    map.on('pointermove', function (e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    /**
     * 在地图容器中创建一个Overlay
     */
    popup = new ol.Overlay(/** @type {olx.OverlayOptions} */({
        element: popupElement,
        autoPan: true,
        positioning: 'bottom-center',
        stopEvent: false,
        autoPanAnimation: {
            duration: 250
        }
    }));
    map.addOverlay(popup);

    /**
     * 为map添加点击事件监听，渲染弹出popup
     */
    map.on('singleclick', function (evt) {
        var coordinate = evt.coordinate;
        //判断当前单击处是否有要素，捕获到要素时弹出popup
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return feature;
        });
        if (feature) {
            popupContent.innerHTML = ''; //清空popup的内容容器
            var type = feature.get('type');
            if (type == "river" || type == "Rver") {
                showDetailsInfo(feature);  //为水情要素点添加popup的信息内容
            } else if (type == "sq") {
                showSsyqDetailInfo(feature); //为雨情要素点添加popup的信息内容
            } else if (type == "typhoon") {
                showTFDetailsInfo(feature);
            } else {
                return;
            }
        }
    });

    /**
     * 为map添加move事件监听，变更图标大小实现选中要素的动态效果
     */
    map.on('pointermove', function (evt) {
        var coordinate = evt.coordinate;
        //判断当前鼠标悬停位置处是否有要素，捕获到要素时设置图标样式
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return feature;
        });
        if (feature) {
            var type = feature.get('type');
            if ((type == undefined) || (type == "tfMarker") || (type == "tfCircle")) {
                return;
            }
            if ((preFeature != null) && (preFeature !== feature)) { //如果当前选中要素与前一选中要素不同，恢复前一要素样式，放大当前要素图标
                var curImgURL = feature.get('imgURL');
                var preImgURL = preFeature.get('imgURL');
                feature.setStyle(createLabelStyle(feature, curImgURL, 1.2));
                preFeature.setStyle(createLabelStyle(preFeature, preImgURL, 0.8));
                preFeature = feature;
            }
            if (preFeature == null) { //如果前一选中要素为空，即当前选中要素为首次选中要素，放大当前要素图标
                var curImgURL = feature.get('imgURL');
                feature.setStyle(createLabelStyle(feature, curImgURL, 1.2));
                preFeature = feature;
            }
        } else {
            if (preFeature != null) { //如果鼠标移出前一要素，恢复要素图标样式
                var imgURL = preFeature.get('imgURL');
                preFeature.setStyle(createLabelStyle(preFeature, imgURL, 0.8));
                preFeature = null;
            }
        }
    });
}

/**
 * 根据图层类型加载Google地图
 * @param mapType 图层类型
 */
function loadGoogleMap(mapType) {
    switch (mapType) {
        case "terrain": //地形
            googleLayer = new ol.layer.GoogleMapLayer({
                layerType: ol.source.GoogleLayerType.TERRAIN
            });
            break;
        case "vector": //矢量
            googleLayer = new ol.layer.GoogleMapLayer({
                layerType: ol.source.GoogleLayerType.VEC
            });
            break;
        case "raster": //影像
            googleLayer = new ol.layer.GoogleMapLayer({
                layerType: ol.source.GoogleLayerType.RASTER
            });
            break;
        case "road": //道路
            googleLayer = new ol.layer.GoogleMapLayer({
                layerType: ol.source.GoogleLayerType.ROAD
            });
            break;
        case "BaiduMap":
            googleLayer = loadBaiduMap();
            break;
        case "BaiduMapSate":
            googleLayer = loadBaiduMapSate();
            break;
        case "AMap":
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
    map.addLayer(googleLayer); //添加Google地图图层
}

/**
 * 切换图层
 * @param layerType 图层类型
 */
function layerSwitch(layerType) {
    //移除Google图层
    map.removeLayer(googleLayer);
    //根据图层类型重新加载Google图层
    loadGoogleMap(layerType);
    //切换选中图层勾选项
    layerSwitchCheck(layerType);
}

/**
 * 叠加图层
 * @param layerType 图层类型
 */
function overlaySwitch(layerType) {
    overlaySwitchCheck(layerType);
    switch (layerType) {
        //谷歌交通图
        case "vector":
            if ($("#chkRoad").prop('checked')) {
                overlayLayer = new ol.layer.GoogleMapLayer({
                    layerType: ol.source.GoogleLayerType.ROAD
                });
                var layersArray = map.getLayers();
                layersArray.insertAt(1, overlayLayer);
            } else {
                map.removeLayer(overlayLayer);
                overlayLayer = null;
            }
            // map.addLayer(overlayLayer);
            break;
    }
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
                url:"/json/ajson.geojson",
                format:new ol.format.GeoJSON()
            });
            var vectorLayer = new ol.layer.Vector({
                source: vectorSource
            });
            //参数字段
            /*var wfsParams = {
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                maxFeatures:5000,
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
            });*/
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
 * 勾选事件
 * @param layerType 图层类型
 */
function overlaySwitchCheck(layerType) {
    switch (layerType) {
        case "vector":
            if ($("#chkRoad").prop('checked')) {
                $('#chkRoad').prop('checked', false);
            } else {
                $('#chkRoad').prop('checked', true);
            }
            break;
    }
}

/**
 * 切换选中图层勾选项
 * @param layerType 图层类型
 */
function layerSwitchCheck(layerType) {
    switch (layerType) {
        case "terrain":
            $('#rdoTerrain').prop('checked', true);
            break;
        case "vector":
            $('#rdoVector').prop('checked', true);
            break;
        case "raster":
            $('#rdoRaster').prop('checked', true);
            break;
        case "road":
            $('#rdoRoad').prop('checked', true);
            break;
        case "BaiduMap":
            $('#rdoBaiduMap').prop('checked', true);
            break;
        case "BaiduMapSate":
            $('#rdoBaiduMapSate').prop('checked', true);
            break;
        case "AMap":
            $('#rdoAMap').prop('checked', true);
            break;
        default:
            $('#rdoTerrain').prop('checked', true);
            break;
    }
}

/**
 * 显示某一选项卡的内容，如实时水情、实时雨情、台风路径等
 * @param type 类型
 */
function showContentDiv(type) {
    switch (type) {
        case 1:
            $("#bgDiv").show();
            $("#mapDataLayerDiv").hide();
            labelType = 1;
            $("#tabTitleBg").css("background-color", "#D3D2D2");
            $("#tabTitleData").css("background-color", "#BBC9DE");
            break;
        case 2:
            $("#bgDiv").hide();
            $("#mapDataLayerDiv").show();
            labelType = 2;
            $("#tabTitleBg").css("background-color", "#BBC9DE");
            $("#tabTitleData").css("background-color", "#D3D2D2");
            break;
        case 3:
            $("#bgDiv").hide();
            $("#mapDataLayerDiv").hide();
            labelType = 3;
            $("#tabTitleBg").css("background-color", "#BBC9DE");
            $("#tabTitleData").css("background-color", "#BBC9DE");
            break;
        default:
            break;
    }
}

/**
 * 选项卡弹出
 */
function initSQBtn() {
    //实时水情滑动按钮
    $("#splitBtn").click(function () {
        $("#bgDiv").toggle("show");
        if ($("#bgDiv").width() == 295) {
            $(".LabelList").hide("slow");
            $("#splitBtn").animate({right: 0});
            $(".splitDiv").css("background-position", "-28 0");
        } else {
            $(".LabelList").show("slow");
            $("#splitBtn").animate({right: 290});
            $(".splitDiv").css("background-position", "0 0");
        }
    });
}

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
 * 创建标注样式函数
 * @param {ol.Feature} feature 要素
 * @param {string} imgURL image图标URL
 * @param {number} image图标缩放比
 */
var createLabelStyle = function (feature, imgURL, scale) {
    return new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 0.5],
            anchorOrigin: 'top-right',
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            offsetOrigin: 'top-right',
            // offset:[-7.5,-15],
            scale: scale,  //图标缩放比例
            opacity: 1,  //透明度
            src: imgURL  //图标的url
        }))
    });
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