import * as THREE from 'three';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

/* ---------------- 载入 ---------------- */
const loader = $('#loader'), loaderBar = $('#loaderBar'), loaderPct = $('#loaderPct');
let loadP = 0;
const loadTimer = setInterval(() => {
  loadP = Math.min(94, loadP + Math.random() * 14);
  loaderBar.style.width = loadP + '%';
  loaderPct.textContent = Math.round(loadP) + '%';
}, 110);
function finishLoad() {
  clearInterval(loadTimer);
  loaderBar.style.width = '100%';
  loaderPct.textContent = '100%';
  document.body.classList.remove('is-loading');
  setTimeout(() => loader.classList.add('is-done'), 260);
}
window.addEventListener('load', () => setTimeout(finishLoad, 420));
setTimeout(finishLoad, 3200);

/* ---------------- 时钟 ---------------- */
const clockEl = $('#clock');
function tickClock() {
  const d = new Date();
  clockEl.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
tickClock();
setInterval(tickClock, 15000);

/* ---------------- 光标 ---------------- */
const cursor = $('#cursor');
const ring = $('.cursor__ring', cursor);
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
window.addEventListener('pointermove', (e) => {
  mx = e.clientX; my = e.clientY;
  cursor.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
}, { passive: true });
function follow() {
  rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
  ring.style.transform = 'translate(' + (rx - mx) + 'px,' + (ry - my) + 'px) translate(-50%,-50%)';
  requestAnimationFrame(follow);
}
if (!prefersReduced && matchMedia('(pointer:fine)').matches) requestAnimationFrame(follow);
document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
const hoverables = 'a, button, [data-cursor], input';
document.addEventListener('pointerover', (e) => {
  if (e.target.closest(hoverables)) cursor.classList.add('is-hover');
});
document.addEventListener('pointerout', (e) => {
  if (e.target.closest(hoverables) && !e.relatedTarget?.closest?.(hoverables)) cursor.classList.remove('is-hover');
});

/* ---------------- 导航 / 进度 ---------------- */
const nav = $('#nav'), progressBar = $('#progressBar');
const navLinks = $$('.nav__links a');
function onScroll() {
  const y = scrollY;
  nav.classList.toggle('is-scrolled', y > 24);
  const h = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
document.documentElement.style.scrollPaddingTop = '78px';

const sectionIds = ['about', 'works', 'skills', 'play', 'contact'];
const secObserver = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) secObserver.observe(el); });

const burger = $('#burger'), mobileLinks = $('.nav__links');
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('is-open');
  mobileLinks.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('no-scroll', open);
});
navLinks.forEach((a) => a.addEventListener('click', () => {
  burger.classList.remove('is-open'); mobileLinks.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}));

/* ---------------- 入场动效 ---------------- */
const revealEls = $$('[data-reveal]');
revealEls.forEach((el) => {
  const siblings = Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal'));
  const idx = Math.max(0, siblings.indexOf(el));
  el.style.setProperty('--d', (idx % 6) * 80 + 'ms');
});
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    revealObs.unobserve(en.target);
  });
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
revealEls.forEach((el) => revealObs.observe(el));

/* ---------------- 数字滚动 ---------------- */
function countUp(el) {
  const target = Number(el.dataset.count || 0);
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const t0 = performance.now();
  function frame(t) {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const statObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { countUp(en.target); statObs.unobserve(en.target); } });
}, { threshold: 0.5 });
$$('[data-count]').forEach((el) => statObs.observe(el));

/* ---------------- 技能条 ---------------- */
const barObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const fill = $('i', en.target);
    fill.style.width = (fill.dataset.fill || 0) + '%';
    barObs.unobserve(en.target);
  });
}, { threshold: 0.4 });
$$('.bars li').forEach((li) => barObs.observe(li));

/* ---------------- 磁吸按钮 ---------------- */
$$('[data-magnetic]').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / r.width;
    const dy = (e.clientY - r.top - r.height / 2) / r.height;
    el.style.transform = 'translate(' + dx * 10 + 'px,' + (dy * 8 - 2) + 'px)';
    el.style.setProperty('--bx', e.clientX - r.left + 'px');
    el.style.setProperty('--by', e.clientY - r.top + 'px');
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

/* ---------------- 卡片倾斜 / 聚光 ---------------- */
$$('[data-tilt]').forEach((card) => {
  const strength = card.classList.contains('work') ? 5 : 7;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', px * 100 + '%');
    card.style.setProperty('--my', py * 100 + '%');
    card.style.transform = 'perspective(900px) rotateX(' + (0.5 - py) * strength + 'deg) rotateY(' + (px - 0.5) * strength + 'deg) translateY(-4px)';
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

/* ---------------- 复制邮箱 ---------------- */
function toast(msg) {
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'toast';
    t.style.cssText = 'position:fixed;left:50%;bottom:38px;transform:translate(-50%,20px);z-index:960;padding:12px 20px;border-radius:99px;background:rgba(10,16,20,.92);border:1px solid rgba(70,224,168,.4);color:#d8fff2;font-size:13px;backdrop-filter:blur(12px);opacity:0;transition:.4s cubic-bezier(.16,1,.3,1);pointer-events:none';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translate(-50%,0)'; });
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translate(-50%,12px)'; }, 2000);
}
function copyText(text) {
  const legacy = () => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-999px;opacity:0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  };
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(legacy);
  }
  return Promise.resolve(legacy());
}
const copyBtn = $('#copyMail');
if (copyBtn) copyBtn.addEventListener('click', async () => {
  const ok = await copyText(copyBtn.dataset.copy);
  toast(ok ? 'QQ 号已复制 · 直接加我就行' : '复制被浏览器拦了，手动记：3434233147');
});


/* ---------------- 作品细节 ---------------- */
const workModal = $('#workModal'), workKicker = $('#workKicker'), workTitle = $('#workTitle'), workBody = $('#workBody'), workList = $('#workList'), workTags = $('#workTags');
const WORKS = [
  {
    kicker: 'Desktop · Plugin',
    title: 'DeepSeek Harness 插件体系',
    body: '桌面上这个 AI 不是网页里的聊天框。它能开 QQ、认窗口、点鼠标、往房间墙上贴一块会自己刷新的面板。插件是热更新的：改一行 JS，下一次调用就生效。真正麻烦的从来不是调 API，而是让它在别人家的窗口上别点错地方。',
    list: ['30+ 个自建工具：截屏、OCR、窗口归位、语音合成、余额告警', '用 cordis patch 声明注入，按需挂到系统提示与工具表', '出错会截图留证，下一次跑之前先看上一张'],
    tags: ['TypeScript', 'IPC', '插件架构'],
  },
  {
    kicker: 'Bot · Windows',
    title: '小鱼 · QQ 助手',
    body: '收信走 Windows 通知中心：每两秒轮询一次 toast，抓出谁在说、说了什么，再决定要不要回。发信更麻烦——先找到真正可见的 QQ 窗口，再 OCR 认标题，确认打开的确实是对的人，才把字打进输入框。群聊、旧窗口、隐身窗口，全都要排除掉。',
    list: ['通知监听 → 会话投递，去重后只回一次', '整窗 OCR 认标题，小裁图放大三倍才认得清', '发送后回读输入框，确认字已经清空才算成功'],
    tags: ['PowerShell', 'OCR', '自动化'],
  },
  {
    kicker: 'WebGL · three.js',
    title: '小鱼的房间',
    body: '五间屋子都是手搓的：客厅有鱼缸和一只赖着不走的猫，厨房有夜景窗，收藏室里立着按立绘重捏的她。点一下地板她会走过去，点一下家具会弹出卡片，讲这件东西背后是哪段代码。',
    list: ['低模几何 + 手写卡通材质，没有用任何模型文件', '可点家具、部位、功能球，命中靠射线 + userData', '墙上面板每 20 秒拉一次数据，账本随花销自己长'],
    tags: ['three.js', '交互', '3D'],
  },
  {
    kicker: 'Data · Canvas',
    title: '用量与余额面板',
    body: '会话日志里每一笔 token 都被翻出来：先解 zstd 块，再按时间累加，按官方分时段价（工作日 9-12、14-18 是双倍）折成钱，最后画成柱子。面板挂在客厅墙上，账本挂在收藏室——抬头就知道今天花了多少。',
    list: ['增量扫描会话日志，文件变小才整份重算', '分时段计价，换算成人民币而不是 token 数', 'Canvas 画好贴成 3D 纹理，三栏可切换'],
    tags: ['数据管道', 'Canvas', '可视化'],
  },
  {
    kicker: 'Experiment · Particles',
    title: '粒子文字工坊',
    body: '九千颗光点，先在离屏 canvas 上把文字栅格化，再按像素采样出目标点，让每颗光点自己飞过去站好。就在这一页往下滑两屏，输入什么它拼什么，还能拖着转。',
    list: ['离屏 canvas 采样，按包围盒自适应缩放', '每颗点独立缓动，带一点呼吸噪声', '鼠标拖动旋转，松手继续飘'],
    tags: ['Canvas', '粒子', '交互'],
  },
  {
    kicker: 'Toolbox',
    title: '自动化小工具集',
    body: '截图、OCR、窗口归位、语音合成、通知抓取、余额告警……每个都不大，散落在硬盘里，但每天都在用。它们合起来才是一只真正能干活的手：看见屏幕、认得出东西、点得准按钮。',
    list: ['一个入口脚本管截图 + 裁切 + 放大 + OCR', '窗口归一到固定尺寸，坐标才可复现', '失败会重试一次，再失败就留现场'],
    tags: ['工具', '脚本', '日常'],
  },
];
let workIndex = 0;
function openWork(i) {
  const w = WORKS[i]; if (!w) return;
  workIndex = i;
  workKicker.textContent = w.kicker;
  workTitle.textContent = w.title;
  workBody.textContent = w.body;
  workList.innerHTML = w.list.map((t) => '<li>' + t + '</li>').join('');
  workTags.innerHTML = w.tags.map((t) => '<span>' + t + '</span>').join('');
  workModal.hidden = false;
  document.body.classList.add('no-scroll');
}
function closeWork() { workModal.hidden = true; document.body.classList.remove('no-scroll'); }
$$('.work').forEach((card) => {
  const i = Number(card.dataset.work);
  card.addEventListener('click', () => openWork(i));
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openWork(i); } });
});
if (workModal) {
  $('#workClose').addEventListener('click', closeWork);
  workModal.addEventListener('click', (e) => { if (e.target === workModal) closeWork(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !workModal.hidden) closeWork(); });
}

/* ---------------- 命令面板 ---------------- */
const palette = $('#palette'), paletteInput = $('#paletteInput'), paletteList = $('#paletteList');
const commands = [
  { label: '首页', hint: 'HOME', target: '#top' },
  { label: '关于', hint: '01', target: '#about' },
  { label: '作品', hint: '02', target: '#works' },
  { label: '手艺', hint: '03', target: '#skills' },
  { label: '在路上', hint: '04', target: '#timeline' },
  { label: '玩一下 · 粒子文字', hint: '05', target: '#play' },
  { label: '联系', hint: '06', target: '#contact' },
  { label: '复制邮箱', hint: 'MAIL', action: () => copyBtn && copyBtn.click() },
];
let cmdIndex = 0, filtered = commands.slice();
function renderCommands() {
  paletteList.innerHTML = '';
  filtered.forEach((c, i) => {
    const li = document.createElement('li');
    li.innerHTML = '<em style="font-style:normal">' + c.label + '</em><span>' + c.hint + '</span>';
    if (i === cmdIndex) li.classList.add('is-active');
    li.addEventListener('pointerenter', () => { cmdIndex = i; renderCommands(); });
    li.addEventListener('click', () => runCommand(c));
    paletteList.appendChild(li);
  });
}
function openPalette() {
  palette.hidden = false; paletteInput.value = ''; cmdIndex = 0; filtered = commands.slice(); renderCommands();
  setTimeout(() => paletteInput.focus(), 30);
  document.body.classList.add('no-scroll');
}
function closePalette() { palette.hidden = true; document.body.classList.remove('no-scroll'); }
function runCommand(c) {
  closePalette();
  if (c.action) { c.action(); return; }
  const el = $(c.target); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('#openPalette').addEventListener('click', openPalette);
paletteInput.addEventListener('input', () => {
  const q = paletteInput.value.trim().toLowerCase();
  filtered = commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
  cmdIndex = 0; renderCommands();
});
palette.addEventListener('click', (e) => { if (e.target === palette) closePalette(); });
addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? openPalette() : closePalette(); return; }
  if (palette.hidden) { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); openPalette(); } return; }
  if (e.key === 'Escape') closePalette();
  if (e.key === 'ArrowDown') { e.preventDefault(); cmdIndex = Math.min(filtered.length - 1, cmdIndex + 1); renderCommands(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); cmdIndex = Math.max(0, cmdIndex - 1); renderCommands(); }
  if (e.key === 'Enter' && filtered[cmdIndex]) runCommand(filtered[cmdIndex]);
});

/* ---------------- three.js 工具 ---------------- */
function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,.65)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const HAS_WEBGL = (() => { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } })();

/* ---------------- HERO 场景 ---------------- */
function initHero() {
  const canvas = $('#heroCanvas');
  if (!canvas || !HAS_WEBGL) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070b, 0.045);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 1.4, 7.2);
  camera.lookAt(0, 0.2, 0);

  const COLS = 150, ROWS = 110, COUNT = COLS * ROWS;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const baseY = new Float32Array(COUNT);
  const cJade = new THREE.Color(0x46e0a8), cCyan = new THREE.Color(0x59d7ff),
        cViolet = new THREE.Color(0x9a8bff), cDeep = new THREE.Color(0x123a4a);
  const tmp = new THREE.Color();
  let i = 0;
  for (let x = 0; x < COLS; x++) {
    for (let z = 0; z < ROWS; z++) {
      const fx = (x / (COLS - 1) - 0.5) * 17;
      const fz = (z / (ROWS - 1) - 0.5) * 13;
      const r = Math.sqrt(fx * fx * 0.11 + fz * fz * 0.16);
      const h = Math.sin(fx * 0.55 + fz * 0.2) * 0.55 + Math.cos(fz * 0.62 - fx * 0.14) * 0.5 + Math.sin(r * 2.4) * 0.62;
      const y = h + Math.exp(-r * r * 0.6) * 0.35;
      pos[i * 3] = fx; pos[i * 3 + 1] = y; pos[i * 3 + 2] = fz;
      baseY[i] = y;
      const t = Math.min(1, Math.max(0, (y + 1.4) / 2.6));
      tmp.copy(cDeep).lerp(cJade, Math.min(1, t * 1.5));
      if (t > 0.45) tmp.lerp(cCyan, (t - 0.45) * 1.1);
      if (t > 0.82) tmp.lerp(cViolet, (t - 0.82) * 1.6);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      i++;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.045, map: dotTexture(), transparent: true, opacity: 0.9,
    vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: true,
  });
  const points = new THREE.Points(geo, mat);
  points.position.y = -0.3;
  scene.add(points);

  // 星尘
  const starN = 700, starPos = new Float32Array(starN * 3);
  for (let s = 0; s < starN; s++) {
    const r = 14 + Math.random() * 16, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    starPos[s * 3] = r * Math.sin(ph) * Math.cos(th);
    starPos[s * 3 + 1] = r * Math.cos(ph) * 0.6 + 2;
    starPos[s * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.06, map: dotTexture(), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xbfe9ff }));
  scene.add(stars);

  let px = 0, py = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let visible = true;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.01 }).observe(canvas);

  const posAttr = geo.attributes.position;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    px += (tx - px) * 0.045; py += (ty - py) * 0.045;
    points.rotation.y = px * 0.22 + Math.sin(t * 0.06) * 0.05;
    points.rotation.x = -0.06 + py * 0.08;
    stars.rotation.y = t * 0.012 + px * 0.05;
    camera.position.x = px * 0.55;
    camera.position.y = 1.4 - py * 0.35;
    camera.lookAt(0, 0.15, 0);
    if (!prefersReduced) {
      const arr = posAttr.array;
      for (let k = 0; k < COUNT; k++) {
        const fx = arr[k * 3], fz = arr[k * 3 + 2];
        arr[k * 3 + 1] = baseY[k] + Math.sin(t * 0.7 + fx * 0.5 + fz * 0.35) * 0.07;
      }
      posAttr.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }
  frame();
}

/* ---------------- 粒子文字 ---------------- */
function initPlayground() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const stage = canvas.parentElement;
  const hint = $('#playHint'), input = $('#particleInput'), goBtn = $('#particleGo');
  if (!HAS_WEBGL) { if (hint) hint.textContent = '你的浏览器不支持 WebGL，换个浏览器试试'; return; }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 6.4);
  const group = new THREE.Group();
  scene.add(group);

  const COUNT = 9000;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const target = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT * 3);
  const cA = new THREE.Color(0x46e0a8), cB = new THREE.Color(0x59d7ff), cC = new THREE.Color(0x9a8bff), tmp = new THREE.Color();
  for (let k = 0; k < COUNT; k++) {
    const r = 3.6 * Math.cbrt(Math.random()), th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[k * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[k * 3 + 1] = r * Math.cos(ph) * 0.6;
    pos[k * 3 + 2] = r * Math.sin(ph) * Math.sin(th) * 0.5;
    target[k * 3] = pos[k * 3]; target[k * 3 + 1] = pos[k * 3 + 1]; target[k * 3 + 2] = pos[k * 3 + 2];
    seed[k * 3] = Math.random() * 100; seed[k * 3 + 1] = Math.random() * 100; seed[k * 3 + 2] = Math.random() * 100;
    tmp.copy(cA).lerp(cB, Math.random());
    if (Math.random() > 0.75) tmp.lerp(cC, 0.7);
    col[k * 3] = tmp.r; col[k * 3 + 1] = tmp.g; col[k * 3 + 2] = tmp.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.06, map: dotTexture(), transparent: true, vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 1 });
  const points = new THREE.Points(geo, mat);
  group.add(points);

  const sampler = document.createElement('canvas');
  sampler.width = 1200; sampler.height = 300;
  const sctx = sampler.getContext('2d', { willReadFrequently: true });

  let current = '';
  function setText(text) {
    const clean = (text || '').trim();
    if (!clean || clean === current) return;
    current = clean;
    if (hint) hint.classList.add('is-hidden');
    sctx.clearRect(0, 0, sampler.width, sampler.height);
    sctx.fillStyle = '#fff';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    let size = 190;
    sctx.font = '700 ' + size + 'px "Songti SC","Noto Serif SC","Microsoft YaHei",serif';
    const w = sctx.measureText(clean).width;
    if (w > sampler.width * 0.9) { size = Math.floor(size * (sampler.width * 0.9) / w); sctx.font = '700 ' + size + 'px "Songti SC","Noto Serif SC","Microsoft YaHei",serif'; }
    sctx.fillText(clean, sampler.width / 2, sampler.height / 2 + size * 0.04);
    const data = sctx.getImageData(0, 0, sampler.width, sampler.height).data;
    const pts = [];
    const step = 2;
    for (let y = 0; y < sampler.height; y += step) {
      for (let x = 0; x < sampler.width; x += step) {
        if (data[(y * sampler.width + x) * 4 + 3] > 130) pts.push([x, y]);
      }
    }
    for (let k = pts.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); const t = pts[k]; pts[k] = pts[j]; pts[j] = t; }
    const drawn = Math.max(1, w);
    const scale = Math.min(2.6 / size, 11.4 / drawn);
    for (let k = 0; k < COUNT; k++) {
      if (pts.length) {
        const p = pts[k % pts.length];
        target[k * 3] = (p[0] - sampler.width / 2) * scale + (Math.random() - 0.5) * 0.015;
        target[k * 3 + 1] = -(p[1] - sampler.height / 2) * scale + (Math.random() - 0.5) * 0.015;
        target[k * 3 + 2] = (Math.random() - 0.5) * 0.22;
      } else {
        const a = Math.random() * Math.PI * 2;
        target[k * 3] = Math.cos(a) * 3.3; target[k * 3 + 1] = Math.sin(a) * 2.1; target[k * 3 + 2] = (Math.random() - 0.5) * 0.6;
      }
    }
  }

  function submit() {
    const v = (input.value || '').trim();
    if (!v) { input.focus(); return; }
    setText(v);
    input.value = '';
  }
  goBtn && goBtn.addEventListener('click', submit);
  input && input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  $$('.play__chips button').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.word; submit(); }));

  let dragX = 0, dragY = 0, rotX = 0, rotY = 0, dragging = false, lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    rotY += (e.clientX - lastX) * 0.006;
    rotX += (e.clientY - lastY) * 0.004;
    rotX = Math.max(-0.5, Math.min(0.5, rotX));
    lastX = e.clientX; lastY = e.clientY;
  });
  addEventListener('pointerup', () => { dragging = false; });

  function resize() {
    const w = canvas.clientWidth || stage.clientWidth, h = canvas.clientHeight || stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let visible = false;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(canvas);
  const posAttr = geo.attributes.position;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const arr = posAttr.array;
    const k2 = prefersReduced ? 0.2 : 0.075;
    for (let k = 0; k < COUNT; k++) {
      const ix = k * 3;
      const nx = Math.sin(t * 0.5 + seed[ix]) * 0.02;
      const ny = Math.cos(t * 0.45 + seed[ix + 1]) * 0.02;
      arr[ix] += (target[ix] + nx - arr[ix]) * k2;
      arr[ix + 1] += (target[ix + 1] + ny - arr[ix + 1]) * k2;
      arr[ix + 2] += (target[ix + 2] - arr[ix + 2]) * k2;
    }
    posAttr.needsUpdate = true;
    group.rotation.y = rotY + Math.sin(t * 0.18) * 0.05;
    group.rotation.x = rotX;
    renderer.render(scene, camera);
  }
  frame();
  setText('青山');
}

/* ---------------- 启动 ---------------- */
try { initHero(); } catch (e) { console.warn('hero scene skipped', e); }
try { initPlayground(); } catch (e) { console.warn('playground skipped', e); }
