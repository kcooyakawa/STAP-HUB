#!/usr/bin/env python3
"""Gera o PNG 2x do nome/cargo. Uso: python3 tools/gerar_nome.py "Kco Oyakawa" "Head of Art" kco"""
import sys, pathlib
from playwright.sync_api import sync_playwright
n,c,s=sys.argv[1:4]; R=pathlib.Path(__file__).resolve().parent.parent
h=f"""<style>@font-face{{font-family:N;src:url(file://{R}/assets/fonts/Newsreader-Variable.ttf)}}
@font-face{{font-family:P;src:url(file://{R}/assets/fonts/PPRightGroteskText-Regular.otf)}}
body{{margin:0;background:#fff}}#b{{display:inline-block;padding:0 2px 2px 0}}
.n{{font:400 32px/1.1 N,serif;letter-spacing:-.5px;color:#07111F;white-space:nowrap}}.n b{{font-weight:400;color:#1F4FA8}}
.c{{font:400 13px/1 P,Arial;letter-spacing:2.6px;margin-top:8px;color:#1F4FA8;white-space:nowrap}}</style>
<div id=b><div class=n>{n}<b>.</b></div><div class=c>{c.upper()}</div></div>"""
t=R/'tools/_t.html'; t.write_text(h,encoding='utf8')
with sync_playwright() as p:
    b=p.chromium.launch(); g=b.new_page(device_scale_factor=2); g.goto(t.as_uri()); g.evaluate("document.fonts.ready"); g.wait_for_timeout(300)
    g.locator('#b').screenshot(path=str(R/f'assets/assinatura/{s}.png')); b.close()
t.unlink()
