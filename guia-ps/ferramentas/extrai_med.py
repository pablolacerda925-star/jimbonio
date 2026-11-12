"""Extrai do Guia de Prescrições (Medway) a seção de antiagregantes, anticoagulantes e fibrinolíticos (p. 30 a 37).
Uso: python3 ferramentas/extrai_med.py pdfs/MED.pdf /tmp/med_doencas.json"""
import json, re, subprocess, sys
ROT = re.compile(r"^(Apresentação|Mecanismo|Pra quem indicar\?|Quais as contraindicações\?|Doses?|Alvo|Antídoto)\s*:?\s*(.*)$")
PULA = re.compile(r"(Guia de Prescrições\s+\d+$|^Sumário$|^MEDICAMENTOS USADOS NAS$|^EMERGÊNCIAS CARDIOVASCULARES$)")
itens = []; prev = None
for pg in range(30, 38):
    txt = subprocess.run(["pdftotext", "-f", str(pg), "-l", str(pg), "-layout", sys.argv[1], "-"], capture_output=True, text=True).stdout
    for raw in txt.splitlines():
        t = raw.strip()
        if not t or PULA.search(t): continue
        if pg == 37 and t.startswith("4. MEDICAMENTOS"): break
        ind = len(raw) - len(raw.lstrip())
        if re.match(r"^\d\.\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ ]+$", t): prev = {"tipo": "sub", "t": re.sub(r"^\d\.\s+", "", t), "ind": 0, "pg": pg}; itens.append(prev); continue
        if re.match(r"^\d\.\d\s+\S", t): prev = {"tipo": "med", "t": re.sub(r"^\d\.\d\s+", "", t), "ind": 0, "pg": pg}; itens.append(prev); continue
        m = ROT.match(t)
        if m:
            rot = m.group(1).rstrip("?") + ("?" if m.group(1).endswith("?") else ":")
            prev = {"tipo": "p", "t": "**" + rot + "**" + (" " + m.group(2) if m.group(2) else ""), "ind": 0, "pg": pg, "rot": 1}; itens.append(prev); continue
        if t.startswith("•"): prev = {"tipo": "li", "t": t.lstrip("• ").strip(), "ind": 1, "pg": pg, "x": ind}; itens.append(prev); continue
        if t.startswith("→"): prev = {"tipo": "seta", "t": t.lstrip("→ ").strip(), "ind": 0, "pg": pg}; itens.append(prev); continue
        if prev and prev["tipo"] == "li" and ind > prev.get("x", 0) + 2: prev["t"] += " " + t; continue
        prev = {"tipo": "p", "t": t, "ind": 1 if prev and prev["tipo"] in ("seta", "li") else 0, "pg": pg}; itens.append(prev)
for x in itens: x.pop("x", None); x.pop("rot", None)
doenca = {"id": "anticoagulantes-antiagregantes-e-fibrinoliticos", "nome": "Anticoagulantes, antiagregantes e fibrinolíticos", "sistema": "Consulta rápida", "fonte": "MED", "paginas": [30, 37], "itens": itens}
json.dump([doenca], open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
print(len(itens), "itens")
