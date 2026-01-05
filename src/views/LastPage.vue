<template>
  <div class="page-container last-page">
    <div class="content-text">
      <span>新的一岁</span>
      <span>希望淡淡的，顺顺的</span>
      <span>走在雪中，就算迷路，我也愿意</span>
    </div>

    <!-- 评论区 -->
    <div class="comment-section">
      <h3>留言评论</h3>
      <!-- 评论输入 -->
      <div class="comment-input">
        <textarea
          v-model="commentContent"
          placeholder="请输入你的祝福..."
          maxlength="1800"
          <!--
          匹配EdgeKV
          Value
          1.8MB限制，文本约1800字符
          --
        >
        ></textarea
        >
        <button class="btn submit-btn" @click="submitComment">提交评论</button>
      </div>
      <!-- 评论列表 -->
      <div class="comment-list">
        <div
          v-for="comment in commentList"
          :key="comment.key"
          class="comment-item"
        >
          <p class="comment-content">{{ comment.content }}</p>
          <p class="comment-time">{{ comment.time }}</p>
          <button class="btn delete-btn" @click="deleteComment(comment.key)">
            删除
          </button>
        </div>
        <div v-if="commentList.length === 0" class="no-comment">暂无评论~</div>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-secondary" @click="$router.push('/')">
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// 评论相关响应式数据
const commentContent = ref("");
// 严格匹配EdgeKV存储结构，key为唯一标识
const commentList = ref<
  Array<{
    content: string;
    time: string;
    key: string;
  }>
>([]);
// 替换为你在ESA控制台创建的EdgeKV命名空间
const NAMESPACE = "birthday-comment-kv";

// 初始化EdgeKV实例（适配ESA平台内置API + 本地调试降级）
const createEdgeKVInstance = () => {
  // 生产环境（ESA平台）使用真实EdgeKV
  if (typeof EdgeKV !== "undefined") {
    return new EdgeKV({ namespace: NAMESPACE });
  }
  // 本地开发环境用localStorage模拟，避免报错
  else {
    console.warn("本地环境未检测到EdgeKV，使用localStorage模拟");
    return {
      // 模拟get方法（适配type: json参数）
      get: async (key: string, options?: { type: string }) => {
        const data = localStorage.getItem(key);
        if (!data) return undefined;
        return options?.type === "json" ? JSON.parse(data) : data;
      },
      // 模拟put方法
      put: async (key: string, value: string) => {
        localStorage.setItem(key, value);
        return undefined;
      },
      // 模拟delete方法
      delete: async (key: string) => {
        localStorage.removeItem(key);
        return true;
      },
    };
  }
};

const edgeKV = createEdgeKVInstance();

// 从EdgeKV加载所有评论
const fetchComments = async () => {
  try {
    // 严格按官方API调用：指定type为json，直接返回对象
    const commentData = await edgeKV.get("comment_list", { type: "json" });
    if (commentData) {
      commentList.value = commentData;
    }
  } catch (e) {
    console.error("加载评论失败：", e);
    alert("加载评论失败，请稍后重试");
  }
};

// 提交评论到EdgeKV
const submitComment = async () => {
  const content = commentContent.value.trim();
  if (!content) {
    alert("请输入评论内容");
    return;
  }

  // 构造评论数据（key唯一，符合EdgeKV的key规则：字母/数字/-/_）
  const newComment = {
    content,
    time: new Date().toLocaleString(),
    key: `comment_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  };

  try {
    const newCommentList = [...commentList.value, newComment];
    // 按官方API：put接收string类型value（JSON序列化）
    await edgeKV.put("comment_list", JSON.stringify(newCommentList));
    // 更新页面列表
    commentList.value = newCommentList;
    // 清空输入框
    commentContent.value = "";
    alert("评论提交成功");
  } catch (e) {
    console.error("提交评论失败：", e);
    alert("提交评论失败，请稍后重试");
  }
};

// 从EdgeKV删除指定评论
const deleteComment = async (commentKey: string) => {
  if (!confirm("确定要删除这条评论吗？")) {
    return;
  }

  try {
    // 过滤要删除的评论
    const newCommentList = commentList.value.filter(
      (item) => item.key !== commentKey
    );
    // 更新EdgeKV存储
    await edgeKV.put("comment_list", JSON.stringify(newCommentList));
    // 更新页面列表
    commentList.value = newCommentList;
    alert("评论删除成功");
  } catch (e) {
    console.error("删除评论失败：", e);
    alert("删除评论失败，请稍后重试");
  }
};

// 页面挂载时加载评论
onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.content-text {
  text-align: center;
  margin: 20px 0;
}
.content-text span {
  display: block;
  line-height: 1.8;
  font-size: 16px;
}

/* 评论区样式 */
.comment-section {
  width: 80%;
  margin: 30px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.comment-input textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  resize: none;
  font-size: 14px;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.submit-btn:hover {
  background-color: #359e6d;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.comment-content {
  margin: 0 0 5px 0;
  font-size: 14px;
  line-height: 1.5;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin: 0 0 5px 0;
}

.delete-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.delete-btn:hover {
  background-color: #cc0000;
}

.no-comment {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

.btn-group {
  text-align: center;
  margin-top: 20px;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
