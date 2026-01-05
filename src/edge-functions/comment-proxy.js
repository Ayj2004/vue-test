// edge-functions/comment-handler.js
// 阿里云边缘函数 - 评论区EdgeKV操作逻辑
// 命名空间：birthday-comment-kv

export default {
  async fetch(request) {
    return handleRequest(request);
  },
};

async function handleRequest(request) {
  // 初始化EdgeKV实例（指定命名空间）
  const edgeKV = new EdgeKV({ namespace: "birthday-comment-kv" });
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 跨域配置（必须，否则前端请求会报错）
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // 生产环境建议限定具体域名
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 处理OPTIONS预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. 读取所有评论（GET请求）
  if (request.method === "GET" && pathname === "/api/comments") {
    try {
      // 读取存储的评论列表（Key固定为"comment_list"）
      const commentListStr = await edgeKV.get("comment_list", { type: "text" });
      const commentList = commentListStr ? JSON.parse(commentListStr) : [];
      return new Response(JSON.stringify(commentList), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "读取评论失败: " + e.message }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  }

  // 2. 提交评论（POST请求）
  if (request.method === "POST" && pathname === "/api/comments") {
    try {
      // 解析前端提交的评论内容
      const body = await request.json();
      const { content } = body;

      // 校验Key/Value规则（阿里云EdgeKV限制）
      if (!content || content.length > 1843200) {
        // 1.8MB = 1843200字节
        return new Response(
          JSON.stringify({ error: "评论内容不能为空且不超过1.8MB" }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // 读取现有评论列表
      let commentListStr = await edgeKV.get("comment_list", { type: "text" });
      let commentList = commentListStr ? JSON.parse(commentListStr) : [];

      // 构造新评论（添加时间戳）
      const newComment = {
        id: Date.now().toString(), // 唯一ID（避免Key冲突）
        content: content.trim(),
        time: new Date().toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // 新增评论（最新的在最前面）
      commentList.unshift(newComment);

      // 写入EdgeKV（Value需为字符串，符合1.8MB限制）
      await edgeKV.put("comment_list", JSON.stringify(commentList));

      return new Response(
        JSON.stringify({ success: true, comment: newComment }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "提交评论失败: " + e.message }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  }

  // 3. 删除评论（DELETE请求，可选）
  if (request.method === "DELETE" && pathname.startsWith("/api/comments/")) {
    try {
      const commentId = pathname.split("/").pop();
      let commentListStr = await edgeKV.get("comment_list", { type: "text" });
      let commentList = commentListStr ? JSON.parse(commentListStr) : [];

      // 过滤掉要删除的评论
      commentList = commentList.filter((item) => item.id !== commentId);

      // 更新EdgeKV
      await edgeKV.put("comment_list", JSON.stringify(commentList));

      return new Response(JSON.stringify({ success: true }), {
        headers: corsHeaders,
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "删除评论失败: " + e.message }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  }

  // 匹配不到路由
  return new Response(JSON.stringify({ error: "接口不存在" }), {
    status: 404,
    headers: corsHeaders,
  });
}
// ESA平台边缘函数入口文件：处理静态资源转发 + EdgeKV跨域 + 权限适配
export default {
  async fetch(request) {
    // 跨域配置（必须，否则前端调用EdgeKV会跨域）
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // 生产环境建议限定具体域名
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // 预检请求缓存1天
    };

    // 处理OPTIONS预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      // 1. 转发Vue静态资源请求（适配ESA静态资源托管）
      const response = await fetch(request);
      // 2. 给响应头追加跨域配置，确保前端能正常调用EdgeKV
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (e) {
      console.error('边缘函数转发异常：', e);
      return new Response(JSON.stringify({
        code: 500,
        msg: '服务异常：' + e.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  },
};