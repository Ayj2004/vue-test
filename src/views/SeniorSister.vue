<!-- src/views/SeniorSister.vue -->
<template>
  <div class="sister-container">
    <!-- 返回首页按钮 -->
    <router-link to="/" class="back-btn">← 返回首页</router-link>

    <!-- 页面标题 -->
    <h2 class="page-title">学姐风采</h2>

    <!-- 图片展示区域 -->
    <div class="image-container">
      <img src="/xue-jie.jpg" alt="学姐风采" class="sister-image" />
      <!-- 图片描述 -->
      <p class="image-desc">愿新的一年，万事顺遂，平安喜乐 🎉</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 学姐风采页面逻辑
</script>

<style scoped>
.sister-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  padding: 20px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #e74c3c;
  text-decoration: none;
  font-size: 1rem;
  padding: 8px 15px;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.15);
}

.image-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.sister-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.image-desc {
  margin-top: 20px;
  font-size: 1.2rem;
  color: #34495e;
  font-weight: 500;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  .image-container {
    padding: 15px;
  }
  .image-desc {
    font-size: 1rem;
  }
}
</style>
