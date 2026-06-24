/**
 * 消息处理器测试
 */
import { describe, it, expect } from "vite-plus/test";
import { MessageProcessor } from "../processing/message-processor.js";
import { SurfaceModel } from "../state/surface-model.js";

describe("MessageProcessor", () => {
  it("应处理 createSurface + updateComponents + updateDataModel", () => {
    const mp = new MessageProcessor();
    mp.processMessages([
      { version: "1.0", createSurface: { surfaceId: "main", catalogId: "test" } },
      {
        version: "1.0",
        updateComponents: {
          surfaceId: "main",
          components: [
            { id: "root", component: "Column", children: ["t1"] },
            { id: "t1", component: "Text", text: "Hello" },
          ],
        },
      },
      {
        version: "1.0",
        updateDataModel: { surfaceId: "main", path: "/user/name", value: "World" },
      },
    ]);

    const surface = mp.model.getSurface("main");
    expect(surface).toBeDefined();
    expect(surface!.componentsModel.get("t1")?.type).toBe("Text");
    expect(surface!.dataModel.resolve("/user/name")).toBe("World");
  });

  it("应处理 deleteSurface", () => {
    const mp = new MessageProcessor();
    mp.processMessages([
      { version: "1.0", createSurface: { surfaceId: "main", catalogId: "test" } },
      { version: "1.0", deleteSurface: { surfaceId: "main" } },
    ]);
    expect(mp.model.getSurface("main")).toBeUndefined();
  });

  it("应支持 v1.0 单消息 UI 实例化（内联组件和数据）", () => {
    const mp = new MessageProcessor();
    mp.processMessages([
      {
        version: "1.0",
        createSurface: {
          surfaceId: "dashboard",
          catalogId: "test",
          components: [{ id: "root", component: "Text", text: "Dashboard" }],
          dataModel: { stats: { users: 100 } },
        },
      },
    ]);

    const surface = mp.model.getSurface("dashboard");
    expect(surface).toBeDefined();
    expect(surface!.componentsModel.get("root")?.type).toBe("Text");
    expect(surface!.dataModel.resolve("/stats/users")).toBe(100);
  });

  it("发送 updateComponents 给不存在的 surface 不应报错", () => {
    const mp = new MessageProcessor();
    expect(() => {
      mp.processMessages([
        {
          version: "1.0",
          updateComponents: {
            surfaceId: "nonexistent",
            components: [{ id: "t1", component: "Text", text: "Hi" }],
          },
        },
      ]);
    }).not.toThrow();
  });

  it("应触发 actionHandler", () => {
    const actions: string[] = [];
    const mp = new MessageProcessor((action) => actions.push(action.action?.name ?? ""));
    const surface = new SurfaceModel("test");
    mp.model.addSurface(surface);
    void surface.dispatchAction({
      version: "1.0",
      action: {
        name: "submit",
        surfaceId: "test",
        sourceComponentId: "btn",
        timestamp: "now",
        context: {},
      },
    });
    expect(actions).toContain("submit");
  });
});
