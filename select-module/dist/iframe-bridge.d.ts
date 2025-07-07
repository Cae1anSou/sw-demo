import { getElementInfo } from './utils';
export declare const MESSAGE_TYPES: {
    START: string;
    STOP: string;
    CHOSEN: string;
};
/**
 * 嵌入页选择器初始化选项
 */
export interface IframeSelectOptions {
    allowed?: boolean;
    allowedOrigins?: string[];
    customStyles?: {
        highlight?: Partial<CSSStyleDeclaration>;
        selector?: Partial<CSSStyleDeclaration>;
    };
}
/**
 * 在嵌入页中初始化元素选择器
 * 监听来自父页面的消息，并控制选择器的启动和停止
 */
export declare function initIframeSelector(options?: IframeSelectOptions): () => void;
/**
 * 主站点选择器桥接选项
 */
export interface BridgeOptions {
    iframeWindow: Window;
    targetOrigin?: string;
    ignoreSelectors?: string[];
    onChosen?: (info: ReturnType<typeof getElementInfo>) => void;
    onError?: (error: Error) => void;
}
/**
 * 在主站点创建选择器桥接
 * 用于控制iframe中的元素选择器
 */
export declare function createSelectorBridge(options: BridgeOptions): {
    /**
     * 启动选择器
     */
    start(): void;
    /**
     * 停止选择器
     */
    stop(): void;
    /**
     * 销毁桥接
     */
    destroy(): void;
};
