<template>
  <div class="page-container home-page">
    <h1 class="home-title">
      <span>23岁</span>
      <span>要在幸福舒展里</span>
    </h1>
    <h2 class="img-title">你好 23岁</h2>
    <img src="/yuan-dan.jpg" alt="元旦" class="content-img" />
    <button class="btn btn-primary" @click="$router.push('/year22')">
      回顾22岁
    </button>
  </div>
</template>

<script setup lang="ts">
// 首页逻辑
</script>

<style scoped>
/* 首页个性化样式 - 仅新增text-align:center，其余保留 */
.home-title {
  font-family: "楷体", "Microsoft YaHei", sans-serif;
  line-height: 1.8;
  text-align: center; /* 新增：让标题文字居中 */
}
.home-title span {
  display: block;
}
.img-title {
  margin: 0 0 8px 0;
  text-align: center; /* 可选：若需要“你好23岁”也居中，添加这行 */
}
</style>
