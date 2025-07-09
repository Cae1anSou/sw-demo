# 元素选择模块 (sw-demo)

一个前端 + FastAPI 后端的小型 Demo，用来在嵌入式 iframe 中选取页面元素并把信息回传给服务端，配合内部 AI 教学平台原型使用。

## 目录结构

```
sw-demo/
├── select-module/       # 元素选择模块的核心代码
│   ├── dist/            # 编译后的select模块
│   ├── src/
│   │   ├── utils.ts           # 工具函数，如getElementAtPoint等
│   │   ├── element-selector.ts # 元素选择器类
│   │   ├── iframe-bridge.ts    # iframe通信桥接
│   │   └── index.ts           # 导出公共API
│   ├── package.json
│   └── tsconfig.json
├── main-site/          # 模拟主站代码
│   ├── index.html          # 旧版演示首页
│   ├── demo-002/           # 新版元素选择器演示页面
│   │   └── index.html
│   └── example-page/       # 被嵌入的示例页面
│       ├── index.html      # Vue示例页面
│       └── styles.css      # 示例页面样式
└── backend/           # FastAPI后端
    ├── main.py        # API实现
    └── requirements.txt # 依赖列表
```

## 功能概述

1. **元素选择**：在嵌入的iframe页面中高亮并选择HTML元素
2. **跨框架通信**：使用postMessage在主站和iframe之间安全通信
3. **元素信息提取**：获取选中元素的XPath、HTML、边界框等信息
4. **后端集成**：将选中元素信息发送到FastAPI后端进行处理

## 快速开始

```bash
# 1. 安装依赖
cd select-module && npm i          # 可选：仅在需要重新构建时
cd ../backend && pip install -r requirements.txt

# 2. 构建前端（可选）
cd ../select-module && npm run build

# 3. 启动服务
uvicorn backend.main:app --reload --port 8000   # 端口 8000 已写死
python -m http.server 9000                      # 项目根目录启动静态文件
# 访问 http://localhost:9000/main-site/demo-002/
```

## 集成示例

主站 JS

```ts
import { createSelectorBridge } from 'select-module';

const bridge = createSelectorBridge({
  iframeSelector: '#preview-iframe',
  onElementSelected(info) {
    fetch('http://localhost:8000/api/element', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info)
    });
  }
});

document.getElementById('select-btn')?.addEventListener('click', () => bridge.startSelection());
document.getElementById('cancel-btn')?.addEventListener('click', () => bridge.stopSelection());
```

iframe 页面

```html
<script src="path/to/select-module/dist/index.js"></script>
<script>
  window.SWSelector.initIframeSelector();
</script>
```

## Backend API

- POST `/api/element` 上报元素
- GET  `/api/elements` 获取全部元素
- GET  `/api/element/{id}` 获取单个元素

## 数据格式

```json
{
  "selector": "/html/body/div/nav/div[1]/h1",
  "outerHTML": "<h1>Vue 示例应用</h1>",
  "bbox": { "x": 120, "y": 50, "width": 180, "height": 40 },
  "tagName": "h1",
  "id": "app-title",
  "classList": ["title", "main-title"],
  "pageURL": "http://localhost:9000/main-site/example-page/index.html"
}
```

## 消息协议

| 消息 | 方向 | 描述 |
| ---- | ---- | ---- |
| `SW_SELECT_START` | 主站 → iframe | 开始选择 |
| `SW_SELECT_STOP`  | 主站 → iframe | 结束选择 |
| `SW_SELECT_CHOSEN`| iframe → 主站 | 返回元素信息 |

## 原理概览

1. `ElementSelector` 在 iframe 内插入透明遮罩，监听鼠标事件并高亮元素。
2. 选中后通过 `postMessage` 把元素信息发回主站，再由主站 POST 到后端。
3. 后端保存 JSON，供 AI 模块后续消费。

## TODO

- 接入 LLM 生成教学内容  
- 元素在组件树中的定位解释  
- 更友好的视觉交互

## License

MIT

---

有问题随时群里 @我 🍻