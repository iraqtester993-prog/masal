import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw Error('قاعدة البيانات غير متاحة');return env.DB;}
