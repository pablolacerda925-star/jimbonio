"""Extrai do PS Zerado 1ª edição só as doenças que saíram da 2ª (decisão de 10/11/2026)."""
import fitz, json, re, sys
doc = fitz.open(sys.argv[1])
ALVOS = [("Crise convulsiva", "CRISE CONVULSIVA", "Neurológico"), ("Delirium", "DELIRIUM", "Psiquiatria"), ("Síndrome serotoninérgica", "SÍNDROME SEROTONINÉRGICA", "Intoxicações")]
LIXO = re.compile(r"(licenciado para|ASSISTIR|Aprenda a prescrever)", re.I)
seq = []
for i in range(len(doc)):
    pg = doc[i]; n = i + 1
    bul = [dr["rect"] for dr in pg.get_drawings() if 1 < dr["rect"].width < 9 and 1 < dr["rect"].height < 9]
    for b in pg.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            sp = [s for s in l["spans"] if s["text"].strip()]
            if not sp: continue
            txt = "".join(s["text"] for s in l["spans"]).strip()
            if LIXO.search(txt) or l["bbox"][1] > 760: continue
            s0 = sp[0]; c = "%06x" % s0["color"]; bold = bool(s0["flags"] & 16); size = s0["size"]
            k = "titulo" if bold and size >= 19 else "droga" if bold and c == "cc0000" else "secao" if bold and c == "ff9900" else "texto"
            partes = [("**" + s["text"].strip() + "**" if (s["flags"] & 16) and k == "texto" else s["text"]) for s in l["spans"]]
            t = re.sub(r"\s+", " ", "".join(partes)).strip()
            if t.startswith("•"): t = t.lstrip("• ").strip(); bl = True
            else: bl = any(abs((r.y0 + r.y1) / 2 - (l["bbox"][1] + l["bbox"][3]) / 2) < 5 and r.x1 <= l["bbox"][0] + 1 for r in bul)
            if re.match(r"^\d+\.\s", t): bl = True
            seq.append((n, {"k": k, "t": t, "x": l["bbox"][0], "y": l["bbox"][1], "y1": l["bbox"][3], "b": bl}))
out = []
for nome, tit, sis in ALVOS:
    i0 = next(i for i, (n, l) in enumerate(seq) if n > 6 and l["k"] == "titulo" and l["t"].upper().startswith(tit))
    i1 = next(i for i in range(i0 + 1, len(seq)) if seq[i][1]["k"] == "titulo")
    its = []; prev = None
    for n, l in seq[i0 + 1:i1]:
        t = l["t"]; k = l["k"]; forte = k == "texto" and t.startswith("**") and t.endswith("**") and t.count("**") == 2
        cont = prev and k == prev["k"] and not l["b"] and not forte and abs(l["x"] - prev["x"]) < 3 and (n == prev["n"] and l["y"] - prev["y1"] < 6) and not prev["t"].endswith(":") and k in ("texto", "droga")
        if cont: prev["t"] += " " + t; prev["y1"] = l["y1"]; continue
        tipo = {"droga": "med", "secao": "rot"}.get(k, "li" if l["b"] else ("forte" if forte else "p"))
        prev = {"tipo": tipo, "t": t.strip("*").strip() if forte else t, "x": l["x"], "y1": l["y1"], "n": n, "k": k}; its.append(prev)
    base = min(x["x"] for x in its)
    out.append({"id": re.sub(r"[^a-z0-9]+", "-", nome.lower().replace("í", "i").replace("é", "e").replace("ô", "o").replace("ã", "a").replace("ç", "c")).strip("-"), "nome": nome, "sistema": sis, "fonte": "PSZ1",
                "paginas": [seq[i0][0], seq[i1 - 1][0]], "itens": [{"tipo": x["tipo"], "t": x["t"], "ind": max(0, round((x["x"] - base) / 18)), "pg": x["n"]} for x in its]})
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
for d in out: print(d["nome"], d["paginas"], len(d["itens"]))
