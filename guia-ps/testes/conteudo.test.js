// Testes do conteúdo: rodar com  node testes/conteudo.test.js
var D = require("../src/doencas.js"), X = require("../src/extras.js"), ok = 0, fail = 0;
function eq(nome, got, exp) { var p = JSON.stringify(got) === JSON.stringify(exp); (p ? ok++ : fail++); console.log((p ? "OK   " : "FALHA") + " " + nome + (p ? "" : "  obtido=" + JSON.stringify(got).slice(0, 300) + " esperado=" + JSON.stringify(exp))); }
var T = D.concat(X.doencas), ids = T.map(function (d) { return d.id; });
eq("114 doenças geradas dos PDFs + 12 escritas à mão", [D.length, X.doencas.length], [114, 12]);
eq("ids únicos", ids.length, new Set(ids).size);
eq("ids só com letras, números e hífen", ids.filter(function (i) { return !/^[a-z0-9-]+$/.test(i); }), []);
eq("toda doença tem itens", T.filter(function (d) { return d.itens.length < 1 && !d.semFonte; }).map(function (d) { return d.id; }), []);
eq("toda doença tem pelo menos um medicamento ou é de consulta", T.filter(function (d) { return !d.semFonte && !d.itens.some(function (x) { return x.tipo === "med"; }) && !/hemoc|crio|plasma|concentrado|descontamina|hipoglicemia|hiponatremia|gestantes|cetoacidose-diabetica-na-pediatria/.test(d.id); }).map(function (d) { return d.id; }), []);
var tudo = JSON.stringify(T);
eq("sem nome ou CPF de quem licenciou o PDF", /licenciad|Douglas|Natacha|\d{3}\.\d{3}\.\d{3}-\d{2}/i.test(tudo), false);
eq("sem propaganda do curso", /ASSISTIR A AULA|Aprenda a prescrever/i.test(tudo), false);
eq("sem marcação de negrito quebrada", T.filter(function (d) { return d.itens.some(function (x) { return (x.t.match(/\*\*/g) || []).length % 2; }); }).map(function (d) { return d.id; }), []);
eq("toda doença tem fonte e páginas", T.filter(function (d) { return d.semFonte ? !!d.fonte : !d.fonte || (d.fonte !== "AHA" && !(d.paginas && d.paginas[0] <= d.paginas[1])); }).map(function (d) { return d.id; }), []);
eq("exames com fonte apontam para doença existente", Object.keys(X.exames).filter(function (k) { return ids.indexOf(k) < 0 || !X.exames[k].ref; }), []);
eq("siglas apontam para doença existente", Object.keys(X.busca).filter(function (k) { return ids.indexOf(k) < 0; }), []);
eq("cada nota casa com um medicamento da doença", X.notas.filter(function (n) { var d = T.filter(function (x) { return x.id === n.doenca; })[0]; return !d || !n.ref || !d.itens.some(function (x) { return x.tipo === "med" && n.med.test(x.t.replace(/\*\*/g, "")); }); }).map(function (n) { return n.doenca + " " + n.med; }), []);
// amostras conferidas no PDF (texto nativo do PS Zerado 2ª edição)
function tem(id, re) { var d = T.filter(function (x) { return x.id === id; })[0]; return d.itens.some(function (x) { return re.test(x.t); }); }
eq("IC: nitroglicerina 1 ampola em 240 mL de SF 0,9% (PSZ2 p. 20)", tem("insuficiencia-cardiaca-descompensada-e-edema-agudo-de-pulmao", /Diluir 1 ampola \(10 mL\) em 240 mL SF 0,9%/), true);
eq("IC: bolus SCAPE PAS 180 a 199 = 4 mL (PSZ2 p. 20)", tem("insuficiencia-cardiaca-descompensada-e-edema-agudo-de-pulmao", /PAS 180 a 199 mmHg: 4 mL em bolus/), true);
eq("Sepse: 30 mL/kg em alíquotas de 500 mL (PSZ2 p. 154)", tem("sepse-e-choque-septico", /30 mL\/kg IV em alíquotas de 500 mL/), true);
eq("TSV: adenosina 6 mg com flush de 20 mL (PSZ2 p. 8)", tem("taquicardia-supraventricular", /flush de 20 mL de SF 0,9%/), true);
eq("Crise convulsiva: fenitoína como impressa no PSZ1 p. 21", tem("crise-convulsiva", /Fazer 5-10 mg\/kg/), true);
eq("tétano: tabela da vacina com 3 linhas e 5 colunas (PSZ2 p. 150)", (function () { var t = T.filter(function (x) { return x.id === "tetano"; })[0].itens.filter(function (x) { return x.tipo === "tab"; })[0].tab; return [t.length, t[0].length, t[2][4]]; })(), [3, 5, "Vacina dT - 3 doses + administrar SAT/ IGHAT."]);
eq("DPOC: tabela de antibióticos lida coluna por coluna (PSZ2 p. 45)", tem("dpoc-exacerbada", /^Levofloxacino 750 mg$/) && tem("dpoc-exacerbada", /^Tomar 1 comprimido VO 1 vez ao dia, por 5 a 7 dias\.$/), true);
eq("seções que juntam doenças apontam para doenças existentes", Object.keys(X.grupos).reduce(function (a, g) { return a.concat(X.grupos[g].filter(function (i) { return ids.indexOf(i) < 0; })); }, []), []);
eq("TEP (CNP): rivaroxabana 15 mg 12/12 h por 3 semanas, depois 20 mg (imagem p. 118)", tem("tep-cardiologia-na-pratica", /15 mg VO de 12\/12 h por 3 semanas; depois 20 mg/), true);
eq("TVP (CNP): HNF ataque 60 a 80 UI/kg, manutenção 12 a 18 UI/kg/h (imagem p. 132)", tem("tvp-cardiologia-na-pratica", /Ataque 60 a 80 UI\/kg EV; manutenção inicial 12 a 18 UI\/kg\/h/), true);
eq("Anticoagulantes (MED): HNF 25.000 UI + 245 mL = 100 U/mL (p. 33)", tem("anticoagulantes-antiagregantes-e-fibrinoliticos", /25\.000 UI \(5mL\) \+ 245 mL SF0\.9% = 100U\/mL/), true);
eq("crise epiléptica (CNP): fenitoína 15 a 20 mg/kg a 50 mg/min (imagem p. 169)", tem("crise-epileptica", /15 a 20 mg\/kg em SF 0,9% 250 mL, a 50 mg\/min/), true);
eq("HSA (CNP): nimodipino 60 mg de 4/4 h por 21 dias (imagem p. 163)", tem("hemorragia-subaracnoidea", /60 mg VO ou SNE de 4\/4 h, do 1º dia até 21 dias/), true);
eq("choque cardiogênico (CNP): vasopressina 2 ampolas em 98 mL, 2 a 6 mL/h (imagem p. 64)", tem("choque-cardiogenico", /SF 0,9% 98 mL \+ 2 ampolas \(2 mL\) em bomba de infusão. Iniciar com 2 mL\/h; máximo 6 mL\/h/), true);
// busca por medicamento: só nomes, cada nome acha ao menos uma doença, sem confundir parecidos
function nm(s) { return String(s).replace(/\*\*/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
var MEDS = []; T.forEach(function (d) { d.itens.forEach(function (x) { if (x.tipo === "med") MEDS.push(nm(x.t)); }); });
function usa(nome) { var f = X.farmacos.filter(function (f) { return f[0] === nome; })[0], re = new RegExp(f[1]); return MEDS.filter(function (t) { return re.test(t); }); }
eq("nomes de medicamento únicos", X.farmacos.length, new Set(X.farmacos.map(function (f) { return f[0]; })).size);
eq("todo nome de medicamento aparece em alguma prescrição", X.farmacos.filter(function (f) { return !usa(f[0]).length; }).map(function (f) { return f[0]; }), []);
eq("lista de nomes não traz dose", X.farmacos.filter(function (f) { return /\d\s*(mg|mcg|ui|ml|g)\b/i.test(f[0]); }).map(function (f) { return f[0]; }), []);
eq("adrenalina não pega noradrenalina; loratadina não pega desloratadina; aciclovir não pega valaciclovir", [usa("Adrenalina").some(function (t) { return /noradrenalina/.test(t); }), usa("Loratadina").some(function (t) { return /desloratadina/.test(t); }), usa("Aciclovir").some(function (t) { return /valaciclovir/.test(t); })], [false, false, false]);
eq("amoxicilina sozinha separada de amoxicilina + clavulanato", usa("Amoxicilina").some(function (t) { return /clavulanato/.test(t); }), false);
eq("enoxaparina inclui o cabeçalho 'heparina de baixo peso molecular'; HNF não", [usa("Enoxaparina").some(function (t) { return /baixo peso/.test(t); }), usa("Heparina não fracionada").some(function (t) { return /baixo peso/.test(t); })], [true, false]);
console.log("\n" + ok + " passaram, " + fail + " falharam");
