# tiledmap-loader

## What is tiled map loader

For Canvas projects such as pixijs etx. , access to the visual editing capabilities of the Tiled map tool.

webpack-loader，可以将 [Tiled (https://www.mapeditor.org/)](https://www.mapeditor.org/) 工具直接应用于 canvas 项目，如 pixijs 等，通过 Tiled 工具对项目内的视觉内容进行直接的可视化编辑。

## 1. How to use

### 1.1 install

`npm i --save tiledmap-loader`

> 这里注意，加入 dependencies，而不是 devDependencies，后续项目中可能会用到 `tiledmap-loader/util` 下的内容。

### 1.2 前置工作

loader 对应的文件后缀类型是 `.tiled`。
在放置资源的文件夹中添加 `*.tiled` 文件，如：

```
- resource
  - images1
    - pic1.png
    - pic2.png
    - pic3.jpg
    - pic4.webp
  - images2
    - pic1.png
    - ...
  - index.tiled // 建议放在图片资源的上层文件夹
- render.js // 业务渲染逻辑，.tiled 引入文件
```

`.tiled` 文件内容：

```
dir: [images1, images2]
```

`render.js` 文件，引入 `.tiled`

```js
import tiledData from './resource/index.tiled';
```

webpack 中的配置使用 loader，注意：这里涉及到资源，会依赖 url-loader

```js
{
  test: /\.tiled$/,
  use: [
    {
      loader: 'tiledmap-loader',
      options: {},
    },
  ],
},
// 这里涉及到资源，会依赖 url-loader
{
  test: /\.(png|jpg|jpeg|webp|gif|bmp)$/,
  use: [
  	{
  	  loader: 'url-loader'
  	}
  ]
}
```

配置好，在首次构建后，会在 `<index>.tiled` 同级产生以下几个新文件，（新文件名同 loader 入口的 <index> 文件名）

```
- resource
  - <index>.tiled
  - <index>.tiled-project // tiled 项目文件，不要手动修改
  - <index>.tiled.json // tiled 项目产物，不要手动修改
  - <index>.tiled.resource.js // 资源文件，不要手动修改
```

下载安装 [Tiled](https://www.mapeditor.org/)。

打开 [Tiled](https://www.mapeditor.org/) 工具（只支持 >= 1.6 版本）。
通过菜单项 "File" => "Open File or Project..." 打开 `<index>.tiled-project` 项目文件。
前置工作就准备完成，即可以进行可视化编辑。

![image1](https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*sisQS5eoFD0AAAAAAAAAAAAAARQnAQ)

### 1.3 使用

> 在 Tiled 的编辑结果会同步在 `<index>.tiled.json`。  
> 所用到的资源会自动生成 `<index>.tiled.resource.js`。

以上编辑结果和资源引用都会在引用文件中返回，如：

```js
import indexTiledData from './resource/index.tiled';

console.warn(indexTiledData);
/*
{
  tiledJson, // tield 编辑结果
  resource, // 资源引用
}
*/
```

#### 1.3.1 使用 TiledData 数据

```js
import TiledData from 'tiledmap-loader/util/TiledData';
import indexTiledData from './resource/index.tiled';

console.warn(indexTiledData);

export default {
  init() {
    // eg: TiledJsonData
    const tiledData = new TiledData(indexTiledData.tiledJson, indexTiledData.resource);
    console.log(tiledData);
    // 获取一个元素的基础信息
    const obj = tiledData.getObjectByName('obj1');
    console.log(obj); // { x, y, height, width, rotation, properties, visible }
  },
};
```

`{ tiledJson, resource }` 做为 Tiled 工具和资源使用的原始信息，和 PIXI 在坐标系、尺寸转换、资源使用上的区别比较大，无法直接使用。

`tiledmap-loader/util/` 下提供了 `TiledData` 类，可以对 `.tiled` 文件产物进行整合，转换成为直接可供 PIXI 使用的数据。

`new TiledData(TiledData.tiledJson, TiledData.resource)`

* `renderInfo{Object}` 转换后的完整信息，和可视化编辑的的层级、元素一一对应的树形结构；
* `itemMapByName{Object}` 有 name 命名元素的集合，方便通过 name 取元素
* `tiledJon` Tiled 工具产物原始信息
* `resouce` 资源使用映射 js module
* `tiledGidMap` Tiled 工具资源信息映射

#### 1.3.2 结合 Pixijs

以上 tiledData 可以作为布局产物直接在项目中使用。
另外，此 `loader` 也提供了 PIXI 的定制 Container，可以直接将 tiled 内容渲染出来。

以上项目 `render.js` eg:

```js
import TiledLayersContainer from 'tiledmap-loader/util/TiledLayersContainer.pixi';
import indexTiledData from './resource/index.tiled';

console.warn(indexTiledData);

const width = 750;
const height = 1624;

export default {
  app: null,
  root: null,
  init() {
    const view = document.getElementById('J_canvas');
    view.style.width = `${width / 2}px`;
    view.style.height = `${height / 2}px`;

    this.app = new PIXI.Application({
      view,
      width: width,
      height: height,
      antialias: true,
      backgroundColor: 0x98d8ff
    });
    this.root = this.app.stage;
      
    // eg1: TiledContainer
    const container = new TiledLayersContainer(
      indexTiledData.tiledJson,
      indexTiledData.resource,
      { width: width, height: height, layoutRef: 'center' },
    );
    this.root.addChild(container);
    /*
     * 获取一个元素
     */
    // 图片 sprite
    const item = container.getChildByName('obj1');
    console.log('object', item);
  },
};
```

#### 1.3.3 结合 Tinyjs

同上，使用 `import TiledLayersContainer from 'tiledmap-loader/util/TiledLayersContainer.tinyjs';`

## 2. 配置

### 2.1 .tiled

```
dir: [images1, images2]
width: 750
height: 1624
```

* `dir` [必需] 图片资源文件夹，会按文件夹直接生成 tiled 里使用的 `collect` 图片集
* `width` 画布尺寸，默认为 750
* `height` 画布尺寸，默认为 1624

### 2.2 loader

```js
{
  loader: 'tiledmap-loader',
  options: {
    process: true,
    esModule: true,
  },
},
```

* `process` 【注意】设置为 false 时，会直接路过初始化和相关文件的生成和检测，直接使用本地已经构建存在的文件。一般建议生产环境为 false，开发环境为 true;
* `esModule` 生成和输出的文件内容规范，false 时为 commonjs

## 3. 内置应用类 API

### 3.1 **TiledData**

**method**

* `getObjectListByName: Array<Object>` 根据 name 获取渲染元素信息列表
* `getObjectByName: Object` 根据 name 获取渲染元素信息，name 重复的话返回第一个

**property**

* renderInfo
* itemMapByName
* tiledGidMap
* resource
* tiledJson

### 3.2 **TiledLayersContainer**

`new TiledLayersContainer(tiledJson, resource, canvasOption)`

* **tiledJson**: `.tiled` 返回的 tiledJson
* **resource**: `.tiled` 返回的 resource
* **canvasOption**
  - width: 页面 canvas 实际宽度
  - height: 页面  canvas 实际高度
  - layoutRef: 布局定位方式，`left/right、top/bottom、center`

**method**

* `getChildByName(name): <PIXI.Container|PIXI.Sprite>` 根据 name 获取 PIXI 元素，name 重复的话返回第一个
* `getChildrenByName(name): Array<PIXI.Container|PIXI.Sprite>` 根据 name 获取 PIXI 元素列表

| | Tiled 元素对应转换为 PIXI 元素 |
| --- | --- |
| layer |	Container |
| object [图片元素]	| Sprite |
| object [区域框]	| Container |
| object [占位图]	| Container |

**property**

* tiledData: TiledData 的实例

## 4. Tiled 自定义属性

### 4.1 layoutRef

说明：相对布局

适用元素：root | layer

值(X 方向,Y 方向)：
  - 默认：`left,top`;
  - X 方向：`left`、`center`、`right`
  - Y 方向：`top`、`center`、`bottom`

![](https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*qUMSQLu7wHIAAAAAAAAAAAAAARQnAQ)

### 4.2 placeholder

![](https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*qHagQJ_yIgMAAAAAAAAAAAAAARQnAQ)

说明：仅用于 Tiled 编辑器内占位，在实现项目中是一个空的 container

适用元素：object

值：<boolean> true/false

## 5. Example

`example`

## 6. 使用场景 and 最佳实践

### 6.1 适用的场景

* 建议按实际项目的视觉层级和逻辑情况，拆分成多个 `.tiled` 文件夹，分层、分区域编辑。
* 灵活使用 tiled 编辑时提供的“自定义属性”能力，和业务逻辑相结合。

## 7. TODO

* [done]复杂布局完善
* tileset 图片集支持
* 动效支持
* [done]选区支持
* [done]无效占位图

## Change Log

* 0.1.0
  - 支持 X 方向,Y 方向的相对布局，通过自定义参数 `layoutRef`
* 0.1.1
  - 优化 `layoutRef` 布局
* 0.1.2
  - 支持整体 container 的`layoutRef` 布局
* 0.1.3
  - 支持 placeholder 占位图