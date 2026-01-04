// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
// 检查组件导入路径是否正确（和你的文件目录匹配）
import Home from "../views/Home.vue";
import SeniorSister from "../views/SeniorSister.vue"; // 学姐风采页
import About from "../views/About.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/", // 根路径指向首页
    name: "Home",
    component: Home,
  },
  {
    path: "/senior-sister",
    name: "SeniorSister",
    component: SeniorSister,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  // 404 兜底（可选，防止路径错误）
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
