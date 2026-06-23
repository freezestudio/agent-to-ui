/**
 * A2UI 渲染器事件系统
 *
 * 基于发布-订阅模式的事件源实现。
 * 事件源在整个渲染器中用于：组件更新通知、数据模型变更通知、
 * action 分发等场景。
 *
 * @packageDocumentation
 */

/**
 * 事件处理器类型
 * 接受事件数据的回调函数。
 */
export type EventHandler<T> = (data: T) => void;

/**
 * 事件源（EventSource）
 *
 * 可订阅的事件发射器。支持：
 * - subscribe(): 注册处理器，返回取消订阅函数
 * - emit(): 发射事件，同步通知所有订阅者
 * - dispose(): 清理所有订阅
 *
 * @example
 * ```ts
 * const onUpdate = new EventSource<string>();
 * const unsub = onUpdate.subscribe((msg) => console.log(msg));
 * onUpdate.emit("hello"); // 输出: hello
 * unsub(); // 取消订阅
 * ```
 */
export class EventSource<T> {
  /** 存储所有注册的处理器 */
  private handlers = new Set<EventHandler<T>>();

  /**
   * 订阅事件
   * @param handler 事件处理器
   * @returns 取消订阅的函数
   */
  subscribe(handler: EventHandler<T>): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * 发射事件
   * 同步调用所有注册的处理
   */
  emit(data: T): void {
    for (const handler of this.handlers) {
      handler(data);
    }
  }

  /**
   * 获取当前订阅者数量
   */
  get subscriberCount(): number {
    return this.handlers.size;
  }

  /** 清理所有订阅者 */
  dispose(): void {
    this.handlers.clear();
  }
}
