<template>
  <div class="page-container last-page">
    <div class="content-text">
      <span>新的一岁</span>
      <span>希望淡淡的，顺顺的</span>
      <span>走在雪中，就算迷路，我也愿意</span>
    </div>

    <!-- 评论区模块 -->
    <div class="comment-section">
      <h3 class="comment-title">留言区</h3>

      <!-- 评论输入框 -->
      <div class="comment-input-wrap">
        <textarea
          v-model="commentContent"
          placeholder="写下你的祝福吧..."
          class="comment-input"
          maxlength="200"
        ></textarea>
        <button @click="submitComment" class="submit-btn">提交</button>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <div
          v-for="(item, index) in commentList"
          :key="index"
          class="comment-item"
        >
          <div class="comment-content">{{ item.content }}</div>
          <div class="comment-time">{{ formatTime(item.time) }}</div>
        </div>
      </div>

      <!-- 加载/错误提示 -->
      <div v-if="loading" class="comment-loading">加载中...</div>
      <div v-if="error" class="comment-error">{{ error }}</div>
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

// 评论相关状态
const commentContent = ref(""); // 输入的评论内容
const commentList = ref<Array<{ content: string; time: number }>>([]); // 评论列表
const loading = ref(false); // 加载状态
const error = ref(""); // 错误提示

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

// 获取评论列表
const getComments = async () => {
  loading.value = true;
  error.value = "";
  try {
    // 调用边缘函数接口获取评论
    const res = await fetch(
      "/edge-functions/comment-proxy?action=getComments",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error("获取评论失败");
    const data = await res.json();
    commentList.value = data.comments || [];
  } catch (err) {
    error.value = (err as Error).message || "获取评论出错";
    console.error("获取评论失败:", err);
  } finally {
    loading.value = false;
  }
};

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    error.value = "请输入评论内容";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    // 调用边缘函数接口提交评论
    const res = await fetch(
      "/edge-functions/comment-proxy?action=submitComment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentContent.value.trim(),
          time: Date.now(),
        }),
      }
    );
    if (!res.ok) throw new Error("提交评论失败");
    // 提交成功后清空输入框并重新获取评论列表
    commentContent.value = "";
    await getComments();
  } catch (err) {
    error.value = (err as Error).message || "提交评论出错";
    console.error("提交评论失败:", err);
  } finally {
    loading.value = false;
  }
};

// 页面挂载时加载评论
onMounted(() => {
  getComments();
});
</script>

<style scoped>
.content-text {
  text-align: center;
  margin-bottom: 40px;
}
.content-text span {
  display: block;
  line-height: 1.8;
  font-size: 18px;
  color: #333;
}

/* 评论区样式 */
.comment-section {
  width: 80%;
  margin: 0 auto 40px;
  max-width: 600px;
}
.comment-title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 20px;
  color: #555;
}
.comment-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}
.comment-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 80px;
  resize: vertical;
  font-size: 14px;
}
.submit-btn {
  align-self: flex-end;
  padding: 8px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.submit-btn:hover {
  background: #359469;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.comment-item {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}
.comment-content {
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
}
.comment-time {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.comment-loading,
.comment-error {
  text-align: center;
  padding: 10px;
  color: #666;
}
.comment-error {
  color: #e53935;
}

.btn-group {
  text-align: center;
  margin-top: 20px;
}
.btn {
  padding: 10px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.btn-secondary {
  background: #999;
  color: white;
}
.btn-secondary:hover {
  background: #777;
}
</style>
