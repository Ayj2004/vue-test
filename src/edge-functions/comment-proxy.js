// 评论功能边缘函数代理（基于EdgeKV实现）
export default {
  async fetch(request) {
    // 全局异常捕获
    try {
      // 1. 解析URL
      let url;
      try {
        url = new URL(request.url);
      } catch (e) {
        const errMsg = `URL解析失败：${e.message}`;
        console.error(errMsg);
        return new Response(
          JSON.stringify({
            code: 400,
            msg: errMsg,
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          }
        );
      }

      // 处理OPTIONS预检请求
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

      // 2. 初始化配置
      const action = url.searchParams.get("action"); // get/set
      const namespace = "birthday-comment-kv"; // 替换为你的KV命名空间
      const commentKey = "page_comments"; // 存储评论的KV Key

      // 3. 初始化EdgeKV
      let edgeKv;
      try {
        edgeKv = new EdgeKV({ namespace });
      } catch (e) {
        const errMsg = `EdgeKV实例化失败：${e.message}`;
        console.error(errMsg);
        return new Response(
          JSON.stringify({
            code: 500,
            msg: errMsg,
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

      // 4. 处理获取评论请求（GET）
      if (action === "get") {
        try {
          // 从KV读取评论列表（JSON字符串解析）
          const commentStr = await edgeKv.get(commentKey, { type: "text" });
          const commentList = commentStr ? JSON.parse(commentStr) : [];

          return new Response(
            JSON.stringify({
              code: 200,
              msg: "获取评论成功",
              data: commentList,
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
          const errMsg = `获取评论失败：${e.message}`;
          console.error(errMsg);
          return new Response(
            JSON.stringify({
              code: 500,
              msg: errMsg,
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

      // 5. 处理提交评论请求（POST）
      if (action === "set") {
        try {
          // 解析请求体中的评论数据
          let newComment;
          try {
            newComment = await request.json();
          } catch (e) {
            throw new Error("评论数据格式错误：请提交JSON格式数据");
          }

          // 校验评论内容
          if (
            !newComment.content ||
            typeof newComment.content !== "string" ||
            newComment.content.trim() === ""
          ) {
            throw new Error("评论内容不能为空");
          }
          if (!newComment.time || typeof newComment.time !== "number") {
            newComment.time = Date.now(); // 补全默认时间戳
          }

          // 读取现有评论列表
          const commentStr = await edgeKv.get(commentKey, { type: "text" });
          const commentList = commentStr ? JSON.parse(commentStr) : [];

          // 添加新评论（限制最多存储100条，避免数据过大）
          commentList.push(newComment);
          if (commentList.length > 100) {
            commentList.shift(); // 超出100条时删除最早的评论
          }

          // 将更新后的评论列表写入KV
          await edgeKv.put(commentKey, JSON.stringify(commentList));

          return new Response(
            JSON.stringify({
              code: 200,
              msg: "评论提交成功",
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
          const errMsg = `提交评论失败：${e.message}`;
          console.error(errMsg);
          return new Response(
            JSON.stringify({
              code: 500,
              msg: errMsg,
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

      // 6. 无效操作处理
      return new Response(
        JSON.stringify({
          code: 400,
          msg: "无效的操作类型，请指定action=get或action=set",
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
      // 终极兜底异常处理
      const errMsg = `函数执行全局异常：${e.message}`;
      console.error(errMsg);
      return new Response(
        JSON.stringify({
          code: 500,
          msg: errMsg,
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
