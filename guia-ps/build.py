"""Monta, a partir de src/:
- dist/guia-ps.html: arquivo único, abre offline (salvar no celular ou no computador);
- dist/guia-ps-online.html: a mesma página no formato da página publicada no claude.ai (sem <html>/<head>/<body>,
  que a publicação acrescenta). Uso: python3 build.py"""
import os
rd = lambda n: open(os.path.join('src', n), encoding='utf-8').read()
corpo = f"""<div id="app"></div>
<script id="conteudo-do-fluxo">{rd('fluxo.js')}</script>
<script id="calculadoras">{rd('calc.js')}</script>
<script id="interface">{rd('ui.js')}</script>"""
html = f"""<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Guia de PS</title><style>{rd('estilo.css')}</style></head>
<body>{corpo}
</body></html>"""
online = f"""<title>Guia de PS</title>
<style>{rd('estilo.css')}</style>
{corpo}
"""
os.makedirs('dist', exist_ok=True)
open('dist/guia-ps.html', 'w', encoding='utf-8').write(html); print('dist/guia-ps.html', round(len(html) / 1000), 'kB')
open('dist/guia-ps-online.html', 'w', encoding='utf-8').write(online); print('dist/guia-ps-online.html', round(len(online) / 1000), 'kB')
