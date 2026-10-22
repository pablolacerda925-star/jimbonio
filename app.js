'use strict';

const CHAVE = 'jimbonio.eventos';
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MAX_CHIPS = 3;

const $ = (sel) => document.querySelector(sel);
const pad = (n) => String(n).padStart(2, '0');
const paraTexto = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const paraData = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
const hojeTexto = () => paraTexto(new Date());
const novoId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const porDataHora = (a, b) => (a.data + (a.hora || '')).localeCompare(b.data + (b.hora || ''));

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto != null) e.textContent = texto;
  return e;
}

function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(eventos));
  } catch {
    alert('Não foi possível salvar no navegador. Exporte um backup para não perder os dados.');
  }
}

let eventos = carregar();
const agora = new Date();
const estado = { ano: agora.getFullYear(), mes: agora.getMonth(), selecionado: hojeTexto(), editandoId: null };

const form = $('#form-evento');

function eventosDoDia(data) {
  return eventos.filter((e) => e.data === data).sort(porDataHora);
}

function selecionar(data) {
  estado.selecionado = data;
  const d = paraData(data);
  estado.ano = d.getFullYear();
  estado.mes = d.getMonth();
  if (!estado.editandoId) form.data.value = data;
  render();
}

function renderCalendario() {
  $('#titulo-mes').textContent = `${MESES[estado.mes]} ${estado.ano}`;
  const grade = $('#grade');
  grade.replaceChildren();

  const primeiro = new Date(estado.ano, estado.mes, 1);
  const hoje = hojeTexto();

  for (let i = 0; i < 42; i++) {
    const d = new Date(estado.ano, estado.mes, 1 - primeiro.getDay() + i);
    const data = paraTexto(d);
    const doDia = eventosDoDia(data);

    const botao = el('button', 'dia');
    botao.type = 'button';
    if (d.getMonth() !== estado.mes) botao.classList.add('fora');
    if (data === hoje) botao.classList.add('hoje');
    if (data === estado.selecionado) botao.classList.add('selecionado');
    botao.setAttribute('aria-label',
      d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) +
      (doDia.length ? `, ${doDia.length} compromisso(s)` : ''));

    botao.append(el('span', 'num', d.getDate()));
    const chips = el('ul', 'chips');
    doDia.slice(0, MAX_CHIPS).forEach((ev) => {
      chips.append(el('li', 'chip', (ev.hora ? ev.hora + ' ' : '') + ev.titulo));
    });
    if (doDia.length > MAX_CHIPS) chips.append(el('li', 'mais', `+${doDia.length - MAX_CHIPS}`));
    botao.append(chips);

    botao.addEventListener('click', () => selecionar(data));
    grade.append(botao);
  }
}

function itemEvento(ev, { comData = false, comAcoes = true } = {}) {
  const li = el('li', 'evento');
  let hora = ev.hora || 'Dia todo';
  if (comData) {
    const dataCurta = paraData(ev.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    hora = `${dataCurta} ${ev.hora || ''}`.trim();
  }
  li.append(el('span', 'hora', hora), el('span', 'titulo', ev.titulo));

  if (comAcoes) {
    const botoes = el('span', 'botoes');
    const editar = el('button', 'editar', 'Editar');
    editar.type = 'button';
    editar.addEventListener('click', () => iniciarEdicao(ev.id));
    const excluir = el('button', 'excluir', 'Excluir');
    excluir.type = 'button';
    excluir.addEventListener('click', () => excluirEvento(ev.id));
    botoes.append(editar, excluir);
    li.append(botoes);
  } else {
    li.append(el('span'));
  }

  if (ev.notas) li.append(el('span', 'notas', ev.notas));
  return li;
}

function renderDia() {
  const d = paraData(estado.selecionado);
  $('#titulo-dia').textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const lista = $('#lista-dia');
  const doDia = eventosDoDia(estado.selecionado);
  lista.replaceChildren(...(doDia.length
    ? doDia.map((ev) => itemEvento(ev))
    : [el('li', 'vazio', 'Nada marcado para este dia.')]));
}

function renderProximos() {
  const hoje = hojeTexto();
  const proximos = eventos.filter((e) => e.data >= hoje).sort(porDataHora).slice(0, 5);
  const lista = $('#lista-proximos');
  lista.replaceChildren(...(proximos.length
    ? proximos.map((ev) => {
      const li = itemEvento(ev, { comData: true, comAcoes: false });
      li.classList.add('clicavel');
      li.addEventListener('click', () => selecionar(ev.data));
      return li;
    })
    : [el('li', 'vazio', 'Nenhum compromisso futuro.')]));
}

function render() {
  renderCalendario();
  renderDia();
  renderProximos();
}

function limparForm() {
  estado.editandoId = null;
  form.reset();
  form.data.value = estado.selecionado;
  $('#titulo-form').textContent = 'Novo compromisso';
  $('#btn-salvar').textContent = 'Adicionar';
  $('#btn-cancelar').hidden = true;
}

function iniciarEdicao(id) {
  const ev = eventos.find((e) => e.id === id);
  if (!ev) return;
  estado.editandoId = id;
  form.titulo.value = ev.titulo;
  form.data.value = ev.data;
  form.hora.value = ev.hora || '';
  form.notas.value = ev.notas || '';
  $('#titulo-form').textContent = 'Editar compromisso';
  $('#btn-salvar').textContent = 'Salvar';
  $('#btn-cancelar').hidden = false;
  form.titulo.focus();
}

function excluirEvento(id) {
  const ev = eventos.find((e) => e.id === id);
  if (!ev || !confirm(`Excluir "${ev.titulo}"?`)) return;
  eventos = eventos.filter((e) => e.id !== id);
  salvar();
  if (estado.editandoId === id) limparForm();
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dados = {
    titulo: form.titulo.value.trim(),
    data: form.data.value,
    hora: form.hora.value,
    notas: form.notas.value.trim(),
  };
  if (!dados.titulo || !dados.data) return;

  if (estado.editandoId) {
    eventos = eventos.map((ev) => (ev.id === estado.editandoId ? { ...ev, ...dados } : ev));
  } else {
    eventos.push({ id: novoId(), ...dados });
  }
  salvar();
  estado.selecionado = dados.data;
  limparForm();
  selecionar(dados.data);
});

$('#btn-cancelar').addEventListener('click', limparForm);

$('#mes-anterior').addEventListener('click', () => mudarMes(-1));
$('#mes-seguinte').addEventListener('click', () => mudarMes(1));
$('#ir-hoje').addEventListener('click', () => selecionar(hojeTexto()));

function mudarMes(delta) {
  const d = new Date(estado.ano, estado.mes + delta, 1);
  estado.ano = d.getFullYear();
  estado.mes = d.getMonth();
  renderCalendario();
}

$('#btn-exportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(eventos, null, 2)], { type: 'application/json' });
  const link = el('a');
  link.href = URL.createObjectURL(blob);
  link.download = `agenda-${hojeTexto()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

$('#input-importar').addEventListener('change', async (e) => {
  const arquivo = e.target.files[0];
  e.target.value = '';
  if (!arquivo) return;
  try {
    const dados = JSON.parse(await arquivo.text());
    const validos = (Array.isArray(dados) ? dados : []).filter((ev) =>
      ev && typeof ev.titulo === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ev.data));
    if (!validos.length) throw new Error('vazio');
    if (!confirm(`Importar ${validos.length} compromisso(s)? Itens com o mesmo id serão substituídos.`)) return;
    const porId = new Map(eventos.map((ev) => [ev.id, ev]));
    validos.forEach((ev) => {
      const id = ev.id || novoId();
      porId.set(id, { id, titulo: ev.titulo, data: ev.data, hora: ev.hora || '', notas: ev.notas || '' });
    });
    eventos = [...porId.values()];
    salvar();
    render();
  } catch {
    alert('Arquivo inválido. Use um backup exportado por esta agenda.');
  }
});

limparForm();
render();
