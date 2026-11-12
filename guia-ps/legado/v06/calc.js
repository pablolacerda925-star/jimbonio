// CALCULADORAS — funções puras, sem interface. Testadas em testes/calc.test.js.
var CALC = (function () {
  // Lê número com vírgula ou ponto. Devolve null se não for número finito e positivo.
  function num(v) {
    if (v === null || v === undefined) return null;
    var s = String(v).trim().replace(",", ".");
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    var n = parseFloat(s);
    return isFinite(n) && n > 0 ? n : null;
  }
  function r(x, d) { var k = Math.pow(10, d); return Math.round(x * k) / k; }
  // Preparo do tipo "adicionar N ampolas a X mL de diluente" (volume final = soma).
  function preparo(ap, prep) {
    var mg = prep.amp * ap.mg, volDroga = prep.amp * ap.ml, volFinal = volDroga + prep.dil;
    return { mgTotal: mg, volDroga: volDroga, volDil: prep.dil, volFinal: volFinal, mcgMl: mg * 1000 / volFinal, mgMl: mg / volFinal, ampolas: prep.amp };
  }
  // Bolus em mg a partir da apresentação.
  function bolus(doseMg, ap, lim) {
    var d = num(doseMg);
    if (d === null) return { erro: "Informe a dose em mg (número maior que zero)." };
    if (lim && lim.min && d < lim.min) return { erro: "Dose abaixo da faixa documentada (" + lim.min + " a " + lim.max + " mg)." };
    if (lim && lim.max && d > lim.max) return { erro: "Dose acima da faixa documentada (" + lim.min + " a " + lim.max + " mg)." };
    return { doseMg: d, volMl: r(d / (ap.mg / ap.ml), 2), ampolas: Math.ceil(d / ap.mg - 1e-9) };
  }
  // Dose EV = multiplicador × dose oral diária.
  function mult(oralMg, fator, lim) {
    var o = num(oralMg), f = num(fator);
    if (o === null) return { erro: "Informe a dose oral diária total em mg." };
    if (f === null) return { erro: "Escolha o multiplicador." };
    if (f < lim.min || f > lim.max) return { erro: "Multiplicador fora da faixa documentada (" + lim.min + " a " + lim.max + " vezes)." };
    var d = o * f;
    if (lim.teto && d > lim.teto) return { erro: "A dose calculada (" + r(d, 1) + " mg) passa do teto diário documentado (" + lim.teto + " mg/dia)." };
    return { doseMg: r(d, 1) };
  }
  // Infusão contínua: dose (mcg/min ou mcg/kg/min) -> mL/h.
  function infusao(dose, peso, mcgMl, porKg, lim) {
    var d = num(dose), p = porKg ? num(peso) : 1;
    if (d === null) return { erro: "Informe a dose (número maior que zero)." };
    if (porKg && p === null) return { erro: "Informe o peso em kg." };
    if (porKg && (p < 20 || p > 300)) return { erro: "Peso fora do intervalo aceito pela calculadora de adulto (20 a 300 kg)." };
    if (!mcgMl) return { erro: "Escolha a solução preparada." };
    if (lim && lim.max && d > lim.max) return { erro: "Dose acima do máximo documentado (" + lim.max + ")." };
    var mcgMin = d * p;
    return { mcgMin: r(mcgMin, 2), mlH: r(mcgMin * 60 / mcgMl, 1), aviso: lim && lim.usual && d > lim.usual ? "Acima da faixa usual (até " + lim.usual + ")." : "" };
  }
  // Inverso: mL/h -> dose.
  function inverso(mlH, peso, mcgMl, porKg, lim) {
    var v = num(mlH), p = porKg ? num(peso) : 1;
    if (v === null) return { erro: "Informe a velocidade em mL/h." };
    if (porKg && p === null) return { erro: "Informe o peso em kg." };
    if (porKg && (p < 20 || p > 300)) return { erro: "Peso fora do intervalo aceito pela calculadora de adulto (20 a 300 kg)." };
    if (!mcgMl) return { erro: "Escolha a solução preparada." };
    var d = v * mcgMl / 60 / p;
    if (lim && lim.max && d > lim.max + 1e-9) return { erro: "Essa velocidade corresponde a " + r(d, 2) + ", acima do máximo documentado (" + lim.max + ")." };
    return { dose: r(d, 2), aviso: lim && lim.usual && d > lim.usual ? "Acima da faixa usual (até " + lim.usual + ")." : "" };
  }
  // Bolus por faixa de PAS (tabela documentada). Não interpola nem estende faixas.
  function porPas(pas, faixas) {
    var p = num(pas);
    if (p === null) return { erro: "Informe a PAS em mmHg." };
    for (var i = 0; i < faixas.length; i++) if (p >= faixas[i].de && p <= faixas[i].ate) return { ml: faixas[i].ml };
    return { erro: "PAS de " + p + " mmHg não está em nenhuma faixa documentada." };
  }
  // Bolus por peso: faixa em mg/kg -> mg e mL. Sem peso válido não calcula.
  function bolusKg(faixa, peso, mgMl) {
    var p = num(peso);
    if (p === null) return { erro: "Informe o peso em kg." };
    if (p < 20 || p > 300) return { erro: "Peso fora do intervalo aceito pela calculadora de adulto (20 a 300 kg)." };
    if (!mgMl) return { erro: "Escolha a apresentação." };
    return { mg: [r(faixa[0] * p, 1), r(faixa[1] * p, 1)], ml: [r(faixa[0] * p / mgMl, 1), r(faixa[1] * p / mgMl, 1)] };
  }
  // Infusão em mg/h com solução em mg/mL -> mL/h.
  function infusaoMgH(dose, mgMl, lim) {
    var d = num(dose);
    if (d === null) return { erro: "Informe a dose em mg/h." };
    if (!mgMl) return { erro: "Escolha a solução preparada." };
    if (lim && lim.max && d > lim.max) return { erro: "Dose acima do máximo documentado (" + lim.max + ")." };
    return { mlH: r(d / mgMl, 1) };
  }
  return { bolusKg: bolusKg, infusaoMgH: infusaoMgH, num: num, preparo: preparo, bolus: bolus, mult: mult, infusao: infusao, inverso: inverso, porPas: porPas, r: r };
})();
if (typeof module !== "undefined") module.exports = CALC;
