/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  DESCENTRALIZANDO — script.js v3.0                           ║
  ║  Medio Digital ADASFRO · Economía 4.0 · Costa Rica           ║
  ║  GitHub Pages: leanpeg.github.io/Decentralizado_ADASFRO/     ║
  ║                                                              ║
  ║  Funciones:                                                  ║
  ║  1.  Navbar scroll + sombra                                  ║
  ║  2.  Menú hamburguesa (móvil)                                ║
  ║  3.  Búsqueda overlay                                        ║
  ║  4.  Ticker: pausa al hover                                  ║
  ║  5.  API Blogger: Hero grid dinámico                         ║
  ║  6.  API Blogger: Noticias recientes (grid cards)            ║
  ║  7.  API Blogger: Sidebar populares                          ║
  ║  8.  API Blogger: Ticker de titulares                        ║
  ║  9.  Animaciones al scroll (IntersectionObserver)            ║
  ║  10. Volver arriba                                           ║
  ║  11. Accesibilidad (texto grande / alto contraste)           ║
  ║  12. Enlace activo en nav                                    ║
  ║  13. Fecha dinámica en barra superior                        ║
  ╚══════════════════════════════════════════════════════════════╝
*/

'use strict';

// ══════════════════════════════════════════════════════════
// CONFIGURACIÓN CENTRAL — editar sólo aquí
// ══════════════════════════════════════════════════════════
const CONFIG = {
  blogUrl:    'https://www.decentralizando.org',
  blogId:     '',               // opcional: ID numérico del blog (más rápido)
  maxHero:    5,                // entradas en hero grid
  maxRecientes: 9,              // entradas en grilla recientes
  maxSidebar: 5,                // entradas en sidebar "populares"
  maxTicker:  8,                // titulares en ticker
  apiBase:    'https://www.decentralizando.org/feeds/posts/default',
  // Mapeo etiqueta → clase CSS badge
  labelMap: {
    'Política':       'badge-politica',
    'Social':         'badge-social',
    'Tecnología':     'badge-tecnologia',
    'Economia':       'badge-economia',
    'Economía':       'badge-economia',
    'Turismo':        'badge-turismo',
    'Blockchain':     'badge-blockchain',
    'Descentralización': 'badge-blockchain',
    'Inclusión':      'badge-social',
    'Gobernanza':     'badge-politica',
  }
};

// ══════════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function getThumb(entry, size) {
  size = size || 600;
  if (entry.media$thumbnail) {
    return entry.media$thumbnail.url.replace(/\/s\d+(-c)?\//, `/s${size}-c/`);
  }
  const c = (entry.content && entry.content.$t) || (entry.summary && entry.summary.$t) || '';
  const m = c.match(/src=["']([^"']+\.(jpg|jpeg|png|webp|gif))[^"']*/i);
  return m ? m[1] : '';
}

function getUrl(entry) {
  const links = entry.link || [];
  for (const l of links) { if (l.rel === 'alternate') return l.href; }
  return '#';
}

function getTitle(entry) {
  return (entry.title && entry.title.$t) || 'Sin título';
}

function getLabels(entry) {
  return (entry.category || []).map(c => c.term);
}

function getFirstLabel(entry) {
  const cats = entry.category || [];
  return cats.length ? cats[0].term : '';
}

function getDate(entry) {
  const raw = (entry.published && entry.published.$t) || '';
  if (!raw) return '';
  const d = new Date(raw);
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function badgeClass(label) {
  return CONFIG.labelMap[label] || 'badge-turismo';
}

function makeBadge(label) {
  if (!label) return '';
  return `<span class="badge ${badgeClass(label)}">${esc(label)}</span>`;
}

// ══════════════════════════════════════════════════════════
// 1. NAVBAR — Sombra al scroll
// ══════════════════════════════════════════════════════════
(function iniciarNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  function update() {
    navbar.classList.toggle('con-sombra', window.scrollY > 30);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


// ══════════════════════════════════════════════════════════
// 2. MENÚ HAMBURGUESA
// ══════════════════════════════════════════════════════════
(function iniciarMenuMovil() {
  const btn  = $('hamburguesa');
  const menu = $('menu-movil');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('abierto');
    menu.classList.toggle('abierto', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('abierto');
      menu.classList.remove('abierto');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && btn.classList.contains('abierto')) {
      btn.classList.remove('abierto');
      menu.classList.remove('abierto');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      btn.focus();
    }
  });
})();


// ══════════════════════════════════════════════════════════
// 3. BÚSQUEDA OVERLAY
// ══════════════════════════════════════════════════════════
(function iniciarBusqueda() {
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
    if (btnAbrir) btnAbrir.focus();
  }

  if (btnAbrir)  btnAbrir.addEventListener('click', abrir);
  if (btnCerrar) btnCerrar.addEventListener('click', cerrar);

  overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('activo')) cerrar();
  });
})();


// ══════════════════════════════════════════════════════════
// 4. TICKER — Pausa al hover
// ══════════════════════════════════════════════════════════
(function iniciarTicker() {
  const pista = $('ticker-pista');
  if (!pista) return;
  pista.addEventListener('mouseenter', () => { pista.style.animationPlayState = 'paused'; });
  pista.addEventListener('mouseleave', () => { pista.style.animationPlayState = 'running'; });
})();


// ══════════════════════════════════════════════════════════
// BLOGGER JSON API — Fetch con JSONP
// ══════════════════════════════════════════════════════════
function fetchBlogger(max, label, callback) {
  let url = `${CONFIG.apiBase}?alt=json&max-results=${max}`;
  if (label) url += `&category=${encodeURIComponent(label)}`;

  const cbName = '_bc_' + Math.random().toString(36).slice(2, 10);
  const script = document.createElement('script');

  window[cbName] = function(data) {
    try { delete window[cbName]; } catch(e) {}
    if (script.parentNode) script.parentNode.removeChild(script);
    const entries = (data && data.feed && data.feed.entry) ? data.feed.entry : [];
    callback(entries);
  };

  script.src = url + `&callback=${cbName}`;
  script.onerror = function() {
    try { delete window[cbName]; } catch(e) {}
    callback([]);
  };
  document.head.appendChild(script);
}


// ══════════════════════════════════════════════════════════
// 5. HERO GRID — Carga dinámica
// ══════════════════════════════════════════════════════════
function renderHero(entries) {
  const grid = $('dm-hero-grid');
  if (!grid) return;

  if (!entries.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:3rem;text-align:center;color:var(--gris-400);font-family:var(--f-cuerpo);">
      📰 No hay publicaciones aún. ¡Publicá tu primera entrada en Blogger!
    </div>`;
    return;
  }

  let html = '';

  // POST PRINCIPAL (grande, toma toda la altura izquierda)
  const main = entries[0];
  const mThumb = getThumb(main, 900);
  const mLabel = getFirstLabel(main);
  html += `<a href="${esc(getUrl(main))}" class="hero-main" aria-label="${esc(getTitle(main))}">`;
  if (mThumb) {
    html += `<img src="${esc(mThumb)}" alt="${esc(getTitle(main))}" loading="eager"/>`;
  } else {
    html += `<div class="img-placeholder">🗺️</div>`;
  }
  html += `<div class="hero-main-overlay"></div>
  <div class="hero-main-content">
    ${makeBadge(mLabel)}
    <h2 class="hero-main-title">${esc(getTitle(main))}</h2>
    <div class="hero-main-meta">
      <span>📅 ${esc(getDate(main))}</span>
    </div>
  </div>
  </a>`;

  // POSTS SECUNDARIOS (4, en 2x2 a la derecha)
  const subs = entries.slice(1, 5);
  for (const s of subs) {
    const sThumb = getThumb(s, 600);
    const sLabel = getFirstLabel(s);
    html += `<a href="${esc(getUrl(s))}" class="hero-sub" aria-label="${esc(getTitle(s))}">`;
    if (sThumb) {
      html += `<img src="${esc(sThumb)}" alt="${esc(getTitle(s))}" loading="lazy"/>`;
    } else {
      html += `<div class="img-placeholder" style="font-size:2rem">🗺️</div>`;
    }
    html += `<div class="hero-sub-overlay"></div>
    <div class="hero-sub-content">
      ${makeBadge(sLabel)}
      <h3 class="hero-sub-title">${esc(getTitle(s))}</h3>
      <div class="hero-sub-meta">📅 ${esc(getDate(s))}</div>
    </div>
    </a>`;
  }

  grid.innerHTML = html;
}


// ══════════════════════════════════════════════════════════
// 6. GRILLA DE NOTICIAS RECIENTES
// ══════════════════════════════════════════════════════════
function renderGridNoticias(entries, containerId) {
  const container = $(containerId);
  if (!container) return;

  if (!entries.length) {
    container.innerHTML = `<div style="grid-column:1/-1;padding:2rem;text-align:center;color:var(--gris-400);">No hay publicaciones en esta categoría aún.</div>`;
    return;
  }

  let html = '';
  for (const e of entries) {
    const thumb  = getThumb(e, 600);
    const label  = getFirstLabel(e);
    const url    = getUrl(e);
    const titulo = getTitle(e);
    const fecha  = getDate(e);

    html += `<article class="noticia-card">
      <a href="${esc(url)}" class="noticia-thumb" style="display:block;text-decoration:none">
        ${thumb
          ? `<img src="${esc(thumb)}" alt="${esc(titulo)}" loading="lazy"/>`
          : `<div class="img-placeholder">🗺️</div>`
        }
        ${makeBadge(label)}
      </a>
      <div class="noticia-body">
        <h2 class="noticia-titulo"><a href="${esc(url)}">${esc(titulo)}</a></h2>
        <div class="noticia-meta">
          <span>📅 ${esc(fecha)}</span>
        </div>
      </div>
    </article>`;
  }
  container.innerHTML = html;
}


// ══════════════════════════════════════════════════════════
// 7. SIDEBAR — Lista de noticias
// ══════════════════════════════════════════════════════════
function renderSidebarLista(entries, containerId) {
  const container = $(containerId);
  if (!container || !entries.length) return;

  let html = '';
  entries.slice(0, CONFIG.maxSidebar).forEach((e, i) => {
    const thumb = getThumb(e, 200);
    const label = getFirstLabel(e);
    html += `<div class="rank-item">
      <span class="rank-num">${String(i+1).padStart(2,'0')}</span>
      <div>
        <div class="rank-titulo">
          <a href="${esc(getUrl(e))}">${esc(getTitle(e))}</a>
        </div>
        <div class="rank-fecha">📅 ${esc(getDate(e))} ${label ? '· ' + label : ''}</div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}


// ══════════════════════════════════════════════════════════
// 8. TICKER — Titulares dinámicos
// ══════════════════════════════════════════════════════════
function renderTicker(entries) {
  const pista = $('ticker-pista');
  if (!pista || !entries.length) return;

  const items = entries.slice(0, CONFIG.maxTicker).map(e => {
    return `<span class="ticker-item">
      <span class="ticker-dot">●</span>
      <a href="${esc(getUrl(e))}">${esc(getTitle(e))}</a>
    </span>`;
  });
  // Duplicar para loop continuo
  pista.innerHTML = items.join('') + items.join('');
}


// ══════════════════════════════════════════════════════════
// 9. ANIMACIONES AL SCROLL
// ══════════════════════════════════════════════════════════
(function iniciarAnimaciones() {
  const elementos = document.querySelectorAll('[data-animar]');
  if (!elementos.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elementos.forEach(el => el.classList.add('animado'));
    return;
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      const el = entrada.target;
      const delay = parseInt(el.getAttribute('data-retraso') || '0', 10);
      setTimeout(() => el.classList.add('animado'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  elementos.forEach(el => observer.observe(el));
})();


// ══════════════════════════════════════════════════════════
// 10. VOLVER ARRIBA
// ══════════════════════════════════════════════════════════
(function iniciarVolverArriba() {
  const btn = document.querySelector('.volver-arriba') || $('volver-arriba');
  if (!btn) return;

  function update() { btn.classList.toggle('visible', window.scrollY > 500); }
  window.addEventListener('scroll', update, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const skip = document.querySelector('.saltar-contenido');
    if (skip) skip.focus();
  });
  update();
})();


// ══════════════════════════════════════════════════════════
// 11. ACCESIBILIDAD — Texto grande / Alto contraste
// ══════════════════════════════════════════════════════════
(function iniciarAccesibilidad() {
  const btnGrande   = $('btn-texto-grande');
  const btnNormal   = $('btn-texto-normal');
  const btnContraste= $('btn-alto-contraste');

  if (btnGrande) btnGrande.addEventListener('click', () => {
    document.body.classList.add('texto-grande');
    try { localStorage.setItem('dm-textoGrande','si'); } catch(e){}
  });
  if (btnNormal) btnNormal.addEventListener('click', () => {
    document.body.classList.remove('texto-grande');
    try { localStorage.setItem('dm-textoGrande','no'); } catch(e){}
  });
  if (btnContraste) btnContraste.addEventListener('click', () => {
    const on = document.body.classList.toggle('alto-contraste');
    btnContraste.setAttribute('aria-pressed', String(on));
    try { localStorage.setItem('dm-contraste', on ? 'si' : 'no'); } catch(e){}
  });

  // Restaurar preferencias
  try {
    if (localStorage.getItem('dm-textoGrande') === 'si')
      document.body.classList.add('texto-grande');
    if (localStorage.getItem('dm-contraste') === 'si') {
      document.body.classList.add('alto-contraste');
      if (btnContraste) btnContraste.setAttribute('aria-pressed','true');
    }
  } catch(e){}
})();


// ══════════════════════════════════════════════════════════
// 12. ENLACE ACTIVO EN NAV (scroll spy)
// ══════════════════════════════════════════════════════════
(function iniciarEnlaceActivo() {
  const enlacesNav = document.querySelectorAll('.nav-menu a');
  const href = window.location.href;
  enlacesNav.forEach(a => {
    if (a.href === href || (a.href !== CONFIG.blogUrl + '/' && href.startsWith(a.href))) {
      a.classList.add('activo');
    }
  });
})();


// ══════════════════════════════════════════════════════════
// 13. FECHA DINÁMICA
// ══════════════════════════════════════════════════════════
(function setFecha() {
  const el = $('dm-fecha-hoy');
  if (!el) return;
  const dias   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const meses  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date();
  el.textContent = `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
})();


// ══════════════════════════════════════════════════════════
// INICIALIZACIÓN PRINCIPAL — Solo corre en la página de inicio
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  console.log(
    '%c🗺️ Descentralizando — por ADASFRO\n%cEconomía 4.0 · Costa Rica',
    'color:#00c896;font-size:15px;font-weight:bold;',
    'color:#8896a7;font-size:11px;'
  );

  // Animaciones ya visibles
  setTimeout(() => {
    document.querySelectorAll('[data-animar]:not(.animado)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        const delay = parseInt(el.getAttribute('data-retraso') || '0', 10);
        setTimeout(() => el.classList.add('animado'), delay);
      }
    });
  }, 150);

  // ── Solo en homepage ──
  const heroGrid = $('dm-hero-grid');
  if (heroGrid) {
    // Hero + ticker (misma llamada)
    fetchBlogger(CONFIG.maxHero + CONFIG.maxTicker, null, entries => {
      renderHero(entries.slice(0, CONFIG.maxHero));
      renderTicker(entries);
    });
    // Noticias recientes
    fetchBlogger(CONFIG.maxRecientes, null, entries => {
      renderGridNoticias(entries, 'dm-noticias-recientes');
      renderSidebarLista(entries, 'dm-populares');
    });
  }

  // ── Sidebar en post individual ──
  const sidebarPopPost = $('dm-populares-post');
  if (sidebarPopPost) {
    fetchBlogger(CONFIG.maxSidebar, null, entries => {
      renderSidebarLista(entries, 'dm-populares-post');
    });
  }

  // ── Ticker en cualquier página ──
  const ticker = $('ticker-pista');
  if (ticker && ticker.children.length === 0) {
    fetchBlogger(CONFIG.maxTicker, null, renderTicker);
  }

});
