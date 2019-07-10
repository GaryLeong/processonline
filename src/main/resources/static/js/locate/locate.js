let coordLocBtn = document.getElementById('coordLocBtn');
coordLocBtn.addEventListener('click', locateByCoord, false);
let closeGeoLocateBtn = document.getElementById('closeGeoLocateBtn');
closeGeoLocateBtn.addEventListener('click', closeGeoLocatePane, false);

/**
 * 定位
 */
function locateByCoord() {
    let coord = $("#txtCoord").val();
    if (coord == "") {
        layuiLayer.open({
            title: '提示',
            content: '请输入坐标'
        })
    } else {
        let myCoord = [parseFloat(coord.split(',')[0]), parseFloat(coord.split(',')[1])];
        map.getView().setCenter(myCoord);//设置地图中心点
    }
}

/**
 * 关闭定位窗口
 */
function closeGeoLocatePane() {
    showMapControlClick('geolocatePane', 'geolocateBtn', '');
}

