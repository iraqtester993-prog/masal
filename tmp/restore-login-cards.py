from pathlib import Path
import re
p=Path('index.html');s=p.read_text(encoding='utf8');old=Path('tmp/login-option-one-index.html').read_text(encoding='utf8');a=s.index('<div class="login-card-scene"') if '<div class="login-card-scene"' in s else s.index('<div class="login-card-scene ');b=s.index('<h2 class="login-scene-heading">',a);oa=old.index('<div class="login-card-scene"');ob=old.index('<h2 class="login-scene-heading">',oa);scene=old[oa:ob];badges=re.findall(r'<div class="premium-service service-[^\"]+">.*?</div>',s[a:b]);assert len(badges)==3;scene=scene[:-6]+''.join(badges)+'</div>';s=s[:a]+scene+s[b:];s=s.replace('class="login-welcome login-premium"','class="login-welcome"',1).replace('شبكتك أقرب. إدارتك أبسط.','عالم البطاقات، بين يديك',1);p.write_text(s,encoding='utf8')
p=Path('reference-identity.css');s=p.read_text(encoding='utf8');marker='/* Login concept two: an illuminated card on a quiet midnight surface. */';assert marker in s;s=s[:s.index(marker)];s+='''
/* Service badges around the original three-card illustration. */
.login-card-scene .premium-service{position:absolute;z-index:3;display:flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid #a6dce3;border-radius:12px;background:#ffffffed;color:#17566b;font-size:11px;box-shadow:0 5px 15px #123d5712;animation:service-drift 7s ease-in-out infinite}
.premium-service svg{width:21px;height:21px;color:#079bae}
.login-card-scene .service-phone{top:6px;right:18px}.login-card-scene .service-net{left:0;top:112px;animation-delay:-4s}.login-card-scene .service-games{bottom:3px;right:15px;animation-delay:-2s}
:root[data-theme=dark] .login-card-scene .premium-service{background:#1a3545f5;border-color:#365d6e;color:#e0f2f6}:root[data-theme=dark] .premium-service svg{color:#78dcd9}
@keyframes service-drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@media(max-width:760px){.login-card-scene .premium-service{padding:5px 7px;font-size:9px;gap:4px;border-radius:9px}.premium-service svg{width:16px;height:16px}.login-card-scene .service-phone{top:0;right:0}.login-card-scene .service-net{left:0;top:79px}.login-card-scene .service-games{bottom:0;right:0}}
@media(prefers-reduced-motion:reduce){.premium-service{animation:none}}
''';p.write_text(s,encoding='utf8')
