// INTERFACE — uma decisão por tela. Nenhuma dose ou critério aqui: tudo vem de FLUXO.
(function () {
  var F = FLUXO, app = document.getElementById("app"), LS = null;
  try { localStorage.setItem("g2.t", "1"); localStorage.removeItem("g2.t"); LS = localStorage; } catch (e) { }
  var S = { tela: "home", q: "", casos: [], seq: 0, ativo: null, rap: null, painel: null, med: null, erro: "", aviso: null };
  try { var g = JSON.parse((LS && LS.getItem("g2.casos")) || "null"); if (g) { S.casos = g.casos; S.seq = g.seq; } } catch (e) { }
  function salvar() { try { LS && LS.setItem("g2.casos", JSON.stringify({ casos: S.casos, seq: S.seq })); } catch (e) { } }
  function novo(tema, rot) { var t = tm(tema); return { id: null, rot: rot || "", tema: tema, no: t.inicio, pilha: [], v: {}, chips: {}, meds: {}, log: [], refs: [], tmp: {}, criado: Date.now() }; }
  function tm(id) { return F.temas.filter(function (t) { return t.id === id; })[0]; }
  function caso() { return S.ativo ? S.casos.filter(function (c) { return c.id === S.ativo; })[0] : S.rap; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function hm(t) { var d = new Date(t); return p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function vg(n) { return String(n).replace(".", ","); }
  function log(c, x) { c.log.push({ t: Date.now(), x: x }); if (c.id) salvar(); }
  function perfil(v) { if (v.cong == null || v.perf == null) return null; return v.cong ? (v.perf ? "C" : "B") : (v.perf ? "L" : "A"); }
  var NOME = { A: "A · quente e seco", B: "B · quente e úmido", C: "C · frio e úmido", L: "L · frio e seco" };
  function vale(c, se) {
    if (se.perfil && perfil(c.v) !== se.perfil) return false;
    if (se.pasMax != null && !(c.v.pas <= se.pasMax)) return false;
    if (se.pasMin != null && !(c.v.pas >= se.pasMin)) return false;
    if (se.v) for (var k in se.v) if (c.v[k] !== se.v[k]) return false;
    return true;
  }
  function ir(c, alvo, empilha) {
    var t = tm(c.tema); if (empilha !== false) c.pilha.push(c.no);
    for (var i = 0; i < 6; i++) {
      var n = t.nos[alvo];
      if (n.tipo === "rota") { alvo = n.regras.filter(function (r) { return vale(c, r.se); })[0].ir; continue; }
      if (n.tipo === "reav" && !(c.meds[n.gatilho] && c.meds[n.gatilho].st === "dado")) { alvo = n.pular; continue; }
      break;
    }
    c.no = alvo; c.tmp = {}; S.erro = ""; var r = t.nos[alvo].ref; if (r && c.refs.indexOf(r) < 0) c.refs.push(r);
    if (c.id) salvar();
  }
  function medsDe(t) { var l = []; Object.keys(t.nos).forEach(function (k) { var n = t.nos[k]; if (n.tipo === "med" && l.indexOf(n.med) < 0) l.push(n.med); }); return l; }
  function temaDoMed(id) { return F.temas.filter(function (t) { return medsDe(t).indexOf(id) >= 0; })[0]; }
  function pesoOk(p) { var k = CALC.num(p); return !!(k && k >= 20 && k <= 300); }
  // ---------- cálculo das doses a partir do conteúdo ----------
  function mlh(m, dose, peso) { var r = m.mgMl ? CALC.infusaoMgH(dose, m.mgMl, null) : CALC.infusao(dose, peso, m.conc, m.porKg, null); return r.erro ? null : r.mlH; }
  function fixo(m) { var b = CALC.bolus(m.mg, m.ap, null); return { ml: b.volMl, amp: b.ampolas }; }
  function faixaMl(m, par, peso) { var a = mlh(m, par[0], peso), b = mlh(m, par[1], peso); return a === b ? vg(a) : vg(a) + " a " + vg(b); }

  // ---------- telas ----------
  function topo() {
    var c = caso(), fu = c && c.meds.furosemida, lem = fu && fu.st === "dado" && !c.reavOk ? '<div class="lem">Reavaliar diurese às ' + hm(fu.t + 6 * 3600000) + "</div>" : "";
    if (c && !c.fim && tm(c.tema).nos[c.no].e < 4) medsDe(tm(c.tema)).forEach(function (k) { var m = F.meds[k], j = c.meds[k]; if (m.lembra && j && j.st === "dado") lem += '<div class="lem">' + esc(m.lembra.t) + " " + hm(j.t + m.lembra.min * 60000) + "</div>"; });
    return '<header><button class="marca" data-a="home">Guia de PS</button><input id="q" type="search" autocomplete="off" placeholder="Queixa, doença ou medicamento" value="' + esc(S.q) + '"><button class="novo" data-a="novo">+ Novo atendimento</button></header>' +
      (c && c.id ? '<div class="pac">' + esc(c.rot || "Sem nome") + " · " + c.id + ' <button class="lk" data-a="lista">trocar</button></div>' : "") + lem + '<div id="res">' + resultados() + "</div>";
  }
  function resultados() {
    var n = norm(S.q).trim(); if (!n) return "";
    var h = F.temas.filter(function (t) { return norm(t.nome).indexOf(n) >= 0 || t.busca.some(function (b) { return b.indexOf(n) >= 0; }); })
      .map(function (t) { return '<button class="op sec" data-a="tema" data-id="' + t.id + '">' + esc(t.nome) + "</button>"; }).join("") +
      Object.keys(F.meds).filter(function (k) { return temaDoMed(k) && F.meds[k].busca.some(function (b) { return b.indexOf(n) >= 0; }); })
        .map(function (k) { return '<button class="op sec" data-a="medsolto" data-id="' + k + '">' + esc(F.meds[k].nome) + " <small>" + esc(temaDoMed(k).curto) + "</small></button>"; }).join("");
    return h || '<p class="fraco">Nada encontrado.</p>';
  }
  function home() {
    var h = "<main><h1>O que chegou?</h1>";
    function grupo(tit, f) { var l = F.temas.filter(f); return l.length ? '<p class="rot">' + tit + "</p>" + l.map(function (t) { return '<button class="op" data-a="tema" data-id="' + t.id + '">' + esc(t.nome) + " <span>→</span></button>"; }).join("") : ""; }
    h += grupo("Atendimento imediato", function (t) { return t.imediato; }) + grupo("Frequentes", function (t) { return t.frequente && !t.imediato; });
    var ab = S.casos.filter(function (c) { return !c.fim; });
    if (ab.length) h += '<p class="rot">Em atendimento</p>' + ab.map(function (c) { return '<button class="op sec" data-a="abrir" data-id="' + c.id + '">' + esc(c.rot || "Sem nome") + " <small>" + c.id + " · " + hm(c.criado) + "</small></button>"; }).join("");
    return h + "</main>";
  }
  function botoes(ops, c) {
    var sug = -1; ops.forEach(function (o, i) { if ((o.sug && vale(c, o.sug)) || (o.sug2 && c.v[o.sug2])) sug = i; });
    return ops.map(function (o, i) { var pri = sug >= 0 ? i === sug : (i === 0 && !o.sec); return '<button class="op' + (pri ? "" : " sec") + '" data-a="op" data-i="' + i + '">' + esc(o.t) + (i === sug ? " <small>sugerido</small>" : "") + (pri ? " <span>→</span>" : "") + "</button>"; }).join("");
  }
  function cartaoMed(id, c, solto) {
    var m = F.meds[id], t = c.tmp, h = "<h2>" + esc(m.nome) + "</h2>", ja = c.meds[id];
    if (ja && solto) h += '<p class="fraco">' + (ja.st === "dado" ? "Dado às " + hm(ja.t) + (ja.txt ? " · " + esc(ja.txt) : "") : ja.st === "nao" ? "Não dado" : "Não tem aqui") + "</p>";
    if (m.modo === "furo") {
      h += '<p class="linha">' + esc(m.linha) + '</p><p class="rot">Usa diurético em casa?</p><div class="pils">' + [["n", "Não"], ["s", "Sim"]].map(function (o) { return '<button class="pil' + (t.uso === o[0] ? " on" : "") + '" data-a="uso" data-v="' + o[0] + '">' + o[1] + "</button>"; }).join("") + "</div>";
      var doses = [];
      if (t.uso === "n") doses = m.semUso;
      if (t.uso === "s") { h += '<input class="num" id="oral" data-a="oral" inputmode="decimal" placeholder="mg por dia, por boca" value="' + esc(t.oral || "") + '">'; var o = CALC.num(t.oral); if (o) doses = m.fator.map(function (f) { return o * f; }); }
      if (doses.length) h += '<p class="rot">Dose</p><div class="pils">' + doses.map(function (d) {
        var fora = d > m.teto; return '<button class="pil gr' + (t.dose === d ? " on" : "") + '"' + (fora ? " disabled" : "") + ' data-a="dose" data-v="' + d + '"><b>' + vg(d) + " mg</b><small>" + (fora ? "passa de " + m.teto + " mg/dia" : vg(CALC.r(d / (m.mg / m.ml), 1)) + " mL") + "</small></button>";
      }).join("") + "</div>";
    } else if (m.modo === "fixo") {
      var fx = fixo(m);
      h += '<div class="dose"><small>Dose</small><b>' + vg(m.mg) + ' mg</b></div><p class="linha">' + vg(fx.ml) + " mL · " + fx.amp + (fx.amp > 1 ? " ampolas" : " ampola") + " de " + esc(m.apTxt) + "</p>" +
        (m.linhas || []).map(function (l) { return '<p class="linha">' + esc(l) + "</p>"; }).join("") + (m.evitar ? '<p class="linha al">' + esc(m.evitar) + "</p>" : "");
    } else if (m.modo === "kg") {
      h += '<p class="rot">Peso (kg)</p><input class="num" id="peso" data-a="peso" inputmode="decimal" placeholder="Peso em kg" value="' + esc(c.v.peso || "") + '">';
      if (c.v.peso && !pesoOk(c.v.peso)) h += '<p class="err">Peso entre 20 e 300 kg, só números.</p>';
      var bk = CALC.bolusKg(m.mgKg, c.v.peso, m.mgMl);
      if (!bk.erro) h += '<div class="dose"><small>Dose</small><b>' + vg(bk.ml[0]) + " a " + vg(bk.ml[1]) + ' mL</b></div><p class="linha">' + vg(bk.mg[0]) + " a " + vg(bk.mg[1]) + " mg</p>";
      h += (m.linhas || []).map(function (l) { return '<p class="linha">' + esc(l) + "</p>"; }).join("");
    } else {
      h += '<p class="linha">' + esc(m.prep) + "</p>" + (m.extra ? '<p class="linha">' + esc(m.extra) + "</p>" : "");
      var peso = c.v.peso;
      if (m.porKg) h += '<p class="rot">Peso (kg)</p><input class="num" id="peso" data-a="peso" inputmode="decimal" placeholder="Peso em kg" value="' + esc(peso || "") + '">';
      var pk = CALC.num(peso), pok = !m.porKg || (pk && pk >= 20 && pk <= 300);
      if (m.porKg && peso && !pok) h += '<p class="err">Peso entre 20 e 300 kg, só números.</p>';
      if (pok) {
        var bol = m.bolus && c.v.pas >= m.bolus.pasMin;
        if (bol) h += '<div class="pils"><button class="pil' + (t.scape ? " on" : "") + '" data-a="scape">' + esc(m.bolus.t) + "</button></div>";
        if (bol && t.scape) { var b = CALC.porPas(c.v.pas, m.bolus.faixas); h += b.erro ? '<p class="err">PAS ' + c.v.pas + ": sem faixa de bolus no protocolo</p>" : '<div class="dose"><small>Bolus agora</small><b>' + b.ml + " mL</b></div><p class=\"linha\">" + esc(m.bolus.depois) + "</p>"; }
        else {
          h += '<div class="dose"><small>Começar</small><b>' + faixaMl(m, m.ini, peso) + " mL/h</b></div>";
          if (m.manter) h += '<div class="dose m"><small>Manter</small><b>' + faixaMl(m, m.manter, peso) + " mL/h</b></div>";
          h += '<p class="linha">' + esc(m.passo) + (m.max ? " · máximo " + vg(mlh(m, m.max, peso)) + " mL/h" : "") + "</p>";
        }
        if (m.evitar) h += '<p class="linha al">' + esc(m.evitar) + "</p>";
      }
    }
    if (S.erro) h += '<p class="err">' + esc(S.erro) + "</p>";
    if (!solto || c.id) h += '<button class="op" data-a="dar" data-id="' + id + '">' + (m.modo === "inf" ? "Iniciei" : "Dei") + ' <span>→</span></button><button class="op sec" data-a="naodar" data-id="' + id + '" data-st="nao">Não vou dar</button><button class="op sec" data-a="naodar" data-id="' + id + '" data-st="sem">Não tem aqui</button>';
    return h;
  }
  function txtDose(id, c) {
    var m = F.meds[id], t = c.tmp;
    if (m.modo === "furo") return t.dose ? vg(t.dose) + " mg (" + vg(CALC.r(t.dose / (m.mg / m.ml), 1)) + " mL)" : null;
    if (m.modo === "fixo") return vg(m.mg) + " mg (" + vg(fixo(m).ml) + " mL)";
    if (m.modo === "kg") { var bk = CALC.bolusKg(m.mgKg, c.v.peso, m.mgMl); return bk.erro ? null : vg(bk.mg[0]) + " a " + vg(bk.mg[1]) + " mg (" + vg(bk.ml[0]) + " a " + vg(bk.ml[1]) + " mL)"; }
    var pk = CALC.num(c.v.peso); if (m.porKg && !(pk && pk >= 20 && pk <= 300)) return null;
    if (m.bolus && t.scape) { var b = CALC.porPas(c.v.pas, m.bolus.faixas); return b.erro ? null : "bolus " + b.ml + " mL, depois 30 mL/h"; }
    return faixaMl(m, m.ini, c.v.peso) + " mL/h";
  }
  function fluxo() {
    var c = caso(), t = tm(c.tema), n = t.nos[c.no], h = '<main><p class="mig">' + esc(t.nome) + "</p>";
    h += '<div class="prog">' + t.etapas.map(function (e, i) { return "<i" + (i <= n.e ? ' class="on"' : "") + "></i>"; }).join("") + '</div><p class="etapa">Etapa ' + (n.e + 1) + " de " + t.etapas.length + " · " + t.etapas[n.e] +
      (perfil(c.v) ? " · Perfil " + NOME[perfil(c.v)] : "") + (c.v.pas ? " · PAS " + c.v.pas : "") + "</p>";
    if (n.faixa) h += '<div class="uti">' + esc(n.faixa) + "</div>";
    if (S.aviso) h += "<h2>" + esc(S.aviso.msg) + '</h2><button class="op" data-a="avok">Continuar <span>→</span></button>';
    else if (n.tipo === "pergunta") h += "<h2>" + esc(n.t) + "</h2>" + botoes(n.ops, c);
    else if (n.tipo === "acao") h += "<h2>" + esc(n.t) + "</h2>" + (n.linhas || []).map(function (l) { return '<p class="grande">' + esc(l) + "</p>"; }).join("") +
      (n.chips ? '<div class="pils">' + n.chips.map(function (x) { return '<span class="pil est">' + esc(x) + "</span>"; }).join("") + "</div>" : "") + botoes(n.ops, c);
    else if (n.tipo === "sinais") {
      var sel = c.chips[c.no] || [];
      h += "<h2>" + esc(n.t) + '</h2><p class="fraco">Toque no que o paciente tem</p><div class="pils">' + n.chips.map(function (x, i) { return '<button class="pil' + (sel.indexOf(i) >= 0 ? " on" : "") + '" data-a="chip" data-i="' + i + '">' + esc(x) + "</button>"; }).join("") + "</div>" +
        '<button class="op' + (sel.length ? "" : " sec") + '" data-a="sn" data-v="1">' + esc(n.sim) + (sel.length ? " <small>sugerido</small> <span>→</span>" : "") + '</button><button class="op sec" data-a="sn" data-v="0">' + esc(n.nao) + "</button>";
    }
    else if (n.tipo === "numero") h += "<h2>" + esc(n.t) + '</h2><input class="num big" id="nv" inputmode="numeric" placeholder="' + n.un + '" value="' + esc(c.v[n.var] || "") + '">' + (S.erro ? '<p class="err">' + esc(S.erro) + "</p>" : "") + '<button class="op" data-a="num">Continuar <span>→</span></button>';
    else if (n.tipo === "med") h += cartaoMed(n.med, c, false);
    else if (n.tipo === "reav") { var fu = c.meds[n.gatilho]; h += '<p class="fraco">Furosemida às ' + hm(fu.t) + " · reavaliar às " + hm(fu.t + n.horas * 3600000) + "</p><h2>" + esc(n.t) + "</h2>" + botoes(n.ops, c); }
    else if (n.tipo === "fim") h += "<h2>" + esc(n.t) + '</h2><textarea id="rs" readonly rows="9">' + esc(resumo(c)) + '</textarea><button class="op" data-a="copiar">Copiar resumo</button><button class="op sec" data-a="home">Início</button>';
    if (c.pilha.length && n.tipo !== "fim" && !S.aviso) h += '<button class="lk" data-a="voltar">← Voltar</button>';
    h += '<div class="pe">' + [["hist", "Histórico"], ["meds", "Medicamentos"], ["refs", "Referências"]].map(function (p) { return '<button class="lk' + (S.painel === p[0] ? " on" : "") + '" data-a="painel" data-p="' + p[0] + '">' + p[1] + " ▾</button>"; }).join("") + "</div>";
    if (S.painel === "hist") h += '<div class="gav">' + (c.log.length ? c.log.slice().reverse().map(function (l) { return "<p><b>" + hm(l.t) + "</b> " + esc(l.x) + "</p>"; }).join("") : '<p class="fraco">Nada ainda.</p>') + "</div>";
    if (S.painel === "meds") h += '<div class="gav">' + medsDe(t).map(function (k) { var j = c.meds[k]; return '<button class="op sec" data-a="medsolto" data-id="' + k + '">' + esc(F.meds[k].nome) + (j ? " <small>" + (j.st === "dado" ? "dado " + hm(j.t) : j.st === "nao" ? "não dado" : "não tem") + "</small>" : "") + "</button>"; }).join("") + "</div>";
    if (S.painel === "refs") h += '<div class="gav">' + c.refs.concat(Object.keys(c.meds).map(function (k) { return F.meds[k].ref; })).filter(function (r, i, a) { return a.indexOf(r) === i; }).map(function (r) { return "<p>" + esc(r) + "</p>"; }).join("") + F.notas.map(function (x) { return '<p class="fraco">' + esc(x) + "</p>"; }).join("") + '<p class="fraco">Conteúdo ' + F.versao + " · apoio à decisão</p></div>";
    return h + "</main>";
  }
  function medSolto() { var tt = temaDoMed(S.med), c = caso(); return '<main><p class="mig">Medicamento · ' + esc(tt.curto) + "</p>" + cartaoMed(S.med, c, true) + '<button class="lk" data-a="fecharmed">← Voltar</button></main>'; }
  function lista() {
    return '<main><h1>Atendimentos</h1>' + (S.casos.length ? S.casos.map(function (c) { return '<button class="op sec" data-a="abrir" data-id="' + c.id + '">' + esc(c.rot || "Sem nome") + " <small>" + c.id + " · " + hm(c.criado) + (c.fim ? " · encerrado" : "") + "</small></button>"; }).join("") : '<p class="fraco">Nenhum.</p>') + '<button class="lk" data-a="home">← Início</button></main>';
  }
  function pedirNome() { return '<main><h1>Novo atendimento</h1><input class="num big" id="rot" placeholder="Iniciais ou leito (opcional)"><p class="rot">O que chegou?</p>' + F.temas.map(function (t) { return '<button class="op" data-a="criar" data-id="' + t.id + '">' + esc(t.nome) + " <span>→</span></button>"; }).join("") + '<button class="lk" data-a="home">← Cancelar</button></main>'; }
  function resumo(c) {
    var L = [(c.rot || "Paciente") + (c.id ? " · " + c.id : ""), tm(c.tema).nome, [tm(c.tema).perfil ? "Perfil " + (perfil(c.v) ? NOME[perfil(c.v)] : "não definido") : "", c.v.pas ? "PAS " + c.v.pas : "", c.v.peso ? c.v.peso + " kg" : ""].filter(Boolean).join(" · "), ""];
    c.log.forEach(function (l) { L.push(hm(l.t) + " " + l.x); });
    var fu = c.meds.furosemida; if (fu && fu.st === "dado" && !c.reavOk) L.push("", "PENDENTE: reavaliar diurese às " + hm(fu.t + 6 * 3600000));
    return L.join("\n");
  }
  function render() {
    var v = S.tela === "fluxo" ? fluxo() : S.tela === "med" ? medSolto() : S.tela === "lista" ? lista() : S.tela === "nome" ? pedirNome() : home();
    app.innerHTML = topo() + v;
  }
  // ---------- eventos ----------
  app.addEventListener("input", function (ev) {
    var e = ev.target, c = caso();
    if (e.id === "q") { S.q = e.value; document.getElementById("res").innerHTML = resultados(); }
    if (e.id === "oral" || e.id === "peso") {
      if (e.id === "oral") { c.tmp.oral = e.value; c.tmp.dose = null; } else c.v.peso = e.value;
      S.erro = ""; render(); var el = document.getElementById(e.id); el.focus(); try { el.setSelectionRange(el.value.length, el.value.length); } catch (x) { }
    }
  });
  app.addEventListener("change", function (ev) { var e = ev.target, c = caso(); if (e.id === "peso" && c && c.id && CALC.num(e.value)) log(c, "Peso " + e.value + " kg"); });
  app.addEventListener("keydown", function (ev) { if (ev.key === "Enter" && ev.target.id === "nv") app.querySelector('[data-a="num"]').click(); if (ev.key === "Enter" && (ev.target.id === "oral" || ev.target.id === "peso")) ev.target.blur(); });
  app.addEventListener("click", function (ev) {
    var e = ev.target.closest("[data-a]"); if (!e || e.tagName === "INPUT") return;
    var a = e.dataset.a, c = caso(), t = c && tm(c.tema), n = c && t.nos[c.no];
    if (a === "home") { S.tela = "home"; S.q = ""; }
    else if (a === "novo") S.tela = "nome";
    else if (a === "criar") { var x = novo(e.dataset.id, document.getElementById("rot").value.trim()); S.seq++; x.id = "AT-" + ("000" + S.seq).slice(-4); S.casos.push(x); S.ativo = x.id; S.tela = "fluxo"; S.q = ""; salvar(); }
    else if (a === "tema") { if (!c || c.tema !== e.dataset.id || c.fim) { S.ativo = null; S.rap = novo(e.dataset.id); } S.tela = "fluxo"; S.q = ""; }
    else if (a === "abrir") { S.ativo = e.dataset.id; S.tela = "fluxo"; S.aviso = null; }
    else if (a === "lista") S.tela = "lista";
    else if (a === "painel") S.painel = S.painel === e.dataset.p ? null : e.dataset.p;
    else if (a === "medsolto") {
      S.med = e.dataset.id; S.volta = S.tela; S.tela = "med"; S.q = ""; S.antes = null; if (c) c.tmp = {};
      // medicamento de outro tema: abre numa ficha avulsa e devolve o atendimento ao fechar
      if (!c || medsDe(t).indexOf(S.med) < 0) { S.antes = { ativo: S.ativo, rap: S.rap }; S.ativo = null; S.rap = novo(temaDoMed(S.med).id); }
    }
    else if (a === "fecharmed") { S.tela = S.volta === "fluxo" ? "fluxo" : "home"; if (c) c.tmp = {}; if (S.antes) { S.ativo = S.antes.ativo; S.rap = S.antes.rap; S.antes = null; } }
    else if (a === "voltar") { c.no = c.pilha.pop(); c.tmp = {}; S.erro = ""; }
    else if (a === "op") { var o = n.ops[+e.dataset.i]; if (o.set) Object.keys(o.set).forEach(function (k) { c.v[k] = o.set[k]; }); if (o.log) log(c, o.log); else if (n.tipo === "pergunta") log(c, n.t + " " + o.t); if (n.tipo === "reav" && !o.sec) c.reavOk = 1; if (o.ir === "fim") c.fim = 1; if (o.msg) S.aviso = { msg: o.msg, ir: o.ir }; else ir(c, o.ir); }
    else if (a === "avok") { var d = S.aviso.ir; S.aviso = null; ir(c, d); }
    else if (a === "chip") { var s = c.chips[c.no] || (c.chips[c.no] = []), i = +e.dataset.i, p = s.indexOf(i); if (p >= 0) s.splice(p, 1); else s.push(i); }
    else if (a === "sn") { c.v[n.var] = +e.dataset.v; var s2 = (c.chips[c.no] || []).map(function (i) { return n.chips[i]; }); log(c, n.t + " " + (+e.dataset.v ? "Sim" : "Não") + (s2.length ? " (" + s2.join(", ") + ")" : "")); ir(c, +e.dataset.v ? (n.irSim || n.ir) : (n.irNao || n.ir)); }
    else if (a === "num") { var val = CALC.num(document.getElementById("nv").value); if (!val || val < 30 || val > 300) { S.erro = "Digite a PAS em mmHg, só números."; } else { c.v[n.var] = val; log(c, "PAS " + val + " mmHg"); ir(c, n.ir); } }
    else if (a === "uso") { c.tmp.uso = e.dataset.v; c.tmp.dose = null; }
    else if (a === "dose") c.tmp.dose = +e.dataset.v;
    else if (a === "scape") c.tmp.scape = !c.tmp.scape;
    else if (a === "dar" || a === "naodar") {
      var id = e.dataset.id, m = F.meds[id], solto = S.tela === "med";
      if (a === "dar") { var tx = txtDose(id, c); if (!tx) { S.erro = m.modo === "furo" ? "Escolha a dose." : "Informe o peso."; render(); return; } c.meds[id] = { st: "dado", t: Date.now(), txt: tx }; log(c, m.nome + ": " + tx); }
      else { c.meds[id] = { st: e.dataset.st, t: Date.now() }; log(c, m.nome + ": " + (e.dataset.st === "nao" ? "não dado" : "não disponível")); }
      if (solto) { S.tela = S.volta === "fluxo" ? "fluxo" : "home"; c.tmp = {}; } else ir(c, a === "naodar" && e.dataset.st === "sem" && n.sem ? n.sem : n.ir);
    }
    else if (a === "copiar") { var r = document.getElementById("rs"); r.select(); try { navigator.clipboard.writeText(r.value); } catch (x) { document.execCommand("copy"); } e.textContent = "Copiado"; return; }
    if (c && c.id) salvar(); render();
  });
  render();
})();
