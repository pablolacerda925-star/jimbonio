// CONTEÚDO CLÍNICO — separado da interface. Todo número, critério e texto clínico mora aqui, com a fonte (ref).
// Uma conduta por situação. Regra de escolha: decisão registrada em docs/02 → diretriz mais recente → PS Zerado 2ª edição.
// Condições (se, classificar, dica) recebem P: P.a(id) achado "p"/"a"; P.o(id) opção; P.n(k) sinal vital;
// P.ex(id) exame {st,r,val}; P.adm(med) nº de doses dadas; P.cont(id) nº de registros; P.r(id) resposta da reavaliação;
// P.p(id) resposta de pergunta "s"/"n"/"ns"; P.tem(lista, k) item marcado numa lista.
var TRI_INST = [
  { id: "hipo", t: "Hipotensão" }, { id: "conf", t: "Alteração aguda da consciência" }, { id: "choque", t: "Sinais de choque" },
  { id: "dor", t: "Dor torácica isquêmica" }, { id: "ica", t: "Insuficiência cardíaca aguda (dispneia)" }];
function instavel(P) { return TRI_INST.some(function (s) { return P.a(s.id) === "p"; }); }
function estavel(P) { return TRI_INST.every(function (s) { return P.a(s.id) === "a"; }); }
var CAUSAS_PCR = ["Hipovolemia", "Hipóxia", "Acidose (H⁺)", "Hipo ou hipercalemia", "Hipotermia", "Pneumotórax hipertensivo", "Tamponamento cardíaco", "Toxinas", "Trombose pulmonar", "Trombose coronária"];
var OSASCO = ["Orientar o paciente sobre o procedimento.", "Sedar: sedoanalgesia leve e de curta duração.", "Ambuzar: via aérea e ventilação com bolsa-válvula-máscara.", "Sincronizar: apertar a tecla Sync do desfibrilador.", "Cardioverter: escolher a carga conforme o ritmo.", "Observar: não tirar as pás do tórax até voltar o ritmo sinusal.",
  "Pás em posição anterolateral ou anteroposterior, com gel, pressionadas com firmeza. Avisar a equipe antes do choque.", "Marca-passo ou CDI: pás a pelo menos 10 cm do aparelho.", "Gestante: a cardioversão é segura para o feto e não deve atrasar."];

var FLUXO = {
  versao: "0.5.0", data: "2026-11-11",
  vitais: [{ k: "pas", t: "PAS", un: "mmHg", min: 30, max: 300 }, { k: "pad", t: "PAD", un: "mmHg", min: 10, max: 200 }, { k: "fc", t: "FC", un: "bpm", min: 10, max: 300 },
    { k: "fr", t: "FR", un: "irpm", min: 2, max: 80 }, { k: "sat", t: "SpO₂", un: "%", min: 30, max: 100 }, { k: "temp", t: "Temp.", un: "°C", min: 25, max: 45 }, { k: "peso", t: "Peso", un: "kg", min: 20, max: 300 }],
  temas: [
  // ============================== PARADA CARDIORRESPIRATÓRIA ==============================
  {
    id: "pcr", nome: "Parada cardiorrespiratória", curto: "PCR",
    busca: ["pcr", "parada", "parada cardiaca", "parada cardiorrespiratoria", "rcp", "fv", "fibrilacao ventricular", "tv sem pulso", "assistolia", "aesp", "sem pulso", "nao respira", "inconsciente", "desfibrilacao"],
    sobre: "RCP de qualidade sem interrupção, choque precoce no ritmo chocável, adrenalina a cada 3 a 5 minutos e busca da causa reversível. O ritmo é checado a cada 2 minutos.", refSobre: "AHA 2025, Figura 2 (ACLS-F p. 2) · DRG p. 88",
    agora: [
      { id: "rcp", t: "Iniciar RCP", como: ["Comprimir forte (pelo menos 5 cm) e rápido (100 a 120 por minuto), deixando o tórax voltar.", "Minimizar as interrupções. Evitar ventilação excessiva.", "Trocar quem comprime a cada 2 minutos, ou antes se cansar.", "Sem via aérea avançada: 30 compressões para 2 ventilações.", "Capnografia em onda: se o ETCO₂ estiver baixo ou caindo, rever a qualidade da RCP."], ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" },
      { id: "vent", t: "Ventilar com bolsa-válvula-máscara e oxigênio", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" },
      { id: "monitor", t: "Colocar monitor e desfibrilador", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" },
      { id: "acesso", t: "Acesso EV ou IO", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" },
      { id: "via", t: "Considerar via aérea avançada e capnografia", como: ["Tubo endotraqueal ou dispositivo supraglótico.", "Capnografia em onda para confirmar e monitorar a posição do tubo.", "Com via aérea avançada: 1 ventilação a cada 6 segundos (10 por minuto), com compressões contínuas."], ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" }],
    investigar: [
      { id: "ritmo", tipo: "opc", decide: 1, t: "Ritmo", ops: [{ v: "choc", t: "Chocável · FV ou TV sem pulso" }, { v: "nchoc", t: "Não chocável · assistolia ou AESP" }], como: ["Checar o ritmo a cada 2 minutos de RCP e atualizar aqui."], ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" },
      { id: "causas", tipo: "tri", t: "Causa reversível identificada", sinais: CAUSAS_PCR, como: ["Procurar e tratar durante a RCP os 5 H e os 5 T. Toque na causa encontrada."], ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · DRG p. 88" }],
    exames: [
      { id: "gaso", t: "Gasometria e potássio", por: "acidose e distúrbio do potássio são causas reversíveis", res: [{ v: "acid", t: "Acidose" }, { v: "kalto", t: "Potássio alto" }, { v: "kbaixo", t: "Potássio baixo" }, { v: "normal", t: "Sem alteração" }], ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" }],
    classificar: function (P) {
      var r = P.o("ritmo"), it = [], falta = [];
      if (P.r("ritmo2") === "rosc") it.push({ t: "Situação", v: "Retorno da circulação espontânea" });
      else if (r) it.push({ t: "Ritmo", v: r === "choc" ? "Chocável (FV ou TV sem pulso)" : "Não chocável (assistolia ou AESP)" });
      else falta.push("Ritmo no monitor");
      return { itens: it, falta: falta };
    },
    passos: [
      { id: "choc", t: "Ritmo chocável: choque e RCP", se: function (P) { return P.o("ritmo") === "choc" && P.r("ritmo2") !== "rosc"; }, porque: "FV ou TV sem pulso.", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)",
        dica: function (P) { var c = P.cont("choque"), a = P.adm("adrenalinaPcr"), am = P.adm("amiodaronaPcr") + P.adm("lidocainaPcr");
          if (c === 0) return "Dar o 1º choque e voltar à RCP por 2 minutos. Pegar acesso EV ou IO.";
          if (c === 1) return "RCP por 2 minutos. Se seguir chocável: 2º choque e, depois dele, adrenalina.";
          if (c === 2 && a === 0) return "Depois do 2º choque: adrenalina 1 mg. Considerar via aérea avançada.";
          if (c >= 3 && am === 0) return "Depois do 3º choque: amiodarona 300 mg. Tratar causas reversíveis.";
          if (c >= 5 && am === 1) return "Segunda dose do antiarrítmico: amiodarona 150 mg. Adrenalina a cada 3 a 5 minutos.";
          return "Seguir: choque a cada 2 minutos se chocável, adrenalina a cada 3 a 5 minutos, tratar causas."; },
        itens: [
          { id: "choque", tipo: "acao", rep: "Registrar choque", t: "Choque", como: ["Bifásico: energia recomendada pelo fabricante (por exemplo, 120 a 200 J). Se não souber, usar a máxima.", "Choques seguintes: energia igual; pode-se considerar maior.", "Monofásico: 360 J.", "Voltar à RCP logo depois do choque, por 2 minutos."], ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" },
          { tipo: "med", med: "adrenalinaPcr", nota: "depois do 2º choque; repetir a cada 3 a 5 min" },
          { tipo: "med", med: "amiodaronaPcr", nota: "depois do 3º choque: 300 mg; segunda dose: 150 mg" },
          { tipo: "med", med: "lidocainaPcr", nota: "só se não houver amiodarona" }] },
      { id: "nchoc", t: "Ritmo não chocável: adrenalina e RCP", se: function (P) { return P.o("ritmo") === "nchoc" && P.r("ritmo2") !== "rosc"; }, porque: "Assistolia ou atividade elétrica sem pulso.", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)",
        dica: function (P) { return P.adm("adrenalinaPcr") === 0 ? "Adrenalina 1 mg o quanto antes. RCP por 2 minutos e checar o ritmo." : "RCP por 2 minutos, tratar causas reversíveis, adrenalina a cada 3 a 5 minutos."; },
        itens: [
          { tipo: "med", med: "adrenalinaPcr", nota: "o quanto antes; repetir a cada 3 a 5 min" },
          { id: "causa", tipo: "acao", t: "Procurar e tratar causas reversíveis", como: CAUSAS_PCR, ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · DRG p. 88" }] },
      { id: "rosc", t: "Voltou a circulação", se: function (P) { return P.r("ritmo2") === "rosc"; }, porque: "Pulso presente.", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)",
        itens: [{ id: "pos", tipo: "acao", t: "Iniciar cuidados pós-PCR e acionar a UTI", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" }] }],
    reav: [
      { id: "ritmo2", t: "Checagem do ritmo (a cada 2 minutos)", se: function (P) { return !!P.o("ritmo"); }, ref: "AHA 2025, Figura 2 (ACLS-F p. 2)", repete: 1,
        ops: [{ v: "choc", t: "Chocável", prox: "Choque e RCP por 2 minutos.", set: { ritmo: "choc" } }, { v: "nchoc", t: "Não chocável", prox: "Seguir a RCP por 2 minutos. Adrenalina a cada 3 a 5 minutos e tratar causas.", set: { ritmo: "nchoc" } },
          { v: "rosc", t: "Voltou o pulso", prox: "Cuidados pós-PCR." }, { v: "fim", t: "Esforços encerrados", prox: "Registrar o horário e comunicar a família." }] }],
    alertas: [],
    destino: { ops: [{ v: "uti", t: "UTI" }, { v: "obito", t: "Óbito" }], ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" }
  },
  // ============================== TAQUIARRITMIA COM PULSO ==============================
  {
    id: "taqui", nome: "Taquiarritmia com pulso", curto: "Taquiarritmias",
    busca: ["taquicardia", "taquiarritmia", "palpitacao", "coracao acelerado", "fa", "fibrilacao atrial", "flutter", "tsv", "tpsv", "supraventricular", "tv", "taquicardia ventricular", "torsades", "cardioversao", "wpw"],
    sobre: "Primeiro decidir se o paciente está instável por causa da taquicardia. Instável: cardioversão elétrica sincronizada. Estável: tratar conforme o ritmo no ECG.", refSobre: "AHA 2025, Figura 6 (ACLS-F p. 4) · CNP p. 77",
    agora: [
      { id: "monitor", t: "Monitorizar (ritmo, pressão e oximetria)", ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · CNP p. 77" },
      { id: "o2", t: "Oxigênio se saturação abaixo de 90%", ref: "CNP p. 77 · AHA 2025, Figura 6" },
      { id: "acesso", t: "Acesso venoso periférico", ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
      { id: "ecg", t: "ECG de 12 derivações", ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" }],
    gravidade: { t: "Sinais de instabilidade", itens: TRI_INST, como: ["Um sinal presente já define instabilidade, desde que a taquicardia seja a causa (a frequência costuma ser de 150 por minuto ou mais).", "Se a taquicardia for consequência de outro problema (por exemplo, sepse), tratar o problema de base."], ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · ACLS-T p. 5" },
    investigar: [
      { id: "ritmo", tipo: "opc", decide: 1, t: "Ritmo no ECG", ops: [{ v: "sinusal", t: "Sinusal" }, { v: "estreito", t: "QRS estreito e regular (TPSV)" }, { v: "fa", t: "FA ou flutter" }, { v: "tv", t: "QRS largo, regular, monomórfico" }, { v: "largoirr", t: "QRS largo e irregular" }, { v: "poli", t: "TV polimórfica" }],
        como: ["QRS largo: 0,12 segundo ou mais.", "Sinusal: onda P positiva em D1, D2 e aVF e negativa em aVR.", "TV polimórfica: o QRS muda de forma a cada batimento."], ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · CNP p. 87" },
      { id: "wpw", tipo: "tri", decide: 1, t: "Pré-excitação (WPW)", se: function (P) { return P.o("ritmo") === "fa"; }, como: ["Na FA ou flutter com pré-excitação, bloquear o nó AV pode acelerar a resposta ventricular e levar à fibrilação ventricular."], ref: "AHA 2025 (ACLS-T p. 10-11)" },
      { id: "ic", tipo: "tri", decide: 1, t: "IC descompensada ou fração de ejeção reduzida", se: function (P) { return P.o("ritmo") === "fa"; }, como: ["Betabloqueador EV e bloqueador de canal de cálcio não devem ser usados na disfunção sistólica com IC descompensada."], ref: "AHA 2025 (ACLS-T p. 10-11) · DRG p. 64" },
      { id: "t48", tipo: "tri", decide: 1, t: "Início há mais de 48 h ou tempo incerto", se: function (P) { return P.o("ritmo") === "fa"; }, como: ["Reverter FA ou flutter com mais de 48 h sem anticoagulação traz risco de embolia."], ref: "AHA 2025 (ACLS-T p. 6-8) · DRG p. 62" },
      { id: "qt", tipo: "tri", decide: 1, t: "QT longo", se: function (P) { return P.o("ritmo") === "poli"; }, como: ["Torsades de pointes: TV polimórfica com QT prolongado (QT corrigido em geral acima de 500 ms)."], ref: "CNP p. 103 · AHA 2025 (ACLS-T p. 3)" }],
    exames: [
      { id: "k", t: "Potássio", por: "hipocalemia favorece arritmia ventricular e torsades", res: [{ v: "alto", t: "Alto" }, { v: "normal", t: "Normal" }, { v: "baixo", t: "Baixo" }], ref: "CNP p. 102-103" },
      { id: "mg", t: "Magnésio", por: "hipomagnesemia pode estar associada a torsades", res: [{ v: "alto", t: "Alto" }, { v: "normal", t: "Normal" }, { v: "baixo", t: "Baixo" }], ref: "CNP p. 103" },
      { id: "tropo", t: "Troponina", por: "síndrome coronariana é causa de TV", res: [{ v: "elev", t: "Elevada" }, { v: "normal", t: "Normal" }], ref: "CNP p. 101" }],
    classificar: function (P) {
      var it = [], falta = [], r = P.o("ritmo"), N = { sinusal: "Taquicardia sinusal", estreito: "QRS estreito e regular", fa: "FA ou flutter", tv: "QRS largo regular monomórfico", largoirr: "QRS largo e irregular", poli: "TV polimórfica" };
      if (instavel(P)) it.push({ t: "Estabilidade", v: "Instável", porque: "Há sinal de instabilidade marcado como presente." });
      else if (estavel(P)) it.push({ t: "Estabilidade", v: "Estável", porque: "Todos os sinais de instabilidade avaliados e ausentes." });
      else falta.push("Sinais de instabilidade (marcar presente ou ausente)");
      if (r) it.push({ t: "Ritmo", v: N[r] }); else falta.push("Ritmo no ECG");
      if (r === "fa" && !instavel(P)) { if (!P.a("wpw")) falta.push("Pré-excitação (WPW)"); if (!P.a("ic")) falta.push("IC descompensada"); }
      if (r === "poli" && !P.a("qt")) falta.push("QT longo");
      return { itens: it, falta: falta };
    },
    passos: [
      { id: "cve", t: "Cardioversão elétrica sincronizada", se: function (P) { var r = P.o("ritmo"); return r !== "poli" && r !== "sinusal" && (instavel(P) || r === "largoirr" || (r === "fa" && P.a("wpw") === "p")); },
        porque: "Instabilidade, ou FA com pré-excitação (cardioversão independentemente da estabilidade).", ref: "AHA 2025, Figura 7 (ACLS-F p. 5) · CNP p. 78-83 e 104",
        dica: function (P) { var r = P.o("ritmo"); return r === "fa" || r === "largoirr" ? "Carga inicial: 200 J, sincronizado." : r === "estreito" || r === "tv" ? "Carga inicial: 100 J, sincronizado." : "Carga inicial: FA e flutter 200 J; QRS estreito regular e TV monomórfica 100 J."; },
        itens: [
          { id: "prep", tipo: "acao", t: "Preparar a cardioversão (OSASCO)", como: OSASCO, ref: "CNP p. 79-80" },
          { tipo: "med", med: "midazolam", nota: "sedação leve" }, { tipo: "med", med: "fentanil", nota: "analgesia" },
          { id: "choque", tipo: "acao", rep: "Registrar choque", t: "Choque sincronizado", como: ["FA: 200 J. Flutter: 200 J. QRS estreito regular: 100 J. TV monomórfica: 100 J.", "Se não reverter: apertar Sync de novo e aumentar a carga.", "Se a sincronização atrasar e o quadro for crítico: choque não sincronizado."], ref: "AHA 2025, Figura 7 (ACLS-F p. 5) · CNP p. 82" },
          { tipo: "info", t: "Com pré-excitação: não usar adenosina, betabloqueador, verapamil, diltiazem, digital nem amiodarona.", se: function (P) { return P.o("ritmo") === "largoirr" || P.a("wpw") === "p"; } }] },
      { id: "poli", t: "TV polimórfica: desfibrilar", se: function (P) { return P.o("ritmo") === "poli"; }, porque: "O aparelho não consegue sincronizar com QRS de formas diferentes.", ref: "AHA 2025 (ACLS-T p. 3-4) · CNP p. 102-103",
        itens: [
          { id: "desf", tipo: "acao", rep: "Registrar choque", t: "Desfibrilação (choque não sincronizado)", como: ["Energia máxima do aparelho.", "Sedar antes se o estado de consciência exigir."], ref: "AHA 2025 (ACLS-T p. 3-4)" },
          { tipo: "med", med: "magnesio", nota: "QT longo (torsades)", se: function (P) { return P.a("qt") === "p"; } },
          { id: "k", tipo: "acao", t: "Corrigir o potássio (alvo 4,5 mEq/L) e suspender droga que alonga o QT", se: function (P) { return P.a("qt") === "p"; }, ref: "CNP p. 103 · AHA 2025 (ACLS-T p. 4)" },
          { id: "isq", tipo: "acao", t: "Tratar isquemia miocárdica", se: function (P) { return P.a("qt") === "a"; }, ref: "AHA 2025 (ACLS-T p. 3-4)" },
          { tipo: "med", med: "amiodaronaTvManut", nota: "prevenir recorrência sem QT longo", se: function (P) { return P.a("qt") === "a"; } },
          { tipo: "info", t: "Sem QT longo, magnésio de rotina não é recomendado.", se: function (P) { return P.a("qt") === "a"; } }] },
      { id: "sinusal", t: "Taquicardia sinusal: tratar a causa", se: function (P) { return P.o("ritmo") === "sinusal"; }, porque: "A taquicardia é resposta a outro problema.", ref: "CNP p. 87",
        itens: [{ id: "causa", tipo: "acao", t: "Procurar a causa", como: ["Isquemia coronária, embolia pulmonar, sepse, pneumonia.", "Hipervolemia, hipovolemia, anemia.", "Hipertireoidismo, febre, dor ou ansiedade."], ref: "CNP p. 87" }] },
      { id: "tpsv", t: "QRS estreito e regular, estável", se: function (P) { return P.o("ritmo") === "estreito" && !instavel(P); }, porque: "Taquicardia paroxística supraventricular provável.", ref: "AHA 2025 (ACLS-T p. 4-5) · CNP p. 88-89",
        dica: function (P) { return P.cont("vagal") === 0 ? "Começar pela manobra vagal modificada." : P.adm("adenosina") === 0 ? "Sem reversão: adenosina 6 mg." : P.adm("adenosina") === 1 ? "Sem reversão: adenosina 12 mg." : "Sem reversão: metoprolol. Se persistir, rever o diagnóstico e avaliar cardioversão sincronizada."; },
        itens: [
          { id: "vagal", tipo: "acao", rep: "Registrar manobra", t: "Manobra vagal modificada", como: ["Sentado a 45°, soprar uma seringa vazia de 20 mL por 15 segundos, tentando empurrar o êmbolo.", "Em seguida deitar a 0° e elevar as pernas a 45° por 15 segundos.", "Observar o monitor.", "Massagem do seio carotídeo: cautela, pode causar AVC em quem tem doença carotídea."], ref: "CNP p. 88 · AHA 2025 (ACLS-T p. 5)" },
          { tipo: "med", med: "adenosina", nota: "6 mg; se não reverter, 12 mg", se: function (P) { return P.p("asma") !== "s"; } },
          { tipo: "info", t: "Adenosina contraindicada: paciente com asma. Seguir para o metoprolol.", se: function (P) { return P.p("asma") === "s"; } },
          { tipo: "med", med: "metoprolol", nota: "se persistir depois da adenosina" },
          { id: "cv", tipo: "acao", t: "Persistiu: rever o diagnóstico e avaliar cardioversão sincronizada (100 J)", ref: "AHA 2025 (ACLS-T p. 4-5) · CNP p. 89" }] },
      { id: "fa", t: "FA ou flutter estável: controle da frequência", se: function (P) { return P.o("ritmo") === "fa" && !instavel(P) && P.a("wpw") === "a"; }, porque: "Sem instabilidade e sem pré-excitação.", ref: "AHA 2025, Tabela 2 (ACLS-T p. 10-11) · DRG p. 62 e 64",
        itens: [
          { tipo: "med", med: "metoprolol", nota: "primeira escolha sem IC descompensada", se: function (P) { return P.a("ic") === "a"; } },
          { tipo: "med", med: "amiodaronaFa", nota: "com IC descompensada: ataque", se: function (P) { return P.a("ic") === "p"; } },
          { tipo: "med", med: "amiodaronaFaManut", nota: "depois do ataque", se: function (P) { return P.a("ic") === "p"; } },
          { tipo: "info", t: "Mais de 48 h ou tempo incerto: não reverter o ritmo sem anticoagulação.", se: function (P) { return P.a("t48") !== "a"; } },
          { id: "antic", tipo: "acao", t: "Avaliar anticoagulação (CHA₂DS₂-VASc)", ref: "CNP p. 109" }] },
      { id: "tv", t: "QRS largo regular monomórfico, estável", se: function (P) { return P.o("ritmo") === "tv" && !instavel(P); }, porque: "Taquicardia ventricular monomórfica provável.", ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · CNP p. 100-101",
        itens: [
          { tipo: "med", med: "amiodaronaTv", nota: "ataque" }, { tipo: "med", med: "amiodaronaTvManut", nota: "manutenção depois de reverter" },
          { id: "cv", tipo: "acao", t: "Não reverteu: cardioversão sincronizada (100 J)", ref: "AHA 2025 (ACLS-T p. 1-2)" },
          { id: "causa", tipo: "acao", t: "Investigar a causa", como: ["Síndrome coronariana aguda, doença cardíaca estrutural, doença de Chagas, miocardite.", "QT longo congênito ou por medicação, síndrome de Brugada.", "Hipocalemia e remédios que a causam (hidroclorotiazida, furosemida)."], ref: "CNP p. 101" },
          { tipo: "info", t: "Não usar verapamil nem diltiazem em taquicardia de QRS largo." }] }],
    reav: [
      { id: "rev", t: "Depois da intervenção: reverteu?", se: function (P) { return !!P.o("ritmo"); }, ref: "AHA 2025, Figura 6 (ACLS-F p. 4)", repete: 1,
        ops: [{ v: "sim", t: "Reverteu", prox: "Manter monitorizado, repetir o ECG e definir o destino." }, { v: "nao", t: "Não reverteu", prox: "Seguir para o próximo item da conduta. Se refratária: procurar a causa, aumentar a energia, associar antiarrítmico e chamar o cardiologista." },
          { v: "piorou", t: "Ficou instável", prox: "Atualizar os sinais de instabilidade: a conduta passa a ser cardioversão sincronizada." }, { v: "sempulso", t: "Perdeu o pulso", prox: "Iniciar RCP." }] }],
    alertas: [{ id: "pcr", se: function (P) { return P.r("rev") === "sempulso"; }, t: "Sem pulso: seguir o fluxo de parada cardiorrespiratória", porque: "Foi registrado que o paciente perdeu o pulso.", ir: "pcr" }],
    destino: { ops: [{ v: "uti", t: "UTI" }, { v: "obs", t: "Observação ou enfermaria" }, { v: "alta", t: "Alta" }], notas: ["TPSV revertida e estável: pode ter alta com betabloqueador oral e encaminhamento ao cardiologista para avaliar ablação."], ref: "CNP p. 89" }
  },
  // ============================== BRADIARRITMIA ==============================
  {
    id: "bradi", nome: "Bradiarritmia", curto: "Bradiarritmias",
    busca: ["bradicardia", "bradiarritmia", "coracao lento", "bav", "bavt", "bloqueio atrioventricular", "sincope", "desmaio", "tontura", "marca-passo", "marcapasso"],
    sobre: "Frequência em geral abaixo de 50 por minuto. Tratar só se houver instabilidade causada pela bradicardia, e procurar a causa ao mesmo tempo.", refSobre: "AHA 2025, Figura 8 (ACLS-F p. 3) · ACLS-B p. 1",
    agora: [
      { id: "via", t: "Via aérea pérvia e oxigênio se necessário", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      { id: "monitor", t: "Monitor cardíaco, pressão e oximetria", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      { id: "acesso", t: "Acesso venoso", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      { id: "ecg", t: "ECG de 12 derivações", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" }],
    gravidade: { t: "Sinais de instabilidade", itens: TRI_INST, como: ["Um sinal presente, causado pela bradicardia, define instabilidade."], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
    investigar: [
      { id: "causas", tipo: "tri", t: "Causa provável identificada", sinais: ["Isquemia ou infarto", "Betabloqueador", "Bloqueador de canal de cálcio", "Digoxina", "Hipóxia", "Hipercalemia"], como: ["A bradicardia pode não resolver sem tratar a causa. Toque na causa encontrada."], ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · ACLS-B p. 1" }],
    exames: [
      { id: "k", t: "Potássio", por: "hipercalemia é causa de bradicardia", res: [{ v: "alto", t: "Alto" }, { v: "normal", t: "Normal" }, { v: "baixo", t: "Baixo" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      { id: "tropo", t: "Troponina", por: "isquemia ou infarto é causa de bradicardia", res: [{ v: "elev", t: "Elevada" }, { v: "normal", t: "Normal" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" }],
    classificar: function (P) {
      if (instavel(P)) return { itens: [{ t: "Estabilidade", v: "Instável", porque: "Há sinal de instabilidade marcado como presente." }], falta: [] };
      if (estavel(P)) return { itens: [{ t: "Estabilidade", v: "Estável", porque: "Todos os sinais de instabilidade avaliados e ausentes." }], falta: [] };
      return { itens: [], falta: ["Sinais de instabilidade (marcar presente ou ausente)"] };
    },
    passos: [
      { id: "est", t: "Bradicardia estável: observar", se: function (P) { return estavel(P); }, porque: "Sem sinal de instabilidade.", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)",
        itens: [{ id: "obs", tipo: "acao", t: "Manter monitorizado e tratar a causa", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" }] },
      { id: "inst", t: "Bradicardia instável", se: function (P) { return instavel(P); }, porque: "Comprometimento cardiopulmonar pela bradicardia.", ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · CNP p. 115-116",
        dica: function (P) { var a = P.adm("atropina"); return a === 0 ? "Atropina 1 mg em bolus." : P.r("resp") === "sim" ? "Respondeu: manter monitorizado e tratar a causa." : a < 3 ? "Sem resposta: repetir atropina a cada 3 a 5 minutos (máximo 3 mg) ou passar ao marca-passo transcutâneo e à adrenalina." : "Atropina no máximo (3 mg): marca-passo transcutâneo e/ou adrenalina em bomba."; },
        itens: [
          { tipo: "med", med: "atropina", nota: "1 mg; repetir a cada 3 a 5 min; máximo 3 mg" },
          { id: "mptc", tipo: "acao", t: "Marca-passo transcutâneo, se a atropina não resolver", como: ["Confirmar a captura elétrica e mecânica (pulso).", "Fazer analgesia: o estímulo é doloroso.", "Sem acesso venoso e com choque: pode ser iniciado de imediato."], ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · ACLS-B p. 1-3 · CNP p. 116" },
          { tipo: "med", med: "adrenalinaInf", nota: "se a atropina não resolver" },
          { tipo: "med", med: "dopamina", nota: "só se não houver adrenalina" },
          { id: "tv", tipo: "acao", t: "Chamar o cardiologista e providenciar marca-passo transvenoso", ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · CNP p. 116" }] }],
    reav: [
      { id: "resp", t: "Depois da intervenção: melhorou?", se: function (P) { return instavel(P); }, ref: "AHA 2025, Figura 8 (ACLS-F p. 3)", repete: 1,
        ops: [{ v: "sim", t: "Melhorou", prox: "Manter monitorizado, tratar a causa e definir o destino." }, { v: "nao", t: "Sem resposta", prox: "Seguir para o próximo item: repetir atropina até 3 mg, marca-passo transcutâneo, adrenalina em bomba." },
          { v: "sempulso", t: "Perdeu o pulso", prox: "Iniciar RCP." }] }],
    alertas: [{ id: "pcr", se: function (P) { return P.r("resp") === "sempulso"; }, t: "Sem pulso: seguir o fluxo de parada cardiorrespiratória", porque: "Foi registrado que o paciente perdeu o pulso.", ir: "pcr" }],
    destino: { ops: [{ v: "uti", t: "UTI" }, { v: "obs", t: "Observação ou enfermaria" }, { v: "alta", t: "Alta" }], ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" }
  },
  // ============================== IC E EDEMA AGUDO DE PULMÃO ==============================
  {
    id: "ic", nome: "Insuficiência cardíaca descompensada e edema agudo de pulmão", curto: "IC e EAP",
    busca: ["ic", "icad", "eap", "icc", "insuficiencia cardiaca", "edema agudo de pulmao", "falta de ar", "dispneia", "ortopneia", "inchaco", "edema", "congestao", "cansaco"],
    sobre: "Três etapas, idealmente em até 60 minutos: tratar o risco imediato (choque ou insuficiência respiratória), procurar causa que exija tratamento específico e definir a terapia pelo perfil de congestão e perfusão.", refSobre: "SBC 2026, 7.4.1 (p. 65)",
    agora: [
      { id: "monitor", t: "Monitorizar: FC, FR, pressão, ECG e saturação", ref: "SBC 2018, Quadro 1.7 (p. 490)" },
      { id: "acesso", t: "Acesso venoso", como: ["O diurético vai por via endovenosa: na hipervolemia a absorção oral é imprevisível."], ref: "PSZ2 p. 20" },
      { id: "vni", t: "VNI se desconforto respiratório ou edema agudo de pulmão", como: ["Começar com pressão de suporte de 12 cmH₂O e PEEP de 6 a 7 cmH₂O.", "FiO₂ conforme a saturação.", "Morfina não é mais usada no edema agudo de pulmão."], ref: "PSZ2 p. 20 e 22" }],
    pedeVitais: [{ k: "pas", se: function (P) { return P.a("cong") === "p"; }, por: "define vasodilatador ou inotrópico", ref: "SBC 2026, Tabela 7.3 e 7.8" }],
    gravidade: { t: "Risco imediato", itens: [{ id: "choque", t: "Choque cardiogênico" }, { id: "irpa", t: "Insuficiência respiratória" }], como: ["Presente: VNI ou via aérea, e acionar a UTI."], ref: "SBC 2026, 7.4.1" },
    investigar: [
      { id: "cong", tipo: "tri", decide: 1, t: "Congestão", sinais: ["Ortopneia", "Estertores", "Turgência jugular", "Ascite", "Edema", "Refluxo hepatojugular", "Terceira bulha (B3)", "Taquipneia (FR > 22) ou esforço respiratório"], como: ["Um ou mais sinais já sugerem congestão. Toque nos sinais encontrados."], ref: "SBC 2026, Figura 7.3 (p. 68) · SBC 2018, Quadro 1.2" },
      { id: "perf", tipo: "tri", decide: 1, t: "Baixa perfusão", sinais: ["Pressão de pulso reduzida", "Sonolência ou obnubilação", "Extremidades frias", "Baixa diurese", "Sudorese fria", "Lactato elevado"], como: ["Um ou mais sinais já sugerem baixa perfusão. Toque nos sinais encontrados."], ref: "SBC 2026, Figura 7.3 (p. 68) · SBC 2018, Quadro 1.2" },
      { id: "scape", tipo: "tri", t: "Edema agudo hiperagudo, sem excesso de líquido (SCAPE)", como: ["Forma hiperaguda: o paciente não tem excesso de líquido; trata-se com VNI e vasodilatador.", "Forma subaguda (com hipervolemia): a base é a furosemida."], ref: "PSZ2 p. 19" }],
    exames: [
      { id: "ecg", t: "ECG", por: "afastar síndrome coronariana e arritmia", res: [{ v: "isq", t: "Supra de ST ou isquemia" }, { v: "taqui", t: "FA ou outra taquiarritmia" }, { v: "bradi", t: "Bradiarritmia ou bloqueio" }, { v: "sem", t: "Sem alteração aguda" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
      { id: "rx", t: "Radiografia de tórax", res: [{ v: "cong", t: "Congestão" }, { v: "cons", t: "Consolidação" }, { v: "normal", t: "Normal" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
      { id: "usp", t: "Ultrassom pulmonar", res: [{ v: "b", t: "Linhas B difusas" }, { v: "normal", t: "Sem linhas B" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
      { id: "eco", t: "Ecocardiograma", res: [{ v: "fer", t: "FE reduzida" }, { v: "fep", t: "FE preservada" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
      { id: "bnp", t: "BNP", num: { un: "pg/mL", corte: 100, txt: "abaixo de 100 pg/mL afasta IC descompensada" }, ref: "SBC 2026, 7.2 (p. 63)" },
      { id: "ntbnp", t: "NT-proBNP", num: { un: "pg/mL", corte: 300, txt: "abaixo de 300 pg/mL afasta IC descompensada" }, ref: "SBC 2026, 7.2 (p. 63)" },
      { id: "tropo", t: "Troponina", por: "afastar síndrome coronariana", res: [{ v: "elev", t: "Elevada" }, { v: "normal", t: "Normal" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
      { id: "ele", t: "Sódio e potássio", res: [{ v: "alt", t: "Alterados" }, { v: "normal", t: "Normais" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
      { id: "cr", t: "Creatinina", res: [{ v: "elev", t: "Elevada" }, { v: "normal", t: "Normal" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
      { id: "lac", t: "Lactato", res: [{ v: "elev", t: "Elevado" }, { v: "normal", t: "Normal" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
      { id: "gas", t: "Gasometria", res: [{ v: "alt", t: "Alterada" }, { v: "normal", t: "Normal" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" }],
    classificar: function (P) {
      var c = P.a("cong"), f = P.a("perf"), it = [], falta = [], pas = P.n("pas");
      if (!c) falta.push("Congestão (presente ou ausente)"); if (!f) falta.push("Perfusão (presente ou ausente)");
      if (c && f) { var pf = c === "p" ? (f === "p" ? "C · frio e úmido" : "B · quente e úmido") : (f === "p" ? "L · frio e seco" : "A · quente e seco");
        it.push({ t: "Perfil", v: pf, porque: "Congestão " + (c === "p" ? "presente" : "ausente") + " e baixa perfusão " + (f === "p" ? "presente" : "ausente") + "." });
        if (c === "p" && pas == null) falta.push("PAS (define o vasodilatador ou o inotrópico)"); }
      if (P.a("choque") === "p" || P.a("irpa") === "p") it.push({ t: "Risco imediato", v: "Presente" });
      return { itens: it, falta: falta };
    },
    passos: [
      { id: "risco", t: "Risco imediato à vida", se: function (P) { return P.a("choque") === "p" || P.a("irpa") === "p"; }, porque: "Choque ou insuficiência respiratória.", ref: "SBC 2026, 7.4.1 · PSZ2 p. 20",
        itens: [{ id: "suporte", tipo: "acao", t: "VNI ou via aérea definitiva", ref: "SBC 2026, 7.4.1 · PSZ2 p. 20" }, { id: "uti", tipo: "acao", t: "Acionar a UTI", ref: "SBC 2026, 7.4.1" }] },
      { id: "A", t: "Perfil A: compensado", se: function (P) { return P.a("cong") === "a" && P.a("perf") === "a"; }, porque: "Sem congestão e com perfusão adequada.", ref: "CNP p. 72",
        itens: [{ id: "oral", tipo: "acao", t: "Ajustar a terapia oral", ref: "CNP p. 72" }] },
      { id: "B", t: "Perfil B: descongestionar", se: function (P) { return P.a("cong") === "p" && P.a("perf") === "a"; }, porque: "Congestão com perfusão adequada.", ref: "SBC 2026, 7.5.1 e 7.8 · PSZ2 p. 20-22",
        itens: [
          { tipo: "med", med: "furosemida", nota: "idealmente em até 1 hora" },
          { tipo: "med", med: "nitroglicerina", nota: "PAS acima de 110 mmHg", se: function (P) { return P.n("pas") > 110 && P.p("pde5") !== "s"; } },
          { tipo: "info", t: "Nitroglicerina contraindicada: usou sildenafila ou tadalafila.", se: function (P) { return P.n("pas") > 110 && P.p("pde5") === "s"; } },
          { tipo: "info", t: "Vasodilatador só com PAS acima de 110 mmHg.", se: function (P) { return P.n("pas") != null && !(P.n("pas") > 110); } }] },
      { id: "Cb", t: "Perfil C com PAS até 90: inotrópico e vasopressor", se: function (P) { return P.a("cong") === "p" && P.a("perf") === "p" && P.n("pas") != null && P.n("pas") <= 90; }, porque: "Congestão, baixa perfusão e PAS até 90 mmHg.", ref: "SBC 2026, Tabela 7.3 · CNP p. 61 · DRG p. 43",
        itens: [
          { tipo: "med", med: "dobutamina" }, { tipo: "med", med: "noradrenalina", nota: "sempre junto com o inotrópico; meta PAM 65 a 70" }, { tipo: "med", med: "furosemida", nota: "se muito congesto" },
          { id: "uti", tipo: "acao", t: "Acionar a UTI", ref: "SBC 2026, Quadro 7.7 (p. 82)" }] },
      { id: "Ca", t: "Perfil C com PAS acima de 90: diurético e vasodilatador", se: function (P) { return P.a("cong") === "p" && P.a("perf") === "p" && P.n("pas") > 90; }, porque: "Congestão, baixa perfusão e PAS acima de 90 mmHg.", ref: "SBC 2026, Tabela 7.3 · DRG p. 51",
        itens: [{ tipo: "med", med: "furosemida" }, { tipo: "med", med: "nitroprussiato" }, { id: "uti", tipo: "acao", t: "Acionar a UTI", ref: "SBC 2026, Quadro 7.7 (p. 82)" }] },
      { id: "L", t: "Perfil L: volume com cautela", se: function (P) { return P.a("cong") === "a" && P.a("perf") === "p"; }, porque: "Baixa perfusão sem congestão.", ref: "CNP p. 75",
        itens: [
          { id: "rl", tipo: "acao", t: "Ringer lactato 250 mL EV, devagar", como: ["Reavaliar depois da infusão: melhora da perfusão ou sinais de congestão."], ref: "CNP p. 75" },
          { tipo: "med", med: "dobutamina", nota: "se congestionar e seguir frio", se: function (P) { return P.r("vol") === "cong"; } }] }],
    reav: [
      { id: "diur", t: "Diurese acima de 100 mL/h?", se: function (P) { return P.adm("furosemida") > 0; }, quando: { med: "furosemida", h: 6 }, ref: "SBC 2026, Figura 7.5 (p. 71)", repete: 1,
        como: ["Reavaliar 6 horas depois do diurético.", "Objetivo: perda de cerca de 1 litro nas primeiras 6 horas."],
        ops: [{ v: "sim", t: "Sim", prox: "Repetir a mesma dose a cada 12 horas." }, { v: "nao", t: "Não", prox: "Dobrar a dose e reavaliar em mais 6 horas (teto de 600 mg por dia)." }] },
      { id: "vol", t: "Depois do volume", se: function (P) { return P.a("cong") === "a" && P.a("perf") === "p"; }, ref: "CNP p. 75",
        ops: [{ v: "melhor", t: "Perfusão melhorou", prox: "Manter e definir o destino." }, { v: "cong", t: "Congestionou e segue frio", prox: "Parar o volume e iniciar dobutamina." }] },
      { id: "geral", t: "Evolução", se: function (P) { return !!P.a("cong"); }, ref: "SBC 2018, Quadro 1.7 (p. 490)", repete: 1,
        como: ["Vasodilatador: pressão a cada 15 minutos durante o ajuste, depois a cada 30.", "Balanço hídrico a cada 6 horas.", "Ureia, creatinina e eletrólitos a cada 6 a 12 horas durante a descongestão intensa."],
        ops: [{ v: "melhor", t: "Melhorou", prox: "Manter a conduta e definir o destino." }, { v: "igual", t: "Sem mudança", prox: "Rever a dose do diurético, a pressão e os achados de perfusão." }, { v: "pior", t: "Piorou", prox: "Reavaliar perfusão, PAS e risco imediato; atualizar os achados para rever a conduta." }] }],
    alertas: [
      { id: "taqui", se: function (P) { return P.ex("ecg").r === "taqui" || P.n("fc") >= 150; }, t: "Taquiarritmia pode ser a causa da descompensação", porque: "ECG com taquiarritmia ou FC de 150 por minuto ou mais.", ir: "taqui" },
      { id: "bradi", se: function (P) { return P.ex("ecg").r === "bradi" || (P.n("fc") != null && P.n("fc") < 50); }, t: "Bradiarritmia pode ser a causa da descompensação", porque: "ECG com bradiarritmia ou FC abaixo de 50 por minuto.", ir: "bradi" },
      { id: "sca", se: function (P) { return P.ex("ecg").r === "isq" || P.ex("tropo").r === "elev"; }, t: "Suspeita de síndrome coronariana aguda", porque: "ECG com isquemia ou troponina elevada.", ir: null },
      { id: "cc", se: function (P) { return P.a("cong") === "p" && P.a("perf") === "p" && P.n("pas") != null && P.n("pas") <= 90; }, t: "Quadro compatível com choque cardiogênico", porque: "Congestão, baixa perfusão e PAS até 90 mmHg.", ir: null }],
    destino: { ops: [{ v: "uti", t: "UTI" }, { v: "enf", t: "Enfermaria" }, { v: "alta", t: "Alta" }], notas: ["UTI: instabilidade hemodinâmica ou insuficiência respiratória; o perfil C costuma ser tratado em terapia intensiva.", "Antes da alta: sem congestão; peso e diurético oral estáveis há 48 h; sem droga EV há 48 h; retorno em 7 a 14 dias."], ref: "SBC 2026, 7.4.1, Quadro 7.7 e 7.17" }
  }],
  // ============================== MEDICAMENTOS ==============================
  // modo: "fixo" (dose em mg, escolhe a ampola), "kg" (mg/kg), "furo" (furosemida), "inf" (infusão), "txt" (sem cálculo).
  // aps = ampolas documentadas; preps = preparos documentados (amp = nº de ampolas, ap = índice em aps, dil = mL de diluente).
  meds: {
    adrenalinaPcr: { nome: "Adrenalina", ind: "Parada cardiorrespiratória", modo: "fixo", doses: [1], aps: [{ t: "1 mg/1 mL", mg: 1, ml: 1 }], busca: ["adrenalina", "epinefrina"],
      dose: ["1 mg EV ou IO a cada 3 a 5 minutos."], prep: ["Sem diluir, seguida de flush."], cuid: ["Ritmo chocável: depois do 2º choque. Não chocável: o quanto antes."], lembra: "Adrenalina de novo a partir das", ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · DRG p. 88 · MED p. 11" },
    amiodaronaPcr: { nome: "Amiodarona", ind: "PCR em FV ou TV sem pulso refratária", modo: "fixo", doses: [300, 150], aps: [{ t: "150 mg/3 mL", mg: 150, ml: 3 }], busca: ["amiodarona", "ancoron"],
      dose: ["Primeira dose: 300 mg EV ou IO em bolus.", "Segunda dose: 150 mg."], prep: ["Em bolus, durante a RCP."], cuid: ["Depois do 3º choque."], ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · DRG p. 88" },
    lidocainaPcr: { nome: "Lidocaína 2% sem vasoconstritor", ind: "PCR em FV ou TV sem pulso, se não houver amiodarona", modo: "kg", faixas: [{ t: "1ª dose", mgKg: [1, 1.5] }, { t: "2ª dose", mgKg: [0.5, 0.75] }], aps: [{ t: "2% · 20 mg/mL", mg: 20, ml: 1 }], busca: ["lidocaina", "xylocaina"],
      dose: ["Primeira dose: 1 a 1,5 mg/kg EV ou IO.", "Segunda dose: 0,5 a 0,75 mg/kg."], prep: ["Em bolus, sem diluir."], cuid: [], ref: "AHA 2025, Figura 2 (ACLS-F p. 2) · DRG p. 63 e 88" },
    adenosina: { nome: "Adenosina", ind: "Taquicardia de QRS estreito e regular, estável", modo: "fixo", doses: [6, 12], aps: [{ t: "6 mg/2 mL", mg: 6, ml: 2 }], busca: ["adenosina", "adenocard"],
      dose: ["6 mg EV em bolus rápido.", "Se não reverter: 12 mg."], prep: ["Veia calibrosa do braço, seguida de flush de 20 mL e elevação do membro."], cuid: ["Contraindicada na asma (broncoespasmo grave).", "Não usar em ritmo irregular nem em QRS largo polimórfico.", "Avisar o paciente: rubor e sensação de morte iminente por segundos.", "Cateter central ou transplante cardíaco: dose menor pode bastar."], ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · ACLS-T p. 5 · CNP p. 88" },
    metoprolol: { nome: "Metoprolol", ind: "Controle da frequência (TPSV que persiste; FA ou flutter)", modo: "fixo", doses: [5], aps: [{ t: "5 mg/5 mL", mg: 5, ml: 5 }], busca: ["metoprolol", "seloken", "betabloqueador"],
      dose: ["5 mg EV lento (1 mg por minuto).", "Pode repetir até 3 doses (máximo 15 mg)."], prep: ["Sem diluir."], cuid: ["Não usar: IC descompensada com fração de ejeção reduzida, hipotensão, bradicardia ou bloqueio AV, asma grave, pré-excitação."], ref: "AHA 2025, Tabela 2 (ACLS-T p. 11) · CNP p. 89 · DRG p. 64" },
    amiodaronaTv: { nome: "Amiodarona · ataque", ind: "Taquicardia ventricular monomórfica estável", modo: "fixo", doses: [150], aps: [{ t: "150 mg/3 mL", mg: 150, ml: 3 }], busca: [],
      dose: ["150 mg EV em 10 minutos.", "Repetir se a TV voltar."], prep: ["Diluir em 100 mL de SG 5%."], cuid: ["Pode causar hipotensão.", "Não associar a outro antiarrítmico sem especialista."], ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · CNP p. 101" },
    amiodaronaTvManut: { nome: "Amiodarona · manutenção", ind: "Prevenir recorrência de taquicardia ventricular", modo: "inf", porKg: 0, un: "mg/min", fator: 1000, busca: [], aps: [{ t: "150 mg/3 mL", mg: 150, ml: 3 }], preps: [{ t: "6 ampolas (900 mg) + 482 mL SG 5%", amp: 6, ap: 0, dil: 482 }],
      conc: 1800, ini: [1, 1], rapidas: [{ t: "1 mg/min (primeiras 6 h)", v: 1 }, { t: "0,5 mg/min (18 h seguintes)", v: 0.5 }], max: 1,
      dose: ["1 mg/min nas primeiras 6 horas.", "0,5 mg/min nas 18 horas seguintes."], prep: ["900 mg (6 ampolas) em SG 5% até 500 mL."], cuid: ["Depois de 24 a 48 h, passar para a via oral."], ref: "AHA 2025, Figura 6 (ACLS-F p. 4) · CNP p. 101 · PSZ1 p. 10" },
    amiodaronaFa: { nome: "Amiodarona · ataque", ind: "FA ou flutter com IC descompensada (controle da frequência)", modo: "fixo", doses: [300], aps: [{ t: "150 mg/3 mL", mg: 150, ml: 3 }], busca: [],
      dose: ["300 mg EV em 1 hora."], prep: ["Diluir em 200 mL de SG 5%."], cuid: ["Não usar se houver pré-excitação."], ref: "AHA 2025, Tabela 2 (ACLS-T p. 11) · DRG p. 62" },
    amiodaronaFaManut: { nome: "Amiodarona · manutenção", ind: "FA ou flutter com IC descompensada (controle da frequência)", modo: "inf", porKg: 0, un: "mg/h", mgMl: 1.8, busca: [], aps: [{ t: "150 mg/3 mL", mg: 150, ml: 3 }], preps: [{ t: "6 ampolas (900 mg) + 482 mL SG 5%", amp: 6, ap: 0, dil: 482 }],
      ini: [10, 50], max: 50, dose: ["10 a 50 mg/h por 24 horas, ajustando pela frequência."], prep: ["900 mg (6 ampolas) em SG 5% até 500 mL."], cuid: ["Depois de 24 horas, passar para a via oral."], ref: "AHA 2025, Tabela 2 (ACLS-T p. 11) · DRG p. 62 · PSZ1 p. 10" },
    magnesio: { nome: "Sulfato de magnésio", ind: "Torsades de pointes (TV polimórfica com QT longo)", modo: "fixo", doses: [1000, 2000], rot: { 1000: "1 g", 2000: "2 g" }, aps: [{ t: "10% · 1 g/10 mL", mg: 1000, ml: 10 }, { t: "50% · 5 g/10 mL", mg: 5000, ml: 10 }], busca: ["magnesio", "sulfato de magnesio"],
      dose: ["Ataque: 1 a 2 g EV em 15 minutos.", "Pode seguir com infusão contínua de 1 a 4 g por hora."], prep: [], cuid: ["Funciona mesmo sem hipomagnesemia.", "Na infusão contínua: dosar o magnésio a cada 6 horas e parar se passar de 7 mg/dL.", "Não fazer infusão contínua com clearance de creatinina abaixo de 30 mL/min.", "Corrigir o potássio (alvo 4,5 mEq/L)."], ref: "CNP p. 103 · MED p. 38 · AHA 2025 (ACLS-T p. 3-4)" },
    midazolam: { nome: "Midazolam", ind: "Sedação para cardioversão elétrica", modo: "txt", busca: ["midazolam", "dormonid"],
      dose: ["1 a 2 mL da solução EV, até sedação leve."], prep: ["1 ampola (15 mg/3 mL) + 7 mL de água destilada = 10 mL com 1,5 mg/mL."], cuid: ["Objetivo: sedação leve e de curta duração, com ventilação preservada.", "Ter material de via aérea, aspirador e oxímetro à mão."], ref: "CNP p. 83-84" },
    fentanil: { nome: "Fentanil", ind: "Analgesia para cardioversão elétrica", modo: "txt", busca: ["fentanil"],
      dose: ["1 mL (50 mcg) EV lento."], prep: ["Ampola de 50 mcg/mL, sem diluir."], cuid: ["Infundir devagar."], ref: "CNP p. 83-84" },
    atropina: { nome: "Atropina", ind: "Bradicardia instável", modo: "fixo", doses: [1], aps: [{ t: "0,25 mg/1 mL", mg: 0.25, ml: 1 }, { t: "0,5 mg/1 mL", mg: 0.5, ml: 1 }], busca: ["atropina"],
      dose: ["1 mg EV em bolus.", "Repetir a cada 3 a 5 minutos.", "Dose total máxima: 3 mg."], prep: ["Sem diluir."], cuid: ["Conferir a ampola do serviço: existem 0,25 mg/mL e 0,5 mg/mL."], lembra: "Atropina de novo a partir das", ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · CNP p. 115 · MED p. 39" },
    adrenalinaInf: { nome: "Adrenalina em bomba", ind: "Bradicardia instável sem resposta à atropina", modo: "inf", porKg: 0, un: "mcg/min", busca: ["adrenalina em bomba", "epinefrina em bomba"], aps: [{ t: "1 mg/1 mL", mg: 1, ml: 1 }],
      preps: [{ t: "6 ampolas + 94 mL SF 0,9%", amp: 6, ap: 0, dil: 94 }, { t: "10 ampolas + 90 mL SF 0,9%", amp: 10, ap: 0, dil: 90 }], conc: 60, ini: [2, 2], max: 10,
      dose: ["2 a 10 mcg/min, ajustando pela resposta."], prep: ["6 ampolas + 94 mL de SF 0,9% (60 mcg/mL), ou 10 ampolas + 90 mL (100 mcg/mL)."], cuid: [], ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · MED p. 11 e 16 · CNP p. 115" },
    dopamina: { nome: "Dopamina em bomba", ind: "Bradicardia instável sem resposta à atropina, se não houver adrenalina", modo: "inf", porKg: 1, un: "mcg/kg/min", busca: ["dopamina", "revivan"], aps: [{ t: "50 mg/10 mL", mg: 50, ml: 10 }],
      preps: [{ t: "5 ampolas + 200 mL SF 0,9%", amp: 5, ap: 0, dil: 200 }], conc: 1000, ini: [5, 5], max: 20,
      dose: ["5 a 20 mcg/kg/min, ajustando pela resposta.", "Reduzir devagar."], prep: ["5 ampolas (250 mg) + 200 mL de SF 0,9% ou SG 5% (1.000 mcg/mL)."], cuid: [], ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · PSZ1 p. 87 · MED p. 12 e 16" },
    // ----- IC e EAP -----
    furosemida: { nome: "Furosemida", ind: "Congestão na IC descompensada e no edema agudo de pulmão", busca: ["furosemida", "lasix", "diuretico"], modo: "furo", mg: 20, ml: 2, aps: [{ t: "20 mg/2 mL", mg: 20, ml: 2 }], semUso: [20, 40], fator: [1, 2], teto: 600,
      dose: ["Sem uso prévio de diurético: 20 ou 40 mg EV em bolus.", "Usuário crônico: 1 a 2 vezes a dose oral diária, em bolus.", "Teto: 600 mg por dia."], prep: ["Em bolus, sem diluir."], cuid: ["Reavaliar a diurese em 6 horas.", "Efeitos: hipocalemia, hipomagnesemia, surdez."], ref: "SBC 2026, 7.5.1 (p. 70) · DRG p. 60" },
    nitroglicerina: { nome: "Nitroglicerina", ind: "Vasodilatador na IC com PAS acima de 110 mmHg e no edema agudo hipertensivo", busca: ["nitroglicerina", "tridil"], modo: "inf", porKg: 0, un: "mcg/min", aps: [{ t: "50 mg/10 mL", mg: 50, ml: 10 }], preps: [{ t: "1 ampola + 240 mL SF 0,9%", amp: 1, ap: 0, dil: 240 }], conc: 200, ini: [10, 20], max: 200,
      bolus: { pasMin: 160, t: "Bolus no edema hiperagudo (SCAPE), da solução de 200 mcg/mL", faixas: [{ de: 160, ate: 179, ml: 3 }, { de: 180, ate: 199, ml: 4 }, { de: 201, ate: 999, ml: 5 }], depois: "Depois do bolus: 30 mL/h. Se a PAS não cair, aumentar 6 mL/h a cada 10 minutos." },
      dose: ["Começar com 10 a 20 mcg/min.", "Aumentar 10 a 20 mcg/min a cada 15 minutos.", "Máximo: 200 mcg/min."], prep: ["1 ampola (50 mg/10 mL) + 240 mL de SF 0,9% = 200 mcg/mL."], cuid: ["Não usar: sildenafila nas últimas 24 h, tadalafila nas últimas 48 h, infarto de ventrículo direito, hipotensão.", "Efeitos: cefaleia, hipotensão."], ref: "SBC 2018, Tabela 2.2 (p. 494) · PSZ2 p. 20-21 · DRG p. 52" },
    nitroprussiato: { nome: "Nitroprussiato de sódio", ind: "Vasodilatador no perfil C com PAS acima de 90 mmHg", busca: ["nitroprussiato", "nipride"], modo: "inf", porKg: 1, un: "mcg/kg/min", aps: [{ t: "50 mg/2 mL", mg: 50, ml: 2 }], preps: [{ t: "1 ampola + 248 mL SG 5%", amp: 1, ap: 0, dil: 248 }], conc: 200, ini: [0.3, 0.3], max: 5,
      dose: ["Começar com 0,3 mcg/kg/min.", "Aumentar 0,3 a 0,5 mcg/kg/min a cada 15 minutos.", "Máximo: 5 mcg/kg/min."], prep: ["1 ampola (50 mg/2 mL) + 248 mL de SG 5% = 200 mcg/mL.", "Proteger da luz."], cuid: ["Pressão a cada 15 minutos durante o ajuste.", "Efeitos: cefaleia, intoxicação por cianeto."], ref: "SBC 2018, Tabela 2.2 (p. 494) · PSZ2 p. 21 · bula" },
    dobutamina: { nome: "Dobutamina", ind: "Baixa perfusão com PAS até 90 mmHg (perfil C) ou perfil L que congestionou", busca: ["dobutamina", "dobutrex"], modo: "inf", porKg: 1, un: "mcg/kg/min", aps: [{ t: "250 mg/20 mL", mg: 250, ml: 20 }], preps: [{ t: "4 ampolas + 170 mL SF 0,9%", amp: 4, ap: 0, dil: 170 }], conc: 4000, ini: [0.5, 1], manter: [2, 20], max: 20,
      dose: ["Começar com 0,5 a 1 mcg/kg/min.", "Manter entre 2 e 20 mcg/kg/min.", "Ajustar a cada 10 minutos."], prep: ["4 ampolas (250 mg/20 mL) + 170 mL de SF 0,9% = 4 mg/mL."], cuid: ["Menor dose pelo menor tempo.", "Efeitos: arritmia, hipotensão, isquemia."], ref: "SBC 2026, Quadro 7.5 (p. 77) · PSZ2 p. 22 · DRG p. 46" },
    noradrenalina: { nome: "Noradrenalina", ind: "Hipotensão no perfil C, sempre junto com inotrópico", busca: ["noradrenalina", "norepinefrina"], modo: "inf", porKg: 1, un: "mcg/kg/min", aps: [{ t: "4 mg/4 mL", mg: 4, ml: 4 }], preps: [{ t: "4 ampolas + 234 mL SG 5%", amp: 4, ap: 0, dil: 234 }], conc: 64, ini: [0.1, 0.2], max: 1,
      dose: ["Começar com 0,1 a 0,2 mcg/kg/min.", "Ajustar a cada 15 minutos.", "Máximo: 1 mcg/kg/min."], prep: ["4 ampolas (4 mg/4 mL) + 234 mL de SG 5% = 64 mcg/mL."], cuid: ["Meta: PAM de 65 a 70 mmHg."], ref: "SBC 2018, Tabela 2.3 · DRG p. 43 · PSZ2 p. 194 · bula" }
  }
};

// ============================== PLANO DE CADA MEDICAMENTO (quanto, repetir, máximo) ==============================
// q = quanto dar; rep = quando repetir; max = limite; maxN = nº máximo de doses; intMin = minutos até poder repetir.
var PLANO = {
  adrenalinaPcr: { q: "1 mg EV ou IO", rep: "a cada 3 a 5 minutos", max: "enquanto durar a RCP", intMin: 3 },
  amiodaronaPcr: { q: "1ª dose 300 mg · 2ª dose 150 mg", rep: "2ª dose se o ritmo seguir chocável", max: "2 doses", maxN: 2 },
  lidocainaPcr: { q: "1ª dose 1 a 1,5 mg/kg · 2ª dose 0,5 a 0,75 mg/kg", rep: "2ª dose se o ritmo seguir chocável", max: "2 doses", maxN: 2 },
  adenosina: { q: "1ª dose 6 mg · 2ª dose 12 mg", rep: "2ª dose se não reverter", max: "2 doses", maxN: 2 },
  metoprolol: { q: "5 mg EV lento", rep: "pode repetir se a frequência não cair", max: "3 doses (15 mg)", maxN: 3 },
  amiodaronaTv: { q: "150 mg em 10 minutos", rep: "repetir se a TV voltar", max: "" },
  amiodaronaTvManut: { q: "1 mg/min por 6 h, depois 0,5 mg/min por 18 h", rep: "infusão contínua", max: "24 horas" },
  amiodaronaFa: { q: "300 mg em 1 hora", rep: "dose única", max: "1 dose", maxN: 1 },
  amiodaronaFaManut: { q: "10 a 50 mg/h", rep: "infusão contínua, ajustar pela frequência", max: "24 horas" },
  magnesio: { q: "1 a 2 g em 15 minutos", rep: "pode seguir com infusão de 1 a 4 g/h", max: "" },
  midazolam: { q: "1 a 2 mL da solução de 1,5 mg/mL", rep: "repetir até sedação leve", max: "" },
  fentanil: { q: "1 mL (50 mcg) EV lento", rep: "dose única", max: "" },
  atropina: { q: "1 mg EV em bolus", rep: "a cada 3 a 5 minutos", max: "3 doses (3 mg)", maxN: 3, intMin: 3 },
  adrenalinaInf: { q: "2 a 10 mcg/min", rep: "infusão contínua, ajustar pela resposta", max: "10 mcg/min" },
  dopamina: { q: "5 a 20 mcg/kg/min", rep: "infusão contínua, ajustar pela resposta", max: "20 mcg/kg/min" },
  furosemida: { q: "20 a 40 mg EV (ou 1 a 2 vezes a dose oral diária)", rep: "reavaliar em 6 h: repetir a cada 12 h ou dobrar", max: "600 mg por dia" },
  nitroglicerina: { q: "começar com 10 a 20 mcg/min", rep: "subir 10 a 20 mcg/min a cada 15 minutos", max: "200 mcg/min" },
  nitroprussiato: { q: "começar com 0,3 mcg/kg/min", rep: "subir 0,3 a 0,5 mcg/kg/min a cada 15 minutos", max: "5 mcg/kg/min" },
  dobutamina: { q: "começar com 0,5 a 1 mcg/kg/min", rep: "ajustar a cada 10 minutos; manter 2 a 20", max: "20 mcg/kg/min" },
  noradrenalina: { q: "começar com 0,1 a 0,2 mcg/kg/min", rep: "ajustar a cada 15 minutos", max: "1 mcg/kg/min" }
};
Object.keys(PLANO).forEach(function (k) { FLUXO.meds[k].plano = PLANO[k]; });

// ============================== O QUE PERGUNTAR (paciente e familiares) ==============================
// Cada pergunta nasce de uma decisão documentada; a fonte é a do item que depende da resposta.
var PERG = {
  pcr: { paciente: [], familia: [
    { id: "presenc", t: "A parada foi presenciada?", ref: "AHA 2025, Figuras 3 e 4 (ACLS-F p. 6-7)" },
    { id: "rcpleigo", t: "Alguém fez massagem cardíaca antes da equipe chegar?", ref: "AHA 2025, Figura 4 (ACLS-F p. 7)" },
    { id: "antes", t: "Teve dor no peito ou falta de ar antes de parar?", por: "trombose coronária e pulmonar são causas reversíveis", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" },
    { id: "tox", t: "Pode ter tomado remédio em excesso, veneno ou droga?", por: "toxinas são causa reversível", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" },
    { id: "perdas", t: "Teve sangramento, vômito ou diarreia importantes?", por: "hipovolemia é causa reversível", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" }] },
  taqui: { paciente: [
    { id: "t48", t: "Começou há mais de 48 horas, ou não sabe quando?", por: "define se dá para reverter FA ou flutter sem anticoagular", ref: "AHA 2025 (ACLS-T p. 6-8)" },
    { id: "dorp", t: "Sente dor no peito ou falta de ar?", por: "são sinais de instabilidade", ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" },
    { id: "asma", t: "Tem asma?", por: "contraindica adenosina", ref: "AHA 2025 (ACLS-T p. 5)" },
    { id: "cardiop", t: "Tem doença do coração (infarto, insuficiência cardíaca, Chagas)?", por: "muda a escolha do remédio e sugere origem ventricular", ref: "AHA 2025 (ACLS-T p. 10-11) · CNP p. 101" },
    { id: "qtmed", t: "Usa diurético ou remédio que alonga o QT?", por: "hipocalemia e QT longo causam arritmia ventricular", ref: "CNP p. 101 e 103" },
    { id: "mp", t: "Tem marca-passo ou desfibrilador implantado?", por: "as pás ficam a pelo menos 10 cm do aparelho", ref: "CNP p. 80" },
    { id: "gest", t: "Está grávida?", por: "a cardioversão é segura e não deve atrasar", ref: "CNP p. 80" }],
    familia: [{ id: "conf", t: "Ficou confuso, sonolento ou desmaiou?", por: "alteração aguda da consciência é sinal de instabilidade", ref: "AHA 2025, Figura 6 (ACLS-F p. 4)" }] },
  bradi: { paciente: [
    { id: "remed", t: "Usa betabloqueador, bloqueador de canal de cálcio ou digoxina?", por: "são causas de bradicardia", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
    { id: "dorp", t: "Sente dor no peito?", por: "isquemia ou infarto é causa e sinal de instabilidade", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
    { id: "tont", t: "Teve tontura, escurecimento da vista ou desmaio?", por: "sintomas de baixo débito pela bradicardia", ref: "AHA 2025 (ACLS-B p. 1)" },
    { id: "disp", t: "Sente falta de ar?", por: "insuficiência cardíaca aguda é sinal de instabilidade", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" }],
    familia: [
      { id: "conf", t: "Ficou confuso, sonolento ou desmaiou?", por: "alteração aguda da consciência é sinal de instabilidade", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
      { id: "remedf", t: "Quais remédios toma? Pode ter tomado a mais?", por: "betabloqueador, bloqueador de cálcio e digoxina causam bradicardia", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" }] },
  ic: { paciente: [
    { id: "diur", t: "Usa diurético em casa?", por: "define a dose de furosemida: 1 a 2 vezes a dose oral diária", ref: "SBC 2026, 7.5.1 (p. 70)" },
    { id: "pde5", t: "Usou sildenafila nas últimas 24 h ou tadalafila nas últimas 48 h?", por: "contraindica nitroglicerina", ref: "DRG p. 52" },
    { id: "orto", t: "A falta de ar piora deitado?", por: "ortopneia é sinal de congestão", ref: "SBC 2026, Figura 7.3 (p. 68)" },
    { id: "dorp", t: "Sente dor no peito?", por: "afastar síndrome coronariana", ref: "SBC 2026, Quadro 7.1 (p. 64)" },
    { id: "urina", t: "Está urinando pouco?", por: "baixa diurese é sinal de má perfusão", ref: "SBC 2026, Figura 7.3 (p. 68)" }],
    familia: [
      { id: "sono", t: "Ficou sonolento ou confuso?", por: "sinal de baixa perfusão", ref: "SBC 2026, Figura 7.3 (p. 68)" },
      { id: "subito", t: "A falta de ar começou de repente, em minutos ou poucas horas?", por: "sugere a forma hiperaguda do edema de pulmão", ref: "PSZ2 p. 19" }] },
  sind: { paciente: [
    { id: "dorp", t: "Sente dor no peito?", por: "sinal de instabilidade e pista de síndrome coronariana", ref: "CNP p. 78 · SBC 2026, Quadro 7.1" },
    { id: "orto", t: "A falta de ar piora deitado?", por: "ortopneia é sinal de congestão", ref: "SBC 2026, Figura 7.3 (p. 68)" },
    { id: "remed", t: "Usa betabloqueador, bloqueador de canal de cálcio ou digoxina?", por: "são causas de bradicardia", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" },
    { id: "cardiop", t: "Tem doença do coração conhecida?", por: "orienta para insuficiência cardíaca e arritmia", ref: "AHA 2025 (ACLS-T p. 10-11) · CNP p. 101" }],
    familia: [
      { id: "conf", t: "Ficou confuso, sonolento ou desmaiou?", por: "alteração aguda da consciência é sinal de instabilidade", ref: "CNP p. 78" },
      { id: "remedf", t: "Quais remédios toma? Pode ter tomado a mais?", por: "remédios causam bradicardia e arritmia", ref: "AHA 2025, Figura 8 (ACLS-F p. 3)" }] }
};

// ============================== ENTRADA POR SINAIS E SINTOMAS (sem diagnóstico) ==============================
function fcTxt(P) { return "FC de " + P.n("fc") + " por minuto"; }
var SIND = {
  id: "sind", sind: 1, nome: "Avaliação por sinais e sintomas", curto: "Sinais e sintomas", busca: ["sinais e sintomas", "sem diagnostico", "nao sei", "avaliacao inicial"],
  sobre: "Sem diagnóstico ainda. Comece pelo suporte comum a todo paciente que chega à sala de emergência, registre o que encontrar e acompanhe as hipóteses. Quando uma se firmar, abra o protocolo dela: os dados vão junto.", refSobre: "CNP p. 78 · AHA 2025, Figuras 6 e 8",
  agora: [
    { id: "monitor", t: "Monitorizar", ref: "CNP p. 78" }, { id: "o2", t: "Oxigênio se saturação abaixo de 90%", ref: "CNP p. 78" },
    { id: "acesso", t: "Acesso venoso periférico", ref: "CNP p. 78" }, { id: "ecg", t: "ECG de 12 derivações", ref: "CNP p. 78" }],
  pedeVitais: [{ k: "fc", por: "separa taquiarritmia de bradiarritmia", ref: "AHA 2025, Figuras 6 e 8 (ACLS-F p. 3-4)" }, { k: "sat", por: "abaixo de 90%: oxigênio", ref: "CNP p. 78" }],
  gravidade: { t: "Sinais de instabilidade", itens: TRI_INST, como: ["Qualquer um presente: paciente instável."], ref: "CNP p. 78 · AHA 2025, Figuras 6 e 8" },
  investigar: [
    { id: "qx", tipo: "lista", t: "Queixa e o que você vê", itens: [{ k: "sempulso", t: "Não responde e sem pulso" }, { k: "disp", t: "Falta de ar" }, { k: "palp", t: "Palpitação" }, { k: "sinc", t: "Desmaio ou tontura" }, { k: "dorp", t: "Dor no peito" }, { k: "edema", t: "Inchaço nas pernas" }, { k: "lento", t: "Coração lento" }, { k: "trauma", t: "Trauma" }], ref: "AHA 2025, Figuras 2, 6 e 8 · SBC 2026, Figura 7.3" },
    { id: "ef", tipo: "lista", t: "Exame físico", itens: [{ k: "orto", t: "Ortopneia" }, { k: "estert", t: "Estertores" }, { k: "jug", t: "Turgência jugular" }, { k: "ascite", t: "Ascite" }, { k: "frio", t: "Extremidades frias" }, { k: "sono", t: "Sonolência" }], ref: "SBC 2026, Figura 7.3 (p. 68)" },
    { id: "ritmo", tipo: "opc", decide: 1, t: "ECG", ops: [{ v: "taqui", t: "Taquiarritmia" }, { v: "bradi", t: "Bradiarritmia ou bloqueio" }, { v: "isq", t: "Supra de ST ou isquemia" }, { v: "sem", t: "Sem alteração aguda" }], ref: "AHA 2025, Figuras 6 e 8 · SBC 2026, Quadro 7.1" }],
  exames: [
    { id: "bnp", t: "BNP", num: { un: "pg/mL", corte: 100, txt: "abaixo de 100 pg/mL afasta IC descompensada" }, ref: "SBC 2026, 7.2 (p. 63)" },
    { id: "ntbnp", t: "NT-proBNP", num: { un: "pg/mL", corte: 300, txt: "abaixo de 300 pg/mL afasta IC descompensada" }, ref: "SBC 2026, 7.2 (p. 63)" },
    { id: "tropo", t: "Troponina", por: "afastar síndrome coronariana", res: [{ v: "elev", t: "Elevada" }, { v: "normal", t: "Normal" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" },
    { id: "rx", t: "Radiografia de tórax", res: [{ v: "cong", t: "Congestão" }, { v: "cons", t: "Consolidação" }, { v: "normal", t: "Normal" }], ref: "SBC 2026, Quadro 7.1 (p. 64)" }],
  hipoteses: [
    { id: "pcr", t: "Parada cardiorrespiratória", curto: "Parada cardiorrespiratória", tema: "pcr", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)",
      favor: function (P) { return P.tem("qx", "sempulso") ? ["Não responde e sem pulso"] : []; }, contra: function () { return []; },
      confirmar: "Sem pulso: não esperar confirmação.", enquanto: "Iniciar RCP agora e chamar o desfibrilador." },
    { id: "taqui", t: "Taquiarritmia", tema: "taqui", ref: "AHA 2025, Figura 6 (ACLS-F p. 4)",
      favor: function (P) { var r = []; if (P.n("fc") >= 150) r.push(fcTxt(P) + " (150 ou mais)"); if (P.tem("qx", "palp")) r.push("Palpitação ou coração acelerado"); if (P.o("ritmo") === "taqui") r.push("ECG com taquiarritmia"); return r; },
      contra: function (P) { return P.n("fc") != null && P.n("fc") < 100 ? [fcTxt(P)] : []; },
      confirmar: "ECG de 12 derivações: QRS estreito ou largo, regular ou irregular.", enquanto: "Se estiver instável por causa da taquicardia: cardioversão elétrica sincronizada.",
      levar: function (P) { return {}; } },
    { id: "bradi", t: "Bradiarritmia", tema: "bradi", ref: "AHA 2025, Figura 8 (ACLS-F p. 3) · ACLS-B p. 1",
      favor: function (P) { var r = []; if (P.n("fc") != null && P.n("fc") < 50) r.push(fcTxt(P) + " (abaixo de 50)"); if (P.tem("qx", "sinc")) r.push("Desmaio ou tontura"); if (P.tem("qx", "lento")) r.push("Coração lento"); if (P.o("ritmo") === "bradi") r.push("ECG com bradiarritmia"); if (P.p("remed") === "s") r.push("Usa remédio que baixa a frequência"); return r; },
      contra: function (P) { return P.n("fc") >= 60 ? [fcTxt(P)] : []; },
      confirmar: "ECG de 12 derivações.", enquanto: "Se estiver instável por causa da bradicardia: atropina 1 mg EV." },
    { id: "ic", t: "Insuficiência cardíaca descompensada ou edema agudo de pulmão", curto: "Insuficiência cardíaca ou EAP", tema: "ic", ref: "SBC 2026, Figura 7.3 e 7.2",
      favor: function (P) { var r = []; [["qx", "disp", "Falta de ar"], ["qx", "edema", "Inchaço nas pernas"], ["ef", "orto", "Ortopneia"], ["ef", "estert", "Estertores"], ["ef", "jug", "Turgência jugular"], ["ef", "ascite", "Ascite"]].forEach(function (x) { if (P.tem(x[0], x[1])) r.push(x[2]); });
        if (P.p("orto") === "s" && !P.tem("ef", "orto")) r.push("Falta de ar piora deitado"); if (P.ex("rx").r === "cong") r.push("Radiografia com congestão"); return r; },
      contra: function (P) { var r = [], b = P.ex("bnp").val, n = P.ex("ntbnp").val; if (b && +String(b).replace(",", ".") < 100) r.push("BNP abaixo de 100 pg/mL"); if (n && +String(n).replace(",", ".") < 300) r.push("NT-proBNP abaixo de 300 pg/mL"); return r; },
      confirmar: "Sinais de congestão e de perfusão no exame; BNP ou NT-proBNP; radiografia e ultrassom pulmonar.", enquanto: "Desconforto respiratório: VNI. Acesso venoso para diurético.",
      levar: function (P) { var m = { orto: 0, estert: 1, jug: 2, ascite: 3 }, s = []; Object.keys(m).forEach(function (k) { if (P.tem("ef", k)) s.push(m[k]); }); if (P.tem("qx", "edema")) s.push(4);
        var perf = []; if (P.tem("ef", "sono")) perf.push(1); if (P.tem("ef", "frio")) perf.push(2);
        var o = { ach: {}, sin: {} }; if (s.length) { o.ach.cong = "p"; o.sin.cong = s; } if (perf.length) { o.ach.perf = "p"; o.sin.perf = perf; } return o; } },
    { id: "sca", t: "Síndrome coronariana aguda", tema: null, ref: "SBC 2026, Quadro 7.1 (p. 64)",
      favor: function (P) { var r = []; if (P.tem("qx", "dorp") || P.p("dorp") === "s") r.push("Dor no peito"); if (P.o("ritmo") === "isq") r.push("ECG com supra de ST ou isquemia"); if (P.ex("tropo").r === "elev") r.push("Troponina elevada"); return r; },
      contra: function () { return []; }, confirmar: "ECG de 12 derivações e troponina.", enquanto: "" },
    { id: "sinusal", t: "Taquicardia sinusal por outra causa", curto: "Taquicardia sinusal (outra causa)", tema: null, ref: "CNP p. 81 e 87",
      favor: function (P) { var f = P.n("fc"); return f > 100 && f < 150 ? [fcTxt(P) + " (entre 100 e 150)"] : []; }, contra: function () { return []; },
      confirmar: "Procurar a causa: isquemia, embolia pulmonar, sepse, pneumonia, hipovolemia, hipervolemia, anemia, hipertireoidismo, febre, dor ou ansiedade.", enquanto: "Tratar a causa, não a frequência." },
    { id: "resp", t: "Outra causa de falta de ar: embolia pulmonar ou pneumonia", curto: "Embolia pulmonar ou pneumonia", tema: null, ref: "SBC 2026, Quadro 7.1 (p. 64)",
      favor: function (P) { var r = []; if (P.tem("qx", "disp")) r.push("Falta de ar"); if (P.ex("rx").r === "cons") r.push("Radiografia com consolidação"); return r; }, contra: function () { return []; },
      confirmar: "D-dímero se a suspeita for embolia pulmonar; procalcitonina se for pneumonia; radiografia de tórax.", enquanto: "" }],
  classificar: function (P) {
    var it = [], falta = [];
    if (instavel(P)) it.push({ t: "Estabilidade", v: "Instável", porque: "Há sinal de instabilidade marcado como presente." });
    else if (estavel(P)) it.push({ t: "Estabilidade", v: "Estável", porque: "Todos os sinais de instabilidade avaliados e ausentes." });
    else falta.push("Sinais de instabilidade (marcar presente ou ausente)");
    return { itens: it, falta: falta };
  },
  passos: [
    { id: "sempulso", t: "Sem pulso: RCP agora", se: function (P) { return P.tem("qx", "sempulso"); }, porque: "Não responde e sem pulso.", ref: "AHA 2025, Figura 2 (ACLS-F p. 2)",
      itens: [{ id: "rcp", tipo: "acao", t: "Iniciar RCP e pedir o desfibrilador", como: ["Comprimir forte (pelo menos 5 cm) e rápido (100 a 120 por minuto).", "30 compressões para 2 ventilações.", "Abrir o protocolo de parada cardiorrespiratória."], ref: "AHA 2025, Figura 2 (ACLS-F p. 2)" }] },
    { id: "o2", t: "Saturação abaixo de 90%", se: function (P) { return P.n("sat") != null && P.n("sat") < 90; }, porque: "Saturação registrada abaixo de 90%.", ref: "CNP p. 78",
      itens: [{ id: "o2", tipo: "acao", t: "Dar oxigênio suplementar", ref: "CNP p. 78" }] },
    { id: "inst", t: "Paciente instável", se: function (P) { return instavel(P) && !P.tem("qx", "sempulso"); }, porque: "Há sinal de instabilidade presente.", ref: "CNP p. 78 · AHA 2025, Figuras 6 e 8",
      itens: [{ tipo: "info", t: "Se a causa for taquicardia: cardioversão elétrica sincronizada. Se for bradicardia: atropina. Abra a hipótese correspondente abaixo." },
        { id: "sala", tipo: "acao", t: "Manter na sala de emergência, monitorizado", ref: "CNP p. 78" }] }],
  reav: [{ id: "evol", t: "Evolução", se: function (P) { return P.qtd() > 0; }, ref: "CNP p. 78", repete: 1,
    ops: [{ v: "melhor", t: "Melhorou", prox: "Seguir investigando a causa." }, { v: "igual", t: "Sem mudança", prox: "Rever sinais vitais e achados; completar o que falta investigar." }, { v: "pior", t: "Piorou", prox: "Reavaliar os sinais de instabilidade e atualizar os achados: as hipóteses e a conduta se ajustam." }] }],
  alertas: [],
  destino: { ops: [{ v: "uti", t: "UTI" }, { v: "obs", t: "Observação ou enfermaria" }, { v: "alta", t: "Alta" }], ref: "CNP p. 78" }
};
// ============================== TEXTO LIVRE: termos que o site reconhece ==============================
// l = lista do quadro "sind" onde o achado entra; g = sinal de instabilidade; perg = pergunta respondida "sim". Termos sem acento e em minúsculas.
// Precedido de uma palavra de negação (até 3 palavras antes), o achado conta como ausente.
FLUXO.negacao = ["sem", "nega", "negou", "nao", "ausencia"];
FLUXO.sintomas = [
  { l: "qx", k: "sempulso", t: "Sem pulso", termos: ["sem pulso", "parada cardiaca", "parada cardiorrespiratoria", "pcr", "nao responde"] },
  { l: "qx", k: "disp", t: "Falta de ar", termos: ["falta de ar", "dispneia", "dispneico", "cansaco", "sem ar", "ofegante", "desconforto respiratorio"] },
  { l: "qx", k: "palp", t: "Palpitação", termos: ["palpitacao", "palpitacoes", "coracao acelerado", "taquicardia", "taquicardico"] },
  { l: "qx", k: "lento", t: "Coração lento", termos: ["bradicardia", "bradicardico", "coracao lento", "pulso lento"] },
  { l: "qx", k: "sinc", t: "Desmaio ou tontura", termos: ["desmaio", "desmaiou", "sincope", "tontura", "tonto", "escureceu a vista"] },
  { l: "qx", k: "dorp", t: "Dor no peito", termos: ["dor no peito", "dor toracica", "precordialgia", "aperto no peito"] },
  { l: "qx", k: "edema", t: "Inchaço nas pernas", termos: ["edema", "inchaco", "inchado", "inchada", "pernas inchadas"] },
  { l: "qx", k: "trauma", t: "Trauma", termos: ["trauma", "politrauma", "acidente", "colisao", "capotamento", "atropelado", "atropelamento", "queda", "agressao", "ferimento", "baleado", "esfaqueado", "contusao"] },
  { l: "ef", k: "orto", t: "Ortopneia", termos: ["ortopneia", "piora deitado", "nao consegue deitar"] },
  { l: "ef", k: "estert", t: "Estertores", termos: ["estertor", "estertores", "crepitacao", "crepitacoes", "creptos"] },
  { l: "ef", k: "jug", t: "Turgência jugular", termos: ["turgencia jugular", "estase jugular", "jugular turgida"] },
  { l: "ef", k: "ascite", t: "Ascite", termos: ["ascite"] },
  { l: "ef", k: "frio", t: "Extremidades frias", termos: ["extremidades frias", "pele fria", "maos frias", "frio e umido"] },
  { l: "ef", k: "sono", t: "Sonolência", termos: ["sonolento", "sonolenta", "sonolencia", "rebaixado", "rebaixada", "rebaixamento"] },
  { perg: "remed", t: "Usa remédio que baixa a frequência", termos: ["betabloqueador", "atenolol", "metoprolol", "propranolol", "carvedilol", "bisoprolol", "verapamil", "diltiazem", "digoxina", "digital"] },
  { perg: "pde5", t: "Usou sildenafila ou tadalafila", termos: ["sildenafila", "tadalafila", "viagra", "cialis"] },
  { perg: "asma", t: "Tem asma", termos: ["asma", "asmatico", "asmatica"] },
  { g: "hipo", t: "Hipotensão", termos: ["hipotenso", "hipotensa", "hipotensao", "pressao baixa"] },
  { g: "conf", t: "Confusão aguda", termos: ["confuso", "confusa", "confusao", "desorientado", "desorientada"] },
  { g: "choque", t: "Sinais de choque", termos: ["choque", "chocado", "chocada", "ma perfusao", "mal perfundido"] }];
FLUXO.semProtocolo = { trauma: { t: "Trauma", txt: "Ainda sem protocolo no aplicativo: nenhum dos PDFs enviados traz avaliação primária no trauma. Envie o protocolo de trauma (por exemplo, o de Suporte Avançado de Vida do SAMU 192) para entrar aqui." } };
FLUXO.temas.unshift(SIND);
FLUXO.temas.forEach(function (t) { t.perguntar = PERG[t.id]; });
if (typeof module !== "undefined") module.exports = FLUXO;
