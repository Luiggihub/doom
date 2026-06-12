'use strict';

/* ═══════════════════════════════════════════════════════════════════
   HELLSCAPE — FPS Clássico v3.0
   - Renderizador melhorado: piso/teto com perspectiva real (floor casting)
   - Área externa com céu infernal vermelho
   - Mapa grande com 3 zonas: base, catacumbas, área externa
   - Inimigos estilo Doom (soldado humanoide com uniforme)
   - Múltiplas texturas de parede por zona
   - Iluminação por distância mais dramática
═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   MAPA — Zona 0 = interior base, Zona 1 = exterior, Zona 2 = catacumba
   Valores de célula:
     0 = chão livre
     1 = tijolo vermelho (interior)
     2 = pilastra pedra
     3 = metal enferrujado
     4 = pedra antiga (catacumba)
     5 = parede externa (outdoor)
     9 = porta/abertura entre zonas
   Mapa 0: Base Infernal 48×48
   ───────────────────────────────────────────── */

const MAPS = [
  // ── Mapa 0 — Base Infernal + Área Externa (48×48) ───────────────
  (() => {
    const W = 48, H = 48;
    const m = Array.from({length:H}, () => Array(W).fill(0));
    // Borda
    for(let i=0;i<W;i++) { m[0][i]=1; m[H-1][i]=1; }
    for(let i=0;i<H;i++) { m[i][0]=1; m[i][W-1]=1; }

    // Sala 1 — entrada (interior)
    const addWallH = (r, c1, c2, t=1) => { for(let c=c1;c<=c2;c++) m[r][c]=t; };
    const addWallV = (c, r1, r2, t=1) => { for(let r=r1;r<=r2;r++) m[r][c]=t; };

    // Sala principal grande
    addWallH(2, 2, 20); addWallH(14, 2, 20);
    addWallV(2, 2, 14); addWallV(20, 2, 14);
    m[8][2]=0; // porta lateral
    m[2][10]=0; m[2][11]=0; // abertura topo
    m[14][10]=0; m[14][11]=0; // abertura baixo

    // Pilastras interiores
    [[4,4],[4,8],[4,16],[8,4],[8,16],[10,8],[10,12],[12,4],[12,16]].forEach(([r,c])=>{m[r][c]=2;m[r+1][c]=2;});

    // Corredor esquerdo
    addWallH(4,  2, 5);  addWallH(12, 2, 5);
    addWallV(5, 4, 12);

    // Sala 2 — armaria
    addWallH(2,  22, 30); addWallH(10, 22, 30);
    addWallV(22, 2, 10);  addWallV(30, 2, 10);
    m[6][22]=0; // porta
    m[2][26]=0; m[2][27]=0;
    [3,4,5,3,4,5].forEach((r,i)=>{const c=i<3?23:27; m[r][c]=3;});

    // Sala 3 — laboratório (pilastras em grade)
    addWallH(2,  32, 46); addWallH(16, 32, 46);
    addWallV(32, 2, 16);  addWallV(46, 2, 16);
    m[2][38]=0; m[2][39]=0;
    m[16][38]=0; m[16][39]=0;
    for(let r=4;r<=14;r+=4) for(let c=34;c<=44;c+=4) { m[r][c]=2; m[r][c+1]=2; }

    // ═══ ÁREA EXTERNA ════════════════════════════════════════════
    // Borda da área externa
    addWallH(17, 2, 46, 5); addWallH(34, 2, 46, 5);
    addWallV(2, 17, 34, 5); addWallV(46, 17, 34, 5);
    // Aberturas para entrar
    m[17][10]=0; m[17][11]=0;
    m[17][22]=0; m[17][23]=0;
    m[17][34]=0; m[17][35]=0;
    m[34][14]=0; m[34][15]=0;
    m[34][30]=0; m[34][31]=0;

    // Rochas e ruínas na área externa
    [[19,6,5],[19,14,5],[19,40,5],[20,6,5],[22,8,5],[22,42,5],
     [24,4,5],[24,44,5],[26,6,5],[28,10,5],[28,38,5],[30,8,5],
     [30,42,5],[32,14,5],[32,38,5],[19,22,5],[19,26,5],
     [21,30,5],[21,34,5],[25,20,5],[25,22,5],[27,40,5],
     [29,18,5],[29,24,5],[31,28,5],[31,36,5],
    ].forEach(([r,c,t])=>{m[r][c]=t;});

    // Torres externas
    for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++) m[18+dr][38+dc]=5;
    for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++) m[30+dr][4+dc]=5;

    // ═══ CATACUMBAS (zona 3) ═════════════════════════════════════
    addWallH(35, 2, 46, 4); addWallH(46, 2, 46, 4);
    addWallV(2, 35, 46, 4); addWallV(46, 35, 46, 4);
    m[35][12]=0; m[35][13]=0; // entrada das catacumbas
    m[35][14]=0; m[35][15]=0; // alinhado com porta row34
    m[35][30]=0; m[35][31]=0; // alinhado com abertura row34
    m[35][32]=0; m[35][33]=0;

    // Labirinto catacumba
    addWallH(38, 4, 16, 4); addWallH(38, 20, 30, 4);
    addWallH(42, 6, 20, 4); addWallH(42, 24, 44, 4);
    addWallV(8, 36, 42, 4); addWallV(16, 36, 42, 4);
    addWallV(24, 38, 46, 4); addWallV(32, 36, 44, 4);
    addWallV(40, 38, 42, 4); addWallV(40, 44, 46, 4);
    m[38][10]=0; m[38][24]=0; m[42][12]=0; m[42][22]=0; m[42][38]=0;
    m[42][40]=0; m[42][41]=0; // passagem acima da entrada da arena do boss

    // Arena do Boss
    for(let r=43;r<=46;r++) for(let c=34;c<=46;c++) m[r][c]=0;
    addWallH(43, 34, 46, 4); addWallV(34, 43, 46, 4);
    m[43][40]=0; m[43][41]=0;

    return m;
  })()
];

// ── Portas tecnológicas ─────────────────────────────────────────
// cell value 6 = porta tecnológica fechada
// Cada porta: { row, col, open, openAmount 0-1, side: 'left'|'right' }
let techDoors = [];
const DOOR_SPEED = 0.003; // por ms

// Posições das portas no mapa 0 — passagem da catacumba (zona 2)
// Vamos colocar uma porta na entrada da zona exterior (linha 17, col 22-23)
// e uma na entrada das catacumbas (linha 35, col 12-13)
const TECH_DOOR_DEFS = [
  // Porta exterior->catacumba: linha 34, colunas 14 e 15
  { row: 34, col: 14, pairCol: 15 },
  // Porta da armaria (entrada alternativa)
  { row: 17, col: 22, pairCol: 23 },
];

// Metadados de zona por linha: qual tipo de céu/piso usar
// 0 = interior, 1 = exterior, 2 = catacumba
function getZoneForRow(row) {
  if (row >= 17 && row <= 34) return 1; // exterior
  if (row >= 35) return 2; // catacumba
  return 0; // interior
}

function getZoneForPos(x, y) {
  return getZoneForRow(Math.floor(y));
}

const MAP_STARTS = [
  { x: 3.5, y: 3.5, angle: 0 }
];

const MAP_ENEMIES = [
  [
    // Interior
    { x:8.5,  y:5.5,  type:'imp'      },
    { x:15.5, y:4.5,  type:'imp'      },
    { x:6.5,  y:10.5, type:'demon'    },
    { x:25.5, y:5.5,  type:'imp'      },
    { x:28.5, y:7.5,  type:'imp'      },
    { x:38.5, y:5.5,  type:'imp'      },
    { x:42.5, y:8.5,  type:'demon'    },
    { x:40.5, y:13.5, type:'imp'      },
    // Exterior
    { x:10.5, y:20.5, type:'imp'      },
    { x:15.5, y:22.5, type:'cacodemon'},
    { x:22.5, y:19.5, type:'imp'      },
    { x:28.5, y:25.5, type:'demon'    },
    { x:35.5, y:22.5, type:'cacodemon'},
    { x:40.5, y:28.5, type:'imp'      },
    { x:20.5, y:30.5, type:'demon'    },
    { x:30.5, y:31.5, type:'imp'      },
    { x:8.5,  y:28.5, type:'cacodemon'},
    { x:44.5, y:20.5, type:'imp'      },
    { x:42.5, y:32.5, type:'demon'    },
    // Catacumba
    { x:6.5,  y:37.5, type:'imp'      },
    { x:12.5, y:40.5, type:'demon'    },
    { x:20.5, y:39.5, type:'cacodemon'},
    { x:28.5, y:37.5, type:'imp'      },
    { x:36.5, y:40.5, type:'demon'    },
    { x:10.5, y:44.5, type:'imp'      },
    { x:18.5, y:44.5, type:'imp'      },
    // Boss na arena
    { x:40.5, y:44.5, type:'boss'     },
  ]
];

/* ─────────────────────────────────────────────
   TIPOS DE INIMIGO — estilo Doom (soldados humanoides)
   ───────────────────────────────────────────── */
const ENEMY_TYPES = {
  imp: {
    hp: 60, speed: 0.015, detectRange: 12, attackRange: 1.2,
    attackDamage: 10, attackCooldown: 1200,
    color: '#8B2500', size: 0.42, reward: 100,
    // Estilo Doom: soldado com uniforme marrom/laranja
    uniformColor: '#8B4513', skinColor: '#c8956c',
    armorColor: '#5c3317', eyeColor: '#ff2200',
    helmetColor: '#4a2800', variant: 'soldier'
  },
  demon: {
    hp: 120, speed: 0.02, detectRange: 12, attackRange: 1.5,
    attackDamage: 20, attackCooldown: 1500,
    color: '#5A0000', size: 0.52, reward: 200,
    // Soldado heavy em vermelho
    uniformColor: '#8B0000', skinColor: '#a05040',
    armorColor: '#4a0000', eyeColor: '#ffaa00',
    helmetColor: '#550000', variant: 'heavy'
  },
  cacodemon: {
    hp: 200, speed: 0.011, detectRange: 14, attackRange: 4.0,
    attackDamage: 25, attackCooldown: 2000,
    color: '#880000', size: 0.55, reward: 350, ranged: true,
    skinColor: '#cc1100', armorColor: '#440000', eyeColor: '#ffffff',
    variant: 'sphere'
  },
  boss: {
    hp: 1000, speed: 0.018, detectRange: 20, attackRange: 5.0,
    attackDamage: 35, attackCooldown: 1800,
    color: '#220000', size: 0.9, reward: 2000,
    ranged: true, isBoss: true,
    skinColor: '#660000', armorColor: '#110000', eyeColor: '#ff6600',
    uniformColor: '#440000', helmetColor: '#220000', variant: 'boss'
  }
};

/* ─────────────────────────────────────────────
   ARMAS
   ───────────────────────────────────────────── */
const WEAPONS = {
  pistol:     { name: 'PISTOLA',      damage: 25, fireRate: 400,  reloadTime: 1200, magSize: 12, reserveAmmo: 60,  spread: 0.012 },
  shotgun:    { name: 'ESCOPETA',     damage: 18, fireRate: 900,  reloadTime: 2200, magSize: 6,  reserveAmmo: 24,  pellets: 7, spread: 0.09 },
  machinegun: { name: 'METRALHADORA', damage: 12, fireRate: 120,  reloadTime: 2800, magSize: 40, reserveAmmo: 120, spread: 0.025 },
  knife:      { name: 'FACA',         damage: 50, fireRate: 500,  reloadTime: 0,    magSize: 999, reserveAmmo: 999, spread: 0, melee: true, range: 1.5 }
};

/* ─────────────────────────────────────────────
   CONSTANTES
   ───────────────────────────────────────────── */
const FOV        = Math.PI / 3;
const HALF_FOV   = FOV / 2;
const RENDER_RES = 0.75;
const MAX_DEPTH  = 28;
const TEX_SIZE   = 64;

/* ─────────────────────────────────────────────
   ESTADO GLOBAL
   ───────────────────────────────────────────── */
let canvas, ctx, minimapCanvas, minimapCtx;
let WIDTH, HEIGHT;
let currentMap = 0;
let map;
let gameRunning = false;
let gamePaused  = false;
let lastTime    = 0;
let animFrame   = null;
let score       = 0;
let kills       = 0;

const player = {
  x: 3.5, y: 3.5, angle: 0,
  health: 100, maxHealth: 100,
  armor: 0, maxArmor: 100,
  speed: 0.065, runMult: 1.8,
  weapon: 'pistol',
  ammo: 12, reserve: 60,
  reloading: false, reloadTimer: 0,
  shootCooldown: 0,
  dead: false,
  unlocked: { pistol:true, knife:true, shotgun:false, machinegun:false }
};

const keys = { w:false, s:false, a:false, d:false, shift:false };
let enemies   = [];
let particles = [];
const TEXTURES = {};
let zbuffer   = [];
let knifeInspecting = false;
let knifeAngle = 0;
let knifeFlipAnim = 0;
let bossRef = null;
let items = [];

const audioCtx = (window.AudioContext || window.webkitAudioContext)
  ? new (window.AudioContext || window.webkitAudioContext)() : null;

/* ═══════════════════════════════════════════════
   TEXTURAS PROCEDURAIS — mais ricas
═══════════════════════════════════════════════ */
function generateTextures() {
  const make = (draw) => {
    const c = document.createElement('canvas');
    c.width = c.height = TEX_SIZE;
    const x = c.getContext('2d');
    draw(x, c.width, c.height);
    return x.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
  };

  // 1 — tijolo vermelho escuro (interior base)
  TEXTURES[1] = make((ctx, w, h) => {
    ctx.fillStyle = '#2a0e0e'; ctx.fillRect(0,0,w,h);
    const bw=16, bh=8;
    for (let row=0; row<h/bh+1; row++) {
      for (let col=0; col<w/bw+2; col++) {
        const ox = (row%2===0)?0:-bw/2;
        const x=col*bw+ox, y=row*bh;
        const r=70+(col*11+row*7)%35;
        const g=15+(col*5)%12;
        const b=15+(row*3)%8;
        ctx.fillStyle=`rgb(${r},${g},${b})`;
        ctx.fillRect(x+1,y+1,bw-2,bh-2);
        ctx.fillStyle='#0d0404'; ctx.fillRect(x,y,bw,1); ctx.fillRect(x,y,1,bh);
        // Mancha de sangue aleatória
        if((col*3+row*7)%11===0){
          ctx.fillStyle='rgba(120,0,0,0.5)';
          ctx.fillRect(x+3,y+2,6,4);
        }
      }
    }
  });

  // 2 — pilastra pedra cinza
  TEXTURES[2] = make((ctx, w, h) => {
    ctx.fillStyle='#303030'; ctx.fillRect(0,0,w,h);
    const bw=32, bh=16;
    for(let row=0;row<h/bh+1;row++){
      for(let col=0;col<w/bw+2;col++){
        const ox=(row%2===0)?0:-bw/2;
        const bx=col*bw+ox, by=row*bh;
        const shade=45+(row*5+col*3)%25;
        ctx.fillStyle=`rgb(${shade},${shade},${shade})`;
        ctx.fillRect(bx+1,by+1,bw-2,bh-2);
        ctx.fillStyle='#111'; ctx.fillRect(bx,by,bw,1); ctx.fillRect(bx,by,1,bh);
      }
    }
    // Rachaduras
    ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(15,30); ctx.lineTo(12,64); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(48,10); ctx.lineTo(44,40); ctx.lineTo(50,64); ctx.stroke();
  });

  // 3 — metal enferrujado
  TEXTURES[3] = make((ctx, w, h) => {
    ctx.fillStyle='#1e1508'; ctx.fillRect(0,0,w,h);
    const sh=10;
    for(let row=0;row<h/sh+1;row++){
      const y=row*sh;
      ctx.fillStyle=row%2===0?'#2a2010':'#1e1508'; ctx.fillRect(0,y,w,sh);
      ctx.fillStyle='#0a0a04'; ctx.fillRect(0,y+sh-1,w,1);
    }
    // Ferrugem
    for(let i=0;i<15;i++){
      const rx=Math.random()*w, ry=Math.random()*h;
      const rs=2+Math.random()*8;
      ctx.fillStyle=`rgba(${100+Math.random()*40},${30+Math.random()*20},0,0.6)`;
      ctx.beginPath(); ctx.ellipse(rx,ry,rs,rs*0.5,Math.random()*Math.PI,0,Math.PI*2); ctx.fill();
    }
    // Rebites
    for(let r=8;r<h;r+=16) for(let c=8;c<w;c+=16){
      ctx.fillStyle='#444'; ctx.beginPath(); ctx.arc(c,r,2.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#777'; ctx.beginPath(); ctx.arc(c-0.5,r-0.5,1,0,Math.PI*2); ctx.fill();
    }
  });

  // 4 — pedra antiga com runas (catacumba)
  TEXTURES[4] = make((ctx, w, h) => {
    ctx.fillStyle='#12101c'; ctx.fillRect(0,0,w,h);
    const bw=32, bh=16;
    for(let row=0;row<h/bh+1;row++){
      for(let col=0;col<w/bw+2;col++){
        const ox=(row%2===0)?0:-bw/2;
        const bx=col*bw+ox, by=row*bh;
        const shade=22+(row*3+col*5)%14;
        ctx.fillStyle=`rgb(${shade+3},${shade},${shade+10})`;
        ctx.fillRect(bx+1,by+1,bw-2,bh-2);
        ctx.fillStyle='#06040d'; ctx.fillRect(bx,by,bw,1); ctx.fillRect(bx,by,1,bh);
        if((col+row)%4===0){
          ctx.strokeStyle='rgba(120,40,180,0.5)'; ctx.lineWidth=1;
          ctx.strokeRect(bx+4,by+2,bw-8,bh-4);
        }
      }
    }
    ctx.strokeStyle='rgba(160,60,220,0.7)'; ctx.lineWidth=1.5;
    const rune=(rx,ry,sz)=>{
      ctx.beginPath(); ctx.moveTo(rx,ry+sz); ctx.lineTo(rx+sz/2,ry); ctx.lineTo(rx+sz,ry+sz); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx,ry+sz*0.6); ctx.lineTo(rx+sz,ry+sz*0.6); ctx.stroke();
    };
    rune(5,4,10); rune(38,26,8); rune(15,44,12);
  });

  // 5 — pedra externa / rocha do inferno
  TEXTURES[5] = make((ctx, w, h) => {
    ctx.fillStyle='#1a0808'; ctx.fillRect(0,0,w,h);
    // Parede de rocha irregular
    for(let i=0;i<60;i++){
      const rx=Math.random()*w, ry=Math.random()*h;
      const rs=3+Math.random()*12;
      const shade=25+Math.random()*30;
      ctx.fillStyle=`rgb(${shade+8},${shade/2},${shade/3})`;
      ctx.beginPath(); ctx.ellipse(rx,ry,rs,rs*(0.5+Math.random()*0.5),Math.random()*Math.PI,0,Math.PI*2); ctx.fill();
    }
    // Veias de lava
    ctx.strokeStyle='rgba(200,50,0,0.3)'; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(0,10); ctx.quadraticCurveTo(20,20,15,40); ctx.quadraticCurveTo(30,50,20,64); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40,0); ctx.quadraticCurveTo(50,15,44,35); ctx.quadraticCurveTo(55,50,48,64); ctx.stroke();
    // Brilho de lava
    const lavaGrad=ctx.createLinearGradient(0,0,0,h);
    lavaGrad.addColorStop(0,'rgba(200,40,0,0)');
    lavaGrad.addColorStop(0.5,'rgba(255,80,0,0.06)');
    lavaGrad.addColorStop(1,'rgba(200,40,0,0)');
    ctx.fillStyle=lavaGrad; ctx.fillRect(0,0,w,h);
  });

  // 6 — porta tecnológica (metal escuro com detalhes néon)
  TEXTURES[6] = make((ctx, w, h) => {
    const bg = ctx.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#0a1020'); bg.addColorStop(0.5,'#0d1828'); bg.addColorStop(1,'#060e18');
    ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
    const ph=20;
    for(let row=0;row<h/ph+1;row++){
      const y2=row*ph;
      const shade=12+(row*3)%8;
      ctx.fillStyle=`rgb(${shade},${shade+4},${shade+12})`;
      ctx.fillRect(1,y2+1,w-2,ph-2);
      ctx.fillStyle='#0a0d14'; ctx.fillRect(0,y2,w,1);
    }
    ctx.strokeStyle='rgba(0,200,255,0.7)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(8,h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w-8,0); ctx.lineTo(w-8,h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,8); ctx.lineTo(w,8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,h-8); ctx.lineTo(w,h-8); ctx.stroke();
    ctx.fillStyle='rgba(0,180,255,0.12)'; ctx.fillRect(w/2-12,h/2-12,24,24);
    ctx.strokeStyle='rgba(0,220,255,0.9)'; ctx.lineWidth=1;
    ctx.strokeRect(w/2-10,h/2-10,20,20);
    ctx.fillStyle='rgba(0,240,255,0.5)';
    ctx.fillRect(w/2-1,h/2-8,2,16); ctx.fillRect(w/2-8,h/2-1,16,2);
    ctx.fillStyle='#1a2a40';
    [[4,4],[w-4,4],[4,h-4],[w-4,h-4]].forEach(([rx,ry])=>{
      ctx.beginPath(); ctx.arc(rx,ry,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(0,180,255,0.4)'; ctx.beginPath(); ctx.arc(rx,ry,1.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1a2a40';
    });
  });
}

/* ═══════════════════════════════════════════════
   SOM
═══════════════════════════════════════════════ */
function playSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state==='suspended') audioCtx.resume();
  const now=audioCtx.currentTime;
  const g=audioCtx.createGain(); g.connect(audioCtx.destination);
  const osc=audioCtx.createOscillator(); osc.connect(g);
  switch(type){
    case 'shoot': osc.type='sawtooth'; osc.frequency.setValueAtTime(300,now); osc.frequency.exponentialRampToValueAtTime(60,now+0.12); g.gain.setValueAtTime(0.35,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.13); osc.start(now); osc.stop(now+0.14); break;
    case 'shoot_shotgun': { const g2=audioCtx.createGain(); g2.connect(audioCtx.destination); const o2=audioCtx.createOscillator(); o2.connect(g2); osc.type='sawtooth'; osc.frequency.setValueAtTime(180,now); osc.frequency.exponentialRampToValueAtTime(30,now+0.22); g.gain.setValueAtTime(0.45,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.25); osc.start(now); osc.stop(now+0.26); o2.type='square'; o2.frequency.setValueAtTime(90,now); o2.frequency.exponentialRampToValueAtTime(25,now+0.18); g2.gain.setValueAtTime(0.2,now); g2.gain.exponentialRampToValueAtTime(0.001,now+0.2); o2.start(now); o2.stop(now+0.21); break; }
    case 'shoot_machinegun': osc.type='square'; osc.frequency.setValueAtTime(220,now); osc.frequency.exponentialRampToValueAtTime(80,now+0.07); g.gain.setValueAtTime(0.25,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.08); osc.start(now); osc.stop(now+0.09); break;
    case 'knife_slash': osc.type='sawtooth'; osc.frequency.setValueAtTime(800,now); osc.frequency.exponentialRampToValueAtTime(200,now+0.08); g.gain.setValueAtTime(0.2,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.1); osc.start(now); osc.stop(now+0.11); break;
    case 'reload': osc.type='square'; osc.frequency.setValueAtTime(250,now); osc.frequency.setValueAtTime(400,now+0.08); g.gain.setValueAtTime(0.18,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.15); osc.start(now); osc.stop(now+0.16); break;
    case 'hit': osc.type='square'; osc.frequency.setValueAtTime(80,now); osc.frequency.exponentialRampToValueAtTime(40,now+0.1); g.gain.setValueAtTime(0.25,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.12); osc.start(now); osc.stop(now+0.13); break;
    case 'step': osc.type='triangle'; osc.frequency.setValueAtTime(120,now); osc.frequency.exponentialRampToValueAtTime(80,now+0.06); g.gain.setValueAtTime(0.07,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.07); osc.start(now); osc.stop(now+0.08); break;
    case 'die': osc.type='sawtooth'; osc.frequency.setValueAtTime(200,now); osc.frequency.exponentialRampToValueAtTime(30,now+0.4); g.gain.setValueAtTime(0.3,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.42); osc.start(now); osc.stop(now+0.45); break;
    case 'enemy_attack': osc.type='sawtooth'; osc.frequency.setValueAtTime(150,now); osc.frequency.exponentialRampToValueAtTime(50,now+0.18); g.gain.setValueAtTime(0.22,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.2); osc.start(now); osc.stop(now+0.22); break;
    case 'boss_roar': { osc.type='sawtooth'; osc.frequency.setValueAtTime(80,now); osc.frequency.exponentialRampToValueAtTime(20,now+0.5); g.gain.setValueAtTime(0.5,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.55); osc.start(now); osc.stop(now+0.6); const g2=audioCtx.createGain(); g2.connect(audioCtx.destination); const o2=audioCtx.createOscillator(); o2.connect(g2); o2.type='square'; o2.frequency.setValueAtTime(40,now); o2.frequency.exponentialRampToValueAtTime(15,now+0.4); g2.gain.setValueAtTime(0.3,now); g2.gain.exponentialRampToValueAtTime(0.001,now+0.45); o2.start(now); o2.stop(now+0.5); break; }
    case 'item_pickup': osc.type='sine'; osc.frequency.setValueAtTime(600,now); osc.frequency.setValueAtTime(900,now+0.05); osc.frequency.setValueAtTime(1200,now+0.1); g.gain.setValueAtTime(0.15,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.18); osc.start(now); osc.stop(now+0.19); break;
  }
}

/* ═══════════════════════════════════════════════
   INIT
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
  const hudH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hud-h')) || 120;
  canvas.width  = Math.floor(window.innerWidth  * RENDER_RES);
  canvas.height = Math.floor((window.innerHeight - hudH) * RENDER_RES);
  WIDTH  = canvas.width;
  HEIGHT = canvas.height;
  zbuffer = new Float32Array(WIDTH);
}

function findFreeCell(x, y) {
  if (!isWall(x, y, 0.3)) return { x, y };
  for (let r = 1; r <= 5; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const nx = Math.floor(x) + dx + 0.5;
        const ny = Math.floor(y) + dy + 0.5;
        if (!isWall(nx, ny, 0.3)) return { x: nx, y: ny };
      }
    }
  }
  return { x, y };
}

function loadLevel(index) {
  currentMap = index;
  map = MAPS[index];
  const start = MAP_STARTS[index] || MAP_STARTS[0];
  const wpn = WEAPONS[player.weapon];
  Object.assign(player, {
    x: start.x, y: start.y, angle: start.angle,
    health: 100, dead: false,
    ammo: wpn.magSize, reserve: wpn.reserveAmmo,
    reloading: false, shootCooldown: 0
  });
  enemies = MAP_ENEMIES[index].map(e => {
    const pos = findFreeCell(e.x, e.y);
    return {
      ...e, x: pos.x, y: pos.y,
      hp: ENEMY_TYPES[e.type].hp, maxHp: ENEMY_TYPES[e.type].hp,
      state: 'patrol', angle: Math.random()*Math.PI*2,
      attackTimer: 0, patrolTimer: 0,
      patrolDir: Math.random()*Math.PI*2, hitFlash: 0, visible: false
    };
  });
  bossRef = enemies.find(e => e.type === 'boss') || null;
  if (bossRef) updateBossHPBar();
  spawnItems(index);
  particles = [];
  // Inicializar portas tecnológicas
  techDoors = TECH_DOOR_DEFS.map(d => ({
    ...d, open: false, openAmount: 0
  }));
  // Colocar as células das portas no mapa (valor 6)
  for (const d of techDoors) {
    map[d.row][d.col]     = 6;
    map[d.row][d.pairCol] = 6;
  }
  score = 0; kills = 0;
  updateHUD();
  document.getElementById('levelInfo').textContent = 'BASE INFERNAL';
  showLevelMsg('— BASE INFERNAL —');
}

function showLevelMsg(text) {
  const el = document.getElementById('levelMsg');
  el.textContent = text;
  el.classList.remove('hidden');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  setTimeout(() => el.classList.add('hidden'), 3000);
}

/* ═══════════════════════════════════════════════
   ITENS
═══════════════════════════════════════════════ */
function spawnItems(mapIndex) {
  items = [];
  const spawns = [
    [
      { x:6.5,  y:6.5,  type:'ammo'   },
      { x:10.5, y:4.5,  type:'health' },
      { x:16.5, y:4.5,  type:'ammo'   },
      { x:25.5, y:4.5,  type:'health' },
      { x:28.5, y:8.5,  type:'ammo'   },
      { x:38.5, y:8.5,  type:'ammo'   },
      { x:42.5, y:5.5,  type:'health' },
      // Exterior
      { x:12.5, y:22.5, type:'ammo'   },
      { x:18.5, y:28.5, type:'health' },
      { x:25.5, y:20.5, type:'ammo'   },
      { x:35.5, y:30.5, type:'armor'  },
      { x:40.5, y:22.5, type:'ammo'   },
      { x:44.5, y:30.5, type:'health' },
      // Catacumba
      { x:8.5,  y:38.5, type:'health' },
      { x:16.5, y:41.5, type:'ammo'   },
      { x:26.5, y:40.5, type:'armor'  },
      { x:35.5, y:38.5, type:'health' },
      // Armas
      { x:6.5,  y:8.5,  type:'shotgun'    },
      { x:26.5, y:6.5,  type:'machinegun' },
    ]
  ];
  const list = spawns[mapIndex] || [];
  items = list.map(s => {
    const pos = findFreeCell(s.x, s.y);
    return { ...s, x: pos.x, y: pos.y, collected: false };
  });
}

function updateItems() {
  for (const item of items) {
    if (item.collected) continue;
    const dx = player.x - item.x, dy = player.y - item.y;
    if (dx*dx+dy*dy < 0.45) {
      if (item.type === 'ammo') {
        player.reserve = Math.min(player.reserve+20, WEAPONS[player.weapon].reserveAmmo*2);
      } else if (item.type === 'health') {
        if (player.health >= player.maxHealth) continue;
        player.health = Math.min(player.health+25, player.maxHealth);
      } else if (item.type === 'armor') {
        if (player.armor >= player.maxArmor) continue;
        player.armor = Math.min(player.armor+50, player.maxArmor);
      } else if (WEAPONS[item.type]) {
        const already = player.unlocked[item.type];
        player.unlocked[item.type] = true;
        player.weapon = item.type;
        player.ammo = WEAPONS[item.type].magSize;
        player.reserve = WEAPONS[item.type].reserveAmmo;
        if (!already) showLevelMsg(`— ${WEAPONS[item.type].name} ENCONTRADA —`);
      }
      item.collected = true;
      playSound('item_pickup');
      updateHUD();
    }
  }
}

/* ═══════════════════════════════════════════════
   INPUT
═══════════════════════════════════════════════ */
function setupInput() {
  document.addEventListener('keydown', e => {
    if (e.code === 'Escape') { togglePause(); return; }
    if (gamePaused) return;
    switch(e.code){
      case 'KeyW': keys.w=true; break;
      case 'KeyS': keys.s=true; break;
      case 'KeyA': keys.a=true; break;
      case 'KeyD': keys.d=true; break;
      case 'ShiftLeft': case 'ShiftRight': keys.shift=true; break;
      case 'KeyR': if (!player.reloading) reload(); break;
      case 'KeyE': interactDoor(); break;
      case 'Digit1': switchWeapon('pistol'); break;
      case 'Digit2': switchWeapon('shotgun'); break;
      case 'Digit3': switchWeapon('machinegun'); break;
      case 'Digit4': switchWeapon('knife'); break;
      case 'KeyF': toggleKnifeInspect(); break;
    }
  });
  document.addEventListener('keyup', e => {
    switch(e.code){
      case 'KeyW': keys.w=false; break; case 'KeyS': keys.s=false; break;
      case 'KeyA': keys.a=false; break; case 'KeyD': keys.d=false; break;
      case 'ShiftLeft': case 'ShiftRight': keys.shift=false; break;
    }
  });
  document.addEventListener('mousemove', e => {
    if (!gameRunning || gamePaused || document.pointerLockElement !== canvas) return;
    player.angle += e.movementX * 0.0025;
  });
  document.addEventListener('mousedown', e => {
    if (e.button===0 && gameRunning && !gamePaused && document.pointerLockElement===canvas) shoot();
  });
  canvas.addEventListener('click', () => {
    if (gameRunning && !gamePaused) canvas.requestPointerLock();
  });
}

function togglePause() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  const ps = document.getElementById('pauseScreen');
  if (gamePaused) {
    ps.classList.remove('hidden'); document.exitPointerLock();
    document.getElementById('pauseStats').innerHTML = `Mortes: ${kills} &nbsp;|&nbsp; Pontuação: ${score}<br>Vida: ${player.health}`;
  } else {
    ps.classList.add('hidden'); canvas.requestPointerLock();
    lastTime = performance.now();
    animFrame = requestAnimationFrame(gameLoop);
  }
}

function interactDoor() {
  // Verifica se o jogador está perto de uma porta
  for (const door of techDoors) {
    const dc = (door.col + door.pairCol) / 2 + 0.5;
    const dr = door.row + 0.5;
    const dx = player.x - dc, dy = player.y - dr;
    if (Math.sqrt(dx*dx+dy*dy) < 1.8) {
      door.open = !door.open;
      playSound('item_pickup');
      return;
    }
  }
}

function updateDoors(dt) {
  for (const door of techDoors) {
    if (door.open && door.openAmount < 1) {
      door.openAmount = Math.min(1, door.openAmount + DOOR_SPEED * dt);
    } else if (!door.open && door.openAmount > 0) {
      door.openAmount = Math.max(0, door.openAmount - DOOR_SPEED * dt);
    }
    // Atualizar colisão: se aberta o suficiente, remover parede
    if (door.openAmount > 0.5) {
      map[door.row][door.col]     = 0;
      map[door.row][door.pairCol] = 0;
    } else {
      map[door.row][door.col]     = 6;
      map[door.row][door.pairCol] = 6;
    }
  }
}

function toggleKnifeInspect() {
  if (player.weapon !== 'knife' || player.reloading || knifeInspecting) return;
  knifeInspecting = true; knifeFlipAnim = 0;
}

function switchWeapon(name) {
  if (!WEAPONS[name] || player.reloading || !player.unlocked[name]) return;
  player.weapon = name;
  if (name !== 'knife') { player.ammo = WEAPONS[name].magSize; player.reserve = WEAPONS[name].reserveAmmo; }
  player.shootCooldown = 0;
  if (knifeInspecting && name !== 'knife') knifeInspecting = false;
  updateHUD();
}

let stepTimer = 0;
function updatePlayer(dt) {
  if (player.dead) return;
  const spd = player.speed * (keys.shift ? player.runMult : 1);
  const dx = Math.cos(player.angle), dy = Math.sin(player.angle);
  let moving = false;
  if (keys.w) { tryMove(player.x+dx*spd, player.y+dy*spd); moving=true; }
  if (keys.s) { tryMove(player.x-dx*spd, player.y-dy*spd); moving=true; }
  const sx = Math.cos(player.angle+Math.PI/2), sy = Math.sin(player.angle+Math.PI/2);
  if (keys.a) { tryMove(player.x-sx*spd, player.y-sy*spd); moving=true; }
  if (keys.d) { tryMove(player.x+sx*spd, player.y+sy*spd); moving=true; }
  if (moving) { stepTimer -= dt; if (stepTimer<=0) { playSound('step'); stepTimer=keys.shift?280:420; } }
  if (player.reloading) { player.reloadTimer -= dt; if (player.reloadTimer<=0) finishReload(); }
  if (player.shootCooldown>0) player.shootCooldown -= dt;
  updateItems();
  if (knifeInspecting) {
    knifeFlipAnim += dt * 0.006;
    if (knifeFlipAnim >= Math.PI*2) { knifeFlipAnim=0; knifeInspecting=false; }
  }
}

function tryMove(nx, ny) {
  const m = 0.25;
  if (!isWall(nx, player.y, m)) player.x = nx;
  if (!isWall(player.x, ny, m)) player.y = ny;
}

function isWall(x, y, m=0.25) {
  const pts = [[x-m,y-m],[x+m,y-m],[x-m,y+m],[x+m,y+m]];
  for (const [px,py] of pts) {
    if (map[Math.floor(py)]?.[Math.floor(px)]) return true;
  }
  return false;
}

/* ═══════════════════════════════════════════════
   INIMIGOS
═══════════════════════════════════════════════ */
function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.state==='dead') continue;
    if (e.hitFlash>0) e.hitFlash -= dt;
    const def = ENEMY_TYPES[e.type];
    const dx = player.x - e.x, dy = player.y - e.y;
    const dist = Math.sqrt(dx*dx+dy*dy);
    if (e.state==='patrol') {
      e.patrolTimer -= dt;
      if (e.patrolTimer<=0) { e.patrolDir=Math.random()*Math.PI*2; e.patrolTimer=800+Math.random()*1200; }
      const pdx=Math.cos(e.patrolDir)*def.speed, pdy=Math.sin(e.patrolDir)*def.speed;
      if (!isWall(e.x+pdx,e.y+pdy,0.3)) { e.x+=pdx; e.y+=pdy; } else e.patrolTimer=0;
      if (dist<def.detectRange && hasLineOfSight(e,player)) {
        e.state='chase';
        if (def.isBoss) { playSound('boss_roar'); showLevelMsg('— CHEFE DESPERTADO —'); }
      }
    } else if (e.state==='chase') {
      if (dist < def.attackRange) { e.state='attack'; }
      else {
        const spd = def.speed * (def.isBoss ? 1.6 : 1.4);
        const mx=(dx/dist)*spd, my=(dy/dist)*spd;
        if (!isWall(e.x+mx,e.y,0.3)) e.x+=mx;
        if (!isWall(e.x,e.y+my,0.3)) e.y+=my;
      }
    } else if (e.state==='attack') {
      e.attackTimer -= dt;
      if (e.attackTimer<=0) {
        e.attackTimer = def.attackCooldown;
        if (!player.dead) {
          const canHit = def.ranged ? hasLineOfSight(e,player) : dist < def.attackRange*1.2;
          if (canHit) { applyDamage(def.attackDamage); playSound('enemy_attack'); flashDamage(); }
        }
      }
      if (dist > def.attackRange*1.5) e.state='chase';
    }
    e.screenAngle = Math.atan2(dy,dx);
  }
}

function applyDamage(dmg) {
  if (player.armor > 0) { const abs=Math.min(player.armor,dmg*0.6); player.armor-=abs; dmg-=abs; }
  player.health -= dmg;
  if (player.health <= 0) triggerDeath();
}

function hasLineOfSight(from, to) {
  const dx=to.x-from.x, dy=to.y-from.y;
  const dist=Math.sqrt(dx*dx+dy*dy);
  const steps=Math.ceil(dist*8);
  for (let i=1;i<steps;i++){
    const t=i/steps;
    if (map[Math.floor(from.y+dy*t)]?.[Math.floor(from.x+dx*t)]) return false;
  }
  return true;
}

function shoot() {
  if (player.dead || player.reloading || player.shootCooldown>0) return;
  const wpn = WEAPONS[player.weapon];
  if (wpn.melee) {
    player.shootCooldown = wpn.fireRate;
    playSound('knife_slash');
    for (const e of enemies) {
      if (e.state==='dead') continue;
      const dx=e.x-player.x, dy=e.y-player.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if (dist < wpn.range) {
        const angle=Math.atan2(dy,dx)-player.angle;
        const norm=Math.atan2(Math.sin(angle),Math.cos(angle));
        if (Math.abs(norm)<0.7 && hasLineOfSight(player,e)){
          e.hp -= wpn.damage; e.hitFlash=120;
          spawnParticles(e.x,e.y);
          if (e.hp<=0) killEnemy(e); else if (e.state==='patrol') e.state='chase';
        }
      }
    }
    return;
  }
  if (player.ammo<=0) { reload(); return; }
  player.ammo--; player.shootCooldown = wpn.fireRate;
  const soundMap = { pistol:'shoot', shotgun:'shoot_shotgun', machinegun:'shoot_machinegun' };
  playSound(soundMap[player.weapon]||'shoot');
  updateHUD();
  ctx.save(); ctx.fillStyle='rgba(255,200,50,0.15)'; ctx.fillRect(0,0,WIDTH,HEIGHT); ctx.restore();
  const pellets = wpn.pellets||1;
  for (let p=0;p<pellets;p++) {
    const spread=(Math.random()-0.5)*wpn.spread;
    const rayAngle=player.angle+spread;
    let hitDist=MAX_DEPTH, hitEnemy=null;
    for (const e of enemies) {
      if (e.state==='dead') continue;
      const ex=e.x-player.x, ey=e.y-player.y;
      const dist=Math.sqrt(ex*ex+ey*ey);
      const angle=Math.atan2(ey,ex)-rayAngle;
      const normAngle=Math.atan2(Math.sin(angle),Math.cos(angle));
      const size=ENEMY_TYPES[e.type].size;
      if (Math.abs(normAngle)<size/dist && dist<hitDist) { hitDist=dist; hitEnemy=e; }
    }
    if (hitEnemy && !hasLineOfSight(player,hitEnemy)) hitEnemy=null;
    if (hitEnemy) {
      hitEnemy.hp -= wpn.damage; hitEnemy.hitFlash=120;
      playSound('hit'); spawnParticles(hitEnemy.x,hitEnemy.y);
      if (hitEnemy.hp<=0) killEnemy(hitEnemy);
      else if (hitEnemy.state==='patrol') hitEnemy.state='chase';
      if (hitEnemy===bossRef) updateBossHPBar();
    }
  }
  if (player.ammo===0 && player.reserve>0) reload();
}

function reload() {
  if (player.reloading) return;
  const wpn = WEAPONS[player.weapon];
  if (wpn.melee || player.ammo===wpn.magSize || player.reserve===0) return;
  player.reloading=true; player.reloadTimer=wpn.reloadTime;
  document.getElementById('reloadMsg').classList.remove('hidden');
  playSound('reload');
}

function finishReload() {
  const wpn=WEAPONS[player.weapon];
  const needed=wpn.magSize-player.ammo;
  const taken=Math.min(needed,player.reserve);
  player.ammo+=taken; player.reserve-=taken;
  player.reloading=false;
  document.getElementById('reloadMsg').classList.add('hidden');
  updateHUD();
}

function killEnemy(e) {
  e.state='dead'; playSound('die');
  kills++; score += ENEMY_TYPES[e.type].reward;
  document.getElementById('killCount').textContent = kills;
  spawnParticles(e.x,e.y,12);
  if (e===bossRef) { bossRef=null; document.getElementById('bossHPBar').classList.add('hidden'); showLevelMsg('— CHEFE DERROTADO! VITÓRIA! —'); }
  const alive = enemies.filter(en => en.state!=='dead');
  if (alive.length===0) showLevelMsg('— TODOS ELIMINADOS! —');
}

function spawnParticles(wx, wy, count=5) {
  for (let i=0;i<count;i++){
    particles.push({
      wx, wy,
      vx:(Math.random()-0.5)*0.04, vy:(Math.random()-0.5)*0.04,
      life:300+Math.random()*300, maxLife:600,
      size:2+Math.random()*3,
      color:`hsl(${10+Math.random()*30},90%,50%)`
    });
  }
}

function updateParticles(dt) {
  for (let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.wx+=p.vx; p.wy+=p.vy; p.life-=dt;
    if (p.life<=0) particles.splice(i,1);
  }
}

function triggerDeath() {
  if (player.dead) return;
  player.dead=true; player.health=0; gameRunning=false; playSound('die'); updateHUD();
  setTimeout(() => {
    document.getElementById('finalScore').textContent = `Mortes: ${kills}  |  Pontuação: ${score}`;
    document.getElementById('gameOverScreen').classList.remove('hidden');
  }, 1200);
}

function flashDamage() {
  const el=document.getElementById('damageIndicator');
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 150);
  updateHUD();
}

function updateBossHPBar() {
  if (!bossRef) return;
  document.getElementById('bossHPBar').classList.remove('hidden');
  document.getElementById('bossName').textContent = '⚠ SENHOR DO INFERNO ⚠';
  document.getElementById('bossHP').style.width = Math.max(0,(bossRef.hp/bossRef.maxHp)*100)+'%';
}

/* ═══════════════════════════════════════════════
   RAYCASTING MELHORADO
═══════════════════════════════════════════════ */
function castRays() {
  const imgData = ctx.createImageData(WIDTH, HEIGHT);
  const data = imgData.data;

  // Determinar zona do jogador (para escolher cores de piso/teto)
  const playerZone = getZoneForPos(player.x, player.y);

  // ─── Floor/Ceiling casting real (perspectiva correta) ───────────
  const posX = player.x, posY = player.y;
  const dirX = Math.cos(player.angle), dirY = Math.sin(player.angle);
  const planeX = -dirY * 0.57735, planeY = dirX * 0.57735; // tan(FOV/2) ≈ 0.577

  const halfH = HEIGHT >> 1;

  for (let y = 0; y < HEIGHT; y++) {
    const isCeiling = y < halfH;
    const rowDir = isCeiling ? -1 : 1;
    const rowRelY = isCeiling ? (halfH - y) : (y - halfH);
    if (rowRelY === 0) continue;
    const rowDist = halfH / rowRelY;

    const floorX_step = rowDist * (2 * planeX) / WIDTH;
    const floorY_step = rowDist * (2 * planeY) / WIDTH;
    let floorX = posX + rowDist * (dirX - planeX);
    let floorY = posY + rowDist * (dirY - planeY);

    const fog = Math.min(1, rowDist / 18);

    for (let x = 0; x < WIDTH; x++) {
      const cellX = Math.floor(floorX), cellY = Math.floor(floorY);
      const tx = Math.floor((floorX - cellX) * TEX_SIZE) & (TEX_SIZE - 1);
      const ty = Math.floor((floorY - cellY) * TEX_SIZE) & (TEX_SIZE - 1);

      const cellZone = getZoneForRow(cellY);
      const idx = (y * WIDTH + x) * 4;

      if (isCeiling) {
        // Teto: varia por zona
        if (cellZone === 1) {
          // EXTERIOR — céu vermelho infernal
          const skyGrad = y / halfH; // 0 no topo, 1 no meio
          const skyR = Math.floor(60 + skyGrad * 80);
          const skyG = Math.floor(5 + skyGrad * 10);
          const skyB = Math.floor(5);
          // Nuvens de fumaça
          const nx = (x * 0.02 + floorX * 0.3);
          const nz = (y * 0.03 + floorY * 0.3);
          const cloud = Math.abs(Math.sin(nx) * Math.cos(nz) * Math.sin(nx*0.7+0.5)) * 0.3;
          data[idx]   = Math.min(255, skyR + cloud * 60);
          data[idx+1] = Math.max(0, skyG - cloud * 5);
          data[idx+2] = Math.max(0, skyB);
          data[idx+3] = 255;
        } else if (cellZone === 2) {
          // CATACUMBA — teto muito escuro roxo
          const r = Math.floor(8 * (1 - fog));
          const g = Math.floor(4 * (1 - fog));
          const b = Math.floor(15 * (1 - fog));
          data[idx]=r; data[idx+1]=g; data[idx+2]=b; data[idx+3]=255;
        } else {
          // Interior — teto pedra escura
          const r = Math.floor(18 * (1 - fog));
          const g = Math.floor(10 * (1 - fog));
          const b = Math.floor(10 * (1 - fog));
          data[idx]=r; data[idx+1]=g; data[idx+2]=b; data[idx+3]=255;
        }
      } else {
        // Piso: varia por zona
        if (cellZone === 1) {
          // EXTERIOR — terra vermelha vulcânica
          const tex = TEXTURES[5] || TEXTURES[1];
          const tIdx = (ty * TEX_SIZE + tx) * 4;
          const mult = (1 - fog) * 0.65;
          data[idx]   = Math.floor(tex.data[tIdx]   * mult + 30 * (1-fog));
          data[idx+1] = Math.floor(tex.data[tIdx+1] * mult * 0.4);
          data[idx+2] = Math.floor(tex.data[tIdx+2] * mult * 0.2);
          data[idx+3] = 255;
        } else if (cellZone === 2) {
          // CATACUMBA — pedra escura
          const tex = TEXTURES[4];
          const tIdx = (ty * TEX_SIZE + tx) * 4;
          const mult = (1 - fog) * 0.4;
          data[idx]   = Math.floor(tex.data[tIdx]   * mult);
          data[idx+1] = Math.floor(tex.data[tIdx+1] * mult);
          data[idx+2] = Math.floor(tex.data[tIdx+2] * mult + 8*(1-fog));
          data[idx+3] = 255;
        } else {
          // Interior — piso de pedra avermelhada
          const tex = TEXTURES[1];
          const tIdx = (ty * TEX_SIZE + tx) * 4;
          const mult = (1 - fog) * 0.5;
          data[idx]   = Math.floor(tex.data[tIdx]   * mult * 0.8 + 15*(1-fog));
          data[idx+1] = Math.floor(tex.data[tIdx+1] * mult * 0.5);
          data[idx+2] = Math.floor(tex.data[tIdx+2] * mult * 0.3);
          data[idx+3] = 255;
        }
      }

      floorX += floorX_step;
      floorY += floorY_step;
    }
  }

  // ─── Wall casting DDA ────────────────────────────────────────
  for (let col = 0; col < WIDTH; col++) {
    const rayAngle = player.angle - HALF_FOV + (col/WIDTH)*FOV;
    const cosA = Math.cos(rayAngle), sinA = Math.sin(rayAngle);
    let mapX = Math.floor(player.x), mapY = Math.floor(player.y);
    const deltaX = Math.abs(1/cosA), deltaY = Math.abs(1/sinA);
    let stepX, sideDistX, stepY, sideDistY;
    if (cosA<0) { stepX=-1; sideDistX=(player.x-mapX)*deltaX; }
    else         { stepX= 1; sideDistX=(mapX+1-player.x)*deltaX; }
    if (sinA<0) { stepY=-1; sideDistY=(player.y-mapY)*deltaY; }
    else         { stepY= 1; sideDistY=(mapY+1-player.y)*deltaY; }
    let hit=0, side=0, wallType=1, wallHitX=0;
    let safety=0;
    while (!hit && safety++<200) {
      if (sideDistX<sideDistY) { sideDistX+=deltaX; mapX+=stepX; side=0; }
      else                      { sideDistY+=deltaY; mapY+=stepY; side=1; }
      const cell=map[mapY]?.[mapX]??1;
      if (cell>0) { hit=1; wallType=cell; }
    }
    let wallDist;
    if (side===0) { wallDist=(mapX-player.x+(1-stepX)/2)/cosA; wallHitX=player.y+wallDist*sinA; }
    else           { wallDist=(mapY-player.y+(1-stepY)/2)/sinA; wallHitX=player.x+wallDist*cosA; }
    wallHitX -= Math.floor(wallHitX);
    zbuffer[col] = wallDist;

    const lineH = Math.floor(HEIGHT/wallDist);
    const drawS = Math.max(0, Math.floor(halfH - lineH/2));
    const drawE = Math.min(HEIGHT-1, Math.floor(halfH + lineH/2));

    const tex = TEXTURES[wallType] || TEXTURES[1];
    let texX = Math.floor(wallHitX * TEX_SIZE);
    if ((side===0&&cosA>0)||(side===1&&sinA<0)) texX=TEX_SIZE-texX-1;
    texX = Math.max(0, Math.min(TEX_SIZE-1, texX));

    // Sombra lateral mais pronunciada para dar volume
    const shade = side===1 ? 0.48 : 0.88;
    // Fog por zona: exterior tem fog vermelho, catacumba tem fog roxo
    const wallZone = getZoneForRow(mapY);
    const fogFac = Math.max(0, 1 - wallDist / MAX_DEPTH);

    for (let y=drawS; y<=drawE; y++) {
      const texY = Math.floor(((y-drawS)/(drawE-drawS+1))*TEX_SIZE);
      const tIdx = (texY*TEX_SIZE+texX)*4;
      const pIdx = (y*WIDTH+col)*4;
      let r = tex.data[tIdx  ]*shade*fogFac;
      let g = tex.data[tIdx+1]*shade*fogFac;
      let b = tex.data[tIdx+2]*shade*fogFac;
      // Tint por zona
      if (wallZone === 1) { r = r*1.1 + 8*fogFac; g = g*0.5; b = b*0.3; }      // exterior: tint vermelho
      else if (wallZone === 2) { r = r*0.7; g = g*0.5; b = b*1.1 + 5*fogFac; } // catacumba: tint roxo
      data[pIdx  ] = Math.min(255, r);
      data[pIdx+1] = Math.min(255, g);
      data[pIdx+2] = Math.min(255, b);
      data[pIdx+3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Adicionar nuvens de fumaça no exterior (overlay)
  if (playerZone === 1) {
    const t = Date.now() / 8000;
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const cx2 = ((i * 0.23 + t) % 1.2 - 0.1) * WIDTH;
      const cy2 = HEIGHT * (0.05 + i * 0.06);
      const r = 30 + i * 15;
      const grad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r);
      grad.addColorStop(0, 'rgba(80,20,10,0.18)');
      grad.addColorStop(1, 'rgba(80,20,10,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════
   SPRITES — estilo Doom (soldados humanoides)
═══════════════════════════════════════════════ */
function drawSprites() {
  const spriteList = enemies
    .filter(e => e.state!=='dead')
    .map(e => { const dx=e.x-player.x,dy=e.y-player.y; return {e,dist:dx*dx+dy*dy}; })
    .sort((a,b)=>b.dist-a.dist);

  for (const {e,dist} of spriteList) {
    const dx=e.x-player.x, dy=e.y-player.y;
    const trueDist=Math.sqrt(dist);
    const spriteAngle=Math.atan2(dy,dx)-player.angle;
    const normAngle=Math.atan2(Math.sin(spriteAngle),Math.cos(spriteAngle));
    if (Math.abs(normAngle)>FOV) continue;

    const screenX=Math.floor((0.5+normAngle/FOV)*WIDTH);
    const def=ENEMY_TYPES[e.type];
    const spriteH=Math.abs(Math.floor(HEIGHT/trueDist));
    const spriteW=Math.floor(spriteH * (def.isBoss ? 1.2 : 0.95));
    const drawY=Math.floor(HEIGHT/2-spriteH/2);
    const drawX=screenX-Math.floor(spriteW/2);
    if (spriteW<=0||spriteH<=0) continue;

    const fog=Math.max(0,1-trueDist/MAX_DEPTH);
    const isHit=e.hitFlash>0;

    const sc=document.createElement('canvas');
    sc.width=spriteW; sc.height=spriteH;
    const sx=sc.getContext('2d');

    if (isHit) {
      sx.globalAlpha=0.85;
      sx.fillStyle='#ffffff';
      sx.fillRect(0,0,spriteW,spriteH);
    } else {
      drawEnemySpriteDoom(sx, e, def, spriteW, spriteH);
      // Sombra direcional lateral
      const shade=sx.createLinearGradient(0,0,spriteW,0);
      shade.addColorStop(0,'rgba(255,180,100,0.04)');
      shade.addColorStop(0.4,'rgba(0,0,0,0)');
      shade.addColorStop(1,'rgba(0,0,0,0.5)');
      sx.fillStyle=shade; sx.fillRect(0,0,spriteW,spriteH);
      // Sombra no chão
      sx.fillStyle='rgba(0,0,0,0.35)';
      sx.beginPath(); sx.ellipse(spriteW/2, spriteH*0.975, spriteW*0.35, spriteH*0.04, 0, 0, Math.PI*2); sx.fill();
    }

    for (let col=0;col<spriteW;col++){
      const screenCol=drawX+col;
      if (screenCol<0||screenCol>=WIDTH) continue;
      if (zbuffer[screenCol]<=trueDist) continue;
      ctx.save();
      ctx.globalAlpha=fog;
      ctx.drawImage(sc, col, 0, 1, spriteH, screenCol, drawY, 1, spriteH);
      ctx.restore();
    }

    if (trueDist<8&&e.hp<e.maxHp){
      const barW=def.isBoss?Math.min(spriteW,80):Math.min(spriteW,40);
      const barX=screenX-Math.floor(barW/2);
      const barY=drawY-8;
      ctx.fillStyle='#440000'; ctx.fillRect(barX,barY,barW,4);
      ctx.fillStyle=def.isBoss?'#ff6600':'#cc2200';
      ctx.fillRect(barX,barY,Math.floor(barW*(e.hp/e.maxHp)),4);
    }
  }

  // Itens
  for (const item of items){
    if (item.collected) continue;
    const dx=item.x-player.x, dy=item.y-player.y;
    const trueDist=Math.sqrt(dx*dx+dy*dy);
    if (trueDist>MAX_DEPTH) continue;
    const angle=Math.atan2(dy,dx)-player.angle;
    const norm=Math.atan2(Math.sin(angle),Math.cos(angle));
    if (Math.abs(norm)>HALF_FOV) continue;
    const sx2=Math.floor((0.5+norm/FOV)*WIDTH);
    if (zbuffer[sx2]<=trueDist) continue;
    const sz=Math.floor(HEIGHT/trueDist*0.2);
    const sy=Math.floor(HEIGHT/2+sz*0.4);
    const pulse=0.5+0.5*Math.sin(Date.now()/300);
    ctx.save();
    ctx.globalAlpha=Math.max(0,1-trueDist/MAX_DEPTH);
    ctx.translate(sx2, sy+sz/2);
    if (item.type==='health') {
      ctx.shadowColor='#33ff66'; ctx.shadowBlur=10*pulse;
      ctx.fillStyle='#1c5a33'; ctx.beginPath(); ctx.arc(0,0,sz*0.55,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#33ff66'; ctx.fillRect(-sz*0.08,-sz*0.3,sz*0.16,sz*0.6); ctx.fillRect(-sz*0.3,-sz*0.08,sz*0.6,sz*0.16);
    } else if (item.type==='ammo') {
      ctx.shadowColor='#ffdd00'; ctx.shadowBlur=8*pulse;
      for(let i=-1;i<=1;i++){ const ox=i*sz*0.3; ctx.fillStyle='#caa23a'; ctx.fillRect(ox-sz*0.07,-sz*0.32,sz*0.14,sz*0.5); ctx.fillStyle='#ffdd55'; ctx.beginPath(); ctx.moveTo(ox-sz*0.07,-sz*0.32); ctx.lineTo(ox+sz*0.07,-sz*0.32); ctx.lineTo(ox,-sz*0.55); ctx.closePath(); ctx.fill(); }
    } else if (item.type==='armor') {
      ctx.shadowColor='#3399ff'; ctx.shadowBlur=10*pulse;
      ctx.fillStyle='#1f4f8f'; ctx.beginPath(); ctx.moveTo(-sz*0.4,-sz*0.5); ctx.lineTo(sz*0.4,-sz*0.5); ctx.lineTo(sz*0.5,sz*0.5); ctx.lineTo(-sz*0.5,sz*0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#3399ff'; ctx.fillRect(-sz*0.08,-sz*0.45,sz*0.16,sz*0.9);
    } else if (WEAPONS[item.type]) {
      ctx.shadowColor='#e67e22'; ctx.shadowBlur=10*pulse;
      ctx.fillStyle='#999'; ctx.fillRect(-sz*0.5,-sz*0.1,sz,sz*0.2);
      ctx.fillStyle='#666'; ctx.fillRect(-sz*0.12,sz*0.05,sz*0.2,sz*0.4);
      ctx.fillStyle='#e67e22'; ctx.font=`bold ${Math.max(8,Math.floor(sz*0.4))}px Courier New`; ctx.textAlign='center'; ctx.fillText(WEAPONS[item.type].name[0],0,-sz*0.6);
    }
    ctx.restore();
  }

  // Partículas
  for (const p of particles){
    const dx=p.wx-player.x, dy=p.wy-player.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    if (dist>MAX_DEPTH) continue;
    const a=Math.atan2(dy,dx)-player.angle;
    const n=Math.atan2(Math.sin(a),Math.cos(a));
    if (Math.abs(n)>HALF_FOV) continue;
    const sx2=Math.floor((0.5+n/FOV)*WIDTH);
    const fog2=Math.max(0,1-dist/MAX_DEPTH);
    const ph=Math.floor(p.size/dist*HEIGHT*0.1);
    const py=Math.floor(HEIGHT/2-ph/2);
    if (zbuffer[sx2]>dist){
      ctx.save(); ctx.globalAlpha=(p.life/p.maxLife)*fog2; ctx.fillStyle=p.color;
      ctx.fillRect(sx2,py,Math.max(1,ph),Math.max(1,ph)); ctx.restore();
    }
  }
}

/* ─────────────────────────────────────────────
   Sprites estilo Doom — soldados humanoides com uniforme
   ───────────────────────────────────────────── */
function drawEnemySpriteDoom(sx, e, def, W, H) {
  const t = Date.now() / 180;
  const isMoving = e.state==='chase' || e.state==='attack';
  const isAttacking = e.state === 'attack';
  const walkBob = isMoving ? Math.sin(t) * (H * 0.025) : 0;
  const armSwing = isMoving ? Math.sin(t) * (W * 0.06) : 0;
  const breathe = Math.sin(t * 0.3) * H * 0.005;

  if (def.variant === 'sphere') {
    // Cacodemon — esfera flutuante com cara muito mais detalhada
    const gy = H * 0.50 + Math.sin(t * 0.4) * (H * 0.035) + breathe;
    const radius = W * 0.42;

    // Brilho exterior
    const glowGrad = sx.createRadialGradient(W/2, gy, radius*0.7, W/2, gy, radius*1.4);
    glowGrad.addColorStop(0,'rgba(200,30,0,0.3)');
    glowGrad.addColorStop(1,'rgba(200,30,0,0)');
    sx.fillStyle = glowGrad;
    sx.beginPath(); sx.arc(W/2, gy, radius*1.4, 0, Math.PI*2); sx.fill();

    // Corpo esférico com gradiente rico
    const grad = sx.createRadialGradient(W/2-radius*0.28, gy-radius*0.28, radius*0.04, W/2, gy, radius);
    grad.addColorStop(0, '#ff6644');
    grad.addColorStop(0.25, '#dd2200');
    grad.addColorStop(0.6, def.skinColor);
    grad.addColorStop(0.85, '#440000');
    grad.addColorStop(1, '#110000');
    sx.fillStyle = grad;
    sx.beginPath(); sx.arc(W/2, gy, radius, 0, Math.PI*2); sx.fill();

    // Veias/textura na pele
    sx.strokeStyle='rgba(80,0,0,0.5)'; sx.lineWidth=W*0.012;
    for(let vi=0;vi<4;vi++){
      const va=vi*Math.PI/2 + 0.3;
      sx.beginPath();
      sx.moveTo(W/2+Math.cos(va)*radius*0.2, gy+Math.sin(va)*radius*0.2);
      sx.quadraticCurveTo(W/2+Math.cos(va+0.4)*radius*0.6,gy+Math.sin(va+0.4)*radius*0.6,
                          W/2+Math.cos(va+0.2)*radius*0.85,gy+Math.sin(va+0.2)*radius*0.85);
      sx.stroke();
    }

    // Highlight especular
    sx.fillStyle='rgba(255,200,180,0.22)';
    sx.beginPath(); sx.ellipse(W/2-radius*0.22, gy-radius*0.28, radius*0.28, radius*0.18, -0.5, 0, Math.PI*2); sx.fill();

    // Olhos grandes com íris detalhada
    const er = radius * 0.24;
    const eo = radius * 0.30;
    [[-eo, -radius*0.10],[eo, -radius*0.10]].forEach(([ox,oy])=>{
      // Esclera
      const eg = sx.createRadialGradient(W/2+ox*0.85,gy+oy-er*0.1,0,W/2+ox,gy+oy,er);
      eg.addColorStop(0,'#ffffff'); eg.addColorStop(0.6,'#eeeeee'); eg.addColorStop(1,'#cccccc');
      sx.fillStyle=eg; sx.beginPath(); sx.arc(W/2+ox,gy+oy,er,0,Math.PI*2); sx.fill();
      // Íris vermelha
      const iris = sx.createRadialGradient(W/2+ox,gy+oy,0,W/2+ox,gy+oy,er*0.6);
      iris.addColorStop(0,'#ff2200'); iris.addColorStop(0.5,'#cc0000'); iris.addColorStop(1,'#660000');
      sx.fillStyle=iris; sx.beginPath(); sx.arc(W/2+ox,gy+oy,er*0.6,0,Math.PI*2); sx.fill();
      // Pupila
      sx.fillStyle='#050000'; sx.beginPath(); sx.arc(W/2+ox+er*0.05,gy+oy+er*0.05,er*0.28,0,Math.PI*2); sx.fill();
      // Reflexo
      sx.fillStyle='rgba(255,255,255,0.85)'; sx.beginPath(); sx.arc(W/2+ox-er*0.18,gy+oy-er*0.22,er*0.12,0,Math.PI*2); sx.fill();
      sx.fillStyle='rgba(255,255,255,0.4)'; sx.beginPath(); sx.arc(W/2+ox+er*0.1,gy+oy-er*0.05,er*0.06,0,Math.PI*2); sx.fill();
    });

    // Boca rasgada
    sx.fillStyle='#0a0000';
    sx.beginPath(); sx.arc(W/2, gy+radius*0.35, radius*0.42, 0.1, Math.PI-0.1); sx.fill();
    // Lábio superior com gengiva sangrando
    sx.fillStyle='#330000';
    sx.beginPath(); sx.arc(W/2, gy+radius*0.35, radius*0.42, Math.PI, Math.PI*2); sx.fill();
    // Dentes superiores e inferiores
    sx.fillStyle='#e8d8c0';
    const toothCount=7;
    for(let i=0;i<toothCount;i++){
      const tx2 = W/2 - radius*0.38 + i*(radius*0.76/toothCount) + radius*0.04;
      const tW2 = radius*0.075, tH=radius*0.16;
      // Dente superior
      sx.beginPath(); sx.moveTo(tx2,gy+radius*0.20); sx.lineTo(tx2+tW2,gy+radius*0.20); sx.lineTo(tx2+tW2/2,gy+radius*0.20+tH); sx.closePath(); sx.fill();
      // Dente inferior
      sx.fillStyle='#d8c8b0';
      sx.beginPath(); sx.moveTo(tx2+tW2*0.15,gy+radius*0.56); sx.lineTo(tx2+tW2*0.85,gy+radius*0.56); sx.lineTo(tx2+tW2*0.5,gy+radius*0.56-tH*0.7); sx.closePath(); sx.fill();
      sx.fillStyle='#e8d8c0';
    }
    // Língua
    sx.fillStyle='#aa1100';
    sx.beginPath(); sx.ellipse(W/2, gy+radius*0.42, radius*0.2, radius*0.1, 0, 0, Math.PI*2); sx.fill();

    // Tentáculos por baixo com mais detalhe
    sx.strokeStyle='#660000'; sx.lineWidth=W*0.032;
    for(let i=0;i<5;i++){
      const tx2=W/2-radius*0.35+i*(radius*0.175);
      const cp1x=tx2+Math.sin(t*0.8+i*1.2)*W*0.07;
      sx.strokeStyle=`rgba(${80+i*10},0,0,0.9)`; sx.lineWidth=W*(0.04-i*0.003);
      sx.beginPath(); sx.moveTo(tx2,gy+radius*0.92);
      sx.quadraticCurveTo(cp1x,gy+radius*1.15,tx2+Math.sin(t+i)*W*0.05,gy+radius*1.4); sx.stroke();
      // Ponta do tentáculo
      sx.fillStyle='#550000'; sx.beginPath(); sx.arc(tx2+Math.sin(t+i)*W*0.05,gy+radius*1.4,W*0.02,0,Math.PI*2); sx.fill();
    }
    return;
  }

  if (def.isBoss) {
    drawBossSprite(sx, e, def, W, H, t, walkBob, armSwing);
    return;
  }

  // ─── Soldado humanoide MUITO mais detalhado ─────────────────────────
  const cx = W / 2;
  const baseY = H * 0.87 + walkBob + breathe;
  const isHeavy = def.variant === 'heavy';

  // === SOMBRA NO CHÃO ===
  sx.fillStyle = 'rgba(0,0,0,0.4)';
  sx.beginPath(); sx.ellipse(cx, baseY+H*0.01, W*(isHeavy?0.24:0.20), H*0.025, 0, 0, Math.PI*2); sx.fill();

  // === PERNAS ===
  const legW = W * (isHeavy ? 0.135 : 0.115);
  const legH = H * (isHeavy ? 0.26 : 0.23);
  const legY = baseY - legH;
  const legSwingL = isMoving ? Math.sin(t) * W * 0.045 : 0;
  const legSwingR = isMoving ? Math.sin(t + Math.PI) * W * 0.045 : 0;
  const lLX = cx - W * (isHeavy ? 0.185 : 0.155) + legSwingL;
  const rLX = cx + W * (isHeavy ? 0.05 : 0.04) + legSwingR;

  // Calça com gradiente
  const pantColor = isHeavy ? '#6a0000' : '#5a3510';
  const pantGrad = sx.createLinearGradient(lLX, legY, lLX+legW, legY+legH);
  pantGrad.addColorStop(0, shadeColor(pantColor, 1.2));
  pantGrad.addColorStop(1, shadeColor(pantColor, 0.5));

  // Perna esquerda
  sx.fillStyle = pantGrad;
  sx.fillRect(lLX, legY, legW, legH * 0.52);
  // Vinco da calça
  sx.fillStyle = 'rgba(0,0,0,0.3)';
  sx.fillRect(lLX+legW*0.48, legY, legW*0.06, legH*0.5);
  // Perna direita
  const pantGrad2 = sx.createLinearGradient(rLX, legY, rLX+legW, legY+legH);
  pantGrad2.addColorStop(0, shadeColor(pantColor, 1.15));
  pantGrad2.addColorStop(1, shadeColor(pantColor, 0.45));
  sx.fillStyle = pantGrad2;
  sx.fillRect(rLX, legY, legW, legH * 0.52);
  sx.fillStyle = 'rgba(0,0,0,0.25)';
  sx.fillRect(rLX+legW*0.48, legY, legW*0.06, legH*0.5);

  // Joelhos com proteção (cúpula 3D)
  const kneeGrad = sx.createRadialGradient(lLX+legW*0.4, legY+legH*0.45, 0, lLX+legW/2, legY+legH*0.48, W*0.05);
  kneeGrad.addColorStop(0, '#555555'); kneeGrad.addColorStop(1, '#1a1a1a');
  sx.fillStyle = kneeGrad;
  sx.beginPath(); sx.arc(lLX+legW/2, legY+legH*0.48, W*0.038, 0, Math.PI*2); sx.fill();
  const kneeGrad2 = sx.createRadialGradient(rLX+legW*0.4, legY+legH*0.45, 0, rLX+legW/2, legY+legH*0.48, W*0.05);
  kneeGrad2.addColorStop(0, '#555555'); kneeGrad2.addColorStop(1, '#1a1a1a');
  sx.fillStyle = kneeGrad2;
  sx.beginPath(); sx.arc(rLX+legW/2, legY+legH*0.48, W*0.038, 0, Math.PI*2); sx.fill();
  // Brilho joelho
  sx.fillStyle='rgba(255,200,150,0.2)';
  sx.beginPath(); sx.arc(lLX+legW*0.38, legY+legH*0.44, W*0.018, 0, Math.PI*2); sx.fill();
  sx.beginPath(); sx.arc(rLX+legW*0.38, legY+legH*0.44, W*0.018, 0, Math.PI*2); sx.fill();

  // Botas com detalhes
  const bootGrad = sx.createLinearGradient(lLX, legY+legH*0.44, lLX+legW, legY+legH);
  bootGrad.addColorStop(0,'#1c1408'); bootGrad.addColorStop(1,'#0a0604');
  sx.fillStyle = bootGrad;
  sx.fillRect(lLX-W*0.01, legY+legH*0.46, legW+W*0.02, legH*0.54);
  sx.fillRect(rLX-W*0.01, legY+legH*0.46, legW+W*0.02, legH*0.54);
  // Solado
  sx.fillStyle = '#111';
  sx.fillRect(lLX-W*0.015, baseY-legH*0.06, legW+W*0.03, legH*0.06);
  sx.fillRect(rLX-W*0.015, baseY-legH*0.06, legW+W*0.03, legH*0.06);
  // Destaque metálico da bota
  sx.fillStyle = 'rgba(255,200,120,0.18)';
  sx.fillRect(lLX+W*0.01, legY+legH*0.49, legW*0.55, legH*0.08);
  sx.fillRect(rLX+W*0.01, legY+legH*0.49, legW*0.55, legH*0.08);
  // Bota zíper/costura
  sx.strokeStyle='rgba(0,0,0,0.4)'; sx.lineWidth=0.8;
  sx.beginPath(); sx.moveTo(lLX+legW*0.5,legY+legH*0.5); sx.lineTo(lLX+legW*0.5,baseY-legH*0.06); sx.stroke();
  sx.beginPath(); sx.moveTo(rLX+legW*0.5,legY+legH*0.5); sx.lineTo(rLX+legW*0.5,baseY-legH*0.06); sx.stroke();

  // === TORSO ===
  const torsoW = W * (isHeavy ? 0.50 : 0.44);
  const torsoH = H * (isHeavy ? 0.30 : 0.27);
  const torsoX = cx - torsoW/2;
  const torsoY = legY - torsoH;

  // Torso — armadura com gradiente detalhado
  const tGrad = sx.createLinearGradient(torsoX, torsoY, torsoX+torsoW, torsoY+torsoH);
  const uColor = def.uniformColor;
  tGrad.addColorStop(0, shadeColor(uColor, 1.5));
  tGrad.addColorStop(0.3, shadeColor(uColor, 1.1));
  tGrad.addColorStop(0.7, uColor);
  tGrad.addColorStop(1, shadeColor(uColor, 0.45));
  sx.fillStyle = tGrad;
  sx.fillRect(torsoX, torsoY, torsoW, torsoH);

  // Placa de armadura frontal com bevel
  const plateGrad = sx.createLinearGradient(torsoX+torsoW*0.08, torsoY+torsoH*0.06, torsoX+torsoW*0.92, torsoY+torsoH*0.8);
  plateGrad.addColorStop(0, shadeColor(uColor, 1.7));
  plateGrad.addColorStop(0.3, shadeColor(uColor, 1.25));
  plateGrad.addColorStop(0.7, shadeColor(uColor, 0.95));
  plateGrad.addColorStop(1, shadeColor(uColor, 0.65));
  sx.fillStyle = plateGrad;
  sx.fillRect(torsoX+torsoW*0.08, torsoY+torsoH*0.07, torsoW*0.84, torsoH*0.78);

  // Nervuras da armadura
  sx.strokeStyle = shadeColor(uColor, 0.55);
  sx.lineWidth = W * 0.01;
  for(let ri=1;ri<4;ri++){
    sx.beginPath(); sx.moveTo(torsoX+torsoW*0.08, torsoY+torsoH*(0.2+ri*0.16));
    sx.lineTo(torsoX+torsoW*0.92, torsoY+torsoH*(0.2+ri*0.16)); sx.stroke();
  }

  // Linha de costura central
  sx.strokeStyle = shadeColor(uColor, 0.5); sx.lineWidth = W * 0.014;
  sx.beginPath(); sx.moveTo(cx, torsoY+torsoH*0.08); sx.lineTo(cx, torsoY+torsoH*0.92); sx.stroke();

  // Clipes e equipamento no peito
  sx.fillStyle = 'rgba(220,170,60,0.85)';
  for(let ci=0;ci<3;ci++){
    sx.beginPath(); sx.arc(torsoX+torsoW*(0.2+ci*0.3), torsoY+torsoH*0.62, W*0.024, 0, Math.PI*2); sx.fill();
    sx.fillStyle='rgba(255,220,80,0.6)'; sx.beginPath(); sx.arc(torsoX+torsoW*(0.18+ci*0.3), torsoY+torsoH*0.60, W*0.01, 0, Math.PI*2); sx.fill();
    sx.fillStyle='rgba(220,170,60,0.85)';
  }

  // Plaquinha de identificação no peito
  sx.fillStyle = 'rgba(180,220,255,0.25)';
  sx.fillRect(torsoX+torsoW*0.3, torsoY+torsoH*0.25, torsoW*0.4, torsoH*0.2);
  sx.strokeStyle='rgba(150,200,255,0.5)'; sx.lineWidth=0.8;
  sx.strokeRect(torsoX+torsoW*0.3, torsoY+torsoH*0.25, torsoW*0.4, torsoH*0.2);

  // Ombreiras 3D
  const shoulderW = torsoW * 0.22;
  for(let si=0;si<2;si++){
    const sx2 = si===0 ? torsoX-shoulderW*0.3 : torsoX+torsoW-shoulderW*0.7;
    const sGrad = sx.createLinearGradient(sx2, torsoY, sx2+shoulderW, torsoY+shoulderW*0.7);
    sGrad.addColorStop(0, shadeColor(uColor, 1.6));
    sGrad.addColorStop(0.5, shadeColor(uColor, 1.1));
    sGrad.addColorStop(1, shadeColor(uColor, 0.6));
    sx.fillStyle = sGrad;
    sx.beginPath(); sx.ellipse(sx2+shoulderW/2, torsoY+torsoH*0.1, shoulderW*0.5, shoulderW*0.28, si===0?0.3:-0.3, 0, Math.PI*2); sx.fill();
    // Brilho ombreira
    sx.fillStyle='rgba(255,220,180,0.18)';
    sx.beginPath(); sx.ellipse(sx2+shoulderW*0.3, torsoY+torsoH*0.04, shoulderW*0.2, shoulderW*0.1, si===0?0.3:-0.3, 0, Math.PI*2); sx.fill();
  }

  // === BRAÇOS ===
  const armW = W * (isHeavy ? 0.10 : 0.086);
  const armH = H * (isHeavy ? 0.27 : 0.24);
  const lAX = torsoX - armW + W*0.01;
  const rAX = torsoX + torsoW - W*0.01;
  const lArmOff = isMoving ? armSwing : 0;
  const rArmOff = isMoving ? -armSwing : 0;
  const atkLift = isAttacking ? -H*0.04 : 0;

  // Braço esquerdo
  const lArmGrad = sx.createLinearGradient(lAX, torsoY, lAX+armW, torsoY+armH);
  lArmGrad.addColorStop(0, shadeColor(uColor, 1.1));
  lArmGrad.addColorStop(1, shadeColor(uColor, 0.55));
  sx.fillStyle = lArmGrad;
  sx.fillRect(lAX+lArmOff, torsoY+H*0.015, armW, armH*0.85);
  // Cotoveleira esquerda
  const elbowGrad = sx.createRadialGradient(lAX+armW*0.4+lArmOff, torsoY+armH*0.48, 0, lAX+armW/2+lArmOff, torsoY+armH*0.5, W*0.04);
  elbowGrad.addColorStop(0,'#555'); elbowGrad.addColorStop(1,'#111');
  sx.fillStyle=elbowGrad; sx.beginPath(); sx.arc(lAX+armW/2+lArmOff, torsoY+armH*0.5, W*0.038, 0, Math.PI*2); sx.fill();

  // Braço direito
  const rArmGrad = sx.createLinearGradient(rAX, torsoY, rAX+armW, torsoY+armH);
  rArmGrad.addColorStop(0, shadeColor(uColor, 1.0));
  rArmGrad.addColorStop(1, shadeColor(uColor, 0.5));
  sx.fillStyle = rArmGrad;
  sx.fillRect(rAX+rArmOff, torsoY+H*0.015+atkLift, armW, armH*0.85);
  // Cotoveleira direita
  const elbowGrad2 = sx.createRadialGradient(rAX+armW*0.4+rArmOff, torsoY+armH*0.45, 0, rAX+armW/2+rArmOff, torsoY+armH*0.5, W*0.04);
  elbowGrad2.addColorStop(0,'#444'); elbowGrad2.addColorStop(1,'#111');
  sx.fillStyle=elbowGrad2; sx.beginPath(); sx.arc(rAX+armW/2+rArmOff, torsoY+armH*0.5, W*0.036, 0, Math.PI*2); sx.fill();

  // Luvas
  const gloveGrad = sx.createRadialGradient(lAX+armW/2+lArmOff, torsoY+armH*0.88, 0, lAX+armW/2+lArmOff, torsoY+armH+H*0.015, armW*0.7);
  gloveGrad.addColorStop(0,'#2a1a0c'); gloveGrad.addColorStop(1,'#0a0604');
  sx.fillStyle=gloveGrad; sx.beginPath(); sx.ellipse(lAX+armW/2+lArmOff, torsoY+armH+H*0.015, armW*0.65, armH*0.11, 0, 0, Math.PI*2); sx.fill();
  const gloveGrad2 = sx.createRadialGradient(rAX+armW/2+rArmOff, torsoY+armH*0.88, 0, rAX+armW/2+rArmOff, torsoY+armH+H*0.015+atkLift, armW*0.7);
  gloveGrad2.addColorStop(0,'#2a1a0c'); gloveGrad2.addColorStop(1,'#0a0604');
  sx.fillStyle=gloveGrad2; sx.beginPath(); sx.ellipse(rAX+armW/2+rArmOff, torsoY+armH+H*0.015+atkLift, armW*0.65, armH*0.11, 0, 0, Math.PI*2); sx.fill();

  // === ARMA (mais detalhada) ===
  const gunX = rAX + armW*0.15 + rArmOff;
  const gunY = torsoY + armH * 0.68 + atkLift;
  if (isHeavy) {
    // Heavy — rifle de assalto
    const gunGrad = sx.createLinearGradient(gunX-armW*0.6, gunY, gunX+armW*2.8, gunY+H*0.08);
    gunGrad.addColorStop(0,'#444'); gunGrad.addColorStop(0.5,'#2a2a2a'); gunGrad.addColorStop(1,'#111');
    sx.fillStyle=gunGrad;
    sx.fillRect(gunX-armW*0.6, gunY-H*0.01, armW*3.0, H*0.1);
    // Cano
    sx.fillStyle='#555'; sx.fillRect(gunX+armW*2.2, gunY, armW*0.8, H*0.06);
    // Carregador
    sx.fillStyle='#664400'; sx.fillRect(gunX+armW*0.5, gunY+H*0.04, armW*0.8, H*0.15);
    // Coronha
    sx.fillStyle='#3a2010'; sx.fillRect(gunX-armW*0.8, gunY, armW*0.5, H*0.12);
    // Mira
    sx.fillStyle='#888'; sx.fillRect(gunX+armW*0.8, gunY-H*0.02, armW*0.12, H*0.04);
    // Grip
    sx.fillStyle='#222'; sx.fillRect(gunX+armW*0.8, gunY+H*0.07, armW*0.5, H*0.1);
  } else {
    // Soldado normal — pistola/SMG detalhada
    const gunGrad = sx.createLinearGradient(gunX-armW*0.2, gunY, gunX+armW*1.6, gunY+H*0.06);
    gunGrad.addColorStop(0,'#555'); gunGrad.addColorStop(0.5,'#3a3a3a'); gunGrad.addColorStop(1,'#1a1a1a');
    sx.fillStyle=gunGrad;
    sx.fillRect(gunX, gunY, armW*1.5, H*0.08);
    // Cano
    sx.fillStyle='#666'; sx.fillRect(gunX+armW*1.4, gunY+H*0.01, armW*0.7, H*0.05);
    // Carregador
    sx.fillStyle='#886600'; sx.fillRect(gunX+armW*0.3, gunY+H*0.04, armW*0.5, H*0.12);
    // Cabo
    sx.fillStyle='#2a1808'; sx.fillRect(gunX+armW*0.1, gunY+H*0.05, armW*0.4, H*0.18);
    // Mira dianteira
    sx.fillStyle='#aaa'; sx.fillRect(gunX+armW*1.3, gunY-H*0.01, armW*0.08, H*0.03);
    // Gatilho
    sx.fillStyle='#444';
    sx.beginPath(); sx.moveTo(gunX+armW*0.7,gunY+H*0.06); sx.lineTo(gunX+armW*0.85,gunY+H*0.12); sx.lineTo(gunX+armW*0.95,gunY+H*0.12); sx.lineTo(gunX+armW*0.95,gunY+H*0.06); sx.fill();
  }

  // Brilho na arma
  sx.fillStyle='rgba(255,220,180,0.1)';
  sx.fillRect(gunX+(isHeavy?-armW*0.3:0), gunY, armW*(isHeavy?2.4:1.2), H*0.02);

  // === PESCOÇO ===
  const neckGrad = sx.createLinearGradient(cx-W*0.06, torsoY-H*0.05, cx+W*0.06, torsoY);
  neckGrad.addColorStop(0, shadeColor(def.skinColor,1.1));
  neckGrad.addColorStop(1, shadeColor(def.skinColor,0.7));
  sx.fillStyle=neckGrad;
  sx.fillRect(cx-W*0.052, torsoY-H*0.048, W*0.104, H*0.055);

  // === CABEÇA / CAPACETE ===
  const headW = W * (isHeavy ? 0.355 : 0.31);
  const headH = H * (isHeavy ? 0.21 : 0.19);
  const headX = cx - headW/2;
  const headY = torsoY - headH - H*0.038;

  // Rosto com gradiente rico
  const faceGrad = sx.createRadialGradient(cx-headW*0.1, headY+headH*0.3, headW*0.02, cx, headY+headH*0.52, headW*0.56);
  faceGrad.addColorStop(0, shadeColor(def.skinColor, 1.4));
  faceGrad.addColorStop(0.5, def.skinColor);
  faceGrad.addColorStop(1, shadeColor(def.skinColor, 0.7));
  sx.fillStyle = faceGrad;
  sx.beginPath(); sx.ellipse(cx, headY+headH*0.55, headW*0.49, headH*0.51, 0, 0, Math.PI*2); sx.fill();

  // Capacete com gradiente e bevel muito detalhado
  const helmetGrad = sx.createLinearGradient(headX, headY, headX+headW, headY+headH*0.65);
  helmetGrad.addColorStop(0, shadeColor(def.helmetColor, 1.8));
  helmetGrad.addColorStop(0.2, shadeColor(def.helmetColor, 1.4));
  helmetGrad.addColorStop(0.6, def.helmetColor);
  helmetGrad.addColorStop(1, shadeColor(def.helmetColor, 0.5));
  sx.fillStyle = helmetGrad;
  sx.beginPath();
  sx.moveTo(headX+headW*0.04, headY+headH*0.56);
  sx.lineTo(headX+headW*0.08, headY+headH*0.18);
  sx.quadraticCurveTo(cx, headY-headH*0.12, headX+headW*0.92, headY+headH*0.18);
  sx.lineTo(headX+headW*0.96, headY+headH*0.56);
  sx.closePath();
  sx.fill();
  // Brilho capacete
  sx.fillStyle='rgba(255,240,220,0.14)';
  sx.beginPath();
  sx.moveTo(headX+headW*0.15, headY+headH*0.30);
  sx.quadraticCurveTo(cx-headW*0.05, headY-headH*0.06, headX+headW*0.55, headY+headH*0.14);
  sx.lineTo(headX+headW*0.42, headY+headH*0.30);
  sx.closePath(); sx.fill();
  // Detalhe central do capacete
  sx.strokeStyle=shadeColor(def.helmetColor, 0.6); sx.lineWidth=W*0.015;
  sx.beginPath(); sx.moveTo(cx, headY-headH*0.04); sx.lineTo(cx, headY+headH*0.52); sx.stroke();

  // Viseira com efeito de vidro
  const visorGrad = sx.createLinearGradient(headX+headW*0.1, headY+headH*0.40, headX+headW*0.9, headY+headH*0.62);
  visorGrad.addColorStop(0,'rgba(80,100,255,0.30)');
  visorGrad.addColorStop(0.4,'rgba(40,60,200,0.20)');
  visorGrad.addColorStop(1,'rgba(20,40,150,0.35)');
  sx.fillStyle = visorGrad;
  sx.beginPath();
  sx.moveTo(headX+headW*0.10, headY+headH*0.41);
  sx.lineTo(headX+headW*0.90, headY+headH*0.41);
  sx.lineTo(headX+headW*0.87, headY+headH*0.60);
  sx.lineTo(headX+headW*0.13, headY+headH*0.60);
  sx.closePath(); sx.fill();
  // Reflexo da viseira
  sx.fillStyle='rgba(255,255,255,0.18)';
  sx.beginPath();
  sx.moveTo(headX+headW*0.12, headY+headH*0.42);
  sx.lineTo(headX+headW*0.55, headY+headH*0.42);
  sx.lineTo(headX+headW*0.50, headY+headH*0.48);
  sx.lineTo(headX+headW*0.12, headY+headH*0.48);
  sx.closePath(); sx.fill();

  // Olhos brilhantes com pupila
  const eyeSize = headW * 0.17;
  const eyeY = headY + headH * 0.385;
  // Olho esquerdo
  sx.fillStyle = def.eyeColor;
  sx.beginPath(); sx.arc(headX+headW*0.30, eyeY, eyeSize*0.5, 0, Math.PI*2); sx.fill();
  sx.fillStyle='rgba(0,0,0,0.7)';
  sx.beginPath(); sx.arc(headX+headW*0.30+eyeSize*0.06, eyeY+eyeSize*0.06, eyeSize*0.22, 0, Math.PI*2); sx.fill();
  sx.fillStyle='rgba(255,255,255,0.75)';
  sx.beginPath(); sx.arc(headX+headW*0.27, eyeY-eyeSize*0.18, eyeSize*0.13, 0, Math.PI*2); sx.fill();
  // Olho direito
  sx.fillStyle = def.eyeColor;
  sx.beginPath(); sx.arc(headX+headW*0.70, eyeY, eyeSize*0.5, 0, Math.PI*2); sx.fill();
  sx.fillStyle='rgba(0,0,0,0.7)';
  sx.beginPath(); sx.arc(headX+headW*0.70+eyeSize*0.06, eyeY+eyeSize*0.06, eyeSize*0.22, 0, Math.PI*2); sx.fill();
  sx.fillStyle='rgba(255,255,255,0.75)';
  sx.beginPath(); sx.arc(headX+headW*0.67, eyeY-eyeSize*0.18, eyeSize*0.13, 0, Math.PI*2); sx.fill();

  // Boca agressiva com dentes
  sx.fillStyle = shadeColor(def.skinColor, 0.5);
  sx.fillRect(headX+headW*0.26, headY+headH*0.71, headW*0.48, headH*0.14);
  sx.fillStyle = '#0c0404';
  sx.fillRect(headX+headW*0.28, headY+headH*0.73, headW*0.44, headH*0.09);
  // Dentes à mostra
  sx.fillStyle = '#e8e0d0';
  for(let di=0;di<5;di++){
    sx.fillRect(headX+headW*(0.295+di*0.086), headY+headH*0.735, headW*0.065, headH*0.065);
  }

  // Cicatrizes/sujeira no rosto
  sx.strokeStyle=shadeColor(def.skinColor,0.45); sx.lineWidth=W*0.009;
  sx.beginPath(); sx.moveTo(headX+headW*0.6, headY+headH*0.38); sx.lineTo(headX+headW*0.72, headY+headH*0.6); sx.stroke();

  // Antena/detalhe no capacete
  if (isHeavy) {
    sx.fillStyle = '#cc2200';
    sx.beginPath(); sx.arc(cx, headY-headH*0.06, W*0.032, 0, Math.PI*2); sx.fill();
    sx.fillStyle='#ff4400'; sx.beginPath(); sx.arc(cx, headY-headH*0.06, W*0.016, 0, Math.PI*2); sx.fill();
    // Brilho pulsante do led
    const ledPulse = 0.5+0.5*Math.sin(t*0.6);
    sx.fillStyle=`rgba(255,80,0,${ledPulse*0.6})`;
    sx.beginPath(); sx.arc(cx, headY-headH*0.06, W*0.05, 0, Math.PI*2); sx.fill();
  } else {
    // Fone/comunicador
    sx.fillStyle='#333'; sx.fillRect(headX+headW*0.82, headY+headH*0.28, headW*0.12, headH*0.25);
    sx.fillStyle='#555'; sx.beginPath(); sx.arc(headX+headW*0.88, headY+headH*0.52, headW*0.05, 0, Math.PI*2); sx.fill();
  }
}

function _drawEnemySpriteV2(sx, e, def, W, H) {
  const t = Date.now() / 180;
  const isMoving = e.state==='chase' || e.state==='attack';
  const walkBob = isMoving ? Math.sin(t) * (H * 0.025) : 0;
  const armSwing = isMoving ? Math.sin(t) * (W * 0.05) : 0;

  if (def.variant === 'sphere') {
    // Cacodemon — esfera flutuante com cara
    const gy = H * 0.52 + Math.sin(t * 0.4) * (H * 0.03);
    const radius = W * 0.40;
    const grad = sx.createRadialGradient(W/2-radius*0.2, gy-radius*0.2, radius*0.08, W/2, gy, radius);
    grad.addColorStop(0, '#ff5533');
    grad.addColorStop(0.4, def.skinColor);
    grad.addColorStop(1, '#1a0000');
    sx.fillStyle = grad;
    sx.beginPath(); sx.arc(W/2, gy, radius, 0, Math.PI*2); sx.fill();
    // Olhos brancos grandes
    const er = radius * 0.21;
    const eo = radius * 0.28;
    [[-eo, -radius*0.12],[eo, -radius*0.12]].forEach(([ox,oy])=>{
      const eg = sx.createRadialGradient(W/2+ox,gy+oy,0,W/2+ox,gy+oy,er);
      eg.addColorStop(0,'#ffffff'); eg.addColorStop(1,'#dddddd');
      sx.fillStyle=eg; sx.beginPath(); sx.arc(W/2+ox,gy+oy,er,0,Math.PI*2); sx.fill();
      sx.fillStyle='#cc0000'; sx.beginPath(); sx.arc(W/2+ox,gy+oy,er*0.52,0,Math.PI*2); sx.fill();
      sx.fillStyle='#000'; sx.beginPath(); sx.arc(W/2+ox-er*0.1,gy+oy-er*0.1,er*0.26,0,Math.PI*2); sx.fill();
      sx.fillStyle='rgba(255,255,255,0.7)'; sx.beginPath(); sx.arc(W/2+ox-er*0.15,gy+oy-er*0.2,er*0.1,0,Math.PI*2); sx.fill();
    });
    // Boca com dentes
    sx.fillStyle='#110000';
    sx.beginPath(); sx.arc(W/2, gy+radius*0.35, radius*0.4, 0, Math.PI); sx.fill();
    sx.fillStyle='#eecc99';
    const toothCount=6;
    for(let i=0;i<toothCount;i++){
      const tx2 = W/2 - radius*0.35 + i*(radius*0.7/toothCount) + radius*0.035;
      const tW2 = radius*0.08, tH=radius*0.14;
      sx.beginPath(); sx.moveTo(tx2,gy+radius*0.22); sx.lineTo(tx2+tW2,gy+radius*0.22); sx.lineTo(tx2+tW2/2,gy+radius*0.22+tH); sx.closePath(); sx.fill();
    }
    // Tentáculos por baixo
    sx.strokeStyle='#880000'; sx.lineWidth=W*0.025;
    for(let i=0;i<4;i++){
      const tx2=W/2-radius*0.3+i*(radius*0.2);
      sx.beginPath(); sx.moveTo(tx2,gy+radius*0.85); sx.quadraticCurveTo(tx2+Math.sin(t+i)*W*0.06,gy+radius*1.1,tx2,gy+radius*1.3); sx.stroke();
    }
    return;
  }

  if (def.isBoss) {
    drawBossSprite(sx, e, def, W, H, t, walkBob, armSwing);
    return;
  }

  // ─── Soldado humanoide estilo Doom ─────────────────────────
  const cx = W / 2;
  const baseY = H * 0.87 + walkBob;
  const isHeavy = def.variant === 'heavy';

  // === PERNAS ===
  const legW = W * (isHeavy ? 0.14 : 0.12);
  const legH = H * (isHeavy ? 0.26 : 0.23);
  const legY = baseY - legH;
  const legSwingL = isMoving ? Math.sin(t) * W * 0.04 : 0;
  const legSwingR = isMoving ? Math.sin(t + Math.PI) * W * 0.04 : 0;
  const lLX = cx - W * (isHeavy ? 0.18 : 0.15) + legSwingL;
  const rLX = cx + W * (isHeavy ? 0.04 : 0.03) + legSwingR;

  // Sombra das pernas
  sx.fillStyle = '#0a0000';
  sx.fillRect(lLX+2, legY+2, legW, legH);
  sx.fillRect(rLX+2, legY+2, legW, legH);

  // Calça (parte da perna)
  const pantColor = isHeavy ? '#6a0000' : '#6b4513';
  sx.fillStyle = pantColor;
  sx.fillRect(lLX, legY, legW, legH * 0.55);
  sx.fillRect(rLX, legY, legW, legH * 0.55);

  // Parte inferior da bota
  sx.fillStyle = '#1a1008';
  sx.fillRect(lLX-W*0.01, legY+legH*0.45, legW+W*0.02, legH*0.55);
  sx.fillRect(rLX-W*0.01, legY+legH*0.45, legW+W*0.02, legH*0.55);

  // Destaque na bota
  sx.fillStyle = 'rgba(255,180,100,0.12)';
  sx.fillRect(lLX+W*0.01, legY+legH*0.48, legW*0.5, legH*0.1);
  sx.fillRect(rLX+W*0.01, legY+legH*0.48, legW*0.5, legH*0.1);

  // Joelhos com proteção
  sx.fillStyle = '#333';
  sx.beginPath(); sx.arc(lLX+legW/2, legY+legH*0.48, W*0.035, 0, Math.PI*2); sx.fill();
  sx.beginPath(); sx.arc(rLX+legW/2, legY+legH*0.48, W*0.035, 0, Math.PI*2); sx.fill();

  // === TORSO ===
  const torsoW = W * (isHeavy ? 0.50 : 0.44);
  const torsoH = H * (isHeavy ? 0.30 : 0.27);
  const torsoX = cx - torsoW/2;
  const torsoY = legY - torsoH;

  // Sombra torso
  sx.fillStyle = '#0a0000';
  sx.fillRect(torsoX+2, torsoY+2, torsoW, torsoH);

  // Armadura do torso com gradiente
  const tGrad = sx.createLinearGradient(torsoX, torsoY, torsoX+torsoW, torsoY+torsoH);
  const uColor = def.uniformColor;
  tGrad.addColorStop(0, shadeColor(uColor, 1.3));
  tGrad.addColorStop(0.45, uColor);
  tGrad.addColorStop(1, shadeColor(uColor, 0.6));
  sx.fillStyle = tGrad;
  sx.fillRect(torsoX, torsoY, torsoW, torsoH);

  // Placa de armadura frontal
  const plateGrad = sx.createLinearGradient(torsoX+torsoW*0.1, torsoY+torsoH*0.1, torsoX+torsoW*0.9, torsoY+torsoH*0.7);
  plateGrad.addColorStop(0, shadeColor(uColor, 1.5));
  plateGrad.addColorStop(0.5, shadeColor(uColor, 1.15));
  plateGrad.addColorStop(1, shadeColor(uColor, 0.85));
  sx.fillStyle = plateGrad;
  sx.fillRect(torsoX+torsoW*0.1, torsoY+torsoH*0.08, torsoW*0.8, torsoH*0.75);

  // Detalhe — linha de costura central
  sx.strokeStyle = shadeColor(uColor, 0.7);
  sx.lineWidth = W * 0.012;
  sx.beginPath(); sx.moveTo(cx, torsoY+torsoH*0.1); sx.lineTo(cx, torsoY+torsoH*0.9); sx.stroke();

  // Ombreiras
  const shoulderW = torsoW * 0.2;
  const shoulderGrad = sx.createLinearGradient(torsoX, torsoY, torsoX, torsoY+shoulderW*0.8);
  shoulderGrad.addColorStop(0, shadeColor(uColor, 1.4));
  shoulderGrad.addColorStop(1, shadeColor(uColor, 0.8));
  sx.fillStyle = shoulderGrad;
  sx.beginPath(); sx.ellipse(torsoX, torsoY+torsoH*0.1, shoulderW, shoulderW*0.55, 0, 0, Math.PI*2); sx.fill();
  sx.beginPath(); sx.ellipse(torsoX+torsoW, torsoY+torsoH*0.1, shoulderW, shoulderW*0.55, 0, 0, Math.PI*2); sx.fill();

  // Detalhes de equipamento (botões/clips)
  sx.fillStyle = 'rgba(200,150,50,0.7)';
  for(let i=0;i<3;i++) { sx.beginPath(); sx.arc(torsoX+torsoW*0.2+i*torsoW*0.3, torsoY+torsoH*0.65, W*0.02, 0, Math.PI*2); sx.fill(); }

  // === BRAÇOS ===
  const armW = W * 0.09;
  const armH = H * (isHeavy ? 0.28 : 0.25);
  const lAX = torsoX - armW;
  const rAX = torsoX + torsoW;
  const lArmOff = isMoving ? armSwing : 0;
  const rArmOff = isMoving ? -armSwing : 0;

  // Braço esquerdo
  sx.fillStyle = shadeColor(uColor, 0.85);
  sx.fillRect(lAX + lArmOff, torsoY+H*0.02, armW, armH);
  // Braço direito (com arma se for soldier)
  sx.fillStyle = shadeColor(uColor, 0.85);
  sx.fillRect(rAX + rArmOff, torsoY+H*0.02, armW, armH);

  // Luvas
  sx.fillStyle = '#1a0e08';
  sx.beginPath(); sx.ellipse(lAX+armW/2+lArmOff, torsoY+armH+H*0.025, armW*0.6, armH*0.12, 0, 0, Math.PI*2); sx.fill();
  sx.beginPath(); sx.ellipse(rAX+armW/2+rArmOff, torsoY+armH+H*0.025, armW*0.6, armH*0.12, 0, 0, Math.PI*2); sx.fill();

  // Arma na mão direita (pistola/rifle)
  const gunX = rAX + armW*0.2 + rArmOff;
  const gunY = torsoY + armH * 0.7;
  sx.fillStyle = '#222';
  sx.fillRect(gunX, gunY, armW*1.4, H*0.1);
  sx.fillStyle = '#444';
  sx.fillRect(gunX+armW*0.3, gunY+H*0.04, armW*0.8, H*0.18);
  sx.fillStyle = '#555';
  sx.fillRect(gunX+armW*1.3, gunY+H*0.01, armW*0.6, H*0.06);
  if (isHeavy) {
    // Heavy carrega um rifle maior / lançador
    sx.fillStyle = '#333';
    sx.fillRect(gunX-armW*0.3, gunY-H*0.02, armW*2.2, H*0.12);
    sx.fillStyle = '#666';
    sx.fillRect(gunX+armW*1.8, gunY, armW*0.5, H*0.08);
  }

  // === PESCOÇO ===
  sx.fillStyle = def.skinColor;
  sx.fillRect(cx-W*0.055, torsoY-H*0.05, W*0.11, H*0.06);

  // === CABEÇA / CAPACETE ===
  const headW = W * (isHeavy ? 0.34 : 0.30);
  const headH = H * (isHeavy ? 0.20 : 0.18);
  const headX = cx - headW/2;
  const headY = torsoY - headH - H*0.04;

  // Rosto (pele)
  const faceGrad = sx.createRadialGradient(cx-headW*0.08, headY+headH*0.35, headW*0.04, cx, headY+headH*0.5, headW*0.55);
  faceGrad.addColorStop(0, shadeColor(def.skinColor, 1.3));
  faceGrad.addColorStop(1, def.skinColor);
  sx.fillStyle = faceGrad;
  sx.beginPath(); sx.ellipse(cx, headY+headH*0.55, headW*0.48, headH*0.5, 0, 0, Math.PI*2); sx.fill();

  // Capacete / armadura de cabeça
  const helmetGrad = sx.createLinearGradient(headX, headY, headX+headW, headY+headH*0.65);
  helmetGrad.addColorStop(0, shadeColor(def.helmetColor, 1.5));
  helmetGrad.addColorStop(0.5, def.helmetColor);
  helmetGrad.addColorStop(1, shadeColor(def.helmetColor, 0.7));
  sx.fillStyle = helmetGrad;
  sx.beginPath();
  sx.moveTo(headX, headY+headH*0.55);
  sx.lineTo(headX+headW*0.1, headY+headH*0.15);
  sx.quadraticCurveTo(cx, headY-headH*0.1, headX+headW*0.9, headY+headH*0.15);
  sx.lineTo(headX+headW, headY+headH*0.55);
  sx.closePath();
  sx.fill();

  // Viseira do capacete
  sx.fillStyle = 'rgba(50,80,255,0.25)';
  sx.beginPath();
  sx.moveTo(headX+headW*0.08, headY+headH*0.42);
  sx.lineTo(headX+headW*0.92, headY+headH*0.42);
  sx.lineTo(headX+headW*0.88, headY+headH*0.58);
  sx.lineTo(headX+headW*0.12, headY+headH*0.58);
  sx.closePath(); sx.fill();

  // Olhos brilhantes (dentro da viseira)
  const eyeSize = headW * 0.16;
  const eyeY = headY + headH * 0.38;
  sx.fillStyle = def.eyeColor;
  sx.beginPath(); sx.arc(headX+headW*0.3, eyeY, eyeSize*0.5, 0, Math.PI*2); sx.fill();
  sx.beginPath(); sx.arc(headX+headW*0.7, eyeY, eyeSize*0.5, 0, Math.PI*2); sx.fill();
  sx.fillStyle = 'rgba(255,255,255,0.6)';
  sx.beginPath(); sx.arc(headX+headW*0.28, eyeY-eyeSize*0.15, eyeSize*0.18, 0, Math.PI*2); sx.fill();
  sx.beginPath(); sx.arc(headX+headW*0.68, eyeY-eyeSize*0.15, eyeSize*0.18, 0, Math.PI*2); sx.fill();

  // Boca / grimace
  sx.fillStyle = shadeColor(def.skinColor, 0.6);
  sx.fillRect(headX+headW*0.28, headY+headH*0.72, headW*0.44, headH*0.12);
  sx.fillStyle = '#1a0808';
  sx.fillRect(headX+headW*0.3, headY+headH*0.74, headW*0.4, headH*0.08);
  // Dentes à mostra (expressão agressiva)
  sx.fillStyle = '#ddd';
  for(let i=0;i<4;i++) sx.fillRect(headX+headW*(0.315+i*0.095), headY+headH*0.745, headW*0.065, headH*0.06);

  // Antena/detalhe capacete
  if (isHeavy) {
    sx.fillStyle = '#cc2200';
    sx.beginPath(); sx.arc(cx, headY-headH*0.06, W*0.03, 0, Math.PI*2); sx.fill();
  }
}

function drawBossSprite(sx, e, def, W, H, t, walkBob, armSwing) {
  const cx = W/2;
  const baseY = H * 0.88 + walkBob;
  const isAtk = e.state === 'attack';

  // Pernas grossas demoníacas
  const legW = W*0.17, legH = H*0.28;
  const legY = baseY - legH;
  const ll = cx - W*0.22, rl = cx + W*0.05;

  sx.fillStyle = '#0a0000';
  sx.fillRect(ll+3, legY+3, legW, legH); sx.fillRect(rl+3, legY+3, legW, legH);

  const legGrad = sx.createLinearGradient(ll, legY, ll+legW, legY+legH);
  legGrad.addColorStop(0, '#550000'); legGrad.addColorStop(1, '#220000');
  sx.fillStyle = legGrad;
  sx.fillRect(ll, legY, legW, legH); sx.fillRect(rl, legY, legW, legH);

  // Joelhos com espinhos
  sx.fillStyle = '#cc1100';
  sx.beginPath(); sx.arc(ll+legW/2, legY+legH*0.45, W*0.05, 0, Math.PI*2); sx.fill();
  sx.beginPath(); sx.arc(rl+legW/2, legY+legH*0.45, W*0.05, 0, Math.PI*2); sx.fill();
  sx.fillStyle = '#ff2200';
  for(let s=-1;s<=1;s+=2){
    sx.beginPath(); sx.moveTo(ll+legW/2, legY+legH*0.38); sx.lineTo(ll+legW/2+s*W*0.06, legY+legH*0.32); sx.lineTo(ll+legW/2, legY+legH*0.42); sx.closePath(); sx.fill();
    sx.beginPath(); sx.moveTo(rl+legW/2, legY+legH*0.38); sx.lineTo(rl+legW/2+s*W*0.06, legY+legH*0.32); sx.lineTo(rl+legW/2, legY+legH*0.42); sx.closePath(); sx.fill();
  }

  // Garras/pés
  sx.fillStyle = '#150000';
  sx.fillRect(ll-W*0.02, baseY-legH*0.2, legW+W*0.06, legH*0.22);
  sx.fillRect(rl-W*0.02, baseY-legH*0.2, legW+W*0.06, legH*0.22);

  // Torso enorme
  const torsoW=W*0.62, torsoH=H*0.40;
  const torsoX=cx-torsoW/2, torsoY=legY-torsoH;
  const tGrad2=sx.createLinearGradient(torsoX,torsoY,torsoX+torsoW,torsoY+torsoH);
  tGrad2.addColorStop(0,'#770000'); tGrad2.addColorStop(0.35,'#990000'); tGrad2.addColorStop(1,'#1a0000');
  sx.fillStyle=tGrad2;
  sx.fillRect(torsoX,torsoY,torsoW,torsoH);
  // Placas de armadura
  sx.fillStyle='rgba(200,0,0,0.6)';
  sx.fillRect(torsoX+W*0.04,torsoY+H*0.02,torsoW-W*0.08,H*0.05);
  sx.fillRect(torsoX+W*0.04,torsoY+torsoH*0.42,torsoW-W*0.08,H*0.04);
  sx.fillRect(torsoX+W*0.04,torsoY+torsoH*0.7,torsoW-W*0.08,H*0.04);
  // Símbolo pentáculo
  sx.strokeStyle='rgba(255,80,0,0.8)'; sx.lineWidth=W*0.018;
  sx.strokeRect(torsoX+W*0.1,torsoY+H*0.07,torsoW-W*0.2,torsoH-H*0.14);
  sx.fillStyle='rgba(255,100,0,0.55)';
  sx.beginPath(); sx.arc(cx, torsoY+torsoH*0.5, W*0.1, 0, Math.PI*2); sx.fill();
  sx.fillStyle='rgba(255,150,0,0.7)';
  sx.beginPath(); sx.arc(cx, torsoY+torsoH*0.5, W*0.055, 0, Math.PI*2); sx.fill();

  // Braços com chicotes/espadas
  const armW=W*0.14, armH=H*0.4;
  const lax=torsoX-armW+(isAtk?-W*0.06:0);
  const rax=torsoX+torsoW+(isAtk?W*0.06:0);
  const aGrad=sx.createLinearGradient(lax,torsoY,lax+armW,torsoY+armH);
  aGrad.addColorStop(0,'#550000'); aGrad.addColorStop(1,'#220000');
  sx.fillStyle=aGrad;
  sx.fillRect(lax,torsoY+H*0.02,armW,armH);
  sx.fillRect(rax,torsoY+H*0.02,armW,armH);
  // Espinhos nos braços
  sx.fillStyle='#ff2200';
  for(let i=0;i<4;i++){
    const sy2=torsoY+H*0.05+i*H*0.09;
    sx.beginPath(); sx.moveTo(lax,sy2); sx.lineTo(lax-W*0.05,sy2+H*0.03); sx.lineTo(lax,sy2+H*0.06); sx.closePath(); sx.fill();
    sx.beginPath(); sx.moveTo(rax+armW,sy2); sx.lineTo(rax+armW+W*0.05,sy2+H*0.03); sx.lineTo(rax+armW,sy2+H*0.06); sx.closePath(); sx.fill();
  }
  // Garras
  sx.fillStyle='#1a0000';
  sx.beginPath(); sx.arc(lax+armW/2,torsoY+armH+H*0.02,W*0.09,0,Math.PI*2); sx.fill();
  sx.beginPath(); sx.arc(rax+armW/2,torsoY+armH+H*0.02,W*0.09,0,Math.PI*2); sx.fill();
  // Garras pontiagudas
  sx.fillStyle='#550000';
  for(let i=0;i<3;i++){
    const gx1=lax+W*0.03+i*W*0.05; sx.beginPath(); sx.moveTo(gx1,torsoY+armH+H*0.02); sx.lineTo(gx1-W*0.015,torsoY+armH+H*0.08); sx.lineTo(gx1+W*0.03,torsoY+armH+H*0.02); sx.closePath(); sx.fill();
    const gx2=rax+W*0.03+i*W*0.05; sx.beginPath(); sx.moveTo(gx2,torsoY+armH+H*0.02); sx.lineTo(gx2-W*0.015,torsoY+armH+H*0.08); sx.lineTo(gx2+W*0.03,torsoY+armH+H*0.02); sx.closePath(); sx.fill();
  }
  // Ombreiras com espinhos
  sx.fillStyle='#cc0000';
  for(let i=0;i<4;i++){
    const s2=i/3;
    sx.beginPath(); sx.moveTo(torsoX+s2*torsoW*0.3,torsoY); sx.lineTo(torsoX+s2*torsoW*0.3+W*0.02,torsoY-H*0.07+i*H*0.01); sx.lineTo(torsoX+s2*torsoW*0.3+W*0.04,torsoY); sx.closePath(); sx.fill();
    sx.beginPath(); sx.moveTo(torsoX+torsoW-s2*torsoW*0.3,torsoY); sx.lineTo(torsoX+torsoW-s2*torsoW*0.3+W*0.02,torsoY-H*0.07+i*H*0.01); sx.lineTo(torsoX+torsoW-s2*torsoW*0.3+W*0.04,torsoY); sx.closePath(); sx.fill();
  }

  // Cabeça monstruosa
  const headW=W*0.46, headH=H*0.30;
  const headX=cx-headW/2, headY=torsoY-headH-H*0.02;
  const hGrad=sx.createRadialGradient(cx,headY+headH*0.4,headW*0.04,cx,headY+headH*0.4,headW*0.7);
  hGrad.addColorStop(0,'#cc2200'); hGrad.addColorStop(1,'#1a0000');
  sx.fillStyle=hGrad;
  sx.beginPath(); sx.ellipse(cx,headY+headH*0.52,headW*0.5,headH*0.52,0,0,Math.PI*2); sx.fill();

  // Chifres grandes e curvados
  sx.fillStyle='#661100';
  sx.beginPath(); sx.moveTo(headX+headW*0.18,headY+headH*0.15); sx.quadraticCurveTo(headX,headY-headH*0.2,headX+headW*0.08,headY-headH*0.15); sx.quadraticCurveTo(headX+headW*0.14,headY-headH*0.05,headX+headW*0.28,headY+headH*0.22); sx.fill();
  sx.beginPath(); sx.moveTo(headX+headW*0.82,headY+headH*0.15); sx.quadraticCurveTo(headX+headW,headY-headH*0.2,headX+headW*0.92,headY-headH*0.15); sx.quadraticCurveTo(headX+headW*0.86,headY-headH*0.05,headX+headW*0.72,headY+headH*0.22); sx.fill();

  // Olhos brilhando laranja
  const ew=headW*0.22, eh=headH*0.28;
  const lEyeGrad=sx.createRadialGradient(headX+headW*0.22,headY+headH*0.28,0,headX+headW*0.22,headY+headH*0.28,ew*0.5);
  lEyeGrad.addColorStop(0,'#ffee00'); lEyeGrad.addColorStop(0.5,'#ff6600'); lEyeGrad.addColorStop(1,'#660000');
  sx.fillStyle=lEyeGrad; sx.fillRect(headX+headW*0.10,headY+headH*0.20,ew,eh);
  const rEyeGrad=sx.createRadialGradient(headX+headW*0.78,headY+headH*0.28,0,headX+headW*0.78,headY+headH*0.28,ew*0.5);
  rEyeGrad.addColorStop(0,'#ffee00'); rEyeGrad.addColorStop(0.5,'#ff6600'); rEyeGrad.addColorStop(1,'#660000');
  sx.fillStyle=rEyeGrad; sx.fillRect(headX+headW*0.68,headY+headH*0.20,ew,eh);
  // Brilho do olho
  sx.fillStyle='#ffffaa';
  sx.beginPath(); sx.arc(headX+headW*0.16,headY+headH*0.22,ew*0.12,0,Math.PI*2); sx.fill();
  sx.beginPath(); sx.arc(headX+headW*0.72,headY+headH*0.22,ew*0.12,0,Math.PI*2); sx.fill();

  // Boca rasgada com dentes
  sx.fillStyle='#0a0000';
  sx.fillRect(headX+headW*0.18,headY+headH*0.64,headW*0.64,headH*0.26);
  sx.fillStyle='#cc0000';
  sx.fillRect(headX+headW*0.2,headY+headH*0.67,headW*0.6,headH*0.1);
  sx.fillStyle='#eeddcc';
  const toothW2=headW*0.08;
  for(let i=0;i<6;i++){
    const tx2=headX+headW*(0.2+i*0.105);
    sx.beginPath(); sx.moveTo(tx2,headY+headH*0.66); sx.lineTo(tx2+toothW2,headY+headH*0.66); sx.lineTo(tx2+toothW2/2,headY+headH*0.86); sx.closePath(); sx.fill();
    sx.beginPath(); sx.moveTo(tx2,headY+headH*0.9); sx.lineTo(tx2+toothW2,headY+headH*0.9); sx.lineTo(tx2+toothW2/2,headY+headH*0.7); sx.closePath(); sx.fill();
  }
}

// Utilidade de cor mais escura/clara
function shadeColor(hex, factor) {
  let r = parseInt(hex.slice(1,3),16);
  let g = parseInt(hex.slice(3,5),16);
  let b = parseInt(hex.slice(5,7),16);
  r = Math.min(255, Math.floor(r * factor));
  g = Math.min(255, Math.floor(g * factor));
  b = Math.min(255, Math.floor(b * factor));
  return `rgb(${r},${g},${b})`;
}

/* ═══════════════════════════════════════════════
   ARMA NA MÃO (HUD)
═══════════════════════════════════════════════ */
const weaponCanvas = document.createElement('canvas');
const weaponCtx    = weaponCanvas.getContext('2d');
weaponCanvas.width  = 200;
weaponCanvas.height = 160;

function drawWeapon() {
  const wpn = WEAPONS[player.weapon];
  const cx2 = document.createElement('canvas');
  cx2.width = WIDTH; cx2.height = HEIGHT;
  const wctx = cx2.getContext('2d');
  const t = Date.now() / 200;
  const bob = Math.sin(t * (keys.shift?2:1)) * (keys.w||keys.s||keys.a||keys.d ? 4 : 0);
  const ox = WIDTH * 0.55, oy = HEIGHT * 0.60 + bob;
  const s = Math.max(0.5, Math.min(2, WIDTH/320));

  if (player.weapon === 'knife') {
    drawButterflyKnife(wctx, ox, oy, s);
  } else {
    drawGun(wctx, ox, oy, s, player.weapon);
  }
  ctx.drawImage(cx2, 0, 0);
}

function drawGun(wctx, ox, oy, s, type) {
  wctx.save();
  const recoil = player.shootCooldown > 0 ? Math.min(1, player.shootCooldown / WEAPONS[type].fireRate) * 10 : 0;
  const breathe = Math.sin(Date.now()/1800) * 1.5;
  wctx.translate(0, recoil + breathe);

  if (type === 'pistol') {
    // ── Pistola estilo Doom — compacta, metálica realista ──
    // Mão/luva mais realista
    const handGrad = wctx.createRadialGradient(ox+8*s, oy+28*s, 2*s, ox+10*s, oy+24*s, 18*s);
    handGrad.addColorStop(0, '#5a3820'); handGrad.addColorStop(0.5, '#3a2010'); handGrad.addColorStop(1, '#1a0c04');
    wctx.fillStyle = handGrad;
    wctx.beginPath(); wctx.ellipse(ox+10*s, oy+26*s, 16*s, 11*s, 0.1, 0, Math.PI*2); wctx.fill();
    // Dedos
    wctx.fillStyle = '#4a2c18';
    for(let fi=0;fi<3;fi++) wctx.fillRect(ox+(2+fi*4)*s, oy+18*s, 3*s, 10*s);
    wctx.fillStyle = '#2a1808';
    for(let fi=0;fi<3;fi++) wctx.fillRect(ox+(2+fi*4)*s, oy+22*s, 3*s, 2*s);

    // Cabo com textura de grip
    const hGrad = wctx.createLinearGradient(ox+4*s, oy, ox+20*s, oy+30*s);
    hGrad.addColorStop(0,'#6a4228'); hGrad.addColorStop(0.3,'#4a2e18'); hGrad.addColorStop(1,'#1a0a04');
    wctx.fillStyle = hGrad;
    wctx.fillRect(ox+4*s, oy-4*s, 15*s, 30*s);
    // Textura grip (quadrícula)
    wctx.fillStyle = 'rgba(0,0,0,0.25)';
    for(let gi=0;gi<7;gi++) { wctx.fillRect(ox+5*s, oy-2*s+gi*4*s, 13*s, 1.5*s); }
    for(let gc=0;gc<4;gc++) { wctx.fillRect(ox+5*s+gc*3.5*s, oy-2*s, 1.5*s, 27*s); }
    // Highlight grip
    wctx.fillStyle='rgba(255,200,150,0.08)';
    wctx.fillRect(ox+5*s, oy-2*s, 4*s, 27*s);

    // Corpo principal com gradiente metálico
    const gGrad = wctx.createLinearGradient(ox-2*s, oy-16*s, ox+20*s, oy+6*s);
    gGrad.addColorStop(0, '#c0c0c0'); gGrad.addColorStop(0.2, '#909090'); gGrad.addColorStop(0.6, '#606060'); gGrad.addColorStop(1, '#303030');
    wctx.fillStyle = gGrad;
    wctx.fillRect(ox-2*s, oy-16*s, 22*s, 15*s);
    // Marcas de usinagem no slide
    wctx.fillStyle='rgba(0,0,0,0.15)';
    for(let si=0;si<5;si++) wctx.fillRect(ox+2*s+si*3.5*s, oy-15*s, 1.5*s, 12*s);
    // Brilho lateral do slide
    wctx.fillStyle='rgba(255,255,255,0.18)';
    wctx.fillRect(ox-1*s, oy-16*s, 2*s, 15*s);

    // Cano com sombra interna
    const barrelGrad = wctx.createLinearGradient(ox-4*s, oy-24*s, ox-4*s, oy-16*s);
    barrelGrad.addColorStop(0,'#999'); barrelGrad.addColorStop(0.5,'#aaa'); barrelGrad.addColorStop(1,'#555');
    wctx.fillStyle = barrelGrad;
    wctx.fillRect(ox-4*s, oy-24*s, 16*s, 9*s);
    // Abertura do cano
    wctx.fillStyle='#111';
    wctx.beginPath(); wctx.arc(ox-4*s, oy-20*s, 3*s, 0, Math.PI*2); wctx.fill();
    wctx.fillStyle='#333'; wctx.beginPath(); wctx.arc(ox-4*s, oy-20*s, 1.8*s, 0, Math.PI*2); wctx.fill();

    // Gatilho detalhado
    wctx.fillStyle='#333';
    wctx.beginPath(); wctx.moveTo(ox+5*s, oy-4*s); wctx.lineTo(ox+8*s, oy+8*s); wctx.lineTo(ox+12*s, oy+8*s); wctx.lineTo(ox+12*s, oy-4*s); wctx.fill();
    wctx.strokeStyle='#555'; wctx.lineWidth=s*0.8;
    wctx.strokeRect(ox+4*s, oy-6*s, 12*s, 16*s);
    // Mira traseira
    wctx.fillStyle='#bbb';
    wctx.fillRect(ox+8*s, oy-24*s, 4*s, 2.5*s);
    wctx.fillStyle='#333'; wctx.fillRect(ox+10*s, oy-24*s, 1.5*s, 2.5*s);
    // Mira dianteira
    wctx.fillStyle='#ddd'; wctx.fillRect(ox-3*s, oy-27*s, 3*s, 5*s);
    wctx.fillStyle='#ff3300';
    wctx.beginPath(); wctx.arc(ox-2*s, oy-27*s, 1.2*s, 0, Math.PI*2); wctx.fill();
    // Parafuso de montagem
    wctx.fillStyle='#444';
    wctx.beginPath(); wctx.arc(ox+14*s, oy-8*s, 2*s, 0, Math.PI*2); wctx.fill();
    wctx.strokeStyle='#666'; wctx.lineWidth=0.6*s;
    wctx.beginPath(); wctx.moveTo(ox+12*s,oy-8*s); wctx.lineTo(ox+16*s,oy-8*s); wctx.stroke();

  } else if (type === 'shotgun') {
    // ── Escopeta dupla — estilo Doom, realista ──
    // Mão esquerda no forend
    const hand2Grad = wctx.createRadialGradient(ox-20*s, oy+4*s, 2*s, ox-20*s, oy+2*s, 14*s);
    hand2Grad.addColorStop(0,'#5a3820'); hand2Grad.addColorStop(1,'#1a0c04');
    wctx.fillStyle=hand2Grad;
    wctx.beginPath(); wctx.ellipse(ox-20*s, oy+4*s, 14*s, 9*s, -0.15, 0, Math.PI*2); wctx.fill();
    // Mão direita no cabo
    const hand3Grad = wctx.createRadialGradient(ox+8*s, oy+28*s, 2*s, ox+8*s, oy+26*s, 16*s);
    hand3Grad.addColorStop(0,'#5a3820'); hand3Grad.addColorStop(1,'#1a0c04');
    wctx.fillStyle=hand3Grad;
    wctx.beginPath(); wctx.ellipse(ox+8*s, oy+28*s, 14*s, 10*s, 0, 0, Math.PI*2); wctx.fill();

    // Canos duplos com gradiente metálico
    const barrelGradS = wctx.createLinearGradient(ox-44*s, oy-22*s, ox-44*s, oy-8*s);
    barrelGradS.addColorStop(0,'#999'); barrelGradS.addColorStop(0.4,'#aaa'); barrelGradS.addColorStop(0.7,'#777'); barrelGradS.addColorStop(1,'#444');
    wctx.fillStyle=barrelGradS;
    wctx.fillRect(ox-46*s, oy-22*s, 52*s, 9*s);
    wctx.fillRect(ox-46*s, oy-12*s, 52*s, 9*s);
    // Nervuras dos canos
    wctx.fillStyle='rgba(0,0,0,0.2)';
    for(let ni=0;ni<6;ni++) wctx.fillRect(ox-44*s+ni*8*s, oy-22*s, 1.5*s, 20*s);
    // Aberturas dos canos
    wctx.fillStyle='#0a0a0a';
    wctx.beginPath(); wctx.ellipse(ox-46*s, oy-17.5*s, 4*s, 3.8*s, 0, 0, Math.PI*2); wctx.fill();
    wctx.beginPath(); wctx.ellipse(ox-46*s, oy-7.5*s, 4*s, 3.8*s, 0, 0, Math.PI*2); wctx.fill();
    wctx.fillStyle='#252525';
    wctx.beginPath(); wctx.ellipse(ox-46*s, oy-17.5*s, 2.5*s, 2.3*s, 0, 0, Math.PI*2); wctx.fill();
    wctx.beginPath(); wctx.ellipse(ox-46*s, oy-7.5*s, 2.5*s, 2.3*s, 0, 0, Math.PI*2); wctx.fill();
    // Anel dos canos
    wctx.fillStyle='#555'; wctx.fillRect(ox-3*s, oy-23*s, 5*s, 21*s);
    wctx.fillStyle='#333'; wctx.fillRect(ox-20*s, oy-22*s, 5*s, 20*s);

    // Forend (parte de madeira da frente)
    const bGrad = wctx.createLinearGradient(ox-22*s, oy-16*s, ox+6*s, oy+10*s);
    bGrad.addColorStop(0,'#7a4e2a'); bGrad.addColorStop(0.3,'#5a3820'); bGrad.addColorStop(0.7,'#3a2410'); bGrad.addColorStop(1,'#1a0c04');
    wctx.fillStyle=bGrad;
    wctx.fillRect(ox-24*s, oy-16*s, 30*s, 19*s);
    // Textura da madeira
    wctx.strokeStyle='rgba(0,0,0,0.2)'; wctx.lineWidth=0.6*s;
    for(let wi=0;wi<5;wi++) { wctx.beginPath(); wctx.moveTo(ox-24*s,oy-15*s+wi*3.5*s); wctx.lineTo(ox+6*s,oy-14*s+wi*3.5*s); wctx.stroke(); }
    wctx.fillStyle='rgba(255,200,150,0.08)';
    wctx.fillRect(ox-23*s, oy-16*s, 6*s, 19*s);

    // Corpo receptor
    const recvGrad = wctx.createLinearGradient(ox-5*s, oy-14*s, ox+6*s, oy+5*s);
    recvGrad.addColorStop(0,'#555'); recvGrad.addColorStop(0.5,'#3a3a3a'); recvGrad.addColorStop(1,'#1a1a1a');
    wctx.fillStyle=recvGrad; wctx.fillRect(ox-6*s, oy-16*s, 14*s, 20*s);
    wctx.fillStyle='rgba(255,255,255,0.1)'; wctx.fillRect(ox-5*s, oy-15*s, 2*s, 18*s);

    // Gatilho
    wctx.fillStyle='#444'; wctx.fillRect(ox-3*s, oy, 9*s, 13*s);
    wctx.fillStyle='#333';
    wctx.beginPath(); wctx.moveTo(ox,oy+2*s); wctx.lineTo(ox+3*s,oy+10*s); wctx.lineTo(ox+6*s,oy+8*s); wctx.lineTo(ox+4*s,oy+2*s); wctx.fill();

    // Cabo (madeira detalhada)
    const hGrad2 = wctx.createLinearGradient(ox, oy, ox+20*s, oy+32*s);
    hGrad2.addColorStop(0,'#8a5030'); hGrad2.addColorStop(0.2,'#6a3c20'); hGrad2.addColorStop(0.7,'#3a2010'); hGrad2.addColorStop(1,'#1a0c04');
    wctx.fillStyle=hGrad2;
    wctx.fillRect(ox, oy, 19*s, 32*s);
    wctx.strokeStyle='rgba(0,0,0,0.15)'; wctx.lineWidth=0.7*s;
    for(let wi=0;wi<8;wi++) { wctx.beginPath(); wctx.moveTo(ox+1*s,oy+wi*3.8*s); wctx.lineTo(ox+18*s,oy+1*s+wi*3.8*s); wctx.stroke(); }
    wctx.fillStyle='rgba(255,200,150,0.1)'; wctx.fillRect(ox+1*s, oy, 5*s, 32*s);

  } else if (type === 'machinegun') {
    // ── Metralhadora — pesada, realista ──
    // Mão no grip
    const hand4Grad = wctx.createRadialGradient(ox+10*s, oy+28*s, 2*s, ox+10*s, oy+26*s, 18*s);
    hand4Grad.addColorStop(0,'#5a3820'); hand4Grad.addColorStop(1,'#1a0c04');
    wctx.fillStyle=hand4Grad;
    wctx.beginPath(); wctx.ellipse(ox+10*s, oy+28*s, 16*s, 11*s, 0, 0, Math.PI*2); wctx.fill();
    // Dedos
    wctx.fillStyle='#4a2c18';
    for(let fi=0;fi<3;fi++) wctx.fillRect(ox+(2+fi*4)*s, oy+20*s, 3*s, 10*s);

    // Cano longo com dissipador de calor
    const barrelGradMG = wctx.createLinearGradient(ox-62*s, oy-20*s, ox-62*s, oy-8*s);
    barrelGradMG.addColorStop(0,'#aaa'); barrelGradMG.addColorStop(0.4,'#888'); barrelGradMG.addColorStop(1,'#444');
    wctx.fillStyle=barrelGradMG;
    wctx.fillRect(ox-64*s, oy-20*s, 70*s, 9*s);
    // Nervuras de resfriamento
    for(let ni=0;ni<12;ni++){
      wctx.fillStyle=ni%2===0?'#555':'#333';
      wctx.fillRect(ox-64*s+ni*5.5*s, oy-20*s, 3*s, 9*s);
    }
    // Boca do cano com supressor
    wctx.fillStyle='#222'; wctx.fillRect(ox-72*s, oy-22*s, 10*s, 13*s);
    wctx.fillStyle='#1a1a1a';
    wctx.beginPath(); wctx.ellipse(ox-72*s, oy-15.5*s, 5*s, 5*s, 0, 0, Math.PI*2); wctx.fill();
    wctx.fillStyle='#111'; wctx.beginPath(); wctx.ellipse(ox-72*s, oy-15.5*s, 3*s, 3*s, 0, 0, Math.PI*2); wctx.fill();
    // Brilho do cano
    wctx.fillStyle='rgba(255,255,255,0.12)'; wctx.fillRect(ox-64*s, oy-20*s, 70*s, 2*s);

    // Caixinha (receiver)
    const bGrad2 = wctx.createLinearGradient(ox-30*s, oy-22*s, ox+12*s, oy+8*s);
    bGrad2.addColorStop(0,'#606060'); bGrad2.addColorStop(0.3,'#484848'); bGrad2.addColorStop(0.7,'#303030'); bGrad2.addColorStop(1,'#181818');
    wctx.fillStyle=bGrad2;
    wctx.fillRect(ox-32*s, oy-22*s, 44*s, 22*s);
    // Brilho metálico
    wctx.fillStyle='rgba(255,255,255,0.12)'; wctx.fillRect(ox-32*s, oy-22*s, 44*s, 3*s);
    wctx.fillStyle='rgba(0,0,0,0.2)'; wctx.fillRect(ox-32*s, oy-4*s, 44*s, 4*s);
    // Mira holográfica
    wctx.fillStyle='#333'; wctx.fillRect(ox-18*s, oy-28*s, 14*s, 8*s);
    wctx.fillStyle='rgba(0,200,255,0.6)';
    wctx.beginPath(); wctx.arc(ox-11*s, oy-24*s, 4*s, 0, Math.PI*2); wctx.stroke();
    wctx.strokeStyle='rgba(0,220,255,0.8)'; wctx.lineWidth=0.8*s;
    wctx.beginPath(); wctx.moveTo(ox-11*s-4*s, oy-24*s); wctx.lineTo(ox-11*s+4*s, oy-24*s); wctx.stroke();
    wctx.beginPath(); wctx.moveTo(ox-11*s, oy-24*s-4*s); wctx.lineTo(ox-11*s, oy-24*s+4*s); wctx.stroke();
    // Carregador curvo grande
    const magGrad = wctx.createLinearGradient(ox-12*s, oy, ox-4*s, oy+28*s);
    magGrad.addColorStop(0,'#996600'); magGrad.addColorStop(0.4,'#775500'); magGrad.addColorStop(1,'#333300');
    wctx.fillStyle=magGrad;
    wctx.fillRect(ox-14*s, oy-2*s, 10*s, 28*s);
    // Cartuchos visíveis no carregador
    wctx.fillStyle='rgba(200,180,60,0.4)';
    for(let bi=0;bi<6;bi++) wctx.fillRect(ox-13*s, oy+1*s+bi*4*s, 8*s, 2.5*s);
    // Grip (empunhadura pistol grip)
    const hGrad3 = wctx.createLinearGradient(ox, oy-2*s, ox+20*s, oy+28*s);
    hGrad3.addColorStop(0,'#5a3820'); hGrad3.addColorStop(0.5,'#3a2010'); hGrad3.addColorStop(1,'#1a0804');
    wctx.fillStyle=hGrad3;
    wctx.fillRect(ox, oy-2*s, 20*s, 30*s);
    wctx.fillStyle='rgba(0,0,0,0.25)';
    for(let gi=0;gi<8;gi++) wctx.fillRect(ox+1*s, oy+gi*3.5*s, 18*s, 1.5*s);
    wctx.fillStyle='rgba(255,200,150,0.07)'; wctx.fillRect(ox+1*s, oy-2*s, 4*s, 28*s);
    // Cabo traseiro (stock)
    wctx.fillStyle='#333'; wctx.fillRect(ox+18*s, oy-4*s, 6*s, 14*s);
    wctx.fillStyle='#222'; wctx.fillRect(ox+20*s, oy-2*s, 4*s, 10*s);
  }

  // Flash do tiro — mais bonito
  if (player.shootCooldown > WEAPONS[type].fireRate * 0.65) {
    const flashAlpha = (player.shootCooldown / WEAPONS[type].fireRate);
    const flashX = type==='shotgun' ? ox-46*s : type==='machinegun' ? ox-72*s : ox-4*s;
    const flashY = type==='shotgun' ? oy-15*s : type==='machinegun' ? oy-15.5*s : oy-20*s;
    wctx.save();
    // Brilho externo
    const flashGlow = wctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, 30*s);
    flashGlow.addColorStop(0,`rgba(255,220,80,${flashAlpha*0.5})`);
    flashGlow.addColorStop(0.5,`rgba(255,120,0,${flashAlpha*0.3})`);
    flashGlow.addColorStop(1,'rgba(255,60,0,0)');
    wctx.fillStyle=flashGlow; wctx.beginPath(); wctx.arc(flashX, flashY, 30*s, 0, Math.PI*2); wctx.fill();
    // Core branco quente
    wctx.globalAlpha=flashAlpha*0.9;
    wctx.fillStyle='#ffffaa'; wctx.beginPath(); wctx.arc(flashX, flashY, 10*s, 0, Math.PI*2); wctx.fill();
    wctx.fillStyle='#ffffff'; wctx.beginPath(); wctx.arc(flashX, flashY, 4*s, 0, Math.PI*2); wctx.fill();
    // Raios do flash
    wctx.strokeStyle=`rgba(255,200,80,${flashAlpha*0.7})`; wctx.lineWidth=2*s;
    for(let ri=0;ri<8;ri++){
      const ra=ri*Math.PI/4;
      wctx.beginPath(); wctx.moveTo(flashX, flashY);
      wctx.lineTo(flashX+Math.cos(ra)*22*s, flashY+Math.sin(ra)*22*s); wctx.stroke();
    }
    wctx.restore();
  }

  wctx.restore();
}

function _drawGunV2(wctx, ox, oy, s, type) {
  wctx.save();
  const recoil = player.shootCooldown > 0 ? Math.min(1, player.shootCooldown / WEAPONS[type].fireRate) * 8 : 0;
  wctx.translate(0, recoil);

  if (type === 'pistol') {
    // Pistola estilo Doom — compacta, metálica
    // Cano
    wctx.fillStyle = '#888';
    wctx.fillRect(ox-4*s, oy-22*s, 14*s, 6*s);
    wctx.fillStyle = '#555';
    wctx.fillRect(ox-4*s, oy-20*s, 14*s, 2*s);
    // Corpo
    const gGrad = wctx.createLinearGradient(ox-2*s, oy-16*s, ox+18*s, oy+10*s);
    gGrad.addColorStop(0, '#999'); gGrad.addColorStop(0.5, '#666'); gGrad.addColorStop(1, '#333');
    wctx.fillStyle = gGrad;
    wctx.fillRect(ox-2*s, oy-16*s, 22*s, 14*s);
    // Gatilho
    wctx.fillStyle = '#444';
    wctx.beginPath(); wctx.moveTo(ox+6*s, oy-3*s); wctx.lineTo(ox+9*s, oy+8*s); wctx.lineTo(ox+12*s, oy+8*s); wctx.lineTo(ox+12*s, oy-3*s); wctx.fill();
    // Cabo
    const hGrad = wctx.createLinearGradient(ox+4*s, oy, ox+18*s, oy+30*s);
    hGrad.addColorStop(0,'#553322'); hGrad.addColorStop(1,'#221108');
    wctx.fillStyle = hGrad;
    wctx.fillRect(ox+4*s, oy-2*s, 14*s, 30*s);
    // Striações no cabo
    wctx.fillStyle = 'rgba(0,0,0,0.3)';
    for(let i=0;i<6;i++) wctx.fillRect(ox+5*s, oy+2*s+i*4*s, 12*s, 2*s);
    // Mira
    wctx.fillStyle = '#ccc';
    wctx.fillRect(ox-2*s, oy-24*s, 3*s, 4*s);
    wctx.fillRect(ox+8*s, oy-24*s, 3*s, 2*s);
    // Mão (luva)
    wctx.fillStyle = '#3a2010';
    wctx.beginPath(); wctx.ellipse(ox+10*s, oy+26*s, 14*s, 10*s, 0, 0, Math.PI*2); wctx.fill();

  } else if (type === 'shotgun') {
    // Escopeta — cano duplo estilo Doom
    const gGrad = wctx.createLinearGradient(ox-30*s, oy-20*s, ox+5*s, oy);
    gGrad.addColorStop(0, '#888'); gGrad.addColorStop(1, '#444');
    wctx.fillStyle = gGrad;
    wctx.fillRect(ox-42*s, oy-20*s, 50*s, 8*s);
    wctx.fillRect(ox-42*s, oy-12*s, 50*s, 8*s);
    wctx.fillStyle = '#333';
    wctx.fillRect(ox-44*s, oy-22*s, 4*s, 10*s);
    wctx.fillRect(ox-44*s, oy-13*s, 4*s, 10*s);
    // Corpo
    const bGrad = wctx.createLinearGradient(ox-20*s, oy-14*s, ox+20*s, oy+10*s);
    bGrad.addColorStop(0,'#553322'); bGrad.addColorStop(1,'#1a0a04');
    wctx.fillStyle = bGrad;
    wctx.fillRect(ox-22*s, oy-16*s, 28*s, 18*s);
    // Cano inferior visível
    wctx.fillStyle = '#777';
    wctx.fillRect(ox-42*s, oy-9*s, 50*s, 3*s);
    // Gatilho
    wctx.fillStyle = '#555'; wctx.fillRect(ox-2*s, oy, 8*s, 14*s);
    // Cabo
    const hGrad2 = wctx.createLinearGradient(ox, oy, ox+18*s, oy+32*s);
    hGrad2.addColorStop(0,'#774433'); hGrad2.addColorStop(1,'#221108');
    wctx.fillStyle = hGrad2;
    wctx.fillRect(ox, oy, 18*s, 32*s);
    // Mão
    wctx.fillStyle = '#3a2010';
    wctx.beginPath(); wctx.ellipse(ox+8*s, oy+28*s, 14*s, 10*s, 0, 0, Math.PI*2); wctx.fill();

  } else if (type === 'machinegun') {
    // Metralhadora
    const gGrad = wctx.createLinearGradient(ox-55*s, oy-18*s, ox+5*s, oy);
    gGrad.addColorStop(0,'#777'); gGrad.addColorStop(0.5,'#555'); gGrad.addColorStop(1,'#333');
    wctx.fillStyle = gGrad;
    // Cano longo
    wctx.fillRect(ox-60*s, oy-18*s, 66*s, 7*s);
    wctx.fillStyle = '#444';
    wctx.fillRect(ox-60*s, oy-18*s, 3*s, 7*s);
    // Caixinha da metralhadora
    wctx.fillStyle = '#555';
    wctx.fillRect(ox-30*s, oy-22*s, 18*s, 8*s);
    // Corpo principal
    const bGrad2 = wctx.createLinearGradient(ox-25*s,oy-14*s,ox+10*s,oy+8*s);
    bGrad2.addColorStop(0,'#666'); bGrad2.addColorStop(1,'#333');
    wctx.fillStyle = bGrad2;
    wctx.fillRect(ox-28*s, oy-14*s, 34*s, 16*s);
    // Pente de munição
    wctx.fillStyle = '#886600';
    wctx.fillRect(ox-10*s, oy, 8*s, 20*s);
    for(let i=0;i<8;i++) wctx.fillRect(ox-10*s+i*1.1*s, oy+1*s, 0.8*s, 20*s);
    // Cabo
    const hGrad3 = wctx.createLinearGradient(ox,oy-2*s,ox+18*s,oy+28*s);
    hGrad3.addColorStop(0,'#553322'); hGrad3.addColorStop(1,'#1a0a04');
    wctx.fillStyle = hGrad3;
    wctx.fillRect(ox, oy-2*s, 18*s, 28*s);
    // Mão
    wctx.fillStyle = '#3a2010';
    wctx.beginPath(); wctx.ellipse(ox+8*s, oy+24*s, 14*s, 10*s, 0, 0, Math.PI*2); wctx.fill();
  }

  // Flash do tiro
  if (player.shootCooldown > WEAPONS[type].fireRate * 0.7) {
    wctx.save();
    wctx.globalAlpha = player.shootCooldown / WEAPONS[type].fireRate * 0.8;
    wctx.fillStyle = '#ffee66';
    wctx.beginPath(); wctx.arc(ox-4*s, oy-22*s, 12*s, 0, Math.PI*2); wctx.fill();
    wctx.fillStyle = '#ffffff';
    wctx.beginPath(); wctx.arc(ox-4*s, oy-22*s, 5*s, 0, Math.PI*2); wctx.fill();
    wctx.restore();
  }

  wctx.restore();
}

function drawButterflyKnife(cx2, ox, oy, s) {
  cx2.save();
  const inspecting = knifeInspecting;
  cx2.translate(ox, oy);
  if (inspecting) {
    cx2.rotate(knifeFlipAnim * 0.3);
    cx2.translate(0, -20*s*Math.abs(Math.sin(knifeFlipAnim)));
  }
  // Lâmina
  const bGrad = cx2.createLinearGradient(-4*s, -100*s, 12*s, 0);
  bGrad.addColorStop(0,'#dddddd'); bGrad.addColorStop(0.4,'#aaaaaa'); bGrad.addColorStop(0.8,'#777'); bGrad.addColorStop(1,'#555');
  cx2.fillStyle = bGrad;
  cx2.beginPath();
  cx2.moveTo(-2*s, 0); cx2.lineTo(12*s, 0); cx2.lineTo(8*s, -85*s);
  cx2.lineTo(0*s, -100*s); cx2.lineTo(-4*s, -85*s); cx2.closePath(); cx2.fill();
  cx2.strokeStyle = '#ffffff'; cx2.lineWidth = 1*s;
  cx2.beginPath(); cx2.moveTo(2*s, 0); cx2.lineTo(-2*s, -30*s); cx2.lineTo(8*s, -100*s); cx2.stroke();
  // Talão
  cx2.fillStyle = '#666'; cx2.fillRect(2*s, -5*s, 14*s, 5*s);
  // Pino
  cx2.fillStyle = '#333'; cx2.beginPath(); cx2.arc(9*s, 2*s, 4*s, 0, Math.PI*2); cx2.fill();
  cx2.fillStyle = '#aaa'; cx2.beginPath(); cx2.arc(9*s, 2*s, 2*s, 0, Math.PI*2); cx2.fill();
  // Cabos (butterfly)
  const anim = inspecting ? knifeFlipAnim : 0.3;
  const h1a = Math.min(anim, Math.PI) * 0.8;
  const h2a = -Math.min(anim, Math.PI) * 0.8;
  cx2.save(); cx2.translate(9*s, 4*s); cx2.rotate(h1a); drawKnifeHandle(cx2, 0, 0, s, '#111','#222','#1a1a1a'); cx2.restore();
  cx2.save(); cx2.translate(9*s, 4*s); cx2.rotate(h2a); drawKnifeHandle(cx2, 0, 0, s, '#0d0d0d','#1a1a1a','#111'); cx2.restore();
  cx2.restore();
}

function drawKnifeHandle(cx2, ox, oy, s, c1, c2, c3) {
  const hGrad = cx2.createLinearGradient(ox-3*s, oy, ox+11*s, oy);
  hGrad.addColorStop(0,c1); hGrad.addColorStop(0.5,c2); hGrad.addColorStop(1,c3);
  cx2.fillStyle = hGrad;
  cx2.fillRect(ox-3*s, oy, 14*s, 50*s);
  cx2.fillStyle = 'rgba(255,255,255,0.06)';
  for(let i=0;i<6;i++) cx2.fillRect(ox-2*s, oy+6*s+i*7*s, 12*s, 3*s);
  cx2.fillStyle='#555'; cx2.beginPath(); cx2.arc(ox+4*s, oy+44*s, 3*s, 0, Math.PI*2); cx2.fill();
  cx2.fillStyle='#888'; cx2.beginPath(); cx2.arc(ox+4*s, oy+44*s, 1.5*s, 0, Math.PI*2); cx2.fill();
  cx2.fillStyle='#555'; cx2.beginPath(); cx2.arc(ox+4*s, oy+15*s, 2.5*s, 0, Math.PI*2); cx2.fill();
  cx2.beginPath(); cx2.arc(ox+4*s, oy+30*s, 2.5*s, 0, Math.PI*2); cx2.fill();
}

/* ═══════════════════════════════════════════════
   MINI MAPA
═══════════════════════════════════════════════ */
function drawMinimap() {
  const mc=minimapCanvas, mx=minimapCtx;
  const mW=mc.width, mH=mc.height;
  const rows=map.length, cols=map[0].length;
  const cw=mW/cols, ch=mH/rows;
  mx.fillStyle='#050305'; mx.fillRect(0,0,mW,mH);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const cell=map[r][c];
      if(cell){
        const zone = getZoneForRow(r);
        const colors={1:'#553333',2:'#445566',3:'#554433',4:'#332255',5:'#552222'};
        let col2 = colors[cell]||'#553333';
        if(zone===1) col2=shadeColor(col2,1.3);
        if(zone===2) col2='#2a1a44';
        mx.fillStyle=col2;
        mx.fillRect(c*cw,r*ch,cw-0.5,ch-0.5);
      }
    }
  }
  for(const item of items){
    if(item.collected) continue;
    const ic={ammo:'#ffdd00',health:'#33ff66',armor:'#3399ff',shotgun:'#ff8800',machinegun:'#ff4400'};
    mx.fillStyle=ic[item.type]||'#e67e22';
    mx.fillRect(item.x*cw-1.5,item.y*ch-1.5,3,3);
  }
  for(const e of enemies){
    if(e.state==='dead') continue;
    const def=ENEMY_TYPES[e.type];
    mx.fillStyle=def.isBoss?'#ff6600':'#cc2200';
    mx.fillRect(e.x*cw-2,e.y*ch-2,def.isBoss?6:4,def.isBoss?6:4);
  }
  mx.fillStyle='#44ff44';
  mx.beginPath(); mx.arc(player.x*cw,player.y*ch,3,0,Math.PI*2); mx.fill();
  mx.strokeStyle='#44ff44'; mx.lineWidth=1;
  mx.beginPath(); mx.moveTo(player.x*cw,player.y*ch);
  mx.lineTo((player.x+Math.cos(player.angle)*2)*cw,(player.y+Math.sin(player.angle)*2)*ch); mx.stroke();
}

/* ═══════════════════════════════════════════════
   HUD
═══════════════════════════════════════════════ */
function updateHUD() {
  const hp=Math.max(0,player.health);
  document.getElementById('healthBar').style.width=(hp/player.maxHealth*100)+'%';
  document.getElementById('healthVal').textContent=hp;
  const ar=Math.max(0,Math.round(player.armor));
  document.getElementById('armorBar').style.width=(ar/player.maxArmor*100)+'%';
  document.getElementById('armorVal').textContent=ar;
  const wpn=WEAPONS[player.weapon];
  document.getElementById('ammoCount').textContent=wpn.melee?'∞':`${player.ammo} / ${player.reserve}`;
  document.getElementById('weaponName').textContent=wpn.name;
  document.getElementById('killCount').textContent=kills;
  ['pistol','shotgun','machinegun','knife'].forEach((w,i)=>{
    const el=document.getElementById(`ws${i+1}`);
    if(el){ el.classList.toggle('active',player.weapon===w); el.classList.toggle('locked',!player.unlocked[w]); }
  });
}

/* ═══════════════════════════════════════════════
   PORTA TECNOLÓGICA — renderização dos painéis deslizantes
═══════════════════════════════════════════════ */
function drawDoorOverlays() {
  // Para cada porta, renderizar um painel néon deslizante sobre as células
  for (const door of techDoors) {
    const dc = (door.col + door.pairCol) / 2 + 0.5;
    const dr = door.row + 0.5;
    const dx = dc - player.x, dy = dr - player.y;
    const dist = Math.sqrt(dx*dx+dy*dy);
    if (dist > 12 || door.openAmount >= 1) continue;

    // Calcular posição na tela para o painel
    const angle = Math.atan2(dy, dx) - player.angle;
    const norm = Math.atan2(Math.sin(angle), Math.cos(angle));
    if (Math.abs(norm) > FOV * 0.6) continue;

    const screenX = Math.floor((0.5 + norm/FOV) * WIDTH);
    const lineH = Math.abs(Math.floor(HEIGHT / dist));
    const panelW = Math.floor(lineH * 1.0);
    const panelH = lineH;
    const panelY = Math.floor(HEIGHT/2 - panelH/2);
    const fog = Math.max(0, 1 - dist / 16);
    const open = door.openAmount; // 0 = fechado, 1 = aberto

    // Lado esquerdo (desliza para a esquerda)
    const leftX = screenX - panelW/2;
    const leftSlide = open * panelW * 0.5;
    // Lado direito (desliza para a direita)
    const rightSlide = open * panelW * 0.5;

    ctx.save();
    ctx.globalAlpha = fog * (1 - open * 0.9);

    // Painel esquerdo
    const gradL = ctx.createLinearGradient(leftX - leftSlide, panelY, leftX - leftSlide + panelW/2, panelY);
    gradL.addColorStop(0, '#0a1828');
    gradL.addColorStop(0.7, '#0d2035');
    gradL.addColorStop(1, '#1a3050');
    ctx.fillStyle = gradL;
    ctx.fillRect(leftX - leftSlide, panelY, panelW/2, panelH);

    // Painel direito
    const gradR = ctx.createLinearGradient(screenX - rightSlide, panelY, screenX - rightSlide + panelW/2, panelY);
    gradR.addColorStop(0, '#1a3050');
    gradR.addColorStop(0.3, '#0d2035');
    gradR.addColorStop(1, '#0a1828');
    ctx.fillStyle = gradR;
    ctx.fillRect(screenX - rightSlide, panelY, panelW/2, panelH);

    // Linhas néon nas bordas
    ctx.strokeStyle = `rgba(0,200,255,${fog * 0.9 * (1 - open)})`;
    ctx.lineWidth = 2;
    // Borda central (onde os painéis se encontram)
    const midX = screenX - (leftSlide - rightSlide)/2;
    ctx.beginPath(); ctx.moveTo(midX, panelY); ctx.lineTo(midX, panelY + panelH); ctx.stroke();
    // Borda externa esquerda
    ctx.strokeStyle = `rgba(0,160,220,${fog * 0.6 * (1 - open)})`;
    ctx.beginPath(); ctx.moveTo(leftX - leftSlide, panelY); ctx.lineTo(leftX - leftSlide, panelY + panelH); ctx.stroke();
    // Borda externa direita
    ctx.beginPath(); ctx.moveTo(screenX + panelW/2 - rightSlide, panelY); ctx.lineTo(screenX + panelW/2 - rightSlide, panelY + panelH); ctx.stroke();

    // Linhas horizontais de energia
    ctx.strokeStyle = `rgba(0,220,255,${fog * 0.4 * (1-open)})`;
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const ly = panelY + panelH * i/5;
      ctx.beginPath(); ctx.moveTo(leftX - leftSlide, ly); ctx.lineTo(screenX + panelW/2 - rightSlide, ly); ctx.stroke();
    }

    // Símbolo de lock no centro quando fechado
    if (open < 0.3) {
      ctx.fillStyle = `rgba(0,220,255,${fog * (0.3 - open) * 3})`;
      ctx.font = `bold ${Math.floor(panelH * 0.12)}px Courier New`;
      ctx.textAlign = 'center';
      ctx.fillText('[ E ]', screenX, panelY + panelH * 0.5);
    }

    ctx.restore();
  }
}

function drawDoorHint() {
  // Mostrar dica de interação na tela quando perto de uma porta
  for (const door of techDoors) {
    const dc = (door.col + door.pairCol) / 2 + 0.5;
    const dr = door.row + 0.5;
    const dx2 = dc - player.x, dy2 = dr - player.y;
    const dist2 = Math.sqrt(dx2*dx2+dy2*dy2);
    if (dist2 < 1.8) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,220,255,0.85)';
      ctx.font = `bold ${Math.floor(HEIGHT * 0.032)}px Courier New`;
      ctx.textAlign = 'center';
      const hintY = HEIGHT * 0.38;
      ctx.fillText(door.open ? '[ E ] FECHAR PORTAL' : '[ E ] ABRIR PORTAL', WIDTH/2, hintY);
      ctx.restore();
      break;
    }
  }
}

/* ═══════════════════════════════════════════════
   LOOP PRINCIPAL
═══════════════════════════════════════════════ */
let fpsSmooth=60, frameCount=0, fpsTimer=0;

function gameLoop(timestamp) {
  if (!gameRunning || gamePaused) return;
  const dt=Math.min(timestamp-lastTime,50);
  lastTime=timestamp;
  frameCount++; fpsTimer+=dt;
  if(fpsTimer>=500){ fpsSmooth=Math.round(frameCount/fpsTimer*1000); frameCount=0; fpsTimer=0; document.getElementById('fpsCounter').textContent=`FPS: ${fpsSmooth}`; }
  updatePlayer(dt);
  updateEnemies(dt);
  updateParticles(dt);
  updateDoors(dt);
  castRays();
  drawSprites();
  drawDoorOverlays();
  drawWeapon();
  drawDoorHint();
  drawMinimap();
  animFrame=requestAnimationFrame(gameLoop);
}

/* ═══════════════════════════════════════════════
   BOTÕES
═══════════════════════════════════════════════ */
function resetPlayerProgress() {
  player.unlocked = { pistol:true, knife:true, shotgun:false, machinegun:false };
  player.weapon = 'pistol'; player.armor = 0;
}

function startGame() {
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  resetPlayerProgress();
  loadLevel(0);
  gameRunning=true; gamePaused=false;
  lastTime=performance.now();
  animFrame=requestAnimationFrame(gameLoop);
  setTimeout(() => canvas.requestPointerLock(), 200);
}

function restartGame() {
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('pauseScreen').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  document.getElementById('reloadMsg').classList.add('hidden');
  document.getElementById('bossHPBar').classList.add('hidden');
  knifeInspecting=false;
  resetPlayerProgress();
  loadLevel(0);
  gameRunning=true; gamePaused=false;
  lastTime=performance.now();
  animFrame=requestAnimationFrame(gameLoop);
  canvas.requestPointerLock();
}

window.addEventListener('DOMContentLoaded', () => {
  init();
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('restartBtn').addEventListener('click', restartGame);
  document.getElementById('resumeBtn').addEventListener('click', togglePause);
  document.getElementById('restartFromPauseBtn').addEventListener('click', restartGame);
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== canvas && gameRunning && !gamePaused) {
      setTimeout(() => {
        if (document.pointerLockElement !== canvas && gameRunning && !gamePaused) {
          togglePause();
        }
      }, 300);
    }
  });
});
