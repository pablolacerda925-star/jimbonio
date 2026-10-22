'use strict';

// ---------- Configuração ----------

const T = 32;               // tamanho de cada bloco em pixels
const LINHAS = 14;
const COLUNAS = 170;
const LARGURA = 800;
const ALTURA = LINHAS * T;
const PASSO = 1000 / 60;    // física a 60 quadros por segundo

const GRAVIDADE = 0.6;
const PULO = -12;
const ACELERACAO = 0.5;
const VEL_MAX = 4;
const QUEDA_MAX = 12;
const SOLIDOS = '#BT?X';    // chão, tijolo, cano, bloco-surpresa, bloco usado
const CHAVE_RECORDE = 'jimbonio.recorde';

const canvas = document.getElementById('tela');
const ctx = canvas.getContext('2d');
canvas.width = LARGURA;
canvas.height = ALTURA;

// ---------- Fase ----------

const COLUNA_BANDEIRA = 162;
const INIMIGOS_INICIO = [22, 33, 42, 60, 68, 70, 80, 95, 104, 128, 134, 140, 145];

function criarFase() {
  const g = Array.from({ length: LINHAS }, () => Array(COLUNAS).fill(' '));
  const por = (x, y, s) => [...s].forEach((c, i) => { if (c !== '.') g[y][x + i] = c; });
  const chao = (de, ate) => { for (let x = de; x <= ate; x++) g[12][x] = g[13][x] = '#'; };
  const cano = (x, h) => { for (let y = 12 - h; y < 12; y++) g[y][x] = g[y][x + 1] = 'T'; };
  const escada = (x, h, descendo = false) => {
    for (let i = 0; i < h; i++) {
      const alt = descendo ? h - i : i + 1;
      for (let y = 12 - alt; y < 12; y++) g[y][x + i] = '#';
    }
  };

  chao(0, 45); chao(49, 85); chao(89, 120); chao(124, COLUNAS - 1);

  por(14, 8, '?');
  por(18, 8, 'B?B?B');
  por(20, 4, '?');
  por(24, 11, 'ooo');
  cano(28, 2);
  por(32, 9, 'ooo');
  cano(38, 3);
  por(46, 8, 'ooo');
  por(52, 8, 'BBB');
  por(56, 5, 'BBBBBB');
  por(57, 4, 'oooo');
  por(64, 8, '?..?..?');
  cano(74, 2);
  por(86, 8, 'ooo');
  por(92, 9, 'oooo');
  por(100, 8, 'B?B');
  escada(108, 4);
  escada(113, 4, true);
  por(121, 7, 'ooo');
  por(126, 8, '????');
  por(132, 4, 'BBBB');
  por(133, 3, 'oo');
  escada(150, 8);
  g[11][COLUNA_BANDEIRA] = 'F';
  return g;
}

// ---------- Estado ----------

let fase, jogador, inimigos, efeitos, camera, tempo;
let estado = 'inicio';      // inicio | jogando | morrendo | vitoria | fim
let pontos = 0, moedas = 0, vidas = 3, timerEstado = 0;
let recorde = lerRecorde();

function lerRecorde() {
  try { return Number(localStorage.getItem(CHAVE_RECORDE)) || 0; } catch { return 0; }
}

function salvarRecorde() {
  if (pontos <= recorde) return;
  recorde = pontos;
  try { localStorage.setItem(CHAVE_RECORDE, String(recorde)); } catch { /* sem armazenamento */ }
}

function iniciarFase() {
  fase = criarFase();
  jogador = { x: 3 * T, y: 12 * T - 28, w: 22, h: 28, vx: 0, vy: 0, noChao: false, dir: 1, puloSegurado: true, bufferPulo: 0, noAr: 0 };
  inimigos = INIMIGOS_INICIO.map((c) => ({ x: c * T + 2, y: 11 * T + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1, ativo: false, esmagado: 0 }));
  efeitos = [];
  camera = 0;
  tempo = 0;
}

function novoJogo() {
  pontos = 0; moedas = 0; vidas = 3;
  iniciarFase();
  estado = 'jogando';
}

// ---------- Controles ----------

const teclas = { esq: false, dir: false, pulo: false };
const MAPA_TECLAS = {
  ArrowLeft: 'esq', KeyA: 'esq',
  ArrowRight: 'dir', KeyD: 'dir',
  ArrowUp: 'pulo', KeyW: 'pulo', Space: 'pulo',
};

function iniciarSePreciso() {
  if (estado === 'inicio' || estado === 'fim' || estado === 'vitoria') novoJogo();
}

addEventListener('keydown', (e) => {
  const t = MAPA_TECLAS[e.code];
  if (t) { teclas[t] = true; e.preventDefault(); }
  if (e.code === 'Enter' || t === 'pulo') iniciarSePreciso();
});
addEventListener('keyup', (e) => {
  const t = MAPA_TECLAS[e.code];
  if (t) teclas[t] = false;
});
addEventListener('blur', () => { teclas.esq = teclas.dir = teclas.pulo = false; });

document.querySelectorAll('[data-tecla]').forEach((botao) => {
  const t = botao.dataset.tecla;
  const soltar = () => { teclas[t] = false; };
  botao.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    botao.setPointerCapture(e.pointerId);
    teclas[t] = true;
    if (t === 'pulo') iniciarSePreciso();
  });
  botao.addEventListener('pointerup', soltar);
  botao.addEventListener('pointercancel', soltar);
});
canvas.addEventListener('pointerdown', iniciarSePreciso);

// ---------- Colisão com os blocos ----------

function bloco(cx, cy) {
  if (cx < 0 || cx >= COLUNAS) return '#';
  if (cy < 0 || cy >= LINHAS) return ' ';
  return fase[cy][cx];
}

const solido = (cx, cy) => SOLIDOS.includes(bloco(cx, cy));

function moverX(o) {
  o.x += o.vx;
  o.bateuX = false;
  const topo = Math.floor(o.y / T);
  const base = Math.floor((o.y + o.h - 1) / T);
  const cx = o.vx > 0 ? Math.floor((o.x + o.w - 1) / T) : Math.floor(o.x / T);
  if (o.vx === 0) return;
  for (let cy = topo; cy <= base; cy++) {
    if (!solido(cx, cy)) continue;
    o.x = o.vx > 0 ? cx * T - o.w : (cx + 1) * T;
    o.vx = 0;
    o.bateuX = true;
    return;
  }
}

function moverY(o, aoBaterCabeca) {
  o.y += o.vy;
  o.noChao = false;
  const esq = Math.floor(o.x / T);
  const dir = Math.floor((o.x + o.w - 1) / T);
  const centro = Math.floor((o.x + o.w / 2) / T);
  const colunas = [centro, esq, dir];

  if (o.vy > 0) {
    // Sem o "- 1": quem está apoiado continua tocando o chão mesmo com queda de frações de pixel
    const cy = Math.floor((o.y + o.h) / T);
    if (colunas.some((cx) => solido(cx, cy))) {
      o.y = cy * T - o.h;
      o.vy = 0;
      o.noChao = true;
    }
  } else if (o.vy < 0) {
    const cy = Math.floor(o.y / T);
    const cx = colunas.find((c) => solido(c, cy));
    if (cx !== undefined) {
      o.y = (cy + 1) * T;
      o.vy = 0;
      if (aoBaterCabeca) aoBaterCabeca(cx, cy);
    }
  }
}

function bateuCabeca(cx, cy) {
  efeitos.push({ tipo: 'bloco', cx, cy, t: 0 });
  if (fase[cy][cx] !== '?') return;
  fase[cy][cx] = 'X';
  ganharMoeda();
  efeitos.push({ tipo: 'moeda', x: cx * T + T / 2, y: cy * T, t: 0 });
}

function ganharMoeda() {
  moedas++;
  pontos += 100;
  if (moedas % 50 === 0) vidas++;
}

const sobrepoe = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// ---------- Atualização ----------

function atualizar() {
  tempo++;
  efeitos = efeitos.filter((ef) => ++ef.t < 30);

  if (estado === 'morrendo') {
    jogador.vy += GRAVIDADE;
    jogador.y += jogador.vy;
    if (++timerEstado > 100) {
      vidas--;
      if (vidas > 0) {
        iniciarFase();
        estado = 'jogando';
      } else {
        salvarRecorde();
        estado = 'fim';
      }
    }
    return;
  }
  if (estado !== 'jogando') return;

  atualizarJogador();
  atualizarInimigos();
  camera = Math.max(0, Math.min(jogador.x + jogador.w / 2 - LARGURA / 2, COLUNAS * T - LARGURA));
}

function atualizarJogador() {
  const p = jogador;

  if (teclas.esq) { p.vx -= ACELERACAO; p.dir = -1; }
  if (teclas.dir) { p.vx += ACELERACAO; p.dir = 1; }
  if (!teclas.esq && !teclas.dir) {
    p.vx *= p.noChao ? 0.75 : 0.95;
    if (Math.abs(p.vx) < 0.1) p.vx = 0;
  }
  p.vx = Math.max(-VEL_MAX, Math.min(VEL_MAX, p.vx));

  // Aceita o pulo apertado um pouco antes de tocar o chão ou logo depois de sair da beirada
  if (teclas.pulo && !p.puloSegurado) p.bufferPulo = 6;
  if (p.bufferPulo > 0 && p.noAr < 6) {
    p.vy = PULO;
    p.bufferPulo = 0;
    p.noAr = 99;
  }
  if (p.bufferPulo > 0) p.bufferPulo--;
  p.puloSegurado = teclas.pulo;
  if (!teclas.pulo && p.vy < -4) p.vy = -4;   // soltar o botão corta o pulo
  p.vy = Math.min(p.vy + GRAVIDADE, QUEDA_MAX);

  moverX(p);
  moverY(p, bateuCabeca);
  p.noAr = p.noChao ? 0 : p.noAr + 1;

  // Moedas soltas na fase
  for (let cy = Math.floor(p.y / T); cy <= Math.floor((p.y + p.h - 1) / T); cy++) {
    for (let cx = Math.floor(p.x / T); cx <= Math.floor((p.x + p.w - 1) / T); cx++) {
      if (bloco(cx, cy) === 'o') {
        fase[cy][cx] = ' ';
        ganharMoeda();
      }
    }
  }

  if (p.y > ALTURA) morrer();
  if (p.x + p.w > COLUNA_BANDEIRA * T + T / 2) vencer();
}

function atualizarInimigos() {
  for (const e of inimigos) {
    if (e.esmagado) { e.esmagado++; continue; }
    if (!e.ativo) {
      if (e.x < camera + LARGURA + T) e.ativo = true;
      else continue;
    }

    e.vx = e.dir;
    moverX(e);
    if (e.bateuX) e.dir *= -1;
    e.vy = Math.min(e.vy + GRAVIDADE, QUEDA_MAX);
    moverY(e);
    if (e.y > ALTURA) { e.esmagado = 999; continue; }

    if (estado === 'jogando' && sobrepoe(jogador, e)) {
      const pisou = jogador.vy > 0 && jogador.y + jogador.h - e.y < 16;
      if (pisou) {
        e.esmagado = 1;
        jogador.vy = -8;
        pontos += 200;
        efeitos.push({ tipo: 'texto', x: e.x + e.w / 2, y: e.y, texto: '200', t: 0 });
      } else {
        morrer();
      }
    }
  }
  inimigos = inimigos.filter((e) => e.esmagado < 30);
}

function morrer() {
  estado = 'morrendo';
  timerEstado = 0;
  jogador.vy = -10;
}

function vencer() {
  estado = 'vitoria';
  pontos += 1000 + vidas * 500;
  salvarRecorde();
}

// ---------- Desenho ----------

function desenhar() {
  const ceu = ctx.createLinearGradient(0, 0, 0, ALTURA);
  ceu.addColorStop(0, '#5fb8f5');
  ceu.addColorStop(1, '#c6ecff');
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  desenharFundo();

  ctx.save();
  ctx.translate(-Math.round(camera), 0);
  desenharBlocos();
  desenharBandeira();
  inimigos.forEach(desenharInimigo);
  desenharJogador();
  desenharEfeitos();
  ctx.restore();

  desenharPlacar();
  desenharMensagem();
}

function desenharFundo() {
  // Morros e nuvens andam mais devagar que a fase (efeito de profundidade)
  ctx.fillStyle = '#7fd08a';
  for (let i = -1; i < 6; i++) {
    const x = i * 360 - (camera * 0.4) % 360;
    ctx.beginPath();
    ctx.ellipse(x + 120, 12 * T, 160, 90, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = -1; i < 5; i++) {
    const x = i * 280 - (camera * 0.2) % 280;
    const y = 50 + (i % 2) * 40;
    ctx.beginPath();
    ctx.arc(x + 40, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 70, y - 10, 28, 0, Math.PI * 2);
    ctx.arc(x + 100, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }
}

function deslocamentoBloco(cx, cy) {
  const ef = efeitos.find((e) => e.tipo === 'bloco' && e.cx === cx && e.cy === cy && e.t < 10);
  return ef ? -Math.sin((ef.t / 10) * Math.PI) * 8 : 0;
}

function desenharBlocos() {
  const de = Math.floor(camera / T);
  const ate = Math.min(COLUNAS - 1, de + Math.ceil(LARGURA / T) + 1);
  for (let cy = 0; cy < LINHAS; cy++) {
    for (let cx = de; cx <= ate; cx++) {
      const c = fase[cy][cx];
      const x = cx * T;
      const y = cy * T + deslocamentoBloco(cx, cy);
      if (c === '#') desenharChao(x, y, bloco(cx, cy - 1) !== '#');
      else if (c === 'B') desenharTijolo(x, y);
      else if (c === '?' || c === 'X') desenharSurpresa(x, y, c === 'X');
      else if (c === 'T') desenharCano(x, y, bloco(cx, cy - 1) !== 'T', bloco(cx - 1, cy) !== 'T');
      else if (c === 'o') desenharMoeda(x + T / 2, y + T / 2);
    }
  }
}

function desenharChao(x, y, comGrama) {
  ctx.fillStyle = '#c27c3e';
  ctx.fillRect(x, y, T, T);
  ctx.fillStyle = '#a5652e';
  ctx.fillRect(x + 4, y + 14, 6, 4);
  ctx.fillRect(x + 20, y + 24, 6, 4);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.strokeRect(x + 0.5, y + 0.5, T - 1, T - 1);
  if (comGrama) {
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(x, y, T, 7);
  }
}

function desenharTijolo(x, y) {
  ctx.fillStyle = '#b84a2e';
  ctx.fillRect(x, y, T, T);
  ctx.fillStyle = '#7a2e1b';
  ctx.fillRect(x, y + 15, T, 2);
  ctx.fillRect(x, y + T - 2, T, 2);
  ctx.fillRect(x + 15, y, 2, 15);
  ctx.fillRect(x + 7, y + 17, 2, 13);
  ctx.fillRect(x + 23, y + 17, 2, 13);
}

function desenharSurpresa(x, y, usado) {
  ctx.fillStyle = usado ? '#9a7b4f' : '#f5b81c';
  ctx.fillRect(x, y, T, T);
  ctx.strokeStyle = usado ? '#6b5434' : '#b07a0a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, T - 2, T - 2);
  ctx.lineWidth = 1;
  if (!usado) {
    ctx.fillStyle = '#fff6d5';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + T / 2, y + T / 2 + 1 + Math.sin(tempo / 8));
  }
}

function desenharCano(x, y, topo, ladoEsquerdo) {
  ctx.fillStyle = '#2e9d48';
  ctx.fillRect(x, y, T, T);
  ctx.fillStyle = '#5cc472';
  if (ladoEsquerdo) ctx.fillRect(x + 6, y, 6, T);
  if (topo) {
    ctx.fillStyle = '#1f7a35';
    ctx.fillRect(x - (ladoEsquerdo ? 3 : 0), y, T + 3, 10);
  }
}

function desenharMoeda(x, y) {
  const largura = Math.abs(Math.cos(tempo / 12)) * 9 + 2;
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.ellipse(x, y, largura, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c98f00';
  ctx.stroke();
}

function desenharBandeira() {
  const x = COLUNA_BANDEIRA * T + T / 2;
  ctx.fillStyle = '#d9d9d9';
  ctx.fillRect(x - 2, 2 * T, 4, 10 * T);
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(x, 2 * T, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.moveTo(x - 2, 2 * T + 10);
  ctx.lineTo(x - 40, 2 * T + 24);
  ctx.lineTo(x - 2, 2 * T + 38);
  ctx.fill();
}

function desenharInimigo(e) {
  if (e.esmagado === 999) return;
  const x = e.x, y = e.y;
  if (e.esmagado) {
    ctx.fillStyle = '#8d5a2b';
    ctx.fillRect(x, y + e.h - 8, e.w, 8);
    return;
  }
  const passo = Math.floor(tempo / 10) % 2;
  ctx.fillStyle = '#5b3a1a';
  ctx.fillRect(x + 2 + passo * 4, y + e.h - 6, 10, 6);
  ctx.fillRect(x + e.w - 12 - passo * 4, y + e.h - 6, 10, 6);
  ctx.fillStyle = '#8d5a2b';
  ctx.beginPath();
  ctx.ellipse(x + e.w / 2, y + 12, e.w / 2, 13, 0, Math.PI, 0);
  ctx.fillRect(x, y + 12, e.w, 10);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 6, y + 8, 6, 8);
  ctx.fillRect(x + 16, y + 8, 6, 8);
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 8 + (e.dir > 0 ? 2 : 0), y + 11, 3, 4);
  ctx.fillRect(x + 18 + (e.dir > 0 ? 2 : 0), y + 11, 3, 4);
}

function desenharJogador() {
  const p = jogador;
  const x = Math.round(p.x), y = Math.round(p.y);
  const andando = p.noChao && Math.abs(p.vx) > 0.5;
  const passo = andando ? Math.floor(tempo / 6) % 2 : 0;

  // Pernas
  ctx.fillStyle = '#1e4fa3';
  if (!p.noChao) {
    ctx.fillRect(x + 3, y + 20, 7, 6);
    ctx.fillRect(x + 12, y + 22, 7, 6);
  } else {
    ctx.fillRect(x + 3 + passo * 2, y + 20, 7, 8);
    ctx.fillRect(x + 12 - passo * 2, y + 20, 7, 8);
  }
  // Corpo
  ctx.fillStyle = '#ff8a1f';
  ctx.fillRect(x + 2, y + 11, p.w - 4, 11);
  ctx.fillStyle = '#1e4fa3';
  ctx.fillRect(x + 4, y + 16, p.w - 8, 6);
  // Cabeça
  ctx.fillStyle = '#f2c29b';
  ctx.fillRect(x + 4, y + 2, p.w - 8, 10);
  // Boné
  ctx.fillStyle = '#7b2cbf';
  ctx.fillRect(x + 3, y, p.w - 6, 4);
  ctx.fillRect(p.dir > 0 ? x + p.w - 6 : x, y + 3, 6, 2);
  // Olho
  ctx.fillStyle = '#000';
  ctx.fillRect(p.dir > 0 ? x + 13 : x + 6, y + 5, 3, 3);
}

function desenharEfeitos() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const ef of efeitos) {
    if (ef.tipo === 'moeda') desenharMoeda(ef.x, ef.y - ef.t * 2.5);
    if (ef.tipo === 'texto') {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(ef.texto, ef.x, ef.y - ef.t);
    }
  }
}

function texto(t, x, y, tamanho, alinhamento = 'left') {
  ctx.font = `bold ${tamanho}px system-ui, sans-serif`;
  ctx.textAlign = alinhamento;
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText(t, x + 2, y + 2);
  ctx.fillStyle = '#fff';
  ctx.fillText(t, x, y);
}

function desenharPlacar() {
  texto(`Moedas ${moedas}   Pontos ${pontos}   Vidas ${vidas}`, 16, 12, 18);
  texto(`Recorde ${recorde}`, LARGURA - 16, 12, 18, 'right');
}

function desenharMensagem() {
  const mensagens = {
    inicio: ['Jimbonio', 'Aperte Enter, Espaço ou toque para começar'],
    vitoria: ['Você chegou à bandeira!', `${pontos} pontos · Enter ou toque para jogar de novo`],
    fim: ['Fim de jogo', `${pontos} pontos · Enter ou toque para tentar de novo`],
  };
  const m = mensagens[estado];
  if (!m) return;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, LARGURA, ALTURA);
  texto(m[0], LARGURA / 2, ALTURA / 2 - 50, 40, 'center');
  texto(m[1], LARGURA / 2, ALTURA / 2 + 10, 18, 'center');
}

// ---------- Laço principal ----------

let ultimo = performance.now();
let acumulado = 0;

function quadro(agora) {
  acumulado += Math.min(agora - ultimo, 250);
  ultimo = agora;
  while (acumulado >= PASSO) {
    atualizar();
    acumulado -= PASSO;
  }
  desenhar();
  requestAnimationFrame(quadro);
}

iniciarFase();
requestAnimationFrame(quadro);
