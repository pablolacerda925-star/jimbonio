// INTERFACE — não contém dose, critério nem texto clínico. Tudo vem de CONTEUDO.
(function () {
  var C = CONTEUDO, app = document.getElementById("app"), IMG = window.IMG || {};
  var EX = ["indicado", "solicitado", "coletado", "resultado disponível", "indisponível no serviço"];
  var MD = ["sugerido", "prescrito", "administrado", "suspenso", "indisponível no serviço"];
  var OPC = [["sim", "Sim"], ["nao", "Não"], ["ns", "Não sei"], ["na", "Não avaliado"], ["ind", "Indisponível"]];
  var EST = { doc: "Seus PDFs", ext: "Fonte externa", extp: "Fonte externa · aguardando sua aprovação", avi: "Só em um PDF · sem confirmação em diretriz", pend: "Pendente" };
  var LS = null; try { localStorage.setItem("gps.t", "1"); localStorage.removeItem("gps.t"); LS = localStorage; } catch (e) { }
  var CR = (window.crypto && window.crypto.subtle) ? window.crypto : null;
  var S = { v: "home", tema: null, med: null, ctx: null, ap: {}, prep: {}, calc: {}, atts: null, seq: 0, ativo: null, chave: null, salt: null,
    mem: !LS || !CR, fav: [], rap: novoCaso(), src: [], msg: "", tev: "" };
  try { S.fav = JSON.parse((LS && LS.getItem("gps.fav")) || "[]"); } catch (e) { }
  if (S.mem) S.atts = [];

  function novoCaso() { return { resp: {}, pas: null, peso: null, conf: { cong: null, perf: null }, base: {}, itens: {}, outros: [], log: [], calcs: [] }; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(t) { var d = new Date(t); return p2(d.getDate()) + "/" + p2(d.getMonth() + 1) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()); }
  function ha(t) { var m = Math.round((Date.now() - t) / 60000); return m < 1 ? "agora" : m < 60 ? "há " + m + " min" : "há " + Math.floor(m / 60) + " h " + (m % 60) + " min"; }
  function vg(n) { return String(n).replace(".", ","); }
  function att() { return S.ativo && S.atts ? S.atts.filter(function (a) { return a.id === S.ativo; })[0] : null; }
  function caso() { return att() || S.rap; }
  function temaDe(id) { return C.temas.filter(function (t) { return t.id === id; })[0]; }
  function medDe(id) { return C.meds.filter(function (m) { return m.id === id; })[0]; }
  function agoraEv() { var v = S.tev ? new Date(S.tev).getTime() : NaN; return isFinite(v) ? v : Date.now(); }
  function log(x) { var a = att(); if (a) { a.log.push({ t: Date.now(), x: x }); gravar(); } }

  // ---------- armazenamento cifrado ----------
  function b64(buf) { var b = new Uint8Array(buf), s = ""; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
  function ub64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function derivar(senha, salt) {
    return CR.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveKey"]).then(function (k) {
      return CR.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 150000, hash: "SHA-256" }, k, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    });
  }
  function cifrar() {
    var iv = CR.getRandomValues(new Uint8Array(12));
    return CR.subtle.encrypt({ name: "AES-GCM", iv: iv }, S.chave, new TextEncoder().encode(JSON.stringify({ atts: S.atts, seq: S.seq })))
      .then(function (ct) { return JSON.stringify({ v: 1, conteudo: C.versao, salt: b64(S.salt), iv: b64(iv), ct: b64(ct) }); });
  }
  function gravar() { if (S.mem || !S.chave) return; cifrar().then(function (j) { LS.setItem("gps.cofre", j); }).catch(function () { S.msg = "Falha ao salvar. Exporte um backup agora."; render(); }); }
  function abrirCofre(senha, json) {
    var c = JSON.parse(json), salt = ub64(c.salt);
    return derivar(senha, salt).then(function (k) {
      return CR.subtle.decrypt({ name: "AES-GCM", iv: ub64(c.iv) }, k, ub64(c.ct)).then(function (pt) {
        var o = JSON.parse(new TextDecoder().decode(pt)); S.chave = k; S.salt = salt; S.atts = o.atts || []; S.seq = o.seq || 0;
      });
    });
  }
  var ocioso; function tocar() { clearTimeout(ocioso); if (S.chave) ocioso = setTimeout(function () { bloquear(); render(); }, 600000); }
  function bloquear() { S.chave = null; S.atts = null; S.ativo = null; }

  // ---------- fontes ----------
  function selo(e) { return '<span class="selo s-' + e + '">' + EST[e] + "</span>"; }
  function fontes(lista) {
    return (lista || []).map(function (s) {
      var f = C.fontes[s.f], i = S.src.push(s) - 1;
      var onde = s.p ? "p. " + s.p + (f.off ? " (impressa " + (s.p + f.off) + ")" : "") : (s.ref || "");
      return '<button class="fonte" data-a="src" data-i="' + i + '">' + esc(s.f) + (onde ? " · " + esc(onde) : "") + "</button>";
    }).join("");
  }
  function item(it) {
    return '<li class="it">' + esc(it.t) + " " + selo(it.e) + (it.aviso ? '<div class="aviso">' + esc(it.aviso) + "</div>" : "") +
      (it.por ? '<details><summary>Por que</summary>' + esc(it.por) + "</details>" : "") + '<div class="fts">' + fontes(it.s) + "</div></li>";
  }
  function listaItens(arr) {
    var ok = arr.filter(function (i) { return i.e !== "pend"; }), pe = arr.filter(function (i) { return i.e === "pend"; });
    return "<ul>" + ok.map(item).join("") + "</ul>" + (pe.length ? '<div class="pend"><b>Ainda não documentado ou pendente (não é orientação):</b><ul>' +
      pe.map(function (i) { return "<li>" + esc(i.t) + (i.por ? " — " + esc(i.por) : "") + "</li>"; }).join("") + "</ul></div>" : "");
  }

  // ---------- classificação ----------
  function rv(c, id) { return c.resp[id] ? c.resp[id].v : null; }
  function sug(t, c, eixo) {
    var sn = t.sinais.filter(function (s) { return s.eixo === eixo; }), pri = sn.filter(function (s) { return s.pri; });
    var pos = sn.filter(function (s) { return rv(c, s.id) === "sim"; });
    var neg = pri.filter(function (s) { return rv(c, s.id) === "nao"; });
    var falta = pri.filter(function (s) { return rv(c, s.id) !== "sim" && rv(c, s.id) !== "nao"; });
    var aval = sn.filter(function (s) { return rv(c, s.id) === "sim" || rv(c, s.id) === "nao"; }).length;
    return { v: pos.length ? "sim" : (neg.length === pri.length ? "nao" : null), pos: pos, falta: falta, aval: aval };
  }
  function perfil(c) {
    if (!c.conf.cong || !c.conf.perf) return null;
    var cg = c.conf.cong === "sim", bp = c.conf.perf === "sim";
    return cg ? (bp ? "C" : "B") : (bp ? "L" : "A");
  }
  function blocos(t, c) {
    var pf = perfil(c), pas = c.pas ? c.pas.v : null;
    return t.condutas.filter(function (b) {
      if (b.perfil !== pf) return false;
      if (b.pasLt != null) return pas != null && pas <= b.pasLt;
      if (b.pasGe != null) return pas != null && pas >= b.pasGe;
      return true;
    });
  }

  // ---------- telas ----------
  function topo() {
    var a = att();
    return '<header><div class="bar"><b>Guia de PS</b><nav>' +
      [["home", "Início"], ["pac", "Atendimentos"], ["div", "Divergências"]].map(function (n) { return '<button data-a="ir" data-v="' + n[0] + '"' + (S.v === n[0] ? ' class="on"' : "") + ">" + n[1] + "</button>"; }).join("") +
      '</nav></div><div class="ativo ' + (a ? "com" : "sem") + '">' + (a ? "Paciente ativo: <b>" + esc(a.rot) + "</b> · " + esc(a.id) + ' <button data-a="sair">Sair do atendimento</button>'
        : "Consulta rápida — nada é salvo") + "</div>" + (S.mem ? '<div class="aviso">Este navegador não permite guardar dados cifrados aqui. Atendimentos ficam só na memória e somem ao fechar a página.</div>' : "") +
      (S.msg ? '<div class="aviso">' + esc(S.msg) + "</div>" : "") + "</header>";
  }
  function rodape() {
    return "<footer>Conteúdo versão " + C.versao + " de " + C.data.split("-").reverse().join("/") + " · embutido neste arquivo (disponível offline) · conexão: " +
      (navigator.onLine ? "online" : "offline") + "<br>Apoio à decisão. Não substitui a avaliação do médico. Piloto com um tema.</footer>";
  }
  function indice() {
    var ix = [];
    C.temas.forEach(function (t) {
      ix.push({ k: t.nome, r: t.nome, tp: "Doença", a: "tema", id: t.id });
      t.siglas.forEach(function (s) { ix.push({ k: s, r: s + " — " + t.nome, tp: "Sigla", a: "tema", id: t.id }); });
      t.sinonimos.forEach(function (s) { ix.push({ k: s, r: s + " — " + t.nome, tp: "Sinônimo", a: "tema", id: t.id }); });
      t.queixas.forEach(function (s) { ix.push({ k: s, r: "Queixa: " + s + " → " + t.nome, tp: "Queixa", a: "tema", id: t.id }); });
    });
    C.meds.forEach(function (m) {
      ix.push({ k: m.nome, r: m.nome, tp: "Medicamento", a: "med", id: m.id });
      m.sin.forEach(function (s) { ix.push({ k: s, r: s + " — " + m.nome, tp: "Medicamento", a: "med", id: m.id }); });
    });
    return ix;
  }
  function resultados(q) {
    var n = norm(q).trim(); if (!n) return "";
    var r = indice().filter(function (x) { return norm(x.k).indexOf(n) >= 0; });
    if (!r.length) return '<p class="vz">Nada encontrado neste piloto para “' + esc(q) + "”.</p>";
    return r.map(function (x) { return '<button class="res" data-a="' + (x.a === "tema" ? "tema" : "medbusca") + '" data-id="' + x.id + '"><small>' + x.tp + "</small>" + esc(x.r) + "</button>"; }).join("");
  }
  function vHome() {
    function grupo(tit, f) {
      var ts = C.temas.filter(f);
      return "<h3>" + tit + "</h3>" + (ts.length ? ts.map(function (t) { return '<button class="res" data-a="tema" data-id="' + t.id + '">' + esc(t.nome) + "</button>"; }).join("") : '<p class="vz">Nenhum.</p>');
    }
    return '<section><input id="q" type="search" autocomplete="off" placeholder="Doença, queixa, sigla ou medicamento" value="' + esc(S.q || "") + '"><div id="res">' + resultados(S.q || "") + "</div></section><section>" +
      grupo("Atendimento imediato", function (t) { return t.atalhos.indexOf("imediato") >= 0; }) +
      grupo("Situações frequentes", function (t) { return t.atalhos.indexOf("frequente") >= 0; }) +
      grupo("Favoritos", function (t) { return S.fav.indexOf(t.id) >= 0; }) + "</section>";
  }
  function sel(k, lista) {
    var c = caso(), cur = c.itens[k], h = '<select data-a="est" data-k="' + k + '"><option value="">— sem registro —</option>';
    lista.forEach(function (o) { h += '<option' + (cur && cur.st === o ? " selected" : "") + ">" + o + "</option>"; });
    return h + "</select>" + (cur ? ' <small>' + fmt(cur.tEv) + " (" + ha(cur.tEv) + ")" + (Math.abs(cur.tEv - cur.tReg) > 60000 ? " · registrado " + fmt(cur.tReg) : "") + (cur.rev ? ' · <b class="rev">revisar</b>' : "") + "</small>" : "");
  }
  function vTema() {
    var t = temaDe(S.tema), c = caso(), a = att(), h = "";
    h += '<section><h2>' + esc(t.nome) + ' <button data-a="fav" data-id="' + t.id + '">' + (S.fav.indexOf(t.id) >= 0 ? "★ favorito" : "☆ favoritar") + "</button></h2>";
    h += "<h3>1. Abordagem inicial</h3>" + listaItens(t.inicial);
    h += "<h3>Exames na admissão " + selo(t.examesFonte.e) + '</h3><div class="fts">' + fontes(t.examesFonte.s) + "</div><ul>" +
      t.exames.map(function (e) { return '<li class="it">' + esc(e.t) + (e.cond ? " <i>(conforme a suspeita)</i>" : "") + (e.por ? " — " + esc(e.por) : "") + (a ? "<br>" + sel("ex:" + e.id, EX) : "") + "</li>"; }).join("") + "</ul></section>";
    // sinais
    h += "<section><h3>2. Conduzir o caso: congestão e perfusão</h3>" + '<p class="nota">Campo sem resposta não conta como “não”.</p>';
    [["cong", "Evidências de congestão"], ["perf", "Evidências de baixa perfusão"]].forEach(function (ex) {
      h += "<h4>" + ex[1] + "</h4>";
      [1, 0].forEach(function (pri) {
        var sn = t.sinais.filter(function (s) { return s.eixo === ex[0] && !!s.pri === !!pri; }), f = pri ? t.sinaisFonte.pri : t.sinaisFonte.comp;
        h += '<div class="fts">' + (pri ? "Lista principal " : "Lista complementar ") + selo(f.e) + fontes(f.s) + "</div>";
        sn.forEach(function (s) {
          h += '<div class="perg"><span>' + esc(s.t) + '</span><div class="ops">' + OPC.map(function (o) {
            return '<button data-a="resp" data-id="' + s.id + '" data-val="' + o[0] + '"' + (rv(c, s.id) === o[0] ? ' class="on"' : "") + ">" + o[1] + "</button>";
          }).join("") + "</div></div>";
        });
      });
      var g = sug(t, c, ex[0]), cf = c.conf[ex[0]], rot = ex[0] === "cong" ? ["congesto (úmido)", "sem congestão (seco)"] : ["baixa perfusão (frio)", "perfusão adequada (quente)"];
      h += '<div class="sug"><b>Sugestão do site:</b> ' + (g.v === "sim" ? rot[0] + " — sinais presentes: " + g.pos.map(function (s) { return esc(s.t); }).join(", ")
        : g.v === "nao" ? rot[1] + " — todos os sinais principais avaliados e ausentes"
          : g.aval === 0 ? "sem sugestão: nenhum sinal avaliado neste eixo" : "sem sugestão: faltam avaliar " + g.falta.map(function (s) { return esc(s.t); }).join(", ")) +
        '<div class="ops">' + (g.v ? '<button data-a="conf" data-e="' + ex[0] + '" data-val="' + g.v + '">Aceitar sugestão</button>' : "") +
        '<button data-a="conf" data-e="' + ex[0] + '" data-val="sim"' + (cf === "sim" ? ' class="on"' : "") + ">Definir: " + rot[0] + "</button>" +
        '<button data-a="conf" data-e="' + ex[0] + '" data-val="nao"' + (cf === "nao" ? ' class="on"' : "") + ">Definir: " + rot[1] + "</button></div>" +
        (cf ? "<div>Sua definição: <b>" + (cf === "sim" ? rot[0] : rot[1]) + "</b>" + (g.v && g.v !== cf ? ' <span class="rev">difere da sugestão atual — confira</span>' : "") + "</div>" : "") + "</div>";
    });
    h += '<p class="nota">' + esc(t.sinaisFonte.regra) + "</p>";
    h += '<div class="perg"><span>PAS (mmHg)</span><input id="pas" data-a="pas" inputmode="numeric" value="' + (c.pas ? c.pas.v : "") + '" placeholder="não informada">' + (c.pas ? " <small>" + ha(c.pas.t) + "</small>" : "") + "</div>";
    if (a) h += '<div class="perg"><span>Horário do acontecimento para os próximos registros</span><input type="datetime-local" data-a="tev" value="' + esc(S.tev) + '"> <small>vazio = agora</small></div>';
    h += "</section>";
    // painel
    var pf = perfil(c), pas = c.pas ? c.pas.v : null, bl = blocos(t, c), pend = [];
    t.sinais.forEach(function (s) { if (s.pri && rv(c, s.id) !== "sim" && rv(c, s.id) !== "nao") pend.push("Sinal não avaliado: " + s.t); });
    if (!c.conf.cong) pend.push("Definir congestão (sim ou não)"); if (!c.conf.perf) pend.push("Definir perfusão");
    if (pas == null) pend.push("PAS"); if (!c.peso) pend.push("Peso (necessário para as calculadoras por kg)");
    h += '<section class="painel"><h3>3. Painel do caso</h3><h4>Situação atual</h4><p>' + (pf ? "Perfil <b>" + pf + "</b> — " + t.perfis[pf] + " " + fontes(t.perfisFonte.s) : "Perfil não definido: faltam as duas definições (congestão e perfusão).") +
      (pas != null ? " · PAS " + pas + " mmHg (" + ha(c.pas.t) + ")" : "") + "</p>";
    h += "<h4>Ações indicadas</h4>";
    if (!pf) h += '<p class="vz">Aparecem depois que o perfil for definido.</p>';
    else if (pf === "C" && pas == null) h += '<p class="aviso">Perfil C: informe a PAS. A conduta documentada depende de a PAS estar abaixo ou acima de 90 mmHg.</p>';
    else {
      if (pf === "C" && pas === 90) h += '<p class="aviso">PAS de 90 mmHg: as fontes falam em “< 90” e “> 90”; nenhuma cobre exatamente 90. As duas condutas estão abaixo.</p>';
      bl.forEach(function (b) { h += (b.pasLt != null ? "<h5>PAS abaixo de 90 mmHg</h5>" : b.pasGe != null ? "<h5>PAS acima de 90 mmHg</h5>" : "") + "<ul>" + b.itens.filter(function (i) { return i.e !== "pend"; }).map(function (i) {
        return item(i).replace("</li>", (i.pas ? '<div class="it2">' + esc(t.limiares.t) + " " + fontes(t.limiares.s) + "</div>" : "") +
          [i.med, i.med2].filter(Boolean).map(function (m) { return '<button class="acao" data-a="med" data-id="' + m + '">Abrir ' + esc(medDe(m).nome) + " nesta indicação</button>"; }).join("") + "</li>");
      }).join("") + "</ul>";
        var pe = b.itens.filter(function (i) { return i.e === "pend"; });
        if (pe.length) h += '<div class="pend"><b>Pendente (não é orientação):</b> ' + pe.map(function (i) { return esc(i.t) + " — " + esc(i.por || ""); }).join("; ") + "</div>";
      });
      t.transicoes.forEach(function (tr) {
        if (tr.perfil === pf && pas != null && pas < tr.pasLt) h += '<div class="aviso"><b>Outro protocolo pode se aplicar.</b> ' + esc(tr.t) +
          (a ? ' <button data-a="outro" data-x="' + esc(tr.alvo) + '">Adicionar “' + esc(tr.alvo) + "” como problema deste atendimento</button>" : "") + "</div>";
      });
    }
    if (a) {
      h += "<h4>Medicamentos deste tema</h4><ul>" + C.meds.map(function (m) { return '<li class="it"><button class="acao" data-a="med" data-id="' + m.id + '">' + esc(m.nome) + "</button> " + sel("med:" + m.id, MD) + "</li>"; }).join("") + "</ul>";
      var feito = Object.keys(a.itens).filter(function (k) { return a.itens[k].st && a.itens[k].st !== "indicado" && a.itens[k].st !== "sugerido"; });
      h += "<h4>Já realizado</h4>" + (feito.length ? "<ul>" + feito.map(function (k) {
        var nome = k.indexOf("ex:") === 0 ? t.exames.filter(function (e) { return "ex:" + e.id === k; })[0].t : medDe(k.slice(4)).nome, it = a.itens[k];
        return "<li>" + esc(nome) + ": <b>" + it.st + "</b> · " + fmt(it.tEv) + " (" + ha(it.tEv) + ")" + (it.nota ? " · " + esc(it.nota) : "") + "</li>";
      }).join("") + "</ul>" : '<p class="vz">Nada registrado.</p>');
      if (a.outros.length) h += "<h4>Outros problemas neste atendimento</h4><ul>" + a.outros.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>";
    } else h += '<p class="nota">Na consulta rápida nada é registrado. Para marcar exames e medicamentos como solicitados ou administrados, abra um atendimento.</p>';
    h += "<h4>Dados pendentes</h4>" + (pend.length ? "<ul>" + pend.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" : '<p class="vz">Nenhum.</p>');
    var fu = a && a.itens["med:furosemida"], prox = !pf ? "Definir congestão e perfusão para obter o perfil." : (pf === "C" && pas == null) ? "Informar a PAS."
      : (fu && fu.st === "administrado") ? "Reavaliar o débito urinário às " + fmt(fu.tEv + 6 * 3600000) + (Date.now() > fu.tEv + 6 * 3600000 ? " — <b class=\"rev\">em atraso</b>" : "") + " (6 horas após a furosemida)."
        : "Escolher e registrar a conduta do perfil " + pf + ".";
    h += "<h4>Próxima decisão</h4><p>" + prox + "</p><h4>Critérios de reavaliação</h4>" + listaItens(t.reavaliacao) + "</section>";
    h += "<section><h3>4. Destino do paciente</h3>" + listaItens(t.destino) + "<h3>Prescrição de alta</h3>" + listaItens(t.alta) + "</section>";
    if (a) h += "<section><h3>Histórico deste atendimento</h3><ol class=\"log\">" + a.log.slice().reverse().map(function (l) { return "<li><small>" + fmt(l.t) + "</small> " + esc(l.x) + "</li>"; }).join("") + "</ol></section>";
    return h;
  }
  function cs(id) { return S.calc[id] || (S.calc[id] = {}); }
  function linha(r, v) { return "<tr><td>" + r + "</td><td><b>" + v + "</b></td></tr>"; }
  function vMed() {
    var m = medDe(S.med), c = caso(), a = att(), h = "";
    if (!S.ctx) return "<section><h2>" + esc(m.nome) + "</h2><p>Escolha a indicação. A mesma droga tem esquemas diferentes em cada situação.</p>" +
      C.temas.filter(function (t) { return m.esquemas.some(function (e) { return e.tema === t.id; }); }).map(function (t) { return '<button class="res" data-a="ctx" data-id="' + t.id + '">' + esc(t.nome) + "</button>"; }).join("") + "</section>";
    var t = temaDe(S.ctx), pf = perfil(c), ap = m.apres.filter(function (x) { return x.id === S.ap[m.id]; })[0];
    h += '<section><button data-a="tema" data-id="' + t.id + '">← Voltar ao tema</button><h2>' + esc(m.nome) + '</h2><p class="ctx">Indicação: <b>' + esc(t.nome) + "</b> · Etapa: " + (pf ? "perfil " + pf + " (" + t.perfis[pf] + ")" : "perfil não definido") +
      " · " + (a ? "Paciente: <b>" + esc(a.rot) + "</b> (" + a.id + ")" : "Consulta rápida") + "</p>";
    h += "<h3>Apresentação disponível</h3><p class=\"nota\">Escolha a ampola que você tem em mãos. Nenhuma vem selecionada.</p>" + m.apres.map(function (x) {
      return '<label class="rad"><input type="radio" name="ap" data-a="ap" value="' + x.id + '"' + (S.ap[m.id] === x.id ? " checked" : "") + "> " + esc(x.r) + (x.comum ? " <i>— mais comum nos seus PDFs</i>" : "") + " " + fontes(x.s) + "</label>";
    }).join("");
    var needKg = m.esquemas.some(function (e) { return e.porKg; });
    if (needKg) h += '<div class="perg"><span>Peso (kg)</span><input data-a="peso" inputmode="decimal" value="' + esc(c.peso || "") + '" placeholder="não informado"></div>';
    var pr = null;
    if (m.preparos) {
      h += "<h3>Solução preparada</h3><p class=\"nota\">“Adicionar a” significa somar os volumes: o volume final é o da droga mais o do diluente.</p>" + m.preparos.map(function (p) {
        var x = m.apres.filter(function (z) { return z.id === p.ap; })[0], k = CALC.preparo(x, p);
        return '<label class="rad"><input type="radio" name="pr" data-a="prep" value="' + p.id + '"' + (S.prep[m.id] === p.id ? " checked" : "") + (ap && ap.id === p.ap ? "" : " disabled") + "> Adicionar " + p.amp + " ampola(s) (" + k.volDroga + " mL) a " + p.dil + " mL de " + esc(p.diluente) +
          " → volume final " + k.volFinal + " mL · " + (k.mcgMl >= 1000 ? vg(CALC.r(k.mgMl, 2)) + " mg/mL" : vg(CALC.r(k.mcgMl, 1)) + " mcg/mL") + " " + fontes(p.s) + "</label>";
      }).join("");
      pr = m.preparos.filter(function (p) { return p.id === S.prep[m.id]; })[0];
    }
    h += "</section>";
    m.esquemas.filter(function (e) { return e.tema === t.id; }).forEach(function (e) {
      var st = cs(e.id), out = "", k = pr && ap ? CALC.preparo(ap, pr) : null;
      h += '<section class="esq"><h3>' + esc(e.titulo) + " " + selo(e.e) + "</h3><p>" + esc(e.txt) + "</p>" + (e.aviso ? '<div class="aviso">' + esc(e.aviso) + "</div>" : "") +
        '<div class="fts">' + fontes(e.s) + (e.div ? '<button class="fonte" data-a="ir" data-v="div">ver divergência</button>' : "") + "</div><p>Via: " + esc(e.via) + (e.ini ? " · Início documentado: " + esc(e.ini) : "") + "</p>";
      if (!ap) h += '<p class="aviso">Escolha a apresentação para calcular.</p>';
      else if (e.calc === "bolus" || e.calc === "mult") {
        if (e.calc === "mult") h += '<div class="perg"><span>Dose oral diária total (mg)</span><input data-a="ci" data-e="' + e.id + '" data-f="oral" inputmode="decimal" value="' + esc(st.oral || "") + '"></div><div class="perg"><span>Multiplicador (' + e.min + " a " + e.max + ' vezes)</span><input data-a="ci" data-e="' + e.id + '" data-f="fator" inputmode="decimal" value="' + esc(st.fator || "") + '"></div>';
        else h += '<div class="perg"><span>Dose (mg), entre ' + e.min + " e " + e.max + '</span><input data-a="ci" data-e="' + e.id + '" data-f="dose" inputmode="decimal" value="' + esc(st.dose || "") + '"></div>';
        h += '<button class="acao" data-a="calc" data-e="' + e.id + '">Calcular</button>';
        if (st.ok) {
          var d = e.calc === "mult" ? CALC.mult(st.oral, st.fator, e) : { doseMg: CALC.num(st.dose) }, b = d.erro ? d : CALC.bolus(d.doseMg, ap, e.calc === "bolus" ? e : null);
          if (b.erro) out = '<div class="erro">' + esc(b.erro) + "</div>";
          else { st.txt = vg(b.doseMg) + " mg = " + vg(b.volMl) + " mL"; out = '<table class="res2">' + linha("Dose", vg(b.doseMg) + " mg") + linha("Volume a aspirar", vg(b.volMl) + " mL") + linha("Ampolas utilizadas", b.ampolas + " de " + esc(ap.r)) + linha("Diluente", esc(e.prep) + " " + fontes(e.prepS)) + linha("Via", esc(e.via)) + "</table><p class=\"form\">Fórmula: volume (mL) = dose (mg) ÷ concentração (" + vg(ap.mg / ap.ml) + " mg/mL)" + (e.calc === "mult" ? "; dose EV (mg) = dose oral diária (mg) × multiplicador; teto documentado " + e.teto + " mg/dia" : "") + ".</p>"; }
        }
      } else if (e.calc === "inf") {
        if (!k) h += '<p class="aviso">Escolha a solução preparada para calcular.</p>';
        else {
          h += '<div class="perg"><span>Dose (' + e.un + ")</span><input data-a=\"ci\" data-e=\"" + e.id + '" data-f="dose" inputmode="decimal" value="' + esc(st.dose || "") + '"><button class="acao" data-a="calc" data-e="' + e.id + '" data-m="d">Calcular mL/h</button></div>' +
            '<div class="perg"><span>ou velocidade (mL/h)</span><input data-a="ci" data-e="' + e.id + '" data-f="mlh" inputmode="decimal" value="' + esc(st.mlh || "") + '"><button class="acao" data-a="calc" data-e="' + e.id + '" data-m="v">Calcular dose</button></div>';
          if (st.ok) {
            var r = st.ok === "d" ? CALC.infusao(st.dose, c.peso, k.mcgMl, e.porKg, e) : CALC.inverso(st.mlh, c.peso, k.mcgMl, e.porKg, e);
            if (r.erro) out = '<div class="erro">' + esc(r.erro) + "</div>";
            else {
              var dose = st.ok === "d" ? CALC.num(st.dose) : r.dose, mlh = st.ok === "d" ? r.mlH : CALC.num(st.mlh);
              st.txt = vg(dose) + " " + e.un + " = " + vg(mlh) + " mL/h (" + vg(CALC.r(k.mcgMl, 1)) + " mcg/mL" + (e.porKg ? ", " + vg(c.peso) + " kg" : "") + ")";
              out = '<table class="res2">' + linha("Dose", vg(dose) + " " + e.un) + linha("Velocidade de infusão", vg(mlh) + " mL/h") + linha("Solução", k.ampolas + " ampola(s), " + k.mgTotal + " mg em " + k.volFinal + " mL") +
                linha("Volume do medicamento", k.volDroga + " mL") + linha("Volume de diluente", k.volDil + " mL de " + esc(pr.diluente)) + linha("Volume final", k.volFinal + " mL") + linha("Concentração final", vg(CALC.r(k.mcgMl, 1)) + " mcg/mL") + linha("Via", esc(e.via)) +
                (e.porKg ? linha("Peso usado", vg(c.peso) + " kg") : "") + "</table>" + (r.aviso ? '<div class="aviso">' + esc(r.aviso) + "</div>" : "") +
                '<p class="form">Fórmula: mL/h = dose (' + e.un + ")" + (e.porKg ? " × peso (kg)" : "") + " × 60 ÷ concentração (mcg/mL). Máximo documentado: " + e.max + " " + e.un + (e.usual ? "; faixa usual até " + e.usual : "") + ".</p>";
            }
          }
        }
      } else if (e.calc === "pas") {
        h += '<p>PAS usada: <b>' + (c.pas ? c.pas.v + " mmHg" : "não informada — informe na tela do tema") + "</b></p>" + '<button class="acao" data-a="calc" data-e="' + e.id + '">Calcular</button>';
        if (st.ok) {
          var q = CALC.porPas(c.pas ? c.pas.v : null, e.faixas);
          if (q.erro) out = '<div class="erro">' + esc(q.erro) + "</div>";
          else if (!k) out = '<div class="erro">Escolha a solução preparada: o bolus é dado da solução diluída.</div>';
          else { st.txt = q.ml + " mL em bolus (" + vg(CALC.r(q.ml * k.mcgMl, 0)) + " mcg)"; out = '<table class="res2">' + linha("Bolus", q.ml + " mL da solução de " + vg(CALC.r(k.mcgMl, 1)) + " mcg/mL") + linha("Dose em massa", vg(CALC.r(q.ml * k.mcgMl, 0)) + " mcg") + linha("Via", esc(e.via)) + "</table><p class=\"form\">Fórmula: dose (mcg) = volume (mL) × concentração (mcg/mL).</p>"; }
        }
      }
      if (out) {
        var cr = a && a.calcs.filter(function (x) { return x.esq === e.id; }).slice(-1)[0];
        h += '<div class="saida">' + out + (cr && cr.rev ? '<div class="aviso"><b>Revisar:</b> o peso, a apresentação ou a solução mudou depois do último cálculo salvo (' + esc(cr.txt) + ").</div>" : "") +
          '<p class="nota">Calcular não registra a dose como administrada.</p>' + (a && st.txt ? '<button data-a="reg" data-e="' + e.id + '" data-st="prescrito">Registrar como prescrito</button> <button data-a="reg" data-e="' + e.id + '" data-st="administrado">Registrar como administrado</button>' : "") + "</div>";
      }
      h += "</section>";
    });
    h += "<section><h3>Outras informações nesta indicação</h3>" + listaItens(m.notas) + "</section>";
    return h;
  }
  function resumo(a) {
    var t = temaDe("ic"), pf = perfil(a), L = ["RESUMO PARA PASSAGEM DE CASO", "Atendimento " + a.id + " — " + a.rot, "Aberto em " + fmt(a.criado) + " · conteúdo versão " + a.ver, "",
      "Problema: " + t.nome + (a.outros.length ? " · Outros: " + a.outros.join("; ") : ""),
      "Perfil: " + (pf ? pf + " (" + t.perfis[pf] + ")" : "não definido") + (a.pas ? " · PAS " + a.pas.v + " mmHg em " + fmt(a.pas.t) : "") + (a.peso ? " · Peso " + a.peso + " kg" : ""), "", "Sinais avaliados:"];
    t.sinais.forEach(function (s) { var r = a.resp[s.id]; if (r) L.push("- " + s.t + ": " + OPC.filter(function (o) { return o[0] === r.v; })[0][1] + " (" + fmt(r.t) + ")"); });
    L.push("", "Exames e medicamentos:");
    Object.keys(a.itens).forEach(function (k) { var it = a.itens[k], nome = k.indexOf("ex:") === 0 ? t.exames.filter(function (e) { return "ex:" + e.id === k; })[0].t : medDe(k.slice(4)).nome; L.push("- " + nome + ": " + it.st + " em " + fmt(it.tEv) + (it.nota ? " — " + it.nota : "")); });
    L.push("", "Pendências:");
    t.sinais.forEach(function (s) { if (s.pri && !a.resp[s.id]) L.push("- avaliar: " + s.t); });
    t.exames.forEach(function (e) { var it = a.itens["ex:" + e.id]; if (!e.cond && (!it || it.st === "indicado" || it.st === "solicitado" || it.st === "coletado")) L.push("- exame " + e.t + ": " + (it ? it.st : "sem registro")); });
    var fu = a.itens["med:furosemida"]; if (fu && fu.st === "administrado") L.push("- reavaliar débito urinário às " + fmt(fu.tEv + 6 * 3600000));
    L.push("", "Histórico:"); a.log.forEach(function (l) { L.push(fmt(l.t) + " " + l.x); });
    return L.join("\n");
  }
  function vPac() {
    var h = "<section><h2>Atendimentos</h2>";
    if (!S.mem && !S.chave) {
      var tem = LS.getItem("gps.cofre");
      return h + "<p>" + (tem ? "Digite a senha para abrir os atendimentos guardados neste navegador." : "Crie uma senha. Os atendimentos ficam cifrados neste navegador, só neste aparelho. Sem a senha não há como recuperar.") + "</p>" +
        '<input id="senha" type="password" placeholder="Senha (mínimo 6 caracteres)"><button class="acao" data-a="' + (tem ? "abrir" : "criar") + '">' + (tem ? "Abrir" : "Criar senha") + "</button>" +
        '<p class="nota">Outro aparelho ou outro navegador não enxerga estes dados. Para levar, use o backup.</p><h3>Restaurar backup</h3><p class="nota">Importar substitui os atendimentos guardados neste navegador. Digite acima a senha do backup.</p><input type="file" id="arq" accept=".json"><button data-a="import">Importar arquivo de backup</button></section>';
    }
    h += '<div class="perg"><span>Novo atendimento (iniciais, leito ou registro)</span><input id="rot" placeholder="ex.: J.S., leito 4"><button class="acao" data-a="novo">Abrir atendimento</button></div>';
    [["ativo", "Em andamento"], ["arquivado", "Arquivados"]].forEach(function (g) {
      var l = S.atts.filter(function (a) { return a.st === g[0]; });
      h += "<h3>" + g[1] + "</h3>" + (l.length ? l.map(function (a) {
        return '<div class="pac' + (a.id === S.ativo ? " on" : "") + '"><b>' + esc(a.rot) + "</b> · " + a.id + " · aberto " + fmt(a.criado) + " · conteúdo " + a.ver + '<div class="ops"><button data-a="ativar" data-id="' + a.id + '">' + (a.id === S.ativo ? "Ativo" : "Tornar ativo") +
          '</button><button data-a="resumo" data-id="' + a.id + '">Resumo para passagem</button>' + (a.st === "ativo" ? '<button data-a="arq" data-id="' + a.id + '">Encerrar e arquivar</button>' : "") + "</div></div>";
      }).join("") : '<p class="vz">Nenhum.</p>');
    });
    if (S.resumo) h += '<h3>Resumo</h3><textarea id="rs" rows="14" readonly>' + esc(S.resumo) + '</textarea><button data-a="baixar">Baixar como texto</button>';
    if (!S.mem) h += '<h3>Backup</h3><button data-a="export">Exportar backup cifrado</button> <button data-a="travar">Bloquear agora</button><p class="nota">O backup usa a mesma senha. Salvamento automático a cada alteração; bloqueio após 10 minutos sem uso.</p>';
    return h + "</section>";
  }
  function vDiv() {
    return "<section><h2>Registro de divergências</h2><p class=\"nota\">O que os documentos diziam, se era o mesmo contexto clínico, a referência consultada e como foi resolvido.</p>" + C.divergencias.map(function (d) {
      return '<div class="pac"><b>' + esc(d.item) + "</b><p><i>Nos seus PDFs:</i> " + esc(d.versoes) + "</p><p><i>Mesmo contexto clínico?</i> " + esc(d.mesmo) + "</p><p><i>Referência externa:</i> " + esc(d.ref) + "</p><p><i>Resolução:</i> " + esc(d.res) + "</p><p><i>Situação:</i> " + esc(d.st) + "</p></div>";
    }).join("") + "<h3>Fontes</h3><ul>" + Object.keys(C.fontes).map(function (k) { var f = C.fontes[k]; return "<li><b>" + k + "</b> — " + esc(f.n) + " · " + esc(f.ed) + " · " + esc(f.tipo) + (f.ext ? " · externa" : "") + "</li>"; }).join("") + "</ul></section>";
  }
  function modal(s) {
    var f = C.fontes[s.f], im = s.img && IMG[s.img];
    return '<div class="modal" data-a="fechar"><div class="cx"><button data-a="fechar">Fechar</button><h3>' + esc(f.n) + "</h3><p>" + esc(f.ed) + " · " + esc(f.tipo) + (f.ext ? " · <b>fonte externa</b>" : "") + "</p><p>" +
      (s.p ? "Página " + s.p + " do PDF" + (f.off ? " (página impressa " + (s.p + f.off) + ")" : "") : esc(s.ref || "")) + "</p>" +
      (im ? '<img src="' + im + '" alt="Página original">' : f.url ? '<p><a href="' + esc(f.url) + '" target="_blank" rel="noopener">Abrir o documento original</a></p>' : '<p class="nota">A imagem desta página ainda não foi incluída no piloto. Consulte o PDF na página indicada.</p>') + "</div></div>";
  }
  function render() {
    S.src = []; var v = S.v === "tema" ? vTema() : S.v === "med" ? vMed() : S.v === "pac" ? vPac() : S.v === "div" ? vDiv() : vHome();
    app.innerHTML = topo() + "<main>" + v + "</main>" + rodape() + (S.modal ? modal(S.modal) : ""); S.msg = "";
  }
  function marcarRev(a, motivo) { if (!a) return; a.calcs.forEach(function (x) { x.rev = true; }); a.log.push({ t: Date.now(), x: motivo + " — cálculos anteriores marcados para revisão" }); }

  // ---------- eventos ----------
  app.addEventListener("input", function (ev) {
    var e = ev.target; if (e.id === "q") { S.q = e.value; document.getElementById("res").innerHTML = resultados(S.q); }
    if (e.dataset.a === "ci") cs(e.dataset.e)[e.dataset.f] = e.value;
  });
  app.addEventListener("change", function (ev) {
    var e = ev.target, a = e.dataset.a, c = caso(), at = att();
    if (a === "pas") { var n = CALC.num(e.value); var antes = c.pas ? c.pas.v : null; c.pas = n ? { v: n, t: agoraEv() } : null; if (e.value && !n) S.msg = "PAS inválida: use apenas números."; log("PAS: " + (antes == null ? "—" : antes) + " → " + (n || "—")); render(); }
    else if (a === "peso") { var p = CALC.num(e.value); if (e.value && !p) S.msg = "Peso inválido: use apenas números."; if (String(c.peso || "") !== String(p || "")) { c.peso = p; marcarRev(at, "Peso alterado para " + (p || "—") + " kg"); gravar(); } render(); }
    else if (a === "tev") { S.tev = e.value; }
    else if (a === "est") { if (!at) return; var ant = at.itens[e.dataset.k]; if (e.value) at.itens[e.dataset.k] = { st: e.value, tEv: agoraEv(), tReg: Date.now() }; else delete at.itens[e.dataset.k]; log(e.dataset.k + ": " + (ant ? ant.st : "sem registro") + " → " + (e.value || "sem registro")); render(); }
    else if (a === "ap") { S.ap[S.med] = e.value; S.prep[S.med] = null; marcarRev(at, "Apresentação alterada"); gravar(); render(); }
    else if (a === "prep") { S.prep[S.med] = e.value; marcarRev(at, "Solução alterada"); gravar(); render(); }
  });
  app.addEventListener("click", function (ev) {
    var e = ev.target.closest("[data-a]"); if (!e) return; var a = e.dataset.a, c = caso(), at = att(); tocar();
    if (e.tagName === "INPUT" || e.tagName === "SELECT") return;
    if (a === "ir") { S.v = e.dataset.v; S.resumo = ""; }
    else if (a === "tema") { S.tema = e.dataset.id; S.v = "tema"; }
    else if (a === "med") { S.med = e.dataset.id; S.ctx = S.tema; S.v = "med"; }
    else if (a === "medbusca") { S.med = e.dataset.id; S.ctx = null; S.v = "med"; }
    else if (a === "ctx") { S.ctx = e.dataset.id; S.tema = e.dataset.id; }
    else if (a === "fav") { var i = S.fav.indexOf(e.dataset.id); if (i >= 0) S.fav.splice(i, 1); else S.fav.push(e.dataset.id); try { LS && LS.setItem("gps.fav", JSON.stringify(S.fav)); } catch (x) { } }
    else if (a === "resp") {
      var ant = rv(c, e.dataset.id), t = temaDe(S.tema), s = t.sinais.filter(function (x) { return x.id === e.dataset.id; })[0];
      c.resp[e.dataset.id] = { v: e.dataset.val, t: agoraEv(), r: Date.now() };
      if (ant && ant !== e.dataset.val && c.conf[s.eixo]) { Object.keys(c.itens).forEach(function (k) { c.itens[k].rev = true; }); log("Resposta corrigida: " + s.t + " de " + ant + " para " + e.dataset.val + " — classificação e registros marcados para revisão"); }
      else log(s.t + ": " + e.dataset.val);
    }
    else if (a === "conf") { var ant2 = c.conf[e.dataset.e]; c.conf[e.dataset.e] = e.dataset.val; log((e.dataset.e === "cong" ? "Congestão" : "Baixa perfusão") + " definida: " + e.dataset.val + (ant2 && ant2 !== e.dataset.val ? " (antes: " + ant2 + ")" : "") + " · perfil " + (perfil(c) || "indefinido")); }
    else if (a === "outro") { if (at && at.outros.indexOf(e.dataset.x) < 0) { at.outros.push(e.dataset.x); log("Problema adicionado ao atendimento por confirmação do médico: " + e.dataset.x); } }
    else if (a === "calc") { var st = cs(e.dataset.e); st.ok = e.dataset.m || "1"; st.txt = ""; render(); if (at && st.txt) { at.calcs.push({ esq: e.dataset.e, txt: st.txt, t: Date.now(), rev: false }); gravar(); render(); } return; }
    else if (a === "reg") { var st2 = cs(e.dataset.e); at.itens["med:" + S.med] = { st: e.dataset.st, tEv: agoraEv(), tReg: Date.now(), nota: st2.txt }; log(medDe(S.med).nome + " registrada como " + e.dataset.st + ": " + st2.txt); S.msg = "Registrado no atendimento " + at.id + "."; }
    else if (a === "src") { S.modal = S.src[+e.dataset.i]; }
    else if (a === "fechar") { if (ev.target !== e && e.classList.contains("modal")) return; S.modal = null; }
    else if (a === "sair") { S.ativo = null; }
    else if (a === "novo") { var rot = document.getElementById("rot").value.trim(); if (!rot) { S.msg = "Informe um rótulo para o atendimento."; } else { S.seq++; var n = novoCaso(); n.id = "AT-" + ("000" + S.seq).slice(-4); n.rot = rot; n.criado = Date.now(); n.st = "ativo"; n.ver = C.versao; n.log.push({ t: Date.now(), x: "Atendimento aberto" }); S.atts.push(n); S.ativo = n.id; gravar(); } }
    else if (a === "ativar") { S.ativo = e.dataset.id; S.calc = {}; }
    else if (a === "arq") { var x = S.atts.filter(function (z) { return z.id === e.dataset.id; })[0]; x.st = "arquivado"; x.log.push({ t: Date.now(), x: "Atendimento encerrado e arquivado" }); if (S.ativo === x.id) S.ativo = null; gravar(); }
    else if (a === "resumo") { S.resumo = resumo(S.atts.filter(function (z) { return z.id === e.dataset.id; })[0]); }
    else if (a === "baixar") { baixar("resumo-atendimento.txt", S.resumo); }
    else if (a === "travar") { bloquear(); }
    else if (a === "export") { cifrar().then(function (j) { baixar("backup-guia-ps.json", j); }); return; }
    else if (a === "criar" || a === "abrir") {
      var senha = document.getElementById("senha").value; if (senha.length < 6) { S.msg = "A senha precisa de pelo menos 6 caracteres."; render(); return; }
      if (a === "criar") { S.salt = CR.getRandomValues(new Uint8Array(16)); derivar(senha, S.salt).then(function (k) { S.chave = k; S.atts = []; S.seq = 0; gravar(); tocar(); render(); }); }
      else abrirCofre(senha, LS.getItem("gps.cofre")).then(function () { tocar(); render(); }).catch(function () { S.msg = "Senha incorreta ou dados corrompidos."; render(); });
      return;
    }
    else if (a === "import") {
      var f = document.getElementById("arq").files[0], sn = document.getElementById("senha").value; if (!f || sn.length < 6) { S.msg = "Escolha o arquivo e digite a senha do backup."; render(); return; }
      var rd = new FileReader(); rd.onload = function () { abrirCofre(sn, rd.result).then(function () { gravar(); render(); }).catch(function () { S.msg = "Não foi possível abrir o backup com essa senha."; render(); }); }; rd.readAsText(f); return;
    }
    if (at) gravar(); render();
  });
  function baixar(nome, txt) { var b = new Blob([txt], { type: "text/plain" }), u = URL.createObjectURL(b), l = document.createElement("a"); l.href = u; l.download = nome; document.body.appendChild(l); l.click(); l.remove(); }
  window.addEventListener("online", render); window.addEventListener("offline", render);
  render();
})();
