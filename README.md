# Element Selection Module (`select-module`)

这是一个功能强大且轻量级的 TypeScript 模块，用于在网页上进行交互式 DOM 元素选择。它支持跨 `iframe` 操作，允许主页面控制嵌入页面中的元素选择过程。

## ✨ 主要特性

- **交互式元素选择**: 在页面上创建覆盖层，通过鼠标悬停高亮、点击选择目标元素。
- **跨 `iframe` 支持**: 主页面可以轻松启动、停止并接收来自 `iframe` 页面的元素选择结果。
- **高度可定制**: 提供丰富的回调函数和配置选项，如自定义忽略元素、选择/悬停事件处理等。
- **精准元素定位**: 使用优化的算法获取鼠标下的真实元素，并生成唯一的 XPath 以便后续使用。
- **零依赖**: 使用原生浏览器 API，无需任何外部依赖。

---

## 🚀 安装

```bash
npm install select-module
# 或者
yarn add select-module
```

---

## 🛠️ 如何使用

该模块支持两种主要用例：在单个页面内使用，以及在主页面和 `iframe` 之间进行桥接。

### 用例 1: 在单个页面中使用

这是最常见的用例，直接在当前页面启动元素选择。

1.  **导入 `ElementSelector`**:
    ```typescript
    import { ElementSelector, getElementInfo } from 'select-module';
    ```

2.  **创建实例并启动**:
    `ElementSelector` 的构造函数接收一个配置对象，其中 `onElementSelected` 是最重要的回调函数，当用户选择一个元素后会被调用。

    ```typescript
    let selectorInstance = null;

    // 启动选择模式的函数
    function startSelectionMode() {
      // 如果已有实例，先停止并销毁
      if (selectorInstance) {
        selectorInstance.stop();
      }

      selectorInstance = new ElementSelector({
        // 核心回调：当元素被选中时触发
        onElementSelected: (element, elementInfo) => {
          console.log('Element selected:', element);
          console.log('Element info:', elementInfo);

          // 在这里处理你的业务逻辑，例如将 elementInfo 发送到服务器
          // ...

          // 也可以触发一个自定义事件，让应用的其他部分监听
          const event = new CustomEvent('element-selected', {
            detail: elementInfo,
            bubbles: true,
            cancelable: true
          });
          document.dispatchEvent(event);
        },

        // 可选回调：当选择器关闭时触发 (无论是通过选择还是按 ESC)
        onClose: () => {
          console.log('Selector has been closed.');
          selectorInstance = null; // 清理实例
        },

        // 可选配置：忽略某些不希望被选中的元素
        ignoreSelectors: ['.my-toolbar', '#sidebar']
      });

      // 启动选择器
      selectorInstance.start();
    }

    // 停止选择模式的函数
    function cancelSelectionMode() {
      if (selectorInstance) {
        selectorInstance.stop();
      }
    }

    // ---- 示例调用 ----
    // document.getElementById('start-button').onclick = startSelectionMode;
    // document.getElementById('cancel-button').onclick = cancelSelectionMode;

    // ---- 监听自定义事件 ----
    // document.addEventListener('element-selected', (event) => {
    //   console.log('Received selected element via custom event:', event.detail);
    // });
    ```

### 用例 2: 跨 `iframe` 进行选择

此场景下，主页面（父页面）需要控制一个嵌入的 `iframe` 页面进行元素选择。

#### 第 1 步: 在 `iframe` 页面中初始化监听器

在你的 `iframe` 页面中，导入并调用 `initIframeSelector`。这会让 `iframe` 准备好接收来自父页面的指令。

```typescript
// 在 iframe 页面的脚本中
import { initIframeSelector } from 'select-module';

// 初始化选择器，允许来自任何源的父页面控制它
// 为了安全，建议指定父页面的源 (origin)
initIframeSelector({
  allowed: true,
  allowedOrigins: ['https://your-main-app.com'] // 推荐设置为你的主站域名
});
```

#### 第 2 步: 在主页面（父页面）中创建桥接并控制

在你的主应用页面中，你可以创建一个“桥接”来控制 `iframe`。

```typescript
// 在主页面的脚本中
import { createSelectorBridge, getElementInfo } from 'select-module';

// 获取 iframe 的 window 对象
const iframe = document.getElementById('my-iframe');
const iframeWindow = iframe.contentWindow;

let selectorBridge = null;

// 启动选择模式
function startIframeSelection() {
  if (!iframeWindow) {
    console.error('Iframe window is not accessible.');
    return;
  }

  // 创建桥接实例
  selectorBridge = createSelectorBridge({
    iframeWindow: iframeWindow,
    targetOrigin: 'https://your-iframe-domain.com', // iframe页面的源，或 '*'

    // 当 iframe 内的元素被选中时，此回调被触发
    onChosen: (elementInfo) => {
      console.log('Element chosen from iframe:', elementInfo);
      // 在这里处理你的逻辑
    },

    // 传递给 iframe 内部选择器的忽略列表
    ignoreSelectors: ['.iframe-internal-header']
  });

  // 命令 iframe 启动选择模式
  selectorBridge.start();
}

// 停止选择模式
function cancelIframeSelection() {
  if (selectorBridge) {
    // 命令 iframe 停止选择模式
    selectorBridge.stop();
  }
}

// 销毁桥接和事件监听器
function destroyBridge() {
    if (selectorBridge) {
        selectorBridge.destroy();
        selectorBridge = null;
    }
}

// ---- 示例调用 ----
// document.getElementById('start-iframe-select-btn').onclick = startIframeSelection;
// document.getElementById('cancel-iframe-select-btn').onclick = cancelIframeSelection;
```

---

## 📊 返回数据格式

当一个元素被选中时，`onElementSelected` (单页面模式) 或 `onChosen` (iframe 模式) 回调会收到一个包含元素详细信息的 `elementInfo` 对象。其结构如下：

```typescript
// elementInfo 对象的类型定义
interface ElementInfo {
  selector: string;         // 元素的唯一 XPath 选择器
  outerHTML: string;        // 元素外部 HTML 的片段 (最多500个字符)
  bbox: {                   // 元素在视口中的边界框
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tagName: string;          // 元素标签名 (小写, e.g., 'div')
  id?: string;              // 元素的 ID (如果存在)
  classList: string[];      // 元素的 class 列表
  pageURL: string;          // 元素所在页面的 URL
}
```

**示例 `elementInfo` 对象**:

```json
{
  "selector": "/html/body/div[1]/main/div[2]/p[1]",
  "outerHTML": "<p class=\"intro-text\">这是一个介绍段落。</p>",
  "bbox": {
    "x": 8,
    "y": 120,
    "width": 600,
    "height": 24
  },
  "tagName": "p",
  "id": "intro",
  "classList": [
    "intro-text"
  ],
  "pageURL": "https://example.com/page"
}
```

---

## 📚 API 参考

### `ElementSelector`

用于在当前页面创建和管理选择器。

- `new ElementSelector(options)`
  - `options.onElementSelected?: (element: HTMLElement, info: ElementInfo) => void`
  - `options.onElementHovered?: (element: HTMLElement) => void`
  - `options.onElementUnhovered?: () => void`
  - `options.onClose?: () => void`
  - `options.ignoreSelectors?: string[]`
- `.start(): void`: 启动选择器。
- `.stop(): void`: 停止并移除选择器。

### `createSelectorBridge`

在主页面创建一个到 `iframe` 的通信桥接。

- `createSelectorBridge(options)`
  - `options.iframeWindow: Window`: **必需**，目标 `iframe` 的 `contentWindow` 对象。
  - `options.onChosen?: (info: ElementInfo) => void`: 当 `iframe` 中有元素被选中时的回调。
  - `options.targetOrigin?: string`: `iframe` 页面的源，用于 `postMessage` 安全策略。默认为 `'*'`。
  - `options.ignoreSelectors?: string[]`: 传递给 `iframe` 内部选择器的忽略列表。
- **返回**: 一个包含控制方法的对象：
  - `.start(): void`: 命令 `iframe` 启动选择。
  - `.stop(): void`: 命令 `iframe` 停止选择。
  - `.destroy(): void`: 移除事件监听器，销毁桥接。

### `initIframeSelector`

在 `iframe` 页面中调用，用于初始化并监听来自父页面的指令。

- `initIframeSelector(options)`
  - `options.allowed?: boolean`: 是否允许被控制。默认为 `true`。
  - `options.allowedOrigins?: string[]`: 允许的父页面源列表。默认为 `['*']`。为了安全，强烈建议设置为具体的域名。

---

## 🔧 开发

如果你需要修改此模块：

1.  克隆仓库。
2.  安装依赖: `npm install`
3.  构建项目: `npm run build`
4.  启动开发模式 (带文件监听): `npm run dev`
