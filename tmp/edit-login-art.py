from pathlib import Path
p=Path('index.html');s=p.read_text(encoding='utf8');start=s.index('<div class="login-rule">');end=s.index('</div></div><footer class="login-footer">',start)
icons=['<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M10 18h4"/>','<path d="M6 7h12c3 0 5 10 3 12-2 2-5-3-6-3H9c-1 0-4 5-6 3C1 17 3 7 6 7Z"/><path d="M6 10v5m-2-2h4m8-2h.1m3 3h.1"/>','<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0"/><circle cx="12" cy="20" r="1"/>']
html='<div class="login-card-scene" aria-hidden="true"><div class="login-orbit"></div>'
for cls,label,icon in zip(['mobile','games','internet'],['بطاقات الاتصال','بطاقات الألعاب','باقات الإنترنت'],icons):
 html+=f'<div class="floating-voucher voucher-{cls}"><div class="voucher-top"><span>ماسال</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{icon}</svg></div><div class="voucher-chip"><i></i><i></i><i></i></div><b>{label}</b><div class="voucher-bottom"><span>•••• &nbsp; •••• &nbsp; ••••</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7a7 7 0 0 1 0 10m4-14a12 12 0 0 1 0 18"/></svg></div></div>'
html+='</div><h2 class="login-scene-heading">عالم البطاقات، بين يديك</h2><p class="login-scene-copy">إدارة البطاقات الإلكترونية وشبكة التوزيع</p><div class="login-scene-tags"><span>اتصالات</span><span>ألعاب</span><span>إنترنت</span></div>'
s=s[:start]+html+s[end:];p.write_text(s,encoding='utf8')
p=Path('reference-identity.css');s=p.read_text(encoding='utf8');s+='''
/* Lightweight card illustration: transform-only motion, no external assets. */
.login-welcome{padding:34px 32px;overflow:hidden}
.login-welcome:before{display:none}
.login-card-scene{position:relative;width:100%;max-width:460px;height:320px;flex-shrink:0;margin:12px 0 0;direction:ltr;pointer-events:none}
.login-orbit{position:absolute;width:290px;height:290px;border:1px solid #0798b721;border-radius:50%;top:12px;left:50%;transform:translateX(-50%);background:radial-gradient(circle,#08b8bc18,transparent 68%)}
.login-orbit:after{content:"";position:absolute;inset:28px;border:1px dashed #0798b728;border-radius:50%}
.floating-voucher{position:absolute;left:50%;width:252px;height:158px;padding:17px 21px;border-radius:18px;direction:rtl;color:#fff;border:1px solid #ffffff60;box-shadow:0 16px 30px #123d5729;overflow:hidden;animation:voucher-drift 7s ease-in-out infinite;transform:translate(-50%,0) rotate(var(--tilt));isolation:isolate}
.floating-voucher:before{content:"";position:absolute;width:230px;height:230px;border:1px solid #ffffff25;border-radius:50%;left:-110px;top:-45px;z-index:-1;box-shadow:0 0 0 22px #ffffff08,0 0 0 44px #ffffff06}
.voucher-mobile{--tilt:-12deg;top:25px;margin-left:-47px;background:linear-gradient(125deg,#305bbc,#193868);animation-delay:-2s}
.voucher-games{--tilt:12deg;top:70px;margin-left:60px;background:linear-gradient(125deg,#8a66b8,#514789);animation-delay:-4s}
.voucher-internet{--tilt:-5deg;top:133px;margin-left:-16px;background:linear-gradient(125deg,#00a7b1,#086777);z-index:2}
.voucher-top{display:flex;align-items:center;justify-content:space-between;font-size:16px;font-weight:800}.voucher-top svg{width:27px;height:27px}
.voucher-chip{display:flex;gap:2px;width:30px;height:23px;border:1px solid #fff6;border-radius:5px;margin:9px 0 5px;background:#fff2;overflow:hidden}.voucher-chip i{flex:1;border-inline-end:1px solid #fff5}
.floating-voucher b{font-size:15px;font-weight:700}.voucher-bottom{display:flex;align-items:center;justify-content:space-between;font:12px monospace;letter-spacing:2px;margin-top:7px;color:#e9ffff}.voucher-bottom svg{width:20px;height:20px}
.login-welcome .login-scene-heading{font-size:24px;margin:8px 0 0}.login-welcome .login-scene-copy{font-size:13px;margin:7px 0 18px;color:var(--muted)}
.login-scene-tags{display:flex;gap:12px;align-items:center;color:var(--muted);font-size:11px}.login-scene-tags span+span:before{content:"•";margin-inline-end:12px;color:#069ab0}
@keyframes voucher-drift{0%,100%{transform:translate(-50%,0) rotate(var(--tilt))}50%{transform:translate(-50%,-10px) rotate(calc(var(--tilt) + 2deg))}}
@media(max-width:760px){.login-welcome{padding:22px 20px 12px}.login-card-scene{height:185px;max-width:310px;margin-top:5px}.floating-voucher{width:180px;height:112px;border-radius:13px;padding:10px 13px}.voucher-mobile{top:14px;margin-left:-35px}.voucher-games{top:39px;margin-left:40px}.voucher-internet{top:72px;margin-left:-8px}.voucher-top{font-size:12px}.voucher-top svg{width:20px;height:20px}.voucher-chip{width:23px;height:15px;margin:5px 0 3px}.floating-voucher b{font-size:11px}.voucher-bottom{font-size:9px;margin-top:3px}.voucher-bottom svg{width:14px;height:14px}.login-orbit{width:175px;height:175px;top:0}.login-scene-tags{display:none}.login-form-panel{padding:20px 26px 28px}.login-page{padding-top:65px}.login-card{min-height:0}}
@media(prefers-reduced-motion:reduce){.floating-voucher{animation:none}}
''';p.write_text(s,encoding='utf8')
