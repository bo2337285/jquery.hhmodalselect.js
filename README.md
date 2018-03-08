# jquery.hhmodalselect.js --- 级联复选弹框组件
　　jquery.hhmodalselect.js是基于jquery库，实现级联复选的弹出框功能，在wfp平台上使用的定制化选择组件。

- #### **组件版本**:  
  * 2.0.10_build10

- ### **组件特点**：
   * 多层级联复选的直观展示更易于操作
   * 选中数据项以小块的形式在选中区域集中显示
   * 增加数据项检索功能，方便检索数据项
   * 分批加载页面元素，减少等待开销
   * 支持通过调用组件方法返回的函数对象操作组件(取值/动态选中/回选)


- ### **需要环境**：
 * jQuery版本1.7.2以上;
 * ie 8及以上版本，和主流现代浏览器（chrome、firefox等）

- ### **使用示例**：  

    ```javascript
    $(input).hhModalSelect()
    ```
    组件必须是在```input```标签下使用，否则无法初始化。

   1. **代码示例**  
     
     HTML代码：

      ```html
         <input type="text" id="test" />
         <input id="aa0" data-level="0" name="ICP.web" type="hidden"/>
	```	     
	JS数据：   

    ```javascript
     var data =[  
	{"id":"a0","name":"AA","label":"视频","children":[
          {"id":"a1","name":"AA1","label":"优酷","children":[
		    {"id":"a11","name":"AA11","label":"电影","children":[]},
		    {"id":"a12","name":"AA12","label":"电视剧","children":[]}   
    		]},						
    	  {"id":"a2","name":"AA2","label":"腾讯视频","children":[]},
    	  {"id":"a3","name":"AA3","label":"搜狐视频","children":[]}
	]},
	{"id":"b0","name":"BB","label":"游戏","children":[
    	  {"id":"b1","name":"BB1","label":"单机游戏","children":[]},
    	  {"id":"b2","name":"BB2","label":"网络游戏","children":[]}
		]},
	{"id":"c0","name":"CC","label":"小说","children":[]},
	{"id":"d0","name":"DD","label":"新闻","children":[]}	
	]
     ```

     JS组件调用：

     ```javascript
      var hhms = $("#test").hhModalSelect({
                data:data,
				scene : 'flRadioMute',
				outputDom : [{level:"0",id:"aa0",name:"ICP.web"},
				             {level:"1",id:"aa1",name:"ICP.web1"}]
	 })
     ```

   2. **功能详解**  

    //todo 待补充

   3. **代码详解**

     在示例代码中，通过``$("#test").hhModalSelect()``调用组件，传入`data`,`scene`,`outputDom`参数值。```scene : 'flRadioMute'``` 设置场景为一级多选，指第一级元素若选中一项，其余一级元素置灰不可选。数据data的结构按默认key值来解析。
     
     ```javascript
        outputDom : [{level:"0",id:"aa0",name:"ICP.web"},
			         {level:"1",id:"aa1",name:"ICP.web1"}]
     ```
    参数```outputDom```会在html页面生成如下**隐藏的input框**，在wfp平台上用于input提交不同level的选中项，通过将一级菜单(level:"0")中选中项传给id为“aa0”的input元素，将二级菜单的选中项传递给id为“aa1”的input元素来实现，name为最后提交表单时的键。
    
     ```html
        <input id="aa1" type="hidden" name="ICP.web1" data-level="1">
        <input id="aa0" type="hidden" name="ICP.web" data-level="0">
     ```
   禁用组件:    
      * 通过标签属性禁用：设置``disabled``属性  

      ```html  
          <input id="test" type="text" disabled/>
      ```
      * 通过实例api禁用/解除：组件实例对象调用``disable()``或者``enable()``  

      ```javascript  
          hhms.disable();//禁用
          hhms.enable();//启用
      ```   
   4. **选项控制方法**
   
    组件中，选项`item`为基本要素，通过组件参数中的回调函数(itemOnCheck、onComplete)及item的状态，可进行选项的逻辑控制。  
    对于``item``，可参考其[api](#item)
      - 前提:

        ```javascript
        var option = {//参数
         data:data,//数据参数
         //其它参数，此处不做说明..
         itemOnCheck : onCheck,//item选择后的回调函数
         onComplete : onComplete,//初始化完成时的回调
        }
        $(dom).hhModalSelect(option);
        ```
     - 控制场景0：选子项把所有父项选上

        ```javascript
        function onCheck(item,checked){
          var hhms = this;//组件实例
          var _item = item;
          while (!!_item.getParent()) {//存在父级时
           _item = _item.getParent();//缓存父级
           hhms.selectItem(_item,true);//选择父级
         }
        }
        ```
     - 控制场景1：选父项全选子项，取消任一子项取消父项

        ```javascript
        function onCheck(item,checked){
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
        ```
      - 控制场景2：选父项全选子项，取消任一子项取消父项

        ```javascript
        function onCheck(item,checked){
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
        ```
      - 控制场景3：单选、同级单选、同类单选

       ```javascript
      function onCheck(item,checked){
        var hhms = this;//组件实例
        var items = hhms.getSelectedItems();
        var todoItems = [];//待处理item集合
        $.each(items,function(i, _item) {//把选中的全取消了
          if (_item != item) //如果是自己则跳过
          //if (_item.name == item.name && _item != item) //如果是同name项则取消
          //if (_item.getParent() == item.getParent() && _item != item) //如果是同父项则取消
          {
            todoItems.push(_item);//放入待处理集合中
          }
        });
        $.each(todoItems,function (i,_item) {//处理待处理集合
          hhms.selectItem(_item,false);//取消item项
        })
      }
      ```
      - 控制场景4：禁用任意级的项

       ```javascript
      function onComplete(item,checked){//注意，这里是初始化完成时的回调
        var hhms = this;//组件实例
        var item0 = items[0];//取得第0级的项集合
        $.each(item0,function(i, item) {//遍历集合并使其禁用
          item.setDisabled();//禁用
        });
      }
       ```

   5. **组件可调用函数**
  
     组件可通过调用组件方法返回的函数对象操作组件，进行取选中值/动态选中/回选功能。  
     * `getSelectedItems()`
       
           返回结果是数组形式包含所有选中项。  
     * `setSelectedItems(paramsList)`
     
          将对应的复选框选中，paramsList数组中数据结构为`{"level":level,"id":id}`，将指定级id的元素选中。即将一级的id为“a0”的视频和二级的id为“a1”,“b2”的优酷、单机游戏选中。
        ```javascript
          hhms.setSelectedItems([{"level":0,"id":"a0"},{"level":1,"id":"b1"},{"level":1,"id":"a1"}])
        ```
     * `setDefalutVal()`
      
          用于在`outputDom`生成的input中添加value值后调用此方法，将value值中对应id的复选项选中。value值多项时用`,`分割多个id。  
示例代码中根据outputDom生成的input，
     ```html
        <input id="aa1" type="hidden" name="ICP.web1" data-level="1">
        <input id="aa0" type="hidden" name="ICP.web" data-level="0">
     ```
 给input添加value值，
     ```html
        <input id="aa1" type="hidden" name="ICP.web1" data-level="1" value="a1,b1">
        <input id="aa0" type="hidden" name="ICP.web" data-level="0" value="a0,b0">
     ```  
     调用`hhms.setDefalutVal()`后将`level:1`二级菜单中id为“a1”,“b2”，`level:0`以级菜单中id为“a0”,“b0”的四项元素选中。
   6. **附录代码示例**
   
     ```html
	var data = [
			 {"idt":1,"namet":"地域","anaUserGrpList":[
						{"idt":1,"namet":"广州","anaUserGrpList":[]},
						{"idt":2,"namet":"深圳","anaUserGrpList":[]}
					]},
			 {"idt":2,"namet":"接入类型","anaUserGrpList":[
					{"idt":3,"namet":"LTE","anaUserGrpList":[]},
					{"idt":4,"namet":"WLAN","anaUserGrpList":[]}
		            ]}
	]
    ```
   当data是这种非默认keys的结构时，在调用组件时需要自定义keys实参。
   ```javascript
	var hhms = $("#test").hhModalSelect({
				data:data,
				keys:{
					id:"idt",
					name:"namet",
					label:"namet",
					children:"anaUserGrpList"
				},
				scene : 'flRadioMute',
				outputDom : [{level:"0",id:"aa0",name:"ICP.web"},
				            {level:"1",id:"aa1",name:"ICP.web1"}]
 			})
   ```    
   7. **获取组件实例**：  

1.  $(dom).data("hhms");
2.  var hhms  =  $(dom).hhModalSelect(opt);

- **配置参数**：  
   
| 参数名称 | 参数类型 | 默认值 | 描述  |
| :------ | :----: | :---: | :--- |
|data|array| []|输入数据|
|zIndex|number|20000000|设置弹出层的层级,默认比弹窗组件layer高|
|keys|object| ```{id:"id",name:"name",label:"label",children:"children"}```|根据输入的数据的结构来确定，id为该项标识，name为该项的类型，label为该项显示的文本，children为该项子项的键|
|outputDom|array| []|用于创建隐藏input框，来提交不同级别的选中项|
|placeholder|string|'请输入关键字以查询'|组件的搜索框中默认文本|
|menuHideTime|int| 700|鼠标移出级联菜单后级联菜单隐藏的需要时间，默认700ms|
|itemOnCheck|-| -|选中项时的回调函数，形参有item：当前项，checked：当前项选状态，以下回调函数的this指针皆指向组件实例|
|onModalSubmit|-| -|保存时的回调函数，形参有selectedItems：保存项集合|
|onModalCancel|-| -|取消时的回调函数，形参有selectedItems：当前选择项集合，cancelItems取消前选择项集合|
|onRemoveAllSelectedItem|-|-|点击清除已选结果按钮的回调函数，形参有selectedItems：当前选择项集合|
|onComplete|-|-|加载完成的回调，形参有items：所有的选择项,selectedItems：当前选择项集合|
|selectedCount|int| 0|列表最多可选中数，默认值0不限制选中数|
|isShowChkAll|Boolean| false|是否呈现全选复选框，该功能只限全选当前视图项，在item间有逻辑控制关系时不建议开启（不会触发itemOnCheck回调）|

- **api(可调用函数)**：  
   
| 函数名 | 参数 | 参数类型 | 返回值类型 | 描述 |
| :---- | :--: | :----: | :------: | :--:|
|getSelectedItems|-| -|array|获取所有选中项|
|setSelectedItems|`[{"level":level,"id":id}]`|array|-|将指定级的id元素选中|
|setDefalutVal|-| -|输出数据|将outputDom生成的input中value值对应项选中|
|getVal|-| -|Array|获取组件当前选中项的值集合|
|enable|-| -|-|将组件取消禁用|
|disable|-| -|-|将组件禁用|
|dispose|-| -|-|销毁组件实例，还原源载体dom|
|getDoms|-| -|-|获取实例对应的源文本框dom以及弹窗集合|
|getItems|-| -|object|获取实例所有的选项集合，结构是object，key 为对应级别，值为对应级别的item数组|
|isSelected|-| -|-|判断当前组件是否有任意选中项|
|removeAllSelectedItem|noSubmit| boolean|-|取消任意选中项，noSubmit控制是否会触发保存回调事件，默认触发|
|updateData|data,unResetVal| array(object),boolean|-|更新组件的数据为data，unResetVal为是否清楚上次选择的值|

- **<b id="item">item（选项）的api</b>**：  
   
| 函数名 | 参数 | 参数类型 | 返回值类型 | 描述 |
| :---- | :--: | :----: | :------: | :--:|
|getParent|-| -|Item|获取该项的父项|
|getChildren|-| -|Array(Item)|获取该项的子项集合|
|getSiblings|-| -|Array(Item)|获取该项的兄弟项集合（同父项中的子项）|
|select|status| Boolean |-|设置该项选择状态，true为选中，false为取消，不传参也为false|
|setEnabled|-| -|-|设置该项使能状态为true，不禁用状态|
|setDisabled|-| -|-|设置该项使能状态为false，禁用|