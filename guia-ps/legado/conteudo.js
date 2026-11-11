// CONTEÚDO CLÍNICO — separado do código da interface. Versão do conteúdo abaixo.
// Estados (e): doc = seus PDFs | ext = fonte externa aprovada | extp = externa, aguardando sua aprovação
//              avi = só em um PDF, sem confirmação em diretriz | pend = pendente (nunca exibido como orientação)
var CONTEUDO = {
  versao: "0.1.0-piloto", data: "2026-11-10",
  fontes: {
    PSZ2: { n: "Guia de Prescrições da Emergência (PS Zerado)", ed: "2ª edição, arquivo de 2026", tipo: "Guia de prescrição", off: 0 },
    PSZ1: { n: "Guia de Prescrições da Emergência PS Zerado", ed: "sem edição, arquivo de 2025", tipo: "Guia de prescrição", off: 0 },
    CNP: { n: "Cardiologia na Prática 3.0 — Emergências Cardiovasculares", ed: "versão 3.0, 2023", tipo: "Guia de prescrição", off: -3 },
    DRG: { n: "Manual Prático: Drogas na Emergência 3.0", ed: "versão 3.0, 2023", tipo: "Guia de medicamentos", off: -6 },
    MED: { n: "Guia de Prescrições (Medway)", ed: "sem edição, 2021", tipo: "Guia de prescrição", off: 0 },
    SBC26: { n: "Diretriz Brasileira de Insuficiência Cardíaca – 2026 (SBC)", ed: "Arq Bras Cardiol 2026;123(10):e20260830", tipo: "Diretriz", ext: 1,
      url: "https://abccardiol.org/wp-content/uploads/articles_xml/0066-782x-abc-123-10-e20260830/0066-782x-abc-123-10-e20260830.pdf" },
    SBC18: { n: "Diretriz Brasileira de Insuficiência Cardíaca Crônica e Aguda (SBC)", ed: "Arq Bras Cardiol 2018;111(3):436-539", tipo: "Diretriz", ext: 1,
      url: "https://abccardiol.org/wp-content/uploads/articles_xml/0066-782X-abc-111-03-0436/0066-782X-abc-111-03-0436.x66747.pdf" },
    BNPS: { n: "Bula do profissional — Nitroprus (nitroprusseto de sódio), Cristália", ed: "bula do fabricante", tipo: "Bula", ext: 1, url: "https://cristalia.com.br/produto/138/bula-profissional" },
    BNOR: { n: "Bula — Epikabi (hemitartarato de norepinefrina), Fresenius Kabi", ed: "bula do fabricante", tipo: "Bula", ext: 1, url: "https://www.Fresenius-Kabi.com/br/documents/1.Epikabi_Bula_PA.pdf" },
    BDOB: { n: "Bulas de cloridrato de dobutamina (reproduções em bulários)", ed: "a confirmar no bulário da Anvisa", tipo: "Bula", ext: 1, url: "https://bula.com.br/dobutrex" }
  },
  temas: [{
    id: "ic", nome: "Insuficiência cardíaca descompensada e edema agudo de pulmão",
    siglas: ["IC", "ICAD", "ICD", "EAP", "ICC"],
    sinonimos: ["insuficiencia cardiaca aguda", "edema agudo de pulmao", "congestao pulmonar", "scape", "fospe"],
    queixas: ["falta de ar", "dispneia", "ortopneia", "inchaco nas pernas", "edema de membros inferiores", "cansaco"],
    atalhos: ["imediato", "frequente"],
    inicial: [
      { t: "Três etapas, idealmente em até 60 minutos: (1) tratar risco imediato à vida — choque cardiogênico ou insuficiência respiratória; (2) identificar causas que exigem tratamento específico; (3) definir a terapia inicial pelo perfil clínico-hemodinâmico.", e: "ext", s: [{ f: "SBC26", ref: "seção 7.4.1, p. 65" }] },
      { t: "Classificar por perfil clínico-hemodinâmico (congestão × perfusão). Recomendação forte, evidência moderada.", e: "ext", s: [{ f: "SBC26", ref: "Tabela 7.1; seção 7.4.2, p. 67" }] },
      { t: "Instabilidade hemodinâmica ou insuficiência respiratória: UTI.", e: "ext", s: [{ f: "SBC26", ref: "seção 7.4.1" }] },
      { t: "Edema agudo de pulmão em duas formas: hiperaguda (SCAPE), em que o paciente não tem excesso de líquido — VNI e vasodilatador; e subaguda (FOSPE), típica da IC descompensada com congestão — furosemida.", e: "doc", s: [{ f: "PSZ2", p: 19 }] },
      { t: "Realizar ventilação não invasiva (VNI). Diurético por via endovenosa: na hipervolemia a absorção oral é imprevisível. Morfina não é mais usada no EAP.", e: "doc", s: [{ f: "PSZ2", p: 20, img: "PSZ2-020" }] }
    ],
    exames: [
      { id: "ecg", t: "ECG", por: "afastar SCA e arritmias" }, { id: "rx", t: "Radiografia de tórax" }, { id: "usp", t: "Ultrassom pulmonar" },
      { id: "eco", t: "Ecocardiograma" }, { id: "pn", t: "Peptídeo natriurético (BNP ou NT-proBNP)", por: "NT-proBNP < 300 pg/mL ou BNP < 100 pg/mL afastam IC descompensada (seção 7.2, p. 63)" },
      { id: "tro", t: "Troponina", por: "afastar SCA" }, { id: "ele", t: "Eletrólitos (sódio e potássio)" }, { id: "cr", t: "Creatinina" },
      { id: "lac", t: "Lactato" }, { id: "gas", t: "Gasometria ou oximetria" },
      { id: "dd", t: "D-dímero", por: "se suspeita de embolia pulmonar", cond: 1 }, { id: "pct", t: "Procalcitonina", por: "se suspeita de pneumonia", cond: 1 },
      { id: "tsh", t: "TSH", por: "se suspeita de distúrbio da tireoide", cond: 1 }
    ],
    examesFonte: { e: "ext", s: [{ f: "SBC26", ref: "Quadro 7.1, p. 64" }] },
    sinais: [
      { id: "c1", eixo: "cong", t: "Ortopneia", pri: 1 }, { id: "c2", eixo: "cong", t: "Estertores", pri: 1 },
      { id: "c3", eixo: "cong", t: "Turgência venosa jugular", pri: 1 }, { id: "c4", eixo: "cong", t: "Ascite", pri: 1 },
      { id: "c5", eixo: "cong", t: "Edema", pri: 1 },
      { id: "c6", eixo: "cong", t: "Refluxo hepatojugular" }, { id: "c7", eixo: "cong", t: "Terceira bulha (B3)" },
      { id: "c8", eixo: "cong", t: "Taquipneia (FR > 22 irpm) ou esforço respiratório" },
      { id: "p1", eixo: "perf", t: "Pressão de pulso reduzida", pri: 1 }, { id: "p2", eixo: "perf", t: "Sonolência ou obnubilação", pri: 1 },
      { id: "p3", eixo: "perf", t: "Extremidades frias", pri: 1 }, { id: "p4", eixo: "perf", t: "Baixa diurese", pri: 1 },
      { id: "p5", eixo: "perf", t: "Sudorese fria" }, { id: "p6", eixo: "perf", t: "Lactato elevado" }
    ],
    sinaisFonte: {
      pri: { e: "ext", s: [{ f: "SBC26", ref: "Figura 7.3, p. 68" }] },
      comp: { e: "ext", s: [{ f: "SBC18", ref: "Quadro 1.2, p. 486" }] },
      regra: "Regra do site, não da diretriz: um ou mais sinais presentes sugerem o eixo como positivo; todos os sinais principais avaliados e ausentes sugerem negativo. As diretrizes falam em “evidências de congestão” e “evidências de baixa perfusão”, sem número mínimo."
    },
    perfis: { A: "quente e seco", B: "quente e úmido", C: "frio e úmido", L: "frio e seco" },
    perfisFonte: { e: "doc", s: [{ f: "CNP", p: 75, img: "CNP-075" }, { f: "SBC26", ref: "seção 7.4.2, p. 67" }] },
    condutas: [
      { perfil: "A", itens: [
        { t: "Paciente compensado: alta hospitalar com ajuste da terapia oral.", e: "doc", s: [{ f: "CNP", p: 72 }], por: "Perfil A: sem congestão e com perfusão adequada." },
        { t: "Detalhe das opções e doses da terapia oral (CNP p. 72-74).", e: "pend", por: "Páginas ainda não conferidas por imagem." } ] },
      { perfil: "B", itens: [
        { t: "Furosemida EV, idealmente em até 1 hora do diagnóstico.", e: "ext", s: [{ f: "SBC26", ref: "seção 7.5.1, p. 70; Tabela 7.3 (forte, moderada)" }], med: "furosemida", por: "Há congestão: diurético de alça endovenoso é a base da descongestão." },
        { t: "Vasodilatador EV pode ser considerado (recomendação fraca, evidência baixa). Nitroglicerina é a mais usada; nitroprussiato é alternativa.", e: "ext", s: [{ f: "SBC26", ref: "seção 7.4.2 e Tabela 7.3" }], med: "nitroglicerina", med2: "nitroprussiato", por: "Perfil B: congestão com perfusão adequada.", pas: 1 },
        { t: "EAP em normotenso ou hipertensivo: nitroprussiato (vasodilatador de escolha no EAP hipertensivo) ou nitroglicerina (de escolha no EAP por SCA). Manter o betabloqueador e suspender IECA/BRA.", e: "doc", s: [{ f: "CNP", p: 62, img: "CNP-062" }] },
        { t: "VNI. No cenário de SCAPE: iniciar pressão de suporte 12 cmH₂O e PEEP 6 a 7 cmH₂O; FiO₂ conforme a saturação.", e: "doc", s: [{ f: "PSZ2", p: 22, img: "PSZ2-022" }] } ] },
      { perfil: "C", pasLt: 90, itens: [
        { t: "Dobutamina (PAS < 90 mmHg com hipoperfusão). Recomendação forte, evidência baixa. Usar pelo menor tempo e na menor dose necessários.", e: "ext", s: [{ f: "SBC26", ref: "Tabela 7.3; Tabela 7.8, p. 79" }], med: "dobutamina", por: "Perfil C com PAS < 90 mmHg." },
        { t: "EAP com hipotensão (PAS < 90 mmHg): noradrenalina associada a dobutamina. Suspender betabloqueador e IECA/BRA se uso prévio.", e: "doc", s: [{ f: "CNP", p: 61, img: "CNP-061" }], med: "noradrenalina", med2: "dobutamina" },
        { t: "No choque cardiogênico a noradrenalina deve estar sempre associada a um inotrópico. Objetivo: PAM 65 a 70 mmHg.", e: "doc", s: [{ f: "DRG", p: 43, img: "DRG-043" }] },
        { t: "Se muito congesto e anasarcado, a furosemida é fundamental para retirar o excesso de volume.", e: "doc", s: [{ f: "CNP", p: 61, img: "CNP-061" }], med: "furosemida" },
        { t: "O perfil C usualmente é tratado em terapia intensiva.", e: "ext", s: [{ f: "SBC26", ref: "Quadro 7.7, p. 82" }] } ] },
      { perfil: "C", pasGe: 90, itens: [
        { t: "Nitroprussiato pode ser considerado (PAS > 90 mmHg). Recomendação fraca, evidência baixa.", e: "ext", s: [{ f: "SBC26", ref: "Tabela 7.3" }], med: "nitroprussiato", por: "Perfil C com PAS acima de 90 mmHg." },
        { t: "Nitroprussiato na IC perfil C em uso de inotrópico, com PAS > 90 mmHg.", e: "doc", s: [{ f: "DRG", p: 51, img: "DRG-051" }], med: "nitroprussiato" },
        { t: "Furosemida EV para a congestão.", e: "ext", s: [{ f: "SBC26", ref: "seção 7.5.1, p. 70" }], med: "furosemida" },
        { t: "O perfil C usualmente é tratado em terapia intensiva.", e: "ext", s: [{ f: "SBC26", ref: "Quadro 7.7, p. 82" }] } ] },
      { perfil: "L", itens: [
        { t: "Hidratação venosa cautelosa: 250 mL EV de Ringer lactato. Reavaliar após a infusão: melhora da perfusão ou sinais de congestão.", e: "doc", s: [{ f: "CNP", p: 75, img: "CNP-075" }], por: "Perfil L: baixa perfusão sem congestão." },
        { t: "Se surgir congestão e persistir a má perfusão: interromper a reposição volêmica e iniciar inotrópico (dobutamina).", e: "doc", s: [{ f: "CNP", p: 75, img: "CNP-075" }], med: "dobutamina" } ] }
    ],
    limiares: { t: "Limiar de PAS para vasodilatador — a diretriz traz dois: 90 mmHg na escolha por perfil (seção 7.4.2 e Tabela 7.3) e PAS > 110 mmHg na seção de vasodilatadores (7.8, p. 76). O site mostra os dois, sem escolher.", e: "ext", s: [{ f: "SBC26", ref: "7.4.2, Tabela 7.3 e 7.8" }] },
    transicoes: [{ perfil: "C", pasLt: 90, t: "PAS < 90 mmHg com baixa perfusão e congestão são compatíveis com choque cardiogênico. O protocolo de choque cardiogênico ainda não está neste piloto.", alvo: "Choque cardiogênico" }],
    reavaliacao: [
      { t: "Diurético: reavaliar em 6 horas. Resposta adequada se débito urinário > 100 a 150 mL/h: repetir dose semelhante a cada 12 h. Abaixo de 100 mL/h: dobrar a dose e reavaliar em mais 6 h.", e: "ext", s: [{ f: "SBC26", ref: "Figura 7.5, p. 71" }], gat: "furosemida", horas: 6 },
      { t: "Vasodilatador EV: ajuste de dose a cada 15 minutos; pressão não invasiva a cada 15 minutos durante o ajuste e depois a cada 30.", e: "ext", s: [{ f: "SBC18", ref: "Tabela 2.2, p. 494; Quadro 1.7, p. 490" }] },
      { t: "Dobutamina: avaliar ajuste a cada 10 minutos.", e: "ext", s: [{ f: "SBC18", ref: "Tabela 2.3, p. 495" }] },
      { t: "Monitorização contínua de FC, FR, PA, ECG e saturação; balanço hídrico a cada 6 h; ureia, creatinina e eletrólitos a cada 6 a 12 h durante descongestão intensa.", e: "ext", s: [{ f: "SBC18", ref: "Quadro 1.7, p. 490" }] },
      { t: "Objetivo da descongestão: perda de 1 L nas primeiras 6 horas, até melhora da congestão.", e: "doc", s: [{ f: "DRG", p: 60, img: "DRG-060" }] },
      { t: "Perfil L: intervalo de reavaliação após os 250 mL — não documentado (o texto diz apenas “reavaliar após infusão”).", e: "doc", s: [{ f: "CNP", p: 75 }] }
    ],
    destino: [
      { t: "UTI: instabilidade hemodinâmica ou insuficiência respiratória; perfil C usualmente em terapia intensiva.", e: "ext", s: [{ f: "SBC26", ref: "7.4.1; Quadro 7.7, p. 82" }] },
      { t: "Antes da alta: fator precipitante resolvido; sem congestão; diurético oral em dose estável e peso estável por pelo menos 48 h; função renal estável; sem droga endovenosa por pelo menos 48 h; tratamento otimizado; reavaliação ambulatorial em 7 a 14 dias.", e: "ext", s: [{ f: "SBC26", ref: "seção 7.17, p. 85-86" }] },
      { t: "Critérios de internação em enfermaria: não documentados nos PDFs nem localizados no trecho lido das diretrizes.", e: "pend" }
    ],
    alta: [{ t: "Prescrição de alta: ajuste de terapia oral do perfil A (CNP p. 72-74) — pendente de conferência visual.", e: "pend" }]
  }],
  meds: [
    { id: "furosemida", nome: "Furosemida", sin: ["lasix", "diuretico de alca"],
      apres: [{ id: "f20", r: "Ampola 20 mg/2 mL (10 mg/mL)", mg: 20, ml: 2, comum: 1, s: [{ f: "DRG", p: 60, img: "DRG-060" }, { f: "PSZ2", p: 20 }] }],
      esquemas: [
        { id: "fur1", tema: "ic", titulo: "Sem uso prévio de diurético", calc: "bolus", un: "mg", min: 20, max: 40, via: "EV em bolus", prep: "Não diluir quando feita em bolus.",
          txt: "Bolus EV de 20 a 40 mg, idealmente em até 1 hora do diagnóstico.", e: "ext", s: [{ f: "SBC26", ref: "seção 7.5.1, p. 70; Figura 7.5, p. 71" }], prepS: [{ f: "DRG", p: 60, img: "DRG-060" }], div: "d1" },
        { id: "fur2", tema: "ic", titulo: "Usuário crônico de diurético de alça", calc: "mult", un: "mg", min: 1, max: 2, teto: 600, via: "EV em bolus", prep: "Não diluir quando feita em bolus.",
          txt: "Bolus EV de 1 a 2 vezes a dose oral diária total.", e: "ext", s: [{ f: "SBC26", ref: "seção 7.5.1, p. 70; Figura 7.5, p. 71" }], prepS: [{ f: "DRG", p: 60, img: "DRG-060" }], div: "d2" }
      ],
      notas: [
        { t: "Manutenção: reavaliar em 6 h; se resposta adequada, repetir a cada 12 h; se não, dobrar a dose. Teto de 400 a 600 mg/dia (até 1.000 mg/dia na disfunção renal grave).", e: "ext", s: [{ f: "SBC26", ref: "seção 7.5.1, p. 70" }], div: "d3" },
        { t: "Dose máxima 600 mg/dia. Efeitos adversos: hipocalemia, hipernatremia, surdez, hipomagnesemia.", e: "doc", s: [{ f: "DRG", p: 60, img: "DRG-060" }] } ] },
    { id: "nitroglicerina", nome: "Nitroglicerina", sin: ["tridil", "nitrato ev", "ntg"],
      apres: [{ id: "n50", r: "Ampola 50 mg/10 mL (5 mg/mL)", mg: 50, ml: 10, comum: 1, s: [{ f: "PSZ2", p: 20, img: "PSZ2-020" }, { f: "DRG", p: 52, img: "DRG-052" }, { f: "CNP", p: 62, img: "CNP-062" }] }],
      preparos: [{ id: "np1", ap: "n50", amp: 1, dil: 240, diluente: "SF 0,9% (CNP p. 62 admite SF 0,9% ou SG 5%)", s: [{ f: "PSZ2", p: 20, img: "PSZ2-020" }, { f: "CNP", p: 62, img: "CNP-062" }] }],
      esquemas: [
        { id: "ntg1", tema: "ic", titulo: "Infusão contínua", calc: "inf", porKg: 0, un: "mcg/min", ini: "10 a 20 mcg/min", max: 200, via: "EV em bomba de infusão",
          txt: "Início de 10 a 20 mcg/min; aumento de 10 a 20 mcg/min a cada 15 minutos; máximo 200 mcg/min.", e: "ext", s: [{ f: "SBC18", ref: "Tabela 2.2, p. 494" }], div: "d4" },
        { id: "ntg2", tema: "ic", titulo: "Bolus por faixa de PAS na forma hiperaguda (SCAPE)", calc: "pas", un: "mL", faixas: [{ de: 160, ate: 179, ml: 3 }, { de: 180, ate: 199, ml: 4 }, { de: 201, ate: 999, ml: 5 }], via: "EV em bolus, da solução de 200 mcg/mL",
          txt: "PAS 160 a 179 mmHg: 3 mL em bolus. PAS 180 a 199: 4 mL. PAS > 200: 5 mL. Manutenção: 30 mL/h; se a PAS estiver diminuindo, manter; se igual ou aumentando, aumentar 6 mL/h a cada 10 minutos. Não realizar essas doses em cenário de hipervolemia.",
          e: "avi", aviso: "Esquema documentado só no PS Zerado 2ª edição; não encontrado nas diretrizes. A SBC 2026 (7.8, p. 76) cita bolus de 1 a 2 mg no edema pulmonar com hipertensão grave. O texto não cobre PAS exatamente igual a 200.", s: [{ f: "PSZ2", p: 20, img: "PSZ2-020" }, { f: "PSZ2", p: 21, img: "PSZ2-021" }] }
      ],
      notas: [
        { t: "Forma subaguda (FOSPE): iniciar com 5 mL/h da solução de 200 mcg/mL e titular.", e: "doc", s: [{ f: "PSZ2", p: 21, img: "PSZ2-021" }], div: "d4" },
        { t: "Contraindicações: uso de sildenafila < 24 h ou tadalafila < 48 h, IAM de VD e hipotensão. Efeitos adversos: cefaleia, hipotensão, metemoglobinemia.", e: "doc", s: [{ f: "DRG", p: 52, img: "DRG-052" }] } ] },
    { id: "nitroprussiato", nome: "Nitroprussiato de sódio", sin: ["nipride", "nitroprusseto", "nps"],
      apres: [{ id: "p50", r: "Ampola 50 mg/2 mL (25 mg/mL)", mg: 50, ml: 2, comum: 1, s: [{ f: "PSZ2", p: 21, img: "PSZ2-021" }, { f: "DRG", p: 51, img: "DRG-051" }] }],
      preparos: [
        { id: "pp1", ap: "p50", amp: 1, dil: 248, diluente: "SG 5%", s: [{ f: "PSZ2", p: 21, img: "PSZ2-021" }] },
        { id: "pp2", ap: "p50", amp: 2, dil: 246, diluente: "SG 5%", s: [{ f: "PSZ2", p: 21, img: "PSZ2-021" }] }],
      esquemas: [{ id: "nps1", tema: "ic", titulo: "Infusão contínua", calc: "inf", porKg: 1, un: "mcg/kg/min", ini: "0,3 mcg/kg/min", max: 5, via: "EV em bomba de infusão, protegido da luz",
        txt: "Início de 0,3 mcg/kg/min; aumento de 0,3 a 0,5 mcg/kg/min a cada 15 minutos; máximo 5 mcg/kg/min.", e: "ext", s: [{ f: "SBC18", ref: "Tabela 2.2, p. 494" }], div: "d5" }],
      notas: [
        { t: "Diluente: solução de glicose a 5%, protegida da luz. Dois dos seus guias citam SF 0,9%.", e: "extp", s: [{ f: "BNPS" }], div: "d5" },
        { t: "Dosagem indexada pelo peso: 0,1 a 5 mcg/kg/min. Efeitos adversos: cefaleia, intoxicação por cianeto.", e: "doc", s: [{ f: "DRG", p: 51, img: "DRG-051" }] } ] },
    { id: "dobutamina", nome: "Dobutamina", sin: ["dobutrex", "inotropico"],
      apres: [{ id: "d250", r: "Ampola 250 mg/20 mL (12,5 mg/mL)", mg: 250, ml: 20, comum: 1, s: [{ f: "DRG", p: 46, img: "DRG-046" }, { f: "PSZ2", p: 22, img: "PSZ2-022" }] }],
      preparos: [
        { id: "dp4", ap: "d250", amp: 4, dil: 170, diluente: "SF 0,9% (PSZ2, CNP) ou SG 5% (DRG)", s: [{ f: "PSZ2", p: 22, img: "PSZ2-022" }, { f: "DRG", p: 46, img: "DRG-046" }, { f: "CNP", p: 61, img: "CNP-061" }] },
        { id: "dp2", ap: "d250", amp: 2, dil: 210, diluente: "SF 0,9%", s: [{ f: "PSZ2", p: 22, img: "PSZ2-022" }] },
        { id: "dp1", ap: "d250", amp: 1, dil: 230, diluente: "SG 5%", s: [{ f: "DRG", p: 46, img: "DRG-046" }] }],
      esquemas: [{ id: "dob1", tema: "ic", titulo: "Infusão contínua", calc: "inf", porKg: 1, un: "mcg/kg/min", ini: "0,5 a 1 mcg/kg/min", usual: 20, max: 40, via: "EV em bomba de infusão",
        txt: "Dose inicial de 0,5 a 1 mcg/kg/min; manutenção de 2 a 20 mcg/kg/min (até 40).", e: "ext", s: [{ f: "SBC26", ref: "Quadro 7.5, p. 77" }], div: "d6" }],
      notas: [
        { t: "Diluentes compatíveis: glicose 5% e cloreto de sódio 0,9%, entre outros. Os dois diluentes dos seus guias são aceitos.", e: "extp", s: [{ f: "BDOB" }], div: "d6" },
        { t: "Faixa de 2 a 20 mcg/kg/min. Efeitos adversos: arritmias, hipotensão, isquemia miocárdica. Se PAS < 90 mmHg: associar noradrenalina.", e: "doc", s: [{ f: "DRG", p: 46, img: "DRG-046" }] } ] },
    { id: "noradrenalina", nome: "Noradrenalina (norepinefrina)", sin: ["norepinefrina", "nora", "vasopressor"],
      apres: [{ id: "n4", r: "Ampola 4 mL com 4 mg de norepinefrina base (rótulo: hemitartarato 8 mg/4 mL)", mg: 4, ml: 4, comum: 1, s: [{ f: "DRG", p: 43, img: "DRG-043" }, { f: "BNOR" }] }],
      preparos: [
        { id: "nr4", ap: "n4", amp: 4, dil: 234, diluente: "SG 5% (bula). CNP p. 61 cita SF 0,9%", s: [{ f: "DRG", p: 43, img: "DRG-043" }, { f: "PSZ2", p: 194, img: "PSZ2-194" }, { f: "CNP", p: 61, img: "CNP-061" }] },
        { id: "nr8", ap: "n4", amp: 8, dil: 218, diluente: "SG 5%", s: [{ f: "DRG", p: 43, img: "DRG-043" }, { f: "PSZ2", p: 194, img: "PSZ2-194" }] }],
      esquemas: [{ id: "nor1", tema: "ic", titulo: "Infusão contínua (associada a inotrópico)", calc: "inf", porKg: 1, un: "mcg/kg/min", ini: "0,1 a 0,2 mcg/kg/min (SBC 2018); 0,05 (DRG p. 43)", usual: 1, max: 2, via: "EV em bomba de infusão",
        txt: "0,2 a 1,0 mcg/kg/min em infusão contínua (SBC 2026). Início de 0,1 a 0,2, ajuste a cada 15 minutos, máximo 1,0 (SBC 2018).", e: "ext", s: [{ f: "SBC26", ref: "Quadro 7.6, p. 78" }, { f: "SBC18", ref: "Tabela 2.3, p. 495" }], div: "d7" }],
      notas: [
        { t: "Diluir em glicose 5% (ou glicose 5% com cloreto de sódio); a bula não recomenda solução salina isolada. Um dos seus guias cita SF 0,9%.", e: "extp", s: [{ f: "BNOR" }], div: "d7" },
        { t: "As doses são em norepinefrina base. Cada mL contém 2 mg de hemitartarato, equivalentes a 1 mg de base.", e: "extp", s: [{ f: "BNOR" }] },
        { t: "Dose inicial 0,05 mcg/kg/min; máxima 1 mcg/kg/min (pouco benefício vasoconstritor além disso). O PS Zerado traz faixa de 0,05 a 2,0.", e: "doc", s: [{ f: "DRG", p: 43, img: "DRG-043" }, { f: "PSZ2", p: 194, img: "PSZ2-194" }] } ] }
  ],
  divergencias: [
    { id: "d1", item: "Furosemida EV, sem uso prévio", versoes: "PSZ2 p. 20 e PSZ1 p. 16: 1,0 a 1,5 mg/kg. MED p. 40: 1 mg/kg. DRG p. 60: 0,5 a 1 mg/kg (1 a 4 ampolas). CNP p. 62: 2 a 3 ampolas.", mesmo: "Sim", ref: "SBC 2026, seção 7.5.1: 20 a 40 mg. SBC 2018: 20 mg (Tabela 2.1) e 20 a 40 mg (texto, p. 490).", res: "20 a 40 mg em bolus (SBC 2026).", st: "Resolvida — aprovada em 10/11/2026" },
    { id: "d2", item: "Furosemida EV, usuário crônico", versoes: "PSZ2 p. 20: dose equivalente à prévia (“VO 40 mg equivale a EV 20 mg”). CNP p. 62: 1 a 2,5×. DRG p. 60: 2 a 2,5×. MED p. 40: 1 a 2,5×.", mesmo: "Sim", ref: "SBC 2026: 1 a 2× a dose oral diária total. SBC 2018: equivalente ou o dobro (classe I, nível B).", res: "1 a 2× a dose oral diária (SBC 2026).", st: "Resolvida — aprovada em 10/11/2026" },
    { id: "d3", item: "Furosemida, manutenção e teto", versoes: "PSZ1 p. 16: mesma dose em 24 h. PSZ2 p. 20: conforme volemia. CNP p. 62: 1 ampola 6/6 h (2 se usuário). DRG p. 60: 1 a 2 ampolas 12/12 h; máximo 600 mg/dia.", mesmo: "Sim", ref: "SBC 2026: reavaliar em 6 h; repetir 12/12 h ou dobrar; teto 400 a 600 mg/dia. SBC 2018: 4 a 6 h; máximo 240 mg.", res: "Esquema da SBC 2026.", st: "Resolvida — aprovada em 10/11/2026" },
    { id: "d4", item: "Nitroglicerina, velocidade inicial (solução de 200 mcg/mL)", versoes: "PSZ1 p. 17 e PSZ2 p. 194: 1 a 2 mL/h. CNP p. 62 e DRG p. 52: 2 mL/h, até 45 mL/h. DRG p. 52: inicial 5 mcg/min. PSZ2 p. 21: 5 mL/h (FOSPE); bolus e 30 mL/h (SCAPE).", mesmo: "Em parte: só o PSZ2 separa SCAPE e FOSPE", ref: "SBC 2018, Tabela 2.2: 10 a 20 mcg/min, máximo 200. SBC 2026: sem tabela de dose.", res: "10 a 20 mcg/min (3 a 6 mL/h na solução de 200 mcg/mL). Bolus do PSZ2 mantido com aviso.", st: "Resolvida — aprovada em 10/11/2026" },
    { id: "d5", item: "Nitroprussiato: diluente, início e teto", versoes: "Diluente SG 5% (PSZ2 p. 21) ou SF 0,9% (PSZ2 p. 23, PSZ1 p. 16, CNP p. 62); DRG p. 51: SF ou SG 5%. Início 5 mL/h (PSZ) ou 2 mL/h (CNP, DRG). Teto 10 mcg/kg/min (PSZ2) ou 5 (DRG).", mesmo: "Sim", ref: "SBC 2018, Tabela 2.2: 0,3 a 5 mcg/kg/min. Bula Nitroprus: glicose a 5%, protegido da luz.", res: "Dose da SBC 2018 (aprovada). Diluente SG 5% conforme a bula (aguardando sua aprovação).", st: "Dose resolvida; diluente aguardando aprovação" },
    { id: "d6", item: "Dobutamina: diluente e dose de início", versoes: "Diluente SF 0,9% (PSZ2 p. 22, CNP p. 61, MED p. 16) ou SG 5% (DRG p. 46). Início 2 mL/h (PSZ2, DRG) ou 4 mL/h (CNP) na solução de 4 mg/mL. Faixa 2 a 20 (PSZ2 p. 22, DRG), 2,5 a 20 (PSZ2 p. 194) ou 5 a 20 (MED).", mesmo: "Sim", ref: "SBC 2026, Quadro 7.5: início 0,5 a 1; manutenção 2 a 20 (até 40). SBC 2018: 2,5; máximo 10 a 20. Bulas: glicose 5% e NaCl 0,9% compatíveis.", res: "Início 0,5 a 1 mcg/kg/min (SBC 2026, aprovado). Diluente: os dois são aceitos (aguardando sua aprovação).", st: "Dose resolvida; diluente aguardando aprovação" },
    { id: "d7", item: "Noradrenalina: solução, diluente e faixa", versoes: "16 mg em 250 mL = 64 mcg/mL (PSZ2 p. 194, DRG p. 43, CNP p. 61, MED p. 16); 32 mg em 250 mL (PSZ2 p. 194, DRG p. 43); 20 mg em 200 mL (PSZ1 p. 86; PSZ2 p. 91, em outro contexto). Diluente SG 5% (DRG) ou SF 0,9% (CNP). Faixa até 1 (DRG) ou até 2,0 (PSZ2).", mesmo: "Sim", ref: "SBC 2026, Quadro 7.6: 0,2 a 1,0 mcg/kg/min. SBC 2018: 0,1 a 0,2 de início; máximo 1,0. Bula: diluir em glicose 5%; salina isolada não recomendada.", res: "A calculadora exige escolher a solução preparada. Diluente SG 5% conforme a bula (aguardando sua aprovação).", st: "Aguardando aprovação do diluente" }
  ]
};
if (typeof module !== "undefined") module.exports = CONTEUDO;
