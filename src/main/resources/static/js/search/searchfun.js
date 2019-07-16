let featurelist = document.getElementById('featurelist');
let listDatas;

/**
 * 搜索输入框添加回车enter事件
 */
$('#searchInput').keypress(function (event) {
    //回车事件
    if (event.which === 13) {
        //根据ID获取属性数据
        var id = $('#searchInput').val();
        getObjectByID(id);
    }
});

/**
 * 监听输入事件，输入为空时清空输入框
 */
$('#searchInput').on('input propertychange', function () {
    //获取input 元素,并实时监听用户输入
    if ($('#searchInput').val() == null || $('#searchInput').val() == '') {
        let innerHtml = "<button disabled=\"\" class=\"no-results-item\" style=\"display: none;\">" +
            "<svg class=\"icon pre-text\">" +
            "<use xlink:href=\"#iD-icon-alert\"></use></svg>" +
            "<span class=\"entity-name\">" +
            "在可见地图区域没有结果\n" +
            "</span></button>" +
            "<button class=\"geocode-item\" style=\"display: none;\">" +
            "<div class=\"label\">" +
            "<span class=\"entity-name\">" +
            "在全球搜索..." +
            "</span></div></button>";
        featurelist.innerHTML = innerHtml;
    }
});

/**
 * 根据id获取对象
 * @param id
 */
function getObjectByID(id) {
    //ajax发送请求
    $.ajax({
            //请求方式
            type: 'get',
            //请求的媒体类型
            contentType: 'application/json;charset=UTF-8',
            //请求地址
            url: 'http://192.168.201.71:8080/geoserver/ows?request=getGeom&service=geominfo&version=1.0.0&ObjectID=' + parseInt(id),
            //请求成功
            success: function (result) {
                drawFeaturelist(result);
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                console.log(e.status);
                console.log(e.responseText);
            }
        }
    );
}

/**
 * 显示搜索列表
 * @param result
 */
function drawFeaturelist(result) {
    var obj = JSON.parse(result);
    var msg = obj.msg;
    if (msg != 'success') {
        layuiLayer.open({
                title: '提示',
                content: '获取图层列表失败'
            }
        );
        return;
    }
    var datas = obj.data;
    var type = '干线道路';
    if (datas != null && datas.length > 0) {
        listDatas = datas;
    }
    for (let i = 0, len = listDatas[0].features.length; i < len; i++) {
        let objName = listDatas[0].features[i].properties.ObjName;
        let OID = listDatas[0].features[i].properties.OID;
        let innerHtml = "<button disabled=\"\" class=\"no-results-item\" style=\"display: none;\">" +
            "<img src=\"/svg/iD-sprite/icons/icon-alert.svg\" class=\"icon pre-text\">" +
            "<span class=\"entity-name\">" +
            "在可见地图区域没有结果" +
            "</span>" +
            "</button>";
        innerHtml += "<button class=\"feature-list-item\" style=\"opacity: 1;\" id=\"" + OID + "\" > " +
            "<div class=\"label\">" +
            "<img src=\"/svg/iD-sprite/icons/icon-line.svg\" class=\"icon pre-text\">" +
            "<span class=\"entity-type\">" + type + "</span>" +
            "<span class=\"entity-name\">" +
            objName +
            "</span></div></button>";
        innerHtml += "<button class=\"geocode-item\" style=\"display: none;\">" +
            "<div class=\"label\">\n" +
            "<span class=\"entity-name\">在全球搜索..." +
            "</span></div></button>";
        featurelist.innerHTML = innerHtml;
    }
    //添加点击监听事件
    $('.feature-list-item').on('click', function () {
        featureItemClick($(this)[0].id);
    });
}

/**
 * 搜索项点击事件-点击定位
 * @param element
 */
function featureItemClick(id) {
    var itemData = getFeaById(id);
    //定位
    var coords = itemData.geometry.coordinates[0];
    map.getView().setCenter(coords[0]);
}

/**
 * 通过id获取feature
 * @param id
 * @returns {*}
 */
function getFeaById(id) {
    for (let i = 0, len = listDatas[0].features.length; i < len; i++) {
        if (listDatas[i].features[i].properties.OID == id)
            return listDatas[i].features[i];
    }
}