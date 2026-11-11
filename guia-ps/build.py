"""Monta dist/guia-ps.html (arquivo único) a partir de src/. Uso: python3 build.py"""
import os
rd = lambda n: open(os.path.join('src', n), encoding='utf-8').read()
html = f"""<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Guia de PS</title><style>{rd('estilo.css')}</style></head>
<body><div id="app"></div>
<script id="conteudo-do-fluxo">{rd('fluxo.js')}</script>
<script id="calculadoras">{rd('calc.js')}</script>
<script id="interface">{rd('ui.js')}</script>
</body></html>"""
os.makedirs('dist', exist_ok=True)
open('dist/guia-ps.html', 'w', encoding='utf-8').write(html); print('dist/guia-ps.html', round(len(html) / 1000), 'kB')
