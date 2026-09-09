import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'ماسال | مركز إدارة البطاقات الإلكترونية', description: 'لوحة تحكم ماسال للوكلاء ومخزون البطاقات والمحافظ ونقاط البيع' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ar" dir="rtl"><body>{children}</body></html>}
