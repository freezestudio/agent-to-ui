/**
 * A2A v1.0 示例客户端
 *
 * 演示完整的 A2A 交互流程：
 * 1. 智能体发现 (获取 AgentCard)
 * 2. 发送普通消息 (SendMessage)
 * 3. 发送流式消息 (SendStreamingMessage)
 * 4. 获取扩展智能体卡片
 * 5. 任务管理 (GetTask, ListTasks, CancelTask)
 */

import { A2AClient, createTextMessage } from "@a2a-dev/client";
import { Role } from "@a2a-dev/core";

const SERVER_URL = "http://127.0.0.1:9999";

async function main() {
  console.log("=".repeat(60));
  console.log("  A2A v1.0 协议示例客户端");
  console.log("=".repeat(60));
  console.log();

  const client = new A2AClient({
    baseUrl: `${SERVER_URL}/a2a`,
    protocolVersion: "1.0",
  });

  // ========== 第 1 步：智能体发现 ==========
  // A2A 规范 - 4.4 智能体发现对象
  console.log("📋 第 1 步：智能体发现");
  console.log("-".repeat(40));
  try {
    const card = await client.discover(SERVER_URL);
    console.log(`   名称: ${card.name}`);
    console.log(`   描述: ${card.description}`);
    console.log(`   版本: ${card.version}`);
    console.log(`   技能: ${card.skills?.map((s) => s.name).join(", ")}`);
    console.log(`   流式传输: ${card.capabilities?.streaming ? "✅" : "❌"}`);
    console.log(`   扩展卡片: ${card.capabilities?.extendedAgentCard ? "✅" : "❌"}`);
  } catch (error) {
    console.error("   ❌ 发现失败:", error);
    return;
  }
  console.log();

  // ========== 第 2 步：发送普通消息 ==========
  // A2A 规范 3.1.1
  console.log("📤 第 2 步：发送普通消息 (SendMessage)");
  console.log("-".repeat(40));
  try {
    const message = createTextMessage("你好，A2A 世界！", Role.ROLE_USER);
    console.log(`   发送: "${message.parts[0]?.text}"`);

    const task = await client.sendMessage(message);
    console.log(`   任务 ID: ${task.id}`);
    console.log(`   状态: ${task.status.state}`);
    console.log(`   响应: "${task.artifacts?.[0]?.parts[0]?.text ?? "无"}"`);
  } catch (error) {
    console.error("   ❌ 发送失败:", error);
  }
  console.log();

  // ========== 第 3 步：发送流式消息 ==========
  // A2A 规范 3.1.2
  console.log("📡 第 3 步：发送流式消息 (SendStreamingMessage)");
  console.log("-".repeat(40));
  try {
    const message = createTextMessage("流式传输测试消息", Role.ROLE_USER);
    console.log(`   发送: "${message.parts[0]?.text}"`);

    let eventCount = 0;
    for await (const event of client.sendStreamingMessage(message)) {
      if (event.task) {
        console.log(`   收到任务: 状态=${event.task.status.state}`);
      } else if (event.statusUpdate) {
        console.log(`   收到状态更新: ${event.statusUpdate.status.state}`);
      } else if (event.artifactUpdate) {
        console.log(`   收到制品: "${event.artifactUpdate.artifact.parts[0]?.text}"`);
      }
      eventCount++;
    }
    console.log(`   总共收到 ${eventCount} 个事件`);
  } catch (error) {
    console.error("   ❌ 流式传输失败:", error);
  }
  console.log();

  // ========== 第 4 步：获取扩展智能体卡片 ==========
  // A2A 规范 3.1.11
  console.log("🔒 第 4 步：获取扩展智能体卡片 (GetExtendedAgentCard)");
  console.log("-".repeat(40));
  try {
    const extendedCard = await client.getExtendedAgentCard();
    console.log(`   名称: ${extendedCard.name}`);
    console.log(`   版本: ${extendedCard.version}`);
    console.log(`   扩展技能: ${extendedCard.skills?.map((s) => s.name).join(", ")}`);
  } catch (error) {
    console.error("   ❌ 获取扩展卡片失败:", error);
  }
  console.log();

  // ========== 第 5 步：列出任务 ==========
  // A2A 规范 3.1.4
  console.log("📋 第 5 步：列出任务 (ListTasks)");
  console.log("-".repeat(40));
  try {
    const result = await client.listTasks({ pageSize: 10 });
    console.log(`   任务数量: ${result.tasks.length}`);
    for (const task of result.tasks) {
      console.log(`   - ${task.id} [${task.status.state}]`);
    }
  } catch (error) {
    console.error("   ❌ 列出任务失败:", error);
  }
  console.log();

  console.log("=".repeat(60));
  console.log("  ✅ A2A 交互演示完成");
  console.log("=".repeat(60));
}

main().catch(console.error);
