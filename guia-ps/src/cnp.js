// DOENÇAS DO CARDIOLOGIA NA PRÁTICA 3.0 que não estão no PS Zerado.
// Livro digitalizado: texto lido por OCR e CADA NÚMERO conferido pela imagem da página (pg = página impressa do livro).
// Ficaram de fora a dieta, a glicemia capilar com insulina e o antiemético, que se repetem iguais em todos os capítulos.
var CNP_DOENCAS = (function () {
  function m(t, pg) { return { tipo: "med", t: t, ind: 0, pg: pg }; }
  function l(t, pg) { return { tipo: "li", t: t, ind: 1, pg: pg }; }
  function s(t, pg) { return { tipo: "sub", t: t, ind: 0, pg: pg }; }
  function r(t, pg) { return { tipo: "rot", t: t, ind: 0, pg: pg }; }
  var VASO_PAS_BAIXA = function (pg) { return [
    s("PAS < 90 MMHG", pg),
    m("Noradrenalina (ampola 4 mg/4 mL)", pg), l("SF 0,9% 234 mL + 4 ampolas (16 mL) em bomba de infusão. Paciente de 70 kg: iniciar com 2 a 4 mL/h e aumentar de 2 em 2 mL/h até PAM de 65 a 70 mmHg.", pg), l("Sempre associada à dobutamina.", pg),
    m("Dobutamina (ampola 250 mg/20 mL)", pg), l("SF 0,9% 170 mL + 4 ampolas (80 mL) em bomba de infusão. Paciente de 70 kg: iniciar com 4 mL/h e aumentar de 2 em 2 mL/h até PAM de 65 a 70 mmHg e reversão do choque. Máximo 20 mL/h.", pg),
    l("**Suspender betabloqueador e IECA/BRA** se em uso.", pg)]; };
  var VASO_PAS_ALTA = function (pg) { return [
    s("PAS > 90 MMHG", pg),
    m("Nitroprussiato de sódio (ampola 50 mg/2 mL)", pg), l("SF 0,9% 248 mL + 1 ampola (2 mL) em bomba de infusão. Iniciar com 2 mL/h, subir de 2 em 2 mL/h até vasodilatação mantendo PAM de 65 mmHg. Máximo 45 mL/h.", pg), l("Sempre associado à dobutamina (mesma diluição e dose acima).", pg),
    l("**Reduzir o betabloqueador em 50% e suspender IECA/BRA.**", pg)]; };
  var REFRATARIO = function (pg) { return [
    s("CHOQUE REFRATÁRIO: ASSOCIAR", pg),
    m("Vasopressina (ampola 20 UI/1 mL)", pg), l("SF 0,9% 98 mL + 2 ampolas (2 mL) em bomba de infusão. Iniciar com 2 mL/h; máximo 6 mL/h.", pg),
    m("Adrenalina (ampola 1 mg/1 mL)", pg), l("SF 0,9% 90 mL + 10 ampolas (10 mL) em bomba de infusão. Paciente de 70 kg: iniciar com 2 mL/h e aumentar de 2 em 2 mL/h até PAM de 65 a 70 mmHg.", pg),
    l("Refratário à terapia inicial: considerar balão intra-aórtico, ECMO, Impella ou outro suporte circulatório.", pg)]; };
  var SEDACAO_DISFUNCAO = function (pg) { return [
    s("SEDOANALGESIA (EM VENTILAÇÃO MECÂNICA)", pg), l("Objetivo: RASS 0 a −2 com a menor dose possível. Escolher um sedativo.", pg),
    m("Midazolam (ampola 50 mg/10 mL)", pg), l("2 ampolas (20 mL) + SF 0,9% 80 mL. Iniciar com 2 mL/h; até 20 mL/h.", pg),
    m("Dexmedetomidina (ampola 200 mcg/2 mL)", pg), l("2 ampolas (4 mL) + SF 0,9% 96 mL. Iniciar com 3 mL/h; até 25 mL/h.", pg),
    l("**Propofol é contraindicado na disfunção ventricular.**", pg),
    m("Fentanil (ampola 500 mcg/10 mL)", pg), l("Sem diluir. Manter 1 a 2 mL/h.", pg)]; };
  var SEDACAO_NEURO = function (pg) { return [
    s("SEDOANALGESIA (EM VENTILAÇÃO MECÂNICA)", pg),
    m("Propofol (ampola 200 mg/20 mL)", pg), l("Sem diluir: 5 ampolas (100 mL) na bureta. Iniciar com 2 mL/h; até 20 mL/h, na menor dose que sede.", pg),
    m("Midazolam (ampola 50 mg/10 mL)", pg), l("2 ampolas (20 mL) + SF 0,9% 80 mL. Iniciar com 2 mL/h; até 20 mL/h.", pg),
    m("Fentanil (ampola 500 mcg/10 mL)", pg), l("Sem diluir. Manter 1 a 2 mL/h.", pg)]; };
  var HIC = function (pg, alvo) { return [
    s("SE HIPERTENSÃO INTRACRANIANA", pg),
    l("Decúbito elevado, cabeça centralizada, normotermia e normovolemia.", pg),
    m("Manitol 20% (frasco de 250 mL)", pg), l("**Ataque:** 1 g/kg, sem diluir.", pg), l("**Manutenção:** 0,5 a 1 g/kg EV de 6/6 h, por no máximo 24 horas.", pg),
    { tipo: "forte", t: "OU", ind: 0, pg: pg },
    m("Salina hipertônica a 3%", pg), l("SF 0,9% 890 mL + NaCl 20% 110 mL.", pg), l("150 a 500 mL em 30 minutos. " + alvo, pg)]; };
  var FENITOINA = function (pg, extra) { return [
    m("Fenitoína (ampola 250 mg/5 mL)", pg)].concat((extra || []).map(function (t) { return l(t, pg); }), [
    l("**Dose:** 15 a 20 mg/kg em SF 0,9% 250 mL, a 50 mg/min.", pg), l("**Manutenção:** 100 mg EV de 8/8 h.", pg)]); };
  return [
  { id: "choque-cardiogenico", nome: "Choque cardiogênico", sistema: "Cardiovascular", fonte: "CNP", paginas: [64, 66],
    itens: [].concat(VASO_PAS_BAIXA(64), REFRATARIO(64), VASO_PAS_ALTA(65), SEDACAO_DISFUNCAO(66), [
      m("Furosemida (ampola 20 mg/2 mL)", 66), l("**Sem uso prévio de diurético:** 2 a 3 ampolas EV em bolus; depois 1 ampola de 6/6 h.", 66),
      l("**Usuário crônico:** 1 a 2,5 vezes a dose diária EV em bolus (ex.: usa 40 mg/dia → 40 a 100 mg, 2 a 5 ampolas); depois 2 ampolas de 6/6 h. Objetivo: balanço hídrico zero.", 66)]) },
  { id: "iam-de-ventriculo-direito", nome: "Infarto de ventrículo direito", sistema: "Cardiovascular", fonte: "CNP", paginas: [20, 23],
    itens: [
      l("Oxigênio 2 a 4 L/min se SatO₂ < 90% ou desconforto respiratório.", 20),
      r("Nitrato e morfina são contraindicados no infarto de VD com hipotensão.", 20),
      m("Dinitrato de isossorbida (Isordil) 5 mg SL", 20), l("A cada 5 min, até 15 mg, para a dor.", 20),
      m("Nitroglicerina (ampola 25 mg/5 mL)", 20), l("10 mL + SG 5% 240 mL em bomba de infusão. Iniciar com 3 mL/h; máximo 45 mL/h. Morfina só se a dor for refratária ao nitrato.", 20),
      m("SF 0,9% ou Ringer lactato 250 mL EV", 21), l("Em alíquotas de 250 mL, reavaliando a cada uma. Ao menor sinal de congestão pulmonar, parar. Indicação: PAM < 65 mmHg ou PAS < 90 mmHg.", 21),
      m("Dobutamina (ampola 250 mg/20 mL)", 21), l("Se persistir hipotenso após o volume. SF 0,9% 170 mL + 4 ampolas (80 mL). Paciente de 70 kg: iniciar com 4 mL/h e subir de 2 em 2 mL/h até PAM de 65 a 70 mmHg. Máximo 20 mL/h.", 21),
      s("ANTIPLAQUETÁRIOS", 21),
      m("AAS 150 a 300 mg VO, mastigado, na admissão", 21), l("Depois 100 mg ao dia.", 21),
      m("Clopidogrel", 22), l("**Se fibrinólise:** 300 mg VO (75 mg se 75 anos ou mais); depois 75 mg 1 vez ao dia.", 22), l("**Se cateterismo:** 600 mg VO; depois 75 mg 1 vez ao dia. Preferir se precisar de anticoagulante oral junto.", 22),
      m("Ticagrelor", 22), l("180 mg VO na admissão; depois 90 mg 2 vezes ao dia. Não usar: sangramento ativo, AVC hemorrágico, hepatopatia, inibidor do CYP3A4.", 22),
      m("Prasugrel", 22), l("60 mg VO; depois 10 mg 1 vez ao dia. Só no cateterismo, com anatomia conhecida. Não usar: > 75 anos com peso < 60 kg, AVC ou AIT prévio.", 22),
      s("ANTICOAGULAÇÃO (SE FIBRINÓLISE)", 23),
      m("Enoxaparina · de escolha", 23), l("30 mg EV em bolus; 15 min depois, 1 mg/kg SC de 12/12 h.", 23), l("> 75 anos: sem bolus, 0,75 mg/kg SC de 12/12 h. Clearance 15 a 29: 1 mg/kg SC de 24/24 h. Clearance < 15 ou peso > 100 kg: usar heparina não fracionada.", 23),
      m("Heparina não fracionada (25.000 UI/5 mL)", 23), l("Diluir em SG 5% 250 mL. Ataque 60 UI/kg EV (máximo 4.000 UI); depois 12 UI/kg/h. TTPa de 6/6 h, alvo 1,5 a 2,5 vezes (50 a 70 s).", 23),
      m("Fondaparinux", 23), l("2,5 mg em bolus; depois 2,5 mg SC 1 vez ao dia. Não usar com clearance < 30. Alternativa na plaquetopenia por heparina.", 23),
      l("Se angioplastia: a heparina é feita na hemodinâmica. Manter a anticoagulação até a angioplastia, 8 dias ou a alta.", 23)] },
  { id: "minoca", nome: "MINOCA (infarto sem obstrução coronariana)", sistema: "Cardiovascular", fonte: "CNP", paginas: [28, 30],
    itens: [
      r("Orientação:", 28),
      l("O diagnóstico exige cateterismo. Na chegada, tratar como infarto com ou sem supra, conforme o ECG.", 28),
      l("Definida a causa, tratar a causa. Sem causa definida: AAS 100 mg + clopidogrel 75 mg por 1 ano.", 28),
      s("RUPTURA OU EROSÃO DE PLACA < 50%", 29), l("AAS 100 mg + clopidogrel 75 mg por 1 ano, com estatina de alta potência (rosuvastatina 20 a 40 mg, atorvastatina 40 a 80 mg ou sinvastatina 40 mg + ezetimiba 10 mg).", 29),
      s("TROMBOSE OU EMBOLIA CORONÁRIA: ANTICOAGULAR NA FASE AGUDA", 29),
      m("Enoxaparina · de escolha", 29), l("1 mg/kg SC de 12/12 h (> 75 anos: 0,75 mg/kg). Clearance 15 a 29: 1 mg/kg de 24/24 h. Clearance < 15 ou peso > 100 kg: heparina não fracionada.", 29),
      m("Heparina não fracionada (25.000 UI/5 mL)", 29), l("Em SG 5% 250 mL. Ataque 60 UI/kg EV (máximo 4.000 UI); depois 12 UI/kg/h. TTPa de 6/6 h, alvo 1,5 a 2,5 vezes.", 29),
      m("Fondaparinux", 29), l("2,5 mg SC 1 vez ao dia. Não usar com clearance < 30.", 29),
      s("VASOESPASMO CORONARIANO", 30), l("Parar tabagismo e drogas. **Betabloqueador contraindicado.**", 30),
      m("Nitrato de ação curta (uma opção)", 30), l("Mononitrato de isossorbida 5 mg SL, ou dinitrato de isossorbida 2,5 a 5 mg SL. Repetir a cada 5 min se a dor persistir.", 30),
      m("Nitroglicerina (50 mg/10 mL)", 30), l("Se a dor persistir. 50 mg + SG 5% 240 mL (200 mcg/mL). Iniciar 5 a 10 mcg/min (1,5 a 3 mL/h), subir 10 mcg/min até efeito, hipotensão ou cefaleia. Máximo 60 mL/h.", 30),
      m("Anlodipino 10 mg/dia VO", 30), l("Associar.", 30)] },
  { id: "miocardite", nome: "Miocardite", sistema: "Cardiovascular", fonte: "CNP", paginas: [39, 45],
    itens: [].concat(VASO_PAS_BAIXA(39), REFRATARIO(39), VASO_PAS_ALTA(40), SEDACAO_DISFUNCAO(40), [
      s("ARRITMIA VENTRICULAR NA FASE AGUDA", 43),
      m("Amiodarona (ampola 150 mg/3 mL)", 43), l("TV não sustentada sintomática ou TV sustentada. Se não houver risco alto na sedação, a TV vai para cardioversão sincronizada.", 43),
      l("**Ataque:** 150 mg + SG 5% 100 mL em 10 min. **Manutenção:** 1 mg/min por 6 h e 0,5 mg/min por 18 h (900 mg + SG 5% 500 mL em 24 h).", 43),
      r("Imunossupressor e antiviral:", 41), l("Só depois de biópsia endomiocárdica, com o especialista. Doses no livro, p. 41-42.", 41)]) },
  { id: "avc-isquemico", nome: "AVC isquêmico: prescrição completa", sistema: "Neurológico", fonte: "CNP", paginas: [150, 153],
    itens: [].concat(SEDACAO_NEURO(150), [
      s("PRESSÃO ARTERIAL", 151),
      l("Déficit há **mais de 4h30**: hipertensão permissiva até 220 × 120 mmHg por 24 a 72 h (se emergência hipertensiva, reduzir até o controle clínico).", 151),
      l("Déficit há **até 4h30**, elegível para trombólise e PA ≥ 185 × 110 mmHg: nitroprussiato, aferindo a PA a cada 3 a 5 min, até ≤ 185 × 110; depois manter ≤ 180 × 105 por 24 h.", 151),
      m("Nitroprussiato (ampola 50 mg/2 mL)", 151), l("1 ampola + SG 5% 248 mL. Dose 0,5 a 10 mcg/kg/min.", 151),
      s("TROMBÓLISE (SE ELEGÍVEL)", 151),
      m("Alteplase (frasco 50 mg)", 151), l("0,9 mg/kg (máximo 90 mg): 10% em bolus em 1 min e 90% em bomba por 1 hora.", 151),
      { tipo: "forte", t: "OU", ind: 0, pg: 151 },
      m("Tenecteplase (frasco 50 mg)", 151), l("0,25 mg/kg (máximo 25 mg), dose total em bolus.", 151),
      s("ANTIAGREGAÇÃO E ESTATINA", 152),
      m("AAS 100 mg", 152), l("1 comprimido VO ou SNE ao dia. Se trombólise, só depois da TC de controle em 24 h. Suspender se for anticoagular.", 152),
      m("Clopidogrel 75 mg", 152), l("Se NIHSS ≤ 5 ou AIT com ABCD2 ≥ 4: ataque 300 mg; depois 75 mg/dia por 21 dias (com AAS). Estenose intracraniana: manter os dois por 90 dias.", 152),
      m("Atorvastatina 80 mg", 152), l("1 comprimido à noite. Alternativa: sinvastatina 40 mg.", 152)],
      FENITOINA(152, ["Só se 2 ou mais crises convulsivas."]), HIC(153, "Alvo de sódio até 160 mEq/L."), [
      s("PROFILAXIA", 154), l("Enoxaparina 40 mg SC 1 vez ao dia ou heparina 5.000 UI SC de 12/12 ou 8/8 h. Se trombólise, só depois da TC de controle em 24 h.", 154), l("Glicemia entre 140 e 180 mg/dL.", 154)]) },
  { id: "avc-hemorragico", nome: "AVC hemorrágico", sistema: "Neurológico", fonte: "CNP", paginas: [157, 159],
    itens: [].concat(SEDACAO_NEURO(157), [
      s("PRESSÃO ARTERIAL", 157),
      l("PAS > 220 mmHg: reduzir 15% na 1ª hora, buscando PAS < 220.", 157),
      l("PAS entre 150 e 220 mmHg, sem sinais clínicos ou de imagem de hipertensão intracraniana: reduzir para PAS de 140 (130 a 150) na 1ª hora.", 157),
      m("Nitroprussiato (ampola 50 mg/2 mL)", 157), l("1 ampola + SG 5% 248 mL. Dose 0,5 a 10 mcg/kg/min, titulando pela PAS.", 157)],
      FENITOINA(158, ["Sem profilaxia primária de rotina. Usar se crise clínica ou duvidosa, suspeita de estado de mal não convulsivo ou EEG com crise."]), HIC(158, "Alvo de sódio < 160 mEq/L."), [
      s("PROFILAXIA DE TEV", 159), l("Compressão pneumática intermitente desde o 1º dia.", 159),
      l("Enoxaparina 40 mg SC 1 vez ao dia ou heparina 5.000 UI SC de 12/12 ou 8/8 h **só depois da TC de controle em 48 h**, sem expansão do hematoma (aumento > 6 mL ou > 33%) e com PA estável.", 159)]) },
  { id: "hemorragia-subaracnoidea", nome: "Hemorragia subaracnóidea", sistema: "Neurológico", fonte: "CNP", paginas: [162, 165],
    itens: [].concat(SEDACAO_NEURO(162), [
      m("Nitroprussiato (ampola 50 mg/2 mL)", 162), l("Alvo: PAS de 140 a 160 mmHg ou PAM < 110 mmHg. 1 ampola + SG 5% 248 mL; 0,5 a 10 mcg/kg/min.", 162)],
      FENITOINA(163, ["Profilaxia para todos por 3 a 7 dias após o ictus, mesmo sem crise. Suspender após tratar o aneurisma ou completar 7 dias, se não houve crise.", "Se houve crise: manter e dar alta com anticrise."]), [
      m("Nimodipino 60 mg", 163), l("60 mg VO ou SNE de 4/4 h, do 1º dia até 21 dias após o ictus.", 163),
      s("VASOESPASMO SINTOMÁTICO (CLÍNICO E RADIOLÓGICO)", 163),
      l("Evitar hipovolemia (PVC > 6), manter normotermia, corrigir distúrbios eletrolíticos.", 163),
      m("Milrinone (ampola 10 mg/10 mL)", 163), l("2 ampolas (20 mg) + SG 5% 80 mL. Ataque 0,1 a 0,2 mg/kg em bolus; manutenção 0,75 a 1,25 mcg/kg/min.", 163),
      m("Noradrenalina (ampola 4 mg/4 mL)", 164), l("Se cair a PA: 4 ampolas + SG 5% 234 mL, buscando PAM > 90 mmHg. Não passar de PAS 200 a 220 mmHg.", 164)],
      HIC(164, "Alvo de sódio até 160 mEq/L."), [
      s("PROFILAXIA DE TEV", 165), l("Enoxaparina 40 mg SC 1 vez ao dia ou heparina 5.000 UI SC de 12/12 ou 8/8 h **só depois de tratar o aneurisma** (clipagem ou embolização). Antes disso, compressão pneumática.", 165)]) },
  { id: "crise-epileptica", nome: "Crise epiléptica e estado de mal", sistema: "Neurológico", fonte: "CNP", paginas: [169, 171],
    itens: [
      s("CRISE CONVULSIVA", 169),
      m("Diazepam (ampola 10 mg/2 mL)", 169), l("10 mg EV em bolus (dose máxima); metade em idoso ou IMC < 19. Repetir em 3 a 5 min se voltar. **Não fazer IM.** De escolha, idealmente nos primeiros 5 minutos.", 169),
      { tipo: "forte", t: "OU, sem acesso venoso:", ind: 0, pg: 169 },
      m("Midazolam (ampola 15 mg/3 mL)", 169), l("Peso > 40 kg: 10 mg IM, dose única.", 169),
      s("ESTADO DE MAL CONVULSIVO", 169),
      m("Fenitoína (ampola 250 mg/5 mL)", 169), l("15 a 20 mg/kg em SF 0,9% 250 mL, a 50 mg/min; pode completar até 30 mg/kg no total se persistir.", 169), l("**Manutenção:** 100 mg EV de 8/8 h.", 169),
      l("Iniciar também se 3 ou mais crises em 24 h, ou epiléptico de difícil controle sem fenitoína.", 169),
      m("Fenobarbital (ampola 200 mg/2 mL) · 2ª escolha", 169), l("20 mg/kg em SF 0,9% 250 mL, a 50 a 75 mg/min, se persistir após a fenitoína.", 169),
      s("ESTADO DE MAL REFRATÁRIO (VENTILAÇÃO MECÂNICA)", 170),
      m("Propofol (ampola 200 mg/20 mL)", 170), l("Puro (5 ampolas na bureta). Ataque 1 a 2 mg/kg; manutenção 20 a 200 mcg/kg/min.", 170),
      { tipo: "forte", t: "OU", ind: 0, pg: 170 },
      m("Midazolam (ampola 50 mg/10 mL)", 170), l("2 ampolas + SF 0,9% 80 mL. Ataque 0,2 mg/kg em bolus lento; manutenção 0,05 a 2 mg/kg.", 170),
      m("Fentanil (ampola 500 mcg/10 mL)", 170), l("Sem diluir. Manter 1 a 2 mL/h.", 170),
      s("USO CONTÍNUO", 170),
      m("Fenitoína 100 mg (comprimido)", 170), l("100 mg 2 vezes ao dia; máximo 100 mg 3 vezes ao dia. Crises focais. Evitar a longo prazo, sobretudo em idosos.", 170),
      m("Carbamazepina 200 mg", 170), l("200 mg 2 vezes ao dia; máximo 1.200 mg/dia em 3 tomadas. Crises focais. Não associar à fenitoína.", 170),
      m("Ácido valproico 250 a 500 mg", 170), l("250 mg 2 vezes ao dia; máximo 2.000 mg/dia em 3 tomadas. Crises focais e generalizadas. Não associar à fenitoína.", 170),
      m("Clobazam 10 a 20 mg", 170), l("10 a 20 mg à noite; máximo 60 mg/dia em 3 tomadas. Melhor como associação.", 170),
      m("Fenobarbital (comprimido)", 171), l("100 a 200 mg 1 vez à noite. Crises focais e generalizadas; bom para má adesão.", 171)] }
  ];
})();
if (typeof module !== "undefined") module.exports = CNP_DOENCAS;
