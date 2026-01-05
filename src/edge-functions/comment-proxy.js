// 评论功能边缘函数（整合测试逻辑 + 业务逻辑，严格对齐EdgeKV官方API规范）
export default {
  async fetch(request) {
    // 全局异常捕获：避免未处理异常导致599错误
    try {
      // 1. 解析URL（防御性处理，捕获URL解析失败）
      let url;
      try {
        url = new URL(request.url);
      } catch (e) {
        const errMsg = `URL解析失败：${e.message}`;
        console.error(errMsg);
        return new Response(errMsg, {
          status: 400,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      // 处理OPTIONS预检请求（跨域必备）
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      // 2. 提取URL参数（兼容测试和业务逻辑）
      const action = url.searchParams.get("action"); // set/get/delete/test
      const testKey = url.searchParams.get("testKey") || "page_comments"; // 默认评论存储Key
      const testValue = url.searchParams.get("testValue") || "";
      const valueType = url.searchParams.get("valueType") || "string";
      const namespace = "test-msy"; // 统一命名空间

      // 3. 初始化EdgeKV（严格按官方构造函数规范）
      let edgeKv;
      try {
        edgeKv = new EdgeKV({ namespace });
      } catch (e) {
        const errMsg = `EdgeKV实例化失败：${e.message}`;
        console.error(errMsg);
        return new Response(errMsg, {
          status: 500,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // ========== 4. 处理写入操作（set）：支持评论业务 + 测试 ==========
      if (action === "set") {
        try {
          // 官方要求：key必须是非空字符串，提前校验
          if (!testKey || typeof testKey !== "string") {
            throw new Error("Key必须是非空字符串");
          }

          // 根据valueType构造不同类型的value
          let putValue;
          switch (valueType) {
            case "string":
              putValue = testValue;
              break;
            case "arraybuffer":
              putValue = new TextEncoder().encode(testValue);
              break;
            case "response":
              putValue = new Response(testValue);
              break;
            default:
              throw new Error(
                `不支持的value类型：${valueType}，仅支持string/arraybuffer/response`
              );
          }

          // 调用官方put方法（成功返回undefined，失败抛出异常）
          const putResult = await edgeKv.put(testKey, putValue);

          // 严格按官方返回值判断：undefined表示成功
          if (putResult === undefined) {
            const resMsg = `✅ KV写入成功（${valueType}类型）！Key: ${testKey}, Value: ${testValue}`;
            console.log(resMsg);
            return new Response(resMsg, {
              status: 200,
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            });
          } else {
            const errMsg = `⚠️ KV写入返回非预期值：${putResult}`;
            console.error(errMsg);
            return new Response(errMsg, {
              status: 500,
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }
        } catch (e) {
          const errMsg = `❌ KV写入失败：${e.message}`;
          console.error(errMsg);
          return new Response(errMsg, {
            status: 500,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      // ========== 5. 处理读取操作（get）：支持评论业务 + 测试 ==========
      if (action === "get") {
        try {
          // 调用官方get方法（type=text，返回字符串；key不存在返回undefined）
          const getType = { type: "text" };
          const value = await edgeKv.get(testKey, getType);

          // 按官方返回值判断：undefined表示key不存在
          const resMsg = value
            ? `✅ KV读取成功！Key: ${testKey}, Value: ${value}`
            : `⚠️ KV读取为空！Key: ${testKey} 不存在`;
          console.log(resMsg);
          return new Response(resMsg, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (e) {
          const errMsg = `❌ KV读取失败：${e.message}`;
          console.error(errMsg);
          return new Response(errMsg, {
            status: 500,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      // ========== 6. 处理删除操作（delete）：对齐官方API ==========
      if (action === "delete") {
        try {
          // 调用官方delete方法（成功返回true，失败返回false，异常抛出error）
          const deleteResult = await edgeKv.delete(testKey);

          if (deleteResult === true) {
            const resMsg = `✅ KV删除成功！Key: ${testKey}`;
            console.log(resMsg);
            return new Response(resMsg, {
              status: 200,
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            });
          } else {
            const errMsg = `❌ KV删除失败！Key: ${testKey}（delete返回${deleteResult}）`;
            console.error(errMsg);
            return new Response(errMsg, {
              status: 500,
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }
        } catch (e) {
          const errMsg = `❌ KV删除异常：${e.message}`;
          console.error(errMsg);
          return new Response(errMsg, {
            status: 500,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      // ========== 7. 完整读写测试（test）：方便调试 ==========
      if (action === "test") {
        try {
          // 先校验key
          if (!testKey || typeof testKey !== "string") {
            throw new Error("Key必须是非空字符串");
          }
          // 构造对应类型的value
          let putValue;
          switch (valueType) {
            case "string":
              putValue = testValue;
              break;
            case "arraybuffer":
              putValue = new TextEncoder().encode(testValue);
              break;
            case "response":
              putValue = new Response(testValue);
              break;
            default:
              throw new Error(
                `不支持的value类型：${valueType}，仅支持string/arraybuffer/response`
              );
          }
          // 写入数据
          const putResult = await edgeKv.put(testKey, putValue);
          if (putResult !== undefined) {
            throw new Error(`写入返回非预期值：${putResult}`);
          }
          // 立即读取验证
          const value = await edgeKv.get(testKey, { type: "text" });
          const resMsg =
            value === testValue
              ? `✅ KV完整测试成功（${valueType}类型）！写入/读取一致：Key=${testKey}, Value=${value}`
              : `❌ KV完整测试失败！写入值=${testValue}，读取值=${value}`;
          console.log(resMsg);
          return new Response(resMsg, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (e) {
          const errMsg = `❌ KV完整测试失败：${e.message}`;
          console.error(errMsg);
          return new Response(errMsg, {
            status: 500,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      // ========== 8. 黑名单逻辑（保留原有业务） ==========
      const uid = url.searchParams.get("uid");
      if (!action && uid) {
        let isExist;
        try {
          isExist = await edgeKv.get(uid, { type: "text" });
        } catch (e) {
          console.error("EdgeKV读取失败（黑名单逻辑）：", e);
          return await fetch(request);
        }
        if (isExist) {
          return new Response("Forbidden: uid forbidden", {
            status: 403,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          });
        } else {
          return await fetch(request);
        }
      }

      // ========== 9. 无有效操作时返回指引 ==========
      const guideMsg = `
        📝 评论KV操作指引：
        1. 写入评论列表：?action=set&testKey=page_comments&testValue=JSON字符串&valueType=string
        2. 读取评论列表：?action=get&testKey=page_comments
        3. 删除评论列表：?action=delete&testKey=page_comments
        4. 完整测试（多类型）：?action=test&testKey=自定义Key&testValue=自定义Value&valueType=string/arraybuffer/response
        示例：
        - 写入评论：?action=set&testKey=page_comments&testValue=[{"content":"祝福","time":1735689600000}]&valueType=string
        - 读取评论：?action=get&testKey=page_comments
      `;
      return new Response(guideMsg, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      // 终极兜底异常处理
      const errMsg = `函数执行全局异常：${e.message}`;
      console.error(errMsg);
      return new Response(errMsg, {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
