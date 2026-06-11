/* ═══════════════════════════════════════════════════════════════════
   HELLSCAPE — FPS Clássico  (versão expandida)
   script.js — Motor de jogo completo (Raycasting, IA, HUD, Sons)

   ┌─────────────────────────────────────────────────────────────┐
   │  COMO EXPANDIR RAPIDAMENTE                                    │
   │  Novo mapa     → adicione em MAPS[] e MAP_STARTS[]           │
   │  Nova arma     → adicione objeto em WEAPONS{}                │
   │  Novo inimigo  → adicione tipo em ENEMY_TYPES{}              │
   │  Nova textura  → adicione função em generateTextures()       │
   │  Nova fase     → chame loadLevel(índice)                     │
   │  Pontuação     → já existe score, expanda o HUD              │
   │  Itens         → veja array items[] e updateItems()          │
   └─────────────────────────────────────────────────────────────┘
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   MAPAS
   0 = espaço livre  1,2,3,4 = parede (textura diferente)
   Para adicionar um novo mapa:
     1. Crie o array 2D abaixo
     2. Adicione posição inicial em MAP_STARTS[]
     3. Adicione inimigos em MAP_ENEMIES[]
     4. Chame loadLevel(índice) para ir para o novo mapa
   ───────────────────────────────────────────── */
const MAPS = [
  // ── Mapa 0 — Hall de entrada ──────────────────────────────────
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,2,0,0,0,0,0,2,2,0,0,0,0,2,2,0,0,1],
    [1,0,2,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,1],
    [1,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
    [1,0,3,0,0,0,1,1,1,1,1,1,0,0,0,0,3,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,2,2,0,0,0,0,0,0,2,2,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  // ── Mapa 1 — Catacumbas (mais apertado, mais difícil) ─────────
  // Dica: 4 = nova textura de pedra antiga com runas
  [
    [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    [4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,4,4,0,4,0,4,4,4,4,4,4,4,4,4,0,4,4,4,0,4],
    [4,0,4,0,0,0,0,4,0,0,0,0,0,0,4,0,0,4,0,4,0,4],
    [4,0,0,0,4,4,0,4,0,4,4,0,4,0,4,0,4,4,0,0,0,4],
    [4,4,4,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,4,4,4],
    [4,0,0,0,4,4,0,4,0,4,0,0,4,0,4,0,4,4,0,0,0,4],
    [4,0,4,0,0,0,0,4,0,0,0,0,0,0,4,0,0,4,0,4,0,4],
    [4,0,4,4,0,4,0,4,4,4,4,4,4,4,4,4,0,4,4,4,0,4],
    [4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,4],
    [4,0,4,4,0,4,0,0,3,3,3,3,3,3,0,0,0,4,4,4,0,4],
    [4,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,4],
    [4,0,4,4,0,4,0,0,3,3,3,3,3,3,0,0,0,4,4,4,0,4],
    [4,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,4],
    [4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  ]
];

/* Posição inicial do jogador em cada mapa */
const MAP_STARTS = [
  { x: 1.5, y: 1.5, angle: 0 },     // Mapa 0
  { x: 1.5, y: 1.5, angle: 0 }      // Mapa 1 — Catacumbas
];

/* Posições iniciais dos inimigos em cada mapa */
const MAP_ENEMIES = [
  // Mapa 0
  [
    { x: 8.5,  y: 3.5,  type: 'imp'      },
    { x: 14.5, y: 5.5,  type: 'imp'      },
    { x: 7.5,  y: 10.5, type: 'demon'    },
    { x: 15.5, y: 10.5, type: 'imp'      },
    { x: 4.5,  y: 13.5, type: 'demon'    },
    { x: 10.5, y: 13.5, type: 'imp'      },
  ],
  // Mapa 1 — Catacumbas (mais inimigos e tipos novos)
  [
    { x: 10.5, y: 3.5,  type: 'imp'      },
    { x: 18.5, y: 3.5,  type: 'cacodemon'},
    { x: 3.5,  y: 8.5,  type: 'demon'    },
    { x: 10.5, y: 8.5,  type: 'cacodemon'},
    { x: 18.5, y: 8.5,  type: 'demon'    },
    { x: 5.5,  y: 12.5, type: 'imp'      },
    { x: 16.5, y: 12.5, type: 'cacodemon'},
    { x: 10.5, y: 14.5, type: 'demon'    },
  ]
];

/* ─────────────────────────────────────────────
   TIPOS DE INIMIGO
   Para adicionar um novo tipo:
     1. Defina hp, speed, detectRange, attackRange, attackDamage,
        attackCooldown, color (corpo), headColor, reward
     2. Adicione entradas em MAP_ENEMIES para o mapa desejado
     3. Ajuste o sprite em drawSprites() se quiser visual exclusivo
   ───────────────────────────────────────────── */
const ENEMY_TYPES = {
  imp: {
    hp: 60, speed: 0.015, detectRange: 8, attackRange: 1.2,
    attackDamage: 10, attackCooldown: 1200,
    color: '#8B2500', headColor: '#cc6644', size: 0.4, reward: 100
  },
  demon: {
    hp: 120, speed: 0.02, detectRange: 10, attackRange: 1.5,
    attackDamage: 20, attackCooldown: 1500,
    color: '#5A0000', headColor: '#bb4422', size: 0.5, reward: 200
  },
  // ── Novo inimigo: Cacodemon ────────────────────────────────────
  // Flutua (sem animação de passo), mais lento mas atira de longe.
  // Adicione mais tipos copiando e ajustando este bloco.
  cacodemon: {
    hp: 200, speed: 0.011, detectRange: 12, attackRange: 4.0,
    attackDamage: 25, attackCooldown: 2000,
    color: '#880000', headColor: '#ff3300', size: 0.55, reward: 350,
    ranged: true          // flag usada em updateEnemies() para ataque à distância
  }
};

/* ─────────────────────────────────────────────
   ARMAS
   Para adicionar uma nova arma:
     1. Defina as propriedades abaixo
     2. Adicione case no drawWeapon() para o visual
     3. Altere player.weapon para equipar
   ───────────────────────────────────────────── */
const WEAPONS = {
  pistol: {
    name: 'PISTOLA',
    damage: 25, fireRate: 400, reloadTime: 1200,
    magSize: 12, reserveAmmo: 60,
    spread: 0.012
  },
  shotgun: {
    name: 'ESCOPETA',
    damage: 18, fireRate: 900, reloadTime: 2200,
    magSize: 6,  reserveAmmo: 24,
    pellets: 7,  spread: 0.09
  },
  // ── Nova arma: Metralhadora ────────────────────────────────────
  // Cadência alta, baixo dano por bala, recarga longa.
  machinegun: {
    name: 'METRALHADORA',
    damage: 12, fireRate: 120, reloadTime: 2800,
    magSize: 40, reserveAmmo: 120,
    spread: 0.025
  }
};

/* ─────────────────────────────────────────────
   CONSTANTES DE RENDERIZAÇÃO
   ───────────────────────────────────────────── */
const FOV        = Math.PI / 3;   // 60° campo de visão
const HALF_FOV   = FOV / 2;
const RENDER_RES = 0.5;           // resolução interna (0.5 = metade)
const MAX_DEPTH  = 20;            // distância máxima de raycast
const TEX_SIZE   = 64;            // tamanho das texturas geradas

/* ─────────────────────────────────────────────
   ESTADO GLOBAL DO JOGO
   ───────────────────────────────────────────── */
let canvas, ctx, minimapCanvas, minimapCtx;
let WIDTH, HEIGHT;
let currentMap = 0;
let map;
let gameRunning = false;
let lastTime    = 0;
let animFrame   = null;
let score       = 0;
let kills       = 0;

/* Jogador */
const player = {
  x: 1.5, y: 1.5, angle: 0,
  health: 100, maxHealth: 100,
  speed: 0.06, runMult: 1.7,
  weapon: 'pistol',
  ammo: 12, reserve: 60,
  reloading: false, reloadTimer: 0,
  shootCooldown: 0,
  dead: false
};

/* Teclas pressionadas */
const keys = { w:false, s:false, a:false, d:false, shift:false };

/* Inimigos ativos */
let enemies = [];

/* Partículas de impacto */
let particles = [];

/* Texturas geradas via Canvas 2D */
const TEXTURES = {};

/* Buffer para z-sorting de sprites */
let zbuffer = [];

/* Web Audio */
const audioCtx = (window.AudioContext || window.webkitAudioContext)
  ? new (window.AudioContext || window.webkitAudioContext)() : null;

/* ═══════════════════════════════════════════════
   GERAÇÃO DE TEXTURAS PROCEDURAIS
   Para adicionar uma nova textura:
     1. Chame make() com uma função que desenha em ctx
     2. Atribua a TEXTURES[número]
     3. Use esse número na matriz do mapa
═══════════════════════════════════════════════ */
function generateTextures() {
  const make = (draw) => {
    const c = document.createElement('canvas');
    c.width = c.height = TEX_SIZE;
    const x = c.getContext('2d');
    draw(x, c.width, c.height);
    return x.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
  };

  /* TEXTURA 1 — tijolo vermelho escuro */
  TEXTURES[1] = make((ctx, w, h) => {
    ctx.fillStyle = '#3a1a1a';
    ctx.fillRect(0, 0, w, h);
    const bw = 16, bh = 8;
    for (let row = 0; row < h / bh; row++) {
      for (let col = 0; col < w / bw + 1; col++) {
        const ox = (row % 2 === 0) ? 0 : -bw / 2;
        const x = col * bw + ox, y = row * bh;
        ctx.strokeStyle = '#1a0a0a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2);
        ctx.fillStyle = `rgb(${80 + (col * 13 + row * 7) % 30}, ${20 + (col * 7) % 15}, ${20 + (row * 5) % 10})`;
        ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4);
      }
    }
  });

  /* TEXTURA 2 — pedra cinza com veios */
  TEXTURES[2] = make((ctx, w, h) => {
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const nx = Math.random() * w, ny = Math.random() * h;
      ctx.beginPath();
      ctx.arc(nx, ny, Math.random() * 6 + 2, 0, Math.PI * 2);
      const v = 60 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fill();
    }
    ctx.strokeStyle = '#222'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, 0);
      ctx.lineTo(Math.random() * w, h);
      ctx.stroke();
    }
  });

  /* TEXTURA 3 — metal enferrujado */
  TEXTURES[3] = make((ctx, w, h) => {
    ctx.fillStyle = '#2a2010';
    ctx.fillRect(0, 0, w, h);
    const slotH = 12;
    for (let row = 0; row < h / slotH; row++) {
      const y = row * slotH;
      ctx.fillStyle = row % 2 === 0 ? '#3a3010' : '#252010';
      ctx.fillRect(0, y, w, slotH);
      ctx.fillStyle = '#1a1a08';
      ctx.fillRect(0, y + slotH - 1, w, 1);
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * w;
        ctx.fillStyle = '#6b3010';
        ctx.fillRect(x, y + 1, 3 + Math.random() * 5, slotH - 2);
      }
    }
  });

  // ── Nova textura 4 — Pedra antiga com runas ────────────────────
  // Blocos de pedra com marcas gravadas, usada no Mapa 1 (Catacumbas)
  TEXTURES[4] = make((ctx, w, h) => {
    /* Base pedra escura */
    ctx.fillStyle = '#1e1a28';
    ctx.fillRect(0, 0, w, h);

    /* Grade de blocos de pedra */
    const bw = 32, bh = 16;
    for (let row = 0; row < h / bh + 1; row++) {
      for (let col = 0; col < w / bw + 1; col++) {
        const ox = (row % 2 === 0) ? 0 : -bw / 2;
        const bx = col * bw + ox, by = row * bh;
        const shade = 28 + (row * 3 + col * 5) % 18;
        ctx.fillStyle = `rgb(${shade + 5},${shade},${shade + 12})`;
        ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
        /* Borda escura */
        ctx.strokeStyle = '#0a0810';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
    }

    /* Runa simples desenhada com linhas */
    const drawRune = (rx, ry, sz) => {
      ctx.strokeStyle = 'rgba(160,80,220,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx, ry); ctx.lineTo(rx + sz, ry + sz);
      ctx.moveTo(rx + sz, ry); ctx.lineTo(rx, ry + sz);
      ctx.moveTo(rx + sz / 2, ry - sz * 0.3); ctx.lineTo(rx + sz / 2, ry + sz * 1.3);
      ctx.stroke();
    };
    drawRune(4,  2,  8);
    drawRune(36, 18, 6);
    drawRune(14, 36, 10);
    drawRune(46, 48, 7);

    /* Brilho púrpura suave nas bordas */
    const grd = ctx.createRadialGradient(w/2, h/2, 2, w/2, h/2, w/2);
    grd.addColorStop(0, 'rgba(100,0,120,0)');
    grd.addColorStop(1, 'rgba(80,0,100,0.18)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  });
}

/* ═══════════════════════════════════════════════
   SOM SINTÉTICO (Web Audio API)
═══════════════════════════════════════════════ */
function playSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  const g   = audioCtx.createGain();
  g.connect(audioCtx.destination);
  const osc = audioCtx.createOscillator();
  osc.connect(g);

  switch (type) {
    case 'shoot':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.start(now); osc.stop(now + 0.14);
      break;
    case 'shoot_shotgun': {
      /* Som de escopeta: explosão mais grave e longa */
      const g2 = audioCtx.createGain();
      g2.connect(audioCtx.destination);
      const o2 = audioCtx.createOscillator();
      o2.connect(g2);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
      g.gain.setValueAtTime(0.45, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.26);
      o2.type = 'square';
      o2.frequency.setValueAtTime(90, now);
      o2.frequency.exponentialRampToValueAtTime(25, now + 0.18);
      g2.gain.setValueAtTime(0.2, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      o2.start(now); o2.stop(now + 0.21);
      break;
    }
    case 'shoot_machinegun':
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now); osc.stop(now + 0.09);
      break;
    case 'reload':
      osc.type = 'square';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.setValueAtTime(400, now + 0.08);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.16);
      break;
    case 'hit':
      osc.type = 'square';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.13);
      break;
    case 'step':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
      g.gain.setValueAtTime(0.07, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now); osc.stop(now + 0.08);
      break;
    case 'die':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.start(now); osc.stop(now + 0.45);
      break;
    case 'enemy_attack':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now); osc.stop(now + 0.22);
      break;
    case 'item_pickup':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(900, now + 0.05);
      osc.frequency.setValueAtTime(1200, now + 0.1);
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.19);
      break;
  }
}

/* ═══════════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════════════════════════════════ */
function init() {
  canvas        = document.getElementById('gameCanvas');
  ctx           = canvas.getContext('2d');
  minimapCanvas = document.getElementById('minimapCanvas');
  minimapCtx    = minimapCanvas.getContext('2d');

  generateTextures();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setupInput();
}

function resizeCanvas() {
  const hudH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hud-h')) || 110;
  canvas.width  = Math.floor(window.innerWidth  * RENDER_RES);
  canvas.height = Math.floor((window.innerHeight - hudH) * RENDER_RES);
  WIDTH  = canvas.width;
  HEIGHT = canvas.height;
  zbuffer = new Float32Array(WIDTH);
}

/* ─────────────────────────────────────────────
   CARREGAR NÍVEL
   Altere o parâmetro para trocar de fase
   ───────────────────────────────────────────── */
function loadLevel(index) {
  currentMap = index;
  map = MAPS[index];

  const start = MAP_STARTS[index];
  const wpn   = WEAPONS[player.weapon];
  Object.assign(player, {
    x: start.x, y: start.y, angle: start.angle,
    health: 100, dead: false,
    ammo:    wpn.magSize,
    reserve: wpn.reserveAmmo,
    reloading: false, shootCooldown: 0
  });

  enemies = MAP_ENEMIES[index].map(e => ({
    ...e,
    hp:           ENEMY_TYPES[e.type].hp,
    maxHp:        ENEMY_TYPES[e.type].hp,
    state:        'patrol',
    angle:        Math.random() * Math.PI * 2,
    attackTimer:  0,
    patrolTimer:  0,
    patrolDir:    Math.random() * Math.PI * 2,
    hitFlash:     0,
    visible:      false
  }));

  /* Itens espalhados pelo mapa (munição e vida) */
  spawnItems(index);

  particles = [];
  score = 0; kills = 0;
  updateHUD();
}

/* ═══════════════════════════════════════════════
   SISTEMA DE ITENS
   Para adicionar novos tipos de item:
     1. Adicione um case em updateItems() para o efeito
     2. Adicione no array items com { x, y, type, collected }
     3. Crie o visual em drawItems() (chamado de drawSprites)
═══════════════════════════════════════════════ */
let items = [];

function spawnItems(mapIndex) {
  items = [];
  /* Munição e kits de vida fixos em cada mapa */
  const spawns = [
    // Mapa 0
    [
      { x: 5.5,  y: 5.5,  type: 'ammo'  },
      { x: 12.5, y: 7.5,  type: 'ammo'  },
      { x: 9.5,  y: 11.5, type: 'health'},
      { x: 17.5, y: 3.5,  type: 'ammo'  },
    ],
    // Mapa 1
    [
      { x: 6.5,  y: 3.5,  type: 'ammo'  },
      { x: 15.5, y: 5.5,  type: 'health'},
      { x: 3.5,  y: 12.5, type: 'ammo'  },
      { x: 18.5, y: 14.5, type: 'health'},
      { x: 10.5, y: 12.5, type: 'ammo'  },
    ]
  ];
  const list = spawns[mapIndex] || [];
  items = list.map(s => ({ ...s, collected: false }));
}

function updateItems() {
  for (const item of items) {
    if (item.collected) continue;
    const dx = player.x - item.x;
    const dy = player.y - item.y;
    if (dx * dx + dy * dy < 0.5) {
      item.collected = true;
      playSound('item_pickup');
      if (item.type === 'ammo') {
        player.reserve = Math.min(
          player.reserve + 15,
          WEAPONS[player.weapon].reserveAmmo
        );
      } else if (item.type === 'health') {
        player.health = Math.min(player.health + 25, player.maxHealth);
      }
      updateHUD();
    }
  }
}

/* ═══════════════════════════════════════════════
   INPUT
═══════════════════════════════════════════════ */
function setupInput() {
  document.addEventListener('keydown', e => {
    switch (e.code) {
      case 'KeyW':       keys.w     = true;  break;
      case 'KeyS':       keys.s     = true;  break;
      case 'KeyA':       keys.a     = true;  break;
      case 'KeyD':       keys.d     = true;  break;
      case 'ShiftLeft':
      case 'ShiftRight': keys.shift = true;  break;
      case 'KeyR':       if (!player.reloading) reload(); break;
      /* Trocar arma com teclas numéricas */
      case 'Digit1':     switchWeapon('pistol');     break;
      case 'Digit2':     switchWeapon('shotgun');    break;
      case 'Digit3':     switchWeapon('machinegun'); break;
    }
  });

  document.addEventListener('keyup', e => {
    switch (e.code) {
      case 'KeyW':       keys.w     = false; break;
      case 'KeyS':       keys.s     = false; break;
      case 'KeyA':       keys.a     = false; break;
      case 'KeyD':       keys.d     = false; break;
      case 'ShiftLeft':
      case 'ShiftRight': keys.shift = false; break;
    }
  });

  document.addEventListener('mousemove', e => {
    if (!gameRunning || document.pointerLockElement !== canvas) return;
    player.angle += e.movementX * 0.0025;
  });

  document.addEventListener('mousedown', e => {
    if (e.button === 0 && gameRunning && document.pointerLockElement === canvas)
      shoot();
  });

  canvas.addEventListener('click', () => {
    if (gameRunning) canvas.requestPointerLock();
  });
}

/* ─────────────────────────────────────────────
   TROCAR ARMA
   ───────────────────────────────────────────── */
function switchWeapon(name) {
  if (!WEAPONS[name] || player.reloading) return;
  player.weapon      = name;
  player.ammo        = WEAPONS[name].magSize;
  player.reserve     = WEAPONS[name].reserveAmmo;
  player.shootCooldown = 0;
  updateHUD();
}

/* ═══════════════════════════════════════════════
   ATUALIZAÇÃO DO JOGADOR
═══════════════════════════════════════════════ */
let stepTimer = 0;

function updatePlayer(dt) {
  if (player.dead) return;

  const spd = player.speed * (keys.shift ? player.runMult : 1);
  const dx  = Math.cos(player.angle);
  const dy  = Math.sin(player.angle);
  let moving = false;

  if (keys.w) { tryMove(player.x + dx * spd, player.y + dy * spd); moving = true; }
  if (keys.s) { tryMove(player.x - dx * spd, player.y - dy * spd); moving = true; }

  const sx = Math.cos(player.angle + Math.PI / 2);
  const sy = Math.sin(player.angle + Math.PI / 2);
  if (keys.a) { tryMove(player.x - sx * spd, player.y - sy * spd); moving = true; }
  if (keys.d) { tryMove(player.x + sx * spd, player.y + sy * spd); moving = true; }

  if (moving) {
    stepTimer -= dt;
    if (stepTimer <= 0) { playSound('step'); stepTimer = keys.shift ? 280 : 420; }
  }

  if (player.reloading) {
    player.reloadTimer -= dt;
    if (player.reloadTimer <= 0) finishReload();
  }

  if (player.shootCooldown > 0) player.shootCooldown -= dt;

  updateItems();
}

function tryMove(nx, ny) {
  const margin = 0.25;
  if (!isWall(nx, player.y, margin)) player.x = nx;
  if (!isWall(player.x, ny, margin)) player.y = ny;
}

function isWall(x, y, m = 0.25) {
  const pts = [
    [x - m, y - m], [x + m, y - m],
    [x - m, y + m], [x + m, y + m]
  ];
  for (const [px, py] of pts) {
    if (map[Math.floor(py)]?.[Math.floor(px)]) return true;
  }
  return false;
}

/* ═══════════════════════════════════════════════
   ATUALIZAÇÃO DOS INIMIGOS
═══════════════════════════════════════════════ */
function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.state === 'dead') continue;

    /* Reduz flash de dano */
    if (e.hitFlash > 0) e.hitFlash -= dt;

    const def  = ENEMY_TYPES[e.type];
    const dx   = player.x - e.x;
    const dy   = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (e.state === 'patrol') {
      e.patrolTimer -= dt;
      if (e.patrolTimer <= 0) {
        e.patrolDir   = Math.random() * Math.PI * 2;
        e.patrolTimer = 800 + Math.random() * 1200;
      }
      const pdx = Math.cos(e.patrolDir) * def.speed;
      const pdy = Math.sin(e.patrolDir) * def.speed;
      if (!isWall(e.x + pdx, e.y + pdy, 0.3)) { e.x += pdx; e.y += pdy; }
      else e.patrolTimer = 0;

      if (dist < def.detectRange && hasLineOfSight(e, player)) e.state = 'chase';

    } else if (e.state === 'chase') {
      const attackDist = def.ranged ? def.attackRange : def.attackRange;
      if (dist < attackDist) {
        e.state = 'attack';
      } else {
        const speed = def.speed * 1.4;
        const mx = (dx / dist) * speed;
        const my = (dy / dist) * speed;
        /* Inimigos flutuantes (cacodemon) ignoram colisão suave */
        if (def.ranged) {
          if (!isWall(e.x + mx, e.y, 0.3)) e.x += mx;
          if (!isWall(e.x, e.y + my, 0.3)) e.y += my;
        } else {
          if (!isWall(e.x + mx, e.y, 0.3)) e.x += mx;
          if (!isWall(e.x, e.y + my, 0.3)) e.y += my;
        }
      }

    } else if (e.state === 'attack') {
      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        e.attackTimer = def.attackCooldown;
        if (!player.dead) {
          /* Ataques à distância verificam linha de visão */
          const canHit = def.ranged ? hasLineOfSight(e, player) : dist < def.attackRange * 1.2;
          if (canHit) {
            player.health -= def.attackDamage;
            playSound('enemy_attack');
            flashDamage();
            if (player.health <= 0) triggerDeath();
          }
        }
      }
      if (dist > def.attackRange * (def.ranged ? 1.2 : 1.5)) e.state = 'chase';
    }

    e.screenAngle = Math.atan2(dy, dx);
  }
}

/* Verificação de linha de visão */
function hasLineOfSight(from, to) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.ceil(dist * 8);
  for (let i = 1; i < steps; i++) {
    const t  = i / steps;
    const cx = Math.floor(from.x + dx * t);
    const cy = Math.floor(from.y + dy * t);
    if (map[cy]?.[cx]) return false;
  }
  return true;
}

/* ═══════════════════════════════════════════════
   SISTEMA DE TIRO
═══════════════════════════════════════════════ */
function shoot() {
  if (player.dead || player.reloading) return;
  if (player.shootCooldown > 0)        return;
  if (player.ammo <= 0) { reload(); return; }

  const wpn = WEAPONS[player.weapon];
  player.ammo--;
  player.shootCooldown = wpn.fireRate;

  /* Som específico por arma */
  const soundMap = { pistol: 'shoot', shotgun: 'shoot_shotgun', machinegun: 'shoot_machinegun' };
  playSound(soundMap[player.weapon] || 'shoot');
  updateHUD();

  /* Flash de tiro suave */
  ctx.save();
  ctx.fillStyle = 'rgba(255,200,50,0.18)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.restore();

  const pellets = wpn.pellets || 1;
  for (let p = 0; p < pellets; p++) {
    const spread    = (Math.random() - 0.5) * wpn.spread;
    const rayAngle  = player.angle + spread;
    let   hitDist   = MAX_DEPTH;
    let   hitEnemy  = null;

    for (const e of enemies) {
      if (e.state === 'dead') continue;
      const ex = e.x - player.x, ey = e.y - player.y;
      const dist = Math.sqrt(ex * ex + ey * ey);
      const angle = Math.atan2(ey, ex) - rayAngle;
      const normAngle = Math.atan2(Math.sin(angle), Math.cos(angle));
      const size = ENEMY_TYPES[e.type].size;
      if (Math.abs(normAngle) < size / dist && dist < hitDist) {
        if (zbuffer[Math.floor(WIDTH / 2)] === undefined || dist < zbuffer[Math.floor(WIDTH / 2)]) {
          hitDist  = dist;
          hitEnemy = e;
        }
      }
    }

    if (hitEnemy) {
      hitEnemy.hp       -= wpn.damage;
      hitEnemy.hitFlash  = 120; // ms de flash branco
      playSound('hit');
      spawnParticles(hitEnemy.x, hitEnemy.y);
      if (hitEnemy.hp <= 0) killEnemy(hitEnemy);
      else if (hitEnemy.state === 'patrol') hitEnemy.state = 'chase';
    }
  }

  if (player.ammo === 0 && player.reserve > 0) reload();
}

function reload() {
  if (player.reloading) return;
  const wpn = WEAPONS[player.weapon];
  if (player.ammo === wpn.magSize || player.reserve === 0) return;
  player.reloading   = true;
  player.reloadTimer = wpn.reloadTime;
  document.getElementById('reloadMsg').classList.remove('hidden');
  playSound('reload');
}

function finishReload() {
  const wpn     = WEAPONS[player.weapon];
  const needed  = wpn.magSize - player.ammo;
  const taken   = Math.min(needed, player.reserve);
  player.ammo    += taken;
  player.reserve -= taken;
  player.reloading = false;
  document.getElementById('reloadMsg').classList.add('hidden');
  updateHUD();
}

/* ═══════════════════════════════════════════════
   MORTE DO INIMIGO
═══════════════════════════════════════════════ */
function killEnemy(e) {
  e.state = 'dead';
  playSound('die');
  kills++;
  score += ENEMY_TYPES[e.type].reward;
  document.getElementById('killCount').textContent = kills;
  spawnParticles(e.x, e.y, 12);
}

/* ═══════════════════════════════════════════════
   PARTÍCULAS
═══════════════════════════════════════════════ */
function spawnParticles(wx, wy, count = 5) {
  for (let i = 0; i < count; i++) {
    particles.push({
      wx, wy,
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.04,
      life: 300 + Math.random() * 300,
      maxLife: 600,
      size: 2 + Math.random() * 3,
      color: `hsl(${10 + Math.random() * 30},90%,50%)`
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.wx   += p.vx;
    p.wy   += p.vy;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

/* ═══════════════════════════════════════════════
   MORTE DO JOGADOR
═══════════════════════════════════════════════ */
function triggerDeath() {
  if (player.dead) return;
  player.dead   = true;
  player.health = 0;
  gameRunning   = false;
  playSound('die');
  updateHUD();
  setTimeout(() => {
    document.getElementById('finalScore').textContent =
      `Mortes: ${kills}  |  Pontuação: ${score}`;
    document.getElementById('gameOverScreen').classList.remove('hidden');
  }, 1200);
}

function flashDamage() {
  const el = document.getElementById('damageIndicator');
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 150);
  updateHUD();
}

/* ═══════════════════════════════════════════════
   RAYCASTING
═══════════════════════════════════════════════ */
function castRays() {
  const imgData = ctx.createImageData(WIDTH, HEIGHT);
  const data    = imgData.data;

  drawFloorCeiling(data);

  for (let col = 0; col < WIDTH; col++) {
    const rayAngle = player.angle - HALF_FOV + (col / WIDTH) * FOV;
    const cosA = Math.cos(rayAngle);
    const sinA = Math.sin(rayAngle);

    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);

    const deltaX = Math.abs(1 / cosA);
    const deltaY = Math.abs(1 / sinA);

    let stepX, sideDistX, stepY, sideDistY;
    if (cosA < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaX; }
    else          { stepX =  1; sideDistX = (mapX + 1 - player.x) * deltaX; }
    if (sinA < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaY; }
    else          { stepY =  1; sideDistY = (mapY + 1 - player.y) * deltaY; }

    let hit = 0, side = 0, wallDist = 0, wallType = 1, wallHitX = 0;

    while (!hit) {
      if (sideDistX < sideDistY) { sideDistX += deltaX; mapX += stepX; side = 0; }
      else                        { sideDistY += deltaY; mapY += stepY; side = 1; }
      const cell = map[mapY]?.[mapX] ?? 1;
      if (cell > 0) { hit = 1; wallType = cell; }
    }

    if (side === 0) { wallDist = (mapX - player.x + (1 - stepX) / 2) / cosA; wallHitX = player.y + wallDist * sinA; }
    else            { wallDist = (mapY - player.y + (1 - stepY) / 2) / sinA; wallHitX = player.x + wallDist * cosA; }
    wallHitX -= Math.floor(wallHitX);
    zbuffer[col] = wallDist;

    const lineH = Math.floor(HEIGHT / wallDist);
    const drawS = Math.max(0, Math.floor(HEIGHT / 2 - lineH / 2));
    const drawE = Math.min(HEIGHT - 1, Math.floor(HEIGHT / 2 + lineH / 2));

    const tex   = TEXTURES[wallType] || TEXTURES[1];
    let   texX  = Math.floor(wallHitX * TEX_SIZE);
    if ((side === 0 && cosA > 0) || (side === 1 && sinA < 0)) texX = TEX_SIZE - texX - 1;
    texX = Math.max(0, Math.min(TEX_SIZE - 1, texX));

    const shade  = side === 1 ? 0.55 : 0.85;
    const fogFac = Math.max(0, 1 - wallDist / MAX_DEPTH);

    for (let y = drawS; y <= drawE; y++) {
      const texY = Math.floor(((y - drawS) / (drawE - drawS + 1)) * TEX_SIZE);
      const tIdx = (texY * TEX_SIZE + texX) * 4;
      const pIdx = (y * WIDTH + col) * 4;
      data[pIdx    ] = tex.data[tIdx    ] * shade * fogFac;
      data[pIdx + 1] = tex.data[tIdx + 1] * shade * fogFac;
      data[pIdx + 2] = tex.data[tIdx + 2] * shade * fogFac;
      data[pIdx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function drawFloorCeiling(data) {
  for (let y = 0; y < HEIGHT; y++) {
    const isCeiling = y < HEIGHT / 2;
    const rowDist = isCeiling ? HEIGHT / (HEIGHT - 2 * y + 1) : HEIGHT / (2 * y - HEIGHT + 1);
    const fog = Math.min(1, rowDist / 10);
    let r, g, b;
    if (isCeiling) { r = g = b = Math.floor(20 + 30 * (1 - fog)); }
    else           { r = Math.floor(35 * (1 - fog)); g = Math.floor(20 * (1 - fog)); b = Math.floor(10 * (1 - fog)); }
    for (let x = 0; x < WIDTH; x++) {
      const idx = (y * WIDTH + x) * 4;
      data[idx    ] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
    }
  }
}

/* ═══════════════════════════════════════════════
   SPRITES — inimigos, itens e partículas
═══════════════════════════════════════════════ */
function drawSprites() {
  /* Ordenar por distância */
  const spriteList = enemies
    .filter(e => e.state !== 'dead')
    .map(e => {
      const dx = e.x - player.x, dy = e.y - player.y;
      return { e, dist: dx * dx + dy * dy };
    })
    .sort((a, b) => b.dist - a.dist);

  for (const { e, dist } of spriteList) {
    const dx = e.x - player.x, dy = e.y - player.y;
    const trueDist = Math.sqrt(dist);
    const spriteAngle = Math.atan2(dy, dx) - player.angle;
    const normAngle   = Math.atan2(Math.sin(spriteAngle), Math.cos(spriteAngle));
    if (Math.abs(normAngle) > FOV) continue;

    const screenX = Math.floor((0.5 + normAngle / FOV) * WIDTH);
    const spriteH = Math.abs(Math.floor(HEIGHT / trueDist));
    const spriteW = spriteH;
    const drawY   = Math.floor(HEIGHT / 2 - spriteH / 2);
    const drawX   = screenX - Math.floor(spriteW / 2);
    if (spriteW <= 0 || spriteH <= 0) continue;

    const fog  = Math.max(0, 1 - trueDist / MAX_DEPTH);
    const def  = ENEMY_TYPES[e.type];
    const isHit = e.hitFlash > 0;

    for (let sx = 0; sx < spriteW; sx++) {
      const screenCol = drawX + sx;
      if (screenCol < 0 || screenCol >= WIDTH) continue;
      if (zbuffer[screenCol] <= trueDist) continue;

      ctx.save();
      ctx.globalAlpha = fog;

      const bodyH = Math.floor(spriteH * 0.6);
      const bodyY = drawY + Math.floor(spriteH * 0.35);
      ctx.fillStyle = isHit ? '#ffffff' : def.color;
      ctx.fillRect(screenCol, bodyY, 1, bodyH);

      /* Cabeça (só no centro do sprite) */
      if (sx === Math.floor(spriteW * 0.3)) {
        const headSize = Math.floor(spriteH * 0.28);
        ctx.fillStyle  = isHit ? '#ffffff' : def.headColor;
        ctx.fillRect(drawX + Math.floor(spriteW * 0.3), drawY, headSize, headSize);

        /* Olhos do cacodemon — visual distinto */
        if (e.type === 'cacodemon' && !isHit) {
          ctx.fillStyle = '#ff0000';
          const eyeY = drawY + Math.floor(headSize * 0.25);
          const eyeS = Math.max(1, Math.floor(headSize * 0.18));
          ctx.fillRect(drawX + Math.floor(spriteW * 0.3) + 1, eyeY, eyeS, eyeS);
          ctx.fillRect(drawX + Math.floor(spriteW * 0.3) + headSize - eyeS - 1, eyeY, eyeS, eyeS);
        }
      }

      ctx.restore();
    }

    /* Barra de vida */
    if (trueDist < 6 && e.hp < e.maxHp) {
      const barW = Math.min(spriteW, 30);
      const barX = screenX - Math.floor(barW / 2);
      const barY = drawY - 6;
      ctx.fillStyle = '#440000'; ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = '#cc2200'; ctx.fillRect(barX, barY, Math.floor(barW * (e.hp / e.maxHp)), 3);
    }
  }

  /* Itens no chão */
  for (const item of items) {
    if (item.collected) continue;
    const dx = item.x - player.x, dy = item.y - player.y;
    const trueDist = Math.sqrt(dx * dx + dy * dy);
    if (trueDist > MAX_DEPTH) continue;
    const angle = Math.atan2(dy, dx) - player.angle;
    const norm  = Math.atan2(Math.sin(angle), Math.cos(angle));
    if (Math.abs(norm) > HALF_FOV) continue;
    const sx = Math.floor((0.5 + norm / FOV) * WIDTH);
    if (zbuffer[sx] <= trueDist) continue;
    const sz = Math.floor(HEIGHT / trueDist * 0.15);
    const sy = Math.floor(HEIGHT / 2 + sz * 0.5);
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - trueDist / MAX_DEPTH);
    /* Cor por tipo: amarelo = munição, verde = vida */
    ctx.fillStyle = item.type === 'ammo' ? '#ffdd00' : '#00dd44';
    ctx.fillRect(sx - Math.floor(sz / 2), sy, sz, sz);
    /* Brilho pulsante */
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    ctx.globalAlpha *= pulse * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - Math.floor(sz / 4), sy, Math.floor(sz / 2), Math.floor(sz / 2));
    ctx.restore();
  }

  /* Partículas */
  for (const p of particles) {
    const dx = p.wx - player.x, dy = p.wy - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_DEPTH) continue;
    const a = Math.atan2(dy, dx) - player.angle;
    const n = Math.atan2(Math.sin(a), Math.cos(a));
    if (Math.abs(n) > HALF_FOV) continue;
    const sx  = Math.floor((0.5 + n / FOV) * WIDTH);
    const fog = Math.max(0, 1 - dist / MAX_DEPTH);
    const ph  = Math.floor(p.size / dist * HEIGHT * 0.1);
    const py  = Math.floor(HEIGHT / 2 - ph / 2);
    if (zbuffer[sx] > dist) {
      ctx.save();
      ctx.globalAlpha = (p.life / p.maxLife) * fog;
      ctx.fillStyle   = p.color;
      ctx.fillRect(sx, py, Math.max(1, ph), Math.max(1, ph));
      ctx.restore();
    }
  }
}

/* ═══════════════════════════════════════════════
   SPRITE DA ARMA — desenhado diretamente no canvas
   Cada arma tem seu próprio bloco de desenho procedural
   com geometria detalhada em múltiplas camadas.
═══════════════════════════════════════════════ */
function drawWeapon() {
  const w = WIDTH, h = HEIGHT;
  const wpn     = WEAPONS[player.weapon];
  const isFiring = player.shootCooldown > wpn.fireRate * 0.5;
  const isReloading = player.reloading;

  /* Bob de movimento */
  const t      = Date.now();
  const moving = keys.w || keys.s || keys.a || keys.d;
  const bobAmp = moving ? (keys.shift ? 6 : 4) : 0.8;
  const bobX   = Math.sin(t / 150) * bobAmp * 0.5;
  const bobY   = Math.abs(Math.sin(t / 150)) * bobAmp;

  /* Recoil vertical ao disparar */
  const recoilAmt = isFiring ? Math.max(0, (player.shootCooldown / wpn.fireRate)) * 10 : 0;

  /* Balanço de recarga */
  const reloadSway = isReloading
    ? Math.sin((player.reloadTimer / wpn.reloadTime) * Math.PI) * 25
    : 0;

  switch (player.weapon) {

    /* ── PISTOLA — detalhada e realista ─────────────────────── */
    case 'pistol': {
      const bx = Math.floor(w / 2) - 20 + bobX + (isFiring ? 1 : 0);
      const by = Math.floor(h * 0.60) + bobY + recoilAmt + reloadSway;

      ctx.save();

      /* Sombra projetada */
      ctx.globalAlpha = 0.18;
      ctx.fillStyle   = '#000000';
      ctx.fillRect(bx + 4, by + 2, 46, 30);
      ctx.globalAlpha = 1;

      /* ── Cano ── */
      /* Cano externo (mais escuro) */
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(bx + 16, by - 26, 10, 26);
      /* Cano interno (furo) */
      ctx.fillStyle = '#111111';
      ctx.fillRect(bx + 19, by - 24, 4, 22);
      /* Bocal (extremidade do cano) — pequena borda */
      ctx.fillStyle = '#555555';
      ctx.fillRect(bx + 15, by - 28, 12, 3);
      ctx.fillStyle = '#888888';
      ctx.fillRect(bx + 16, by - 30, 10, 2);

      /* ── Mira traseira ── */
      ctx.fillStyle = '#222222';
      ctx.fillRect(bx + 15, by - 13, 12, 3);
      ctx.fillStyle = '#ff4444'; /* ponto vermelho */
      ctx.fillRect(bx + 20, by - 13, 2, 2);

      /* ── Slide (parte superior móvel) ── */
      const slideOffset = isFiring ? 5 : 0; /* recua ao disparar */
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(bx + 8 + slideOffset, by - 10, 30, 14);
      /* Detalhe superior do slide */
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(bx + 9 + slideOffset, by - 9, 28, 4);
      /* Extrator (pequena saliência lateral) */
      ctx.fillStyle = '#666666';
      ctx.fillRect(bx + 34 + slideOffset, by - 7, 3, 5);
      /* Ejetor (pequena mira dianteira no slide) */
      ctx.fillStyle = '#888';
      ctx.fillRect(bx + 12 + slideOffset, by - 12, 2, 2);

      /* ── Corpo principal / frame ── */
      ctx.fillStyle = '#3d3d3d';
      ctx.fillRect(bx + 8, by + 4, 30, 12);
      /* Detalhe de relevo no frame */
      ctx.fillStyle = '#4d4d4d';
      ctx.fillRect(bx + 9, by + 5, 14, 4);
      ctx.fillRect(bx + 9, by + 10, 14, 2);
      /* Protetor do gatilho (curva simulada com 3 rects) */
      ctx.fillStyle = '#333';
      ctx.fillRect(bx + 18, by + 14, 12, 3);
      ctx.fillRect(bx + 16, by + 16, 2,  4);
      ctx.fillRect(bx + 28, by + 16, 2,  4);

      /* ── Gatilho ── */
      ctx.fillStyle = '#888888';
      ctx.fillRect(bx + 21, by + 8, 3, 8);
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(bx + 21, by + 8, 3, 3);

      /* ── Punho / cabo ── */
      ctx.fillStyle = '#2e1a08'; /* madeira escura */
      ctx.fillRect(bx + 16, by + 15, 12, 16);
      /* Textura do cabo — listras finas */
      ctx.fillStyle = '#3a2510';
      for (let i = 0; i < 4; i++) ctx.fillRect(bx + 17, by + 16 + i * 4, 10, 2);
      /* Parafuso inferior do cabo */
      ctx.fillStyle = '#555';
      ctx.fillRect(bx + 20, by + 29, 4, 2);

      /* ── Pino de retorno (parte traseira acima do cabo) ── */
      ctx.fillStyle = '#555';
      ctx.fillRect(bx + 36, by - 2, 6, 8);
      ctx.fillStyle = '#777';
      ctx.fillRect(bx + 37, by - 1, 4, 2);

      /* ── Carregador ── */
      ctx.fillStyle = '#282828';
      ctx.fillRect(bx + 18, by + 20, 8, 12);
      /* Base do carregador */
      ctx.fillStyle = '#222';
      ctx.fillRect(bx + 17, by + 30, 10, 3);

      /* ── Flash de disparo ── */
      if (isFiring) {
        const fx = bx + 21, fy = by - 32;
        /* Clarão central brilhante */
        ctx.globalAlpha = 0.95;
        ctx.fillStyle   = 'rgba(255,240,120,1)';
        ctx.beginPath();
        ctx.arc(fx, fy, 9, 0, Math.PI * 2);
        ctx.fill();
        /* Anel externo */
        ctx.globalAlpha = 0.55;
        ctx.fillStyle   = 'rgba(255,180,40,0.8)';
        ctx.beginPath();
        ctx.arc(fx, fy, 14, 0, Math.PI * 2);
        ctx.fill();
        /* Raios do clarão */
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = 'rgba(255,220,80,0.9)';
        ctx.lineWidth   = 2;
        for (let a = 0; a < 6; a++) {
          const ra = (a / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(fx + Math.cos(ra) * 8, fy + Math.sin(ra) * 8);
          ctx.lineTo(fx + Math.cos(ra) * 18, fy + Math.sin(ra) * 18);
          ctx.stroke();
        }
        /* Clarão interno branco */
        ctx.globalAlpha = 0.9;
        ctx.fillStyle   = '#ffffff';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      break;
    }

    /* ── ESCOPETA ─────────────────────────────────────────────── */
    case 'shotgun': {
      const bx = Math.floor(w / 2) - 40 + bobX;
      const by = Math.floor(h * 0.58) + bobY + recoilAmt * 1.5 + reloadSway;

      ctx.save();

      /* Cano duplo */
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(bx + 10, by - 30, 8, 30);
      ctx.fillRect(bx + 20, by - 30, 8, 30);
      /* Bocal dos dois canos */
      ctx.fillStyle = '#222';
      ctx.fillRect(bx + 11, by - 28, 6, 25);
      ctx.fillRect(bx + 21, by - 28, 6, 25);
      /* Faixa de união */
      ctx.fillStyle = '#555';
      ctx.fillRect(bx + 9,  by - 32, 20, 4);
      ctx.fillRect(bx + 9,  by - 18, 20, 3);

      /* Corpo */
      ctx.fillStyle = '#4a3820'; /* madeira */
      ctx.fillRect(bx + 6, by - 2, 52, 16);
      /* Grão da madeira */
      ctx.fillStyle = '#5a4428';
      for (let i = 0; i < 6; i++) ctx.fillRect(bx + 7, by - 2 + i * 3, 50, 1);

      /* Coronha */
      ctx.fillStyle = '#3a2810';
      ctx.fillRect(bx + 42, by - 4, 22, 20);
      ctx.fillStyle = '#4a3418';
      for (let i = 0; i < 5; i++) ctx.fillRect(bx + 43, by - 3 + i * 4, 20, 2);
      /* Borracha da coronha */
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(bx + 62, by - 2, 5, 18);

      /* Protetor do gatilho */
      ctx.fillStyle = '#333';
      ctx.fillRect(bx + 22, by + 14, 18, 3);
      ctx.fillRect(bx + 20, by + 16, 2, 5);
      ctx.fillRect(bx + 38, by + 16, 2, 5);

      /* Gatilho */
      ctx.fillStyle = '#aaa';
      ctx.fillRect(bx + 28, by + 8, 3, 10);

      /* Flash duplo ao disparar */
      if (isFiring) {
        [[bx + 14, by - 36], [bx + 24, by - 36]].forEach(([fx, fy]) => {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle   = 'rgba(255,230,80,1)';
          ctx.beginPath(); ctx.arc(fx, fy, 11, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle   = 'rgba(255,150,30,0.8)';
          ctx.beginPath(); ctx.arc(fx, fy, 17, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.9;
          ctx.fillStyle   = '#fff';
          ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI * 2); ctx.fill();
        });
      }

      ctx.restore();
      break;
    }

    /* ── METRALHADORA ─────────────────────────────────────────── */
    case 'machinegun': {
      const bx = Math.floor(w / 2) - 50 + bobX;
      const by = Math.floor(h * 0.57) + bobY + recoilAmt * 0.8 + reloadSway;

      ctx.save();

      /* Cano longo */
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(bx + 14, by - 36, 9, 36);
      ctx.fillStyle = '#222';
      ctx.fillRect(bx + 16, by - 34, 5, 32);
      /* Supressor de chama */
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(bx + 12, by - 42, 13, 8);
      ctx.fillStyle = '#111';
      for (let i = 0; i < 3; i++) ctx.fillRect(bx + 13 + i * 4, by - 40, 2, 5);
      /* Tampa de gás acima do cano */
      ctx.fillStyle = '#555';
      ctx.fillRect(bx + 10, by - 20, 17, 4);
      /* Pino de gás */
      ctx.fillStyle = '#888';
      ctx.fillRect(bx + 17, by - 24, 3, 6);

      /* Corpo / receiver */
      ctx.fillStyle = '#2e2e2e';
      ctx.fillRect(bx + 5, by - 4, 68, 18);
      ctx.fillStyle = '#3d3d3d';
      ctx.fillRect(bx + 6, by - 3, 66, 8);
      /* Seletor de fogo (lateral) */
      ctx.fillStyle = '#555';
      ctx.fillRect(bx + 60, by + 4, 8, 3);

      /* Coronha articulada */
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(bx + 68, by - 6, 20, 20);
      ctx.fillStyle = '#2a2a2a';
      for (let i = 0; i < 4; i++) ctx.fillRect(bx + 69, by - 5 + i * 5, 18, 3);

      /* Pegador dianteiro */
      ctx.fillStyle = '#222';
      ctx.fillRect(bx + 14, by + 14, 16, 12);
      ctx.fillStyle = '#333';
      for (let i = 0; i < 3; i++) ctx.fillRect(bx + 15, by + 15 + i * 4, 14, 2);

      /* Carregador curvo (banana mag) */
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(bx + 28, by + 14, 12, 22);
      ctx.fillRect(bx + 26, by + 28, 16, 6);
      ctx.fillRect(bx + 24, by + 32, 18, 4);
      /* Linha central do carregador */
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(bx + 33, by + 15, 2, 20);

      /* Alça de transporte */
      ctx.fillStyle = '#222';
      ctx.fillRect(bx + 22, by - 10, 30, 3);
      ctx.fillRect(bx + 22, by - 10, 3, 7);
      ctx.fillRect(bx + 49, by - 10, 3, 7);

      /* Flash ao disparar */
      if (isFiring) {
        const fx = bx + 18, fy = by - 46;
        ctx.globalAlpha = 0.85;
        ctx.fillStyle   = 'rgba(255,230,100,1)';
        ctx.beginPath(); ctx.arc(fx, fy, 8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.45;
        ctx.fillStyle   = 'rgba(255,160,30,0.8)';
        ctx.beginPath(); ctx.arc(fx, fy, 13, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle   = '#fff';
        ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
        /* Chama lateral */
        ctx.globalAlpha = 0.6;
        ctx.fillStyle   = 'rgba(255,100,0,0.7)';
        ctx.fillRect(fx + 6, fy - 3, 10, 6);
      }

      ctx.restore();
      break;
    }
  }
}

/* ═══════════════════════════════════════════════
   MINI MAPA
═══════════════════════════════════════════════ */
function drawMinimap() {
  const mc = minimapCanvas, mx = minimapCtx;
  const mW = mc.width, mH = mc.height;
  const rows = map.length, cols = map[0].length;
  const cw = mW / cols, ch = mH / rows;

  mx.fillStyle = '#0a0a0a';
  mx.fillRect(0, 0, mW, mH);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = map[r][c];
      if (cell) {
        const colors = { 1: '#553333', 2: '#334455', 3: '#445533', 4: '#332255' };
        mx.fillStyle = colors[cell] || '#553333';
        mx.fillRect(c * cw, r * ch, cw - 1, ch - 1);
      }
    }
  }

  /* Itens */
  for (const item of items) {
    if (item.collected) continue;
    mx.fillStyle = item.type === 'ammo' ? '#ffdd00' : '#00dd44';
    mx.fillRect(item.x * cw - 1.5, item.y * ch - 1.5, 3, 3);
  }

  /* Inimigos */
  mx.fillStyle = '#cc2200';
  for (const e of enemies) {
    if (e.state === 'dead') continue;
    mx.fillRect(e.x * cw - 2, e.y * ch - 2, 4, 4);
  }

  /* Jogador */
  mx.fillStyle = '#44ff44';
  mx.beginPath();
  mx.arc(player.x * cw, player.y * ch, 3, 0, Math.PI * 2);
  mx.fill();

  mx.strokeStyle = '#44ff44';
  mx.lineWidth   = 1;
  mx.beginPath();
  mx.moveTo(player.x * cw, player.y * ch);
  mx.lineTo((player.x + Math.cos(player.angle) * 1.5) * cw, (player.y + Math.sin(player.angle) * 1.5) * ch);
  mx.stroke();
}

/* ═══════════════════════════════════════════════
   HUD
═══════════════════════════════════════════════ */
function updateHUD() {
  const hp = Math.max(0, player.health);
  document.getElementById('healthBar').style.width  = (hp / player.maxHealth * 100) + '%';
  document.getElementById('healthVal').textContent   = hp;
  document.getElementById('ammoCount').textContent   = `${player.ammo} / ${player.reserve}`;
  document.getElementById('weaponName').textContent  = WEAPONS[player.weapon].name;
}

/* ═══════════════════════════════════════════════
   LOOP PRINCIPAL
═══════════════════════════════════════════════ */
let fpsSmooth  = 60;
let frameCount = 0;
let fpsTimer   = 0;

function gameLoop(timestamp) {
  if (!gameRunning) return;
  const dt = Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;

  frameCount++;
  fpsTimer += dt;
  if (fpsTimer >= 500) {
    fpsSmooth  = Math.round(frameCount / fpsTimer * 1000);
    frameCount = 0; fpsTimer = 0;
    document.getElementById('fpsCounter').textContent = `FPS: ${fpsSmooth}`;
  }

  updatePlayer(dt);
  updateEnemies(dt);
  updateParticles(dt);

  castRays();
  drawSprites();
  drawWeapon();
  drawMinimap();

  animFrame = requestAnimationFrame(gameLoop);
}

/* ═══════════════════════════════════════════════
   TELA INICIAL — BOTÕES
═══════════════════════════════════════════════ */
function startGame() {
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  loadLevel(0);
  gameRunning = true;
  lastTime    = performance.now();
  animFrame   = requestAnimationFrame(gameLoop);
  canvas.requestPointerLock();
}

function restartGame() {
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  document.getElementById('reloadMsg').classList.add('hidden');
  loadLevel(0);
  gameRunning = true;
  lastTime    = performance.now();
  animFrame   = requestAnimationFrame(gameLoop);
  canvas.requestPointerLock();
}

window.addEventListener('DOMContentLoaded', () => {
  init();
  document.getElementById('startBtn').addEventListener('click',   startGame);
  document.getElementById('restartBtn').addEventListener('click', restartGame);
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== canvas && gameRunning) {
      /* Aqui pode-se adicionar menu de pausa */
    }
  });
});
