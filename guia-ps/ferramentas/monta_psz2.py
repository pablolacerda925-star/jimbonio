"""Monta as doenças do PS Zerado 2ª edição a partir de psz2_linhas.json (saída de extrai_psz2.py)."""
import json, re, sys, unicodedata
P = {p["n"]: p["linhas"] for p in json.load(open(sys.argv[1]))}
def nz(s): return re.sub(r"[^A-Z0-9]", "", unicodedata.normalize("NFD", s.upper()).encode("ascii", "ignore").decode())
SUM = [  # (sistema, nome no sumário, página, nome curto para a tela)
 ("Cardiovascular", "TAQUICARDIA SUPRAVENTRICULAR", 8, "Taquicardia supraventricular"), ("Cardiovascular", "TAQUICARDIA VENTRICULAR", 9, "Taquicardia ventricular"),
 ("Cardiovascular", "FIBRILAÇÃO ATRIAL E FLUTTER", 10, "Fibrilação atrial e flutter"), ("Cardiovascular", "BRADIARRITMIAS", 14, "Bradiarritmias"),
 ("Cardiovascular", "SÍNDROME CORONARIANA AGUDA", 15, "Síndrome coronariana aguda"), ("Cardiovascular", "INSUFICIÊNCIA CARDÍACA AGUDAMENTE DESCOMPENSADA (ICAD) E EDEMA AGUDO DE PULMÃO (EAP)", 18, "Insuficiência cardíaca descompensada e edema agudo de pulmão"),
 ("Cardiovascular", "URGÊNCIA E EMERGÊNCIA HIPERTENSIVA", 23, "Urgência e emergência hipertensiva"), ("Cardiovascular", "DISSECÇÃO AGUDA DE AORTA", 24, "Dissecção aguda de aorta"),
 ("Cardiovascular", "TROMBOSE VENOSA PROFUNDA (TVP) E TROMBOEMBOLISMO PULMONAR (TEP)", 26, "Trombose venosa profunda e tromboembolismo pulmonar"),
 ("Neurológico", "CEFALEIA PRIMÁRIA", 27, "Cefaleia primária"), ("Neurológico", "ENXAQUECA", 29, "Enxaqueca"), ("Neurológico", "VERTIGEM", 32, "Vertigem"), ("Neurológico", "TROMBÓLISE", 33, "Trombólise (AVC isquêmico)"),
 ("Respiratório", "CRISE ASMÁTICA", 39, "Crise asmática"), ("Respiratório", "DPOC", 42, "DPOC exacerbada"), ("Respiratório", "PNEUMONIA", 46, "Pneumonia"), ("Respiratório", "SINTOMÁTICOS", 47, "Sintomáticos respiratórios"),
 ("Respiratório", "TUBERCULOSE", 48, "Tuberculose"), ("Respiratório", "PNEUMOTÓRAX / HEMOTÓRAX", 49, "Pneumotórax e hemotórax"), ("Respiratório", "OTITE MÉDIA AGUDA", 50, "Otite média aguda"),
 ("Respiratório", "RINOSSINUSITE AGUDA", 57, "Rinossinusite aguda"), ("Respiratório", "FARINGOAMIGDALITE", 59, "Faringoamigdalite"), ("Respiratório", "EPISTAXE", 60, "Epistaxe"),
 ("Gastrointestinal", "NÁUSEAS E VÔMITOS", 62, "Náuseas e vômitos"), ("Gastrointestinal", "DIARREIA", 64, "Diarreia"), ("Gastrointestinal", "DOENÇA HEMORROIDÁRIA", 65, "Doença hemorroidária"),
 ("Gastrointestinal", "HEMORRAGIA DIGESTIVA ALTA", 67, "Hemorragia digestiva alta"), ("Gastrointestinal", "HEMORRAGIA DIGESTIVA BAIXA", 69, "Hemorragia digestiva baixa"), ("Gastrointestinal", "ENCEFALOPATIA HEPÁTICA", 69, "Encefalopatia hepática"),
 ("Gastrointestinal", "PANCREATITE AGUDA", 70, "Pancreatite aguda"), ("Gastrointestinal", "COLELITÍASE", 72, "Colelitíase"), ("Gastrointestinal", "COLECISTITE", 74, "Colecistite"), ("Gastrointestinal", "COLANGITE", 75, "Colangite"),
 ("Gastrointestinal", "REFLUXO GASTROESOFÁGICO", 77, "Refluxo gastroesofágico"), ("Gastrointestinal", "DOENÇA ULCEROSA PÉPTICA", 78, "Doença ulcerosa péptica"), ("Gastrointestinal", "ASCITE", 78, "Ascite"),
 ("Gastrointestinal", "DIVERTICULITE AGUDA — NÃO COMPLICADA", 80, "Diverticulite aguda não complicada"), ("Gastrointestinal", "APENDICITE AGUDA", 84, "Apendicite aguda"),
 ("Gastrointestinal", "ABDOME AGUDO OBSTRUTIVO", 85, "Abdome agudo obstrutivo"), ("Gastrointestinal", "ABDOME AGUDO PERFURATIVO", 86, "Abdome agudo perfurativo"), ("Gastrointestinal", "ABDOME AGUDO VASCULAR", 89, "Abdome agudo vascular"), ("Gastrointestinal", "ABDOME AGUDO HEMORRÁGICO", 91, "Abdome agudo hemorrágico"),
 ("Hematológico", "ANEMIA FERROPRIVA", 92, "Anemia ferropriva"), ("Hematológico", "NEUTROPENIA FEBRIL", 93, "Neutropenia febril"),
 ("Endócrino e metabólico", "CETOACIDOSE DIABÉTICA (CAD) E ESTADO HIPERGLICÊMICO HIPEROSMOLAR (EHH)", 95, "Cetoacidose diabética e estado hiperglicêmico hiperosmolar"), ("Endócrino e metabólico", "CONTROLE GLICÊMICO", 98, "Controle glicêmico"),
 ("Endócrino e metabólico", "CETOACIDOSE DIABÉTICA NA PEDIATRIA", 99, "Cetoacidose diabética na pediatria"), ("Endócrino e metabólico", "HIPOGLICEMIA", 101, "Hipoglicemia"),
 ("Geniturinário", "INFECÇÃO DO TRATO URINÁRIO", 102, "Infecção do trato urinário"), ("Geniturinário", "CANDIDÍASE VAGINAL", 105, "Candidíase vaginal"), ("Geniturinário", "VAGINOSE BACTERIANA", 107, "Vaginose bacteriana"),
 ("Geniturinário", "VAGINOSE CITOLÍTICA", 108, "Vaginose citolítica"), ("Geniturinário", "TRICOMONÍASE", 108, "Tricomoníase"), ("Geniturinário", "HERPES GENITAL", 109, "Herpes genital"),
 ("Geniturinário", "URETRITE GONOCÓCICA", 111, "Uretrite gonocócica"), ("Geniturinário", "URETRITE NÃO GONOCÓCICA", 112, "Uretrite não gonocócica"), ("Geniturinário", "URETEROLITÍASE (CÓLICA NEFRÉTICA)", 113, "Ureterolitíase (cólica nefrética)"),
 ("Reprodutor", "ORQUIEPIDIDIMITE", 114, "Orquiepididimite"), ("Reprodutor", "SANGRAMENTO UTERINO ANORMAL", 116, "Sangramento uterino anormal"),
 ("Osteomuscular", "CONTROLE DA DOR MUSCULOESQUELÉTICA NO PRONTO SOCORRO", 118, "Dor musculoesquelética"), ("Osteomuscular", "LOMBALGIA MECÂNICA E TORCICOLO", 121, "Lombalgia mecânica e torcicolo"),
 ("Osteomuscular", "FRATURA EXPOSTA", 122, "Fratura exposta"), ("Osteomuscular", "GOTA", 123, "Gota"),
 ("Psiquiatria", "ACATISIA", 125, "Acatisia"), ("Psiquiatria", "SÍNDROME PSICÓTICA", 126, "Síndrome psicótica"), ("Psiquiatria", "AGRESSIVIDADE E AGITAÇÃO PSICOMOTORA", 129, "Agressividade e agitação psicomotora"), ("Psiquiatria", "ANSIEDADE AGUDA E CRISE DE PÂNICO", 131, "Ansiedade aguda e crise de pânico"),
 ("Hidroeletrolítico", "HIPERCALEMIA", 132, "Hipercalemia"), ("Hidroeletrolítico", "HIPOCALEMIA", 133, "Hipocalemia"), ("Hidroeletrolítico", "HIPONATREMIA", 134, "Hiponatremia"), ("Hidroeletrolítico", "HIPERNATREMIA", 136, "Hipernatremia"),
 ("Hidroeletrolítico", "HIPOCALCEMIA", 137, "Hipocalcemia"), ("Hidroeletrolítico", "HIPERCALCEMIA", 138, "Hipercalcemia"), ("Hidroeletrolítico", "HIPOMAGNESEMIA", 138, "Hipomagnesemia"), ("Hidroeletrolítico", "HIPERMAGNESEMIA", 140, "Hipermagnesemia"),
 ("Infecções", "SÍFILIS", 141, "Sífilis"), ("Infecções", "DENGUE", 142, "Dengue"), ("Infecções", "HERPES SIMPLES", 147, "Herpes simples"), ("Infecções", "CONJUNTIVITE", 149, "Conjuntivite"),
 ("Infecções", "TÉTANO", 150, "Tétano"), ("Infecções", "LEPTOSPIROSE", 152, "Leptospirose"), ("Infecções", "SEPSE E CHOQUE SÉPTICO", 154, "Sepse e choque séptico"),
 ("Infecções de pele", "BACTERIANAS SUPERFICIAIS - CELULITE E ERISIPELA", 156, "Celulite e erisipela"), ("Infecções de pele", "BACTERIANAS PURULENTAS - FURUNCULOSE E ABSCESSO", 157, "Furunculose e abscesso"),
 ("Infecções de pele", "BACTERIANAS GRAVES OU PROFUNDAS - SINAIS SISTÊMICOS (INTERNAÇÃO), FATORES DE RISCO OU PROFUNDAS (FASCEÍTE)", 158, "Infecção de pele grave ou profunda (fasceíte)"),
 ("Infecções de pele", "PÉ DIABÉTICO", 164, "Pé diabético"),
 ("Anafilaxia e alergias", "CHOQUE ANAFILÁTICO", 165, "Choque anafilático"), ("Anafilaxia e alergias", "ADJUVANTES", 166, "Anafilaxia: adjuvantes"), ("Anafilaxia e alergias", "ALERGIAS", 167, "Alergias"),
 ("Intoxicações", "DESCONTAMINAÇÃO", 169, "Intoxicação: descontaminação"), ("Intoxicações", "PARACETAMOL", 171, "Intoxicação por paracetamol"), ("Intoxicações", "ORGANOFOSFORADOS/CARBAMATOS", 172, "Intoxicação por organofosforados e carbamatos"),
 ("Intoxicações", "COCAÍNA", 172, "Intoxicação por cocaína"), ("Intoxicações", "OPIOIDES", 173, "Intoxicação por opioides"), ("Intoxicações", "INTOXICAÇÃO POR BENZODIAZEPÍNICOS", 173, "Intoxicação por benzodiazepínicos"),
 ("Intoxicações", "INTOXICAÇÃO ALCOOLICA", 174, "Intoxicação alcoólica"), ("Intoxicações", "ABSTINÊNCIA ALCOÓLICA", 175, "Abstinência alcoólica"),
 ("Causas externas", "CAUSAS EXTERNAS", 176, "Mordeduras e causas externas"), ("Causas externas", "ACIDENTE OFÍDICO", 178, "Acidente ofídico"), ("Causas externas", "ESCORPIONISMO", 182, "Escorpionismo"), ("Causas externas", "ARANEÍSMO (aranha-marrom e armadeira)", 183, "Araneísmo"),
 ("Hemocomponentes", "CONCENTRADO DE HEMÁCIAS", 185, "Concentrado de hemácias"), ("Hemocomponentes", "CONCENTRADO DE PLAQUETAS", 186, "Concentrado de plaquetas"), ("Hemocomponentes", "CRIOPRECIPITADO", 187, "Crioprecipitado"), ("Hemocomponentes", "PLASMA FRESCO CONGELADO", 187, "Plasma fresco congelado"),
 ("Consulta rápida", "ANTIMICROBIANOS", 187, "Antimicrobianos"), ("Consulta rápida", "ANALGÉSICOS", 191, "Analgésicos"), ("Consulta rápida", "AMINAS VASOATIVAS", 193, "Aminas vasoativas"), ("Consulta rápida", "INTUBAÇÃO", 196, "Intubação"), ("Consulta rápida", "Especial: GESTANTES", 204, "Gestantes"),
]
SISTEMAS = {nz(x) for x in ["SISTEMA CARDIOVASCULAR", "ARRITMIAS", "SISTEMA NERVOSO", "SISTEMA RESPIRATÓRIO", "SISTEMA GASTROINTESTINAL", "SISTEMA HEMATOLÓGICO", "SISTEMA ENDÓCRINO METABÓLICO", "SISTEMA GENITO-URINÁRIO", "SISTEMA GENITOURINÁRIO", "SISTEMA REPRODUTOR", "SISTEMA OSTEOMUSCULAR", "PSIQUIATRIA", "DISTÚRBIOS HIDROELETROLÍTICOS", "INFECÇÕES", "INFECÇÕES CUTÂNEAS", "ANAFILAXIA E ALERGIAS", "INTOXICAÇÃO EXÓGENA", "HEMOCOMPONENTES", "ASSOCIAR TERAPÊUTICA PARA GRAM-NEGATIVOS E ANAERÓBIOS:"]}
# 1) linhas da mesma altura viram uma só (texto justificado sai em pedaços)
def junta(ls):
    out = []
    for l in ls:
        if out and abs(l["y"] - out[-1]["y"]) < 1.5 and l["k"] == out[-1]["k"] and l.get("cel") == out[-1].get("cel") and 0 <= l["x"] - out[-1].get("x1", 1e9) < (14 if l.get("cel") else 60):
            o = out[-1]; o["t"] = (o["t"] + " " + l["t"]).replace("** **", " "); o["b"] = o["b"] or l["b"]; o["x1"] = l.get("x1", o["x1"])
        else: out.append(dict(l))
    return out
seq = []  # (pagina, linha)
for n in sorted(P):
    if n < 8: continue
    ls = junta(P[n])
    base = min([l["x"] for l in ls] or [0])
    for l in ls: l["ind"] = max(0, round((l["x"] - base) / 10)); seq.append((n, l))
# 2) acha o início de cada doença
inicios = []; pos = 0
for i, (sis, nome, pg, curto) in enumerate(SUM):
    alvo = nz(nome); achou = None
    for j in range(pos, len(seq)):
        n, l = seq[j]
        if n < pg - 1: continue
        if n > pg + 1: break
        acc = ""; k = j
        while k < len(seq) and len(acc) < len(alvo) + 2 and seq[k][1]["k"] in ("titulo", "droga") and seq[k][0] == n:
            acc += nz(seq[k][1]["t"]); k += 1
            if acc.startswith(alvo) or alvo.startswith(acc) and acc == alvo: break
        if acc.startswith(alvo) or nz(l["t"]) == alvo:
            achou = (j, k if acc.startswith(alvo) else j + 1); break
    if achou is None: sys.exit("não achei " + nome)
    inicios.append(achou); pos = achou[1]
# 3) itens de cada doença
def itens(linhas):
    it = []; prev = None
    for n, l in linhas:
        t = l["t"].strip()
        if l["k"] == "tabela":
            tb = [[" ".join(c.split()).replace("desconhec ido", "desconhecido") for c in row] for row in l["tab"]]
            cols = [j for j in range(len(tb[0])) if any(r[j] for r in tb)]; tb = [[r[j] for j in cols] for r in tb if any(r)]
            prev = {"tipo": "tab", "t": "", "tab": tb, "ind": 0, "k": "tabela", "n": n, "y": l["y"], "y1": l["y1"], "forte": False, "pg": n}; it.append(prev); continue
        if not t or nz(t) in SISTEMAS: continue
        if l["k"] == "titulo" and nz(t) == "SINDROMEPSICOTICA": continue
        k = l["k"]; forte = k == "texto" and t.startswith("**") and t.endswith("**") and t.count("**") == 2
        novo = (prev is None or l.get("cel") != prev.get("cel") or k != "texto" or prev["k"] != "texto" or l["b"] or t.startswith("→") or t.startswith("**") or forte or prev.get("forte")
                or (abs(l["ind"] - prev["ind"]) >= 1 and not l.get("cel")) or (n == prev["n"] and l["y"] - prev["y1"] > 6) or prev["t"].rstrip().endswith(":")
                or (n != prev["n"] and re.search(r"[.:!]$", prev["t"].rstrip())))
        if novo:
            tipo = {"droga": "med", "secao": "rot", "titulo": "sub"}.get(k, "li" if l["b"] else ("seta" if t.startswith("→") else ("forte" if forte else "p")))
            if k == "droga" and t.isupper() and len(t) > 6: tipo = "sub"
            prev = {"tipo": tipo, "t": t, "ind": (1 if k == "texto" else 0) if l.get("cel") else l["ind"], "k": k, "n": n, "y": l["y"], "y1": l["y1"], "forte": forte, "pg": n, "cel": l.get("cel")}; it.append(prev)
        else:
            prev["t"] = (prev["t"].rstrip() + " " + t).replace("** **", " "); prev["y1"] = l["y1"]; prev["n"] = n; prev["y"] = l["y"]
    out = []
    for x in it:
        t = re.sub(r"\s+", " ", x["t"]).strip()
        if x["tipo"] == "seta": t = t.lstrip("→ ").strip()
        if x["tipo"] == "forte": t = t.strip("*").strip()
        o = {"tipo": x["tipo"], "t": t, "ind": x["ind"], "pg": x["pg"]}
        if x["tipo"] == "tab": o["tab"] = x["tab"]
        out.append(o)
    # junta nome de medicamento quebrado em duas linhas
    j = []
    for x in out:
        if j and x["tipo"] == "med" and j[-1]["tipo"] == "med" and not re.search(r"(\)|IV|EV|VO|IM|SC|mL|mg|g|frasco|comprimidos?|ampolas?)$", j[-1]["t"]) : j[-1]["t"] += " " + x["t"]
        else: j.append(x)
    return j
doencas = []
for i, (sis, nome, pg, curto) in enumerate(SUM):
    a = inicios[i][1]; b = inicios[i + 1][0] if i + 1 < len(SUM) else len(seq)
    its = itens(seq[a:b]); pgs = sorted({x["pg"] for x in its}) or [pg]
    doencas.append({"id": re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFD", curto.lower()).encode("ascii", "ignore").decode()).strip("-"), "nome": curto, "sistema": sis,
                    "fonte": "PSZ2", "paginas": [pgs[0], pgs[-1]], "itens": its})
json.dump(doencas, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
print(len(doencas), "doenças;", sum(len(d["itens"]) for d in doencas), "itens")
