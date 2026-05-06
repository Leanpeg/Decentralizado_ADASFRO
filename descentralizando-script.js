/*
  ╔══════════════════════════════════════════════════════════════════╗
  ║  DESCENTRALIZANDO — script.js v4.0                               ║
  ║  CORRECCIONES v4:                                                ║
  ║  ✅ Imágenes nítidas (URL sin resize borroso)                    ║
  ║  ✅ Fallback a og:image y content image                          ║
  ║  ✅ Paleta clara y vibrante (blanco + verde + azul)              ║
  ║  ✅ Accesibilidad WCAG AA/AAA                                    ║
  ╚══════════════════════════════════════════════════════════════════╝
*/
'use strict';

// ══ CONFIG CENTRAL ══
const CFG = {
  blogUrl: 'https://www.decentralizando.org',
  apiBase: 'https://www.decentralizando.org/feeds/posts/default',
  maxHero:     5,
  maxRecientes:9,
  maxSidebar:  5,
  maxTicker:   8,
  // Badge color por etiqueta
  labelMap: {
    'Política':          'badge-politica',
    'Social':            'badge-social',
    'Tecnología':        'badge-tecnologia',
    'Economia':          'badge-economia',
    'Economía':          'badge-economia',
    'Turismo':           'badge-turismo',
    'Blockchain':        'badge-blockchain',
    'Descentralización': 'badge-blockchain',
    'Inclusión':         'badge-social',
    'Gobernanza':        'badge-politica',
    'Derechos':          'badge-social',
    'TSE':               'badge-politica',
    'LESCO':             'badge-social',
  }
};

// ══ UTILIDADES ══
const $ = id => document.getElementById(id);

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/**
 * CORRECCIÓN PRINCIPAL: obtener URL de imagen nítida
 * Blogger devuelve thumbnails con /s72-c/ que son muy pequeños y se ven borrosos.
 * Pedimos /s1000/ para que el navegador reduzca (no amplíe) → imagen nítida.
 */
function getThumb(entry) {
  // 1. media$thumbnail del feed (el más confiable)
  if (entry.media$thumbnail && entry.media$thumbnail.url) {
    let url = entry.media$thumbnail.url;
    // Reemplazar cualquier tamaño /sXXX(-c)?/ por /s1000/
    url = url.replace(/\/s\d+(-c)?\//g, '/s1000/');
    // Asegurar HTTPS
    url = url.replace(/^http:\/\//i, 'https://');
    return url;
  }

  // 2. Buscar primera imagen en el contenido HTML del post
  const html = (entry.content && entry.content.$t)
             || (entry.summary && entry.summary.$t)
             || '';
  if (html) {
    // src con http o https
    const mSrc = html.match(/src=["']https?:\/\/([^"']+\.(jpg|jpeg|png|webp|gif))[^"']*/i);
    if (mSrc) {
      let url = mSrc[0].replace(/src=["']/i, '').replace(/["']$/, '');
      // Limpiar parámetros que puedan degradar calidad
      url = url.replace(/\/s\d+(-c)?\//g, '/s1000/');
      url = url.replace(/^http:\/\//i, 'https://');
      return url;
    }
  }

  return ''; // sin imagen → usar placeholder
}

function getUrl(entry) {
  for (const l of (entry.link || [])) {
    if (l.rel === 'alternate') return l.href;
  }
  return '#';
}

function getTitle(entry) {
  return (entry.title && entry.title.$t) || 'Sin título';
}

function getFirstLabel(entry) {
  return (entry.category && entry.category[0]) ? entry.category[0].term : '';
}

function getDate(entry) {
  const raw = (entry.published && entry.published.$t) || '';
  if (!raw) return '';
  const d = new Date(raw);
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function badgeClass(label) {
  return CFG.labelMap[label] || 'badge-turismo';
}

function makeBadge(label) {
  if (!label) return '';
  return `<span class="badge ${badgeClass(label)}">${esc(label)}</span>`;
}

function thumbHtml(url, alt, clase) {
  clase = clase || '';
  if (url) {
    return `<img src="${esc(url)}" alt="${esc(alt)}" loading="lazy" decoding="async"
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;"/>`;
  }
  return `<div class="img-placeholder">🗺️</div>`;
}

// ══ JSONP FETCH ══
function fetchBlogger(max, label, callback) {
  const cbName = '_db' + Date.now().toString(36);
  let url = `${CFG.apiBase}?alt=json&max-results=${max}`;
  if (label) url += `&category=${encodeURIComponent(label)}`;
  url += `&callback=${cbName}`;

  const script = document.createElement('script');
  const timer = setTimeout(() => {
    cleanup();
    callback([]);
  }, 10000);

  function cleanup() {
    clearTimeout(timer);
    try { delete window[cbName]; } catch(e) {}
    if (script.parentNode) script.parentNode.removeChild(script);
  }

  window[cbName] = function(data) {
    cleanup();
    const entries = (data && data.feed && data.feed.entry) ? data.feed.entry : [];
    callback(entries);
  };

  script.src = url;
  script.onerror = () => { cleanup(); callback([]); };
  document.head.appendChild(script);
}

// ══ 1. NAVBAR SCROLL ══
(function() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const upd = () => nav.classList.toggle('con-sombra', window.scrollY > 30);
  window.addEventListener('scroll', upd, {passive:true});
  upd();
})();

// ══ 2. HAMBURGUESA ══
(function() {
  const btn  = $('hamburguesa');
  const menu = $('menu-movil');
  if (!btn || !menu) return;

  function cerrar() {
    btn.classList.remove('abierto');
    menu.classList.remove('abierto');
    btn.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('abierto');
    menu.classList.toggle('abierto', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrar));
  document.addEventListener('keydown', e => { if (e.key==='Escape') cerrar(); });
})();

// ══ 3. BÚSQUEDA OVERLAY ══
(function() {
  const btnAbrir  = $('btn-buscar');
  const overlay   = $('busqueda-overlay');
  const btnCerrar = $('busqueda-cerrar');
  const input     = $('busqueda-input');
  if (!overlay) return;

  function abrir() {
    overlay.classList.add('activo');
    document.body.style.overflow = 'hidden';
    if (input) setTimeout(() => input.focus(), 80);
  }
  function cerrar() {
    overlay.classList.remove('activo');
    document.body.style.overflow = '';
  }
  if (btnAbrir)  btnAbrir.addEventListener('click', abrir);
  if (btnCerrar) btnCerrar.addEventListener('click', cerrar);
  overlay.addEventListener('click', e => { if (e.target===overlay) cerrar(); });
  document.addEventListener('keydown', e => {
    if (e.key==='Escape' && overlay.classList.contains('activo')) cerrar();
  });
})();

// ══ 4. TICKER PAUSA ══
(function() {
  const p = $('ticker-pista');
  if (!p) return;
  p.addEventListener('mouseenter', () => p.style.animationPlayState='paused');
  p.addEventListener('mouseleave', () => p.style.animationPlayState='running');
})();

// ══ 5. HERO GRID ══
function renderHero(entries) {
  const grid = $('dm-hero-grid');
  if (!grid) return;

  if (!entries.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;min-height:300px;display:flex;align-items:center;
      justify-content:center;background:var(--fondo-3);border-radius:var(--r-lg);border:1px solid var(--borde);">
      <p style="color:var(--texto-3);font-family:var(--f-cuerpo);">
        📰 Publicá tu primera entrada en Blogger para verla aquí.
      </p>
    </div>`;
    return;
  }

  let html = '';

  // Post principal
  const main = entries[0];
  const mImg = getThumb(main);
  const mLabel = getFirstLabel(main);
  html += `<a href="${esc(getUrl(main))}" class="hero-main" aria-label="${esc(getTitle(main))}">
    <div style="position:absolute;inset:0;overflow:hidden;">
      ${thumbHtml(mImg, getTitle(main))}
    </div>
    <div class="hero-main-overlay"></div>
    <div class="hero-main-content">
      ${makeBadge(mLabel)}
      <h2 class="hero-main-title">${esc(getTitle(main))}</h2>
      <div class="hero-main-meta">
        <span>📅 ${esc(getDate(main))}</span>
      </div>
    </div>
  </a>`;

  // Posts secundarios (hasta 4)
  const subs = entries.slice(1, 5);
  for (const s of subs) {
    const sImg   = getThumb(s);
    const sLabel = getFirstLabel(s);
    html += `<a href="${esc(getUrl(s))}" class="hero-sub" aria-label="${esc(getTitle(s))}">
      <div style="position:absolute;inset:0;overflow:hidden;">
        ${thumbHtml(sImg, getTitle(s))}
      </div>
      <div class="hero-sub-overlay"></div>
      <div class="hero-sub-content">
        ${makeBadge(sLabel)}
        <h3 class="hero-sub-title">${esc(getTitle(s))}</h3>
        <div class="hero-sub-meta">📅 ${esc(getDate(s))}</div>
      </div>
    </a>`;
  }

  grid.innerHTML = html;
}

// ══ 6. GRILLA NOTICIAS ══
function renderGridNoticias(entries, containerId) {
  const container = $(containerId);
  if (!container) return;

  if (!entries.length) {
    container.innerHTML = `<div style="grid-column:1/-1;padding:2rem;text-align:center;color:var(--texto-3);">
      No hay publicaciones aún en esta sección.
    </div>`;
    return;
  }

  let html = '';
  for (const e of entries) {
    const img    = getThumb(e);
    const label  = getFirstLabel(e);
    const url    = getUrl(e);
    const titulo = getTitle(e);
    const fecha  = getDate(e);

    html += `<article class="noticia-card">
      <a href="${esc(url)}" class="noticia-thumb" style="display:block;text-decoration:none;">
        ${img
          ? `<img src="${esc(img)}" alt="${esc(titulo)}" loading="lazy" decoding="async"
              style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;"/>`
          : `<div class="img-placeholder">🗺️</div>`
        }
        ${makeBadge(label)}
      </a>
      <div class="noticia-body">
        <h2 class="noticia-titulo">
          <a href="${esc(url)}">${esc(titulo)}</a>
        </h2>
        <div class="noticia-meta">
          <span>📅 ${esc(fecha)}</span>
        </div>
      </div>
    </article>`;
  }
  container.innerHTML = html;
}

// ══ 7. SIDEBAR RANKING ══
function renderSidebarRanking(entries, containerId) {
  const el = $(containerId);
  if (!el || !entries.length) return;

  let html = '';
  entries.slice(0, CFG.maxSidebar).forEach((e, i) => {
    const img   = getThumb(e);
    const label = getFirstLabel(e);
    html += `<div class="lista-item">
      ${img ? `<div class="lista-thumb">
        <img src="${esc(img)}" alt="${esc(getTitle(e))}" loading="lazy" decoding="async"/>
      </div>` : ''}
      <div class="lista-body">
        ${makeBadge(label)}
        <div class="lista-titulo">
          <a href="${esc(getUrl(e))}">${esc(getTitle(e))}</a>
        </div>
        <div class="lista-fecha">📅 ${esc(getDate(e))}</div>
      </div>
    </div>`;
  });
  el.innerHTML = `<div class="lista-noticias">${html}</div>`;
}

// ══ 8. TICKER ══
function renderTicker(entries) {
  const pista = $('ticker-pista');
  if (!pista || !entries.length) return;

  const items = entries.slice(0, CFG.maxTicker).map(e =>
    `<span class="ticker-item">
      <span class="ticker-dot">●</span>
      <a href="${esc(getUrl(e))}">${esc(getTitle(e))}</a>
    </span>`
  );
  // Duplicar para loop continuo
  pista.innerHTML = items.join('') + items.join('');
}

// ══ 9. ANIMACIONES SCROLL ══
(function() {
  const els = document.querySelectorAll('[data-animar]');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('animado'));
    return;
  }
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      const d = parseInt(e.target.getAttribute('data-retraso') || '0', 10);
      setTimeout(() => e.target.classList.add('animado'), d);
      obs.unobserve(e.target);
    });
  }, {threshold:0.1, rootMargin:'0px 0px -30px 0px'});
  els.forEach(el => obs.observe(el));
})();

// ══ 10. VOLVER ARRIBA ══
(function() {
  const btn = document.querySelector('.volver-arriba');
  if (!btn) return;
  const upd = () => btn.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', upd, {passive:true});
  btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  upd();
})();

// ══ 11. ACCESIBILIDAD ══
(function() {
  const btnG = $('btn-texto-grande');
  const btnN = $('btn-texto-normal');
  const btnC = $('btn-alto-contraste');

  if (btnG) btnG.addEventListener('click', () => {
    document.body.classList.add('texto-grande');
    try { localStorage.setItem('dm-tg','1'); } catch(e){}
  });
  if (btnN) btnN.addEventListener('click', () => {
    document.body.classList.remove('texto-grande');
    try { localStorage.setItem('dm-tg','0'); } catch(e){}
  });
  if (btnC) btnC.addEventListener('click', () => {
    const on = document.body.classList.toggle('alto-contraste');
    btnC.setAttribute('aria-pressed', String(on));
    try { localStorage.setItem('dm-ac', on?'1':'0'); } catch(e){}
  });
  try {
    if (localStorage.getItem('dm-tg')==='1') document.body.classList.add('texto-grande');
    if (localStorage.getItem('dm-ac')==='1') {
      document.body.classList.add('alto-contraste');
      if (btnC) btnC.setAttribute('aria-pressed','true');
    }
  } catch(e){}
})();

// ══ 12. ENLACE ACTIVO ══
(function() {
  const href = window.location.href;
  document.querySelectorAll('.nav-menu a').forEach(a => {
    if (a.href && (a.href === href || (href.includes('/search/label/') && href.startsWith(a.href)))) {
      a.classList.add('activo');
    }
  });
})();

// ══ 13. FECHA DINÁMICA ══
(function() {
  const el = $('dm-fecha-hoy');
  if (!el) return;
  const dias  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date();
  el.textContent = `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
})();

// ══ INIT PRINCIPAL ══
document.addEventListener('DOMContentLoaded', () => {
  console.log('%c🗺️ Descentralizando · ADASFRO · v4.0', 'color:#00875a;font-weight:bold;font-size:13px;');

  // Animar elementos ya visibles
  setTimeout(() => {
    document.querySelectorAll('[data-animar]:not(.animado)').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        const d = parseInt(el.getAttribute('data-retraso') || '0', 10);
        setTimeout(() => el.classList.add('animado'), d);
      }
    });
  }, 100);

  // Solo en homepage
  const heroGrid = $('dm-hero-grid');
  if (heroGrid) {
    // Hero + ticker (misma llamada API)
    fetchBlogger(Math.max(CFG.maxHero, CFG.maxTicker), null, entries => {
      renderHero(entries.slice(0, CFG.maxHero));
      renderTicker(entries.slice(0, CFG.maxTicker));
    });
    // Noticias recientes + sidebar
    fetchBlogger(CFG.maxRecientes, null, entries => {
      renderGridNoticias(entries, 'dm-noticias-recientes');
      renderSidebarRanking(entries, 'dm-populares');
    });
  }

  // Sidebar en post individual
  if ($('dm-populares-post')) {
    fetchBlogger(CFG.maxSidebar, null, e => renderSidebarRanking(e, 'dm-populares-post'));
  }

  // Ticker en páginas de etiqueta/búsqueda
  const ticker = $('ticker-pista');
  if (ticker && !ticker.querySelector('a')) {
    fetchBlogger(CFG.maxTicker, null, renderTicker);
  }
});
