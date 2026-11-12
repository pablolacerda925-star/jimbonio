"""Junta as saídas dos extratores em src/doencas.js. Uso (na pasta guia-ps):
  python3 ferramentas/extrai_psz2.py pdfs/PSZ2.pdf /tmp/psz2_linhas.json
  python3 ferramentas/monta_psz2.py /tmp/psz2_linhas.json /tmp/psz2_doencas.json
  python3 ferramentas/extrai_psz1.py pdfs/PSZ1.pdf /tmp/psz1_doencas.json
  python3 ferramentas/gera_doencas.py /tmp/psz2_doencas.json /tmp/psz1_doencas.json
O PSZ2 usado é o arquivo comprimido de 52 folhas (4 páginas por folha); as páginas citadas são as do livro."""
import json, re, sys
D = []
for f in sys.argv[1:]: D += json.load(open(f))
def limpa(t):
    t = re.sub(r"\*\*\s*\*\*", "", t).replace("⁠", "").replace("­", "")
    t = re.sub(r"\s+", " ", t).strip()
    if t.count("**") % 2: t = t.replace("**", "")
    return t
for d in D:
    its = []
    for x in d["itens"]:
        x["t"] = limpa(x["t"])
        if not x["t"] and x["tipo"] != "tab": continue
        if x["tipo"] == "rot" and its and its[-1]["tipo"] == "rot" and not its[-1]["t"].endswith(":"): its[-1]["t"] += " " + x["t"]; continue
        if its and its[-1]["tipo"] == "rot" and not its[-1]["t"].rstrip().endswith(":") and x["tipo"] == "p" and x["ind"] == its[-1]["ind"] and not its[-1].get("fechado"):
            its[-1]["t"] += " " + x["t"]
            if re.search(r"[.!]$", x["t"]): its[-1]["fechado"] = 1
            continue
        its.append(x)
    d["itens"] = [{k: v for k, v in x.items() if k in ("tipo", "t", "ind", "pg", "tab")} for i, x in enumerate(its) if not (i + 1 < len(its) and len(x["t"]) > 30 and its[i + 1]["t"].startswith(x["t"]))]
    assert not re.search(r"licenciad|\d{3}\.\d{3}\.\d{3}-\d{2}", json.dumps(d, ensure_ascii=False), re.I), d["nome"]
D.sort(key=lambda d: d["nome"])
txt = "// GERADO por ferramentas/gera_doencas.py a partir do texto nativo dos PDFs. Não editar à mão.\n// tipos de item: med (medicamento), rot (rótulo), sub (subtítulo), forte (destaque), li (item de lista), seta, p (parágrafo). pg = página do livro.\n"
txt += "var DOENCAS = " + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";\nif (typeof module !== \"undefined\") module.exports = DOENCAS;\n"
open("src/doencas.js", "w", encoding="utf-8").write(txt); print(len(D), "doenças", round(len(txt) / 1000), "kB")
