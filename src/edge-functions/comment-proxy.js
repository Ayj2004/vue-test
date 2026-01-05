export default {
  async fetch(request) {
    // 全局异常捕获
    try {
      const url = new URL(request.url);
      const action = url.searchParams.get("action");
      const namespace = "birthday-comment-kv"; // 替换为你的KV存储空间名称
      let edgeKv;

      // 初始化EdgeKV
      try {
        edgeKv = new EdgeKV({ namespace });
      } catch (e) {
        console.error("EdgeKV实例化失败:", e);
        return new Response(
          JSON.stringify({ code: 500, msg: "存储初始化失败" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // 1. 获取评论列表
      if (action === "getComments") {
        try {
          // 从KV中读取评论数据（key固定为comments_list）
          const commentsStr = await edgeKv.get("comments_list", {
            type: "text",
          });
          const comments = commentsStr ? JSON.parse(commentsStr) : [];
          return new Response(
            JSON.stringify({
              code: 200,
              msg: "success",
              comments,
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // 允许跨域
                "Access-Control-Allow-Methods": "GET, POST",
                "Access-Control-Allow-Headers": "Content-Type",
              },
            }
          );
        } catch (e) {
          console.error("获取评论失败:", e);
          return new Response(
            JSON.stringify({ code: 500, msg: "获取评论失败" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      // 2. 提交评论
      if (action === "submitComment") {
        try {
          // 解析请求体
          const body = await request.json();
          if (!body.content) {
            return new Response(
              JSON.stringify({ code: 400, msg: "评论内容不能为空" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // 读取现有评论
          const commentsStr = await edgeKv.get("comments_list", {
            type: "text",
          });
          const comments = commentsStr ? JSON.parse(commentsStr) : [];

          // 添加新评论（前置插入，最新的在最前面）
          comments.unshift({
            content: body.content,
            time: body.time || Date.now(),
          });

          // 写入KV（限制评论数量，最多保留100条）
          const limitComments = comments.slice(0, 100);
          await edgeKv.put("comments_list", JSON.stringify(limitComments));

          return new Response(
            JSON.stringify({
              code: 200,
              msg: "评论提交成功",
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST",
                "Access-Control-Allow-Headers": "Content-Type",
              },
            }
          );
        } catch (e) {
          console.error("提交评论失败:", e);
          return new Response(
            JSON.stringify({ code: 500, msg: "提交评论失败" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      // 3. 未知action
      return new Response(
        JSON.stringify({ code: 400, msg: "无效的操作类型" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (e) {
      console.error("全局异常:", e);
      return new Response(
        JSON.stringify({ code: 500, msg: "服务器内部错误" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
