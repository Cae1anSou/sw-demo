/**
 * 从坐标获取目标元素，排除工具栏自身元素
 * @param x 客户端X坐标
 * @param y 客户端Y坐标
 * @returns 坐标所在的HTML元素
 */
export declare function getElementAtPoint(x: number, y: number): HTMLElement;
/**
 * 检查指定元素是否确实包含指定的点
 * @param element 要检查的元素
 * @param clientX X坐标
 * @param clientY Y坐标
 * @returns 如果元素包含该点则为true
 */
export declare function isElementAtPoint(element: HTMLElement, clientX: number, clientY: number): boolean;
/**
 * 计算点到元素的相对偏移百分比
 * @param element 参考元素
 * @param x X坐标
 * @param y Y坐标
 * @returns 偏移百分比
 */
export declare function getOffsetsFromPointToElement(element: HTMLElement, x: number, y: number): {
    offsetTop: number;
    offsetLeft: number;
};
/**
 * 生成元素的XPath，用于唯一定位元素
 * @param element 目标元素
 * @returns XPath字符串
 */
export declare function getElementXPath(element: HTMLElement): string;
/**
 * 获取元素的基本信息，便于序列化传递
 * @param element 目标元素
 * @returns 元素的JSON表示
 */
export declare function getElementInfo(element: HTMLElement): {
    selector: string;
    outerHTML: string;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    tagName: string;
    id: string | undefined;
    classList: string[];
    pageURL: string;
};
