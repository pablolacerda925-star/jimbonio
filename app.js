'use strict';

const CHAVE = 'jimbonio.eventos';
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MAX_CHIPS = 3;
const CAMPOS = 'id,titulo,data,hora,notas';
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const $ = (sel) => document.querySelector(sel);
const pad = (n) => String(n).padStart(2, '0');
const paraTexto = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const paraData = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
const hojeTexto = () => paraTexto(new Date());
const porDataHora = (a, b) => (a.data + (a.hora || '')).localeCompare(b.data + (b.hora || ''));

function novoId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto != null) e.textContent = texto;
  return e;
}

// ---------- Armazenamento: navegador ou nuvem (Supabase) ----------

const nuvem = { cliente: null, usuario: null };

function carregarLocal() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarLocal() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(eventos));
  } catch {
    alert('Não foi possível salvar no navegador. Exporte um backup para não perder os dados.');
  }
}

async function recarregarNuvem() {
  const { data, error } = await nuvem.cliente.from('eventos').select(CAMPOS);
  if (error) {
    statusConta(`Erro ao carregar: ${error.message}`);
    return;
  }
  eventos = data;
  statusConta('');
  render();
}

// Aplica a mudança na tela na hora e depois grava; se a nuvem falhar, recarrega de lá.
async function persistir(consulta) {
  render();
  if (!nuvem.usuario) {
    salvarLocal();
    return;
  }
  const { error } = await consulta();
  if (error) {
    alert(`Não foi possível sincronizar: ${error.message}`);
    await recarregarNuvem();
  }
}

function adicionar(ev) {
  eventos.push(ev);
  return persistir(() => nuvem.cliente.from('eventos').insert(ev));
}

function atualizar(id, dados) {
  eventos = eventos.map((ev) => (ev.id === id ? { ...ev, ...dados } : ev));
  return persistir(() => nuvem.cliente.from('eventos').update(dados).eq('id', id));
}

function remover(id) {
  eventos = eventos.filter((ev) => ev.id !== id);
  return persistir(() => nuvem.cliente.from('eventos').delete().eq('id', id));
}

function gravarVarios(lista) {
  const porId = new Map(eventos.map((ev) => [ev.id, ev]));
  lista.forEach((ev) => porId.set(ev.id, ev));
  eventos = [...porId.values()];
  return persistir(() => nuvem.cliente.from('eventos').upsert(lista));
}

// ---------- Conta ----------

function statusConta(texto) {
  $('#conta-status').textContent = texto;
}

function renderConta() {
  $('#cartao-conta').hidden = !nuvem.cliente;
  $('#conta-saida').hidden = !!nuvem.usuario;
  $('#conta-entrada').hidden = !nuvem.usuario;
  $('#conta-email').textContent = nuvem.usuario ? nuvem.usuario.email : '';
}

async function definirUsuario(usuario) {
  if ((usuario && usuario.id) === (nuvem.usuario && nuvem.usuario.id)) return;
  nuvem.usuario = usuario;
  renderConta();
  limparForm();

  if (!usuario) {
    eventos = carregarLocal();
    render();
    return;
  }

  statusConta('Carregando…');
  const locais = carregarLocal();
  if (locais.length && confirm(`Enviar ${locais.length} compromisso(s) deste aparelho para sua conta?`)) {
    const lista = locais.map(normalizar).filter(Boolean);
    const { error } = await nuvem.cliente.from('eventos').upsert(lista);
    if (error) {
      alert(`Não foi possível enviar: ${error.message}`);
    } else {
      try { localStorage.removeItem(CHAVE); } catch { /* sem acesso ao armazenamento */ }
    }
  }
  await recarregarNuvem();
}

function iniciarNuvem() {
  const cfg = window.JIMBONIO_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return;
  if (!window.supabase) {
    $('#cartao-conta').hidden = false;
    statusConta('Sem conexão com o servidor de sincronização. Usando dados deste navegador.');
    return;
  }
  nuvem.cliente = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  renderConta();
  nuvem.cliente.auth.onAuthStateChange((_evento, sessao) => {
    // Chamadas ao Supabase dentro deste callback podem travar; adia para depois.
    setTimeout(() => definirUsuario(sessao ? sessao.user : null), 0);
  });

  // Pega mudanças feitas em outro aparelho quando a aba volta ao foco.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && nuvem.usuario) recarregarNuvem();
  });
}

$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  statusConta('Enviando…');
  const { error } = await nuvem.cliente.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: location.origin + location.pathname },
  });
  statusConta(error
    ? `Erro: ${error.message}`
    : `Enviamos um link para ${email}. Abra-o neste aparelho para entrar.`);
});

$('#btn-sair').addEventListener('click', async () => {
  await nuvem.cliente.auth.signOut();
  statusConta('');
});

// ---------- Calendário e listas ----------

let eventos = carregarLocal();
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

// ---------- Formulário ----------

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
  if (estado.editandoId === id) limparForm();
  remover(id);
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

  const id = estado.editandoId;
  estado.selecionado = dados.data;
  limparForm();
  selecionar(dados.data);
  if (id) atualizar(id, dados);
  else adicionar({ id: novoId(), ...dados });
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

// ---------- Backup ----------

function normalizar(ev) {
  if (!ev || typeof ev.titulo !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(ev.data)) return null;
  return {
    id: RE_UUID.test(ev.id) ? ev.id : novoId(),
    titulo: ev.titulo,
    data: ev.data,
    hora: ev.hora || '',
    notas: ev.notas || '',
  };
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
  let validos;
  try {
    const dados = JSON.parse(await arquivo.text());
    validos = (Array.isArray(dados) ? dados : []).map(normalizar).filter(Boolean);
  } catch {
    validos = [];
  }
  if (!validos.length) {
    alert('Arquivo inválido. Use um backup exportado por esta agenda.');
    return;
  }
  if (!confirm(`Importar ${validos.length} compromisso(s)? Itens com o mesmo id serão substituídos.`)) return;
  gravarVarios(validos);
});

limparForm();
render();
iniciarNuvem();
