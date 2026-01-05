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

// 🔥 关键修改：适配新的边缘函数配置
const EDGE_FUNCTION_URL = "https://vue-test.4fa2a2a9.er.aliyun-esa.net";
const COMMENT_KV_KEY = "page_comments"; // 与边缘函数默认Key保持一致
const NAMESPACE = "test-msy"; // 边缘函数中定义的KV命名空间

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

// 🔥 优化：适配新边缘函数的KV读取方法（返回格式更简洁）
const getKVData = async (): Promise<CommentItem[]> => {
  try {
    const requestUrl = new URL(EDGE_FUNCTION_URL);
    requestUrl.searchParams.set("action", "get");
    requestUrl.searchParams.set("testKey", COMMENT_KV_KEY);

    const response = await fetch(requestUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`);
    }

    const resText = await response.text();
    // 🔥 适配新边缘函数返回格式：提取Value部分
    const valueMatch = resText.match(/Value: (.*)$/);
    if (valueMatch && valueMatch[1]) {
      // 处理空值情况
      if (valueMatch[1] === "不存在") return [];
      try {
        const parsedData = JSON.parse(valueMatch[1]);
        return Array.isArray(parsedData) ? parsedData : [];
      } catch (e) {
        // 如果解析失败，直接匹配JSON数组
        const jsonMatch = resText.match(/(\[.*\])/);
        return jsonMatch ? JSON.parse(jsonMatch[1]) : [];
      }
    }
    // 新边缘函数返回格式简化：直接提取纯JSON
    if (resText.includes("✅ KV读取成功")) {
      const jsonPart = resText.split("Value: ")[1];
      if (jsonPart) {
        const parsed = JSON.parse(jsonPart);
        return Array.isArray(parsed) ? parsed : [];
      }
    }
    return [];
  } catch (error) {
    console.error("读取KV数据失败:", error);
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

// 提交评论
const handleCommentSubmit = async () => {
  const content = commentContent.value.trim();
  if (!content) return;

  try {
    isSubmitting.value = true;
    // 1. 构造新评论数据
    const newComment: CommentItem = {
      content,
      time: Date.now(),
    };

    // 2. 先读取现有评论列表
    const currentComments = await getKVData();

    // 3. 追加新评论并限制数量（最多100条）
    const newComments = [...currentComments, newComment];
    if (newComments.length > 100) {
      newComments.shift(); // 删除最早的评论
    }
    const commentStr = JSON.stringify(newComments);

    // 4. 调用新边缘函数写入KV（适配valueType=string）
    const setUrl = new URL(EDGE_FUNCTION_URL);
    setUrl.searchParams.set("action", "set");
    setUrl.searchParams.set("testKey", COMMENT_KV_KEY);
    setUrl.searchParams.set("testValue", commentStr);
    setUrl.searchParams.set("valueType", "string"); // 明确指定字符串类型

    const response = await fetch(setUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const resText = await response.text();
    if (resText.includes("✅ KV写入成功")) {
      commentContent.value = "";
      await fetchComments();
      alert("祝福发送成功～");
    } else {
      throw new Error(resText);
    }
  } catch (error: any) {
    console.error("提交评论异常:", error.message);
    alert(`发送祝福失败：${error.message}，请稍后再试～`);
  } finally {
    isSubmitting.value = false;
  }
};

// 删除评论
const handleDeleteComment = async (index: number) => {
  if (!confirm("确定要删除这条留言吗？")) return;
  const targetComment = commentList.value[index];
  if (!targetComment) return;

  try {
    isDeleting.value = true;
    // 1. 读取现有评论列表
    const currentComments = await getKVData();

    // 2. 过滤掉要删除的评论
    const newComments = currentComments.filter(
      (item) => item.time !== targetComment.time
    );
    const commentStr = JSON.stringify(newComments);

    // 3. 写入过滤后的新评论列表
    const setUrl = new URL(EDGE_FUNCTION_URL);
    setUrl.searchParams.set("action", "set");
    setUrl.searchParams.set("testKey", COMMENT_KV_KEY);
    setUrl.searchParams.set("testValue", commentStr);
    setUrl.searchParams.set("valueType", "string");

    const setResponse = await fetch(setUrl.toString());
    if (!setResponse.ok) {
      const errText = await setResponse.text();
      throw new Error(`更新评论列表失败：${errText}`);
    }

    // 4. 重新加载评论列表
    await fetchComments();
    alert("留言删除成功～");
  } catch (error: any) {
    console.error("删除评论异常:", error.message);
    alert(`删除留言失败：${error.message}，请稍后再试～`);
  } finally {
    isDeleting.value = false;
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
