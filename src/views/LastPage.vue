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
          @keydown.enter.exact.prevent
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
      <div class="comment-list" v-if="!isLoading">
        <div
          class="comment-item"
          v-for="(item, index) in commentList"
          :key="item.time"
        >
          <div class="comment-content">{{ item.content }}</div>
          <div class="comment-time">{{ formatTime(item.time) }}</div>
          <button
            class="delete-comment-btn"
            @click="handleDeleteComment(index)"
            :disabled="isDeleting"
          >
            {{ isDeleting ? "删除中..." : "删除" }}
          </button>
        </div>
        <div class="empty-tip" v-if="commentList.length === 0">
          暂无留言，快来留下第一个祝福吧～
        </div>
      </div>
      <div class="empty-tip" v-if="isLoading">加载留言中...</div>
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
const commentContent: Ref<string> = ref("");
const commentList: Ref<CommentItem[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);
const isSubmitting: Ref<boolean> = ref(false);
const isDeleting: Ref<boolean> = ref(false);

// 边缘函数配置（与控制台一致）
const EDGE_FUNCTION_URL = "https://vue-test.4fa2a2a9.er.aliyun-esa.net";
const COMMENT_KV_KEY = "page_comments";

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

// 🔥 重构：读取KV数据（适配JSON响应）
const getKVData = async (): Promise<CommentItem[]> => {
  try {
    const requestUrl = new URL(EDGE_FUNCTION_URL);
    requestUrl.searchParams.set("action", "get");
    requestUrl.searchParams.set("key", COMMENT_KV_KEY);

    const response = await fetch(requestUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    const res = await response.json(); // 直接解析JSON响应
    if (res.code !== 200) throw new Error(res.msg);
    return res.data as CommentItem[]; // 边缘函数已返回数组，无需额外处理
  } catch (error: any) {
    console.error("读取KV数据失败:", error.message);
    return [];
  }
};

// 获取评论列表
const fetchComments = async () => {
  try {
    isLoading.value = true;
    const comments = await getKVData();
    commentList.value = comments.sort((a, b) => b.time - a.time);
  } catch (error: any) {
    console.error("获取留言异常:", error.message);
    alert(`加载留言失败：${error.message}，请稍后再试～`);
    commentList.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 🔥 重构：提交评论（改用POST传递JSON，避免URL参数问题）
const handleCommentSubmit = async () => {
  const content = commentContent.value.trim();
  if (!content) return;

  try {
    isSubmitting.value = true;
    // 1. 构造新评论
    const newComment: CommentItem = { content, time: Date.now() };
    // 2. 读取现有评论
    const currentComments = await getKVData();
    // 3. 追加并限制数量
    const newComments = [...currentComments, newComment].slice(-100); // 取最后100条
    const commentStr = JSON.stringify(newComments);

    // 4. 调用边缘函数写入（改用POST，JSON传参）
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        action: "set",
        key: COMMENT_KV_KEY,
        value: commentStr,
      }),
    });

    const res = await response.json();
    if (res.code !== 200) throw new Error(res.msg);

    // 5. 重置并刷新列表
    commentContent.value = "";
    await fetchComments();
    alert("祝福发送成功～");
  } catch (error: any) {
    console.error("提交评论异常:", error.message);
    alert(`发送祝福失败：${error.message}，请稍后再试～`);
  } finally {
    isSubmitting.value = false;
  }
};

// 🔥 重构：删除评论（适配新的KV API）
const handleDeleteComment = async (index: number) => {
  if (!confirm("确定要删除这条留言吗？")) return;
  const targetComment = commentList.value[index];
  if (!targetComment) return;

  try {
    isDeleting.value = true;
    // 1. 读取现有评论
    const currentComments = await getKVData();
    // 2. 过滤要删除的评论
    const newComments = currentComments.filter(
      (item) => item.time !== targetComment.time
    );
    const commentStr = JSON.stringify(newComments);

    // 3. 写入新列表
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        action: "set",
        key: COMMENT_KV_KEY,
        value: commentStr,
      }),
    });

    const res = await response.json();
    if (res.code !== 200) throw new Error(res.msg);

    // 4. 刷新列表
    await fetchComments();
    alert("留言删除成功～");
  } catch (error: any) {
    console.error("删除评论异常:", error.message);
    alert(`删除留言失败：${error.message}，请稍后再试～`);
  } finally {
    isDeleting.value = false;
  }
};

// 页面挂载时加载评论
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
  position: relative;
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
  margin-bottom: 8px;
}

.delete-comment-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  font-size: 12px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

.delete-comment-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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
