// INTERFACE — escolher a doença e ver a prescrição e os exames. Nenhum texto clínico aqui: vem de DOENCAS e EXTRAS.
(function () {
  var app = document.getElementById("app");
  var LISTA = DOENCAS.concat(EXTRAS.doencas).sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt"); });
  var ORDEM = ["Cardiovascular", "Trombose e doença vascular", "Neurológico", "Respiratório", "Gastrointestinal", "Endócrino e metabólico", "Hidroeletrolítico", "Infecções", "Infecções de pele", "Geniturinário", "Reprodutor", "Hematológico", "Osteomuscular", "Psiquiatria", "Anafilaxia e alergias", "Intoxicações", "Causas externas", "Hemocomponentes", "Consulta rápida"];
  var FONTES = { PSZ2: "PS Zerado, 2ª edição", PSZ1: "PS Zerado, edição anterior", AHA: "Diretriz AHA 2025", CNP: "Cardiologia na Prática 3.0", MED: "Guia de Prescrições Medway" };
  function noGrupo(d, sis) { return d.sistema === sis || ((EXTRAS.grupos || {})[sis] || []).indexOf(d.id) >= 0; }
  var S = { q: "", aba: "presc", modo: "doencas" };
  var EXAME = /\b(exames?|solicitar|dosar|dosagem|hemograma|gasometria|lactato|hemoculturas?|culturas?|urocultura|ECG|eletrocardiograma|radiografia|tomografia|ultrassom|ultrassonografia|POCUS|ecocardiograma|troponina|D-d[ií]mero|creatinina|eletr[óo]litos|glicemia|cetonemia|coagulograma|INR|bilirrubinas?|amilase|lipase|PCR|VHS|sorologia|NS1|VDRL|hemoglobina|plaquetas|QTc|TTPa|clearance)\b/i;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
  function plano(s) { return String(s).replace(/\*\*/g, ""); }
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function acha(id) { return LISTA.filter(function (d) { return d.id === id; })[0]; }
  function eBizu(t) { return /^#?biz/i.test(t); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function fonteTxt(d) { if (!d.fonte) return "Sem fonte nos documentos enviados"; return (FONTES[d.fonte] || d.fonte) + (d.paginas ? ", p. " + (d.paginas[0] === d.paginas[1] ? d.paginas[0] : d.paginas[0] + " a " + d.paginas[1]) : ""); }

  // ---------- índice de medicamentos ----------
  // Para cada nome de EXTRAS.farmacos, os trechos de cada doença: o cabeçalho do medicamento, as linhas logo abaixo (dose, diluição, tempo) e a dica que vem colada nele.
  var ESTRUT = { med: 1, sub: 1, tab: 1, rot: 1 };
  // Rótulo curto antes de um medicamento ("Uso oral:", "OU", "+", "Casos leves:") é do medicamento seguinte, não do anterior.
  function cabeca(y) { if (!y || ESTRUT[y.tipo]) return false; var t = plano(y.t).trim(); return t.length < (y.tipo === "forte" ? 90 : 45) && !/\d/.test(t.replace(/^\d+[.)]\s*/, "")) && !/\.$/.test(t); }
  function trecho(d, i) {
    var it = d.itens, r = [it[i]], k = i + 1, j = i - 1, pre = [], ctx = [];
    while (cabeca(it[j])) pre.unshift(plano(it[j--].t).trim());
    for (var s2 = j; s2 >= 0; s2--) if (it[s2].tipo === "sub") { ctx.push(plano(it[s2].t)); break; }
    if (it[j] && it[j].tipo === "rot" && !eBizu(it[j].t) && plano(it[j].t).length < 60) ctx.push(plano(it[j].t));
    pre.forEach(function (t) { if (!/^(ou|\+)$/i.test(t)) ctx.push(t); });
    if (pre.indexOf("+") >= 0) for (var m = i - 1; m >= 0; m--) if (it[m].tipo === "med") { ctx.push("junto com " + plano(it[m].t)); break; }
    while (it[k] && !ESTRUT[it[k].tipo]) r.push(it[k++]);
    if (it[k] && it[k].tipo === "med") {
      var mais = false;
      while (r.length > 1 && cabeca(r[r.length - 1])) mais = plano(r.pop().t).trim() === "+" || mais;
      if (mais) r.push({ tipo: "forte", t: "+ " + it[k].t, ind: 0 });
    } else if (it[k] && it[k].tipo === "rot" && (eBizu(it[k].t) || /^(aten|cuidado|importante)/i.test(it[k].t))) { r.push(it[k++]); while (it[k] && !ESTRUT[it[k].tipo]) r.push(it[k++]); }
    return { ctx: ctx.map(function (t) { return t.replace(/:$/, ""); }).join(" · "), itens: r, pg: it[i].pg };
  }
  var FARM = (EXTRAS.farmacos || []).map(function (f) { return { nome: f[0], re: new RegExp(f[1]), slug: "med-" + slug(f[0]), usos: [] }; });
  LISTA.forEach(function (d) {
    if (d.semFonte) return;
    d.itens.forEach(function (x, i) {
      if (x.tipo !== "med") return;
      var t = norm(plano(x.t));
      FARM.forEach(function (f) {
        if (!f.re.test(t)) return;
        var u = f.usos.filter(function (u) { return u.d === d; })[0];
        if (!u) f.usos.push(u = { d: d, trechos: [] });
        u.trechos.push(trecho(d, i));
      });
    });
  });
  FARM = FARM.filter(function (f) { return f.usos.length; });
  FARM.forEach(function (f) { f.usos.sort(function (a, b) { var ca = a.d.sistema === "Consulta rápida", cb = b.d.sistema === "Consulta rápida"; return ca !== cb ? (ca ? -1 : 1) : a.d.nome.localeCompare(b.d.nome, "pt"); }); });
  var MAIS = FARM.slice().sort(function (a, b) { return b.usos.length - a.usos.length || a.nome.localeCompare(b.nome, "pt"); });
  function farmaco(sl) { return FARM.filter(function (f) { return f.slug === sl; })[0]; }
  function farmacosDe(med) { var t = norm(plano(med)); return FARM.filter(function (f) { return f.re.test(t); }); }
  function achaFarm(n) { return n.length < 3 ? [] : MAIS.filter(function (f) { var a = norm(f.nome); return n.split(/\s+/).every(function (w) { return a.indexOf(w) >= 0; }); }); }

  // ---------- lista ----------
  function casa(d, n) {
    if (!n) return true;
    var alvo = norm(d.nome + " " + d.sistema + " " + (EXTRAS.busca[d.id] || ""));
    if (n.split(/\s+/).every(function (w) { return alvo.indexOf(w) >= 0; })) return true;
    return d.itens.some(function (x) { return x.tipo === "med" && norm(x.t).indexOf(n) >= 0; });
  }
  function nomeNa(d, fs) { var f = fs.filter(function (f) { return f.usos.some(function (u) { return u.d === d; }); })[0]; return f && f.nome; }
  function porMedicamento(d, n) { return n && norm(d.nome + " " + (EXTRAS.busca[d.id] || "")).indexOf(n) < 0; }
  function lista() {
    var n = norm(S.q).trim(), h = "", total = 0, fs = achaFarm(n);
    if (fs.length) h += '<section class="grupo"><h2>Medicamentos <span>' + fs.length + '</span></h2><div class="chips">' + fs.slice(0, 12).map(chip).join("") + "</div></section>";
    ORDEM.forEach(function (sis) {
      var ds = LISTA.filter(function (d) { return noGrupo(d, sis) && casa(d, n); }); total += ds.length;
      if (!ds.length) return;
      h += '<section class="grupo"><h2>' + esc(sis) + ' <span>' + ds.length + "</span></h2><div class=\"doencas\">" + ds.map(function (d) {
        return '<a class="dz" href="#' + d.id + '">' + esc(d.nome) + (porMedicamento(d, n) ? "<small>tem " + esc(nomeNa(d, fs) || S.q) + " na prescrição</small>" : "") + "</a>"; }).join("") + "</div></section>";
    });
    if (!total && fs.length) return h;
    return (h || '<p class="vazio">Nenhuma doença encontrada para "' + esc(S.q) + '". Tente outra palavra ou o nome de um medicamento.</p>') + '<p class="rodape">' + LISTA.length + " doenças · prescrições transcritas do texto dos PDFs, com a página de origem · apoio à decisão, não substitui o julgamento médico</p>";
  }

  function chip(f) { return '<a class="chip" href="#' + f.slug + '">' + esc(f.nome) + "<span>" + f.usos.length + "</span></a>"; }
  function listaMeds() {
    var n = norm(S.q).trim(), fs = n ? FARM.filter(function (f) { var a = norm(f.nome); return n.split(/\s+/).every(function (w) { return a.indexOf(w) >= 0; }); }) : MAIS;
    if (n) fs.sort(function (a, b) { return (norm(b.nome).indexOf(n) === 0) - (norm(a.nome).indexOf(n) === 0) || b.usos.length - a.usos.length; });
    if (!fs.length) return '<p class="vazio">Nenhum medicamento encontrado para "' + esc(S.q) + '". Tente outra grafia ou busque pela doença.</p>';
    return '<section class="grupo"><h2>' + (n ? "Medicamentos" : "Mais usados primeiro") + " <span>" + fs.length + '</span></h2><div class="doencas">' + fs.map(function (f) {
      var nomes = f.usos.map(function (u) { return u.d.nome; });
      return '<a class="dz fm" href="#' + f.slug + '">' + esc(f.nome) + "<small>" + f.usos.length + (f.usos.length === 1 ? " doença" : " doenças") + " · " + esc(nomes.slice(0, 3).join(", ")) + (nomes.length > 3 ? "…" : "") + "</small></a>"; }).join("") + "</div></section>" +
      '<p class="rodape">' + FARM.length + " medicamentos · a dose e a diluição de cada doença são as do guia daquela doença, com a página</p>";
  }

  // ---------- prescrição ----------
  function notasDe(d, med) { return EXTRAS.notas.filter(function (x) { return x.doenca === d.id && x.med.test(med); }); }
  function nota(x) { return '<div class="nota' + (x.alerta ? " al" : "") + '"><p>' + esc(x.t) + (x.ver ? ' <a href="#' + x.ver + '">Abrir</a>' : "") + '</p><small>Fonte: ' + esc(x.ref) + "</small></div>"; }
  function linha(x) {
    var pad = ' style="--i:' + Math.min(x.ind, 4) + '"';
    if (x.tipo === "li") return '<li' + pad + ">" + fmt(x.t) + "</li>";
    if (x.tipo === "seta") return '<li class="seta"' + pad + ">" + fmt(x.t) + "</li>";
    if (x.tipo === "forte") return '<li class="forte"' + pad + ">" + fmt(x.t) + "</li>";
    if (/:$/.test(x.t) && plano(x.t).length < 60 && x.ind === 0) return '<li class="cab"' + pad + ">" + fmt(x.t.replace(/:$/, "")) + "</li>";
    return '<li class="p"' + pad + ">" + fmt(x.t) + "</li>";
  }
  function prescricao(d, semLink) {
    var h = "", aberto = null, dica = null;
    function fecha() { if (aberto) { h += "</ul></div>"; aberto = null; } if (dica) { h += "</ul></details>"; dica = null; } }
    d.itens.forEach(function (x) {
      if (x.tipo === "med") {
        fecha();
        var outros = semLink ? [] : farmacosDe(x.t).filter(function (f) { return f.usos.length > 1; });
        h += '<div class="med"><h3>' + fmt(x.t) + "</h3>" + (outros.length ? '<p class="outras">' + outros.map(function (f) { return '<a href="#' + f.slug + '">' + esc(f.nome) + ": dose em " + (f.usos.length === 2 ? "mais 1 doença" : "outras " + (f.usos.length - 1) + " doenças") + " →</a>"; }).join("") + "</p>" : "") + notasDe(d, plano(x.t)).map(nota).join("") + "<ul>"; aberto = 1; return;
      }
      if (x.tipo === "tab") { fecha(); h += '<div class="tabw"><table>' + x.tab.map(function (r, i) { return "<tr>" + r.map(function (c, j) { var tg = i === 0 || j === 0 ? "th" : "td"; return "<" + tg + ">" + esc(c) + "</" + tg + ">"; }).join("") + "</tr>"; }).join("") + "</table></div>"; return; }
      if (x.tipo === "sub") { fecha(); h += "<h4 class=\"sub\">" + fmt(x.t) + "</h4>"; return; }
      if (x.tipo === "rot") {
        fecha();
        if (eBizu(x.t)) {
          var r = x.t.replace(/^#?biz[uú]s?\s*:?\s*/i, ""), i = d.itens.indexOf(x), prox = r || (d.itens[i + 1] && d.itens[i + 1].tipo !== "med" ? d.itens[i + 1].t : ""), resumo = plano(prox).slice(0, 70);
          h += '<details class="dica"><summary><b>Dica do guia</b>' + (resumo ? "<span>" + esc(resumo) + (plano(prox).length > 70 ? "…" : "") + "</span>" : "") + "</summary><ul>" + (r ? '<li class="p">' + fmt(r) + "</li>" : ""); dica = 1;
        }
        else { h += '<div class="bloco"><p class="rot">' + fmt(x.t) + "</p><ul>"; aberto = 1; }
        return;
      }
      if (!aberto && !dica) { h += '<div class="bloco"><ul>'; aberto = 1; }
      h += linha(x);
    });
    fecha();
    return h;
  }
  function textoPrescricao(d) {
    var L = [d.nome.toUpperCase(), ""], pula = false;
    d.itens.forEach(function (x) {
      if (x.tipo === "rot") { pula = eBizu(x.t); if (!pula) L.push(plano(x.t)); return; }
      if (x.tipo === "med" || x.tipo === "sub") { pula = false; L.push("", plano(x.t)); return; }
      if (x.tipo === "tab") { if (!pula) x.tab.forEach(function (r) { L.push(r.join(" | ")); }); return; }
      if (!pula) L.push(new Array(Math.min(x.ind, 4) + 1).join("  ") + "- " + plano(x.t));
    });
    L.push("", "Fonte: " + fonteTxt(d));
    return L.join("\n").replace(/\n{3,}/g, "\n\n");
  }

  // ---------- exames ----------
  function exames(d) {
    var cur = EXTRAS.exames[d.id], cit = d.itens.filter(function (x) { return x.tipo !== "med" && x.tipo !== "tab" && EXAME.test(x.t); }), h = "";
    if (cur) h += '<div class="bloco ex"><h3>Exames</h3><ul>' + cur.itens.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul><small class="fonte">Fonte: ' + esc(cur.ref) + "</small></div>";
    if (cit.length) h += '<div class="bloco ex"><h3>' + (cur ? "Também citados no guia" : "Citados no texto do guia") + "</h3><ul>" + cit.map(function (x) { return "<li>" + fmt(x.t) + (x.pg ? ' <span class="pg">p. ' + x.pg + "</span>" : "") + "</li>"; }).join("") + "</ul></div>";
    if (!h) h = '<div class="semex"><b>Os documentos enviados não trazem exames para esta doença.</b><p>O PS Zerado é um guia de prescrição. Para completar esta aba é preciso uma fonte de exames (diretriz da sociedade ou protocolo do Ministério da Saúde).</p></div>';
    return h;
  }
  function nEx(d) { var c = EXTRAS.exames[d.id]; return (c ? c.itens.length : 0) + d.itens.filter(function (x) { return x.tipo !== "med" && x.tipo !== "tab" && EXAME.test(x.t); }).length; }

  // ---------- telas ----------
  function doenca(d) {
    var ne = nEx(d);
    return '<div class="dh"><a class="volta" href="#">← Doenças</a><h1>' + esc(d.nome) + '</h1><p class="meta"><span class="sis">' + esc(d.sistema) + "</span>" + esc(fonteTxt(d)) + "</p>" +
      '<div class="abas" role="tablist"><button role="tab" aria-selected="' + (S.aba === "presc") + '" class="' + (S.aba === "presc" ? "on" : "") + '" data-aba="presc">Prescrição</button><button role="tab" aria-selected="' + (S.aba === "ex") + '" class="' + (S.aba === "ex" ? "on" : "") + '" data-aba="ex">Exames <span>' + (ne || "—") + "</span></button>" +
      (S.aba === "presc" ? '<button class="copiar" data-copiar="1">Copiar prescrição</button>' : "") + "</div></div>" +
      '<div class="conteudo">' + (d.semFonte ? '<div class="semex"><b>Ainda sem prescrição.</b><p>' + esc(d.semFonte) + "</p></div>" : S.aba === "presc" ? prescricao(d) : exames(d)) + "</div>" + '<textarea id="copia" aria-hidden="true" tabindex="-1" readonly></textarea>';
  }
  function remedio(f) {
    return '<div class="dh"><a class="volta" href="#medicamentos">← Medicamentos</a><h1>' + esc(f.nome) + '</h1><p class="meta"><span class="sis">' + f.usos.length + (f.usos.length === 1 ? " doença" : " doenças") + "</span>Dose e diluição como no guia de cada doença</p></div>" +
      '<div class="conteudo">' + f.usos.map(function (u) {
        return '<section class="uso"><div class="uh"><a href="#' + u.d.id + '">' + esc(u.d.nome) + ' <span>→</span></a><small>' + esc(u.d.sistema) + "</small></div>" + u.trechos.map(function (t) {
          return (t.ctx ? '<p class="ctx">' + esc(t.ctx) + "</p>" : "") + prescricao({ id: u.d.id, itens: t.itens }, true) + '<small class="fonte">' + esc(FONTES[u.d.fonte] || u.d.fonte) + (t.pg ? ", p. " + t.pg : "") + "</small>"; }).join("") + "</section>";
      }).join("") + "</div>";
  }
  function render() {
    var id = decodeURIComponent(location.hash.slice(1)), d = id && acha(id), f = id && farmaco(id);
    if (d) { app.innerHTML = '<div class="pagina">' + doenca(d) + "</div>"; return; }
    if (f) { app.innerHTML = '<div class="pagina">' + remedio(f) + "</div>"; return; }
    S.modo = id === "medicamentos" ? "meds" : "doencas";
    var m = S.modo === "meds";
    app.innerHTML = '<header class="topo"><div class="marca"><b>Guia de PS</b><span>Prescrição e exames por doença</span></div>' +
      '<nav class="modos"><a href="#" class="' + (m ? "" : "on") + '">Doenças</a><a href="#medicamentos" class="' + (m ? "on" : "") + '">Medicamentos</a></nav>' +
      '<input id="q" type="search" autocomplete="off" placeholder="' + (m ? "Buscar medicamento (ex.: noradrenalina, ceftriaxona)" : "Buscar doença, sigla ou medicamento (ex.: TEP, ITU, adenosina)") + '" value="' + esc(S.q) + '"></header><main id="lista" class="pagina">' + (m ? listaMeds() : lista()) + "</main>";
  }

  // ---------- eventos ----------
  window.addEventListener("hashchange", function () { S.aba = "presc"; render(); window.scrollTo(0, 0); });
  app.addEventListener("input", function (e) { if (e.target.id === "q") { S.q = e.target.value; document.getElementById("lista").innerHTML = S.modo === "meds" ? listaMeds() : lista(); } });
  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-aba]"); if (b) { S.aba = b.dataset.aba; render(); return; }
    var c = e.target.closest("[data-copiar]");
    if (c) {
      var d = acha(decodeURIComponent(location.hash.slice(1))), ta = document.getElementById("copia"); ta.value = textoPrescricao(d);
      var ok = function () { c.textContent = "Copiado"; setTimeout(function () { c.textContent = "Copiar prescrição"; }, 1800); };
      try { navigator.clipboard.writeText(ta.value).then(ok, function () { ta.select(); ok(); }); } catch (x) { ta.select(); ok(); }
    }
  });
  render();
})();
