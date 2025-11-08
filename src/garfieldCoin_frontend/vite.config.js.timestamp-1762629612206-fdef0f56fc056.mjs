// vite.config.js
import { defineConfig } from "file:///home/nino/garfieldCoin/node_modules/vite/dist/node/index.js";
import { fileURLToPath, URL } from "url";
import environment from "file:///home/nino/garfieldCoin/node_modules/vite-plugin-environment/dist/index.js";
import dotenv from "file:///home/nino/garfieldCoin/node_modules/dotenv/lib/main.js";
var __vite_injected_original_import_meta_url = "file:///home/nino/garfieldCoin/src/garfieldCoin_frontend/vite.config.js";
dotenv.config({ path: "../../.env" });
var vite_config_default = defineConfig({
  base: "./",
  build: {
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", __vite_injected_original_import_meta_url)),
        landing: fileURLToPath(new URL("./landing.html", __vite_injected_original_import_meta_url)),
        garfieldGame: fileURLToPath(new URL("./garfieldGame.html", __vite_injected_original_import_meta_url))
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true
      }
    },
    host: "127.0.0.1"
    // Consider adding this
  },
  publicDir: "assets",
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" })
  ],
  define: {
    "process.env": process.env
  },
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", __vite_injected_original_import_meta_url)
        )
      }
    ],
    dedupe: ["@dfinity/agent"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9uaW5vL2dhcmZpZWxkQ29pbi9zcmMvZ2FyZmllbGRDb2luX2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9uaW5vL2dhcmZpZWxkQ29pbi9zcmMvZ2FyZmllbGRDb2luX2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL25pbm8vZ2FyZmllbGRDb2luL3NyYy9nYXJmaWVsZENvaW5fZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgZW52aXJvbm1lbnQgZnJvbSAndml0ZS1wbHVnaW4tZW52aXJvbm1lbnQnO1xuaW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnO1xuXG5kb3RlbnYuY29uZmlnKHsgcGF0aDogJy4uLy4uLy5lbnYnIH0pO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnLi8nLFxuICBidWlsZDoge1xuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgcm9sbHVwT3B0aW9uczogeyBcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIG1haW46IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9pbmRleC5odG1sJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgIGxhbmRpbmc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9sYW5kaW5nLmh0bWwnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICAgZ2FyZmllbGRHYW1lOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vZ2FyZmllbGRHYW1lLmh0bWwnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBkZWZpbmU6IHtcbiAgICAgICAgZ2xvYmFsOiBcImdsb2JhbFRoaXNcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcHJveHk6IHtcbiAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vMTI3LjAuMC4xOjQ5NDNcIixcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGhvc3Q6ICcxMjcuMC4wLjEnLCAgLy8gQ29uc2lkZXIgYWRkaW5nIHRoaXNcbiAgfSxcbiAgcHVibGljRGlyOiBcImFzc2V0c1wiLFxuICBwbHVnaW5zOiBbXG4gICAgZW52aXJvbm1lbnQoXCJhbGxcIiwgeyBwcmVmaXg6IFwiQ0FOSVNURVJfXCIgfSksXG4gICAgZW52aXJvbm1lbnQoXCJhbGxcIiwgeyBwcmVmaXg6IFwiREZYX1wiIH0pLFxuICBdLFxuICBkZWZpbmU6IHtcbiAgICAncHJvY2Vzcy5lbnYnOiBwcm9jZXNzLmVudlxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmluZDogXCJkZWNsYXJhdGlvbnNcIixcbiAgICAgICAgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgoXG4gICAgICAgICAgbmV3IFVSTChcIi4uL2RlY2xhcmF0aW9uc1wiLCBpbXBvcnQubWV0YS51cmwpXG4gICAgICAgICksXG4gICAgICB9LFxuICAgIF0sXG4gICAgZGVkdXBlOiBbJ0BkZmluaXR5L2FnZW50J10sXG4gIH0sXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXFVLFNBQVMsb0JBQW9CO0FBQ2xXLFNBQVMsZUFBZSxXQUFXO0FBQ25DLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sWUFBWTtBQUh1TCxJQUFNLDJDQUEyQztBQUszUCxPQUFPLE9BQU8sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVwQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsSUFDTCxhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxNQUFNLGNBQWMsSUFBSSxJQUFJLGdCQUFnQix3Q0FBZSxDQUFDO0FBQUEsUUFDNUQsU0FBUyxjQUFjLElBQUksSUFBSSxrQkFBa0Isd0NBQWUsQ0FBQztBQUFBLFFBQ2pFLGNBQWMsY0FBYyxJQUFJLElBQUksdUJBQXVCLHdDQUFlLENBQUM7QUFBQSxNQUM3RTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFdBQVc7QUFBQSxFQUNYLFNBQVM7QUFBQSxJQUNQLFlBQVksT0FBTyxFQUFFLFFBQVEsWUFBWSxDQUFDO0FBQUEsSUFDMUMsWUFBWSxPQUFPLEVBQUUsUUFBUSxPQUFPLENBQUM7QUFBQSxFQUN2QztBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sZUFBZSxRQUFRO0FBQUEsRUFDekI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhO0FBQUEsVUFDWCxJQUFJLElBQUksbUJBQW1CLHdDQUFlO0FBQUEsUUFDNUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUSxDQUFDLGdCQUFnQjtBQUFBLEVBQzNCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
