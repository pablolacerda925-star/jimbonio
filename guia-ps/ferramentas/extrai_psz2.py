"""Extrai o PS Zerado 2ª edição (arquivo comprimido, 4 páginas por folha) em blocos por página original."""
import fitz, json, re, sys
src = sys.argv[1]; doc = fitz.open(src)
LIXO = re.compile(r"(licenciado para|ASSISTIR A AULA|Aprenda a prescrever|^\s*>>>|^\s*<<<)", re.I)
def cor(c): return "%06x" % c
paginas = []
for f in range(len(doc)):
    pg = doc[f]
    for q, (x, y) in enumerate([(0, 0), (306, 0), (0, 396), (306, 396)]):
        n = f * 4 + q + 1
        clip = fitz.Rect(x, y, x + 306, y + 396)
        bul = []
        for dr in pg.get_drawings():
            r = dr["rect"]
            if clip.contains(r) and 1 < r.width < 4.5 and 1 < r.height < 4.5:
                bul.append(r)
        # tabelas: retângulo com contorno e divisórias verticais finas; cada coluna vira uma célula
        dws = pg.get_drawings(); cels = []
        for dr in dws:
            r = dr["rect"]
            if dr.get("type") == "s" and clip.contains(r) and r.width > 60 and 14 < r.height < 200:
                divs = sorted(d2["rect"].x0 for d2 in dws if d2["rect"].width < 1.5 and r.x0 + 2 < d2["rect"].x0 < r.x1 - 2 and abs(d2["rect"].y0 - r.y0) < 2)
                xs = [r.x0] + divs + [r.x1]
                if len(xs) > 2:
                    for a0, a1 in zip(xs, xs[1:]): cels.append(fitz.Rect(a0, r.y0, a1, r.y1))
        # grades desenhadas como um traço só (ex.: tabela da vacina antitetânica): vira tabela
        grades = []
        for dr in dws:
            r = dr["rect"]
            if dr.get("type") in ("s", "fs") and clip.contains(r) and r.width > 60 and r.height > 14 and len(dr["items"]) > 1:
                xs, ys = {round(r.x0, 1), round(r.x1, 1)}, {round(r.y0, 1), round(r.y1, 1)}
                for it in dr["items"]:
                    if it[0] == "l":
                        p1, p2 = it[1], it[2]
                        if abs(p1.x - p2.x) < 0.5: xs.add(round(p1.x, 1))
                        if abs(p1.y - p2.y) < 0.5: ys.add(round(p1.y, 1))
                grades.append((r, sorted(xs), sorted(ys)))
        def celula(bb):
            dentro = [c for c in cels if c.x0 - 1 <= bb[0] and bb[2] <= c.x1 + 1 and c.y0 - 1 <= bb[1] and bb[3] <= c.y1 + 1]
            return min(dentro, key=lambda c: c.width * c.height) if dentro else None
        linhas = []
        for b in pg.get_text("dict", clip=clip)["blocks"]:
            for l in b.get("lines", []):
                sp = [s for s in l["spans"] if s["text"].strip() or s["text"] == " "]
                if not sp: continue
                txt = "".join(s["text"] for s in sp)
                if LIXO.search(txt): continue
                x0, y0, x1, y1 = l["bbox"]
                if y0 - y < 34 and re.fullmatch(r"\s*\d{1,3}\s*", txt): continue  # número da página
                s0 = sp[0]
                bold0 = bool(s0["flags"] & 16); c0 = cor(s0["color"]); size = max(s["size"] for s in sp)
                if size > 7 and c0 == "434343": kind = "titulo"
                elif bold0 and c0 == "ad1614": kind = "droga"
                elif bold0 and c0 == "ff914d": kind = "secao"
                else: kind = "texto"
                # texto com negrito interno marcado por **
                partes = []
                for s in sp:
                    t = s["text"]
                    if (s["flags"] & 16) and kind == "texto" and t.strip(): partes.append("**" + t.strip() + "** " if t.endswith(" ") else "**" + t.strip() + "**")
                    else: partes.append(t)
                tm = "".join(partes)
                tm = re.sub(r"\*\*\s*\*\*", "", tm)
                bullet = any(abs((r.y0 + r.y1) / 2 - (y0 + y1) / 2) < 3 and r.x1 <= x0 + 1 for r in bul)
                c = celula(l["bbox"])
                cel = [round(c.y0 - y, 1), round(c.x0 - x, 1)] if c else None
                linhas.append({"cel": cel, "x": round(x0 - x, 1), "x1": round(x1 - x, 1), "y": round(y0 - y, 1), "y1": round(y1 - y, 1), "k": kind, "t": tm.strip(), "b": bullet, "it": bool(s0["flags"] & 2)})
        for r, xs, ys in grades:
            tab = [["" for _ in xs[1:]] for _ in ys[1:]]
            dentro = [l for l in linhas if r.x0 - x - 1 <= l["x"] <= r.x1 - x + 1 and r.y0 - y - 1 <= l["y"] <= r.y1 - y + 1]
            for l in sorted(dentro, key=lambda l: (l["y"], l["x"])):
                cx, cy = l["x"] + x + 1, (l["y"] + l["y1"]) / 2 + y
                i = max(k for k, v in enumerate(ys[:-1]) if v <= cy); j = max(k for k, v in enumerate(xs[:-1]) if v <= cx)
                tab[i][j] = (tab[i][j] + " " + l["t"]).strip()
            linhas = [l for l in linhas if l not in dentro]
            linhas.append({"cel": None, "x": round(r.x0 - x, 1), "x1": round(r.x1 - x, 1), "y": round(r.y0 - y, 1), "y1": round(r.y1 - y, 1), "k": "tabela", "t": "", "tab": tab, "b": False, "it": False})
        linhas.sort(key=lambda l: (l["cel"][0], l["cel"][1], l["y"], l["x"]) if l["cel"] else (l["y"], -1, l["y"], l["x"]))
        paginas.append({"n": n, "linhas": linhas})
json.dump(paginas, open(sys.argv[2], "w"), ensure_ascii=False)
print(len(paginas), "páginas")
