# 元素选择模块

这是一个基于TypeScript的元素选择模块，设计用于AI教学平台。该模块允许用户在教学网站内的嵌入式iframe中选择HTML元素，然后将选中元素的详细信息通过JSON格式发送到FastAPI后端进行处理。

## 项目结构

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

### 1. 安装依赖

```bash
# 安装前端依赖（构建完毕，不改TS代码的话这步可跳过）
cd select-module
npm install

# 安装后端依赖（这个没法跳过，git上传的时候忽略了这个）
cd ../backend
pip install -r requirements.txt
```

### 2. 构建选择模块（构建完毕，可跳过）

```bash
cd select-module
npm run build
```

### 3. 启动FastAPI后端

```bash
cd backend
uvicorn main:app --reload --port 8000  # 必须是8000，因为我的示例里面写死了
```

### 4. 运行演示页面

由于这是一个演示项目，您可以使用任何简单的HTTP服务器来提供静态文件：

```bash
# 在项目根目录（sw-demo）启动
python -m http.server 9000
```

然后在浏览器中访问 `http://localhost:9000/main-site/demo-002/`

## 使用说明

### 1. 在主站中集成选择模块

要在主站中集成元素选择功能，需要：

```javascript
// 1. 引入选择器桥接模块
import { createSelectorBridge } from 'select-module';

// 2. 创建桥接实例
const selectorBridge = createSelectorBridge({
  iframeSelector: '#preview-iframe',
  onElementSelected: (elementInfo) => {
    // 处理选中的元素信息
    console.log('选中元素:', elementInfo);
    
    // 发送到后端
    fetch('http://localhost:8000/api/element', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(elementInfo)
    });
  }
});

// 3. 添加启动选择的按钮
document.getElementById('select-button').addEventListener('click', () => {
  selectorBridge.startSelection();
});

// 4. 添加取消选择的按钮
document.getElementById('cancel-button').addEventListener('click', () => {
  selectorBridge.stopSelection();
});
```

### 2. 在iframe页面中集成选择模块

在您的iframe页面中，需要：

```html
<!-- 引入选择模块脚本 -->
<script src="path/to/select-module/dist/index.js"></script>

<!-- 初始化iframe选择器 -->
<script>
  window.SWSelector.initIframeSelector();
</script>
```

### 3. FastAPI后端集成

后端API提供以下端点：

- `POST /api/element`：接收选中元素的详细信息
- `GET /api/elements`：获取所有保存的元素信息
- `GET /api/element/{element_id}`：获取指定元素的详细信息

## 数据格式

### 元素信息JSON结构

```json
{
  "selector": "/html/body/div/nav/div[1]/h1",  // 元素的XPath
  "outerHTML": "<h1>Vue 示例应用</h1>",        // 元素的HTML代码
  "bbox": {                                   // 元素的边界框
    "x": 120,
    "y": 50,
    "width": 180,
    "height": 40
  },
  "tagName": "h1",                           // 元素标签名
  "id": "app-title",                         // 元素ID（如果存在）
  "classList": ["title", "main-title"],      // 元素类列表
  "pageURL": "http://localhost:9000/main-site/example-page/index.html"  // 页面URL
}
```

### 响应格式

```json
{
  "status": "success",
  "message": "元素信息已成功接收",
  "element_id": "element_20250707120145",
  "next_steps": [
    "AI正在分析元素...",
    "准备生成相关教学内容",
    "可以继续选择其他元素，或进入下一步学习"
  ]
}
```

## 通信协议

主站和iframe之间使用以下消息类型进行通信：

- `SW_SELECT_START`：主站通知iframe启动选择模式
- `SW_SELECT_STOP`：主站通知iframe停止选择模式
- `SW_SELECT_CHOSEN`：iframe通知主站已选中元素，并附带元素信息

## 技术实现细节

### ElementSelector类

`ElementSelector`类创建一个全屏透明覆盖层来捕获鼠标事件：

- 当鼠标悬停在元素上时，会创建一个高亮框
- 点击元素后，触发选择回调并提供元素详细信息
- 支持按ESC键取消选择

### 元素定位

使用`document.elementsFromPoint`获取鼠标位置下的所有元素，然后过滤出实际想要的目标元素。

### XPath生成

为每个元素生成唯一的XPath路径，以便在不同上下文中标识同一元素。

## 下一步开发计划

1. **AI集成**：连接到大语言模型，根据选中元素生成教学内容
2. **元素关系分析**：分析元素在Vue组件层次中的位置和作用
3. **交互式教学**：基于选中元素展示相关Vue概念和最佳实践
4. **用户体验改进**：增强选择器的视觉反馈和交互体验

## 贡献

欢迎贡献！请随时提交问题或拉取请求。

## 许可

MIT
