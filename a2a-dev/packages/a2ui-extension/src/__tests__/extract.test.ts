import { describe, it, expect } from "vitest";
import { extractA2uiFromTask } from "../extract.js";

describe("extractA2uiFromTask", () => {
  it("应从 artifact 的 DataPart 中提取 A2UI 消息", () => {
    const task = {
      artifacts: [{
        parts: [{
          mediaType: "application/a2ui+json",
          data: { a2uiMessages: [{ version: "1.0", createSurface: { surfaceId: "main", catalogId: "test" } }] },
        }],
      }],
    };
    const msgs = extractA2uiFromTask(task);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toEqual({
      version: "1.0",
      createSurface: { surfaceId: "main", catalogId: "test" },
    });
  });

  it("应忽略非 A2UI 的 Part", () => {
    const task = {
      artifacts: [{ parts: [{ mediaType: "text/plain", data: null }] }],
    };
    expect(extractA2uiFromTask(task)).toHaveLength(0);
  });

  it("应处理空的 artifact 列表", () => {
    expect(extractA2uiFromTask({})).toHaveLength(0);
  });
});
