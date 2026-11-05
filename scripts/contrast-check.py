"""WCAG 2.2 kontrast kontrolü: tasarım token çiftlerini doğrular. AA altı çift varsa 1 ile çıkar."""
import sys
def L(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def cr(a,b):
    a,b=L(a),L(b); return (max(a,b)+0.05)/(min(a,b)+0.05)
pairs=[("text.primary/canvas","#1B2320","#F7F5F0"),("text.secondary/surface","#5A6460","#FFFFFF"),("text.secondary/canvas","#5A6460","#F7F5F0"),
("onAction/primary","#FFFFFF","#0F5C55"),("primary/surface","#0F5C55","#FFFFFF"),("activeFg/activeBg","#1D6B37","#DCF0E2"),
("warningFg/warningBg","#7F5300","#FBEBC8"),("dangerFg/dangerBg","#AE2418","#FBE0DD"),("border.control/surface","#7D8580","#FFFFFF"),
("focus/surface","#A84B25","#FFFFFF"),("focus/canvas","#A84B25","#F7F5F0"),("dangerFg/surface","#AE2418","#FFFFFF"),("teal600/teal50","#17756C","#E8F2F0")]
LIMIT={"border.control/surface":3.0}
fail=False
for n,a,b in pairs:
    r=cr(a,b); need=LIMIT.get(n,4.5); ok=r>=need; fail|=not ok
    print(f"{'OK ' if ok else 'FAIL'} {n:28s} {r:5.2f}:1 (min {need})")
sys.exit(1 if fail else 0)
