<template>
  <div class="page-container last-page">
    <div class="content-text">
      <span>新的一岁</span>
      <span>希望淡淡的，顺顺的</span>
      <span>走在雪中，就算迷路，我也愿意</span>
    </div>

    <!-- 评论区模块 -->
    <div class="comment-section">
      <h3 class="comment-title">💬 留言区</h3>

      <!-- 评论输入框 -->
      <div class="comment-input-wrap">
        <textarea
          v-model="commentContent"
          placeholder="写下你的祝福吧..."
          class="comment-input"
          maxlength="200"
          @keydown.enter="handleCommentSubmit"
        ></textarea>
        <button
          class="btn submit-comment-btn"
          @click="handleCommentSubmit"
          :disabled="!commentContent.trim() || isSubmitting"
        >
          {{ isSubmitting ? "提交中..." : "发送祝福" }}
        </button>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list" v-if="commentList.length">
        <div
          class="comment-item"
          v-for="(item, index) in commentList"
          :key="index"
        >
          <div class="comment-content">{{ item.content }}</div>
          <div class="comment-time">{{ formatTime(item.time) }}</div>
        </div>
      </div>
      <div class="empty-tip" v-else>
        {{ isLoading ? "加载留言中..." : "暂无留言，快来留下第一个祝福吧～" }}
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn-group">
      <button class="btn btn-secondary" @click="$router.push('/')">
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Ref } from "vue";

// 评论数据类型定义
interface CommentItem {
  content: string;
  time: number; // 时间戳
}

// 响应式数据
const commentContent: Ref<string> = ref(""); // 输入的评论内容
const commentList: Ref<CommentItem[]> = ref([]); // 评论列表
const isLoading: Ref<boolean> = ref(false); // 加载状态
const isSubmitting: Ref<boolean> = ref(false); // 提交状态

// 边缘函数代理地址（根据实际部署的边缘函数地址调整）
const EDGE_FUNCTION_URL = "/edge-functions/comment-proxy.js";

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

// 获取评论列表
const fetchComments = async () => {
  try {
    isLoading.value = true;
    const response = await fetch(`${EDGE_FUNCTION_URL}?action=get`);
    if (!response.ok) throw new Error("获取留言失败");

    const res = await response.json();
    if (res.code === 200) {
      // 按时间倒序排列
      commentList.value = (res.data || []).sort(
        (a: CommentItem, b: CommentItem) => b.time - a.time
      );
    } else {
      console.error("获取留言失败:", res.msg);
    }
  } catch (error) {
    console.error("获取留言异常:", error);
    alert("加载留言失败，请稍后再试～");
  } finally {
    isLoading.value = false;
  }
};

// 提交评论
const handleCommentSubmit = async () => {
  const content = commentContent.value.trim();
  if (!content) return;

  try {
    isSubmitting.value = true;
    const commentData: CommentItem = {
      content,
      time: Date.now(),
    };

    // 调用边缘函数提交评论
    const response = await fetch(`${EDGE_FUNCTION_URL}?action=set`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });

    const res = await response.json();
    if (res.code === 200) {
      // 提交成功后清空输入框并重新获取列表
      commentContent.value = "";
      await fetchComments();
      alert("祝福发送成功～");
    } else {
      throw new Error(res.msg || "发送失败");
    }
  } catch (error) {
    console.error("提交评论异常:", error);
    alert("发送祝福失败，请稍后再试～");
  } finally {
    isSubmitting.value = false;
  }
};

// 页面挂载时加载评论列表
onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.content-text {
  text-align: center;
  font-size: 18px;
  line-height: 2;
  margin-bottom: 40px;
  color: #333;
}

/* 评论区样式 */
.comment-section {
  margin: 30px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.comment-title {
  text-align: center;
  margin-bottom: 20px;
  color: #555;
  font-size: 16px;
}

.comment-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.comment-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  height: 80px;
  font-size: 14px;
}

.submit-comment-btn {
  align-self: flex-end;
  padding: 8px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.submit-comment-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.comment-list {
  margin-top: 20px;
  gap: 15px;
  display: flex;
  flex-direction: column;
}

.comment-item {
  padding: 10px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #42b983;
}

.comment-content {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.comment-time {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

/* 按钮组样式 */
.btn-group {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.btn {
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary {
  background: #666;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background: #555;
}
</style>
