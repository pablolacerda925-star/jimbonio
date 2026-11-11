// CONTEÚDO DO FLUXO — separado da interface. Uma conduta por passo.
// Regra de escolha: resolução já aprovada por você; na dúvida, PS Zerado 2ª edição.
// ---------- Lote 1: peças repetidas do algoritmo de PCR (AHA 2025) ----------
var R_PCR = "AHA 2025, Figura 2 (ACLS-F p. 2)";
function pcrRitmo(choc, nao) {
  return { e: 1, tipo: "pergunta", t: "Depois de 2 min de RCP: ritmo chocável?", ops: [
    { t: "Sim · FV ou TV sem pulso", log: "Ritmo chocável", ir: choc },
    { t: "Não · assistolia ou AESP", sec: 1, log: "Ritmo não chocável", ir: nao },
    { t: "Voltou o pulso", sec: 1, log: "Retorno da circulação espontânea", ir: "rosc" },
    { t: "Encerrar os esforços", sec: 1, log: "Avaliado encerrar os esforços", ir: "parar" }], ref: R_PCR };
}
function pcrChoque(primeiro, ir) {
  return { e: 2, tipo: "acao", t: "Choque", linhas: [primeiro ? "Bifásico: 120 a 200 J (não sabe? o máximo)" : "Bifásico: mesma energia ou maior", "Monofásico: 360 J", "Voltar à RCP na hora, por 2 min"],
    ops: [{ t: "Choquei", log: "Choque", ir: ir }], ref: R_PCR };
}
var FLUXO = {
  versao: "0.3.0-lote1", data: "2026-11-11",
  temas: [{
    id: "pcr", nome: "Parada cardiorrespiratória", curto: "PCR",
    busca: ["pcr", "parada", "parada cardiaca", "parada cardiorrespiratoria", "rcp", "fv", "fibrilacao ventricular", "tv sem pulso", "assistolia", "aesp", "sem pulso", "desfibrilacao", "choque"],
    imediato: 1,
    etapas: ["RCP", "Ritmo", "Choque e drogas", "Causas", "Depois"],
    inicio: "rcp",
    nos: {
      rcp: { e: 0, tipo: "acao", t: "Comece a RCP", linhas: ["100 a 120 por minuto, 5 cm de profundidade", "30 compressões : 2 ventilações, com O₂", "Monitor e desfibrilador"], ops: [{ t: "Comecei", log: "RCP iniciada", ir: "ritmo1" }], ref: R_PCR },
      ritmo1: { e: 1, tipo: "pergunta", t: "Ritmo chocável?", ops: [{ t: "Sim · FV ou TV sem pulso", log: "Ritmo inicial chocável", ir: "ch1" }, { t: "Não · assistolia ou AESP", sec: 1, log: "Ritmo inicial não chocável", ir: "adrN" }], ref: R_PCR },
      // ramo chocável
      ch1: pcrChoque(1, "acesso"),
      acesso: { e: 2, tipo: "acao", t: "RCP por 2 min", linhas: ["Acesso EV ou IO", "Trocar quem comprime a cada 2 min"], ops: [{ t: "Passou 2 min", ir: "ritmo2" }], ref: R_PCR },
      ritmo2: pcrRitmo("ch2", "adrN"),
      ch2: pcrChoque(0, "adrA"),
      adrA: { e: 2, tipo: "med", med: "adrenalinaPcr", ir: "ritmo3" },
      ritmo3: pcrRitmo("ch3", "adrN"),
      ch3: pcrChoque(0, "amio1"),
      amio1: { e: 2, tipo: "med", med: "amiodaronaPcr1", sem: "lido1", ir: "causasC" },
      lido1: { e: 2, tipo: "med", med: "lidocainaPcr1", ir: "causasC" },
      causasC: { e: 3, tipo: "acao", t: "Procure a causa", chips: ["Hipovolemia", "Hipóxia", "Acidose", "Potássio alto ou baixo", "Hipotermia", "Pneumotórax hipertensivo", "Tamponamento", "Intoxicação", "Embolia pulmonar", "Infarto"],
        ops: [{ t: "Continuar", ir: "ritmo4" }], ref: R_PCR },
      ritmo4: pcrRitmo("ch4", "adrN"),
      ch4: pcrChoque(0, "adrB"),
      adrB: { e: 2, tipo: "med", med: "adrenalinaPcr", ir: "ritmo5" },
      ritmo5: pcrRitmo("ch5", "adrN"),
      ch5: pcrChoque(0, "amio2"),
      amio2: { e: 2, tipo: "med", med: "amiodaronaPcr2", sem: "lido2", ir: "ritmo6" },
      lido2: { e: 2, tipo: "med", med: "lidocainaPcr2", ir: "ritmo6" },
      // daqui em diante: adrenalina ciclo sim, ciclo não
      ritmo6: pcrRitmo("ch6", "adrN"),
      ch6: pcrChoque(0, "adrC"),
      adrC: { e: 2, tipo: "med", med: "adrenalinaPcr", ir: "ritmo7" },
      ritmo7: pcrRitmo("ch7", "adrN"),
      ch7: pcrChoque(0, "causasL"),
      causasL: { e: 3, tipo: "acao", t: "Procure a causa", chips: ["Hipovolemia", "Hipóxia", "Acidose", "Potássio alto ou baixo", "Hipotermia", "Pneumotórax hipertensivo", "Tamponamento", "Intoxicação", "Embolia pulmonar", "Infarto"],
        ops: [{ t: "Continuar", ir: "ritmo6" }], ref: R_PCR },
      // ramo não chocável
      adrN: { e: 2, tipo: "med", med: "adrenalinaPcr", ir: "ritmoN1" },
      ritmoN1: pcrRitmo("ch2", "causasN"),
      causasN: { e: 3, tipo: "acao", t: "Procure a causa", linhas: ["Seguir a RCP por 2 min"], chips: ["Hipovolemia", "Hipóxia", "Acidose", "Potássio alto ou baixo", "Hipotermia", "Pneumotórax hipertensivo", "Tamponamento", "Intoxicação", "Embolia pulmonar", "Infarto"],
        ops: [{ t: "Continuar", ir: "ritmoN2" }], ref: R_PCR },
      ritmoN2: pcrRitmo("ch2", "adrN"),
      // saídas
      rosc: { e: 4, tipo: "acao", t: "Voltou a circulação", linhas: ["Cuidados pós-PCR", "Acionar UTI"], ops: [{ t: "Continuar", log: "Encaminhado para cuidados pós-PCR", ir: "fim" }], ref: R_PCR },
      parar: { e: 4, tipo: "acao", t: "Encerrar os esforços?", linhas: ["Sem pulso e sem causa reversível"], ops: [{ t: "Sim, encerrar", log: "Esforços encerrados", ir: "fim" }], ref: R_PCR },
      fim: { e: 4, tipo: "fim", t: "Atendimento registrado" }
    }
  }, {
    id: "taqui", nome: "Taquiarritmia com pulso", curto: "Taquiarritmias",
    busca: ["taquicardia", "taquiarritmia", "palpitacao", "coracao acelerado", "fa", "fibrilacao atrial", "flutter", "tsv", "tpsv", "supraventricular", "tv", "taquicardia ventricular", "torsades", "cardioversao", "wpw"],
    imediato: 1,
    etapas: ["Avaliação", "Ritmo", "Conduta", "Reavaliação", "Destino"],
    inicio: "suporte",
    nos: {
      suporte: { e: 0, tipo: "acao", t: "Primeiro", chips: ["Monitor", "O₂ se hipoxemia", "Acesso venoso", "Pressão e oximetria", "ECG de 12 derivações"], ops: [{ t: "Feito", log: "Monitorização, acesso e ECG", ir: "inst" }, { t: "Depois", sec: 1, ir: "inst" }], ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
      inst: { e: 0, tipo: "sinais", t: "Instável por causa da taquicardia?", var: "inst", chips: ["Hipotensão", "Confusão aguda", "Sinais de choque", "Dor no peito isquêmica", "IC aguda"], sim: "Sim, instável", nao: "Não, estável", irSim: "iRitmo", irNao: "qrs", ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
      // instável: cardioversão
      iRitmo: { e: 1, tipo: "pergunta", t: "Qual o ritmo?", ops: [
        { t: "FA ou flutter", log: "Ritmo: FA ou flutter", ir: "cv200" }, { t: "QRS estreito regular", sec: 1, log: "Ritmo: QRS estreito regular", ir: "cv100" },
        { t: "TV monomórfica", sec: 1, log: "Ritmo: TV monomórfica", ir: "cv100" }, { t: "TV polimórfica", sec: 1, log: "Ritmo: TV polimórfica", ir: "desf" }], ref: "AHA 2025, Figura 7 (ACLS-F p. 5)" },
      cv200: { e: 2, tipo: "acao", t: "Cardioversão sincronizada: 200 J", linhas: ["Sedar se der", "Sincronizar de novo a cada choque"], ops: [{ t: "Reverteu", log: "Cardioversão sincronizada 200 J: reverteu", ir: "destino" }, { t: "Não reverteu", sec: 1, log: "Cardioversão sincronizada 200 J: não reverteu", ir: "cvMais" }], ref: "AHA 2025, Figura 7 (ACLS-F p. 5) · ACLS-T p. 6" },
      cv100: { e: 2, tipo: "acao", t: "Cardioversão sincronizada: 100 J", linhas: ["Sedar se der", "Sincronizar de novo a cada choque"], ops: [{ t: "Reverteu", log: "Cardioversão sincronizada 100 J: reverteu", ir: "destino" }, { t: "Não reverteu", sec: 1, log: "Cardioversão sincronizada 100 J: não reverteu", ir: "cvMais" }], ref: "AHA 2025, Figura 7 (ACLS-F p. 5)" },
      cvMais: { e: 3, tipo: "acao", t: "Aumente a energia e repita", linhas: ["Procurar a causa", "Chamar o cardiologista"], ops: [{ t: "Reverteu", log: "Reverteu com energia maior", ir: "destino" }, { t: "Segue em taquicardia", sec: 1, log: "Refratária à cardioversão", ir: "destino" }], ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
      desf: { e: 2, tipo: "acao", t: "Desfibrilar agora", linhas: ["Choque não sincronizado", "Energia máxima do aparelho"], ops: [{ t: "Choquei", log: "TV polimórfica: desfibrilação", ir: "qt" }], ref: "AHA 2025, TV polimórfica (ACLS-T p. 3-4)" },
      qt: { e: 3, tipo: "pergunta", t: "Volta a repetir. QT longo?", ops: [{ t: "Sim · torsades", log: "TV polimórfica com QT longo", ir: "torsades" }, { t: "Não", sec: 1, log: "TV polimórfica sem QT longo", ir: "poliIsq" }, { t: "Não repetiu", sec: 1, log: "TV polimórfica não recorreu", ir: "destino" }], ref: "AHA 2025, TV polimórfica (ACLS-T p. 3-4)" },
      torsades: { e: 3, tipo: "acao", t: "Torsades", linhas: ["Sulfato de magnésio EV", "Corrigir o potássio", "Suspender droga que alonga o QT"], ops: [{ t: "Feito", log: "Torsades: magnésio, potássio e revisão de drogas", ir: "destino" }], ref: "AHA 2025, TV polimórfica (ACLS-T p. 3-4)" },
      poliIsq: { e: 3, tipo: "acao", t: "Pense em isquemia", linhas: ["Tratar a isquemia", "Não usar magnésio de rotina"], ops: [{ t: "Continuar", ir: "amioPoli" }], ref: "AHA 2025, TV polimórfica (ACLS-T p. 3-4)" },
      amioPoli: { e: 3, tipo: "med", med: "amiodaronaTv", ir: "destino" },
      // estável
      qrs: { e: 1, tipo: "pergunta", t: "Como é o QRS?", ops: [
        { t: "Estreito e regular", log: "QRS estreito e regular", ir: "vagal" }, { t: "Estreito e irregular · FA", sec: 1, log: "QRS estreito e irregular (FA ou flutter)", ir: "wpw" },
        { t: "Largo, regular, monomórfico", sec: 1, log: "QRS largo, regular e monomórfico", ir: "largo" }, { t: "Largo e irregular", sec: 1, log: "QRS largo e irregular", ir: "largoIrr" }, { t: "Largo e polimórfico", sec: 1, log: "TV polimórfica", ir: "desf" }], ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
      // estreito regular
      vagal: { e: 2, tipo: "acao", t: "Manobra vagal", linhas: ["Soprar uma seringa de 10 mL", "Logo depois: deitar e elevar as pernas"], ops: [{ t: "Reverteu", log: "Manobra vagal: reverteu", ir: "destino" }, { t: "Não reverteu", sec: 1, log: "Manobra vagal: não reverteu", ir: "ade6" }], ref: "AHA 2025, QRS estreito (ACLS-T p. 4-5)" },
      ade6: { e: 2, tipo: "med", med: "adenosina6", ir: "rev1" },
      rev1: { e: 3, tipo: "pergunta", t: "Reverteu?", ops: [{ t: "Sim", log: "Adenosina 6 mg: reverteu", ir: "destino" }, { t: "Não", sec: 1, log: "Adenosina 6 mg: não reverteu", ir: "ade12" }], ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
      ade12: { e: 2, tipo: "med", med: "adenosina12", ir: "rev2" },
      rev2: { e: 3, tipo: "pergunta", t: "Reverteu?", ops: [{ t: "Sim", log: "Adenosina 12 mg: reverteu", ir: "destino" }, { t: "Não", sec: 1, log: "Adenosina 12 mg: não reverteu", ir: "metoTsv" }], ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
      metoTsv: { e: 2, tipo: "med", med: "metoprolol", ir: "rev3" },
      rev3: { e: 3, tipo: "pergunta", t: "Reverteu?", ops: [{ t: "Sim", log: "Reverteu com betabloqueador", ir: "destino" }, { t: "Não", sec: 1, log: "Não reverteu com remédio", ir: "cv100" }], ref: "AHA 2025, QRS estreito (ACLS-T p. 4-5)" },
      // estreito irregular: FA e flutter
      wpw: { e: 1, tipo: "pergunta", t: "Pré-excitação (WPW) no ECG?", ops: [{ t: "Não", log: "FA ou flutter sem pré-excitação", ir: "faIc" }, { t: "Sim", sec: 1, log: "FA ou flutter com pré-excitação", ir: "faWpw" }], ref: "AHA 2025, FA e flutter parte 2 (ACLS-T p. 10-11)" },
      faWpw: { e: 2, tipo: "acao", t: "Não bloquear o nó AV", linhas: ["Sem betabloqueador, verapamil, diltiazem, digoxina ou amiodarona", "Fazer cardioversão elétrica"], ops: [{ t: "Continuar", ir: "cv200" }], ref: "AHA 2025, FA e flutter parte 2 (ACLS-T p. 10-11)" },
      faIc: { e: 1, tipo: "pergunta", t: "IC descompensada?", ops: [{ t: "Não", log: "Sem IC descompensada", ir: "metoFa" }, { t: "Sim", sec: 1, log: "Com IC descompensada", ir: "amioFa" }], ref: "AHA 2025, FA e flutter parte 2 (ACLS-T p. 10-11)" },
      metoFa: { e: 2, tipo: "med", med: "metoprolol", ir: "fa48" },
      amioFa: { e: 2, tipo: "med", med: "amiodaronaFa", ir: "amioFaM" },
      amioFaM: { e: 2, tipo: "med", med: "amiodaronaFaManut", ir: "fa48" },
      fa48: { e: 3, tipo: "acao", t: "FA ou flutter", linhas: ["Mais de 48 h ou tempo incerto:", "não reverter sem anticoagular"], ops: [{ t: "Entendi", ir: "destino" }], ref: "AHA 2025, FA e flutter parte 1 (ACLS-T p. 6-8)" },
      // largo
      largo: { e: 2, tipo: "med", med: "amiodaronaTv", ir: "rev4" },
      rev4: { e: 3, tipo: "pergunta", t: "Reverteu?", ops: [{ t: "Sim", log: "Amiodarona: reverteu", ir: "amioTvM" }, { t: "Não", sec: 1, log: "Amiodarona: não reverteu", ir: "cv100" }], ref: "AHA 2025, QRS largo (ACLS-T p. 1-2)" },
      amioTvM: { e: 3, tipo: "med", med: "amiodaronaTvManut", ir: "destino" },
      largoIrr: { e: 2, tipo: "acao", t: "Pode ser FA com pré-excitação", linhas: ["Sem adenosina, verapamil nem diltiazem", "Fazer cardioversão elétrica"], ops: [{ t: "Continuar", ir: "cv200" }], ref: "AHA 2025, QRS largo (ACLS-T p. 1-2) · FA parte 2 (p. 10-11)" },
      destino: { e: 4, tipo: "pergunta", t: "Para onde vai?", ops: [{ t: "UTI", log: "Destino: UTI", ir: "fim", sug: { v: { inst: 1 } } }, { t: "Observação ou enfermaria", log: "Destino: observação ou enfermaria", ir: "fim" }, { t: "Alta", log: "Destino: alta", ir: "fim" }], ref: "Registro do destino (as fontes do lote não trazem critério)" },
      fim: { e: 4, tipo: "fim", t: "Atendimento registrado" }
    }
  }, {
    id: "bradi", nome: "Bradiarritmia", curto: "Bradiarritmias",
    busca: ["bradicardia", "bradiarritmia", "coracao lento", "bav", "bavt", "bloqueio atrioventricular", "sincope", "desmaio", "marca-passo", "marcapasso"],
    imediato: 1,
    etapas: ["Avaliação", "Atropina", "Marca-passo e drogas", "Causa", "Destino"],
    inicio: "inst",
    nos: {
      inst: { e: 0, tipo: "sinais", t: "Bradicardia com instabilidade?", var: "inst", chips: ["Hipotensão", "Confusão aguda", "Sinais de choque", "Dor no peito isquêmica", "IC aguda"], sim: "Sim, instável", nao: "Não, estável", irSim: "suporte", irNao: "obs", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      obs: { e: 0, tipo: "acao", t: "Observar", chips: ["Monitor", "O₂ se precisar", "ECG de 12 derivações"], ops: [{ t: "Continuar", log: "Bradicardia estável: observação", ir: "causa" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      suporte: { e: 0, tipo: "acao", t: "Primeiro", chips: ["Via aérea e O₂", "Monitor", "Acesso venoso", "ECG de 12 derivações"], ops: [{ t: "Feito", log: "Suporte inicial", ir: "atro1" }, { t: "Depois", sec: 1, ir: "atro1" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      atro1: { e: 1, tipo: "med", med: "atropina", ir: "r1" },
      r1: { e: 1, tipo: "pergunta", t: "Melhorou?", ops: [{ t: "Sim", log: "Melhorou com atropina", ir: "causa" }, { t: "Não · repetir atropina", sec: 1, log: "Sem resposta à 1ª atropina", ir: "atro2" }, { t: "Não · ir para o marca-passo", sec: 1, log: "Sem resposta à atropina", ir: "mp" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      atro2: { e: 1, tipo: "med", med: "atropina", ir: "r2" },
      r2: { e: 1, tipo: "pergunta", t: "Melhorou?", ops: [{ t: "Sim", log: "Melhorou com atropina", ir: "causa" }, { t: "Não · repetir atropina", sec: 1, log: "Sem resposta à 2ª atropina", ir: "atro3" }, { t: "Não · ir para o marca-passo", sec: 1, log: "Sem resposta à atropina", ir: "mp" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      atro3: { e: 1, tipo: "med", med: "atropina", ir: "r3" },
      r3: { e: 1, tipo: "pergunta", t: "Melhorou?", ops: [{ t: "Sim", log: "Melhorou com atropina", ir: "causa" }, { t: "Não · já são 3 mg", sec: 1, log: "Sem resposta a 3 mg de atropina", ir: "mp" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      mp: { e: 2, tipo: "acao", t: "Marca-passo transcutâneo", linhas: ["Confirmar a captura pelo pulso"], ops: [{ t: "Capturou", log: "Marca-passo transcutâneo com captura", ir: "tv" }, { t: "Não capturou", sec: 1, log: "Marca-passo transcutâneo sem captura", ir: "adr" }, { t: "Não tem aqui", sec: 1, log: "Marca-passo transcutâneo indisponível", ir: "adr" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · ACLS-B p. 1-3" },
      adr: { e: 2, tipo: "med", med: "adrenalinaInf", sem: "dopa", ir: "tv" },
      dopa: { e: 2, tipo: "med", med: "dopamina", ir: "tv" },
      tv: { e: 2, tipo: "acao", t: "Chame o cardiologista", linhas: ["Marca-passo transvenoso"], ops: [{ t: "Chamei", log: "Cardiologia acionada para marca-passo transvenoso", ir: "causa" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      causa: { e: 3, tipo: "acao", t: "Procure a causa", chips: ["Isquemia ou infarto", "Betabloqueador", "Bloqueador de cálcio", "Digoxina", "Hipóxia", "Potássio alto"], ops: [{ t: "Continuar", ir: "destino" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      destino: { e: 4, tipo: "pergunta", t: "Para onde vai?", ops: [{ t: "UTI", log: "Destino: UTI", ir: "fim", sug: { v: { inst: 1 } } }, { t: "Observação ou enfermaria", log: "Destino: observação ou enfermaria", ir: "fim" }, { t: "Alta", log: "Destino: alta", ir: "fim" }], ref: "Registro do destino (as fontes do lote não trazem critério)" },
      fim: { e: 4, tipo: "fim", t: "Atendimento registrado" }
    }
  }, {
    id: "ic", nome: "Insuficiência cardíaca e edema agudo de pulmão", curto: "IC e EAP", perfil: 1,
    busca: ["ic", "icad", "eap", "icc", "insuficiencia cardiaca", "edema agudo de pulmao", "falta de ar", "dispneia", "ortopneia", "inchaco", "edema", "congestao"],
    imediato: 1, frequente: 1,
    etapas: ["Avaliação", "Perfil", "Conduta", "Reavaliação", "Destino"],
    inicio: "risco",
    nos: {
      risco: { e: 0, tipo: "pergunta", t: "Choque ou insuficiência respiratória?", ops: [{ t: "Sim", set: { risco: 1 }, ir: "riscoAcao" }, { t: "Não", set: { risco: 0 }, ir: "exames" }], ref: "SBC 2026, 7.4.1" },
      riscoAcao: { e: 0, tipo: "acao", t: "Risco imediato", linhas: ["VNI ou via aérea", "Acionar UTI"], ops: [{ t: "Feito", log: "Risco imediato: medidas iniciadas", ir: "exames" }], ref: "SBC 2026, 7.4.1 · PSZ2 p. 20" },
      exames: { e: 0, tipo: "acao", t: "Peça os exames", chips: ["ECG", "RX de tórax", "US pulmonar", "Eco", "BNP ou NT-proBNP", "Troponina", "Na e K", "Creatinina", "Lactato", "Gasometria"],
        ops: [{ t: "Pedidos", log: "Exames solicitados", ir: "cong" }, { t: "Depois", sec: 1, ir: "cong" }], ref: "SBC 2026, Quadro 7.1" },
      cong: { e: 1, tipo: "sinais", t: "Tem congestão?", var: "cong", chips: ["Ortopneia", "Estertores", "Jugular túrgida", "Ascite", "Edema"], sim: "Sim, congesto", nao: "Não", ir: "perf", ref: "SBC 2026, Figura 7.3" },
      perf: { e: 1, tipo: "sinais", t: "Tem baixa perfusão?", var: "perf", chips: ["Pressão de pulso reduzida", "Sonolência", "Extremidades frias", "Pouca diurese"], sim: "Sim, está frio", nao: "Não, está quente", ir: "pas", ref: "SBC 2026, Figura 7.3" },
      pas: { e: 1, tipo: "numero", t: "Qual a PAS?", var: "pas", un: "mmHg", ir: "rota" },
      rota: { tipo: "rota", regras: [{ se: { perfil: "A" }, ir: "a1" }, { se: { perfil: "B" }, ir: "bFuro" }, { se: { perfil: "C", pasMax: 90 }, ir: "cDobu" }, { se: { perfil: "C" }, ir: "cFuro" }, { se: { perfil: "L" }, ir: "lVol" }] },
      a1: { e: 2, tipo: "acao", t: "Compensado", linhas: ["Ajustar a medicação oral"], ops: [{ t: "Continuar", ir: "destino" }], ref: "CNP p. 72" },
      bFuro: { e: 2, tipo: "med", med: "furosemida", ir: "bVni" },
      bVni: { e: 2, tipo: "acao", t: "VNI", linhas: ["PS 12 cmH₂O", "PEEP 6 a 7 cmH₂O"], ops: [{ t: "Coloquei", log: "VNI iniciada", ir: "bRota" }, { t: "Não vou usar", sec: 1, log: "VNI não usada", ir: "bRota" }], ref: "PSZ2 p. 20 e 22" },
      bRota: { tipo: "rota", regras: [{ se: { pasMin: 111 }, ir: "bNtg" }, { se: {}, ir: "reav" }] },
      bNtg: { e: 2, tipo: "med", med: "nitroglicerina", ir: "reav" },
      cDobu: { e: 2, tipo: "med", med: "dobutamina", ir: "cNora", faixa: "UTI" },
      cNora: { e: 2, tipo: "med", med: "noradrenalina", ir: "cFuro2", faixa: "UTI" },
      cFuro2: { e: 2, tipo: "med", med: "furosemida", ir: "reav", faixa: "UTI" },
      cFuro: { e: 2, tipo: "med", med: "furosemida", ir: "cNps", faixa: "UTI" },
      cNps: { e: 2, tipo: "med", med: "nitroprussiato", ir: "reav", faixa: "UTI" },
      lVol: { e: 2, tipo: "acao", t: "Ringer lactato 250 mL EV", linhas: ["Devagar, reavaliando"], ops: [{ t: "Feito", log: "Ringer lactato 250 mL EV", ir: "lReav" }], ref: "CNP p. 75" },
      lReav: { e: 3, tipo: "pergunta", t: "E depois do volume?", ops: [{ t: "Perfusão melhorou", log: "Perfusão melhorou após volume", ir: "destino" }, { t: "Congestionou e segue frio", log: "Congestão e má perfusão após volume", ir: "lDobu" }], ref: "CNP p. 75" },
      lDobu: { e: 2, tipo: "med", med: "dobutamina", ir: "destino" },
      reav: { e: 3, tipo: "reav", t: "Diurese acima de 100 mL/h?", horas: 6, gatilho: "furosemida", pular: "destino",
        ops: [{ t: "Sim", msg: "Repetir a mesma dose a cada 12 h", log: "Diurese adequada em 6 h: repetir a dose a cada 12 h", ir: "destino" },
          { t: "Não", msg: "Dobrar a dose e reavaliar em 6 h", log: "Diurese insuficiente em 6 h: dobrar a dose", ir: "destino" },
          { t: "Ainda não deu 6 h", sec: 1, ir: "destino" }], ref: "SBC 2026, Figura 7.5" },
      destino: { e: 4, tipo: "pergunta", t: "Para onde vai?", ops: [{ t: "UTI", log: "Destino: UTI", ir: "fim", sug: { perfil: "C" }, sug2: "risco" }, { t: "Enfermaria", log: "Destino: enfermaria", ir: "fim" }, { t: "Alta", log: "Destino: alta", ir: "alta" }], ref: "SBC 2026, 7.4.1 e Quadro 7.7" },
      alta: { e: 4, tipo: "acao", t: "Antes da alta", linhas: ["Sem congestão", "Peso e diurético oral estáveis há 48 h", "Sem droga EV há 48 h", "Retorno em 7 a 14 dias"], ops: [{ t: "Confere", log: "Critérios de alta conferidos", ir: "fim" }, { t: "Voltar", sec: 1, ir: "destino" }], ref: "SBC 2026, 7.17" },
      fim: { e: 4, tipo: "fim", t: "Atendimento registrado" }
    }
  }],
  meds: {
    // ----- Lote 1 -----
    adrenalinaPcr: { nome: "Adrenalina EV ou IO", busca: ["adrenalina", "epinefrina"], modo: "fixo", mg: 1, ap: { mg: 1, ml: 1 }, apTxt: "1 mg/mL", linhas: ["Repetir a cada 3 a 5 min", "Pensar em via aérea avançada e capnografia"],
      lembra: { min: 3, t: "Adrenalina de novo a partir das" }, ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · MED p. 11" },
    amiodaronaPcr1: { nome: "Amiodarona EV ou IO · 1ª dose", busca: ["amiodarona", "ancoron"], modo: "fixo", mg: 300, ap: { mg: 150, ml: 3 }, apTxt: "150 mg/3 mL", linhas: ["Em bolus, durante a RCP"], ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · MED p. 37-38" },
    amiodaronaPcr2: { nome: "Amiodarona EV ou IO · 2ª dose", busca: [], modo: "fixo", mg: 150, ap: { mg: 150, ml: 3 }, apTxt: "150 mg/3 mL", linhas: ["Em bolus, durante a RCP"], ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · MED p. 37-38" },
    lidocainaPcr1: { nome: "Lidocaína 2% EV ou IO · 1ª dose", busca: ["lidocaina", "xylocaina"], modo: "kg", mgKg: [1, 1.5], mgMl: 20, linhas: ["Sem vasoconstritor, em bolus"], ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · MED p. 38" },
    lidocainaPcr2: { nome: "Lidocaína 2% EV ou IO · 2ª dose", busca: [], modo: "kg", mgKg: [0.5, 0.75], mgMl: 20, linhas: ["Sem vasoconstritor, em bolus"], ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · MED p. 38" },
    adenosina6: { nome: "Adenosina EV · 1ª dose", busca: ["adenosina", "adenocard"], modo: "fixo", mg: 6, ap: { mg: 6, ml: 2 }, apTxt: "6 mg/2 mL", linhas: ["Bolus rápido em veia do braço", "Logo depois: 20 mL de SF e elevar o braço"], evitar: "Não usar na asma nem em ritmo irregular", ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · ACLS-T p. 5 · PSZ1 p. 7" },
    adenosina12: { nome: "Adenosina EV · 2ª dose", busca: [], modo: "fixo", mg: 12, ap: { mg: 6, ml: 2 }, apTxt: "6 mg/2 mL", linhas: ["Bolus rápido em veia do braço", "Logo depois: 20 mL de SF e elevar o braço"], evitar: "Não usar na asma nem em ritmo irregular", ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · ACLS-T p. 5 · PSZ1 p. 8" },
    metoprolol: { nome: "Metoprolol EV", busca: ["metoprolol", "seloken", "betabloqueador"], modo: "fixo", mg: 5, ap: { mg: 5, ml: 5 }, apTxt: "5 mg/5 mL", linhas: ["Correr em 2 min", "Pode repetir a cada 5 min, até 3 doses"], evitar: "Não usar: IC descompensada, hipotensão, pré-excitação", ref: "AHA 2025, Tabela 2 (ACLS-T p. 11) · PSZ1 p. 10" },
    amiodaronaTv: { nome: "Amiodarona EV · ataque", busca: [], modo: "fixo", mg: 150, ap: { mg: 150, ml: 3 }, apTxt: "150 mg/3 mL", linhas: ["Diluir em 100 mL de SG 5%", "Correr em 10 min · repetir se a TV voltar"], ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · MED p. 38" },
    amiodaronaTvManut: { nome: "Amiodarona EV · manutenção", busca: [], modo: "inf", porKg: 0, un: "mcg/min", prep: "6 ampolas (150 mg/3 mL) + 482 mL SG 5%", conc: 1800, ini: [1000, 1000], passo: "1 mg/min nas primeiras 6 h", ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · PSZ1 p. 10" },
    amiodaronaFa: { nome: "Amiodarona EV · ataque", busca: [], modo: "fixo", mg: 300, ap: { mg: 150, ml: 3 }, apTxt: "150 mg/3 mL", linhas: ["Diluir em 100 mL de SG 5%", "Correr em 1 hora"], evitar: "Não usar na pré-excitação", ref: "AHA 2025, Tabela 2 (ACLS-T p. 11) · PSZ1 p. 10" },
    amiodaronaFaManut: { nome: "Amiodarona EV · manutenção", busca: [], modo: "inf", porKg: 0, un: "mg/h", prep: "6 ampolas (150 mg/3 mL) + 482 mL SG 5%", mgMl: 1.8, ini: [10, 50], max: 50, passo: "Ajustar pela frequência, por 24 h", ref: "AHA 2025, Tabela 2 (ACLS-T p. 11) · PSZ1 p. 10" },
    atropina: { nome: "Atropina EV", busca: ["atropina"], modo: "fixo", mg: 1, ap: { mg: 0.5, ml: 1 }, apTxt: "0,5 mg/mL", linhas: ["Em bolus", "Repetir a cada 3 a 5 min · máximo 3 mg"], lembra: { min: 3, t: "Atropina de novo a partir das" }, ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · MED p. 39" },
    adrenalinaInf: { nome: "Adrenalina EV em bomba", busca: ["adrenalina em bomba", "epinefrina em bomba"], modo: "inf", porKg: 0, un: "mcg/min", prep: "6 ampolas (1 mg/mL) + 94 mL SF 0,9%", conc: 60, ini: [2, 2], max: 10, passo: "Ajustar pela resposta", ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · MED p. 11 e 16" },
    dopamina: { nome: "Dopamina EV em bomba", busca: ["dopamina", "revivan"], modo: "inf", porKg: 1, un: "mcg/kg/min", prep: "5 ampolas (50 mg/10 mL) + 200 mL SF 0,9%", conc: 1000, ini: [5, 5], max: 20, passo: "Ajustar pela resposta · reduzir devagar", ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · PSZ1 p. 87 · MED p. 12 e 16" },
    // ----- IC e EAP -----
    furosemida: { nome: "Furosemida EV", busca: ["furosemida", "lasix", "diuretico"], modo: "furo", mg: 20, ml: 2, linha: "Bolus, sem diluir", semUso: [20, 40], fator: [1, 2], teto: 600, ref: "SBC 2026, 7.5.1 · DRG p. 60" },
    nitroglicerina: { nome: "Nitroglicerina EV", busca: ["nitroglicerina", "tridil"], modo: "inf", porKg: 0, un: "mcg/min", prep: "1 ampola (50 mg/10 mL) + 240 mL SF 0,9%", conc: 200, ini: [10, 20], max: 200, passo: "Subir 3 a 6 mL/h a cada 15 min",
      bolus: { pasMin: 160, t: "Hiperagudo, sem excesso de líquido (SCAPE)?", faixas: [{ de: 160, ate: 179, ml: 3 }, { de: 180, ate: 199, ml: 4 }, { de: 201, ate: 999, ml: 5 }], depois: "Depois: 30 mL/h. Se a PAS não cair, +6 mL/h a cada 10 min" },
      evitar: "Não usar: sildenafila < 24 h, tadalafila < 48 h, IAM de VD", ref: "SBC 2018, Tabela 2.2 · PSZ2 p. 20-21 · DRG p. 52" },
    nitroprussiato: { nome: "Nitroprussiato EV", busca: ["nitroprussiato", "nipride"], modo: "inf", porKg: 1, un: "mcg/kg/min", prep: "1 ampola (50 mg/2 mL) + 248 mL SG 5%", extra: "Proteger da luz", conc: 200, ini: [0.3, 0.3], max: 5, passo: "Subir 0,3 a 0,5 mcg/kg/min a cada 15 min", ref: "SBC 2018, Tabela 2.2 · PSZ2 p. 21 · bula" },
    dobutamina: { nome: "Dobutamina EV", busca: ["dobutamina", "dobutrex"], modo: "inf", porKg: 1, un: "mcg/kg/min", prep: "4 ampolas (250 mg/20 mL) + 170 mL SF 0,9%", conc: 4000, ini: [0.5, 1], manter: [2, 20], max: 20, passo: "Ajustar a cada 10 min", ref: "SBC 2026, Quadro 7.5 · PSZ2 p. 22" },
    noradrenalina: { nome: "Noradrenalina EV", busca: ["noradrenalina", "norepinefrina"], modo: "inf", porKg: 1, un: "mcg/kg/min", prep: "4 ampolas (4 mg/4 mL) + 234 mL SG 5%", extra: "Sempre junto com inotrópico", conc: 64, ini: [0.1, 0.2], max: 1, passo: "Ajustar a cada 15 min · meta PAM 65 a 70", ref: "SBC 2018, Tabela 2.3 · DRG p. 43 · PSZ2 p. 194 · bula" }
  },
  notas: ["Uma conduta por passo. Quando os documentos divergiam, vale a resolução que você aprovou; na dúvida, PS Zerado 2ª edição.",
    "Perfil: um ou mais sinais marcados sugerem “sim”. A decisão é sua.", "PAS até 90 mmHg no perfil C segue pelo caminho do inotrópico.",
    "Nitroglicerina no perfil B só entra com PAS acima de 110 mmHg.",
    "PCR, taquiarritmias e bradiarritmias seguem os algoritmos da AHA de 2025."]
};
if (typeof module !== "undefined") module.exports = FLUXO;
