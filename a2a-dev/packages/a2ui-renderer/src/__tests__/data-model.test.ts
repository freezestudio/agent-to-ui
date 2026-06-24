/**
 * 数据模型测试
 */
import { describe, it, expect } from "vite-plus/test";
import { DataModel } from "../state/data-model.js";

describe("DataModel", () => {
  it("应支持设置和读取根路径值", () => {
    const dm = new DataModel();
    dm.set("/", { user: { name: "Alice", age: 30 } });
    expect(dm.resolve("/user/name")).toBe("Alice");
    expect(dm.resolve("/user/age")).toBe(30);
  });

  it("应支持深度嵌套路径", () => {
    const dm = new DataModel();
    dm.set("/a/b/c", "deep");
    expect(dm.resolve("/a/b/c")).toBe("deep");
  });

  it("应支持路径删除（设为 undefined）", () => {
    const dm = new DataModel();
    dm.set("/", { key: "value", temp: "delete" });
    dm.set("/temp", undefined);
    const snap = dm.getSnapshot();
    expect(snap).not.toHaveProperty("temp");
    expect(snap).toHaveProperty("key");
  });

  it("应返回 undefined 用于不存在的路径", () => {
    const dm = new DataModel();
    expect(dm.resolve("/nothing/here")).toBeUndefined();
  });

  it("getSnapshot 应返回深拷贝", () => {
    const dm = new DataModel();
    dm.set("/", { items: [1, 2, 3] });
    const snap1 = dm.getSnapshot() as Record<string, number[]>;
    const snap2 = dm.getSnapshot() as Record<string, number[]>;
    expect(snap1).toEqual(snap2);
    snap1.items[0] = 999;
    expect(snap2.items[0]).toBe(1); // 深拷贝保证隔离
  });

  it("应发射 onUpdated 事件", () => {
    const dm = new DataModel();
    const changes: Array<{ path: string }> = [];
    dm.onUpdated.subscribe((c) => changes.push(c));
    dm.set("/name", "Bob");
    expect(changes).toHaveLength(1);
    expect(changes[0].path).toBe("/name");
  });
});
