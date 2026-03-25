import { createApp } from 'vue' // นำเข้าฟังก์ชัน createApp จาก Vue
import App from './App.vue' // นำเข้า component หลัก
import 'bootstrap/dist/css/bootstrap.min.css' // นำเข้า CSS ของ Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // นำเข้า JS ของ Bootstrap

createApp(App).mount('#app') // สร้างแอป Vue แล้วแปะลงที่ <div id="app"> ใน index.html
//createApp(App) → สร้างแอป Vue โดยใช้ App.vue เป็นตัวหลัก 
//.mount('#app') → นำแอปไปแสดงผลที่ <div id="app"> ใน index.html