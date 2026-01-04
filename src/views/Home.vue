<!-- src/views/Home.vue -->
<template>
  <div class="home-container">
    <!-- 页面标题 -->
    <h1 class="main-title">元旦快乐 🎊</h1>

    <!-- 元旦图片展示 -->
    <div class="image-wrapper">
      <img src="/yuan-dan.jpg" alt="元旦快乐" class="yuan-dan-image" />
    </div>

    <!-- 跳转按钮区域 -->
    <div class="btn-group">
      <router-link to="/senior-sister" class="action-btn">
        查看学姐风采
      </router-link>
      <router-link to="/about" class="action-btn secondary-btn">
        关于本项目
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页逻辑
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  text-align: center;
}

.main-title {
  font-size: 3rem;
  color: white;
  margin-bottom: 30px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.image-wrapper {
  max-width: 800px;
  width: 100%;
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.yuan-dan-image {
  width: 100%;
  height: auto;
  display: block;
}

.btn-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  padding: 12px 30px;
  font-size: 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  background-color: #e63946;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  background-color: #d62828;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.secondary-btn {
  background-color: #457b9d;
}

.secondary-btn:hover {
  background-color: #1d3557;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }
  .action-btn {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>
