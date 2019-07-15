$(function () {
    createMapLayerList();
});

var setting = {
    view: {
        /* addHoverDom: addHoverDom,
         removeHoverDom: removeHoverDom,*/
        selectedMulti: true
    },
    check: {
        enable: true
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    edit: {
        enable: false
    }
};

/**
 * 生成图层列表
 */
function createMapLayerList() {
    //ajax发送请求
    $.ajax({
            //请求方式
            type: 'get',
            //请求的媒体类型
            contentType: 'application/json;charset=UTF-8',
            //请求地址
            url: 'http://192.168.201.71:8080/geoserver/ows?request=getLayer&service=geominfo&version=1.0.0',
            //请求成功
            success: function (result) {
                let zNodes = getMapLayerList(result);
                $.fn.zTree.init($("#treeDemo"), setting, zNodes);
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
 * 获取图层列表
 * @param result
 * @returns {*}
 */
function getMapLayerList(result) {
    let zNodes = [];
    let layerLevel;
    let obj = JSON.parse(result);
    let msg = obj.msg;
    if (msg != 'success') {
        layuiLayer.open({
                title: '提示',
                content: '获取图层列表失败'
            }
        );
        return;
    }
    let datas = obj.data;
    let level1Datas = datas.filter(function (obj) {
        return obj.layerLevel == 1;
    });
    if (level1Datas != null && level1Datas.length > 0) {
        layerLevel = 1;
        zNodes.push(createOneData(-layerLevel, 0, 'Level1', 1));
        let level1RoadDatas = level1Datas.filter(function (obj) {
            return obj.layerTypeID == 1;
        });
        if (level1RoadDatas != null && level1RoadDatas.length > 0) {
            zNodes.push(createOneData(layerLevel, -layerLevel, '道路'));
            for (let i = 0, len = level1RoadDatas.length; i < len; i++) {
                let layerID = level1RoadDatas[i].layerID;
                let layerName = level1RoadDatas[i].layerName;
                zNodes.push(createOneData(layerID, layerLevel, layerName, ''));
            }
        }
    }
    return zNodes;
}

/**
 * 生成一条记录
 * @param id
 * @param pId
 * @param name
 * @param layerLevel
 * @returns {Object}
 */
function createOneData(id, pId, name, layerLevel) {
    /*{id: 1, pId: 0, name: "[core] 基本功能 演示", open: true},
    {id: 101, pId: 1, name: "最简单的树 --  标准 JSON 数据"},*/
    let obj = new Object();
    let open;
    if (layerLevel > 0) {
        if (layerLevel == 1) {
            open = 'true';
        } else {
            open = 'false';
        }
        obj.id = id;
        obj.pId = 0;
        obj.name = name;
        obj.open = open;
    } else {
        obj.id = parseInt(id);
        obj.pId = parseInt(pId);
        obj.name = name;
    }
    return obj;
}

var newCount = 1;

/**
 * 添加节点
 * @param treeId 节点ID
 * @param treeNode 节点
 */
function addHoverDom(treeId, treeNode) {
    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
        + "' title='add node' onfocus='this.blur();'></span>";
    sObj.after(addStr);
    var btn = $("#addBtn_" + treeNode.tId);
    if (btn) btn.bind("click", function () {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        zTree.addNodes(treeNode, {id: (100 + newCount), pId: treeNode.id, name: "new node" + (newCount++)});
        return false;
    });
};

/**
 * 删除节点
 * @param treeId 节点ID
 * @param treeNode 节点
 */
function removeHoverDom(treeId, treeNode) {
    $("#addBtn_" + treeNode.tId).unbind().remove();
};