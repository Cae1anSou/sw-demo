import { getElementInfo } from './utils';
/**
 * ElementSelector选项接口
 */
export interface ElementSelectorOptions {
    /** 忽略的元素列表，如工具栏自身 */
    ignoreSelectors?: string[];
    /** 元素被悬停时的回调 */
    onElementHovered?: (element: HTMLElement) => void;
    /** 鼠标离开元素时的回调 */
    onElementUnhovered?: () => void;
    /** 元素被选择时的回调 */
    onElementSelected?: (element: HTMLElement, info: ReturnType<typeof getElementInfo>) => void;
    /** 选择器退出时的回调 */
    onClose?: () => void;
}
/**
 * 元素选择器类
 * 创建全屏覆盖层，捕获鼠标事件并提供元素选择能力
 */
export declare class ElementSelector {
    private selectorEl;
    private highlightEl;
    private lastHoveredElement;
    private options;
    private isActive;
    constructor(options?: ElementSelectorOptions);
    /**
     * 启动选择器
     */
    start(): void;
    /**
     * 停止选择器
     */
    stop(): void;
    /**
     * 判断元素是否应该被忽略
     */
    private shouldIgnoreElement;
    /**
     * 创建选择器覆盖层
     */
    private createSelectorElement;
    /**
     * 创建高亮框
     */
    private createHighlightElement;
    /**
     * 移除选择器覆盖层
     */
    private removeSelectorElement;
    /**
     * 移除高亮框
     */
    private removeHighlightElement;
    /**
     * 绑定ESC键，提供退出方式
     */
    private bindEscapeKey;
    /**
     * 解绑ESC键
     */
    private unbindEscapeKey;
    /**
     * 鼠标移动处理
     */
    private handleMouseMove;
    /**
     * 鼠标离开处理
     */
    private handleMouseLeave;
    /**
     * 鼠标点击处理
     */
    private handleMouseClick;
    /**
     * 按键处理，ESC退出
     */
    private handleKeyDown;
    /**
     * 更新高亮框位置和大小
     */
    private updateHighlight;
    /**
     * 隐藏高亮框
     */
    private hideHighlight;
}
