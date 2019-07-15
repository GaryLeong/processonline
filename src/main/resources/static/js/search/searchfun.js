let featurelist = document.getElementById('featurelist');
let elements = featurelist.getElementsByClassName('feature-list-item');
for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener('click', featurelistitemclick(elements[i]), false);
}

$('#searchInput').keypress(function (event) {
    //回车事件
    if (event.which === 13) {
        //根据ID获取属性数据
        var id = $('#searchInput').val();
        alert($('#searchInput').val());
        getObjectByID(id);
    }
});

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
    var objName = datas[0].features[0].properties.ObjName;
    /*  <button class="feature-list-item" style="opacity: 1;">
      <div class="label">
      <img src="/svg/iD-sprite/icons/icon-sidebar-left.svg" class="icon ">
      <span class="entity-type">驾驶线路</span>
      <span class="entity-name">深南大道</span>
      </div>
      </button>*/

    var btn = document.createElement("button");
    btn.setAttribute('class', 'feature-list-item');
    btn.setAttribute('style', 'opacity: 1;');
    var labelDiv = document.createElement("div");
    labelDiv.setAttribute('class', 'label');
    btn.appendChild(labelDiv);
    var img = document.createElement('img');
    img.setAttribute('src', '/svg/iD-sprite/icons/icon-line.svg');
    img.setAttribute('class', 'icon ');
    labelDiv.appendChild(img);
    var typeSpan = document.createElement('span');
    typeSpan.setAttribute('class', 'entity-type');
    labelDiv.appendChild(typeSpan);
    var nameSpan = document.createElement('span');
    nameSpan.setAttribute('class', 'entity-name');
    nameSpan.innerText = objName;
    labelDiv.appendChild(nameSpan);
    var geocodeItem = $('.geocode-item');
    geocodeItem.insertAfter(btn, geocodeItem);
}

/**
 * 搜索项点击事件-点击定位
 */
function featurelistitemclick(element) {

}