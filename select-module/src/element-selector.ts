import { getElementAtPoint, getElementInfo } from './utils';

/**
 * 最高层级常量，确保覆盖层和高亮层位于页面的最上层
 */
const MAX_Z_INDEX = 2147483646; // 最大安全整数 (2^31 - 2)

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
export class ElementSelector {
  private selectorEl: HTMLDivElement | null = null;
  private highlightEl: HTMLDivElement | null = null;
  private lastHoveredElement: HTMLElement | null = null;
  private options: ElementSelectorOptions;
  private isActive = false;

  constructor(options: ElementSelectorOptions = {}) {
    this.options = {
      ignoreSelectors: ['.sw-selector', '.sw-highlight'],
      ...options
    };
  }

  /**
   * 启动选择器
   */
  public start(): void {
    if (this.isActive) return;
    this.isActive = true;
    
    // 创建选择器覆盖层
    this.createSelectorElement();
    // 创建高亮框
    this.createHighlightElement();
    // 监听ESC键，提供退出方式
    this.bindEscapeKey();
  }

  /**
   * 停止选择器
   */
  public stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    
    this.removeSelectorElement();
    this.removeHighlightElement();
    this.unbindEscapeKey();
    
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  /**
   * 判断元素是否应该被忽略
   */
  private shouldIgnoreElement(element: HTMLElement): boolean {
    if (!element) return true;
    
    const ignoreSelectors = this.options.ignoreSelectors || [];
    return ignoreSelectors.some(selector => {
      if (selector.startsWith('.')) {
        return element.classList.contains(selector.substring(1));
      }
      if (selector.startsWith('#')) {
        return element.id === selector.substring(1);
      }
      return element.matches(selector);
    });
  }

  /**
   * 创建选择器覆盖层
   */
  private createSelectorElement(): void {
    if (this.selectorEl) return;
    
    const selectorEl = document.createElement('div');
    selectorEl.className = 'sw-selector';
    Object.assign(selectorEl.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.01)',
      zIndex: String(MAX_Z_INDEX),
      cursor: 'crosshair',
      pointerEvents: 'auto'
    });
    
    // 监听鼠标事件
    selectorEl.addEventListener('mousemove', this.handleMouseMove);
    selectorEl.addEventListener('mouseleave', this.handleMouseLeave);
    selectorEl.addEventListener('click', this.handleMouseClick);
    
    document.body.appendChild(selectorEl);
    this.selectorEl = selectorEl;
  }

  /**
   * 创建高亮框
   */
  private createHighlightElement(): void {
    if (this.highlightEl) return;
    
    const highlightEl = document.createElement('div');
    highlightEl.className = 'sw-highlight';
    Object.assign(highlightEl.style, {
      position: 'fixed',
      display: 'none',
      pointerEvents: 'none',
      border: '2px solid #0079d3',
      backgroundColor: 'rgba(0, 121, 211, 0.1)',
      zIndex: String(MAX_Z_INDEX - 1)
    });
    
    document.body.appendChild(highlightEl);
    this.highlightEl = highlightEl;
  }

  /**
   * 移除选择器覆盖层
   */
  private removeSelectorElement(): void {
    if (!this.selectorEl) return;
    
    this.selectorEl.removeEventListener('mousemove', this.handleMouseMove);
    this.selectorEl.removeEventListener('mouseleave', this.handleMouseLeave);
    this.selectorEl.removeEventListener('click', this.handleMouseClick);
    
    document.body.removeChild(this.selectorEl);
    this.selectorEl = null;
  }

  /**
   * 移除高亮框
   */
  private removeHighlightElement(): void {
    if (!this.highlightEl) return;
    
    document.body.removeChild(this.highlightEl);
    this.highlightEl = null;
    
    this.lastHoveredElement = null;
  }

  /**
   * 绑定ESC键，提供退出方式
   */
  private bindEscapeKey(): void {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 解绑ESC键
   */
  private unbindEscapeKey(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 鼠标移动处理
   */
  private handleMouseMove = (event: MouseEvent): void => {
    // 使用requestAnimationFrame优化性能，避免频繁DOM操作
    requestAnimationFrame(() => {
      // 先隐藏高亮层，以便获取下方真实元素
      if (this.highlightEl && this.highlightEl.style.display !== 'none') {
        this.highlightEl.style.display = 'none';
      }
      
      // 通过工具函数获取实际元素，忽略选择器自身元素
      const refElement = getElementAtPoint(event.clientX, event.clientY);
      if (!refElement || this.shouldIgnoreElement(refElement)) {
        this.hideHighlight();
        return;
      }
      
      // 与上次hover元素相同，不做处理
      if (this.lastHoveredElement === refElement) {
        // 确保高亮框显示
        if (this.highlightEl && this.highlightEl.style.display === 'none') {
          this.updateHighlight(refElement);
        }
        return;
      }
      
      // 更新最后悬停元素
      if (this.lastHoveredElement !== refElement) {
        // 如果有前一个悬停元素，触发unhover事件
        if (this.lastHoveredElement && this.options.onElementUnhovered) {
          this.options.onElementUnhovered();
        }
        
        this.lastHoveredElement = refElement;
        
        // 更新高亮框
        this.updateHighlight(refElement);
        
        // 调用外部钩子
        if (this.options.onElementHovered) {
          this.options.onElementHovered(refElement);
        }
      }
    });
  };

  /**
   * 鼠标离开处理
   */
  private handleMouseLeave = (): void => {
    this.hideHighlight();
    this.lastHoveredElement = null;
    
    if (this.options.onElementUnhovered) {
      this.options.onElementUnhovered();
    }
  };

  /**
   * 鼠标点击处理
   */
  private handleMouseClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.lastHoveredElement) return;
    if (this.shouldIgnoreElement(this.lastHoveredElement)) return;
    
    const elementInfo = getElementInfo(this.lastHoveredElement);
    
    // 调用外部选择回调
    if (this.options.onElementSelected) {
      this.options.onElementSelected(this.lastHoveredElement, elementInfo);
    }
    
    // 选择完成后自动停止
    this.stop();
  };

  /**
   * 按键处理，ESC退出
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.stop();
    }
  };

  /**
   * 更新高亮框位置和大小
   */
  private updateHighlight(element: HTMLElement): void {
    if (!this.highlightEl || !element) return;
    
    const rect = element.getBoundingClientRect();
    
    Object.assign(this.highlightEl.style, {
      display: 'block',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  }

  /**
   * 隐藏高亮框
   */
  private hideHighlight(): void {
    if (!this.highlightEl) return;
    this.highlightEl.style.display = 'none';
  }
}
