<template>
  <div class="page-container home-page">
    <h1 class="home-title">23岁 希望活在幸福舒展里</h1>
    <img src="/yuan-dan.jpg" alt="元旦" class="content-img" />
    <button class="btn btn-primary" @click="$router.push('/year22')">
      进入回忆
    </button>
  </div>
</template>

<script setup lang="ts">
// 首页逻辑
</script>

<style scoped>
/* 首页个性化样式 */
.home-title {
  font-family: "楷体", "Microsoft YaHei", sans-serif;
}
</style>
