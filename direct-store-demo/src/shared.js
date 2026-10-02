import {ref} from 'vue'
import './theme.css'
export const base = import.meta.env.BASE_URL
export function useTheme(surface) {
 const key='dananeer-theme-'+surface
 let saved;try{saved=localStorage.getItem(key)}catch{}
 const theme=ref(saved==='dark'||saved==='light'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))
 const apply=()=>{document.documentElement.dataset.theme=theme.value;document.documentElement.style.colorScheme=theme.value;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme.value==='dark'?'#000000':'#f5f5f7')}
 apply()
 const toggleTheme=()=>{theme.value=theme.value==='dark'?'light':'dark';apply();try{localStorage.setItem(key,theme.value)}catch{}}
 return {theme,toggleTheme}
}
export const money = value => new Intl.NumberFormat('en-US').format(Number(value) || 0)
export const date = value => new Date(value).toLocaleString('ar-IQ-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Baghdad' })
export const currency = value => ({IQD:'د.ع',USD:'$',EUR:'€'}[value]||'د.ع')
export async function uploadImage(file) {
 if(!file) return ''
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2000000) throw new Error('اختر صورة PNG أو JPG أو WebP بحجم لا يتجاوز 2 MB')
 const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('تعذر قراءة الصورة'));reader.readAsDataURL(file)})
 return (await api('image-upload',{image})).image
}
export async function api(action, body, customer) {
  const response = await fetch(base+'api/index.php?action=' + encodeURIComponent(action), { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(customer ? { 'X-Demo-Customer': customer } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  let result; try { result = await response.json() } catch { throw new Error('تعذر الاتصال بالخادم. حاول مرة أخرى.') }
  if (!response.ok) throw new Error(result.error || 'تعذر إكمال العملية')
  return result
}
export const Icon = { props: ['name', 'size'], template: `<svg :width="size||22" :height="size||22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name]||paths.card"/></svg>`, data: () => ({ paths: {
  support:'M4 13v-1a8 8 0 0 1 16 0v1M4 12H2v7h4v-7ZM20 12h2v7h-4v-7M20 19c0 3-4 3-8 3', moon:'M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2', sun:'M12 3V1M12 23v-2M3 12H1M23 12h-2M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0', home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z', grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  bag:'M5 7h14l2 14H3ZM8 7V6a4 4 0 0 1 8 0v1', user:'M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0', search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  arrow:'M19 12H5m6-6-6 6 6 6', chevron:'m14 6-6 6 6 6', close:'m6 6 12 12M6 18 18 6', check:'m5 12 4 4L19 6', plus:'M12 5v14M5 12h14',
  card:'M3 5h18v14H3zM3 10h18M7 15h4', bolt:'m13 2-9 12h7l-1 8 10-13h-7z', shield:'m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6ZM8 12l3 3 5-6',
  copy:'M9 9h12v12H9zM5 15H3V3h12v2', phone:'M8 2h8v20H8zM11 18h2', bell:'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5ZM10 21h4', download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  chart:'M4 3v18h17M8 17v-5M13 17V8M18 17V5', box:'m12 3 9 5v9l-9 5-9-5V8ZM3 8l9 5 9-5M12 13v9M7 5l10 6', upload:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z', logout:'M9 3H3v18h6M9 12h12m-5-5 5 5-5 5',
  edit:'m15 4 5 5M3 21l2-7L16 3l5 5-11 11ZM3 21l7-2', eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0', lock:'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4', refresh:'M20 7V3l-4 4M20 7a9 9 0 1 0 1 8'
} }) }
