document.onkeydown = onKeyDown;

/**
 * 快捷键事件
 */
function onKeyDown() {
    //侧边栏`
    if (window.event.keyCode == 192) {
        showSidebarClick();
    }
    //放大键+=
    else if (window.event.keyCode == 187) {
        zoomIn();
    }
    //缩小键-_
    else if (window.event.keyCode == 189) {
        zoomOut();
    }
    //背景设置B
    else if (window.event.keyCode == 66) {
        showMapControlClick('backgroundPane', 'setLayersBtn', '');
        showMapControlClick('mapDataPane', 'setDataBtn', 'false');
        showMapControlClick('geolocatePane', 'geolocateBtn', 'false');
    }
    //地图数据F
    else if (window.event.keyCode == 70) {
        showMapControlClick('mapDataPane', 'setDataBtn', '');
        showMapControlClick('backgroundPane', 'setLayersBtn', 'false');
        showMapControlClick('geolocatePane', 'geolocateBtn', 'false');
    }
}
