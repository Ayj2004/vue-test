<!-- src/views/About.vue -->
<template>
  <div class="about-container">
    <!-- 返回按钮 -->
    <router-link to="/" class="back-btn">← 返回首页</router-link>

    <h2 class="page-title">关于本项目</h2>

    <!-- 项目介绍卡片 -->
    <div class="about-card">
      <h3 class="card-title">项目背景</h3>
      <p class="card-content">
        本项目是基于 Vue 3 + TypeScript + Vite
        构建的前端展示项目，以元旦快乐为主题，
        结合了页面跳转、图片展示等基础前端功能，旨在打造美观、易用的静态展示页面。
      </p>

      <h3 class="card-title mt-20">技术栈</h3>
      <p class="card-content">
        • 框架：Vue 3 (Script Setup 语法)<br />
        • 语言：TypeScript<br />
        • 构建工具：Vite<br />
        • 路由：Vue Router 4<br />
        • 样式：原生 CSS (弹性布局、渐变、响应式适配)
      </p>

      <h3 class="card-title mt-20">功能说明</h3>
      <p class="card-content">
        1. 首页：元旦主题展示，包含图片和跳转按钮；<br />
        2. 学姐风采页：展示专属图片，支持返回首页；<br />
        3. 关于页：详细介绍项目背景、技术栈和功能。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 关于页面逻辑
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #457b9d;
  text-decoration: none;
  font-size: 1rem;
  padding: 8px 15px;
  border: 1px solid #457b9d;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #457b9d;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  color: #1d3557;
  margin-bottom: 30px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.about-card {
  max-width: 800px;
  width: 100%;
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  line-height: 1.8;
}

.card-title {
  color: #e63946;
  font-size: 1.5rem;
  margin-bottom: 10px;
  border-bottom: 2px solid #f1faee;
  padding-bottom: 5px;
}

.card-content {
  color: #333;
  font-size: 1.1rem;
}

.mt-20 {
  margin-top: 20px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  .about-card {
    padding: 20px;
  }
  .card-content {
    font-size: 1rem;
  }
}
</style>
