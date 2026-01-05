// 评论功能边缘函数（严格对齐EdgeKV官方API规范）
export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);

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

      // 提取核心参数（仅保留必要参数，简化逻辑）
      const action = url.searchParams.get("action");
      const key = url.searchParams.get("key") || "page_comments";
      const namespace = "test-msy"; // 控制台创建的存储空间名称

      // 初始化EdgeKV（严格按官方构造函数）
      const edgeKv = new EdgeKV({ namespace });

      // ========== 1. 写入操作（set）：严格按官方put API ==========
      if (action === "set") {
        try {
          // 从URL参数获取value（前端已JSON.stringify，此处为string类型）
          const value = url.searchParams.get("value");
          if (!key) throw new Error("key不能为空");
          if (value === null) throw new Error("value不能为空");

          // 调用官方put API（成功返回undefined，失败抛异常）
          await edgeKv.put(key, value);

          // 返回极简成功响应（方便前端判断，避免解析复杂文案）
          return new Response(
            JSON.stringify({
              code: 200,
              msg: "success",
              data: null,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        } catch (e) {
          return new Response(
            JSON.stringify({
              code: 500,
              msg: `写入失败：${e.message}`,
              data: null,
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
      }

      // ========== 2. 读取操作（get）：用官方json类型，直接返回数组 ==========
      if (action === "get") {
        try {
          // 调用官方get API，指定type: "json"（自动解析JSON字符串为数组）
          const value = await edgeKv.get(key, { type: "json" });

          return new Response(
            JSON.stringify({
              code: 200,
              msg: "success",
              data: value || [], // 无数据返回空数组，前端无需额外处理
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        } catch (e) {
          return new Response(
            JSON.stringify({
              code: 500,
              msg: `读取失败：${e.message}`,
              data: [],
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
      }

      // ========== 3. 删除操作（delete）：严格按官方delete API ==========
      if (action === "delete") {
        try {
          if (!key) throw new Error("key不能为空");
          const deleteResult = await edgeKv.delete(key); // 成功返回true，失败返回false

          if (deleteResult) {
            return new Response(
              JSON.stringify({
                code: 200,
                msg: "删除成功",
                data: null,
              }),
              {
                status: 200,
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                  "Access-Control-Allow-Origin": "*",
                },
              }
            );
          } else {
            return new Response(
              JSON.stringify({
                code: 500,
                msg: "删除失败：key不存在或删除失败",
                data: null,
              }),
              {
                status: 500,
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                  "Access-Control-Allow-Origin": "*",
                },
              }
            );
          }
        } catch (e) {
          return new Response(
            JSON.stringify({
              code: 500,
              msg: `删除异常：${e.message}`,
              data: null,
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
      }

      // 无有效操作时返回指引
      return new Response(
        JSON.stringify({
          code: 400,
          msg: "无效操作，支持action：set/get/delete，参数：key/value",
          data: null,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (e) {
      // 全局异常兜底
      return new Response(
        JSON.stringify({
          code: 500,
          msg: `函数执行异常：${e.message}`,
          data: null,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
