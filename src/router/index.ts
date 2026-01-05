import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Year22 from "../views/Year22.vue";
import Month1 from "../views/Month1.vue";
import Month2 from "../views/Month2.vue";
import Month3 from "../views/Month3.vue";
import Month4 from "../views/Month4.vue";
import Month5 from "../views/Month5.vue";
import Month6 from "../views/Month6.vue";
import Month7 from "../views/Month7.vue";
import Month8 from "../views/Month8.vue";
import Month9 from "../views/Month9.vue";
import Month10 from "../views/Month10.vue";
import LastPage from "../views/LastPage.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", name: "Home", component: Home },
  { path: "/year22", name: "Year22", component: Year22 },
  { path: "/month1", name: "Month1", component: Month1 },
  { path: "/month2", name: "Month2", component: Month2 },
  { path: "/month3", name: "Month3", component: Month3 },
  { path: "/month4", name: "Month4", component: Month4 },
  { path: "/month5", name: "Month5", component: Month5 },
  { path: "/month6", name: "Month6", component: Month6 },
  { path: "/month7", name: "Month7", component: Month7 },
  { path: "/month8", name: "Month8", component: Month8 },
  { path: "/month9", name: "Month9", component: Month9 },
  { path: "/month10", name: "Month10", component: Month10 },
  { path: "/last", name: "LastPage", component: LastPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
