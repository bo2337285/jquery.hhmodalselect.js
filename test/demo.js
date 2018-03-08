
$("#btn0").on('click', function(event) {
  $("#aa0").val("a0,b0,c0,d0,e0,f0,g0,h0,i0,j0,k0,l0,m0,n0,o0")
  $("#aa1").val("a1,a2,a3,a4,a5,a6,a7,a08,a09,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19")
  hhms.setDefalutVal()
});
$("#btn1").on('click', function(event) {
  hhms.removeAllSelectedItem();
});

function ctrl0(item,checked) {//选子项把所有父项选上
  var hhms = this;//组件实例
  var _item = item;
  while (!!_item.getParent()) {//存在父级时
    _item = _item.getParent();//缓存父级
    hhms.selectItem(_item,true);//选择父级
  }
}

function ctrl1(item,checked) {//选父项全选子项，取消任一子项取消父项
  var hhms = this;//组件实例
  if (checked) {//选中操作
    if(item.getChildren().length){//存在子集
      $.each(item.getChildren(),function(i, _item) {
        _item.select(true);//选中该项
      });
    }
  }else{//取消操作
    if (!!item.getParent()) {//存在父级
      item.getParent().select(false);//取消该父项
    }
  }
}

function onComplete(items,selectedItems) {//禁用任意级的项
  var hhms = this;//组件实例
  console.log(hhms);
  var item0 = items[0];//取得第0级的项集合
  $.each(item0,function(i, item) {//遍历集合并使其禁用
    item.setDisabled();
  });
}

function ctrl3(item,checked) {//单选
  var hhms = this;//组件实例
  var items = hhms.getSelectedItems();
  var todoItems = [];//待处理item集合
  $.each(items,function(i, _item) {//把选中的全取消了
    if (_item != item) {//如果是自己则跳过
      todoItems.push(_item);//放入待处理集合中
    }
  });
  $.each(todoItems,function (i,_item) {//处理待处理集合
    hhms.selectItem(_item,false);//取消item项
  })
}

function ctrl4(item,checked) {//同级单选
  var hhms = this;//组件实例
  var items = hhms.getSelectedItems();
  var todoItems = [];//待处理item集合
  $.each(items,function(i, _item) {//把选中的全取消了
    if (_item.getParent() == item.getParent() && _item != item) {//如果是同父项则取消
      todoItems.push(_item);//放入待处理集合中
    }
  });
  $.each(todoItems,function (i,_item) {//处理待处理集合
    hhms.selectItem(_item,false);//取消item项
  })
}

function ctrl5(item,checked) {//同类单选
  var hhms = this;//组件实例
  var items = hhms.getSelectedItems();
  var todoItems = [];//待处理item集合
  $.each(items,function(i, _item) {//把选中的全取消了
    if (_item.name == item.name && _item != item) {//如果是同name项则取消
      todoItems.push(_item);//放入待处理集合中
    }
  });
  $.each(todoItems,function (i,_item) {//处理待处理集合
    hhms.selectItem(_item,false);//取消item项
  })
}

function selectedLabelFmt(item,selectedItems) {
  var str = "";
  for (var i = 0; i < selectedItems.length; i++) {
    if(str.length) str += "|";
    str += selectedItems[i]["label"];
  }
  return str;
}

var onCheck = function(item,checked){
  ctrl1.apply(this, arguments);//选父项全选子项，取消任一子项取消父项
  if (checked) {
    // ctrl0.apply(this, arguments);//选子项把所有父项选上
    // ctrl3.apply(this, arguments);//单选
    // ctrl4.apply(this, arguments);//同级单选
    // ctrl5.apply(this, arguments);//同类单选
  }
}
var onModalSubmit = function () {
  console.log(arguments);
}
var onModalCancel = function () {
  console.log(arguments);
}
var onRemoveAllSelectedItem = function () {
  console.log(this);
  console.log(arguments);
}
