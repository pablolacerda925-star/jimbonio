// INTERFACE — fluxograma de cartões por paciente. Nenhuma dose, limiar ou texto clínico aqui: tudo vem de FLUXO.
(function () {
  var F = FLUXO, app = document.getElementById("app"), LS = null;
  try { localStorage.setItem("g3.t", "1"); localStorage.removeItem("g3.t"); LS = localStorage; } catch (e) { }
  var S = { pac: [], seq: 0, ativo: null, q: "", sel: null, ab: {}, modal: null, calc: {}, erro: "", edit: 0, merro: "" };
  try { var g = JSON.parse((LS && LS.getItem("g3.pac")) || "null"); if (g) { S.pac = g.pac; S.seq = g.seq; S.ativo = g.ativo; } } catch (e) { }
  S.pac.forEach(function (p) { if (!p.modo) p.modo = "sint"; if (p.txt == null) p.txt = p.queixa || ""; if (p.leito == null) p.leito = ""; if (!p.tema) p.tema = "sind"; if (p.temas.indexOf(p.tema) < 0) p.temas.push(p.tema); });
  function salvar() { try { LS && LS.setItem("g3.pac", JSON.stringify({ pac: S.pac, seq: S.seq, ativo: S.ativo })); } catch (e) { } }

  // ---------- utilidades ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/₂/g, "2").toLowerCase(); }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function hm(t) { var d = new Date(t); return p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function vg(n) { return String(n).replace(".", ","); }
  function tm(id) { return F.temas.filter(function (t) { return t.id === id; })[0]; }
  function pac() { return S.pac.filter(function (p) { return p.id === S.ativo; })[0] || null; }
  function nomeP(p) { return p.nome || "Paciente " + p2(p.n); }
  function Dt(p, id) { var d = p.d[id] || (p.d[id] = { ac: {}, ach: {}, sin: {}, opc: {}, ex: {}, med: {}, cont: {}, resp: {}, hist: [], dest: null, dx: "susp", ok: null }); if (!d.off) d.off = {}; if (!d.tx) d.tx = { ach: {}, sin: {} }; if (!d.perg) d.perg = {}; return d; }
  function D(p) { return Dt(p, p.tema); }
  function log(p, x) { p.log.push({ t: Date.now(), x: x, tm: p.tema }); }
  function ult(p, k) { for (var i = p.vit.length - 1; i >= 0; i--) if (p.vit[i].k === k) return p.vit[i]; return null; }
  function prim(p, k) { for (var i = 0; i < p.vit.length; i++) if (p.vit[i].k === k) return p.vit[i]; return null; }
  function ctx(p) {
    var d = D(p);
    function tem(l, k) { return !d.off[l + "." + k] && ((d.sin[l] || []).indexOf(k) >= 0 || (d.tx.sin[l] || []).indexOf(k) >= 0); }
    return { a: function (id) { return d.ach[id] || d.tx.ach[id]; }, o: function (id) { return d.opc[id]; }, n: function (k) { var u = ult(p, k); return u ? u.v : null; },
      ex: function (id) { return d.ex[id] || {}; }, adm: function (id) { return ((d.med[id] || {}).adm || []).length; }, cont: function (id) { return (d.cont[id] || []).length; },
      r: function (id) { return (d.resp[id] || {}).v; }, p: function (id) { return d.perg[id] || (d.tx.perg || {})[id]; }, tem: tem,
      qtd: function () { var n = Object.keys(d.ach).length + Object.keys(d.tx.ach).length + Object.keys(d.opc).length; ["qx", "ef"].forEach(function (l) { n += (d.sin[l] || []).length + (d.tx.sin[l] || []).length; }); return n; } };
  }
  function vis(lista, P) { return (lista || []).filter(function (x) { return !x.se || x.se(P); }); }
  function passosDe(p) { var t = tm(p.tema), P = ctx(p); return t.passos.filter(function (s) { return s.se(P); }); }
  function medsDe(t) { var l = []; t.passos.forEach(function (s) { s.itens.forEach(function (i) { if (i.tipo === "med" && l.indexOf(i.med) < 0) l.push(i.med); }); }); return l; }
  function rotDose(m, d) { return m.rot && m.rot[d] ? m.rot[d] : vg(d) + " mg"; }
  function vitDef(k) { return F.vitais.filter(function (v) { return v.k === k; })[0]; }
  function hipoteses(p) {
    var t = tm(p.tema), P = ctx(p); if (!t.hipoteses) return [];
    return t.hipoteses.map(function (h, i) { return { h: h, f: h.favor(P), c: h.contra(P), i: i }; }).filter(function (x) { return x.f.length; })
      .sort(function (a, b) { return (b.h.id === "pcr") - (a.h.id === "pcr") || (b.f.length - b.c.length) - (a.f.length - a.c.length) || a.i - b.i; });
  }
  function grau(x) { return x.c.length ? ["fraca", "Pouco provável"] : x.f.length >= 2 ? ["forte", "Compatível"] : ["media", "Possível"]; }

  // ---------- texto livre → achados e sinais vitais ----------
  function analisa(txt) {
    var n = " " + norm(txt) + " ", r = { sin: {}, ach: {}, perg: {}, chips: [], vit: {} }, m;
    F.sintomas.forEach(function (s) {
      var hit = null;
      s.termos.forEach(function (t) { if (hit !== null) return; var re = new RegExp("(^|[^a-z0-9])" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?=[^a-z0-9]|$)"), mm = re.exec(n); if (mm) hit = mm.index + mm[1].length; });
      if (hit === null) return;
      var antes = n.slice(Math.max(0, hit - 30), hit).replace(/[^a-z0-9 ]/g, " ").trim().split(/\s+/).slice(-3), neg = antes.some(function (w) { return F.negacao.indexOf(w) >= 0; });
      r.chips.push({ t: s.t, neg: neg, k: s.k, g: s.g });
      if (s.g) r.ach[s.g] = neg ? "a" : "p"; else if (s.perg) r.perg[s.perg] = neg ? "n" : "s"; else if (!neg) (r.sin[s.l] || (r.sin[s.l] = [])).push(s.k);
    });
    if ((m = /[^a-z](?:fc|frequencia cardiaca)\s*(?:de|=|:)?\s*(\d{2,3})/.exec(n))) r.vit.fc = +m[1];
    if ((m = /[^a-z](?:sat|spo2|saturacao|saturando)\s*(?:de|=|:)?\s*(\d{2,3})/.exec(n))) r.vit.sat = +m[1];
    if ((m = /[^a-z](?:pa|pressao)\s*(?:de|=|:)?\s*(\d{2,3})\s*(?:x|\/|por)\s*(\d{2,3})/.exec(n))) { r.vit.pas = +m[1]; r.vit.pad = +m[2]; }
    else if ((m = /[^a-z]pas\s*(?:de|=|:)?\s*(\d{2,3})/.exec(n))) r.vit.pas = +m[1];
    if ((m = /[^a-z]fr\s*(?:de|=|:)?\s*(\d{1,2})/.exec(n))) r.vit.fr = +m[1];
    return r;
  }
  function aplicaTexto(p) {
    var r = analisa(p.txt), ds = Dt(p, "sind"); ds.tx = { ach: r.ach, sin: r.sin, perg: r.perg }; p.chips = r.chips; p.txv = p.txv || {};
    Object.keys(r.vit).forEach(function (k) { var v = r.vit[k], df = vitDef(k); if (p.txv[k] !== v && v >= df.min && v <= df.max) { p.vit.push({ k: k, v: v, t: Date.now() }); log(p, df.t + " " + vg(v) + " " + df.un + " (do texto)"); } });
    p.txv = r.vit;
  }

  // ---------- revisão automática quando um dado muda ----------
  function assinatura(p) { var c = tm(p.tema).classificar(ctx(p)); return c.itens.map(function (i) { return i.t + ": " + i.v; }).concat(passosDe(p).map(function (s) { return s.t; })).join(" · "); }
  function mudou(p) {
    if (!p.tema) return; var d = D(p), a = assinatura(p);
    if (d.sig && d.sig !== a && d.sigN && !tm(p.tema).sind) { d.mudou = { de: d.sig, para: a }; log(p, "Conduta revista. Antes: " + d.sig + ". Agora: " + (a || "sem conduta definida") + "."); d.ok = null; }
    d.sig = a; d.sigN = passosDe(p).length;
  }

  // ---------- pendências ----------
  function acoesDe(p) {
    var t = tm(p.tema), P = ctx(p), l = [];
    t.agora.forEach(function (a) { l.push({ k: "ag." + a.id, it: a }); });
    passosDe(p).forEach(function (s) { vis(s.itens, P).forEach(function (i) { if (i.tipo === "acao") l.push({ k: s.id + "." + i.id, it: i }); }); });
    return l;
  }
  function vitPedidos(p) { return vis(tm(p.tema).pedeVitais, ctx(p)); }
  function pend(p) {
    var t = tm(p.tema), d = D(p), P = ctx(p), r = { ac: [], falta: [], ex: [], reav: [] };
    acoesDe(p).forEach(function (a) { if (a.it.rep ? !(d.cont[a.it.id] || []).length : !d.ac[a.k]) r.ac.push(a.it.t); });
    passosDe(p).forEach(function (s) { vis(s.itens, P).forEach(function (i) { if (i.tipo === "med") { var st = d.med[i.med] || {}; if (!(st.adm || []).length && !st.nao) r.ac.push(F.meds[i.med].nome + (i.nota ? " (" + i.nota + ")" : "")); } }); });
    r.falta = t.classificar(P).falta.slice();
    vitPedidos(p).forEach(function (v) { if (P.n(v.k) == null) r.falta.push(vitDef(v.k).t + " (" + v.por + ")"); });
    t.exames.forEach(function (e) { var x = d.ex[e.id]; if (x && (x.st === "sol" || x.st === "agu")) r.ex.push(e.t + (x.st === "sol" ? " (pedido " : " (aguardando desde ") + hm(x.t) + ")"); });
    vis(t.reav, P).forEach(function (v) { if (v.quando) { var m = (d.med[v.quando.med] || {}).adm || []; if (m.length && !(d.resp[v.id] && d.resp[v.id].t > m[m.length - 1].t)) r.reav.push(v.t + " às " + hm(m[m.length - 1].t + v.quando.h * 3600000)); } });
    medsDe(t).forEach(function (k) { var m = F.meds[k], a = (d.med[k] || {}).adm || [], pl = m.plano; if (m.lembra && pl.intMin && a.length && !d.dest && !(pl.maxN && a.length >= pl.maxN)) r.reav.push(m.lembra + " " + hm(a[a.length - 1].t + pl.intMin * 60000)); });
    return r;
  }

  // ---------- ícones ----------
  var IC = {
    lista: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>', ok: '<path d="M5 12l4 4 10-10"/>', pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>', pilula: '<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M9 9l6 6"/>',
    lamp: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z"/>', bandeira: '<path d="M5 21V4h11l-2 4 2 4H5"/>', pergunta: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01"/>',
    coracao: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>', relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' };
  function ic(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + "</svg>"; }

  // ---------- peças pequenas ----------
  function tg(k, rot) { return '<button class="lk' + (S.ab[k] ? " on" : "") + '" data-a="tg" data-k="' + k + '">' + rot + "</button>"; }
  function como(k, l) { return l && l.length && S.ab["c:" + k] ? '<ul class="como">' + l.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" : ""; }
  function fonte(k, ref) { return ref && S.ab["f:" + k] ? '<p class="fonte">Fonte: ' + esc(ref) + "</p>" : ""; }
  function info(k, l, ref, rot) { return '<span class="infs">' + (l && l.length ? tg("c:" + k, rot || "Como fazer") : "") + (ref ? tg("f:" + k, "Fonte") : "") + "</span>"; }
  function ck(p, k, it) {
    var s = D(p).ac[k] || {};
    return '<button class="ck' + (s.st === "feito" ? " on" : s.st === "nao" ? " nao" : "") + '" data-a="ack" data-k="' + k + '" data-t="' + esc(it.t) + '"><i>' + (s.st === "feito" ? ic("ok") : s.st === "nao" ? "✕" : "") + "</i><span>" + esc(it.t) + (s.st === "nao" && s.motivo ? "<small>" + esc(s.motivo) + "</small>" : "") + "</span></button>";
  }
  function ckDet(p, k, it) {
    var s = D(p).ac[k] || {};
    return '<div class="det-it"><div class="row">' + ck(p, k, it) + '<button class="mini' + (s.st === "nao" ? " on" : "") + '" data-a="ac" data-k="' + k + '" data-t="' + esc(it.t) + '">Não feito</button>' + info(k, it.como, it.ref) + "</div>" +
      (s.st === "nao" ? '<input class="cmp" data-c="motivo" data-k="' + k + '" placeholder="Motivo (opcional)" value="' + esc(s.motivo || "") + '">' : "") + como(k, it.como) + fonte(k, it.ref) + "</div>";
  }
  function repLinha(p, it) {
    var c = D(p).cont[it.id] || [];
    return '<button class="ck rep' + (c.length ? " on" : "") + '" data-a="rep" data-id="' + it.id + '" data-t="' + esc(it.t) + '"><i>' + (c.length || "+") + "</i><span>" + esc(it.t) + (c.length ? "<small>" + c.length + "× · último " + hm(c[c.length - 1]) + "</small>" : "<small>toque a cada vez</small>") + "</span></button>" + (c.length ? '<button class="mini" data-a="repdes" data-id="' + it.id + '">Desfazer</button>' : "");
  }
  function medLinha(p, i, n) {
    var m = F.meds[i.med], pl = m.plano, st = D(p).med[i.med] || {}, adm = st.adm || [], pr = st.presc || [], u = adm.length ? adm[adm.length - 1].t : 0, cheio = pl.maxN && adm.length >= pl.maxN, bol = "";
    if (pl.maxN) for (var b = 0; b < pl.maxN; b++) bol += '<i class="' + (b < adm.length ? "on" : "") + '"></i>';
    var sit = adm.length ? (pl.maxN ? adm.length + "/" + pl.maxN : adm.length + "×") + " · " + hm(u) + (cheio ? " · máximo" : pl.intMin ? " · próxima " + hm(u + pl.intMin * 60000) : "") : st.nao ? "não usado" : pr.length ? "prescrito " + hm(pr[pr.length - 1].t) : "";
    return '<button class="medl' + (adm.length ? " ok" : st.nao ? " nao" : "") + '" data-a="med" data-id="' + i.med + '">' + (n ? '<span class="ord">' + n + "º</span>" : "") + '<span class="mt"><b>' + ic("pilula") + esc(m.nome) + "</b><span>" + esc(pl.q) + "</span><small>" + esc(pl.rep) + (pl.max ? " · máx. " + esc(pl.max) : "") + "</small></span>" +
      '<span class="ms">' + (bol ? '<span class="bol">' + bol + "</span>" : "") + (sit ? "<em>" + esc(sit) + "</em>" : "") + "</span></button>";
  }
  function simNao(id, v, rot) { var r = rot || ["Sim", "Não"]; return '<span class="sn"><button class="b' + (v === "p" ? " on" : "") + '" data-a="ach" data-id="' + id + '" data-v="' + (v === "p" ? "" : "p") + '">' + r[0] + '</button><button class="b' + (v === "a" ? " on" : "") + '" data-a="ach" data-id="' + id + '" data-v="' + (v === "a" ? "" : "a") + '">' + r[1] + "</button></span>"; }

  // ---------- nós do fluxograma ----------
  // nó: { id, ic, t, badge, cls, corpo (sempre à vista), det (ao abrir), feito, chave (conta para o "Agora") }
  function nos(p) {
    var t = tm(p.tema), d = D(p), P = ctx(p), L = [], cl = t.classificar(P), ps = passosDe(p);
    if (p.modo === "sint") {
      var ch = p.chips || [];
      L.push({ id: "sint", ic: "lista", t: "Sintomas e achados", feito: ch.length > 0, badge: ch.length ? "" : "escreva acima",
        corpo: ch.length ? '<div class="chs">' + ch.map(function (c) { return '<span class="ch' + (c.neg ? " neg" : "") + '">' + esc(c.neg ? "sem " + c.t.charAt(0).toLowerCase() + c.t.slice(1) : c.t) + "</span>"; }).join("") + "</div>" : '<p class="mini-t">Nada reconhecido ainda.</p>',
        det: '<p class="dica">"Sem" ou "nega" antes do sintoma marcam como ausente. Sinais vitais escritos (FC 120, sat 88, PA 80x50) também são registrados.</p>' });
      if (ch.some(function (c) { return c.k === "trauma" && !c.neg; })) L.push({ id: "trauma", ic: "alerta", cls: "al", t: F.semProtocolo.trauma.t, badge: "Sem protocolo", corpo: '<p class="mini-t">' + esc(F.semProtocolo.trauma.txt) + "</p>" });
    }
    var nAg = t.agora.filter(function (a) { return d.ac["ag." + a.id]; }).length;
    L.push({ id: "agora", ic: "ok", t: "Manejo inicial", chave: 1, feito: nAg === t.agora.length, badge: nAg === t.agora.length ? "Feito" : nAg + "/" + t.agora.length,
      corpo: t.agora.map(function (a) { return ck(p, "ag." + a.id, a); }).join(""), det: t.agora.map(function (a) { return ckDet(p, "ag." + a.id, a); }).join("") });
    if (t.gravidade) {
      var gv = t.gravidade, pres = gv.itens.filter(function (i) { return P.a(i.id) === "p"; }), todosA = gv.itens.every(function (i) { return P.a(i.id) === "a"; }), alg = gv.itens.some(function (i) { return P.a(i.id); });
      L.push({ id: "grav", ic: "alerta", t: gv.t + "?", chave: 1, feito: pres.length > 0 || todosA, cls: pres.length ? "verm" : "", badge: pres.length ? "Sim" : todosA ? "Não" : alg ? "em parte" : "",
        corpo: '<span class="sn"><button class="b' + (pres.length ? " on" : "") + '" data-a="gsim">Sim</button><button class="b' + (todosA ? " on" : "") + '" data-a="gnao">Não, nenhum</button></span>' + (pres.length ? '<div class="chs">' + pres.map(function (i) { return '<span class="ch v">' + esc(i.t) + "</span>"; }).join("") + "</div>" : ""),
        det: (gv.como ? '<p class="dica">' + esc(gv.como[0]) + "</p>" : "") + gv.itens.map(function (i) { return '<div class="row lin"><span class="lt">' + esc(i.t) + "</span>" + simNao(i.id, P.a(i.id), ["Presente", "Ausente"]) + "</div>"; }).join("") + info("grav", null, gv.ref) + fonte("grav", gv.ref) });
    }
    vis(t.investigar, P).filter(function (i) { return i.decide; }).forEach(function (it) {
      var k = "d." + it.id;
      if (it.tipo === "opc") {
        var v = d.opc[it.id];
        L.push({ id: k, ic: "pergunta", t: it.t + "?", chave: 1, feito: !!v,
          corpo: '<div class="ops">' + it.ops.map(function (x) { return '<button class="b' + (v === x.v ? " on" : "") + '" data-a="opc" data-id="' + it.id + '" data-v="' + x.v + '" data-t="' + esc(it.t) + '" data-r="' + esc(x.t) + '">' + esc(x.t) + "</button>"; }).join("") + "</div>",
          det: it.como || it.ref ? info(k, it.como, it.ref, "Como avaliar") + como(k, it.como) + fonte(k, it.ref) : "" });
      } else {
        var va = P.a(it.id), sel = d.sin[it.id] || [];
        L.push({ id: k, ic: "pergunta", t: it.t + "?", chave: 1, feito: !!va,
          corpo: simNao(it.id, va) + (sel.length ? '<div class="chs">' + sel.map(function (x) { return '<span class="ch">' + esc(it.sinais[x]) + "</span>"; }).join("") + "</div>" : ""),
          det: (it.sinais ? '<p class="dica">' + esc(it.como ? it.como[0] : "") + '</p><div class="chs">' + it.sinais.map(function (s, i) { return '<button class="ch b' + (sel.indexOf(i) >= 0 ? " on" : "") + '" data-a="sin" data-id="' + it.id + '" data-i="' + i + '" data-t="' + esc(it.t) + '">' + esc(s) + "</button>"; }).join("") + "</div>" : info(k, it.como, null, "Como avaliar") + como(k, it.como)) + info(k, null, it.ref) + fonte(k, it.ref) });
      }
    });
    vitPedidos(p).forEach(function (v) {
      var df = vitDef(v.k), u = ult(p, v.k), k = "v." + v.k;
      L.push({ id: k, ic: "coracao", t: df.t + "?", chave: 1, feito: !!u, badge: u ? vg(u.v) + " " + df.un : "",
        corpo: '<div class="vin"><input inputmode="decimal" data-c="vit" data-k="' + v.k + '" value="' + (u ? vg(u.v) : "") + '"><span>' + esc(df.un) + '</span></div><p class="mini-t">' + esc(v.por) + "</p>" + (S.erro && S.erro.k === v.k ? '<p class="err">' + esc(S.erro.t) + "</p>" : ""),
        det: (u ? '<p class="dica">Registrado às ' + hm(u.t) + ". Digite de novo para atualizar.</p>" : "") + info(k, null, v.ref) + fonte(k, v.ref) });
    });
    var pq = t.perguntar.paciente, pf = t.perguntar.familia, qs = pq.concat(pf), qr = qs.filter(function (q) { return P.p(q.id); }).length,
      outros = vis(t.investigar, P).filter(function (i) { return !i.decide; }), exs = vis(t.exames, P),
      exp = exs.filter(function (e) { var x = d.ex[e.id]; return x && x.st !== "res"; }).length, exr = exs.filter(function (e) { var x = d.ex[e.id]; return x && x.st === "res"; }).length;
    function nr(l) { return l.filter(function (q) { return P.p(q.id); }).length + "/" + l.length; }
    L.push({ id: "perg", ic: "pessoa", t: "Perguntar e examinar", feito: qs.length > 0 && qr === qs.length, badge: qr ? (qr === qs.length ? "Feito" : "Em andamento") : "",
      corpo: '<ul class="res">' + (pq.length ? "<li>Paciente <b>" + nr(pq) + "</b></li>" : "") + (pf.length ? "<li>Família <b>" + nr(pf) + "</b></li>" : "") +
        (exs.length ? "<li>Exames <b>" + (exp ? exp + " aguardando" : exr ? exr + " com resultado" : "nenhum pedido") + "</b></li>" : "") + "</ul>",
      det: perguntas(p, "Paciente", pq, "paciente") + perguntas(p, "Família ou acompanhante", pf, "familiar") +
        (outros.length ? '<p class="sub">Exame e achados</p>' + outros.map(function (i) { return i.tipo === "lista" ? lista(p, i) : triLinha(p, i); }).join("") : "") +
        (exs.length ? '<p class="sub">Exames</p>' + exs.map(function (e) { return exame(p, e); }).join("") : "") });
    if (!t.sind && cl.itens.length) { var cf = d.ok === d.sig;
      L.push({ id: "cls", ic: "lamp", t: cl.itens.map(function (i) { return i.v; }).join(" · "), cls: "cls", feito: cf, badge: cf ? "Confirmado" : "Sugerido",
        corpo: cl.itens.map(function (i) { return '<p class="mini-t">' + esc(i.t) + (i.porque ? ": " + esc(i.porque) : "") + "</p>"; }).join("") + (cf ? "" : '<button class="b sm" data-a="okcls">Confirmar</button>') }); }
    ps.forEach(function (s) {
      var it = vis(s.itens, P), n = 0, num = it.filter(function (i) { return i.tipo !== "info"; }).length > 1,
        feitos = it.filter(function (i) { return i.tipo === "med" ? ((d.med[i.med] || {}).adm || []).length || (d.med[i.med] || {}).nao : i.tipo === "acao" ? (i.rep ? (d.cont[i.id] || []).length : d.ac[s.id + "." + i.id]) : true; }).length;
      L.push({ id: "p." + s.id, ic: "bandeira", t: s.t, chave: 1, cls: "cond", feito: feitos === it.length, badge: "Conduta",
        corpo: (s.dica ? '<p class="agora">' + esc(s.dica(P)) + "</p>" : "") + it.map(function (i) { if (i.tipo === "info") return '<p class="aviso-i">' + esc(i.t) + "</p>"; n++; var nn = num ? n : 0;
          return i.tipo === "med" ? medLinha(p, i, nn) : '<div class="numl">' + (nn ? '<span class="ord">' + nn + "º</span>" : "") + (i.rep ? repLinha(p, i) : ck(p, s.id + "." + i.id, i)) + "</div>"; }).join(""),
        det: '<p class="dica">Por quê: ' + esc(s.porque) + "</p>" + it.filter(function (i) { return i.tipo === "acao" && !i.rep; }).map(function (i) { return ckDet(p, s.id + "." + i.id, i); }).join("") +
          it.filter(function (i) { return i.tipo === "acao" && i.rep && (i.como || i.ref); }).map(function (i) { return '<div class="det-it"><b class="lt">' + esc(i.t) + "</b>" + info("r." + i.id, i.como, i.ref) + como("r." + i.id, i.como) + fonte("r." + i.id, i.ref) + "</div>"; }).join("") + info("p." + s.id, null, s.ref) + fonte("p." + s.id, s.ref) });
    });
    if (!ps.length && !t.sind && cl.falta.length) L.push({ id: "falta", ic: "bandeira", t: "Conduta", cls: "cinza", corpo: '<p class="mini-t">Responda: ' + esc(cl.falta.join("; ")) + ".</p>" });
    var hs = hipoteses(p);
    if (t.sind && !ps.length && !hs.length) L.push({ id: "falta", ic: "bandeira", t: "Conduta", cls: "cinza", corpo: '<p class="mini-t">Escreva os sintomas ou responda os cartões: a conduta aparece aqui.</p>' });
    hs.forEach(function (x) {
      var h = x.h, gr = grau(x), k = "h." + h.id;
      L.push({ id: k, ic: "lamp", t: "Hipótese", cls: "hip " + gr[0], badge: gr[1],
        corpo: '<p class="hn">' + esc(h.curto || h.t) + "</p>" + (h.enquanto ? '<p class="agora">' + esc(h.enquanto) + "</p>" : "") + (h.tema ? '<button class="b pri" data-a="ir" data-id="' + h.tema + '" data-h="' + h.id + '">Seguir para ' + esc(tm(h.tema).curto) + " →</button>" : '<p class="mini-t">Sem protocolo no aplicativo ainda.</p>'),
        det: '<p class="kv"><small>A favor</small>' + esc(x.f.join("; ")) + "</p>" + (x.c.length ? '<p class="kv"><small>Contra</small>' + esc(x.c.join("; ")) + "</p>" : "") + '<p class="kv"><small>Para confirmar</small>' + esc(h.confirmar) + "</p>" + info(k, null, h.ref) + fonte(k, h.ref) });
    });
    vis(t.alertas, P).forEach(function (a) {
      if ((d.alOk || {})[a.id]) return;
      L.push({ id: "a." + a.id, ic: "alerta", t: a.t, cls: "al", badge: "Hipótese",
        corpo: '<p class="mini-t">' + esc(a.porque) + "</p>" + (a.ir ? '<button class="b pri" data-a="ir" data-id="' + a.ir + '" data-al="' + a.id + '">Seguir para ' + esc(tm(a.ir).curto) + " →</button>" : '<p class="mini-t">Fluxo ainda não está no aplicativo.</p>') + '<button class="lk" data-a="alok" data-id="' + a.id + '">Manter o caminho</button>' });
    });
    vis(t.reav, P).forEach(function (v) {
      var r = d.resp[v.id], op = r ? v.ops.filter(function (o) { return o.v === r.v; })[0] : null, k = "r." + v.id, due = null, m;
      if (v.quando) { m = (d.med[v.quando.med] || {}).adm || []; if (m.length) due = m[m.length - 1].t + v.quando.h * 3600000; }
      var pendente = due && !(r && r.t > m[m.length - 1].t);
      L.push({ id: k, ic: "relogio", t: v.t, feito: !!r && !pendente, badge: pendente ? "às " + hm(due) : r ? hm(r.t) : "",
        corpo: '<div class="ops">' + v.ops.map(function (o) { return '<button class="b' + (r && r.v === o.v ? " on" : "") + '" data-a="resp" data-id="' + v.id + '" data-v="' + o.v + '">' + esc(o.t) + "</button>"; }).join("") + "</div>" + (op ? '<p class="agora">' + esc(op.prox) + "</p>" : ""),
        det: info(k, v.como, v.ref, "O que acompanhar") + como(k, v.como) + fonte(k, v.ref) + '<input class="cmp" data-c="novo" placeholder="Novo achado ou intercorrência (vai para o histórico)">' });
    });
    if (!t.sind) L.push({ id: "dest", ic: "bandeira", t: "Destino", feito: !!d.dest, badge: d.dest ? d.dest.t : "",
      corpo: '<div class="ops">' + t.destino.ops.map(function (o) { return '<button class="b' + (d.dest && d.dest.v === o.v ? " on" : "") + '" data-a="dest" data-v="' + o.v + '" data-t="' + esc(o.t) + '">' + esc(o.t) + "</button>"; }).join("") + "</div>",
      det: (t.destino.notas || []).map(function (x) { return '<p class="dica">' + esc(x) + "</p>"; }).join("") + info("dest", null, t.destino.ref) + fonte("dest", t.destino.ref) + '<button class="lk" data-a="arquivar">Encerrar e arquivar o atendimento</button>' });
    var at = L.filter(function (x) { return x.chave && !x.feito; })[0]; if (at) at.atual = 1;
    return L;
  }
  function triLinha(p, it) { var v = ctx(p).a(it.id), k = "o." + it.id; return '<div class="det-it"><div class="row lin"><span class="lt">' + esc(it.t) + "</span>" + simNao(it.id, v, ["Presente", "Ausente"]) + info(k, it.sinais || it.como, it.ref, "O que procurar") + "</div>" + como(k, it.sinais || it.como) + fonte(k, it.ref) + "</div>"; }
  function lista(p, it) {
    var P = ctx(p);
    return '<div class="det-it"><p class="lt">' + esc(it.t) + '</p><div class="chs">' + it.itens.map(function (o) { return '<button class="ch b' + (P.tem(it.id, o.k) ? " on" : "") + '" data-a="lst" data-id="' + it.id + '" data-k="' + o.k + '" data-t="' + esc(o.t) + '">' + esc(o.t) + "</button>"; }).join("") + "</div>" + info("l." + it.id, null, it.ref) + fonte("l." + it.id, it.ref) + "</div>";
  }
  function perguntas(p, tit, l, quem) {
    if (!l || !l.length) return ""; var pg = D(p).perg;
    var P = ctx(p); return '<p class="sub">' + tit + "</p>" + l.map(function (q) { var v = P.p(q.id), k = "q." + q.id;
      return '<div class="pg' + (v ? " ok" : "") + '"><span class="lt">' + esc(q.t) + (S.ab["c:" + k] && q.por ? "<small>" + esc(q.por) + "</small>" : "") + fonte(k, q.ref) + '</span><span class="sn3">' +
        [["s", "Sim"], ["n", "Não"], ["ns", "?"]].map(function (o) { return '<button class="b' + (v === o[0] ? " on" : "") + '" data-a="pg" data-id="' + q.id + '" data-v="' + o[0] + '" data-t="' + esc(q.t) + '" data-q="' + quem + '" title="' + (o[0] === "ns" ? "Não sabe" : o[1]) + '">' + o[1] + "</button>"; }).join("") + "</span>" + info(k, q.por ? [q.por] : null, q.ref, "Por quê") + "</div>"; }).join("");
  }
  function exame(p, e) {
    var x = D(p).ex[e.id] || {}, k = "e." + e.id;
    function b(st, rot) { return '<button class="b' + (x.st === st ? " on" : "") + '" data-a="ex" data-id="' + e.id + '" data-st="' + st + '" data-t="' + esc(e.t) + '">' + rot + "</button>"; }
    var h = '<div class="det-it"><div class="row lin"><span class="lt">' + esc(e.t) + (e.por ? "<small>" + esc(e.por) + "</small>" : "") + '</span><span class="sn3">' + b("sol", "Pedido") + b("agu", "Aguardando") + b("res", "Resultado") + "</span>" + info(k, null, e.ref) + "</div>";
    if (x.st === "res") {
      if (e.num) h += '<div class="vin"><input inputmode="decimal" data-c="exval" data-id="' + e.id + '" placeholder="Valor" value="' + esc(x.val || "") + '"><span>' + esc(e.num.un) + '</span></div><p class="mini-t">' + (x.val ? (CALC.num(x.val) === null ? "Digite só o número." : CALC.num(x.val) < e.num.corte ? "Abaixo de " + e.num.corte + ": " + esc(e.num.txt) + "." : "Igual ou acima de " + e.num.corte + " " + esc(e.num.un) + ".") : "A decisão depende do número: " + esc(e.num.txt) + ".") + "</p>";
      else h += '<div class="ops">' + e.res.concat([{ v: "outro", t: "Outro achado" }, { v: "nsi", t: "Não sei interpretar" }]).map(function (o) { return '<button class="b' + (x.r === o.v ? " on" : "") + '" data-a="exr" data-id="' + e.id + '" data-v="' + o.v + '" data-t="' + esc(e.t) + '" data-r="' + esc(o.t) + '">' + esc(o.t) + "</button>"; }).join("") + "</div>" +
        (x.r === "outro" ? '<input class="cmp" data-c="exobs" data-id="' + e.id + '" placeholder="Descreva o achado" value="' + esc(x.obs || "") + '">' : "") + (x.r === "nsi" ? '<p class="mini-t">Registrado como não interpretado. Nada é presumido normal.</p>' : "");
    }
    return h + fonte(k, e.ref) + "</div>";
  }

  // ---------- telas ----------
  function trilho() {
    return '<nav class="rail"><div class="logo" title="Guia de PS">' + ic("coracao") + "</div>" + S.pac.filter(function (p) { return !p.arq; }).map(function (p) {
      var r = p.nome ? p.nome.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase() : p2(p.n);
      return '<button class="pb' + (p.id === S.ativo ? " on" : "") + '" data-a="abrir" data-id="' + p.id + '" title="' + esc(nomeP(p)) + " · " + esc(tm(p.tema).curto) + '">' + esc(r) + "</button>"; }).join("") +
      '<button class="pb novo" data-a="novo" title="Novo atendimento">+</button></nav>';
  }
  function cabecalho(p) {
    var pd = pend(p), n = pd.ac.length + pd.falta.length + pd.ex.length + pd.reav.length;
    var id = S.edit ? '<span class="ed"><input data-c="nome" placeholder="' + esc("Paciente " + p2(p.n)) + '" value="' + esc(p.nome) + '"><input class="cur" inputmode="numeric" data-c="idade" placeholder="Idade" value="' + esc(p.idade) + '"><input class="cur" data-c="leito" placeholder="Leito" value="' + esc(p.leito) + '"><button class="b sm" data-a="edit">OK</button></span>'
      : '<button class="pid" data-a="edit">' + ic("pessoa") + "<b>" + esc(nomeP(p)) + "</b>" + (p.idade ? "<span>· " + esc(p.idade) + " anos</span>" : "") + (p.leito ? "<span>· Leito " + esc(p.leito) + "</span>" : "") + '<small>editar</small></button>';
    return '<header class="top">' + id + '<span class="acts"><button class="b" data-a="resumo">Resumo' + (n ? ' <span class="cnt">' + n + "</span>" : "") + '</button><button class="b pri" data-a="passagem">Passagem de caso</button></span></header>';
  }
  function barraModo(p) {
    var tr = p.temas.length > 1 ? '<span class="trilha">' + p.temas.map(function (x) { return x === p.tema ? "<b>" + esc(tm(x).curto) + "</b>" : '<button class="lk" data-a="ir" data-id="' + x + '">' + esc(tm(x).curto) + "</button>"; }).join(" → ") + "</span>" : "";
    var h = '<div class="modo"><button class="tog' + (p.modo === "sint" ? " on" : "") + '" data-a="modo" data-v="sint"><i></i>Entrada por sintomas</button><button class="tog' + (p.modo === "doenca" ? " on" : "") + '" data-a="modo" data-v="doenca"><i></i>Direto para a doença</button>' + tr +
      '<span class="busca"><input id="q" type="search" autocomplete="off" placeholder="Buscar doença ou medicamento" value="' + esc(S.q) + '"><span id="sug">' + sugestoes() + "</span></span></div>";
    if (p.modo === "sint") h += '<div class="txtw"><textarea id="txt" rows="2" placeholder="Escreva o que o paciente tem: sintomas, história, exame, sinais vitais. Ex.: falta de ar, inchaço nas pernas, estertores, FC 120, sat 88">' + esc(p.txt) + "</textarea></div>";
    else h += '<div class="doen">' + F.temas.filter(function (x) { return !x.sind; }).map(function (x) { return '<button class="b' + (x.id === p.tema ? " on" : "") + '" data-a="tema" data-id="' + x.id + '">' + esc(x.nome) + "</button>"; }).join("") + "</div>";
    return h;
  }
  function sugestoes() {
    var n = norm(S.q).trim(); if (!n) return "";
    var ts = F.temas.filter(function (t) { return !t.sind && (norm(t.nome).indexOf(n) >= 0 || t.busca.some(function (b) { return b.indexOf(n) >= 0; })); });
    var ms = Object.keys(F.meds).filter(function (k) { var m = F.meds[k]; return norm(m.nome).indexOf(n) >= 0 || m.busca.some(function (b) { return b.indexOf(n) >= 0; }); });
    var h = ts.map(function (t) { return '<button data-a="tema" data-id="' + t.id + '"><b>' + esc(t.nome) + "</b><small>Protocolo</small></button>"; }).join("") +
      ms.map(function (k) { return '<button data-a="med" data-id="' + k + '"><b>' + esc(F.meds[k].nome) + "</b><small>" + esc(F.meds[k].ind) + "</small></button>"; }).join("");
    return '<div class="sug">' + (h || "<p>Nada encontrado.</p>") + "</div>";
  }
  function fluxoHtml(p) {
    var d = D(p), h = "";
    if (d.mudou) h += '<div class="faixa">' + ic("alerta") + "<span>A conduta mudou porque um dado mudou. Antes: " + esc(d.mudou.de || "sem conduta") + '.</span><button class="lk" data-a="okmud">Entendi</button></div>';
    h += '<div class="flow">' + nos(p).map(function (x, i) {
      var ab = S.sel === x.id;
      return (i ? '<span class="seta" aria-hidden="true"></span>' : "") + '<div class="no ' + (x.cls || "") + (x.feito ? " feito" : "") + (x.atual ? " atual" : "") + (ab ? " ab" : "") + '" id="n-' + x.id.replace(/\./g, "-") + '">' +
        '<button class="noh" data-a="sel" data-id="' + x.id + '"><span class="nic">' + (x.feito ? ic("ok") : ic(x.ic)) + "</span><b>" + esc(x.t) + "</b>" + (x.atual ? '<span class="bdg ag">Agora</span>' : x.badge ? '<span class="bdg">' + esc(x.badge) + "</span>" : "") + (x.det ? '<span class="abre">' + (ab ? "−" : "+") + "</span>" : "") + "</button>" +
        '<div class="nob">' + x.corpo + "</div>" + (ab && x.det ? '<div class="nod">' + x.det + "</div>" : "") + "</div>";
    }).join("") + "</div>";
    return h;
  }
  function tela() {
    var p = pac();
    if (!p) return '<div class="vazio"><div class="logo-g">' + ic("coracao") + '</div><h1>Guia de PS</h1><p>Apoio à decisão no plantão. Não substitui o julgamento médico.</p><button class="b pri gr" data-a="novo">+ Novo atendimento</button></div>';
    return cabecalho(p) + barraModo(p) + '<div id="fl">' + fluxoHtml(p) + "</div>";
  }

  // ---------- resumo (só quando pedido) ----------
  function modalResumo() {
    var p = pac(), pd = pend(p), lg = p.log.slice().reverse();
    function bl(tit, l) { return "<h4>" + tit + " <span>" + l.length + "</span></h4>" + (l.length ? "<ul>" + l.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : '<p class="mini-t">Nada.</p>'); }
    return '<div class="mh"><div><h2>Resumo</h2><p>' + esc(nomeP(p)) + '</p></div><button class="x" data-a="fechar" aria-label="Fechar">×</button></div><div class="mb">' + bl("Fazer agora", pd.ac) + bl("Falta avaliar", pd.falta) + bl("Resultados pendentes", pd.ex) + bl("Reavaliar", pd.reav) +
      "<h4>Linha do tempo <span>" + lg.length + '</span></h4><ul class="tl">' + lg.map(function (l) { return "<li><i>" + hm(l.t) + "</i> " + esc(l.x) + "</li>"; }).join("") + "</ul></div>";
  }

  // ---------- medicamento e calculadora ----------
  function abreMed(id) {
    var m = F.meds[id], p = pac(), u = p && ult(p, "peso");
    S.calc = { peso: u ? vg(u.v) : "", dose: m.doses && m.doses.length === 1 ? m.doses[0] : null, ap: m.aps && m.aps.length === 1 && m.modo !== "inf" ? 0 : null, faixa: m.faixas ? 0 : null, amp: "", apMg: "", apMl: "", dil: "", d: "", uso: null, oral: "" };
    S.modal = { tipo: "med", id: id }; S.q = ""; S.merro = "";
    if (p && medsDe(tm(p.tema)).indexOf(id) >= 0) { var st = D(p).med[id] || (D(p).med[id] = {}); if (!st.cons) { st.cons = Date.now(); log(p, "Consultado: " + m.nome); } }
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
    if (r.L) h += '<div class="resc">' + r.L.map(function (l, i) { return "<p" + (i === 0 || l[0] === "Volume a aspirar" ? ' class="pri"' : "") + "><small>" + esc(l[0]) + "</small><b>" + esc(l[1]) + "</b></p>"; }).join("") + '<p class="form">' + r.F.map(esc).join("<br>") + "</p></div>";
    if (r.erro) h += '<p class="err">' + esc(r.erro) + "</p>";
    if (r.falta) h += '<p class="faltac">Para calcular, informe: ' + r.falta.map(esc).join(", ") + ".</p>";
    var p = pac(), pas = p && ult(p, "pas");
    if (m.bolus && pas && pas.v >= m.bolus.pasMin) { var b = CALC.porPas(pas.v, m.bolus.faixas); h += '<div class="resc"><p><small>' + esc(m.bolus.t) + " · PAS " + pas.v + "</small><b>" + (b.erro ? "Sem faixa documentada para esta PAS" : b.ml + " mL em bolus") + '</b></p><p class="form">' + esc(m.bolus.depois) + "</p></div>"; }
    return h;
  }
  function modalMed() {
    var id = S.modal.id, m = F.meds[id], c = S.calc, p = pac(), noFluxo = p && medsDe(tm(p.tema)).indexOf(id) >= 0, st = noFluxo ? D(p).med[id] || {} : {};
    function sec(t, l) { return l && l.length ? "<h4>" + t + "</h4><ul>" + l.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; }
    function chips(a, lista, sel) { return '<div class="ops">' + lista.map(function (o) { return '<button class="b' + (sel === o[0] ? " on" : "") + '" data-a="' + a + '" data-v="' + o[0] + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>"; }
    function campo(k, rot) { return "<label>" + rot + '<input inputmode="decimal" data-k="' + k + '" class="cc" value="' + esc(c[k] || "") + '"></label>'; }
    var h = '<div class="mh"><div><h2>' + esc(m.nome) + "</h2><p>" + esc(m.ind) + '</p></div><button class="x" data-a="fechar" aria-label="Fechar">×</button></div><div class="mb">' +
      '<div class="plano"><p><small>Quanto</small>' + esc(m.plano.q) + "</p><p><small>Repetir</small>" + esc(m.plano.rep) + "</p>" + (m.plano.max ? "<p><small>Máximo</small>" + esc(m.plano.max) + "</p>" : "") + "</div>" +
      (m.cuid && m.cuid.length ? '<p class="aviso-i">' + esc(m.cuid[0]) + "</p>" : "");
    if (m.modo !== "txt") {
      h += '<h4>Calcular</h4><div class="calc">';
      if (m.modo === "furo") { h += "<p>Usa diurético de alça em casa?</p>" + chips("cuso", [["n", "Não"], ["s", "Sim"]], c.uso);
        if (c.uso === "s") h += '<div class="campos">' + campo("oral", "Dose oral diária (mg)") + "</div>";
        var ds = c.uso === "n" ? m.semUso : c.uso === "s" && CALC.num(c.oral) ? m.fator.map(function (f) { return CALC.num(c.oral) * f; }) : [];
        if (ds.length) h += "<p>Dose</p>" + chips("cdose", ds.map(function (d) { return [d, vg(d) + " mg"]; }), c.dose); }
      if (m.modo === "fixo" && m.doses.length > 1) h += "<p>Dose</p>" + chips("cdose", m.doses.map(function (d) { return [d, rotDose(m, d)]; }), c.dose);
      if (m.modo === "kg") h += "<p>Dose</p>" + chips("cfaixa", m.faixas.map(function (f, i) { return [i, f.t + ": " + vg(f.mgKg[0]) + " a " + vg(f.mgKg[1]) + " mg/kg"]; }), c.faixa) + '<div class="campos">' + campo("peso", "Peso (kg)") + "</div>";
      if (m.modo !== "inf") h += "<p>Ampola disponível</p>" + chips("cap", m.aps.map(function (a, i) { return [i, a.t]; }), c.ap);
      else h += "<p>Preparo do documento (toque para preencher)</p>" + chips("cprep", m.preps.map(function (x, i) { return [i, x.t]; }), c.prep) +
        '<div class="campos">' + campo("amp", "Nº de ampolas") + campo("apMg", "mg por ampola") + campo("apMl", "mL por ampola") + campo("dil", "Diluente (mL)") + (m.porKg ? campo("peso", "Peso (kg)") : "") + "</div>" +
        "<p>Dose (" + esc(m.un) + ")</p>" + chips("cd", (m.rapidas ? m.rapidas.map(function (x) { return [x.v, x.t]; }) : [[m.ini[0], "Início: " + vg(m.ini[0])]].concat(m.ini[1] !== m.ini[0] ? [[m.ini[1], vg(m.ini[1])]] : [], m.manter ? [[m.manter[0], "Manter: " + vg(m.manter[0])]] : [], m.max && m.max !== m.ini[1] ? [[m.max, "Máximo: " + vg(m.max)]] : [])), CALC.num(c.d)) +
        '<div class="campos">' + campo("d", "Outra dose (" + esc(m.un) + ")") + "</div>";
      h += '<div id="calcres">' + calcHtml(m) + "</div></div>";
    }
    if (noFluxo) {
      h += "<h4>Registrar em " + esc(nomeP(p)) + "</h4>" + (S.merro ? '<p class="err">' + esc(S.merro) + "</p>" : "") + '<div class="ops"><button class="b" data-a="mpresc">Prescrito</button><button class="b pri" data-a="madm">Administrado agora</button><button class="b" data-a="mnao">Não vou usar</button></div>' +
        ((st.presc || []).length || (st.adm || []).length || st.nao ? '<ul class="tl">' + (st.presc || []).map(function (x) { return "<li><i>" + hm(x.t) + "</i> Prescrito: " + esc(x.txt) + "</li>"; }).join("") + (st.adm || []).map(function (x) { return "<li><i>" + hm(x.t) + "</i> Administrado: " + esc(x.txt) + "</li>"; }).join("") + (st.nao ? "<li><i>" + hm(st.nao.t) + "</i> Decidido não usar</li>" : "") + "</ul>" : '<p class="mini-t">Abrir esta tela só registra consulta.</p>');
    } else h += '<p class="mini-t">Consulta avulsa: nada é registrado em paciente.</p>';
    return h + '<details class="mais"><summary>Dose, preparo e cuidados completos</summary>' + sec("Dose, via e intervalo", m.dose) + sec("Preparo e diluição", m.prep) + sec("Cuidados", m.cuid) + "</details>" + '<p class="fonte">Fonte: ' + esc(m.ref) + "</p></div>";
  }

  // ---------- passagem de caso ----------
  function passagem(p, det) {
    var L = [], idade = p.idade ? ", " + p.idade + " anos" : "";
    function vit(f) { return F.vitais.map(function (v) { var x = f(p, v.k); return x ? v.t + " " + vg(x.v) + " " + v.un + (det ? " (" + hm(x.t) + ")" : "") : null; }).filter(Boolean).join(", "); }
    L.push("IDENTIFICAÇÃO: " + nomeP(p) + idade + (p.leito ? ", leito " + p.leito : "") + ". Atendimento iniciado às " + hm(p.criado) + ".");
    L.push("MOTIVO E RELATO: " + (p.txt || "não registrado") + ".");
    var vi = vit(prim), vu = vit(ult);
    L.push("SINAIS VITAIS: " + (vi ? (vi === vu ? vi : "iniciais: " + vi + ". Mais recentes: " + vu) : "não registrados") + ".");
    var keep = p.tema;
    p.temas.forEach(function (tid) {
      var t = tm(tid); if (!p.d[tid]) return; p.tema = tid; var d = D(p), P = ctx(p), cl = t.classificar(P), pd = pend(p);
      L.push("", "— " + t.nome.toUpperCase() + " (" + (t.sind ? "sem diagnóstico definido" : d.dx === "conf" ? "diagnóstico confirmado pelo médico" : "hipótese em investigação") + ") —");
      var qs = t.perguntar.paciente.concat(t.perguntar.familia).filter(function (q) { return d.perg[q.id]; }).map(function (q) { return q.t + " " + { s: "Sim", n: "Não", ns: "Não sabe" }[d.perg[q.id]]; });
      L.push("HISTÓRIA: " + (qs.join(" · ") || "nenhuma pergunta registrada") + ".");
      var todos = (t.gravidade ? t.gravidade.itens : []).concat(t.investigar.filter(function (i) { return i.tipo !== "opc" && i.tipo !== "lista"; }));
      var pres = todos.filter(function (i) { return P.a(i.id) === "p"; }).map(function (i) { var s = (d.sin[i.id] || []).map(function (x) { return i.sinais[x]; }); return i.t + (s.length ? " (" + s.join(", ") + ")" : ""); });
      var aus = todos.filter(function (i) { return P.a(i.id) === "a"; }).map(function (i) { return i.t; }), na = todos.filter(function (i) { return !P.a(i.id); }).map(function (i) { return i.t; });
      t.investigar.filter(function (i) { return i.tipo === "lista"; }).forEach(function (i) { i.itens.forEach(function (o) { if (P.tem(i.id, o.k)) pres.push(o.t); }); });
      if (t.hipoteses) { var hh = hipoteses(p); if (hh.length) L.push("HIPÓTESES EM ABERTO (sugeridas pelo aplicativo, sem confirmação): " + hh.map(function (x) { return x.h.t + " (a favor: " + x.f.join(", ") + (x.c.length ? "; contra: " + x.c.join(", ") : "") + ")"; }).join("; ") + "."); }
      t.investigar.filter(function (i) { return i.tipo === "opc" && d.opc[i.id]; }).forEach(function (i) { pres.unshift(i.t + ": " + i.ops.filter(function (o) { return o.v === d.opc[i.id]; })[0].t); });
      L.push("ACHADOS: presentes: " + (pres.join("; ") || "nenhum registrado") + ". Ausentes: " + (aus.join("; ") || "nenhum registrado") + "." + (det && na.length ? " Não avaliados: " + na.join("; ") + "." : ""));
      if (cl.itens.length && !t.sind) L.push("CLASSIFICAÇÃO: " + cl.itens.map(function (i) { return i.t + " " + i.v; }).join("; ") + " (" + (d.ok === d.sig ? "confirmada pelo médico" : "sugerida pelo aplicativo, ainda não confirmada") + ").");
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
      L.push("PENDÊNCIAS E PONTOS A DISCUTIR: " + ((det ? pe : pe.slice(0, 6)).join("; ") || "nenhuma") + (!det && pe.length > 6 ? "; e mais " + (pe.length - 6) : "") + "." + (d.dest || t.sind ? "" : " Destino ainda não definido."));
    });
    p.tema = keep;
    if (det) { L.push("", "LINHA DO TEMPO:"); p.log.forEach(function (l) { L.push(hm(l.t) + " " + l.x); }); }
    return L.join("\n");
  }
  function modalPass() {
    var p = pac(), det = S.modal.det;
    return '<div class="mh"><div><h2>Passagem de caso</h2><p>' + esc(nomeP(p)) + ' · só com o que foi registrado; edite à vontade</p></div><button class="x" data-a="fechar" aria-label="Fechar">×</button></div><div class="mb"><div class="ops"><button class="b' + (det ? "" : " on") + '" data-a="pdet" data-v="0">Curta (oral)</button><button class="b' + (det ? " on" : "") + '" data-a="pdet" data-v="1">Detalhada</button></div>' +
      '<textarea id="pass" rows="18">' + esc(passagem(p, det)) + '</textarea><div class="ops"><button class="b pri" data-a="copiar">Copiar</button></div></div>';
  }

  // ---------- render ----------
  function render() {
    var sy = window.scrollY, mb = app.querySelector(".mb"), ms = mb ? mb.scrollTop : 0, ae = document.activeElement, foco = ae && ae.id === "txt", sel = foco ? [ae.selectionStart, ae.selectionEnd] : null;
    app.innerHTML = '<div class="lay">' + trilho() + '<div class="centro">' + tela() + "</div></div>" +
      (S.modal ? '<div class="fundo" data-a="fechar"></div><div class="modal' + (S.modal.tipo === "pass" ? " largo" : "") + '" role="dialog">' + (S.modal.tipo === "med" ? modalMed() : S.modal.tipo === "resumo" ? modalResumo() : modalPass()) + "</div>" : "");
    window.scrollTo(0, sy); var m2 = app.querySelector(".mb"); if (m2) m2.scrollTop = ms;
    if (foco) { var t = document.getElementById("txt"); if (t) { t.focus(); t.setSelectionRange(sel[0], sel[1]); } }
    setas();
  }
  // esconde a seta que sobra no fim de cada linha do fluxograma
  function setas() { Array.prototype.forEach.call(app.querySelectorAll(".seta"), function (s) { var a = s.previousElementSibling, b = s.nextElementSibling; s.classList.toggle("fim", !!(a && b && b.offsetTop > a.offsetTop + 4 && b.offsetLeft < a.offsetLeft)); }); }
  window.addEventListener("resize", setas);
  function soFluxo() { var p = pac(), el = document.getElementById("fl"), hd = app.querySelector(".top"); if (p && el) el.innerHTML = fluxoHtml(p); if (p && hd && !S.edit) hd.outerHTML = cabecalho(p); setas(); }
  function novoPac() {
    S.seq++; var p = { id: "P" + S.seq, n: S.seq, nome: "", idade: "", leito: "", txt: "", modo: "sint", tema: "sind", temas: ["sind"], d: {}, vit: [], log: [], criado: Date.now() };
    S.pac.push(p); S.ativo = p.id; S.sel = null; S.ab = {}; S.edit = 0; log(p, "Atendimento iniciado"); mudou(p); return p;
  }
  function entra(p, tema, motivo, hid) {
    var ant = D(p), P0 = ctx(p), tA = tm(p.tema), hh = hid && tA.hipoteses ? tA.hipoteses.filter(function (h) { return h.id === hid; })[0] : null, dados = hh && hh.levar ? hh.levar(P0) : null;
    p.tema = tema; if (p.temas.indexOf(tema) < 0) p.temas.push(tema); log(p, motivo + ": " + tm(tema).nome); S.ab = {}; S.sel = null;
    var d = D(p), t = tm(tema);
    if (ant !== d) { // leva o que já foi registrado e tem o mesmo significado
      (t.gravidade ? t.gravidade.itens : []).forEach(function (g) { var v = P0.a(g.id); if (v && !d.ach[g.id] && tA.gravidade && tA.gravidade.itens.some(function (x) { return x.id === g.id && x.t === g.t; })) d.ach[g.id] = v; });
      t.perguntar.paciente.concat(t.perguntar.familia).forEach(function (q) { var o = tA.perguntar.paciente.concat(tA.perguntar.familia).filter(function (x) { return x.id === q.id && x.t === q.t; })[0]; if ((o || (ant.tx.perg || {})[q.id]) && P0.p(q.id) && !d.perg[q.id]) d.perg[q.id] = P0.p(q.id); });
      if (dados) { Object.keys(dados.ach || {}).forEach(function (k) { if (!d.ach[k]) d.ach[k] = dados.ach[k]; }); Object.keys(dados.sin || {}).forEach(function (k) { if (!d.sin[k]) d.sin[k] = dados.sin[k]; }); log(p, "Achados já registrados foram levados para o protocolo"); }
    }
    mudou(p);
  }

  // ---------- eventos ----------
  app.addEventListener("input", function (ev) {
    var e = ev.target, p = pac();
    if (e.id === "q") { S.q = e.value; document.getElementById("sug").innerHTML = sugestoes(); return; }
    if (e.id === "txt" && p) { p.txt = e.value; aplicaTexto(p); mudou(p); salvar(); soFluxo(); return; }
    if (e.classList.contains("cc")) { S.calc[e.dataset.k] = e.value; if (["peso", "d", "oral"].indexOf(e.dataset.k) < 0) S.calc.prep = null; if (e.dataset.k === "oral") { S.calc.dose = null; return; } document.getElementById("calcres").innerHTML = calcHtml(F.meds[S.modal.id]); }
  });
  app.addEventListener("change", function (ev) {
    var e = ev.target, c = e.dataset.c, p = pac();
    if (e.classList.contains("cc")) { if (e.dataset.k === "oral") render(); return; }
    if (e.id === "txt" && p) { if (p.txt) log(p, "Relato: " + p.txt); salvar(); return; }
    if (!c || !p) return;
    var v = e.value.trim(); S.erro = "";
    if (c === "nome") { p.nome = v; log(p, "Nome: " + (v || "sem nome")); }
    else if (c === "idade") { p.idade = v; if (v) log(p, "Idade: " + v + " anos"); }
    else if (c === "leito") { p.leito = v; if (v) log(p, "Leito: " + v); }
    else if (c === "vit") { var d = vitDef(e.dataset.k), n = CALC.num(v);
      if (v === "") { } else if (n === null || n < d.min || n > d.max) S.erro = { k: d.k, t: "Digite só o número, entre " + d.min + " e " + d.max + " " + d.un + "." }; else { p.vit.push({ k: d.k, v: n, t: Date.now() }); log(p, d.t + " " + vg(n) + " " + d.un); } }
    else if (c === "motivo") { D(p).ac[e.dataset.k].motivo = v; if (v) log(p, "Motivo de não fazer “" + D(p).ac[e.dataset.k].rot + "”: " + v); }
    else if (c === "exval") { D(p).ex[e.dataset.id].val = v; if (CALC.num(v) !== null) log(p, "Resultado de " + tm(p.tema).exames.filter(function (q) { return q.id === e.dataset.id; })[0].t + ": " + v); }
    else if (c === "exobs") { D(p).ex[e.dataset.id].obs = v; if (v) log(p, "Achado descrito: " + v); }
    else if (c === "novo") { if (v) { log(p, "Novo achado ou intercorrência: " + v); D(p).hist.push({ t: Date.now(), rot: "Novo achado", t2: v }); } }
    mudou(p); salvar(); render();
  });
  app.addEventListener("keydown", function (ev) { if (ev.key === "Enter" && ev.target.tagName === "INPUT" && ev.target.id !== "q") ev.target.blur(); if (ev.key === "Escape" && S.modal) { S.modal = null; render(); } });
  app.addEventListener("click", function (ev) {
    var e = ev.target.closest("[data-a]"); if (!e) return;
    var a = e.dataset.a, p = pac(), d = p ? D(p) : null, id = e.dataset.id, v = e.dataset.v, t = p && tm(p.tema);
    if (a === "novo") { novoPac(); salvar(); render(); var tx = document.getElementById("txt"); if (tx) tx.focus(); return; }
    else if (a === "abrir") { S.ativo = id; S.sel = null; S.ab = {}; S.edit = 0; }
    else if (a === "edit") S.edit = !S.edit;
    else if (a === "modo") { p.modo = v; log(p, v === "sint" ? "Entrada por sintomas" : "Direto para a doença"); }
    else if (a === "tema") { S.q = ""; if (!p) { novoPac(); p = pac(); } if (p.tema !== id) entra(p, id, p.modo === "doenca" ? "Protocolo escolhido" : "Protocolo aberto pela busca"); }
    else if (a === "ir") { if (e.dataset.al) (d.alOk || (d.alOk = {}))[e.dataset.al] = 1; entra(p, id, e.dataset.h ? "Hipótese escolhida pelo médico, protocolo aberto" : e.dataset.al ? "Mudança de fluxo confirmada pelo médico" : "Voltou ao fluxo", e.dataset.h); window.scrollTo(0, 0); }
    else if (a === "alok") { (d.alOk || (d.alOk = {}))[id] = 1; log(p, "Sugestão de outro fluxo vista; caminho mantido"); }
    else if (a === "okmud") d.mudou = null;
    else if (a === "okcls") { d.ok = d.sig; log(p, "Classificação confirmada pelo médico: " + t.classificar(ctx(p)).itens.map(function (i) { return i.t + " " + i.v; }).join("; ")); }
    else if (a === "sel") S.sel = S.sel === id ? null : id;
    else if (a === "tg") S.ab[e.dataset.k] = !S.ab[e.dataset.k];
    else if (a === "ack") { var k = e.dataset.k; if (d.ac[k] && d.ac[k].st === "feito") { delete d.ac[k]; log(p, "Voltou a pendente: " + e.dataset.t); } else { d.ac[k] = { st: "feito", t: Date.now(), rot: e.dataset.t }; log(p, "Feito: " + e.dataset.t); } }
    else if (a === "ac") { var k2 = e.dataset.k; if (d.ac[k2] && d.ac[k2].st === "nao") { delete d.ac[k2]; log(p, "Voltou a pendente: " + e.dataset.t); } else { d.ac[k2] = { st: "nao", t: Date.now(), rot: e.dataset.t }; log(p, "Não feito: " + e.dataset.t); } }
    else if (a === "rep") { (d.cont[id] || (d.cont[id] = [])).push(Date.now()); (d.contRot || (d.contRot = {}))[id] = e.dataset.t; log(p, e.dataset.t + " nº " + d.cont[id].length); }
    else if (a === "repdes") { d.cont[id].pop(); log(p, "Registro desfeito: " + d.contRot[id]); }
    else if (a === "gsim") S.sel = "grav";
    else if (a === "gnao") { t.gravidade.itens.forEach(function (i) { d.ach[i.id] = "a"; }); log(p, t.gravidade.t + ": nenhum"); }
    else if (a === "ach") { var it = (t.gravidade ? t.gravidade.itens : []).concat(t.investigar).filter(function (x) { return x.id === id; })[0], ant = ctx(p).a(id);
      if (v) d.ach[id] = v; else { delete d.ach[id]; delete d.sin[id]; } if (v === "a") delete d.sin[id];
      log(p, it.t + ": " + (v === "p" ? "presente" : v === "a" ? "ausente" : "não avaliado") + (ant ? " (corrigido)" : "")); }
    else if (a === "sin") { var s = d.sin[id] || (d.sin[id] = []), i = +e.dataset.i, ix = s.indexOf(i), it2 = t.investigar.filter(function (x) { return x.id === id; })[0]; if (ix >= 0) s.splice(ix, 1); else s.push(i); if (s.length && d.ach[id] !== "p") d.ach[id] = "p"; log(p, e.dataset.t + ": " + (ix >= 0 ? "desmarcado " : "") + it2.sinais[i]); }
    else if (a === "lst") { var key = id + "." + e.dataset.k, sl = d.sin[id] || (d.sin[id] = []);
      if (ctx(p).tem(id, e.dataset.k)) { var kx = sl.indexOf(e.dataset.k); if (kx >= 0) sl.splice(kx, 1); if ((d.tx.sin[id] || []).indexOf(e.dataset.k) >= 0) d.off[key] = 1; log(p, "Desmarcado: " + e.dataset.t); }
      else { delete d.off[key]; sl.push(e.dataset.k); log(p, "Presente: " + e.dataset.t); } }
    else if (a === "pg") { if (d.perg[id] === v) { delete d.perg[id]; log(p, "Pergunta voltou a não feita: " + e.dataset.t); } else { d.perg[id] = v; log(p, "Perguntado ao " + e.dataset.q + ": " + e.dataset.t + " " + { s: "Sim", n: "Não", ns: "Não sabe" }[v]); } }
    else if (a === "opc") { var an = d.opc[id]; if (an === v) delete d.opc[id]; else d.opc[id] = v; log(p, e.dataset.t + ": " + (an === v ? "não informado" : e.dataset.r) + (an && an !== v ? " (corrigido)" : "")); }
    else if (a === "ex") { var x = d.ex[id]; if (x && x.st === e.dataset.st) { delete d.ex[id]; log(p, e.dataset.t + ": voltou a não pedido"); } else { d.ex[id] = { st: e.dataset.st, t: x ? x.t : Date.now(), r: x && x.r, val: x && x.val, obs: x && x.obs }; log(p, e.dataset.t + ": " + { sol: "pedido", agu: "aguardando resultado", res: "resultado disponível" }[e.dataset.st]); } }
    else if (a === "exr") { d.ex[id].r = v; log(p, "Resultado de " + e.dataset.t + ": " + e.dataset.r); }
    else if (a === "resp") { var rv = t.reav.filter(function (x) { return x.id === id; })[0], o = rv.ops.filter(function (x) { return x.v === v; })[0]; d.resp[id] = { v: v, t: Date.now() }; d.hist.push({ t: Date.now(), rot: rv.t, t2: o.t }); if (o.set) Object.keys(o.set).forEach(function (k3) { d.opc[k3] = o.set[k3]; }); log(p, rv.t + " " + o.t); }
    else if (a === "dest") { d.dest = d.dest && d.dest.v === v ? null : { v: v, t: e.dataset.t }; log(p, "Destino: " + (d.dest ? e.dataset.t : "não definido")); }
    else if (a === "arquivar") { p.arq = 1; log(p, "Atendimento encerrado"); S.ativo = null; }
    else if (a === "med") abreMed(id);
    else if (a === "fechar") S.modal = null;
    else if (a === "resumo") S.modal = { tipo: "resumo" };
    else if (a === "cdose") S.calc.dose = +v;
    else if (a === "cuso") { S.calc.uso = v; S.calc.dose = null; }
    else if (a === "cap") S.calc.ap = +v;
    else if (a === "cfaixa") S.calc.faixa = +v;
    else if (a === "cd") S.calc.d = vg(v);
    else if (a === "cprep") { var m = F.meds[S.modal.id], pr = m.preps[+v], ap = m.aps[pr.ap]; S.calc.prep = +v; S.calc.amp = String(pr.amp); S.calc.apMg = vg(ap.mg); S.calc.apMl = vg(ap.ml); S.calc.dil = String(pr.dil); }
    else if (a === "mpresc" || a === "madm" || a === "mnao") {
      var mm = F.meds[S.modal.id], st2 = d.med[S.modal.id] || (d.med[S.modal.id] = {}), r = calcular(mm, S.calc), pk = CALC.num(S.calc.peso);
      if (a === "mnao") { st2.nao = { t: Date.now() }; log(p, mm.nome + ": decidido não usar"); S.modal = null; }
      else if (!r.txt) S.merro = "Complete o cálculo antes de registrar, para a dose ficar anotada.";
      else if (a === "madm" && mm.plano.maxN && (st2.adm || []).length >= mm.plano.maxN) S.merro = "Número máximo de doses documentado já atingido (" + mm.plano.max + ").";
      else { S.merro = ""; var ky = a === "madm" ? "adm" : "presc"; (st2[ky] || (st2[ky] = [])).push({ t: Date.now(), txt: r.txt }); delete st2.nao; log(p, mm.nome + (a === "madm" ? " administrado: " : " prescrito: ") + r.txt);
        if (pk && pk >= 20 && pk <= 300 && !(ult(p, "peso") && ult(p, "peso").v === pk)) { p.vit.push({ k: "peso", v: pk, t: Date.now() }); log(p, "Peso " + vg(pk) + " kg"); }
        if (a === "madm") S.modal = null; }
    }
    else if (a === "passagem") S.modal = { tipo: "pass", det: 0 };
    else if (a === "pdet") S.modal.det = +v;
    else if (a === "copiar") { var ta = document.getElementById("pass"); ta.select(); try { navigator.clipboard.writeText(ta.value); } catch (x2) { document.execCommand("copy"); } e.textContent = "Copiado"; return; }
    if (p && !p.arq) mudou(p); salvar(); render();
  });
  if (!pac() || pac().arq) S.ativo = null;
  S.pac.forEach(function (p) { if (p.txt) aplicaTexto(p); });
  render();
})();
