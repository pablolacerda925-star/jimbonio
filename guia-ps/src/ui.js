// INTERFACE — fluxograma vivo por paciente. Nenhuma dose, limiar ou texto clínico aqui: tudo vem de FLUXO.
(function () {
  var F = FLUXO, app = document.getElementById("app"), LS = null;
  try { localStorage.setItem("g3.t", "1"); localStorage.removeItem("g3.t"); LS = localStorage; } catch (e) { }
  var S = { pac: [], seq: 0, ativo: null, q: "", ab: {}, modal: null, calc: {}, erro: "", troca: null, verLog: 0 };
  try { var g = JSON.parse((LS && LS.getItem("g3.pac")) || "null"); if (g) { S.pac = g.pac; S.seq = g.seq; S.ativo = g.ativo; } } catch (e) { }
  function salvar() { try { LS && LS.setItem("g3.pac", JSON.stringify({ pac: S.pac, seq: S.seq, ativo: S.ativo })); } catch (e) { } }

  // ---------- utilidades ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function hm(t) { var d = new Date(t); return p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function vg(n) { return String(n).replace(".", ","); }
  function tm(id) { return F.temas.filter(function (t) { return t.id === id; })[0]; }
  function pac() { return S.pac.filter(function (p) { return p.id === S.ativo; })[0] || null; }
  function nomeP(p) { return p.nome || "Paciente " + p2(p.n); }
  function D(p) { return p.d[p.tema] || (p.d[p.tema] = { ac: {}, ach: {}, sin: {}, opc: {}, ex: {}, med: {}, cont: {}, resp: {}, hist: [], dest: null, dx: "susp", ok: null }); }
  function log(p, x) { p.log.push({ t: Date.now(), x: x, tm: p.tema }); }
  function ult(p, k) { for (var i = p.vit.length - 1; i >= 0; i--) if (p.vit[i].k === k) return p.vit[i]; return null; }
  function prim(p, k) { for (var i = 0; i < p.vit.length; i++) if (p.vit[i].k === k) return p.vit[i]; return null; }
  function ctx(p) {
    var d = D(p);
    return { a: function (id) { return d.ach[id]; }, o: function (id) { return d.opc[id]; }, n: function (k) { var u = ult(p, k); return u ? u.v : null; },
      ex: function (id) { return d.ex[id] || {}; }, adm: function (id) { return ((d.med[id] || {}).adm || []).length; }, cont: function (id) { return (d.cont[id] || []).length; },
      r: function (id) { return (d.resp[id] || {}).v; } };
  }
  function vis(lista, P) { return (lista || []).filter(function (x) { return !x.se || x.se(P); }); }
  function passosDe(p) { var t = tm(p.tema), P = ctx(p); return t.passos.filter(function (s) { return s.se(P); }); }
  function medsDe(t) { var l = []; t.passos.forEach(function (s) { s.itens.forEach(function (i) { if (i.tipo === "med" && l.indexOf(i.med) < 0) l.push(i.med); }); }); return l; }
  function temaDoMed(id) { return F.temas.filter(function (t) { return medsDe(t).indexOf(id) >= 0; })[0]; }
  function rotDose(m, d) { return m.rot && m.rot[d] ? m.rot[d] : vg(d) + " mg"; }

  // ---------- revisão automática quando um dado muda ----------
  function assinatura(p) {
    var t = tm(p.tema), c = t.classificar(ctx(p));
    return c.itens.map(function (i) { return i.t + ": " + i.v; }).concat(passosDe(p).map(function (s) { return s.t; })).join(" · ");
  }
  function mudou(p) {
    if (!p.tema) return; var d = D(p), a = assinatura(p);
    if (d.sig && d.sig !== a && d.sigN) { d.mudou = { de: d.sig, para: a, t: Date.now() }; log(p, "Conduta revista pelo aplicativo. Antes: " + d.sig + ". Agora: " + (a || "sem conduta definida") + "."); d.ok = null; }
    d.sig = a; d.sigN = passosDe(p).length;
  }

  // ---------- pendências ----------
  function acoesDe(p) {
    var t = tm(p.tema), P = ctx(p), l = [];
    t.agora.forEach(function (a) { l.push({ k: "ag." + a.id, it: a }); });
    passosDe(p).forEach(function (s) { vis(s.itens, P).forEach(function (i) { if (i.tipo === "acao") l.push({ k: s.id + "." + i.id, it: i }); }); });
    return l;
  }
  function pend(p) {
    var t = tm(p.tema), d = D(p), P = ctx(p), r = { ac: [], falta: [], ex: [], reav: [] };
    acoesDe(p).forEach(function (a) { if (a.it.rep ? !(d.cont[a.it.id] || []).length : !d.ac[a.k]) r.ac.push(a.it.t); });
    passosDe(p).forEach(function (s) { vis(s.itens, P).forEach(function (i) { if (i.tipo === "med") { var st = d.med[i.med] || {}; if (!(st.adm || []).length && !st.nao) r.ac.push(F.meds[i.med].nome + (i.nota ? " (" + i.nota + ")" : "")); } }); });
    r.falta = t.classificar(P).falta.slice();
    if (t.gravidade) t.gravidade.itens.forEach(function (g) { if (!d.ach[g.id] && r.falta.join().indexOf("instabilidade") < 0) r.falta.push(g.t + " (presente ou ausente)"); });
    t.exames.forEach(function (e) { var x = d.ex[e.id]; if (x && (x.st === "sol" || x.st === "agu")) r.ex.push(e.t + (x.st === "sol" ? " (solicitado " : " (aguardando desde ") + hm(x.t) + ")"); });
    vis(t.reav, P).forEach(function (v) { if (v.quando) { var m = (d.med[v.quando.med] || {}).adm || []; if (m.length && !(d.resp[v.id] && d.resp[v.id].t > m[m.length - 1].t)) r.reav.push(v.t + " às " + hm(m[m.length - 1].t + v.quando.h * 3600000)); } });
    medsDe(t).forEach(function (k) { var m = F.meds[k], a = (d.med[k] || {}).adm || []; if (m.lembra && a.length && !d.dest && !(m.maxDoses && a.length >= m.maxDoses)) r.reav.push(m.lembra.t + " " + hm(a[a.length - 1].t + m.lembra.min * 60000)); });
    return r;
  }

  // ---------- peças de tela ----------
  function tg(k, rot) { return '<button class="mini' + (S.ab[k] ? " on" : "") + '" data-a="tg" data-k="' + k + '">' + rot + "</button>"; }
  function extra(k, como, ref) {
    return (como && S.ab["c:" + k] ? '<ul class="como">' + como.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" : "") + (S.ab["f:" + k] ? '<p class="fonte">Fonte: ' + esc(ref) + "</p>" : "");
  }
  function botoesInfo(k, como, ref, rot) { return (como && como.length ? tg("c:" + k, rot || "Como fazer") : "") + (ref ? tg("f:" + k, "Fonte") : ""); }
  function acao(p, k, it) {
    var d = D(p), h;
    if (it.rep) {
      var c = d.cont[it.id] || [];
      h = '<div class="it' + (c.length ? " ok" : "") + '"><div class="itt"><b>' + esc(it.t) + "</b>" + (c.length ? '<span class="tag ok">' + c.length + "× · " + c.map(hm).join(", ") + "</span>" : '<span class="tag">Pendente</span>') + '</div><div class="itb"><button class="bt" data-a="rep" data-id="' + it.id + '" data-t="' + esc(it.t) + '">' + esc(it.rep) + "</button>" + (c.length ? '<button class="mini" data-a="repdes" data-id="' + it.id + '">Desfazer último</button>' : "") + botoesInfo(k, it.como, it.ref) + "</div>" + extra(k, it.como, it.ref) + "</div>";
      return h;
    }
    var s = d.ac[k] || {};
    h = '<div class="it' + (s.st === "feito" ? " ok" : s.st === "nao" ? " nao" : "") + '"><div class="itt"><b>' + esc(it.t) + "</b>" + (s.st === "feito" ? '<span class="tag ok">Feito ' + hm(s.t) + "</span>" : s.st === "nao" ? '<span class="tag nao">Não feito</span>' : '<span class="tag">Pendente</span>') + "</div>" +
      '<div class="itb"><button class="bt' + (s.st === "feito" ? " on" : "") + '" data-a="ac" data-k="' + k + '" data-st="feito" data-t="' + esc(it.t) + '">Feito</button><button class="bt' + (s.st === "nao" ? " on" : "") + '" data-a="ac" data-k="' + k + '" data-st="nao" data-t="' + esc(it.t) + '">Não feito</button>' + botoesInfo(k, it.como, it.ref) + "</div>" +
      (s.st === "nao" ? '<input class="cmp" data-c="motivo" data-k="' + k + '" placeholder="Motivo (opcional)" value="' + esc(s.motivo || "") + '">' : "") + extra(k, it.como, it.ref) + "</div>";
    return h;
  }
  function tri(p, it, ref, como) {
    var d = D(p), v = d.ach[it.id], k = "a." + it.id, sel = d.sin[it.id] || [];
    function b(val, rot) { return '<button class="bt' + (v === val || (!v && val === "") ? " on" + (val === "p" ? " pres" : "") : "") + '" data-a="ach" data-id="' + it.id + '" data-v="' + val + '" data-t="' + esc(it.t) + '">' + rot + "</button>"; }
    return '<div class="it' + (v ? " ok" : "") + '"><div class="itt"><b>' + esc(it.t) + '</b></div><div class="itb">' + b("p", "Presente") + b("a", "Ausente") + b("", "Não avaliado") + botoesInfo(k, it.sinais ? null : como, ref, "Como avaliar") + (it.sinais ? tg("c:" + k, "O que procurar") : "") + "</div>" +
      (it.sinais && (S.ab["c:" + k] || sel.length) ? '<div class="sin">' + (como && S.ab["c:" + k] ? '<p class="dica2">' + esc(como[0]) + "</p>" : "") + it.sinais.map(function (s, i) { return (S.ab["c:" + k] || sel.indexOf(i) >= 0) ? '<button class="chip' + (sel.indexOf(i) >= 0 ? " on" : "") + '" data-a="sin" data-id="' + it.id + '" data-i="' + i + '" data-t="' + esc(it.t) + '">' + esc(s) + "</button>" : ""; }).join("") + "</div>" : "") +
      (it.sinais ? (S.ab["f:" + k] ? '<p class="fonte">Fonte: ' + esc(ref) + "</p>" : "") : extra(k, como, ref)) + "</div>";
  }
  function opc(p, it) {
    var d = D(p), v = d.opc[it.id], k = "o." + it.id;
    return '<div class="it' + (v ? " ok" : "") + '"><div class="itt"><b>' + esc(it.t) + "</b>" + (v ? "" : '<span class="tag">Não informado</span>') + '</div><div class="itb wrap">' + it.ops.map(function (o) { return '<button class="bt' + (v === o.v ? " on" : "") + '" data-a="opc" data-id="' + it.id + '" data-v="' + o.v + '" data-t="' + esc(it.t) + '" data-r="' + esc(o.t) + '">' + esc(o.t) + "</button>"; }).join("") + botoesInfo(k, it.como, it.ref, "Como avaliar") + "</div>" + extra(k, it.como, it.ref) + "</div>";
  }
  function exame(p, e) {
    var d = D(p), x = d.ex[e.id] || {}, k = "e." + e.id;
    function b(st, rot) { return '<button class="bt' + (x.st === st ? " on" : "") + '" data-a="ex" data-id="' + e.id + '" data-st="' + st + '" data-t="' + esc(e.t) + '">' + rot + "</button>"; }
    var h = '<div class="it' + (x.st === "res" && (x.r || x.val) ? " ok" : x.st ? " esp" : "") + '"><div class="itt"><b>' + esc(e.t) + "</b>" + (e.por ? "<small>" + esc(e.por) + "</small>" : "") +
      (!x.st ? '<span class="tag">Não solicitado</span>' : x.st === "sol" ? '<span class="tag esp">Solicitado ' + hm(x.t) + "</span>" : x.st === "agu" ? '<span class="tag esp">Aguardando resultado</span>' : '<span class="tag ok">Resultado</span>') + "</div>" +
      '<div class="itb">' + b("sol", "Solicitado") + b("agu", "Aguardando") + b("res", "Resultado") + tg("f:" + k, "Fonte") + "</div>";
    if (x.st === "res") {
      if (e.num) h += '<div class="resv"><input class="cmp curto" inputmode="decimal" data-c="exval" data-id="' + e.id + '" placeholder="Valor" value="' + esc(x.val || "") + '"><span>' + esc(e.num.un) + "</span>" + (x.val ? "<em>" + (CALC.num(x.val) === null ? "Digite só o número." : CALC.num(x.val) < e.num.corte ? "Abaixo de " + e.num.corte + ": " + esc(e.num.txt) + "." : "Igual ou acima de " + e.num.corte + " " + esc(e.num.un) + ".") + "</em>" : "<em>Informe o valor: a decisão depende do número (" + esc(e.num.txt) + ").</em>") + "</div>";
      else h += '<div class="itb wrap">' + e.res.concat([{ v: "outro", t: "Outro achado" }, { v: "nsi", t: "Não sei interpretar" }]).map(function (o) { return '<button class="bt' + (x.r === o.v ? " on" : "") + '" data-a="exr" data-id="' + e.id + '" data-v="' + o.v + '" data-t="' + esc(e.t) + '" data-r="' + esc(o.t) + '">' + esc(o.t) + "</button>"; }).join("") + "</div>" +
        (x.r === "outro" ? '<input class="cmp" data-c="exobs" data-id="' + e.id + '" placeholder="Descreva o achado" value="' + esc(x.obs || "") + '">' : "") + (x.r === "nsi" ? '<p class="dica2">Registrado como não interpretado. Nada é presumido normal.</p>' : "");
    }
    return h + (S.ab["f:" + k] ? '<p class="fonte">Fonte: ' + esc(e.ref) + "</p>" : "") + "</div>";
  }
  function medLinha(p, i) {
    var m = F.meds[i.med], st = D(p).med[i.med] || {}, adm = st.adm || [], pr = st.presc || [];
    return '<button class="med' + (adm.length ? " ok" : st.nao ? " nao" : "") + '" data-a="med" data-id="' + i.med + '"><span class="medn"><b>' + esc(m.nome) + "</b>" + (i.nota ? "<small>" + esc(i.nota) + "</small>" : "") + "</span>" +
      (adm.length ? '<span class="tag ok">Administrado ' + adm.length + "× · " + hm(adm[adm.length - 1].t) + "</span>" : st.nao ? '<span class="tag nao">Não usado</span>' : pr.length ? '<span class="tag esp">Prescrito ' + hm(pr[pr.length - 1].t) + "</span>" : "") + '<span class="seta">Dose e preparo →</span></button>';
  }
  function bloco(n, k, tit, resumo, corpo) {
    var ab = S.ab["b:" + k] !== 0;
    return '<section class="bl" id="b-' + k + '"><button class="blh" data-a="bl" data-k="' + k + '"><span class="num">' + n + "</span><span class=\"blt\">" + esc(tit) + "</span><small>" + esc(resumo || "") + '</small><i>' + (ab ? "▴" : "▾") + "</i></button>" + (ab ? '<div class="blc">' + corpo + "</div>" : "") + "</section>";
  }

  // ---------- telas ----------
  function lateral() {
    return '<aside class="pacs"><div class="marca">Plantão<small>Guia de bolso</small></div><p class="rot">Pacientes</p>' +
      S.pac.filter(function (p) { return !p.arq; }).map(function (p) { return '<button class="pc' + (p.id === S.ativo ? " on" : "") + '" data-a="abrir" data-id="' + p.id + '"><b>' + esc(nomeP(p)) + "</b><small>" + (p.tema ? esc(tm(p.tema).curto) : "Sem quadro definido") + " · " + hm(p.criado) + "</small></button>"; }).join("") +
      '<button class="novo" data-a="novo">+ Novo atendimento</button><p class="ver">Conteúdo ' + F.versao + " · apoio à decisão, não substitui o julgamento médico</p></aside>";
  }
  function sugestoes() {
    var n = norm(S.q).trim(); if (!n) return "";
    var ts = F.temas.filter(function (t) { return norm(t.nome).indexOf(n) >= 0 || t.busca.some(function (b) { return b.indexOf(n) >= 0 || (n.length > 3 && n.indexOf(b) >= 0); }); });
    var ms = Object.keys(F.meds).filter(function (k) { var m = F.meds[k]; return norm(m.nome).indexOf(n) >= 0 || m.busca.some(function (b) { return b.indexOf(n) >= 0; }); });
    var h = ts.map(function (t) { return '<button data-a="tema" data-id="' + t.id + '"><b>' + esc(t.nome) + "</b><small>Quadro</small></button>"; }).join("") +
      ms.map(function (k) { return '<button data-a="med" data-id="' + k + '"><b>' + esc(F.meds[k].nome) + "</b><small>Medicamento · " + esc(F.meds[k].ind) + "</small></button>"; }).join("");
    return '<div class="sug">' + (h || "<p>Nada encontrado nos documentos.</p>") + "</div>";
  }
  function vitais(p) {
    return '<div class="vit">' + F.vitais.map(function (v) { var u = ult(p, v.k); return "<label>" + v.t + '<input inputmode="decimal" data-c="vit" data-k="' + v.k + '" placeholder="' + v.un + '" value="' + (u ? vg(u.v) : "") + '">' + (u ? "<small>" + hm(u.t) + "</small>" : "") + "</label>"; }).join("") + "</div>" + (S.erro ? '<p class="err">' + esc(S.erro) + "</p>" : "");
  }
  function cabecalho(p) {
    return '<div class="pcab"><input class="nome" data-c="nome" placeholder="' + esc("Paciente " + p2(p.n)) + ' · nome (opcional)" value="' + esc(p.nome) + '"><input class="idade" inputmode="numeric" data-c="idade" placeholder="Idade" value="' + esc(p.idade) + '">' +
      '<button class="bt pri" data-a="passagem">Passagem de caso</button></div><input class="cmp queixa" data-c="queixa" placeholder="Motivo do atendimento (queixa, em poucas palavras)" value="' + esc(p.queixa) + '">' + vitais(p);
  }
  function inicial(p) {
    var q = norm(p.queixa), sug = q ? F.temas.filter(function (t) { return t.busca.some(function (b) { return b.length > 2 && q.indexOf(b) >= 0; }); }) : [];
    return cabecalho(p) + "<h1>Qual é o quadro?</h1><p class=\"sobre\">Escolha um diagnóstico conhecido ou suspeito, ou digite sinais e sintomas na busca. Nome, idade e sinais vitais podem ser preenchidos depois.</p>" +
      (sug.length ? '<p class="rot">Sugerido pela queixa</p>' + sug.map(function (t) { return '<button class="op" data-a="tema" data-id="' + t.id + '">' + esc(t.nome) + " <span>→</span></button>"; }).join("") : "") +
      '<p class="rot">Quadros disponíveis</p>' + F.temas.filter(function (t) { return sug.indexOf(t) < 0; }).map(function (t) { return '<button class="op sec" data-a="tema" data-id="' + t.id + '">' + esc(t.nome) + " <span>→</span></button>"; }).join("");
  }
  function fluxo(p) {
    var t = tm(p.tema), d = D(p), P = ctx(p), cl = t.classificar(P), ps = passosDe(p), pd = pend(p), h = cabecalho(p);
    // avisos
    if (d.mudou) h += '<div class="aviso mud"><b>A conduta foi revista porque um dado mudou.</b><p>Antes: ' + esc(d.mudou.de || "sem conduta") + "</p><p>Agora: " + esc(d.mudou.para || "sem conduta definida") + '</p><button class="bt" data-a="okmud">Entendi</button></div>';
    vis(t.alertas, P).forEach(function (a) {
      if ((d.alOk || {})[a.id]) return;
      h += '<div class="aviso"><b>' + esc(a.t) + "</b><p>Motivo: " + esc(a.porque) + " É uma hipótese sugerida, não um diagnóstico.</p>" + (a.ir ? '<button class="bt pri" data-a="ir" data-id="' + a.ir + '" data-al="' + a.id + '">Abrir o fluxo de ' + esc(tm(a.ir).curto) + '</button>' : "<p><em>Este fluxo ainda não está no aplicativo.</em></p>") + '<button class="bt" data-a="alok" data-id="' + a.id + '">Manter o caminho atual</button></div>';
    });
    if (S.troca) h += '<div class="aviso"><b>Abrir ' + esc(tm(S.troca).nome) + '?</b><p>' + esc(nomeP(p)) + " está no fluxo de " + esc(t.curto) + '.</p><button class="bt pri" data-a="ir" data-id="' + S.troca + '">Mudar o fluxo deste paciente (mantém o histórico)</button><button class="bt" data-a="novocom" data-id="' + S.troca + '">Novo paciente</button><button class="bt" data-a="cancelatroca">Cancelar</button></div>';
    h += '<div class="tit"><h1>' + esc(t.nome) + '</h1><div class="dx"><button class="bt' + (d.dx === "susp" ? " on" : "") + '" data-a="dx" data-v="susp">Suspeita</button><button class="bt' + (d.dx === "conf" ? " on" : "") + '" data-a="dx" data-v="conf">Confirmado</button>' + tg("sobre", "Sobre") + "</div></div>" +
      (S.ab.sobre ? '<p class="sobre">' + esc(t.sobre) + ' <span class="fonte">Fonte: ' + esc(t.refSobre) + "</span></p>" : "");
    if (p.temas.length > 1) h += '<p class="fraco">Fluxos deste atendimento: ' + p.temas.map(function (x) { return x === p.tema ? "<b>" + esc(tm(x).curto) + "</b>" : '<button class="lk" data-a="ir" data-id="' + x + '">' + esc(tm(x).curto) + "</button>"; }).join(" → ") + "</p>";
    // caminho
    var nAg = t.agora.filter(function (a) { return d.ac["ag." + a.id]; }).length;
    h += '<nav class="cam">' + [["agora", "Manejo inicial", nAg + "/" + t.agora.length, nAg === t.agora.length], ["inv", "Investigar", pd.falta.length ? "falta " + pd.falta.length : "completo", !pd.falta.length],
      ["cond", cl.itens.length ? cl.itens.map(function (i) { return i.v; }).join(" · ") : "Classificar", ps.length ? ps.length + " conduta" + (ps.length > 1 ? "s" : "") : "aguarda dados", ps.length > 0],
      ["reav", "Reavaliar", d.hist.length ? d.hist.length + " registro" + (d.hist.length > 1 ? "s" : "") : "", d.hist.length > 0], ["dest", "Destino", d.dest ? d.dest.t : "", !!d.dest]]
      .map(function (c) { return '<button class="' + (c[3] ? "ok" : "") + '" data-a="rolar" data-k="' + c[0] + '"><b>' + esc(c[1]) + "</b><small>" + esc(c[2]) + "</small></button>"; }).join("<i>→</i>") + "</nav>";
    h += '<div class="cols"><div class="fx">';
    // 1 manejo inicial
    var g = t.gravidade;
    h += bloco(1, "agora", "Manejo inicial", "fazer agora, sem esperar a investigação", '<p class="rot">Fazer agora</p>' + t.agora.map(function (a) { return acao(p, "ag." + a.id, a); }).join("") +
      (g ? '<p class="rot">' + esc(g.t) + '</p>' + (g.como ? '<p class="dica2">' + esc(g.como[0]) + "</p>" : "") + g.itens.map(function (i) { return tri(p, i, g.ref, g.como.slice(1)); }).join("") : ""));
    // 2 investigar
    h += bloco(2, "inv", "Investigar e registrar", "achados e exames", '<p class="rot">História e exame físico</p>' + vis(t.investigar, P).map(function (i) { return i.tipo === "opc" ? opc(p, i) : tri(p, i, i.ref, i.como); }).join("") +
      '<p class="rot">Exames</p><div class="exg">' + vis(t.exames, P).map(function (e) { return exame(p, e); }).join("") + "</div>");
    // 3 classificação e conduta
    var c3 = "";
    if (cl.itens.length) c3 += '<div class="cls">' + cl.itens.map(function (i) { return "<p><small>" + esc(i.t) + "</small><b>" + esc(i.v) + "</b>" + (i.porque ? "<em>" + esc(i.porque) + "</em>" : "") + "</p>"; }).join("") +
      (d.ok === d.sig ? '<span class="tag ok">Confirmado pelo médico</span>' : '<span class="tag esp">Sugerido pelo aplicativo</span><button class="bt" data-a="okcls">Confirmar</button>') + "</div>";
    if (cl.falta.length) c3 += '<div class="falta"><b>Falta para definir a conduta:</b> ' + cl.falta.map(esc).join("; ") + ".</div>";
    ps.forEach(function (s) {
      c3 += '<div class="passo"><div class="ph"><b>' + esc(s.t) + "</b>" + tg("f:p." + s.id, "Fonte") + "</div><p class=\"pq\">Por quê: " + esc(s.porque) + "</p>" + (S.ab["f:p." + s.id] ? '<p class="fonte">Fonte: ' + esc(s.ref) + "</p>" : "") +
        (s.dica ? '<p class="agora"><b>Agora:</b> ' + esc(s.dica(P)) + "</p>" : "") +
        vis(s.itens, P).map(function (i) { return i.tipo === "med" ? medLinha(p, i) : i.tipo === "info" ? '<p class="info">' + esc(i.t) + "</p>" : acao(p, s.id + "." + i.id, i); }).join("") + "</div>";
    });
    if (!ps.length && !cl.falta.length) c3 += '<p class="fraco">Sem conduta específica para os dados registrados.</p>';
    h += bloco(3, "cond", "Classificação e conduta", "atualiza conforme os achados", c3);
    // 4 reavaliação
    var rv = vis(t.reav, P), c4 = rv.map(function (v) {
      var r = d.resp[v.id], k = "r." + v.id, op = r ? v.ops.filter(function (o) { return o.v === r.v; })[0] : null;
      return '<div class="it' + (r ? " ok" : "") + '"><div class="itt"><b>' + esc(v.t) + "</b>" + (r ? '<span class="tag ok">' + esc(op.t) + " · " + hm(r.t) + "</span>" : "") + '</div><div class="itb wrap">' + v.ops.map(function (o) { return '<button class="bt' + (r && r.v === o.v ? " on" : "") + '" data-a="resp" data-id="' + v.id + '" data-v="' + o.v + '">' + esc(o.t) + "</button>"; }).join("") + botoesInfo(k, v.como, v.ref, "O que acompanhar") + "</div>" +
        (op ? '<p class="agora"><b>Como seguir:</b> ' + esc(op.prox) + "</p>" : "") + extra(k, v.como, v.ref) + "</div>";
    }).join("");
    c4 += '<div class="it"><div class="itt"><b>Novo achado ou intercorrência</b></div><input class="cmp" data-c="novo" placeholder="Escreva e toque fora para registrar no histórico"></div>';
    h += bloco(4, "reav", "Reavaliação e evolução", rv.length ? "" : "aparece depois da conduta", c4);
    // 5 destino
    h += bloco(5, "dest", "Destino", d.dest ? d.dest.t : "", (t.destino.notas || []).map(function (n) { return '<p class="info">' + esc(n) + "</p>"; }).join("") + '<div class="itb wrap">' + t.destino.ops.map(function (o) { return '<button class="bt' + (d.dest && d.dest.v === o.v ? " on" : "") + '" data-a="dest" data-v="' + o.v + '" data-t="' + esc(o.t) + '">' + esc(o.t) + "</button>"; }).join("") + tg("f:dest", "Fonte") + "</div>" + (S.ab["f:dest"] ? '<p class="fonte">Fonte: ' + esc(t.destino.ref) + "</p>" : "") +
      '<button class="lk" data-a="arquivar">Encerrar e arquivar este atendimento</button>');
    h += "</div>" + lado(p, pd) + "</div>";
    return h;
  }
  function lado(p, pd) {
    function lista(tit, l, cls) { return '<div class="ld ' + cls + '"><b>' + tit + "<span>" + l.length + "</span></b>" + (l.length ? "<ul>" + l.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "<p>Nada pendente.</p>") + "</div>"; }
    var lg = p.log.slice().reverse(), n = S.verLog ? lg.length : 6;
    return '<aside class="lado"><h3>Neste paciente</h3>' + lista("Fazer agora", pd.ac, "a") + lista("Falta investigar", pd.falta, "f") + lista("Resultados pendentes", pd.ex, "e") + lista("Reavaliar", pd.reav, "r") +
      '<div class="ld"><b>Linha do tempo<span>' + lg.length + "</span></b>" + (lg.length ? '<ul class="tl">' + lg.slice(0, n).map(function (l) { return "<li><i>" + hm(l.t) + "</i> " + esc(l.x) + "</li>"; }).join("") + "</ul>" + (lg.length > 6 ? '<button class="lk" data-a="verlog">' + (S.verLog ? "Mostrar menos" : "Ver tudo") + "</button>" : "") : "<p>Nada registrado.</p>") + "</div></aside>";
  }

  // ---------- medicamento e calculadora ----------
  function abreMed(id) {
    var m = F.meds[id], p = pac(), u = p && ult(p, "peso");
    S.calc = { peso: u ? vg(u.v) : "", dose: m.doses && m.doses.length === 1 ? m.doses[0] : null, ap: m.aps && m.aps.length === 1 && m.modo !== "inf" ? 0 : null, faixa: m.faixas ? 0 : null, amp: "", apMg: "", apMl: "", dil: "", d: "", uso: null, oral: "" };
    S.modal = { tipo: "med", id: id }; S.q = "";
    if (p && p.tema && medsDe(tm(p.tema)).indexOf(id) >= 0) { var st = D(p).med[id] || (D(p).med[id] = {}); if (!st.cons) { st.cons = Date.now(); log(p, "Consultado: " + m.nome); } }
  }
  function calcular(m, c) {
    var falta = [], L = [], Fm = [], ap = c.ap != null && m.aps ? m.aps[c.ap] : null, peso = CALC.num(c.peso), pesoOk = peso !== null && peso >= 20 && peso <= 300;
    if (m.modo === "txt") return { txt: m.dose[0] };
    if (m.modo === "fixo" || m.modo === "furo") {
      var dose = c.dose;
      if (m.modo === "furo") { if (!c.uso) falta.push("uso prévio de diurético"); else if (c.uso === "s" && CALC.num(c.oral) === null) falta.push("dose oral diária (mg)"); }
      if (dose == null) falta.push("dose"); if (!ap) falta.push("apresentação da ampola");
      if (falta.length) return { falta: falta };
      if (m.teto && dose > m.teto) return { erro: "Dose acima do teto documentado (" + m.teto + " mg por dia)." };
      var b = CALC.bolus(dose, ap, null);
      L = [["Dose", rotDose(m, dose)], ["Volume a aspirar", vg(b.volMl) + " mL"], ["Ampolas", b.ampolas + " de " + ap.t]];
      Fm = ["Volume = dose ÷ concentração da ampola = " + vg(dose) + " mg ÷ " + vg(CALC.r(ap.mg / ap.ml, 3)) + " mg/mL = " + vg(b.volMl) + " mL"];
      return { L: L, F: Fm, txt: rotDose(m, dose) + " (" + vg(b.volMl) + " mL)" };
    }
    if (m.modo === "kg") {
      if (!pesoOk) falta.push("peso (20 a 300 kg)"); if (!ap) falta.push("apresentação da ampola");
      if (falta.length) return { falta: falta };
      var fx = m.faixas[c.faixa], k = CALC.bolusKg(fx.mgKg, c.peso, ap.mg / ap.ml);
      L = [["Dose (" + fx.t + ")", vg(k.mg[0]) + " a " + vg(k.mg[1]) + " mg"], ["Volume a aspirar", vg(k.ml[0]) + " a " + vg(k.ml[1]) + " mL"]];
      Fm = ["Dose = " + vg(fx.mgKg[0]) + " a " + vg(fx.mgKg[1]) + " mg/kg × " + vg(peso) + " kg", "Volume = dose ÷ " + vg(ap.mg / ap.ml) + " mg/mL"];
      return { L: L, F: Fm, txt: fx.t + ": " + vg(k.mg[0]) + " a " + vg(k.mg[1]) + " mg (" + vg(k.ml[0]) + " a " + vg(k.ml[1]) + " mL)" };
    }
    // infusão
    var n = CALC.num(c.amp), mg = CALC.num(c.apMg), ml = CALC.num(c.apMl), dil = CALC.num(c.dil), ds = CALC.num(c.d);
    if (n === null) falta.push("número de ampolas"); if (mg === null) falta.push("mg por ampola"); if (ml === null) falta.push("mL por ampola"); if (dil === null) falta.push("volume do diluente (mL)");
    if (m.porKg && !pesoOk) falta.push("peso (20 a 300 kg)");
    if (falta.length) return { falta: falta };
    var pr = CALC.preparo({ mg: mg, ml: ml }, { amp: n, dil: dil });
    L = [["Concentração final", vg(CALC.r(pr.mcgMl, 1)) + " mcg/mL (" + vg(CALC.r(pr.mgMl, 3)) + " mg/mL)"], ["Volume final", vg(pr.volFinal) + " mL = " + vg(pr.volDroga) + " mL do medicamento + " + vg(dil) + " mL de diluente"]];
    Fm = ["Concentração = (" + vg(n) + " × " + vg(mg) + " mg) ÷ " + vg(pr.volFinal) + " mL"];
    if (ds === null) return { L: L, F: Fm, falta: ["dose (" + m.un + ")"] };
    if (m.max && ds > m.max) return { L: L, F: Fm, erro: "Dose acima do máximo documentado (" + vg(m.max) + " " + m.un + ")." };
    var v;
    if (m.un === "mg/h") { v = CALC.infusaoMgH(ds, pr.mgMl, null).mlH; Fm.push("Velocidade = dose ÷ concentração = " + vg(ds) + " mg/h ÷ " + vg(CALC.r(pr.mgMl, 3)) + " mg/mL"); }
    else { var mcg = ds * (m.fator || 1); v = CALC.infusao(mcg, c.peso, pr.mcgMl, m.porKg, null).mlH; Fm.push("Velocidade = dose" + (m.porKg ? " × peso" : "") + " × 60 ÷ concentração = " + vg(mcg) + " mcg" + (m.porKg ? "/kg/min × " + vg(peso) + " kg" : "/min") + " × 60 ÷ " + vg(CALC.r(pr.mcgMl, 1)) + " mcg/mL"); }
    L.unshift(["Velocidade de infusão", vg(v) + " mL/h"], ["Dose", vg(ds) + " " + m.un + (m.porKg ? " × " + vg(peso) + " kg" : "")]);
    return { L: L, F: Fm, txt: vg(ds) + " " + m.un + " = " + vg(v) + " mL/h (solução de " + vg(CALC.r(pr.mcgMl, 1)) + " mcg/mL)" };
  }
  function calcHtml(m) {
    var r = calcular(m, S.calc), h = "";
    if (r.L) h += '<div class="res">' + r.L.map(function (l, i) { return "<p" + (i === 0 || l[0] === "Volume a aspirar" ? ' class="pri"' : "") + "><small>" + esc(l[0]) + "</small><b>" + esc(l[1]) + "</b></p>"; }).join("") + '<p class="form">' + r.F.map(esc).join("<br>") + "</p></div>";
    if (r.erro) h += '<p class="err">' + esc(r.erro) + "</p>";
    if (r.falta) h += '<p class="faltac">Para calcular, informe: ' + r.falta.map(esc).join(", ") + ".</p>";
    var p = pac(), pas = p && ult(p, "pas");
    if (m.bolus && pas && pas.v >= m.bolus.pasMin) { var b = CALC.porPas(pas.v, m.bolus.faixas); h += '<div class="res"><p><small>' + esc(m.bolus.t) + " · PAS " + pas.v + "</small><b>" + (b.erro ? "Sem faixa documentada para esta PAS" : b.ml + " mL em bolus") + '</b></p><p class="form">' + esc(m.bolus.depois) + "</p></div>"; }
    return h;
  }
  function modalMed() {
    var id = S.modal.id, m = F.meds[id], c = S.calc, p = pac(), noFluxo = p && p.tema && medsDe(tm(p.tema)).indexOf(id) >= 0, st = noFluxo ? D(p).med[id] || {} : {};
    function sec(t, l) { return l && l.length ? "<h4>" + t + "</h4><ul>" + l.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; }
    function chips(a, lista, sel) { return '<div class="itb wrap">' + lista.map(function (o) { return '<button class="bt' + (sel === o[0] ? " on" : "") + '" data-a="' + a + '" data-v="' + o[0] + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>"; }
    function campo(k, rot, ph) { return "<label>" + rot + '<input inputmode="decimal" data-k="' + k + '" class="cc" placeholder="' + (ph || "") + '" value="' + esc(c[k] || "") + '"></label>'; }
    var h = '<div class="mh"><div><h2>' + esc(m.nome) + "</h2><p>Nesta indicação: " + esc(m.ind) + '</p></div><button class="x" data-a="fechar" aria-label="Fechar">×</button></div><div class="mb">' +
      sec("Dose, via e intervalo", m.dose) + sec("Preparo e diluição", m.prep) + sec("Cuidados", m.cuid);
    if (m.modo !== "txt") {
      h += '<h4>Calcular</h4><div class="calc">';
      if (m.modo === "furo") { h += "<p>Usa diurético de alça em casa?</p>" + chips("cuso", [["n", "Não"], ["s", "Sim"]], c.uso);
        if (c.uso === "s") h += '<div class="campos">' + campo("oral", "Dose oral diária (mg)") + "</div>";
        var ds = c.uso === "n" ? m.semUso : c.uso === "s" && CALC.num(c.oral) ? m.fator.map(function (f) { return CALC.num(c.oral) * f; }) : [];
        if (ds.length) h += "<p>Dose</p>" + chips("cdose", ds.map(function (d) { return [d, vg(d) + " mg"]; }), c.dose); }
      if (m.modo === "fixo" && m.doses.length > 1) h += "<p>Dose</p>" + chips("cdose", m.doses.map(function (d) { return [d, rotDose(m, d)]; }), c.dose);
      if (m.modo === "kg") h += "<p>Dose</p>" + chips("cfaixa", m.faixas.map(function (f, i) { return [i, f.t + ": " + vg(f.mgKg[0]) + " a " + vg(f.mgKg[1]) + " mg/kg"]; }), c.faixa) + '<div class="campos">' + campo("peso", "Peso (kg)") + "</div>";
      if (m.modo !== "inf") h += "<p>Ampola disponível</p>" + chips("cap", m.aps.map(function (a, i) { return [i, a.t]; }), c.ap);
      else {
        h += "<p>Preparo do documento (toque para preencher)</p>" + chips("cprep", m.preps.map(function (x, i) { return [i, x.t]; }), c.prep) +
          '<div class="campos">' + campo("amp", "Nº de ampolas") + campo("apMg", "mg por ampola") + campo("apMl", "mL por ampola") + campo("dil", "Diluente (mL)") + (m.porKg ? campo("peso", "Peso (kg)") : "") + "</div>" +
          "<p>Dose (" + esc(m.un) + ")</p>" + chips("cd", (m.rapidas ? m.rapidas.map(function (x) { return [x.v, x.t]; }) : [[m.ini[0], "Início: " + vg(m.ini[0])]].concat(m.ini[1] !== m.ini[0] ? [[m.ini[1], vg(m.ini[1])]] : [], m.manter ? [[m.manter[0], "Manter: " + vg(m.manter[0])]] : [], m.max && m.max !== m.ini[1] ? [[m.max, "Máximo: " + vg(m.max)]] : [])), CALC.num(c.d)) +
          '<div class="campos">' + campo("d", "Outra dose (" + esc(m.un) + ")") + "</div>";
      }
      h += '<div id="calcres">' + calcHtml(m) + "</div></div>";
    }
    h += '<p class="fonte">Fonte: ' + esc(m.ref) + "</p>";
    if (noFluxo) {
      h += '<h4>Registrar em ' + esc(nomeP(p)) + "</h4>" + (S.merro ? '<p class="err">' + esc(S.merro) + "</p>" : "") + '<div class="itb wrap"><button class="bt" data-a="mpresc">Prescrito</button><button class="bt pri" data-a="madm">Administrado agora</button><button class="bt" data-a="mnao">Não vou usar</button></div>' +
        '<p class="dica2">Abrir esta tela só registra consulta. Prescrito e administrado são registros separados.</p>' +
        ((st.presc || []).length || (st.adm || []).length || st.nao ? '<ul class="tl">' + (st.presc || []).map(function (x) { return "<li><i>" + hm(x.t) + "</i> Prescrito: " + esc(x.txt) + "</li>"; }).join("") + (st.adm || []).map(function (x) { return "<li><i>" + hm(x.t) + "</i> Administrado: " + esc(x.txt) + "</li>"; }).join("") + (st.nao ? "<li><i>" + hm(st.nao.t) + "</i> Decidido não usar</li>" : "") + "</ul>" : "");
    } else h += '<p class="dica2">Consulta avulsa: nada é registrado em paciente.</p>';
    return h + "</div>";
  }

  // ---------- passagem de caso ----------
  function passagem(p, det) {
    var L = [], idade = p.idade ? ", " + p.idade + " anos" : "";
    function vit(f) { var l = F.vitais.map(function (v) { var x = f(p, v.k); return x ? v.t + " " + vg(x.v) + " " + v.un + (det ? " (" + hm(x.t) + ")" : "") : null; }).filter(Boolean); return l.join(", "); }
    L.push("IDENTIFICAÇÃO: " + nomeP(p) + idade + ". Atendimento iniciado às " + hm(p.criado) + ".");
    L.push("MOTIVO: " + (p.queixa || "não registrado") + ".");
    var vi = vit(prim), vu = vit(ult);
    L.push("SINAIS VITAIS: " + (vi ? (vi === vu ? vi : "iniciais: " + vi + ". Mais recentes: " + vu) : "não registrados") + ".");
    p.temas.forEach(function (tid) {
      var t = tm(tid), d = p.d[tid]; if (!d) return; var keep = p.tema; p.tema = tid; var P = ctx(p), cl = t.classificar(P), pd = pend(p);
      L.push("", "— " + t.nome.toUpperCase() + " (" + (d.dx === "conf" ? "diagnóstico confirmado pelo médico" : "hipótese em investigação") + ") —");
      var todos = (t.gravidade ? t.gravidade.itens : []).concat(t.investigar.filter(function (i) { return i.tipo !== "opc"; }));
      var pres = todos.filter(function (i) { return d.ach[i.id] === "p"; }).map(function (i) { var s = (d.sin[i.id] || []).map(function (x) { return i.sinais[x]; }); return i.t + (s.length ? " (" + s.join(", ") + ")" : ""); });
      var aus = todos.filter(function (i) { return d.ach[i.id] === "a"; }).map(function (i) { return i.t; }), na = todos.filter(function (i) { return !d.ach[i.id]; }).map(function (i) { return i.t; });
      t.investigar.filter(function (i) { return i.tipo === "opc" && d.opc[i.id]; }).forEach(function (i) { pres.unshift(i.t + ": " + i.ops.filter(function (o) { return o.v === d.opc[i.id]; })[0].t); });
      L.push("ACHADOS: presentes: " + (pres.join("; ") || "nenhum registrado") + ". Ausentes: " + (aus.join("; ") || "nenhum registrado") + "." + (det && na.length ? " Não avaliados: " + na.join("; ") + "." : ""));
      if (cl.itens.length) L.push("CLASSIFICAÇÃO: " + cl.itens.map(function (i) { return i.t + " " + i.v; }).join("; ") + " (" + (d.ok === d.sig ? "confirmada pelo médico" : "sugerida pelo aplicativo, ainda não confirmada") + ").");
      var er = t.exames.filter(function (e) { return (d.ex[e.id] || {}).st === "res" && (d.ex[e.id].r || d.ex[e.id].val); }).map(function (e) { var x = d.ex[e.id]; return e.t + ": " + (e.num ? x.val + " " + e.num.un : x.r === "outro" ? (x.obs || "outro achado") : x.r === "nsi" ? "não interpretado" : e.res.filter(function (o) { return o.v === x.r; })[0].t); });
      L.push("EXAMES: disponíveis: " + (er.join("; ") || "nenhum") + ". Pendentes: " + (pd.ex.join("; ") || "nenhum") + ".");
      var feitas = [], nao = [];
      Object.keys(d.ac).forEach(function (k) { var a = d.ac[k]; if (a.st === "feito") feitas.push(a.rot + (det ? " (" + hm(a.t) + ")" : "")); else nao.push(a.rot + (a.motivo ? " — motivo: " + a.motivo : "")); });
      Object.keys(d.cont).forEach(function (k) { if (d.cont[k].length) feitas.push(d.contRot[k] + " " + d.cont[k].length + "×" + (det ? " (" + d.cont[k].map(hm).join(", ") + ")" : "")); });
      L.push("CONDUTAS REALIZADAS: " + (feitas.join("; ") || "nenhuma registrada") + "." + (det && nao.length ? " Não realizadas: " + nao.join("; ") + "." : ""));
      var adm = [], presc = [];
      Object.keys(d.med).forEach(function (k) { var m = d.med[k]; (m.adm || []).forEach(function (x) { adm.push(F.meds[k].nome + " " + x.txt + " às " + hm(x.t)); }); if (!(m.adm || []).length) (m.presc || []).forEach(function (x) { presc.push(F.meds[k].nome + " " + x.txt); }); });
      L.push("MEDICAMENTOS ADMINISTRADOS: " + (adm.join("; ") || "nenhum registrado") + "." + (presc.length ? " Prescritos, ainda não administrados: " + presc.join("; ") + "." : ""));
      var rs = d.hist.map(function (x) { return x.rot + ": " + x.t2 + (det ? " (" + hm(x.t) + ")" : ""); });
      L.push("RESPOSTA E EVOLUÇÃO: " + ((det ? rs : rs.slice(-3)).join("; ") || "nenhuma reavaliação registrada") + "." + (d.dest ? " Destino definido: " + d.dest.t + "." : ""));
      var pe = [].concat(pd.ac.map(function (x) { return "fazer: " + x; }), pd.falta.map(function (x) { return "avaliar: " + x; }), pd.reav.map(function (x) { return "reavaliar: " + x; }));
      L.push("PENDÊNCIAS E PONTOS A DISCUTIR: " + ((det ? pe : pe.slice(0, 6)).join("; ") || "nenhuma") + (!det && pe.length > 6 ? "; e mais " + (pe.length - 6) : "") + "." + (d.dest ? "" : " Destino ainda não definido."));
      p.tema = keep;
    });
    if (det) { L.push("", "LINHA DO TEMPO:"); p.log.forEach(function (l) { L.push(hm(l.t) + " " + l.x); }); }
    return L.join("\n");
  }
  function modalPass() {
    var p = pac(), det = S.modal.det;
    return '<div class="mh"><div><h2>Passagem de caso</h2><p>' + esc(nomeP(p)) + ' · só com o que foi registrado; edite à vontade</p></div><button class="x" data-a="fechar" aria-label="Fechar">×</button></div><div class="mb"><div class="itb"><button class="bt' + (det ? "" : " on") + '" data-a="pdet" data-v="0">Curta (oral)</button><button class="bt' + (det ? " on" : "") + '" data-a="pdet" data-v="1">Detalhada</button></div>' +
      '<textarea id="pass" rows="18">' + esc(passagem(p, det)) + '</textarea><div class="itb"><button class="bt pri" data-a="copiar">Copiar</button></div></div>';
  }

  // ---------- render ----------
  function render() {
    var p = pac(), sy = window.scrollY, mb = app.querySelector(".mb"), ms = mb ? mb.scrollTop : 0;
    var meio = !p ? '<div class="vazio"><h1>Guia de bolso do plantão</h1><p class="sobre">Comece um atendimento ou busque um quadro ou medicamento.</p><button class="op" data-a="novo">+ Novo atendimento <span>→</span></button></div>' : p.tema ? fluxo(p) : inicial(p);
    app.innerHTML = '<div class="lay">' + lateral() + '<div class="centro"><header class="topo"><input id="q" type="search" autocomplete="off" placeholder="Buscar doença, queixa ou medicamento" value="' + esc(S.q) + '"><div id="sug">' + sugestoes() + "</div></header><main>" + meio + "</main></div></div>" +
      (S.modal ? '<div class="fundo" data-a="fechar"></div><div class="modal' + (S.modal.tipo === "pass" ? " largo" : "") + '" role="dialog">' + (S.modal.tipo === "med" ? modalMed() : modalPass()) + "</div>" : "");
    window.scrollTo(0, sy); var m2 = app.querySelector(".mb"); if (m2) m2.scrollTop = ms;
  }
  function novoPac(tema) {
    S.seq++; var p = { id: "P" + S.seq, n: S.seq, nome: "", idade: "", queixa: "", tema: null, temas: [], d: {}, vit: [], log: [], criado: Date.now() };
    S.pac.push(p); S.ativo = p.id; log(p, "Atendimento iniciado"); if (tema) entra(p, tema, "Quadro escolhido"); return p;
  }
  function entra(p, tema, motivo) { p.tema = tema; if (p.temas.indexOf(tema) < 0) p.temas.push(tema); D(p); log(p, motivo + ": " + tm(tema).nome); S.troca = null; S.ab = {}; mudou(p); }

  // ---------- eventos ----------
  app.addEventListener("input", function (ev) {
    var e = ev.target;
    if (e.id === "q") { S.q = e.value; document.getElementById("sug").innerHTML = sugestoes(); }
    if (e.classList.contains("cc")) { S.calc[e.dataset.k] = e.value; if (e.dataset.k !== "peso" && e.dataset.k !== "d" && e.dataset.k !== "oral") S.calc.prep = null; if (e.dataset.k === "oral") { S.calc.dose = null; return; } document.getElementById("calcres").innerHTML = calcHtml(F.meds[S.modal.id]); }
  });
  app.addEventListener("change", function (ev) {
    var e = ev.target, c = e.dataset.c, p = pac(); if (e.classList.contains("cc")) { if (e.dataset.k === "oral") render(); return; } if (!c || !p) return;
    var v = e.value.trim(); S.erro = "";
    if (c === "nome") { p.nome = v; log(p, "Nome registrado: " + (v || "sem nome")); }
    else if (c === "idade") { p.idade = v; if (v) log(p, "Idade: " + v + " anos"); }
    else if (c === "queixa") { p.queixa = v; if (v) log(p, "Motivo do atendimento: " + v); }
    else if (c === "vit") { var d = F.vitais.filter(function (x) { return x.k === e.dataset.k; })[0], n = CALC.num(v);
      if (v === "") { } else if (n === null || n < d.min || n > d.max) S.erro = d.t + ": digite só o número, entre " + d.min + " e " + d.max + " " + d.un + "."; else { p.vit.push({ k: d.k, v: n, t: Date.now() }); log(p, d.t + " " + vg(n) + " " + d.un); } }
    else if (c === "motivo") { D(p).ac[e.dataset.k].motivo = v; if (v) log(p, "Motivo de não fazer “" + D(p).ac[e.dataset.k].rot + "”: " + v); }
    else if (c === "exval") { var x = D(p).ex[e.dataset.id]; x.val = v; if (CALC.num(v) !== null) log(p, "Resultado de " + tm(p.tema).exames.filter(function (q) { return q.id === e.dataset.id; })[0].t + ": " + v); }
    else if (c === "exobs") { D(p).ex[e.dataset.id].obs = v; if (v) log(p, "Achado descrito: " + v); }
    else if (c === "novo") { if (v) { log(p, "Novo achado ou intercorrência: " + v); D(p).hist.push({ t: Date.now(), rot: "Novo achado", t2: v }); } }
    mudou(p); salvar(); render();
  });
  app.addEventListener("keydown", function (ev) { if (ev.key === "Enter" && ev.target.tagName === "INPUT" && ev.target.id !== "q") ev.target.blur(); if (ev.key === "Escape" && S.modal) { S.modal = null; render(); } });
  app.addEventListener("click", function (ev) {
    var e = ev.target.closest("[data-a]"); if (!e) return;
    var a = e.dataset.a, p = pac(), d = p && p.tema ? D(p) : null, id = e.dataset.id, v = e.dataset.v;
    if (a === "novo") novoPac();
    else if (a === "abrir") { S.ativo = id; S.troca = null; S.ab = {}; }
    else if (a === "tema") { S.q = ""; if (!p) novoPac(id); else if (!p.tema) entra(p, id, "Quadro escolhido"); else if (p.tema !== id) S.troca = id; }
    else if (a === "novocom") novoPac(id);
    else if (a === "cancelatroca") S.troca = null;
    else if (a === "ir") { if (e.dataset.al) (d.alOk || (d.alOk = {}))[e.dataset.al] = 1; entra(p, id, "Mudança de fluxo confirmada pelo médico"); window.scrollTo(0, 0); }
    else if (a === "alok") { (d.alOk || (d.alOk = {}))[id] = 1; log(p, "Sugestão de outro fluxo vista; caminho atual mantido"); }
    else if (a === "okmud") d.mudou = null;
    else if (a === "okcls") { d.ok = d.sig; log(p, "Classificação confirmada pelo médico: " + tm(p.tema).classificar(ctx(p)).itens.map(function (i) { return i.t + " " + i.v; }).join("; ")); }
    else if (a === "dx") { d.dx = v; log(p, tm(p.tema).curto + ": marcado como " + (v === "conf" ? "diagnóstico confirmado" : "suspeita")); }
    else if (a === "tg") S.ab[e.dataset.k] = !S.ab[e.dataset.k];
    else if (a === "bl") S.ab["b:" + e.dataset.k] = S.ab["b:" + e.dataset.k] === 0 ? 1 : 0;
    else if (a === "rolar") { S.ab["b:" + e.dataset.k] = 1; render(); var el = document.getElementById("b-" + e.dataset.k); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    else if (a === "verlog") S.verLog = !S.verLog;
    else if (a === "ac") { var k = e.dataset.k, st = e.dataset.st; if (d.ac[k] && d.ac[k].st === st) { delete d.ac[k]; log(p, "Voltou a pendente: " + e.dataset.t); } else { d.ac[k] = { st: st, t: Date.now(), rot: e.dataset.t }; log(p, (st === "feito" ? "Feito: " : "Não feito: ") + e.dataset.t); } }
    else if (a === "rep") { (d.cont[id] || (d.cont[id] = [])).push(Date.now()); (d.contRot || (d.contRot = {}))[id] = e.dataset.t; log(p, e.dataset.t + " nº " + d.cont[id].length); }
    else if (a === "repdes") { d.cont[id].pop(); log(p, "Registro desfeito: " + d.contRot[id]); }
    else if (a === "ach") { var ant = d.ach[id]; if (v) d.ach[id] = v; else { delete d.ach[id]; delete d.sin[id]; } if (v === "a") delete d.sin[id]; if (ant !== (v || undefined)) log(p, e.dataset.t + ": " + (v === "p" ? "presente" : v === "a" ? "ausente" : "não avaliado") + (ant ? " (corrigido)" : "")); }
    else if (a === "sin") { var s = d.sin[id] || (d.sin[id] = []), i = +e.dataset.i, ix = s.indexOf(i), it = tm(p.tema).investigar.filter(function (x) { return x.id === id; })[0]; if (ix >= 0) s.splice(ix, 1); else s.push(i);
      if (s.length && d.ach[id] !== "p") { d.ach[id] = "p"; } log(p, e.dataset.t + ": " + (ix >= 0 ? "desmarcado " : "") + it.sinais[i]); }
    else if (a === "opc") { var an = d.opc[id]; if (an === v) delete d.opc[id]; else d.opc[id] = v; log(p, e.dataset.t + ": " + (an === v ? "não informado" : e.dataset.r) + (an && an !== v ? " (corrigido)" : "")); }
    else if (a === "ex") { var x = d.ex[id]; if (x && x.st === e.dataset.st) { delete d.ex[id]; log(p, e.dataset.t + ": voltou a não solicitado"); } else { d.ex[id] = { st: e.dataset.st, t: x ? x.t : Date.now(), r: x && x.r, val: x && x.val, obs: x && x.obs }; log(p, e.dataset.t + ": " + { sol: "solicitado", agu: "aguardando resultado", res: "resultado disponível" }[e.dataset.st]); } }
    else if (a === "exr") { d.ex[id].r = v; log(p, "Resultado de " + e.dataset.t + ": " + e.dataset.r); }
    else if (a === "resp") { var rv = tm(p.tema).reav.filter(function (x) { return x.id === id; })[0], o = rv.ops.filter(function (x) { return x.v === v; })[0]; d.resp[id] = { v: v, t: Date.now() }; d.hist.push({ t: Date.now(), rot: rv.t, t2: o.t }); if (o.set) Object.keys(o.set).forEach(function (k2) { d.opc[k2] = o.set[k2]; }); log(p, rv.t + " " + o.t); }
    else if (a === "dest") { d.dest = d.dest && d.dest.v === v ? null : { v: v, t: e.dataset.t }; log(p, "Destino: " + (d.dest ? e.dataset.t : "não definido")); }
    else if (a === "arquivar") { p.arq = 1; log(p, "Atendimento encerrado"); S.ativo = null; }
    else if (a === "med") { abreMed(id); S.merro = ""; }
    else if (a === "fechar") { S.modal = null; }
    else if (a === "cdose") S.calc.dose = +v;
    else if (a === "cuso") { S.calc.uso = v; S.calc.dose = null; }
    else if (a === "cap") S.calc.ap = +v;
    else if (a === "cfaixa") S.calc.faixa = +v;
    else if (a === "cd") S.calc.d = vg(v);
    else if (a === "cprep") { var m = F.meds[S.modal.id], pr = m.preps[+v], ap = m.aps[pr.ap]; S.calc.prep = +v; S.calc.amp = String(pr.amp); S.calc.apMg = vg(ap.mg); S.calc.apMl = vg(ap.ml); S.calc.dil = String(pr.dil); }
    else if (a === "mpresc" || a === "madm" || a === "mnao") {
      var mm = F.meds[S.modal.id], st2 = d.med[S.modal.id] || (d.med[S.modal.id] = {}), r = calcular(mm, S.calc);
      if (a === "mnao") { st2.nao = { t: Date.now() }; log(p, mm.nome + ": decidido não usar"); S.modal = null; }
      else if (!r.txt) { S.merro = "Complete o cálculo antes de registrar, para a dose ficar anotada."; }
      else if (a === "madm" && mm.maxDoses && (st2.adm || []).length >= mm.maxDoses) { S.merro = "Dose total máxima documentada já atingida."; }
      else { S.merro = ""; (st2[a === "madm" ? "adm" : "presc"] || (st2[a === "madm" ? "adm" : "presc"] = [])).push({ t: Date.now(), txt: r.txt }); delete st2.nao; log(p, mm.nome + (a === "madm" ? " administrado: " : " prescrito: ") + r.txt); if (a === "madm") S.modal = null; }
    }
    else if (a === "passagem") S.modal = { tipo: "pass", det: 0 };
    else if (a === "pdet") S.modal.det = +v;
    else if (a === "copiar") { var ta = document.getElementById("pass"); ta.select(); try { navigator.clipboard.writeText(ta.value); } catch (x2) { document.execCommand("copy"); } e.textContent = "Copiado"; return; }
    if (p) mudou(p); salvar(); render();
  });
  render();
})();
