/**
 * 事件系统测试
 */
import { describe, it, expect } from "vitest";
import { EventSource } from "../common/events.js";

describe("EventSource", () => {
  it("应支持订阅和发射事件", () => {
    const source = new EventSource<string>();
    const received: string[] = [];
    source.subscribe((data) => received.push(data));
    source.emit("hello");
    source.emit("world");
    expect(received).toEqual(["hello", "world"]);
  });

  it("应支持取消订阅", () => {
    const source = new EventSource<string>();
    const received: string[] = [];
    const unsub = source.subscribe((data) => received.push(data));
    source.emit("first");
    unsub();
    source.emit("second");
    expect(received).toEqual(["first"]);
  });

  it("dispose 应清除所有处理器", () => {
    const source = new EventSource<string>();
    const received: string[] = [];
    source.subscribe((data) => received.push(data));
    source.dispose();
    expect(source.subscriberCount).toBe(0);
  });
});
