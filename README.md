# tiledmap-loader

## What is tiled map loader

For projects such as pixijs etx. , access to the visual editing capabilities of the tiled map tool.

webpack-loader，可以将 [Tiled](https://www.mapeditor.org/) 工具直接应用于 canvas 项目，如 pixijs 等，通过 Tiled 工具对项目内的视觉内容进行直接的可视化编辑。

## 1. How to use

### 1.1 install

`npm i --save tiledmap-loader`

这里注意要加入 dependencies，而不是 devDependencies，因为后续项目中可能会用到 `tiledmap-loader/util` 下的内容。

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

配置好后，在首次构建后，会在 `<index>.tiled` 同级产生以下几个新文件，（新文件名同 loader 入口的 <index> 文件名）

```
- resource
  - <index>.tiled
  - <index>.tiled-project // tiled 项目文件，不要手动修改
  - <index>.tiled.json // tiled 项目产物，不要手动修改
  - <index>.tiled.resource.js // 资源文件，不要手动修改
```

在 Tiled 工具（只支持 >= 1.6 版本）中打开 `<index>.tiled-project` 项目文件。
前置工作就准备完成，可以进行可视化编辑了。

![image1](https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*sisQS5eoFD0AAAAAAAAAAAAAARQnAQ)

### 1.3 使用

> 在 Tiled 的编辑结果会同步在 `<index>.tiled.json` 文件。  
> 所用到的资源，也会生成 `<index>.tiled.resource.js` 文件。

编辑结果和资源使用都会在引用文件 `render.js` 中返回，如：

```js
import tiledData from './resource/index.tiled';

console.warn(tiledData);
/*
{
  tiledJson, // tield 编辑结果
  resource, // 资源引用
}
*/
```

#### 结合 Pixijs

以上 tiledData 可以直接在项目中使用，目前也提供了 PIXI 的定制 Container，可以直接将 tiled 内容渲染出来。

以上项目 `render.js` eg:

```js
// render.js
import TiledLayersContianer from 'tiledmap-loader/util/TiledLayersContianer.pixi';
import tiledData from './resource/index.tiled';

console.warn(tiledData);

const options = {
  width: 750,
  height: 1334,
};

export default {
  app: null,
  root: null,
  init() {
    const view = document.getElementById('J_canvas');
    view.style.width = '375px';
    view.style.height = '812px';
    this.app = new PIXI.Application({
      view,
      width: 750,
      height: 1624,
      antialias: true,
      backgroundColor: 0x98d8ff
    });
    this.root = this.app.stage;
    //
    this._render();
  },
  _render() {
    const container = new TiledLayersContianer(tiledData.tiledJson, tiledData.resource);
    this.root.addChild(container);
    // eg 获取一个 PIXI 元素
    const items = container.getChildByName('layer1');
    console.log(items)
  },
};
```

#### 结合 Tinyjs

同上，使用 `import TiledLayersContianer from 'tiledmap-loader/util/TiledLayersContianer.tinyjs';`

## 2. 使用场景 and 最佳实践

### 2.1 适用的场景

* 建议按实际项目的视觉层级和逻辑情况，拆分成多个 `.tiled` 文件夹，分层、分区域编辑。
* 灵活使用 tiled 编辑时提供的“自定义属性”能力，和业务逻辑相结合。

## 3. API

### 3.1 method

**TiledLayersContianer**

* `getChildByName(name): <PIXI.Container|PIXI.Sprite>` 根据 name 获取元素，name 重复的话返回第一个
* `getChildrenByName(name): Array<PIXI.Container|PIXI.Sprite>` 根据 name 获取元素列表

**TiledSprite**

* `getProperties(): Array<Object>` 获取 tiled 里加的自定义属性
* `doAction(actionName)` 执行自定义属性里的 action