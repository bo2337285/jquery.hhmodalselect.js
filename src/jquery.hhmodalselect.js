/**
* @name jquery.hhmodalselect.js
* @author hbf
* @version 2.0.10_build2
* @lastUpdate 2017-03-29
* @copyright hhdata
**/
(function  ($) {
	$.fn.hhModalSelect = function(option) {
		var $input = $(this).attr("readonly","readonly");
		if(!$input.length){
		    console.error("Can't find selectElement which selector is :"+$input.selector);
            return false;
        }
        //若是已初始化，则返回函数对象
		if($input.data()["hhms"]){
		    var hhms = $input.data()["hhms"];
			return hhms;
		}
		var setting = {
			data:[],
			zIndex : 20000000,//设置弹出层的层级,默认比弹窗组件layer高
			required :	false,//是否必须选中至少一项，默认值为false
			defaultItem : 0,//当required值为true时，以defaultItem的值来选择默认项
			keys:{ id:"id", name:"name", label:"label", children:"children" },
			outputDom:[],
			placeholder : '请输入关键字以查询',
			menuHideTime : 700,
			selectedCount : 0,//为0时不限制个数
			onComplete : function (items,selectedItems) {},//当初始化结束
			itemOnCheck : function (item,checked) {},//item被选中/取消时
			onModalSubmit : function (selectedItems) {},//当确定保存选项时
			onModalCancel : function (selectedItems,cancelItems) {},//当取消保存选项时
			onRemoveAllSelectedItem : function () {},//当移除所有选中项时
			selectedLabelFmt :function (items,selectedItems) {},//在结算时格式化文本函数
			isShowChkAll : false//是否显示多选
		}
		//合并第一层的参数
		// for(var key in option){
	  //   if(typeof(option[key]) == "object"){
    //     option[key] = $.extend(setting[key],option[key],{});
	  //   }
    // }
		var opt = $.extend({},setting,option);
		opt.data = $.extend(true,[],opt.data);//深拷贝数据

		var m,r,d;//各模块实例
		var hhms;//组件实例
		var isFirstDraw = true;//是否是初次绘制，判断showModal方法是否需要绘制0级item的flag;
//----------------常量池-----------------------------------------------
		//常量池
		var keysUtils = opt.keys;
		var strUtils = {
			active : 'hhms-active',
			items : "项",
			selectedItems : "已选择 : ",
			selectAll: "全选",
			selectInverse : "反选",
			disabled : "disabled",
			noItems : "查无信息",
			hasItems : "共有",
			selectedNotOver : "所选不得超过",
			clearBtn : "清除已选结果",
			submitBtn : "确定",
			cancelBtn : "取消"
		}
//----------------Manager----------------------------------------------
		//内部管理类
		function Manager(){
			var _self = this;
			_self.$source = $input;
			_self.data = opt.data;
			_self.value = [];
			_self.items = {};
			_self.selectedItems = [];
			_self.tmpSelectedItems = [];
			_self.queryItems = {};
			_self.$itemTmp = $('<tr><td class="hhms-td-type"></td><td class="hhms-td-name"></td><td class="hhms-td-path"></td></tr>');
			_self.$selectTmp = $('<span class="hhms-item"><label class="hhms-item-text"></label><span class="hhms-item-del"></span></span>');
			_self.$crumbsTmp = $('<span class="hhms-item"></span>');
			_self.$dlTmp = $('<dl><dt></dt><dd></dd></dl>');
			_self.crumbs = [];//面包屑
			_self.currItems = [];//当前要渲染的items（为了区分掉query来的items）
			_self.renderItems = [];//当前显示的items
		}
		Manager.prototype = {
			init : function  () {
				var _self = this;
				_self.initItems();
				_self.initItemPath();
				// _self.defaultSelect();
			},
			reset : function () {
				var _self = this;
				_self.$source = $input;
				_self.data = d.data;
				_self.value = [];
				_self.items = {};
				_self.selectedItems = [];
				_self.tmpSelectedItems = [];
				_self.queryItems = {};
				_self.crumbs = [];//面包屑
				_self.currItems = [];
			},
			onInitItem : function  (item) {
			},
			initItems : function(data){
				var _self = this;
				var data = data || d.data;
				var output = [];
				var target = function  (cData,pData) {
					return true;
				}
				var opera = function  (cData,pData) {
					var key = pData?pData.key+"|":""
					cData["key"] = key+cData[keysUtils["id"]];
					var isTop = !Boolean(pData);
					var level = isTop?0:Number(pData["level"])+1;
					cData["level"] = level;
					var cItem = new Item(cData);
					_self.onInitItem(cItem);//item回调
					cData.item = cItem;
					if(!isTop){//建立item父子关系
						var pItem = pData.item;
						cItem._parent = pItem;
						pItem._children.push(cItem);
					}
					if(!_self.items[level]) _self.items[level] = [];//判断是否存在当前级的items集，无则新建个
					var levelItems = _self.items[level];
					levelItems.push(cItem);//把item塞入m中
				}
				d.recursive(data,target,opera);
				return output;
			},
			initItemPath : function (){
				var _self = this;
				for (var level in _self.items) {
					$.each(_self.items[level],function (i,item) {
						_self.bulidItemPath(item);
					})
				}
			},
			bulidItemPath : function (item) {
				 var str = "";
				 var _item = item;
				 if (!!_item._parent) {
				 	str += item._parent.path+ item._parent.label + "\\";
					}else {
						str = "\\"
					}
				 item.path = str;
			},
			itemBeforeCheck : function  (item,checkbox) {
				var checked = checkbox.checked;
				var selectedItems = m.selectedItems;
				if(opt.selectedCount && checked && selectedItems.length>=opt.selectedCount) {
					m.setTips(strUtils["selectedNotOver"]+selectedItems.length+strUtils["items"])
					checkbox.checked = false;
					return false;
				}
				return true;
			},
			itemOnCheck : function (item,checked) {
				opt.itemOnCheck.apply(hhms,arguments)
			},
			setSelfEnabled : function  (item) {
				item.setEnabled();
				// item.setCheckboxEnabled();
			},
			setSelfDisabled : function  (item) {
				var _self = this;
				item.setDisabled();
				// item.setCheckboxDisabled();
				_self.removeSelectedItem(item);
			},
			setAllEnabled : function  () {
				var _self = this;
				for(var i in _self.items){
					_self.items[i].map(function(item){
						_self.setSelfEnabled(item)
					})
				}
			},
			setAllDisabled : function  () {
				var _self = this;
				for(var i in _self.items){
					_self.items[i].map(function(item){
						_self.setSelfDisabled(item)
					})
				}
			},
			setChildrenEnabled : function  (item) {//让子级可选
				var _self = this;
				if (!item._children) return;
				var children = item._children;
				for (var i = 0; i < children.length; i++) {
					// children[i].setCheckboxEnabled();
					_self.setSelfEnabled(children[i]);
				};
			},
			setChildrenDisabled : function  (item) {//让子级不可选
				var _self = this;
				if (!item._children) return;
				var children = item._children;
				for (var i = 0; i < children.length; i++) {
					_self.setSelfDisabled(children[i]);
				};
			},
			setSiblingsEnabled : function  (item) {//让兄弟级可选
				var _self = this;
				var items = _self.getSiblingsItems(item);
				for (var i = 0; i < items.length; i++) {
					var _item = items[i];
					if (_item == item) continue;
					_self.setSelfEnabled(_item);

					// _self.setChildrenEnabled(_item);
				};
			},
			setSiblingsDisabled : function  (item) {//让兄弟级不可选
				var _self = this;
				var items = _self.getSiblingsItems(item);
				for (var i = 0; i < items.length; i++) {
					var _item = items[i];
					if (_item == item) continue;
					_self.setSelfDisabled(_item);

					// _self.setChildrenDisabled(_item);
				};
			},
			getSiblingsItems : function  (item) {//获取兄弟节点
				var _self = this;
				if(item._parent) {
					return item._parent._children;//同个父级下的兄弟
				}else{
					var level = item.level;
					return _self.items[level];//顶级的话就是同等级的兄弟
				}
			},
			setParentEnabled : function  (item) {//让父亲节点可选
				if (!item._parent) return;
				var parent = item._parent;
				_self.setSelfEnabled(parent);
			},
			setParentDisabled : function  (item) {//让父亲节点不可选
				if (!item._parent) return;
				var parent = item._parent;
				_self.setSelfDisabled(parent);
			},
			//添加选中item
			addSelectedItem : function  (item) {
				var _self = this;
				var selectedItems = _self.selectedItems;
				var idx = _self.checkedItemExist(item,selectedItems);
				if(!(idx>-1)){
					selectedItems.push(item);
					r.addSelectedItem(item);
					item.setChk(true);//同步checkbox
					// _self.itemOnCheck(item,true);
				}
			},
			removeSelectedItem : function  (item) {
				var _self = this;
				var selectedItems = _self.selectedItems;
				var idx = _self.checkedItemExist(item,selectedItems);
				if(idx>-1){
					selectedItems.splice(idx,1);
					r.removeSelectedItem(item);
					item.setChk(false);//同步checkbox
					// _self.itemOnCheck(item,false);
				}
			},
			checkedItemExist : function  (item,array) {
				for (var i = 0; i < array.length; i++) {
					if(array[i]["key"] == item["key"]) return i;
				};
				return -1;
			},
			fillItems : function  (items) {
				for (var i = 0; i < items.length; i++) {
					var item = items[i]
					if(item._parent && !check(item._parent)){
						items.push(item._parent);
					}

				};
				function check (item) {
					for (var j = 0; j < items.length; j++) {
						if(items[j]["key"] === item["key"]) return true;
					};
					return false;
				}
				return items;
			},
			setTips : function  (text) {
				var $tips = r.$ele.$tips;
				$tips.text(text);
				if($tips.data()["timeout"]) clearTimeout($tips.data()["timeout"]);
				$tips.data()["timeout"] = setTimeout(function  () {
					$tips.text('');
				},1000)
			},
			filterWord : function  (label) {
				label = $.trim(label);
				return label;
			},
			getItemsByData : function  (datas) {
				var items = [];
				for (var i = 0; i < datas.length; i++) {
					items.push(datas[i].item)
				};
				return items;
			},
			removeAllSelectedItem : function  () {
				var _self = this;
				var selectedItems = $.extend([], m.selectedItems);
				$.each(selectedItems,function(i, item) {
					_self.removeSelectedItem(item);
				});
				r.synChkAll();
				_self.setSelectedItemLabel();//清除之前的文本
				_self.onRemoveAllSelectedItem.apply(hhms, [selectedItems]);
			},
			onRemoveAllSelectedItem : function  () {
				opt.onRemoveAllSelectedItem.apply(this,arguments);
			},
			getSelectedItemVal : function(valueKey) {
				var _self = this;
				var selectedItems = m.selectedItems;
				//console.log(selectedItems);
				// var output = {};
				var $output = r.$ele.$output;
				$output.val("")
				if(!opt.outputDom.length) return;
				for (var i = 0; i < selectedItems.length; i++) {
					var value = selectedItems[i]["data"][valueKey];
					var itemoutput = selectedItems[i]["outputDom"];
					if (!itemoutput) continue;
					var _id = itemoutput["id"];
					var _name = itemoutput["name"];
					var $_input = $("#"+_id);
					var _val = $_input.val();
					if(_val.length) _val+=","
					$_input.val(_val+value);
				};
				// return output;
			},
			setSelectedItemLabel : function() {
				var _self = this;
				var selectedItems = m.selectedItems;
				var outputLabel = opt.selectedLabelFmt.apply(hhms, [m.items, selectedItems]);
				if (!!!outputLabel) {
					outputLabel = "";
					for (var i = 0; i < selectedItems.length; i++) {
						if(outputLabel.length) outputLabel += ",";
						outputLabel += selectedItems[i]["label"];
					};
				}
				m.$source.val(outputLabel).attr("title",outputLabel)
			},
			onModalSubmit : function  () {
				opt.onModalSubmit.apply(hhms,arguments);
			},
			onModalCancel : function  () {
				opt.onModalCancel.apply(hhms,arguments);
			},
			modalSubmit : function  () {
				var _self = this;
				var selectedItems = [].concat(_self.selectedItems);//因为要输出，所以对数组深拷贝
				_self.setSelectedItemLabel();//把label放文本框里
				_self.getSelectedItemVal(opt.keys.id);
				_self.onModalSubmit(selectedItems);
			},
			modalCancel : function  () {
				var _self = this;
				var selectedItems = [].concat(_self.selectedItems);//因为要输出，所以对数组深拷贝
				var tmpSelectedItems = [].concat(_self.tmpSelectedItems);//因为要输出，所以对数组深拷贝
				$.each(selectedItems,function(i, item) {//去除当前已选
					_self.removeSelectedItem(item)
				});
				$.each(tmpSelectedItems,function(i, item) {//恢复上次选择
					_self.addSelectedItem(item)
				});
				_self.setSelectedItemLabel();//把label放文本框里
				_self.onModalCancel(tmpSelectedItems,selectedItems);
			},
			clearInput : function(){
				r.clearInput();
			},
			getItemsByParams : function  (params) {//param:{"level":0,"id":a0}
				var _self = this;
				var datas = d.queryByParams(params);
				return _self.getItemsByData(datas);
			},
			defaultSelect : function(){
				//根据参数required的值来确定是否默认设置一个选项被选中的方法
				var _self = this,
						required = opt.required;
				if(required){
					//如果required=true，表示需要默认选中一项
					//如果output本来就有内容，则不做任何操作
					//如果output没有内容，则将第一项默认设置为被选中.
					var $output = r.$ele.$output;
					var flag = false;
					$output.each(function(i,input){
						if(!!$(input).val()){//如果文本框有值,则设置flag=true，flag标识文本框是否有值
							flag = true;
							return false;//跳出
						}
					});
					if(!flag){//如果flag=false,表示文本框没有值
						var defItem = _self.items[0][opt.defaultItem],//设置默认项选择第一项
								outputDom = defItem.outputDom,
								domSelector = "#"+outputDom["id"],
								value = defItem["data"][opt.keys.id];
						$(domSelector).val(value);
						m.requiredItem = defItem;//判断是否有默认选中项
					}
					hhms.setVal();//设置默认选择框的选择项
				}
			},
			setCrumbs : function (item) {//根据传入的item设置面包屑
				var _self = this;
				var _item = item;
				_self.crumbs = [];
				if(!!item){
					_self.crumbs.push(_item);
					while(!!_item._parent){
						_item = _item._parent
						_self.crumbs.push(_item);
					}
					_self.crumbs = _self.crumbs.reverse();
				}
				r.setCrumbs(_self.crumbs);
			},
			queryItem : function (label) {//查询item
				var _self = this,items = [];
				label = _self.filterWord(label);

				if($.trim(label).length){
					items = _self.getItemsByData(d.queryByParam(keysUtils["label"],label));
				}else if(m.currItems.length){
					items = m.currItems
				}
				_self.renderItems = items;
				r.setItems(items);
			},
			onComplete : function () {
				opt.onComplete.apply(hhms,arguments)
			},
			onChkAll : function (flag) {
				var renderItems = m.renderItems;
				// var currItems = m.currItems;
				$.each(renderItems, function(i, item) {
					if (item.status == flag) {//状态一样则跳过
						return true;
					}
					flag? m.addSelectedItem(item) : m.removeSelectedItem(item)
				});
			}
		}
//----------------Render-----------------------------------------------
		//渲染类
		function Render() {
			var _self = this;
			_self.$ele = {};
		}
		//函数集
		Render.prototype = {
			init: function() {
				var _self = this;
				_self.buildWrap();
				_self.bindEvents();
			},
			//构造外部容器
			buildWrap : function(){
				var _self = this;
				var $body = $("body");
				var $source = m.$source.addClass("hhms-source");
				var selectedCount = (opt.selectedCount)?','+strUtils["selectedNotOver"]+opt.selectedCount+strUtils["items"]:'';
				var domStr = '<div class="hhms-modal-wrap">'+
					'<div class="hhms-modal-mask"></div>'+
					'<div class="hhms-modal-menu">'+
						'<div class="hhms-title">请选择：</div>'+
						'<div class="hhms-context">'+

							'<div class="hhms-queryArea">'+
								'<input placeholder='+opt.placeholder+selectedCount+' class="hhms-queryInput" type="text" /><label class="hhms-tips"></label><button type="button" class="btn-cancel hhms-clearBtn">'+strUtils.clearBtn+'</button>'+
							'</div>'+
							'<div class="hhms-selectedArea"><div class="hhms-selectedArea-inner"></div></div>'+
							'<div class="hhms-crumbsArea"></div>'+
							'<div class="hhms-listArea"><table class="hhms-table"><tr><th class="hhms-th-type">类别</th><th class="hhms-th-name">名称</th><th class="hhms-th-path">路径</th></tr></table><div class="hhms-table-body-wrap"><table class="hhms-table-body"></table></div><div class="hhms-table-bg"></div></div>'+
						'</div>'+
						'<div class="hhms-btns">'+
							'<button type="button" data-role="submit" class="btn-info">'+strUtils.submitBtn+'</button>&nbsp;&nbsp;&nbsp;&nbsp;'+
							'<button type="button" data-role="cancel" class="btn-cancel">'+strUtils.cancelBtn+'</button>'+
						'</div>'+
					'</div>'+
				'</div>';
				var $modal = $(domStr);
				$modal.css("zIndex",opt.zIndex)

				_self.$ele = {
					$modal : $modal,
					$mask : $modal.find(".hhms-modal-mask"),
					$submit : $modal.find("[data-role='submit']"),
					$cancel : $modal.find("[data-role='cancel']"),
					$selectedArea : $modal.find(".hhms-selectedArea-inner"),
					$listArea : $modal.find(".hhms-listArea"),
					$crumbsArea : $modal.find(".hhms-crumbsArea"),
					$queryInput : $modal.find(".hhms-queryInput"),
					$clearBtn : $modal.find(".hhms-clearBtn"),
					$tips : $modal.find(".hhms-tips"),
					$output : $()
				}

				if (opt.isShowChkAll) {
					var $chkAllWrap = $("<div class='hhms-all-checkbox-wrap'><span><input class='hhms-all-checkbox' type='checkbox'/></span></div>")
					_self.$ele.$listArea.find('.hhms-th-name').append($chkAllWrap);
					_self.$ele.$chkAll = $chkAllWrap.find(".hhms-all-checkbox");
				}

				$body.append($modal);
				//输出用
				var output = opt.outputDom;
				for (var i = 0; i < output.length; i++) {
					var _id = output[i]["id"];
					var _name = output[i]["name"];
					var _level = output[i]["level"];
					var $input = $("#"+_id).length?$("#"+_id) : $("<input id='"+_id+"' type='hidden' />").insertAfter(m.$source);
					$input.attr({"name":_name,"data-level":_level})
					$input.data()["hhms"] = m.$source;
					_self.$ele.$output = _self.$ele.$output.add($input)
				};
			},
			//绑定容器事件
			bindEvents : function() {
				var _self = this;
				m.$source.on("click.hhms",function(e) {
					_self.showModal();
					e.stopPropagation();
				})
				_self.$ele.$submit.on("click",function(e) {
					if(!_self.atLeastOneSelected()) return;//如果被选择的项小于0
						m.modalSubmit();
						m.clearInput();
						_self.hideModal();
				})
				_self.$ele.$cancel.on("click",function(e) {
					m.modalCancel();
					m.clearInput();
					_self.hideModal();
				})
				_self.$ele.$clearBtn.on("click",function(e) {
					m.removeAllSelectedItem();
				})
				_self.$ele.$queryInput.on("keyup",function  () {
					var label = $(this).val();
					m.queryItem(label);
				})
				// //鼠标滚轮
				// if(navigator.userAgent.indexOf('Firefox') >= 0){   //firefox
				// 	_self.$ele.$modal[0].addEventListener("DOMMouseScroll", function(e) {//兼容ff
				// 		_self.$ele.$listArea[0].scrollTop += e.detail > 0 ? 60 : -60;
	      //     e.preventDefault();
				// 	});
				// }else {
				// 	_self.$ele.$modal[0].onmousewheel = function(e){
				// 		e = e || window.event;
	      //     _self.$ele.$listArea[0].scrollTop += e.wheelDelta > 0 ? -60 : 60;
	      //     return false;
				// 	}
				// }
				//滚动时计算表头位置 ie下效果不佳
				// _self.$ele.$listArea.on('scroll', function(e) {
				// 	$(this).find(".hhms-table").css("top",$(this).scrollTop());
				// 	e.preventDefault();
				// });
				//复选框
				_self.$ele.$listArea.on("click",".hhms-item-chk",function () {
					var item = $(this).parents("tr")[0]["_item"];
					// var item = $(this).parents("tr").data("item");
					var checked = this.checked;
					checked ? m.addSelectedItem(item) : m.removeSelectedItem(item);
					m.itemOnCheck(item,checked);
				})
				_self.$ele.$listArea.on("click",".hhms-all-checkbox",function () {
					var checked = this.checked;
					m.onChkAll(checked)
				})
				//选下级
				_self.$ele.$listArea.on("click",".hhms-item-label.hhms-item-p",function () {
					var item = $(this).parents("tr")[0]["_item"];
					var items = item._children;
					_self.setItems(items);
					m.currItems = items;
					m.setCrumbs(item);
				})
				//面包屑
				_self.$ele.$crumbsArea.on("click",".hhms-item",function () {
					var item = $(this)[0]["_item"];
					var items = m.getSiblingsItems(item);
					_self.setItems(items);
					m.currItems = items;
					m.setCrumbs(item._parent);
				})
				_self.$ele.$selectedArea.on("click",".hhms-item",function () {
					var item = $(this)[0]["_item"];
					m.removeSelectedItem(item);
				})
			},
			//初始化items
		 	initItems : function () {
		 		var _self = this
				var $wrap = _self.$ele.$listArea;
				m.currItems = m.items[0];
				_self.setItems(m.items[0]); //--- item insert
			},
			reset : function () {
				var _self = this;
				_self.$ele.$crumbsArea.empty();//清除标签区域
				_self.$ele.$selectedArea.empty();//清除选项区域
				m.$source.val("");
			},
			resetOutDom : function () {
				var $output = r.$ele.$output;
				$output.each(function(i, ele) {
					$(ele).val("");
				});
			},
			setItems : function  (items,$wrap) {
				var _self = this,
				    $wrap = $wrap || _self.$ele.$listArea,
				    $table = $wrap.find('.hhms-table-body').empty();
				items = items || [];
				m.renderItems = items;
				$wrap.find('.hhms-table-more').remove();//清除之前的
				if (items.length <= 50) {
					set$items(items);
				}else {//超出50的做二次渲染
					var $more = $("<div class='hhms-table-more'>点击查看更多</div>").insertAfter($table);
					set$items(items.slice(0, 50));
					$more.on('click', function() {
						set$items(items.slice(50));
						$more.remove();
					});
				}

				function set$items(items) {
					$.each(items,function(i, item) {
						item.get$Ele().appendTo($table)
					});
				}
				// for (var i = 0; i < items.length; i++) {
				// 	var $item = items[i].get$Ele().appendTo($table);
				// };
				_self.synChkAll();
			},
			synChkAll: function () {
				var _self = this,
						items = m.renderItems;
				if (!!_self.$ele.$chkAll) {
					var chkAll = _self.$ele.$chkAll[0];
					chkAll.disabled = false;
					if (items.length>0) {//有items时才控制全选

						var flag = true;//控制全选是否默认选上
						$.each(items,function(i, item) {//判断是否全部item都选上了，有没选中的就让全选默认false
							if (!item.status) {
								flag = false;
								return false;
							}
						});
						chkAll.checked = flag;//如果有全选，则重置当前全选框状态
					}else {//没有items就取消选中并且禁用
						chkAll.checked = false;
						chkAll.disabled = true;
					}
				}
			},
			addSelectedItem : function(item) {
				var _self = this;
				var $selectedArea = _self.$ele.$selectedArea
				var $selected = item.get$selected().appendTo($selectedArea);
			},
			removeSelectedItem : function(item) {
				var $selected = item.get$selected().remove();
			},
			clearInput : function(){
				//搜索时，点击确定和取消，将文本输入框内容清空
				var _self = this;
				_self.$ele.$queryInput.val("");
			},
			atLeastOneSelected : function(){
				//保证至少有一项被选中的方法，返回true表示已经选中了至少一项.
				if(!opt.required) return true;//如果没有配置required项，就不进行选项的验证
				if(m.selectedItems.length<=0){
					alert("请至少选中一项!");
					return false;
				}else{
					return true;
				}
			},
			// //构建子容器
			// bulidChildItems : function ($item) {
			// 	var _self = this;
			// 	var $div;
			//
			// 	if (!!$item.data()["children"] ){//已创建子item容器
			// 		$div = $item.data()["children"]
			// 		if($div.is(":hidden")) $div.show();
			// 	}else{
			// 		//创建子item的悬浮容器
			// 		$div = $("<div>").addClass("hhms-item-box").appendTo(_self.$ele.$modal);
			// 		$div.on("mouseenter",function () {
			// 			$(this).data()["mouseover"] = true;//标识鼠标已进入
			// 		}).on("mouseleave",function () {
			// 			$(this).data()["mouseover"] = false;//标识鼠标离开
			// 			setTimeout(function(){
			// 				if(!$div.data()["mouseover"]) $div.hide();//判断鼠标移出了x时间后，是否又进入
			// 			},opt.menuHideTime)
			// 		})
			// 		//插入子item
			// 		var item = $item.data()["item"];
			// 		var level = item.level;
			// 		this.setItems(item._children,$div,level);
			// 		//原item关联
			// 		$item.data()["children"] = $div;
			// 	}
			//
			// 	//定位
			// 	_self.posChildWrap($div,$item);
			// },
			// hideChildItems:function ($item) {
			// 	var $div = $item.data()["children"];
			// 	if(!!!$div || $div.is(":hidden")) return;//子item容器不存在或者处于隐藏
			// 	setTimeout(function(){
			// 		if(!$div.data()["mouseover"])  $div.hide();
			// 	},opt.menuHideTime)
			// },
			// posChildWrap:function($div,$item) {
			// 	var _self = this,
			// 			$modal = _self.$ele.$modal,
			// 			dWidth = $div.outerWidth(),
			// 			mWidth = $modal.outerWidth(),
			// 			top = $item.offset().top,
			// 			left = $item.offset().left+ $item.outerWidth();
			//
			// 	$div.css({
			// 			top : top - 1,//子item容器有一像素的外边框
			// 			left : left+dWidth < mWidth ? left : mWidth - dWidth - 10
			// 		})
			// },
			//显示modal
			showModal : function() {
				var _self = this;
				if(m.$source.is(":disabled")) return;//禁用则不弹窗
				_self.$ele.$modal.show();
				m.tmpSelectedItems = [].concat(m.selectedItems);//缓存打开前已选内容
				if(isFirstDraw) {//初次打开模态框
				    _self.initItems();
				    isFirstDraw = !isFirstDraw;
				}
				_self.synChkAll();
			},
			//隐藏modal
			hideModal : function() {
				var _self = this;
				_self.$ele.$modal.hide();
			},
			setCrumbs :function (items) {
				var _self = this;
				var $crumbsArea = _self.$ele.$crumbsArea.empty();
				$.each(items,function(i, item) {
					item.get$crumbs().appendTo($crumbsArea)
				});
			}
		}
//----------------Item-------------------------------------------------
		//Item类
		function Item (data) {
			// this.init(data);
			var _self = this;
			_self.status = false;//标识选中状态
			_self._children = [];//子item集合
			_self._parent;//自己的父亲item
			_self.data = data;//对应元数据
			_self.key = data["key"];//内部标识属性
			_self.level = data["level"];//等级
			_self.name = data[keysUtils["name"]];//数据属性
			_self.label = data[keysUtils["label"]];//数据属性
			// _self.type = data[opt.keys.type];
			_self.path = "";//标识路径（父->自己）
			_self._id = data[keysUtils["id"]];//数据里的标识
			// _self.output;
			$.each(opt.outputDom,function(i, output) {
				if(output["level"] == _self.level){
					_self.outputDom = output;
					return false;
				}
			});
			_self.enable = true;//是否禁用
			_self.$ele;//对应的显示元素
			_self.$selected;//对应的已选元素
		}
		Item.prototype = {
			get$Ele :function(){
				var _self = this;
				var $item;
				if(!!!_self.$ele) {
					_self.$ele = _self.buildEle();
				}
				$item = _self.$ele;
				// _self.setCheckbox($item);
				return $item;
			},
			get$selected : function(){
				var _self = this;
				var $selected;
				if(!!!_self.$selected) {
					_self.$selected = _self.buildSelectEle();
				}
				$selected = _self.$selected;
				return $selected;
			},
			get$crumbs : function(){
				var _self = this;
				var $crumbs;
				if(!!!_self.$crumbs) {
					_self.$crumbs = _self.buildCrumbsEle();
				}
				$crumbs = _self.$crumbs;
				return $crumbs;
			},
			buildEle : function () {
				var _self = this;
				var $item = m.$itemTmp.clone();
				_self.buildEleAttr($item);
				$item.children('.hhms-td-type').html(_self.name);
				var $name = $("<span><span><input type='checkbox' class='hhms-item-chk'></span><span class='hhms-item-label'>"+_self.label+"</span></span>")
				$item.children('.hhms-td-name').append($name);// name
				$item.children('.hhms-td-path').html(_self.path);// path
				$name.find(':checkbox')[0].checked = _self.status;// chk
				$name.find(':checkbox')[0].disabled = !!!_self.enable;// chk
				if(_self._children.length){
					var $label = $name.children('.hhms-item-label')
					$label.addClass("hhms-item-p").append("<span class='hhms-item-csize'>"+_self._children.length+"</span>");
				}
				return $item;
			},
			buildSelectEle : function () {
				var _self = this;
				var $item = m.$selectTmp.clone();
				$item.children('.hhms-item-text').text(_self.label);
				_self.buildEleAttr($item);
				$item.prop('title',_self.path + _self.label);
				return $item;
			},
			buildCrumbsEle : function () {
				var _self = this;
				var $item = m.$crumbsTmp.clone();
				$item.text(_self.label);
				_self.buildEleAttr($item);
				return $item;
			},
			buildEleAttr : function  ($item) {
				var _self = this;
				$item.attr({
					"data-name":_self.name,
					"data-level":_self.level,
					"data-key":_self.key,
					"data-type":_self.type,
					"data-id":_self._id,
					"title":_self.label
				})

				// var $label = $("<label>").text(itemData[keysUtils["label"]])
				// $item.append($label);
				// $item.data()["item"] = _self;
				$item[0]["_item"] = _self;
				// $item.data("item",_self);
				return $item;
			},
			setChk : function (status) {
				var _self = this;
				_self.status = status;
				if(!!_self.$ele) {
					_self.$ele.find(".hhms-item-chk")[0].checked = _self.status;
				}
			},
			setChkEnable : function (enable) {
				var _self = this;
				_self.enable = enable;
				if(!!_self.$ele) {
					var chk = _self.$ele.find(".hhms-item-chk")[0];
					chk.disabled = !!!enable;
				}
			},
			select : function (status) {
				var _self = this;
				if (status) {
					m.addSelectedItem(_self);
				}else {
					m.removeSelectedItem(_self);
				}
			},
			setEnabled : function () {
				var _self = this;
				_self.enable = true;
				_self.setChkEnable(true);
			},
			setDisabled : function () {
				var _self = this;
				_self.enable = false;
				_self.setChkEnable(false);
			},
			getParent : function () {
				var _self = this;
				return _self._parent;
			},
			getChildren : function () {
				var _self = this;
				return _self._children || [];
			},
			getSiblings : function () {
				var _self = this;
				if(_self._parent) {
					return _self._parent._children;//同个父级下的兄弟
				}else{
					var level = _self.level;
					return _self.items[level];//顶级的话就是同等级的兄弟
				}
			}
		}
//----------------Data-------------------------------------------------
		//数据类
		function Data () {
			this.data = opt.data;
		}
		//函数集
		Data.prototype={
			//遍历函数
			recursive : function (data,target,opera,pData) {
				if (typeof(opera) != "function" || typeof(target) != "function") return;
				var _self = this;
				for (var i = 0; i < data.length; i++) {
					var cData = data[i];
					if(target(cData,pData)){
						opera(cData,pData);
					}
					if(cData[keysUtils["children"]] && cData[keysUtils["children"]].length){
						_self.recursive(cData[keysUtils["children"]],target,opera,cData)
					}
				};
			},
			//给data加key属性,父id|...|自己id
			addKeyToData : function() {
				var _self = this;
				var data = _self.data
				var target = function  (cData,pData) {
					return true;
				}
				var opera = function  (cData,pData) {
					var key = pData?pData.key+"|":""
					cData["key"] = key+cData[keysUtils["id"]];
				}
				_self.recursive(data,target,opera)
				//console.log(data)
			},
			//通过id查找
			queryById : function(id,data) {
				var _self = this;
				var data = data || _self.data;
				var output = [];
				var target = function  (cData,pData) {
					var _id = cData[keysUtils["id"]];
					if(!!!_id && _id != 0) return false;
					return _id.indexOf(id) > -1;
				}
				var opera = function  (cData,pData) {
					output.push(cData);
				}
				_self.recursive(data,target,opera);
				return output;
			},
			//通过属性模糊查找
			queryByParam : function(key,val,data) {
				var _self = this;
				var data = data || _self.data;
				var output = [];
				var target = function  (cData,pData) {
					var _val = cData[key];
					if(!!!_val && _val != 0) return false;
					return _val.indexOf(val) > -1;
				}
				var opera = function  (cData,pData) {
					output.push(cData);
				}
				_self.recursive(data,target,opera);
				return output;
			},
			//通过多属性精确查找
			queryByParams : function(params,data) {//param:{"level":0,"id":a0}
				var _self = this;
				var data = data || _self.data;
				var output = [];
				var target = function  (cData,pData) {
					var flag = true;
					for (var key in params) {
						if(typeof(cData[key]) == "undefined" || cData[key] != params[key]) {
							flag = false;
							break;
						}
					};
					return flag;
				}
				var opera = function  (cData,pData) {
					output.push(cData);
				}
				_self.recursive(data,target,opera);
				return output;
			}
		}
//----------------Hhms-------------------------------------------------
		//外部函数类
		function Hhms () {
			// this.init();
			this.type = "hhmodalselect";
			this.isEnable = true;
		}
		Hhms.prototype = {
			setSelectedItems :function (paramsList) {//[{"level":0,"id":a0},{"level":0,"id":a1}]
				var arrSelectItems = [];
				for (var i = 0; i < paramsList.length; i++) {
					var params = paramsList[i];
					var item = m.getItemsByParams(params)[0]//理论上是唯一的
					if(item){
						this.selectItem(item,true);
						arrSelectItems.push(item);
					}
				};
				m.setSelectedItemLabel();//把label放文本框里
			},
			setDefalutVal : function  () {
				var _self = this;
				if(!!m.requiredItem){
					var rItem = m.requiredItem;
					var $rItem = rItem.get$Ele();
					m.removeSelectedItem(rItem);
				}
				_self.setVal();
			},
			setVal : function(){
				var _self = this;
				//这是选择框的值
				var paramsList = [];
				var $output = r.$ele.$output
				$output.each(function  (i,ele) {//遍历output，自动选其值并找对应的item去选中
					var $ele = $(ele)
					var level = $ele.attr("data-level")
					if (!$ele.val().length) return true;
					var vals = $ele.val().split(",");
					for (var i = 0; i < vals.length; i++) {
						var o ={
							"level":level,
							"id" : vals[i]
						};
						paramsList.push(o);
					};
				})
				_self.setSelectedItems(paramsList);

				var selectedItems = m.selectedItems;
				for (var i = 0; i < selectedItems.length; i++) {
					m.setChildrenEnabled(selectedItems[i]);//让选中的选项的子选项变成可选状态
				};
			},
			getVal : function () {
				var $output = r.$ele.$output;
				var out = {};
				$.each(m.selectedItems,function(i,item) {
					var level = item.level;
					var value = item["data"][opt.keys.id]
					var name = !!item.outputDom ? item.outputDom.name : item.name;
					if(!!!out[name]){
						out[name] = value
					}else {
						out[name] += "," + value
					}
				});
				return out;
			},
			setItem : function (item,enable) {
				if(!!!item) return false;
				if(enable){
					m.setSelfEnabled.apply(m,[item]);
				}else{
					m.setSelfDisabled.apply(m,[item]);
				}
			},
			setAllItem : function (enable) {
				if(!!!item) return false;
				if(enable){
					m.setAllEnabled.apply(m,[]);
				}else{
					m.setAllDisabled.apply(m,[]);
				}
			},
			setChildrenItem : function (item,enable) {
				if(!!!item) return false;
				if(enable){
					m.setChildrenEnabled.apply(m,[item]);
				}else{
					m.setChildrenDisabled.apply(m,[item]);
				}
			},
			setSiblingsItem : function (item,enable) {
				if(!!!item) return false;
				if(enable){
					m.setSiblingsEnabled.apply(m,[item]);
				}else{
					m.setSiblingsDisabled.apply(m,[item]);
				}
			},
			setParentItem : function (item,enable) {
				if(!!!item) return false;
				if(enable){
					m.setParentEnabled.apply(m,[item]);
				}else{
					m.setParentDisabled.apply(m,[item]);
				}
			},
			getSelectedItems : function  () {
				return  m.selectedItems;
			},
			getSiblingsItems : function (item) {
				if(!!!item) return false;
				return m.getSiblingsItems.apply(m,[item]);
			},
			getChildrenItems : function (item) {
				if(!!!item) return false;
				return item._children;
			},
			getParentItem : function (item) {
				if(!!!item) return false;
				return item._parent;
			},
			selectItem : function (item,select) {
				if(!!!item) return false;
				if(select){
					m.addSelectedItem(item);
				}else{
					m.removeSelectedItem(item);
				}
			},
			enable : function () {
				m.$source.removeAttr("disabled");
				var $output = r.$ele.$output;
				$output.each(function(i,ele){
					$(ele).removeProp("disabled");
				})
				this.isEnable = true;
			},
			disable : function () {
				m.$source.attr("disabled","disabled");
				var $output = r.$ele.$output;
				$output.each(function(i,ele){
					$(ele).prop("disabled","disabled");
				})
				this.isEnable = false;
			},
			dispose : function (){
				this.enable();//先取消禁用
				m.$source.removeData("hhms").off(".hhms").val("");
				m.$source.removeClass("hhms-source").prop("title","");
				r.$ele.$modal.remove();
			},
			getDoms : function  () {
				return [m.$source,r.$ele];
			},
			isSelected : function () {
				return  m.selectedItems.length>0;
			},
			removeAllSelectedItem : function (noSubmit) {
				m.removeAllSelectedItem();
				if (!noSubmit) {
					m.modalSubmit();
				}
			},
			updateData : function (data,unResetVal) {
				d.data = data;
				m.reset();
				r.reset();
				m.initItems();
				m.initItemPath();
				r.initItems();
				if (!unResetVal) {
					r.resetOutDom();
				}
			},
			getItems : function () {
				return  m.items;
			}
		}
//-----------------------------
		function init() {//入口
			d = new Data();//初始化Data
			m = new Manager();//初始化Manager
			r = new Render();//初始化Render
			m.init();
			r.init();
			hhms = new Hhms();
			m.defaultSelect();
			m.onComplete(m.items,m.selectedItems);
			$input.data()["hhms"] = hhms;
			return hhms
		}
		hhms = init();//初始化组件实例
		return hhms;
	}
})(jQuery)
