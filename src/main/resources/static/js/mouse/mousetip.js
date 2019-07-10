/**
 * 放大按钮鼠标移入事件
 */
zoomInBtn.onmouseover = function () {
    mouseOverFun(zoomInBtn);
};

/**
 * 放大按钮鼠标移开事件
 */
zoomInBtn.onmouseout = function () {
    mouseOutFun(zoomInBtn);
};

/**
 * 放小按钮鼠标移入事件
 */
zoomOutBtn.onmouseover = function () {
    mouseOverFun(zoomOutBtn);
};

/**
 * 放小按钮鼠标移开事件
 */
zoomOutBtn.onmouseout = function () {
    mouseOutFun(zoomOutBtn);
};

/**
 * 位置按钮鼠标移入事件
 */
geolocateBtn.onmouseover = function () {
    mouseOverFun(geolocateBtn);
};

/**
 * 位置按钮鼠标移开事件
 */
geolocateBtn.onmouseout = function () {
    mouseOutFun(geolocateBtn);
};

/**
 * 背景按钮鼠标移入事件
 */
setLayersBtn.onmouseover = function () {
    mouseOverFun(setLayersBtn);
};

/**
 * 背景按钮鼠标移开事件
 */
setLayersBtn.onmouseout = function () {
    mouseOutFun(setLayersBtn);
};

/**
 * 地图数据按钮鼠标移入事件
 */
setDataBtn.onmouseover = function () {
    mouseOverFun(setDataBtn);
};

/**
 * 地图数据按钮鼠标移开事件
 */
setDataBtn.onmouseout = function () {
    mouseOutFun(setDataBtn);
};

let barBtn = document.getElementById('barBtn');
/**
 * 侧边栏按钮鼠标移入事件
 */
barBtn.onmouseover = function () {
    mouseOverFun(barBtn);
};

/**
 * 侧边栏按钮鼠标移开事件
 */
barBtn.onmouseout = function () {
    mouseOutFun(barBtn);
};

/**
 * 鼠标移入事件
 * @param clickBtn 点击按钮
 */
function mouseOverFun(clickBtn) {
    let myDiv = clickBtn.getElementsByTagName('div').item(0);
    let className = myDiv.className;
    myDiv.className = className + ' in';
}

/**
 * 鼠标移出事件
 * @param clickBtn 点击按钮
 */
function mouseOutFun(clickBtn) {
    let myDiv = clickBtn.getElementsByTagName('div').item(0);
    let className = myDiv.className;
    //去除class中的in属性
    const reg = new RegExp('in');
    className = className.replace(reg, '');
    className = className.trim();
    myDiv.className = className;
}
