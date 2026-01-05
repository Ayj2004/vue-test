<template>
  <div class="page-container year22-page">
    <div class="content-text">
      •
      22岁的这一年就像在坐过山车，起起伏伏，一波三折又三折。如果结果是好的，那五折也没关系。
    </div>
    <div class="btn-group">
      <button class="btn btn-secondary" @click="$router.push('/')">
        返回首页
      </button>
      <button class="btn btn-primary" @click="$router.push('/month1')">
        进入回忆之旅
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 22岁总结页逻辑
</script>

<style scoped>
/* 22岁页面个性化样式 */
.content-text {
  font-size: 1.2rem;
  padding: 30px;
}
</style>
