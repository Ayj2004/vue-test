// shims-vue.d.ts
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // 匹配 Vue 3 的组件类型
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
