// INTERFACE — escolher a doença e ver a prescrição e os exames. Nenhum texto clínico aqui: vem de DOENCAS e EXTRAS.
(function () {
  var app = document.getElementById("app");
  var LISTA = DOENCAS.concat(EXTRAS.doencas).sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt"); });
  var ORDEM = ["Cardiovascular", "Trombose e doença vascular", "Neurológico", "Respiratório", "Gastrointestinal", "Endócrino e metabólico", "Hidroeletrolítico", "Infecções", "Infecções de pele", "Geniturinário", "Reprodutor", "Hematológico", "Osteomuscular", "Psiquiatria", "Anafilaxia e alergias", "Intoxicações", "Causas externas", "Hemocomponentes", "Consulta rápida"];
  var FONTES = { PSZ2: "PS Zerado, 2ª edição", PSZ1: "PS Zerado, edição anterior", AHA: "Diretriz AHA 2025", CNP: "Cardiologia na Prática 3.0", MED: "Guia de Prescrições Medway" };
  function noGrupo(d, sis) { return d.sistema === sis || ((EXTRAS.grupos || {})[sis] || []).indexOf(d.id) >= 0; }
  var S = { q: "", aba: "presc" };
  var EXAME = /\b(exames?|solicitar|dosar|dosagem|hemograma|gasometria|lactato|hemoculturas?|culturas?|urocultura|ECG|eletrocardiograma|radiografia|tomografia|ultrassom|ultrassonografia|POCUS|ecocardiograma|troponina|D-d[ií]mero|creatinina|eletr[óo]litos|glicemia|cetonemia|coagulograma|INR|bilirrubinas?|amilase|lipase|PCR|VHS|sorologia|NS1|VDRL|hemoglobina|plaquetas|QTc|TTPa|clearance)\b/i;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
  function plano(s) { return String(s).replace(/\*\*/g, ""); }
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function acha(id) { return LISTA.filter(function (d) { return d.id === id; })[0]; }
  function eBizu(t) { return /^#?biz/i.test(t); }
  function fonteTxt(d) { if (!d.fonte) return "Sem fonte nos documentos enviados"; return (FONTES[d.fonte] || d.fonte) + (d.paginas ? ", p. " + (d.paginas[0] === d.paginas[1] ? d.paginas[0] : d.paginas[0] + " a " + d.paginas[1]) : ""); }

  // ---------- lista ----------
  function casa(d, n) {
    if (!n) return true;
    var alvo = norm(d.nome + " " + d.sistema + " " + (EXTRAS.busca[d.id] || ""));
    if (n.split(/\s+/).every(function (w) { return alvo.indexOf(w) >= 0; })) return true;
    return d.itens.some(function (x) { return x.tipo === "med" && norm(x.t).indexOf(n) >= 0; });
  }
  function porMedicamento(d, n) { return n && norm(d.nome + " " + (EXTRAS.busca[d.id] || "")).indexOf(n) < 0; }
  function lista() {
    var n = norm(S.q).trim(), h = "", total = 0;
    ORDEM.forEach(function (sis) {
      var ds = LISTA.filter(function (d) { return noGrupo(d, sis) && casa(d, n); }); total += ds.length;
      if (!ds.length) return;
      h += '<section class="grupo"><h2>' + esc(sis) + ' <span>' + ds.length + "</span></h2><div class=\"doencas\">" + ds.map(function (d) {
        return '<a class="dz" href="#' + d.id + '">' + esc(d.nome) + (porMedicamento(d, n) ? "<small>tem " + esc(S.q) + " na prescrição</small>" : "") + "</a>"; }).join("") + "</div></section>";
    });
    return (h || '<p class="vazio">Nenhuma doença encontrada para "' + esc(S.q) + '". Tente outra palavra ou o nome de um medicamento.</p>') + '<p class="rodape">' + LISTA.length + " doenças · prescrições transcritas do texto dos PDFs, com a página de origem · apoio à decisão, não substitui o julgamento médico</p>";
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
  function prescricao(d) {
    var h = "", aberto = null, dica = null;
    function fecha() { if (aberto) { h += "</ul></div>"; aberto = null; } if (dica) { h += "</ul></details>"; dica = null; } }
    d.itens.forEach(function (x) {
      if (x.tipo === "med") { fecha(); h += '<div class="med"><h3>' + fmt(x.t) + "</h3>" + notasDe(d, plano(x.t)).map(nota).join("") + "<ul>"; aberto = 1; return; }
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
  function render() {
    var id = decodeURIComponent(location.hash.slice(1)), d = id && acha(id);
    if (d) { app.innerHTML = '<div class="pagina">' + doenca(d) + "</div>"; return; }
    app.innerHTML = '<header class="topo"><div class="marca"><b>Guia de PS</b><span>Prescrição e exames por doença</span></div><input id="q" type="search" autocomplete="off" placeholder="Buscar doença, sigla ou medicamento (ex.: TEP, ITU, adenosina)" value="' + esc(S.q) + '"></header><main id="lista" class="pagina">' + lista() + "</main>";
  }

  // ---------- eventos ----------
  window.addEventListener("hashchange", function () { S.aba = "presc"; render(); window.scrollTo(0, 0); });
  app.addEventListener("input", function (e) { if (e.target.id === "q") { S.q = e.target.value; document.getElementById("lista").innerHTML = lista(); } });
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
