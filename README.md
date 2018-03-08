## jquery.hhdata.gridlist.js --- 表格组件

用途：基于jquery开发的表格组件，快速初始化表格，提供额外的表格功能。

---

#### 组件特点  
   - 支持从前台已有数据进行组件初始化
   - 支持通过Ajax技术从后台取数据进行初始化
   - 支持表格列宽度拖拽，排序，固定，隐藏某些列功能
   - 支持多种事件回调函数
   - 返回对象可以调用多种方法

#### 需要环境  
   * jQuery版本1.7.2以上;
   * ie 8及以上版本和主流现代浏览器（chrome、firefox等）

#### 当前版本
   * ver 2.1.2build4

#### 下载地址
组件地址：[jquery.hhdata.gridlist.js](http://172.16.11.238/Web_Front_End/Front_End_Component/tree/master/gridlist "")

#### 使用方法
```javascript
$(selector).gridList(parameter)
```
其中```$(selector)```所选元素```selector```应该为 ``` <table>```元素，否则无法初始化元素。

示例：  

HTML部分

```html
    <table id="grid">
      <tr>
        <td>示例1</td>
      </tr>
    </table>
```

JavaScript部分

```javascript
    $("#grid").gridList({
      width:"auto",
      table:{
        data:fakeData["mstList"],
        onRowClick:function(rows,rowData){
          console.log(rowData.dnMaxBpsStr.text);
        }
      }
    })
```

组件将获取```<table>```元素以及通过Ajax传入的数据：table.data，并且进行渲染。

#### 配置参数

|参数名称|参数类型|默认值|描述|
|:------:|:-----:|:----:|:-----:|
|width|Number/String|"auto"|组件的宽度,可以设置为"auto"|
|height|Number/String|"auto"|组件的高度,可以设置为"auto"|
|title|String/Element|null|标题栏显示的文字，也可传入DOM元素或者jQuery元素|
|loadingTimeout|Number|500|最小遮罩显示时间(ms)|
|table|Object|-|table为对象型配置项，在对象内部使用同样方法进行配置，其所包含的具体配置内容见：[table 表格相关的配置项](#table-表格相关的配置项)|
|extTable|Object|-|extTable为对象型配置项，具体配置内容见：[extTable 汇总行相关配置项](#exttable-汇总行相关配置项)|
|fixedTable|Object|-|fixedTable为对象型配置项，具体配置内容见：[fixedTable 固定列相关配置项](#fixedtable-固定列相关配置项)|
|page|Object|-|page为对象型配置项，具体配置内容见：[page 分页相关配置项](#page-分页相关配置项)|
|onComplete|Function|-|表格加载完成后的回调|
|colFormatter|Object|-|列格式化函数配置，键为td的data-name，值为格式化函数，详情[colFormatter配置示例](#colformatter配置示例)|
|enableNum |Boolean|-|是否开启序号列，默认true|
|colOpera|Boolean|-|是否开启列操作，默认false|
|colOperaClass|String|-|列操作触发按钮的class，设置按钮样式|
|onColOperaSubmit|Function|-|列操作保存按钮的回调函数，形参colList,fixedCols,dataCols，分别对应列集合、固定列集合、数据列集合|
|gridQuery|Boolean|-|是否开启表格内过滤功能，(v2.1.1)追加gridQuery的条件控制，用户输入 列名:关键字 ，则指定按该列过滤，若是有onGridQuery回调，则会返回第三个参数当前col(同名col则取最后一个)，用户输入 列名:((关键字)),则为指定该列并且等值才匹配（即非模糊查询）|
|gridQueryClass|String|-|内过滤功能触发按钮的class，设置按钮样式|
|onGridQuery|Function|null|当表格内过滤时替代原过滤方法的回调函数，参数为:keyword(当前关键字),rows(当前呈现行),col(过滤条件指定的列)，该函数必须要有返回rows，即为经过过滤后的row对象集合|
|cols|Array|[]|以参数形式构造列，详情[cols配置方式](#cols配置方式)|

#### table 表格相关的配置项

|参数名称|参数类型|默认值|描述|
|:------:|:-----:|:----:|:-----:|
|fullMode|Boolean|false|是否从表格的当前高度起向下铺满页面|
|url|String|""|加载数据时所请求的url|
|queryParams|Object|{}|加载数据时所请求的url所跟的条件参数|
|data|Array|[]|初始化的数据，内容为传入的Ajax数据，示例格式见本表格下**例1**|
|loadMode|String|"local_load"|加载数据场景，详情查看[loadMode配置说明](#loadmode配置说明)|
|dataKey|String|"list"|加载数据对应在对象里的键，可包含多个层级，例：ajax返回数据```{result:1,list:[...]}```则dataKey为"list"，若是```{result:1,data:{list:[...]}}```则dataKey为"data.list"|
|onRowClick|Function|function(rows,rowData){}|点击行的时候的回调，其中```rows```是当前点击的行（如果一部分列被锁定，则会有两个```tr```，jquery对象)，```rowData```是当前行上的所有数据(即对应data当前行的那条元数据)（2.0版已把中间参数currCell去掉）|
|onRowEnter|Function|function(rows,rowData){}|鼠标移入行回调，参数同上（2.0版已把中间参数currCell去掉）|
|onRowLeave|Function|function(rows,rowData){}|鼠标移出行回调，参数同上（2.0版已把中间参数currCell去掉）|
|checkbox|Boolean|false|是否显示复选框|
|checkboxName|Stiring|""|checkbox对应在数据里的键|
|onChecked|Function|function($rowArgs,$td,oRowData,checked){}|点击复选框回调函数，参数```$rowArgs```表示当前行(jquery元素)，$td表示当前点击的单元格（jqyery元素），oRowData表示该行的原始数据，checked表示点击后的是否被选中|
|onCheckedAll|Function|function(checked){}|点击全选复选框回调，checked点击后复选框状态|
|onLoadDataFinish|Function|function(res){}|ajax数据加载完成回调，参数为ajax返回的数据|
|onLoadDataSessionout|Function|function(res){}|ajax数据加载session超时回调，参数为ajax返回的数据|
|onLoadDataError|Function|function(res){}|ajax数据加载错误回调，参数为ajax返回的数据|
|onRenderDataFinish|Function|function(){}|数据加载完成回调（包括ajax）|
|operaCol|Object|{key0:function($rowArgs,$td,rowData,idx){},key1:function($rowArgs,$td,rowData,idx){}|key为该操作列上的data-operakey上的值，用于区分操作列初始化操作列的函数，return的东西才是在单元格内显示的东西，详细见此表格[operaCol配置说明](#operacol配置说明),2.0.9_build5新增形参idx|


#### extTable 汇总行相关配置项

|参数名称|参数类型|默认值|描述|
|:------:|:-----:|:----:|:-----:|
|data|Array|[]|汇总行数据|
|dataKey|String|'extlist'|汇总行数据的key|
|onRowClick|Function|function(rows,cell,rowData){}|汇总行被点击后的回调函数，参数同table项的onRowClick|

#### fixedTable 固定列相关配置项

|参数名称|参数类型|默认值|描述|
|:------:|:-----:|:----:|:-----:|
|fixedColName|Array|[]|锁定列数组，参数为该列的data-name，被锁定的列会从原列中抽出来置于锁定容器中，详见[固定列配置规则](#固定列配置规则)|
|postFixedColName|Array|[]|右侧锁定列数组，配置方式类似锁定列|

#### page 分页相关配置项

|参数名称|参数类型|默认值|描述|
|:------:|:-----:|:----:|:-----:|
|pageNumber|Number|1|当前分页索引|
|pageSize|Number|20|当前分页显示条数|
|pageList|Array|[20,50,100]|分页显示条数可选范围|
|dataTotal|Number|0|总数据条数|
|dataKey|String|"pagination"|在loadMode为"url_page_load"时,获取返回结果的键名|

#### 表格列的自定义属性

|属性名称|描述|
|:----:|:-----:|:-----:|
|data-id|该列的唯一标识，没有配置则以data-name为标准，主要是为了解决data-name重复的场景|
|data-name|该列的“显示”数据字段名|
|data-sourcekey|该列“真实”数据字段名（排序数据）|
|data-sort|该列是否开启排序功能|
|data-align|该列文字如何对齐显示|
|data-width|该列列宽|
|data-opera|是否为操作列（走操作列格式化函数，见table配置项的operaCol）:"true"或者"fasle"|
|data-operakey|对应操作列函数的键|
|data-number|是否开启序号列（序号）:"true"或者"fasle"|
|data-fomatter|列内容格式化函数(函数名)value:当前字段的值,$td:当前单元格,rowData:该行元数据，使用方法见[关于data-fomatter参数的示例](#关于data-fomatter参数的示例)|
|data-hide|是否隐藏该列|
|data-extkey|汇总行该列的“显示”数据字段名(这个会覆盖原来data-name指定的值)|
|data-extfmt|汇总行该列是否需要格式化 ("true"或者 "fasle"，默认不格式化)|
|data-dragable|该列可拖拽|
|data-fixed|该列锁定（左侧）|
|data-postfixed|该列锁定（右侧）|
|data-sortfn|暴露该列的排序算法接口，返回的形参为currRowData（当前行数据）,nextRowData（下一行数据）,sortFlag（当前排序标识 0常序、1升序、2降序 ）,sortKey（排序的键名）|


#### API

|函数名|描述|
|:--:|:--:|:-----:|
|setPage(option)|修改页面参数，option为原参数下的page对象|
|setTable(option)|修改表格参数，option为原参数下的table对象|
|setTitle(str/dom)|修改表格标题，参数同title项的setTitle参数|
|hideCol($td)|隐藏某一列，参数为该列上的某个td|
|showCol($td)|显示某一列，参数为该列上的某个td|
|hideRow($td)|隐藏某一行，参数为该行上的某个td|
|showRow($td)|显示某一行，参数为该行上的某个td|
|loadData()|更新表格的table参数并重新加载表格数据（post模式下刷新数据方法）|
|updateData(data,isRePage)|更新表格数据（Local模式下更新数据方法），isRePage（Boolean）控制更新数据后是否也重置分页|
|updateExtData(data)|更新汇总行数据|
|isVisible()|判断gird是否显示，返回值为Boolean类型|
|clearAllData()|清除所有数据,包括汇总行|
|getCols()|获取列集合|
|setCols(colList)|设置列，目前版本是列的显示/隐藏和位置，colList:[{name:"",currIndex:0,visible:true}]|
|setHeader(colList)|通过传入的列配置集合设置表格的列，列配置参考[cols配置方式](#cols配置方式)|
|getOptions()|获取表格的配置对象|
|getLoadMode()|获取表格的loadmode对象配置，loadmode对象api参考[loadmode对象api](#loadmode对象api)|
|getDom()|获取表格组件的Dom元素|
|getSorceTable()|获取表格原始的Dom元素，即table|
|getOptions()|获取表格当前配置|
|getCheckedRow()|获取表格选中的行集合，前提是开启了checkbox选项|
|hideOperaCol()|隐藏表格的操作列|


#### 固定列配置规则

**例1**：锁定列数组的排序规则：  
假设有固定列：col0,col1,col2,col3,col4  
若：fixedColName:["col1","col3"]  
则实际显示顺序为：col1,col3,col0,col2,col4  

  ``` 注意：把所有列定义成固定列这种方式是错误参数输入，会导致表格滚动条无法正常显示及计算，应保证至少有一列正常显示的非固定列 ```  

#### 关于data-fomatter参数的示例

例1:
```html
<td data-fomatter = "aa">列</td>
```
	然后在页面上定义一个  
```javascript
    function aa(value,$td,rowData){
        return value;
    }
```
value为该单元格原本显示的值。

例2:把原来显示的文字格式化成一个链接
```html
<td data-fomatter = "fomatter">列</td>
```
```javascript

	function fomatter(value,$td,rowData){
		value = "<a href='###'>"+value+"</a>"
		return value;
	}
```
#### colFormatter配置示例
colFormatter参数亦可对列进行格式化定义 ``v2.0.5 追加``

```html
<td data-name= "col0">列</td>
```
```javascript

	function fomatter(value,$td,rowData){
		value = "<a href='###'>"+value+"</a>"
		return value;
	}

      $(table).gridlist({
      //... 其他参数
      colFormatter : {
        "col0" : fomatter
      }
})
```
colFormatter 的格式是一个map，其中键为该格式化列的data-name上的值（必填），值为该列的格式化函数


#### operaCol配置说明
**例1**.data项的格式示例：
```json
data:[{
    "result":1,
    "roles":[
        {
            "descript":"",
            "domainId":null,
            "id":1,
            "name":"admin"
        },
        {
            "descript":"",
            "domainId":null,
            "id":2,
            "name":"saaaaaaaa"
        }
    ],
    "log":"操作成功"
}]
```
**例2**.operaCol配置项示例：
```javascript
operaCol:function(rows,cTd,rowData){
        var $btn = $("<a href='javascript:;' class='icon-bell' ></a>");
        $btn.on("click",function(e){
            console.log("ring!");
        e.stopPropagation();
        })
        return $btn;
}
```
p.s. 2.x版本里的形参rows在调用jquery函数index()时，返回值必然为-1，因为渲染机制改动，此处的rows还未插入表格，故新增第四个形参idx标识当前行序号

#### cols配置方式
该参数为对象数组，其对象对应表格的列，对象的属性对应td的```data-```配置的属性，例如：

```
  [{name:"col0",text:"列0",dragable:true}]]
```
其对应：
```
  <table>
  <tr><td data-name="col0" data-dragable="true">列0</td></tr>
  </table>
```
其中的text为列头的文本，v2.0.9build12追加：formatter支持传入函数
#### loadMode配置说明
loadMode包含**以下5种场景**

- "url_page_post": url请求且有分页，分页模式为post
- "url_page_load": url请求且有分页，分页模式为load（一次加载全数据再计算分页）
- "url_load": url请求且无分页
- "local_page_load": data指定数据且有分页，分页模式为load（一次加载全数据再计算分页）
- "local_load"（默认值）: data指定数据且无分页|

#### loadmode对象api
这是通过表格实例的getLoadMode方法获取的loadmode函数体，主要用于快速获得表格当前loadmode方式，其属性有：
- name loadMode参数原来的字符串
- hasPage() loadMode是否含有分页
- hasUrl() loadMode是否含是配置了url请求数据
- hasPost() loadMode是否是分页行为获取数据（即后端分页）