let featurelist = document.getElementById('featurelist');
let elements = featurelist.getElementsByTagName('button');
for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener('click', featurelistitemclick(elements[i]), false);
}

$('#searchInput').keypress(function (event) {
    if (event.which === 13) {
        //点击回车要执行的事件
        alert($('#searchInput').val());
    }
});

function drawFeaturelist() {

}


/**
 * 搜索项点击事件-点击定位
 */
function featurelistitemclick(element) {

}