import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { crx } from '@crxjs/vite-plugin'
// 注意：此语法要求 Node.js 版本 >= 17
// import manifest from './manifest.json' assert { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5088,
  },
  plugins: [
    vue(),
    vueJsx(),
    //vueDevTools(),
    crx({
      manifest: {
        manifest_version: 3,
        name: 'My Vue Chrome Extension',
        version: '1.0.0',
        description: 'A Chrome extension built with Vite and Vue',
        action: {
          default_popup: 'index.html',
          default_icon: {
            '16': 'img/star-off-16.png',
            '32': 'img/star-off-32.png',
          },
        },
        host_permissions: ['http://*/*', 'https://*/*'],
        permissions: ['activeTab', 'bookmarks', 'storage', 'favicon'],
        background: {
          service_worker: 'src/background/service-worker.ts',
        },
        content_scripts: [
          {
            js: ['src/content/content.ts'],
            matches: ['<all_urls>'],
          },
        ],
        web_accessible_resources: [
          {
            resources: ['_favicon/*'],
            matches: ['<all_urls>'],
            use_dynamic_url: true,
            extension_ids: ['*'],
          },
        ],
      },
    }),
    AutoImport({
      // 自动引入 vue 的 ref 等 api
      imports: ['vue', 'vue-router', 'pinia'],
      // 生成位置
      dts: './src/types/auto-imports.d.ts',
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      // 生成位置
      dts: './src/types/components.d.ts',
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
