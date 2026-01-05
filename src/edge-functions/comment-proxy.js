// 评论功能边缘函数（严格对齐EdgeKV官方API规范）
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

      // 2. 提取URL参数（对齐参考代码的参数命名）
      const action = url.searchParams.get("action"); // set/get/delete
      const testKey = url.searchParams.get("testKey") || "page_comments"; // 评论存储Key
      const testValue = url.searchParams.get("testValue") || ""; // 要写入的内容
      const valueType = url.searchParams.get("valueType") || "string"; // 值类型：string/arraybuffer/response
      const namespace = "birthday-comment-kv"; // 替换为你的KV命名空间

      // 3. 初始化EdgeKV（严格按官方构造函数规范）
      let edgeKv;
      try {
        edgeKv = new EdgeKV({ namespace }); // 官方规范：传入namespace对象
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

      // ========== 4. 处理写入操作（set）：严格对齐官方put API ==========
      if (action === "set") {
        try {
          // 官方要求：key必须是非空字符串，提前校验
          if (!testKey || typeof testKey !== "string") {
            throw new Error("Key必须是非空字符串");
          }

          // 根据valueType构造不同类型的value（符合官方支持的类型）
          let putValue;
          switch (valueType) {
            case "string":
              putValue = testValue;
              break;
            case "arraybuffer":
              // 转换为ArrayBuffer类型（官方支持）
              putValue = new TextEncoder().encode(testValue);
              break;
            case "response":
              // 转换为Response类型（官方支持）
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

      // ========== 5. 处理读取操作（get）：严格对齐官方get API ==========
      if (action === "get") {
        try {
          // 调用官方get方法（type=text，返回字符串；key不存在返回undefined）
          const getType = { type: "text" }; // 官方支持的type参数
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

      // ========== 6. 处理删除操作（delete）：严格对齐官方delete API ==========
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

      // ========== 7. 无有效操作时返回指引 ==========
      const guideMsg = `
        📝 评论KV操作指引：
        1. 写入评论列表：?action=set&testKey=page_comments&testValue=JSON字符串&valueType=string
        2. 读取评论列表：?action=get&testKey=page_comments
        3. 删除评论列表：?action=delete&testKey=page_comments
        示例：
        - 写入：?action=set&testKey=page_comments&testValue=[{"content":"祝福","time":1735689600000}]&valueType=string
        - 读取：?action=get&testKey=page_comments
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
