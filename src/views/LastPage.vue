<template>
  <div class="page-container last-page">
    <div class="content-text">
      <span>新的一岁</span>
      <span>希望淡淡的，顺顺的</span>
      <span>走在雪中，就算迷路，我也愿意</span>
    </div>
    <!-- 移除图片标签 -->
    <div class="btn-group">
      <button class="btn btn-secondary" @click="$router.push('/')">
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 最后一页逻辑
</script>

<style scoped>
.content-text {
  text-align: center; /* 文字居中 */
}
.content-text span {
  display: block; /* 文字分行 */
  /* 可选：添加行间距优化视觉 */
  /* line-height: 1.8; */
}
</style>
