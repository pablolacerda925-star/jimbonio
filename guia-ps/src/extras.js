// COMPLEMENTOS ESCRITOS À MÃO (o resto vem de doencas.js, gerado dos PDFs).
// Cada item tem fonte (ref). Nada aqui sem documento.
var EXTRAS = {
  // Exames com fonte, por doença. Os exames citados no próprio texto do guia são achados automaticamente pela interface.
  exames: {
    "insuficiencia-cardiaca-descompensada-e-edema-agudo-de-pulmao": { ref: "SBC 2026, Quadro 7.1 (p. 64) e seção 7.2 (p. 63)", itens: [
      "ECG (afastar síndrome coronariana e arritmia)", "Radiografia de tórax", "Ultrassom pulmonar", "Ecocardiograma",
      "BNP ou NT-proBNP: BNP < 100 pg/mL ou NT-proBNP < 300 pg/mL afastam IC descompensada", "Troponina (afastar síndrome coronariana)",
      "Sódio e potássio", "Creatinina", "Lactato", "Gasometria ou oximetria",
      "Se suspeita de embolia pulmonar: D-dímero", "Se suspeita de pneumonia: procalcitonina", "Se suspeita de doença da tireoide: TSH"] },
    "sepse-e-choque-septico": { ref: "ILAS, fluxograma de triagem de sepse (ILAS-F)", itens: [
      "Gasometria e lactato arterial", "Hemograma e plaquetas", "Creatinina", "Bilirrubina", "Coagulograma",
      "Duas hemoculturas de sítios diferentes, antes do antimicrobiano se não atrasar a primeira hora", "Culturas de todos os sítios pertinentes ao foco",
      "Segundo lactato, se o primeiro estiver alterado",
      "Critérios de disfunção: creatinina > 2,0 mg/dL; lactato acima da referência; plaquetas < 100.000/mm³ ou INR > 1,5; bilirrubinas > 2 mg/dL"] },
    "taquicardia-supraventricular": { ref: "AHA 2025, Figura 6 (ACLS-F p. 4)", itens: ["ECG de 12 derivações", "Monitorização contínua, pressão e oximetria"] },
    "taquicardia-ventricular": { ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · CNP p. 101 e 103", itens: [
      "ECG de 12 derivações", "Potássio (hipocalemia favorece arritmia ventricular)", "Magnésio (na torsades, dosar a cada 6 h durante a infusão)", "Troponina, se suspeita de síndrome coronariana"] },
    "fibrilacao-atrial-e-flutter": { ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · PSZ2 p. 10", itens: ["ECG de 12 derivações", "Ecocardiograma para afastar trombo antes de reverter o ritmo, se FA há mais de 24 h sem anticoagulação adequada"] },
    "bradiarritmias": { ref: "AHA 2025, Figura 8 (ACLS-F p. 3)", itens: ["ECG de 12 derivações", "Potássio (hipercalemia é causa)", "Troponina (isquemia ou infarto é causa)", "Gasometria ou oximetria (hipóxia é causa)"] },
    "parada-cardiorrespiratoria": { ref: "AHA 2025, Figura 2 (ACLS-F p. 2)", itens: ["Capnografia em onda (qualidade da RCP e posição do tubo)", "Gasometria (acidose)", "Potássio (hipo ou hipercalemia)"] }
  },
  // Onde a diretriz mais recente difere do guia: mostrado como nota logo abaixo do medicamento.
  notas: [
    { doenca: "insuficiencia-cardiaca-descompensada-e-edema-agudo-de-pulmao", med: /^Furosemida/i, t: "SBC 2026: sem uso prévio, 20 ou 40 mg EV; usuário crônico, 1 a 2 vezes a dose oral diária. Reavaliar a diurese em 6 h; teto de 600 mg/dia.", ref: "SBC 2026, 7.5.1 (p. 70) · DRG p. 60" },
    { doenca: "insuficiencia-cardiaca-descompensada-e-edema-agudo-de-pulmao", med: /^Nitroglicerina/i, t: "SBC 2018: começar com 10 a 20 mcg/min (3 a 6 mL/h da solução de 200 mcg/mL); máximo 200 mcg/min. Vasodilatador só com PAS acima de 110 mmHg.", ref: "SBC 2018, Tabela 2.2 · SBC 2026, 7.8" },
    { doenca: "insuficiencia-cardiaca-descompensada-e-edema-agudo-de-pulmao", med: /^Nitroprussiato/i, t: "SBC 2018: 0,3 a 5 mcg/kg/min; diluir em SG 5% e proteger da luz.", ref: "SBC 2018, Tabela 2.2 · bula" },
    { doenca: "insuficiencia-cardiaca-descompensada-e-edema-agudo-de-pulmao", med: /^Dobutamina/i, t: "SBC 2026: começar com 0,5 a 1 mcg/kg/min; manter 2 a 20 mcg/kg/min.", ref: "SBC 2026, Quadro 7.5 (p. 77)" },
    { doenca: "taquicardia-ventricular", med: /^Amiodarona/i, t: "AHA 2025: ataque de 150 mg EV em 10 minutos; repetir se a TV voltar. Manutenção 1 mg/min por 6 h e 0,5 mg/min por 18 h.", ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
    { doenca: "fibrilacao-atrial-e-flutter", med: /^Metoprolol/i, t: "AHA 2025: 2,5 a 5 mg EV em 2 minutos, até 3 doses. Não usar na IC descompensada nem na pré-excitação.", ref: "AHA 2025, Tabela 2 (ACLS-T p. 11)" },
    { doenca: "crise-convulsiva", med: /^Fenito[ií]na/i, t: "Atenção: a dose impressa no guia (5 a 10 mg/kg) é menor que a usada em diretrizes de estado de mal epiléptico. Conferir antes de usar.", ref: "Conferido pela imagem do PSZ1 p. 21; diretriz não acessível nesta versão", alerta: 1 },
    { doenca: "crise-convulsiva", med: /^Fenobarbital/i, t: "Atenção: a dose impressa no guia (10 mg/kg) é menor que a usada em diretrizes de estado de mal epiléptico. Conferir antes de usar.", ref: "Conferido pela imagem do PSZ1 p. 22; diretriz não acessível nesta versão", alerta: 1 },
    { doenca: "sepse-e-choque-septico", med: /^Noradrenalina/i, t: "O guia não traz a diluição aqui: ver \"Aminas vasoativas\".", ref: "PSZ2 p. 155 e 193-194", ver: "aminas-vasoativas" }
  ],
  // Doença que não está no PS Zerado: montada com as fontes do lote 1.
  doencas: [{
    id: "parada-cardiorrespiratoria", nome: "Parada cardiorrespiratória", sistema: "Cardiovascular", fonte: "AHA", paginas: null, ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · DRG p. 88 · MED p. 11 e 37-38",
    itens: [
      { tipo: "rot", t: "RCP de qualidade:", ind: 0 },
      { tipo: "li", t: "Comprimir forte (pelo menos 5 cm) e rápido (100 a 120 por minuto), deixando o tórax voltar.", ind: 1 },
      { tipo: "li", t: "Sem via aérea avançada: 30 compressões para 2 ventilações. Com via aérea avançada: 1 ventilação a cada 6 segundos.", ind: 1 },
      { tipo: "li", t: "Trocar quem comprime a cada 2 minutos. Checar o ritmo a cada 2 minutos.", ind: 1 },
      { tipo: "sub", t: "RITMO CHOCÁVEL (FV OU TV SEM PULSO)", ind: 0 },
      { tipo: "li", t: "**Choque:** bifásico 120 a 200 J (ou a energia máxima, se não souber); monofásico 360 J. Voltar à RCP logo depois.", ind: 1 },
      { tipo: "med", t: "Adrenalina 1 mg/mL", ind: 0 },
      { tipo: "li", t: "1 mg (1 mL) EV ou IO, a partir do 2º choque, a cada 3 a 5 minutos.", ind: 1 },
      { tipo: "med", t: "Amiodarona 150 mg/3 mL", ind: 0 },
      { tipo: "li", t: "**1ª dose:** 300 mg (6 mL, 2 ampolas) em bolus, depois do 3º choque.", ind: 1 },
      { tipo: "li", t: "**2ª dose:** 150 mg (3 mL, 1 ampola).", ind: 1 },
      { tipo: "forte", t: "OU, se não houver amiodarona:", ind: 0 },
      { tipo: "med", t: "Lidocaína 2% sem vasoconstritor (20 mg/mL)", ind: 0 },
      { tipo: "li", t: "**1ª dose:** 1 a 1,5 mg/kg EV ou IO.", ind: 1 },
      { tipo: "li", t: "**2ª dose:** 0,5 a 0,75 mg/kg.", ind: 1 },
      { tipo: "sub", t: "RITMO NÃO CHOCÁVEL (ASSISTOLIA OU AESP)", ind: 0 },
      { tipo: "med", t: "Adrenalina 1 mg/mL", ind: 0 },
      { tipo: "li", t: "1 mg (1 mL) EV ou IO o quanto antes, depois a cada 3 a 5 minutos.", ind: 1 },
      { tipo: "rot", t: "Causas reversíveis:", ind: 0 },
      { tipo: "li", t: "Hipovolemia, hipóxia, acidose (H⁺), hipo ou hipercalemia, hipotermia.", ind: 1 },
      { tipo: "li", t: "Pneumotórax hipertensivo, tamponamento cardíaco, toxinas, trombose pulmonar, trombose coronária.", ind: 1 }] }],
  // Siglas e sinônimos para a busca
  busca: {
    "insuficiencia-cardiaca-descompensada-e-edema-agudo-de-pulmao": "ic icc icad eap edema agudo falta de ar dispneia congestao",
    "taquicardia-supraventricular": "tsv tpsv taquicardia palpitacao adenosina", "taquicardia-ventricular": "tv taquicardia qrs largo",
    "fibrilacao-atrial-e-flutter": "fa flutter arritmia palpitacao", "bradiarritmias": "bradicardia bav bavt bloqueio atropina",
    "sindrome-coronariana-aguda": "sca iam infarto dor toracica dor no peito angina supra", "urgencia-e-emergencia-hipertensiva": "has hipertensao pressao alta crise hipertensiva",
    "trombose-venosa-profunda-e-tromboembolismo-pulmonar": "tvp tep embolia trombose", "trombolise-avc-isquemico": "avc avci derrame trombolise alteplase",
    "dpoc-exacerbada": "dpoc enfisema bronquite", "crise-asmatica": "asma broncoespasmo chiado", "infeccao-do-trato-urinario": "itu cistite pielonefrite infeccao urinaria",
    "cetoacidose-diabetica-e-estado-hiperglicemico-hiperosmolar": "cad ehh cetoacidose diabetes hiperglicemia", "hemorragia-digestiva-alta": "hda hematemese melena sangramento",
    "hemorragia-digestiva-baixa": "hdb hematoquezia enterorragia sangramento", "sepse-e-choque-septico": "sepse choque septico infeccao",
    "parada-cardiorrespiratoria": "pcr parada rcp fv assistolia aesp", "choque-anafilatico": "anafilaxia alergia choque", "crise-convulsiva": "convulsao epilepsia estado de mal crise",
    "ureterolitiase-colica-nefretica": "calculo renal colica renal litiase", "intoxicacao-alcoolica": "alcool embriaguez", "abstinencia-alcoolica": "alcool abstinencia delirium tremens"
  }
};
if (typeof module !== "undefined") module.exports = EXTRAS;
