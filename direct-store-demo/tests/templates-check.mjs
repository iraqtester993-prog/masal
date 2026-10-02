import {readFile} from 'node:fs/promises'
import {compile} from 'vue/dist/vue.esm-bundler.js'
for(const path of ['src/main.js','src/dashboard.js']){
 const source=await readFile(path,'utf8'),start=source.indexOf('},template:')+'},template:'.length,end=source.lastIndexOf("}).mount('#app')")
 const template=Function('return '+source.slice(start,end))()
 compile(template)
 console.log('PASS: runtime template '+path)
}
const cardSource=await readFile('src/ProductCard.js','utf8')
const cardTemplate=cardSource.slice(cardSource.indexOf('template:`')+10,cardSource.lastIndexOf('`'))
compile(cardTemplate)
console.log('PASS: compact product card template')
