import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'node:path'
export default defineConfig({base:'/direct-store-demo/',build:{emptyOutDir:true,rollupOptions:{input:{store:resolve('index.html'),dashboard:resolve('dashboard/index.html')}}},plugins:[VitePWA({registerType:'autoUpdate',manifest:{id:'/direct-store-demo/',name:'دنارير',short_name:'دنارير',lang:'ar',dir:'rtl',start_url:'/direct-store-demo/',scope:'/direct-store-demo/',display:'standalone',theme_color:'#f5f5f7',background_color:'#f5f5f7',icons:[{src:'/direct-store-demo/icon-recharge-192.png',sizes:'192x192',type:'image/png'},{src:'/direct-store-demo/icon-recharge-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]},workbox:{globPatterns:['**/*.{js,css,html,png,ttf}'],globIgnores:['dashboard/**','**/dashboard-*.js'],navigateFallbackDenylist:[/^\/direct-store-demo\/dashboard(?:\/|$)/,/^\/direct-store-demo\/api(?:\/|$)/],cleanupOutdatedCaches:true}})]})



