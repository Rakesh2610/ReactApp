// vite.config.ts
import path from "path";
import { defineConfig } from "file:///N:/MajorProjects/ReactApp/node_modules/vite/dist/node/index.js";
import react from "file:///N:/MajorProjects/ReactApp/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { tempo } from "file:///N:/MajorProjects/ReactApp/node_modules/tempo-devtools/dist/vite/index.js";
var __vite_injected_original_dirname = "N:\\MajorProjects\\ReactApp";
var conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}
var vite_config_default = defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"]
  },
  plugins: [
    react({
      plugins: conditionalPlugins
    }),
    tempo()
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    // @ts-ignore
    allowedHosts: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJOOlxcXFxNYWpvclByb2plY3RzXFxcXFJlYWN0QXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJOOlxcXFxNYWpvclByb2plY3RzXFxcXFJlYWN0QXBwXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9OOi9NYWpvclByb2plY3RzL1JlYWN0QXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHsgdGVtcG8gfSBmcm9tIFwidGVtcG8tZGV2dG9vbHMvZGlzdC92aXRlXCI7XHJcblxyXG5jb25zdCBjb25kaXRpb25hbFBsdWdpbnM6IFtzdHJpbmcsIFJlY29yZDxzdHJpbmcsIGFueT5dW10gPSBbXTtcclxuXHJcbi8vIEB0cy1pZ25vcmVcclxuaWYgKHByb2Nlc3MuZW52LlRFTVBPID09PSBcInRydWVcIikge1xyXG4gIGNvbmRpdGlvbmFsUGx1Z2lucy5wdXNoKFtcInRlbXBvLWRldnRvb2xzL3N3Y1wiLCB7fV0pO1xyXG59XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGJhc2U6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcImRldmVsb3BtZW50XCIgPyBcIi9cIiA6IHByb2Nlc3MuZW52LlZJVEVfQkFTRV9QQVRIIHx8IFwiL1wiLFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZW50cmllczogW1wic3JjL21haW4udHN4XCIsIFwic3JjL3RlbXBvYm9vay8qKi8qXCJdLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3Qoe1xyXG4gICAgICBwbHVnaW5zOiBjb25kaXRpb25hbFBsdWdpbnMsXHJcbiAgICB9KSxcclxuICAgIHRlbXBvKCksXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBwcmVzZXJ2ZVN5bWxpbmtzOiB0cnVlLFxyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBhbGxvd2VkSG9zdHM6IHRydWUsXHJcbiAgfVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtUSxPQUFPLFVBQVU7QUFDcFIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsYUFBYTtBQUh0QixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLHFCQUFzRCxDQUFDO0FBRzdELElBQUksUUFBUSxJQUFJLFVBQVUsUUFBUTtBQUNoQyxxQkFBbUIsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztBQUNwRDtBQUdBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU0sUUFBUSxJQUFJLGFBQWEsZ0JBQWdCLE1BQU0sUUFBUSxJQUFJLGtCQUFrQjtBQUFBLEVBQ25GLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxnQkFBZ0Isb0JBQW9CO0FBQUEsRUFDaEQ7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxrQkFBa0I7QUFBQSxJQUNsQixPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVOLGNBQWM7QUFBQSxFQUNoQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
