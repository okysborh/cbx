/* Layout compartilhado: menu lateral + banner tematico + sessao.
   Cada pagina define <body data-page="..."> e os elementos de conteudo. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
let ME = null;

function toast(text, err) {
  let t = $('#app-toast');
  if (!t) {
    t = document.createElement('p');
    t.id = 'app-toast';
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.className = 'toast' + (err ? ' err' : '');
  t.classList.remove('hidden');
  clearTimeout(t._tmr);
  t._tmr = setTimeout(() => t.classList.add('hidden'), 3000);
}
function fmt(iso) {
  try { return new Date(iso).toLocaleString('pt-BR'); } catch (e) { return iso; }
}

/* ---- SVG do banner (mandala xamanica + folha) ---- */
function bannerSVG() {
  return `
  <svg viewBox="0 0 800 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id="sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d9b25a" stop-opacity=".9"/>
        <stop offset="100%" stop-color="#d9b25a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="400" cy="75" r="70" fill="url(#sun)"/>
    <g stroke="#7ed07f" stroke-width="1.2" fill="none" opacity=".8">
      <circle cx="400" cy="75" r="46"/>
      <circle cx="400" cy="75" r="62"/>
      ${Array.from({ length: 24 }).map((_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        const x1 = 400 + Math.cos(a) * 46, y1 = 75 + Math.sin(a) * 46;
        const x2 = 400 + Math.cos(a) * 62, y2 = 75 + Math.sin(a) * 62;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join('')}
    </g>
    <g fill="#2e7d32" opacity=".55">
      ${[120, 680].map((cx) =>
        Array.from({ length: 7 }).map((_, i) => {
          const a = (-90 + (i - 3) * 26) * Math.PI / 180;
          const len = 44 - Math.abs(i - 3) * 5;
          const x = cx + Math.cos(a) * len, y = 120 + Math.sin(a) * len;
          return `<path d="M${cx} 120 Q${(cx + x) / 2} ${(120 + y) / 2 - 10} ${x.toFixed(1)} ${y.toFixed(1)} Q${(cx + x) / 2} ${(120 + y) / 2 + 10} ${cx} 120 Z"/>`;
        }).join('')
      ).join('')}
    </g>
    <g fill="#7ed07f" opacity=".5">
      ${Array.from({ length: 40 }).map(() => {
        const x = (Math.random() * 800).toFixed(0);
        const y = (Math.random() * 150).toFixed(0);
        const r = (Math.random() * 1.4 + 0.3).toFixed(1);
        return `<circle cx="${x}" cy="${y}" r="${r}"/>`;
      }).join('')}
    </g>
  </svg>`;
}

function buildBanner() {
  const slot = $('#banner');
  if (!slot) return;
  slot.className = 'banner';
  slot.innerHTML =
    bannerSVG() +
    `<div class="banner-text">
       <h1>🌿 Confederação Brasileira Cannabica Xamaniáca 🌿</h1>
       <p>União • Natureza • Espírito</p>
     </div>`;
}

const NAV = [
  { page: 'fotos', href: '/fotos.html', icon: '📸', label: 'Fotos' },
  { page: 'videos', href: '/videos.html', icon: '🎥', label: 'Vídeos' },
  { page: 'comentarios', href: '/comentarios.html', icon: '💬', label: 'Comentários' },
  { page: 'pedidos', href: '/pedidos.html', icon: '⭐', label: 'Pedidos', ownerOnly: true },
];

function buildSidebar(active) {
  const slot = $('#sidebar');
  if (!slot) return;
  slot.className = 'sidebar';
  const links = NAV.filter((n) => !n.ownerOnly || (ME && ME.role === 'owner'))
    .map((n) => `<a href="${n.href}" class="${n.page === active ? 'active' : ''}">
        <span class="ic">${n.icon}</span> ${n.label}</a>`)
    .join('');
  const badge = ME && ME.role === 'owner' ? ' <span class="badge">⭐ premium</span>' : '';
  slot.innerHTML = `
    <div class="sb-brand">
      <div class="sb-leaf">🌿</div>
      <h2>Confederação</h2>
      <small>Cannabica Xamaniáca</small>
    </div>
    <nav>${links}</nav>
    <div class="sb-foot">
      <div class="uname">${ME ? ME.displayName : ''}${badge}</div>
      <button id="btn-logout" class="btn small ghost" style="width:100%">Sair</button>
    </div>`;
  $('#btn-logout').onclick = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/';
  };
  // botao mobile
  let tgl = $('.menu-toggle');
  if (!tgl) {
    tgl = document.createElement('button');
    tgl.className = 'menu-toggle';
    tgl.innerHTML = '☰';
    tgl.onclick = () => slot.classList.toggle('open');
    document.body.appendChild(tgl);
  }
}

async function bootstrap() {
  const d = await (await fetch('/api/me')).json();
  if (!d.user || d.user.status !== 'approved') { location.href = '/'; return; }
  ME = d.user;
  const active = document.body.dataset.page;
  if (active === 'pedidos' && ME.role !== 'owner') { location.href = '/fotos.html'; return; }
  buildBanner();
  buildSidebar(active);
  if (typeof window.initPage === 'function') window.initPage(ME);
}
bootstrap();
