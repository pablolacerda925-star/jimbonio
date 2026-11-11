// Testes das calculadoras: cada esperado foi calculado à mão (conta no comentário).
var K = require("../src/calc.js"), C = require("../legado/conteudo.js"), ok = 0, fail = 0;
function eq(nome, got, exp) { var p = JSON.stringify(got) === JSON.stringify(exp); (p ? ok++ : fail++); console.log((p ? "OK   " : "FALHA") + " " + nome + (p ? "" : "  obtido=" + JSON.stringify(got) + " esperado=" + JSON.stringify(exp))); }
function med(id) { return C.meds.filter(function (m) { return m.id === id; })[0]; }
function prep(m, pid) { var p = m.preparos.filter(function (x) { return x.id === pid; })[0]; return K.preparo(m.apres[0], p); }
// Preparos (volume final = droga + diluente)
eq("nitroglicerina 1 amp 50 mg/10 mL + 240 mL = 250 mL, 200 mcg/mL", [prep(med("nitroglicerina"), "np1").volFinal, prep(med("nitroglicerina"), "np1").mcgMl], [250, 200]);
eq("nitroprussiato 1 amp + 248 mL = 200 mcg/mL", prep(med("nitroprussiato"), "pp1").mcgMl, 200);
eq("nitroprussiato 2 amp + 246 mL = 400 mcg/mL", prep(med("nitroprussiato"), "pp2").mcgMl, 400);
eq("dobutamina 4 amp (1000 mg) em 250 mL = 4 mg/mL", prep(med("dobutamina"), "dp4").mgMl, 4);
eq("dobutamina 2 amp em 250 mL = 2 mg/mL", prep(med("dobutamina"), "dp2").mgMl, 2);
eq("dobutamina 1 amp em 250 mL = 1 mg/mL", prep(med("dobutamina"), "dp1").mgMl, 1);
eq("noradrenalina 4 amp (16 mg) em 250 mL = 64 mcg/mL", prep(med("noradrenalina"), "nr4").mcgMl, 64);
eq("noradrenalina 8 amp (32 mg) em 250 mL = 128 mcg/mL", prep(med("noradrenalina"), "nr8").mcgMl, 128);
// Furosemida: 40 mg ÷ 10 mg/mL = 4 mL = 2 ampolas
var f = med("furosemida");
eq("furosemida 40 mg", K.bolus("40", f.apres[0], f.esquemas[0]), { doseMg: 40, volMl: 4, ampolas: 2 });
eq("furosemida 20 mg (limite inferior)", K.bolus("20", f.apres[0], f.esquemas[0]), { doseMg: 20, volMl: 2, ampolas: 1 });
eq("furosemida 30 mg = 3 mL, 2 ampolas", K.bolus("30", f.apres[0], f.esquemas[0]), { doseMg: 30, volMl: 3, ampolas: 2 });
eq("furosemida 41 mg bloqueia", !!K.bolus("41", f.apres[0], f.esquemas[0]).erro, true);
eq("furosemida 19 mg bloqueia", !!K.bolus("19", f.apres[0], f.esquemas[0]).erro, true);
eq("furosemida usuário 80 mg/dia × 2 = 160 mg", K.mult("80", "2", f.esquemas[1]), { doseMg: 160 });
eq("furosemida usuário 40 mg/dia × 1,5 = 60 mg", K.mult("40", "1,5", f.esquemas[1]), { doseMg: 60 });
eq("furosemida multiplicador 2,5 bloqueia", !!K.mult("40", "2,5", f.esquemas[1]).erro, true);
eq("furosemida 400 mg/dia × 2 = 800 passa do teto de 600", !!K.mult("400", "2", f.esquemas[1]).erro, true);
// Nitroglicerina 200 mcg/mL: 10 mcg/min × 60 ÷ 200 = 3 mL/h; 20 -> 6; 200 -> 60
var n = med("nitroglicerina").esquemas[0];
eq("nitroglicerina 10 mcg/min = 3 mL/h", K.infusao("10", null, 200, 0, n).mlH, 3);
eq("nitroglicerina 20 mcg/min = 6 mL/h", K.infusao("20", null, 200, 0, n).mlH, 6);
eq("nitroglicerina 200 mcg/min (máximo) = 60 mL/h", K.infusao("200", null, 200, 0, n).mlH, 60);
eq("nitroglicerina 201 mcg/min bloqueia", !!K.infusao("201", null, 200, 0, n).erro, true);
eq("nitroglicerina 5 mL/h = 16,67 mcg/min", K.inverso("5", null, 200, 0, n).dose, 16.67);
eq("nitroglicerina 45 mL/h = 150 mcg/min", K.inverso("45", null, 200, 0, n).dose, 150);
// Nitroprussiato 200 mcg/mL, 70 kg: 0,3 × 70 × 60 ÷ 200 = 6,3 mL/h; 5 -> 105 mL/h
var s = med("nitroprussiato").esquemas[0];
eq("nitroprussiato 0,3 mcg/kg/min, 70 kg = 6,3 mL/h", K.infusao("0,3", "70", 200, 1, s).mlH, 6.3);
eq("nitroprussiato 5 mcg/kg/min (máximo), 70 kg = 105 mL/h", K.infusao("5", "70", 200, 1, s).mlH, 105);
eq("nitroprussiato 5,1 bloqueia", !!K.infusao("5,1", "70", 200, 1, s).erro, true);
eq("nitroprussiato sem peso bloqueia", !!K.infusao("1", "", 200, 1, s).erro, true);
// Dobutamina 4 mg/mL = 4000 mcg/mL, 70 kg: 5 × 70 × 60 ÷ 4000 = 5,25 -> 5,3 mL/h (1 casa); 15 mL/h -> 15×4000÷60÷70 = 14,29
var d = med("dobutamina").esquemas[0];
eq("dobutamina 5 mcg/kg/min, 70 kg, 4 mg/mL = 5,3 mL/h", K.infusao("5", "70", 4000, 1, d).mlH, 5.3);
eq("dobutamina 15 mL/h, 70 kg, 4 mg/mL = 14,29 mcg/kg/min (o PDF arredonda para 14)", K.inverso("15", "70", 4000, 1, d).dose, 14.29);
eq("dobutamina 2 mL/h, 70 kg, 4 mg/mL = 1,9 mcg/kg/min", K.inverso("2", "70", 4000, 1, d).dose, 1.9);
eq("dobutamina 25 mcg/kg/min avisa acima do usual", !!K.infusao("25", "70", 4000, 1, d).aviso, true);
eq("dobutamina 41 bloqueia", !!K.infusao("41", "70", 4000, 1, d).erro, true);
// Noradrenalina 64 mcg/mL, 70 kg: 0,2 × 70 × 60 ÷ 64 = 13,125 -> 13,1 mL/h (o PDF arredonda para 14); 35 mL/h -> 0,53
var o = med("noradrenalina").esquemas[0];
eq("noradrenalina 0,2 mcg/kg/min, 70 kg, 64 mcg/mL = 13,1 mL/h", K.infusao("0,2", "70", 64, 1, o).mlH, 13.1);
eq("noradrenalina 35 mL/h, 70 kg = 0,53 mcg/kg/min", K.inverso("35", "70", 64, 1, o).dose, 0.53);
eq("noradrenalina 2,1 bloqueia", !!K.infusao("2,1", "70", 64, 1, o).erro, true);
// Bolus por PAS (PSZ2): 160-179 -> 3; 180-199 -> 4; > 200 -> 5; 200 exato e < 160 sem faixa
var b = med("nitroglicerina").esquemas[1].faixas;
eq("PAS 160 = 3 mL", K.porPas("160", b), { ml: 3 }); eq("PAS 179 = 3 mL", K.porPas("179", b), { ml: 3 });
eq("PAS 180 = 4 mL", K.porPas("180", b), { ml: 4 }); eq("PAS 199 = 4 mL", K.porPas("199", b), { ml: 4 });
eq("PAS 201 = 5 mL", K.porPas("201", b), { ml: 5 }); eq("PAS 200 exato não tem faixa", !!K.porPas("200", b).erro, true);
eq("PAS 150 não tem faixa", !!K.porPas("150", b).erro, true);
// Entradas inválidas
eq("texto não é número", K.num("abc"), null); eq("zero não é aceito", K.num("0"), null); eq("negativo não é aceito", K.num("-5"), null);
eq("unidade junto do número não é aceita", K.num("70kg"), null); eq("vírgula decimal", K.num("0,3"), 0.3); eq("vazio", K.num(""), null);
eq("peso 500 kg bloqueia", !!K.infusao("1", "500", 200, 1, s).erro, true); eq("sem solução bloqueia", !!K.infusao("1", "70", null, 1, s).erro, true);
// ---------- Medicamentos do lote 1: números lidos de src/fluxo.js ----------
var F = require("../src/fluxo.js"), M = F.meds;
function fx(id, d, a) { return K.bolus(M[id].doses[d], M[id].aps[a || 0], null); }
// Adrenalina na PCR: 1 mg ÷ 1 mg/mL = 1 mL = 1 ampola
eq("adrenalina PCR 1 mg = 1 mL, 1 ampola", fx("adrenalinaPcr", 0), { doseMg: 1, volMl: 1, ampolas: 1 });
// Amiodarona 150 mg/3 mL = 50 mg/mL: 300 ÷ 50 = 6 mL = 2 ampolas; 150 ÷ 50 = 3 mL = 1 ampola
eq("amiodarona PCR 300 mg = 6 mL, 2 ampolas", fx("amiodaronaPcr", 0), { doseMg: 300, volMl: 6, ampolas: 2 });
eq("amiodarona PCR 150 mg = 3 mL, 1 ampola", fx("amiodaronaPcr", 1), { doseMg: 150, volMl: 3, ampolas: 1 });
eq("amiodarona TV 150 mg = 3 mL, 1 ampola", fx("amiodaronaTv", 0), { doseMg: 150, volMl: 3, ampolas: 1 });
eq("amiodarona FA 300 mg = 6 mL, 2 ampolas", fx("amiodaronaFa", 0), { doseMg: 300, volMl: 6, ampolas: 2 });
// Adenosina 6 mg/2 mL = 3 mg/mL: 6 ÷ 3 = 2 mL; 12 ÷ 3 = 4 mL = 2 ampolas
eq("adenosina 6 mg = 2 mL, 1 ampola", fx("adenosina", 0), { doseMg: 6, volMl: 2, ampolas: 1 });
eq("adenosina 12 mg = 4 mL, 2 ampolas", fx("adenosina", 1), { doseMg: 12, volMl: 4, ampolas: 2 });
// Metoprolol 5 mg/5 mL = 1 mg/mL: 5 mL
eq("metoprolol 5 mg = 5 mL, 1 ampola", fx("metoprolol", 0), { doseMg: 5, volMl: 5, ampolas: 1 });
// Atropina 1 mg: ampola 0,25 mg/mL -> 1 ÷ 0,25 = 4 mL = 4 ampolas; ampola 0,5 mg/mL -> 2 mL = 2 ampolas
eq("atropina 1 mg com ampola 0,25 mg/mL = 4 mL, 4 ampolas", fx("atropina", 0, 0), { doseMg: 1, volMl: 4, ampolas: 4 });
eq("atropina 1 mg com ampola 0,5 mg/mL = 2 mL, 2 ampolas", fx("atropina", 0, 1), { doseMg: 1, volMl: 2, ampolas: 2 });
// Magnésio: 10% = 1 g/10 mL = 100 mg/mL: 1 g -> 10 mL (1 ampola), 2 g -> 20 mL (2 ampolas); 50% = 500 mg/mL: 2 g -> 4 mL
eq("magnésio 1 g a 10% = 10 mL", fx("magnesio", 0, 0), { doseMg: 1000, volMl: 10, ampolas: 1 });
eq("magnésio 2 g a 10% = 20 mL, 2 ampolas", fx("magnesio", 1, 0), { doseMg: 2000, volMl: 20, ampolas: 2 });
eq("magnésio 2 g a 50% = 4 mL", fx("magnesio", 1, 1), { doseMg: 2000, volMl: 4, ampolas: 1 });
// Lidocaína 2% = 20 mg/mL. 70 kg: 1 a 1,5 mg/kg = 70 a 105 mg = 3,5 a 5,25 (5,3) mL
var li = M.lidocainaPcr, lmg = li.aps[0].mg / li.aps[0].ml;
eq("lidocaína 1ª dose, 70 kg: 70 a 105 mg = 3,5 a 5,3 mL", K.bolusKg(li.faixas[0].mgKg, "70", lmg), { mg: [70, 105], ml: [3.5, 5.3] });
// 2ª dose: 0,5 a 0,75 mg/kg = 35 a 52,5 mg = 1,75 (1,8) a 2,625 (2,6) mL
eq("lidocaína 2ª dose, 70 kg: 35 a 52,5 mg = 1,8 a 2,6 mL", K.bolusKg(li.faixas[1].mgKg, "70", lmg), { mg: [35, 52.5], ml: [1.8, 2.6] });
eq("lidocaína sem peso bloqueia", !!K.bolusKg(li.faixas[0].mgKg, "", 20).erro, true);
eq("lidocaína peso 10 kg bloqueia", !!K.bolusKg(li.faixas[0].mgKg, "10", 20).erro, true);
function prepDoc(id, i) { var m = M[id], x = m.preps[i || 0]; return K.preparo(m.aps[x.ap], x); }
// Amiodarona manutenção: 6 ampolas (900 mg, 18 mL) + 482 mL = 500 mL -> 1,8 mg/mL = 1800 mcg/mL
eq("amiodarona 6 amp + 482 mL = 500 mL, 1,8 mg/mL", [prepDoc("amiodaronaTvManut").volFinal, prepDoc("amiodaronaTvManut").mgMl, prepDoc("amiodaronaFaManut").mcgMl], [500, 1.8, 1800]);
// TV: 1 mg/min = 1000 mcg/min × 60 ÷ 1800 = 33,3 mL/h; 0,5 mg/min = 16,7 mL/h
eq("amiodarona 1 mg/min = 33,3 mL/h", K.infusao(1 * M.amiodaronaTvManut.fator, null, 1800, 0, null).mlH, 33.3);
eq("amiodarona 0,5 mg/min = 16,7 mL/h", K.infusao(0.5 * M.amiodaronaTvManut.fator, null, 1800, 0, null).mlH, 16.7);
// FA: 10 mg/h ÷ 1,8 = 5,56 (5,6) mL/h; 50 ÷ 1,8 = 27,78 (27,8) mL/h
eq("amiodarona FA 10 mg/h = 5,6 mL/h", K.infusaoMgH(M.amiodaronaFaManut.ini[0], 1.8, M.amiodaronaFaManut).mlH, 5.6);
eq("amiodarona FA 50 mg/h = 27,8 mL/h", K.infusaoMgH(M.amiodaronaFaManut.ini[1], 1.8, M.amiodaronaFaManut).mlH, 27.8);
eq("amiodarona FA 51 mg/h bloqueia", !!K.infusaoMgH("51", 1.8, M.amiodaronaFaManut).erro, true);
// Adrenalina em bomba: 6 ampolas (6 mg, 6 mL) + 94 mL = 100 mL -> 60 mcg/mL; 2 mcg/min = 2 mL/h; 10 = 10 mL/h
eq("adrenalina 6 amp + 94 mL = 60 mcg/mL", prepDoc("adrenalinaInf", 0).mcgMl, 60);
// 10 ampolas (10 mg, 10 mL) + 90 mL = 100 mL -> 100 mcg/mL; 2 mcg/min × 60 ÷ 100 = 1,2 mL/h
eq("adrenalina 10 amp + 90 mL = 100 mcg/mL", prepDoc("adrenalinaInf", 1).mcgMl, 100);
eq("adrenalina 2 mcg/min a 60 mcg/mL = 2 mL/h", K.infusao(M.adrenalinaInf.ini[0], null, 60, 0, M.adrenalinaInf).mlH, 2);
eq("adrenalina 2 mcg/min a 100 mcg/mL = 1,2 mL/h", K.infusao(M.adrenalinaInf.ini[0], null, 100, 0, M.adrenalinaInf).mlH, 1.2);
eq("adrenalina 10 mcg/min a 60 mcg/mL = 10 mL/h", K.infusao(M.adrenalinaInf.max, null, 60, 0, M.adrenalinaInf).mlH, 10);
eq("adrenalina 11 mcg/min bloqueia", !!K.infusao("11", null, 60, 0, M.adrenalinaInf).erro, true);
// Dopamina: 5 ampolas (250 mg, 50 mL) + 200 mL = 250 mL -> 1000 mcg/mL. 70 kg: 5 × 70 = 350 mcg/min × 60 ÷ 1000 = 21 mL/h; 20 × 70 = 1400 -> 84 mL/h
eq("dopamina 5 amp + 200 mL = 1000 mcg/mL", prepDoc("dopamina").mcgMl, 1000);
eq("dopamina 5 mcg/kg/min, 70 kg = 21 mL/h", K.infusao(M.dopamina.ini[0], "70", 1000, 1, M.dopamina).mlH, 21);
eq("dopamina 20 mcg/kg/min, 70 kg = 84 mL/h", K.infusao(M.dopamina.max, "70", 1000, 1, M.dopamina).mlH, 84);
eq("dopamina sem peso bloqueia", !!K.infusao("5", "", 1000, 1, M.dopamina).erro, true);
// Preparos da IC conferem com a concentração declarada no conteúdo
["nitroglicerina", "nitroprussiato", "dobutamina", "noradrenalina", "adrenalinaInf", "dopamina", "amiodaronaTvManut"].forEach(function (k) { eq(k + ": preparo do documento = " + M[k].conc + " mcg/mL", prepDoc(k).mcgMl, M[k].conc); });
// Estrutura: tudo tem fonte; todo medicamento citado existe
var falt = [];
F.temas.forEach(function (t) {
  if (!t.refSobre) falt.push(t.id + " sem refSobre");
  t.agora.concat(t.investigar, t.exames, t.reav, t.passos).forEach(function (x) { if (!x.ref) falt.push(t.id + "." + x.id + " sem ref"); });
  if (t.gravidade && !t.gravidade.ref) falt.push(t.id + " gravidade sem ref"); if (!t.destino.ref) falt.push(t.id + " destino sem ref");
  t.passos.forEach(function (s) { s.itens.forEach(function (i) { if (i.tipo === "med" && !M[i.med]) falt.push(t.id + " med " + i.med); if (i.tipo === "acao" && !i.ref) falt.push(t.id + "." + s.id + "." + i.id + " sem ref"); }); });
  t.alertas.forEach(function (a) { if (a.ir && !F.temas.some(function (x) { return x.id === a.ir; })) falt.push(t.id + " alerta -> " + a.ir); }); });
Object.keys(M).forEach(function (k) { if (!M[k].ref) falt.push("med " + k + " sem ref"); if (!M[k].ind) falt.push("med " + k + " sem indicação"); });
eq("todo item tem fonte e todo medicamento citado existe", falt, []);
console.log("\n" + ok + " passaram, " + fail + " falharam");
