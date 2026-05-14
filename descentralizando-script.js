/*
  ╔══════════════════════════════════════════════════════════════════╗
  ║  DESCENTRALIZANDO — script.js v4.1                               ║
  ║  CORRECCIÓN PRINCIPAL:                                           ║
  ║  • Lee datos de posts DIRECTAMENTE del DOM de Blogger            ║
  ║    (no JSONP externo que falla / demora)                         ║
  ║  • Imágenes nítidas: src original sin redimensionar              ║
  ║  • JSONP solo como respaldo si el DOM no tiene suficientes posts  ║
  ╚══════════════════════════════════════════════════════════════════╝
*/
'use strict';

// ══ CONFIG ══
const CFG = {
  blogUrl: 'https://www.decentralizando.org',
  apiBase: 'https://www.decentralizando.org/feeds/posts/default',
  maxHero:     5,
  maxRecientes:9,
  maxSidebar:  5,
  maxTicker:   8,
  labelMap: {
    'Política':'badge-politica','Social':'badge-social',
    'Tecnología':'badge-tecnologia','Economia':'badge-economia',
    'Economía':'badge-economia','Turismo':'badge-turismo',
    'Blockchain':'badge-blockchain','Descentralización':'badge-blockchain',
    'Inclusión':'badge-social','Gobernanza':'badge-politica',
    'Derechos':'badge-social','TSE':'badge-politica','LESCO':'badge-social',
    'Adasfro':'badge-turismo',
  }
};

// ══ UTILIDADES ══
const $ = id => document.getElementById(id);

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/**
 * Arregla URL de imagen de Blogger para máxima calidad.
 * - Reemplaza /sXX-c/ o /wXX-h/ por /s1200/ (alta res)
 * - Sin cropping forzado
 */
function fixImgUrl(url){
  if (!url) return '';
  url = String(url).replace(/^http:\/\//i,'https://');
  // Reemplazar cualquier redimensionado de Blogger
  url = url.replace(/\/s\d+(-[a-z])?(-[a-z])?(-[a-z])?\//g, '/s1200/');
  url = url.replace(/\/w\d+-h\d+(-[a-z])?\//g, '/s1200/');
  return url;
}

function badgeClass(label){
  return CFG.labelMap[label] || 'badge-turismo';
}

function makeBadge(label){
  if (!label) return '';
  return `<span class="badge ${badgeClass(label)}">${esc(label)}</span>`;
}

// ══════════════════════════════════════════════════════
// FUENTE PRIMARIA: leer posts del DOM de Blogger
// Blogger ya renderizó los posts en #dm-posts-data (oculto)
// ══════════════════════════════════════════════════════
function leerPostsDOM(){
  const items = document.querySelectorAll('.dm-post-item');
  if (!items.length) return null;

  const posts = [];
  items.forEach(item => {
    const img   = fixImgUrl(item.getAttribute('data-img') || '');
    const url   = item.getAttribute('data-url')   || '#';
    const titulo= item.getAttribute('data-titulo') || '';
    const fecha = item.getAttribute('data-fecha')  || '';
    const label = item.getAttribute('data-label')  || '';
    const autor = item.getAttribute('data-autor')  || 'ADASFRO';
    if (titulo) posts.push({img, url, titulo, fecha, label, autor});
  });
  return posts.length ? posts : null;
}

// ══════════════════════════════════════════════════════
// FUENTE SECUNDARIA: JSONP (respaldo si DOM vacío)
// ══════════════════════════════════════════════════════
function fetchBlogger(max, label, callback){
  const cbName = '_db' + Date.now().toString(36);
  let url = `${CFG.apiBase}?alt=json&max-results=${max}`;
  if (label) url += `&category=${encodeURIComponent(label)}`;
  url += `&callback=${cbName}`;

  const script = document.createElement('script');
  const timer  = setTimeout(() => { cleanup(); callback([]); }, 8000);

  function cleanup(){
    clearTimeout(timer);
    try{ delete window[cbName]; }catch(e){}
    if (script.parentNode) script.parentNode.removeChild(script);
  }

  window[cbName] = function(data){
    cleanup();
    const raw = (data && data.feed && data.feed.entry) ? data.feed.entry : [];
    const posts = raw.map(e => ({
      img:    getThumbFromEntry(e),
      url:    getUrlFromEntry(e),
      titulo: (e.title && e.title.$t) || 'Sin título',
      fecha:  getDateFromEntry(e),
      label:  (e.category && e.category[0]) ? e.category[0].term : '',
      autor:  (e.author && e.author[0] && e.author[0].name && e.author[0].name.$t) || 'ADASFRO',
    }));
    callback(posts);
  };

  script.src = url;
  script.onerror = () => { cleanup(); callback([]); };
  document.head.appendChild(script);
}

function getThumbFromEntry(e){
  if (e.media$thumbnail && e.media$thumbnail.url)
    return fixImgUrl(e.media$thumbnail.url);
  const html = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '';
  const m = html.match(/src=["']https?:\/\/[^"']+\.(jpg|jpeg|png|webp|gif)[^"']*/i);
  if (m) return fixImgUrl(m[0].replace(/src=["']/i,'').replace(/["']$/,''));
  return '';
}

function getUrlFromEntry(e){
  for (const l of (e.link||[])) if (l.rel==='alternate') return l.href;
  return '#';
}

function getDateFromEntry(e){
  const raw = (e.published && e.published.$t) || '';
  if (!raw) return '';
  const d = new Date(raw);
  const m = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

// ══════════════════════════════════════════════════════
// RENDER HERO GRID
// ══════════════════════════════════════════════════════
function renderHero(posts){
  const grid = $('dm-hero-grid');
  if (!grid) return;

  if (!posts || !posts.length){
    grid.innerHTML = `<div style="grid-column:1/-1;min-height:320px;display:flex;
      align-items:center;justify-content:center;background:var(--fondo-3);
      border-radius:var(--r-lg);border:1px solid var(--borde);">
      <p style="color:var(--texto-3);font-family:var(--f-cuerpo);font-size:var(--t-sm);
        text-align:center;padding:2rem;">
        📰 Publicá tu primera entrada en Blogger para verla aquí.
      </p>
    </div>`;
    return;
  }

  let html = '';

  // ── POST PRINCIPAL (izquierda, alto doble) ──
  const main = posts[0];
  html += `<a href="${esc(main.url)}" class="hero-main" aria-label="${esc(main.titulo)}">
    <div style="position:absolute;inset:0;overflow:hidden;">
      ${main.img
        ? `<img src="${esc(main.img)}" alt="${esc(main.titulo)}"
            loading="eager" decoding="async" fetchpriority="high"
            style="position:absolute;inset:0;width:100%;height:100%;
              object-fit:cover;object-position:center top;"/>`
        : `<div class="img-placeholder">🗺️</div>`
      }
    </div>
    <div class="hero-main-overlay"></div>
    <div class="hero-main-content">
      ${makeBadge(main.label)}
      <h2 class="hero-main-title">${esc(main.titulo)}</h2>
      <div class="hero-main-meta">
        <span>📅 ${esc(main.fecha)}</span>
        <span style="opacity:0.5">·</span>
        <span>${esc(main.autor)}</span>
      </div>
    </div>
  </a>`;

  // ── POSTS SECUNDARIOS (derecha, 2x2) ──
  const subs = posts.slice(1, 5);
  subs.forEach(s => {
    html += `<a href="${esc(s.url)}" class="hero-sub" aria-label="${esc(s.titulo)}">
      <div style="position:absolute;inset:0;overflow:hidden;">
        ${s.img
          ? `<img src="${esc(s.img)}" alt="${esc(s.titulo)}"
              loading="lazy" decoding="async"
              style="position:absolute;inset:0;width:100%;height:100%;
                object-fit:cover;object-position:center top;"/>`
          : `<div class="img-placeholder" style="font-size:2rem">🗺️</div>`
        }
      </div>
      <div class="hero-sub-overlay"></div>
      <div class="hero-sub-content">
        ${makeBadge(s.label)}
        <h3 class="hero-sub-title">${esc(s.titulo)}</h3>
        <div class="hero-sub-meta">📅 ${esc(s.fecha)}</div>
      </div>
    </a>`;
  });

  grid.innerHTML = html;
}

// ══════════════════════════════════════════════════════
// RENDER GRILLA NOTICIAS RECIENTES
// ══════════════════════════════════════════════════════
function renderGridNoticias(posts, containerId){
  const container = $(containerId);
  if (!container) return;

  if (!posts || !posts.length){
    container.innerHTML = `<div style="grid-column:1/-1;padding:3rem;text-align:center;
      color:var(--texto-3);background:var(--fondo-2);border-radius:var(--r-lg);
      border:1px solid var(--borde);">
      No hay publicaciones aún.
    </div>`;
    return;
  }

  let html = '';
  posts.forEach(p => {
    html += `<article class="noticia-card">
      <a href="${esc(p.url)}" class="noticia-thumb" style="display:block;text-decoration:none;">
        ${p.img
          ? `<img src="${esc(p.img)}" alt="${esc(p.titulo)}"
              loading="lazy" decoding="async"
              style="position:absolute;inset:0;width:100%;height:100%;
                object-fit:cover;object-position:center top;"/>`
          : `<div class="img-placeholder">🗺️</div>`
        }
        ${makeBadge(p.label)}
      </a>
      <div class="noticia-body">
        <h2 class="noticia-titulo">
          <a href="${esc(p.url)}">${esc(p.titulo)}</a>
        </h2>
        <div class="noticia-meta">
          <span>📅 ${esc(p.fecha)}</span>
          <span class="noticia-sep">·</span>
          <span class="noticia-autor">${esc(p.autor)}</span>
        </div>
      </div>
    </article>`;
  });
  container.innerHTML = html;
}

// ══════════════════════════════════════════════════════
// RENDER SIDEBAR
// ══════════════════════════════════════════════════════
function renderSidebar(posts, containerId){
  const el = $(containerId);
  if (!el || !posts || !posts.length) return;

  let html = '<div class="lista-noticias">';
  posts.slice(0, CFG.maxSidebar).forEach(p => {
    html += `<div class="lista-item">
      ${p.img ? `<div class="lista-thumb">
        <img src="${esc(p.img)}" alt="${esc(p.titulo)}"
          loading="lazy" decoding="async"/>
      </div>` : ''}
      <div class="lista-body">
        ${makeBadge(p.label)}
        <div class="lista-titulo">
          <a href="${esc(p.url)}">${esc(p.titulo)}</a>
        </div>
        <div class="lista-fecha">📅 ${esc(p.fecha)}</div>
      </div>
    </div>`;
  });
  html += '</div>';
  el.innerHTML = html;
}

// ══════════════════════════════════════════════════════
// RENDER TICKER
// ══════════════════════════════════════════════════════
function renderTicker(posts){
  const pista = $('ticker-pista');
  if (!pista || !posts || !posts.length) return;
  const items = posts.slice(0, CFG.maxTicker).map(p =>
    `<span class="ticker-item">
      <span class="ticker-dot">●</span>
      <a href="${esc(p.url)}">${esc(p.titulo)}</a>
    </span>`
  );
  pista.innerHTML = items.join('') + items.join(''); // duplicar para loop
}

// ══════════════════════════════════════════════════════
// ESTRATEGIA DE CARGA: DOM primero, JSONP como respaldo
// ══════════════════════════════════════════════════════
function cargarPosts(onData){
  // Intentar leer del DOM primero (instantáneo, sin red)
  const domPosts = leerPostsDOM();

  if (domPosts && domPosts.length >= 3){
    // ✅ DOM tiene datos suficientes → usar directamente
    onData(domPosts);
  } else {
    // ⚡ DOM vacío o insuficiente → llamar API JSONP
    fetchBlogger(Math.max(CFG.maxHero, CFG.maxRecientes), null, jsonPosts => {
      onData(jsonPosts.length ? jsonPosts : (domPosts || []));
    });
  }
}

// ══════════════════════════════════════════════════════
// CONTROLES UI
// ══════════════════════════════════════════════════════

// Navbar scroll
(function(){
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const upd = () => nav.classList.toggle('con-sombra', window.scrollY > 30);
  window.addEventListener('scroll', upd, {passive:true}); upd();
})();

// Hamburguesa
(function(){
  const btn = $('hamburguesa'), menu = $('menu-movil');
  if (!btn || !menu) return;
  function cerrar(){ btn.classList.remove('abierto'); menu.classList.remove('abierto'); btn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  btn.addEventListener('click', ()=>{ const o=btn.classList.toggle('abierto'); menu.classList.toggle('abierto',o); btn.setAttribute('aria-expanded',String(o)); document.body.style.overflow=o?'hidden':''; });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',cerrar));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') cerrar(); });
})();

// Búsqueda
(function(){
  const btnA=$('btn-buscar'), ov=$('busqueda-overlay'), btnC=$('busqueda-cerrar'), inp=$('busqueda-input');
  if (!ov) return;
  function abrir(){ ov.classList.add('activo'); document.body.style.overflow='hidden'; if(inp) setTimeout(()=>inp.focus(),80); }
  function cerrar(){ ov.classList.remove('activo'); document.body.style.overflow=''; }
  if(btnA) btnA.addEventListener('click',abrir);
  if(btnC) btnC.addEventListener('click',cerrar);
  ov.addEventListener('click', e=>{ if(e.target===ov) cerrar(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'&&ov.classList.contains('activo')) cerrar(); });
})();

// Ticker pausa hover
(function(){
  const p=$('ticker-pista'); if(!p) return;
  p.addEventListener('mouseenter',()=>p.style.animationPlayState='paused');
  p.addEventListener('mouseleave',()=>p.style.animationPlayState='running');
})();

// Volver arriba
(function(){
  const btn=document.querySelector('.volver-arriba'); if(!btn) return;
  const upd=()=>btn.classList.toggle('visible', window.scrollY>500);
  window.addEventListener('scroll',upd,{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'})); upd();
})();

// Accesibilidad
(function(){
  const btnG=$('btn-texto-grande'), btnN=$('btn-texto-normal'), btnC=$('btn-alto-contraste');
  if(btnG) btnG.addEventListener('click',()=>{ document.body.classList.add('texto-grande'); try{localStorage.setItem('dm-tg','1');}catch(e){} });
  if(btnN) btnN.addEventListener('click',()=>{ document.body.classList.remove('texto-grande'); try{localStorage.setItem('dm-tg','0');}catch(e){} });
  if(btnC) btnC.addEventListener('click',()=>{ const on=document.body.classList.toggle('alto-contraste'); btnC.setAttribute('aria-pressed',String(on)); try{localStorage.setItem('dm-ac',on?'1':'0');}catch(e){} });
  try{
    if(localStorage.getItem('dm-tg')==='1') document.body.classList.add('texto-grande');
    if(localStorage.getItem('dm-ac')==='1'){ document.body.classList.add('alto-contraste'); if($('btn-alto-contraste')) $('btn-alto-contraste').setAttribute('aria-pressed','true'); }
  }catch(e){}
})();

// Enlace activo nav
(function(){
  const href=window.location.href;
  document.querySelectorAll('.nav-menu a').forEach(a=>{
    if(a.href&&(a.href===href||(href.includes('/search/label/')&&href.startsWith(a.href)))) a.classList.add('activo');
  });
})();

// Fecha dinámica
(function(){
  const el=$('dm-fecha-hoy'); if(!el) return;
  const dias=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d=new Date();
  el.textContent=`${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
})();

// Animaciones scroll
(function(){
  const els=document.querySelectorAll('[data-animar]'); if(!els.length) return;
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){ els.forEach(el=>el.classList.add('animado')); return; }
  const obs=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(!e.isIntersecting) return; const d=parseInt(e.target.getAttribute('data-retraso')||'0',10); setTimeout(()=>e.target.classList.add('animado'),d); obs.unobserve(e.target); }); },{threshold:0.1,rootMargin:'0px 0px -30px 0px'});
  els.forEach(el=>obs.observe(el));
})();

// ══════════════════════════════════════════════════════
// INIT PRINCIPAL
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  console.log('%c📖 Descentralizando · ADASFRO · v4.1', 'color:#00875a;font-weight:bold;font-size:13px;');

  // Animar elementos visibles de entrada
  setTimeout(()=>{
    document.querySelectorAll('[data-animar]:not(.animado)').forEach(el=>{
      if(el.getBoundingClientRect().top < window.innerHeight*0.95){
        const d=parseInt(el.getAttribute('data-retraso')||'0',10);
        setTimeout(()=>el.classList.add('animado'),d);
      }
    });
  }, 100);

  const heroGrid = $('dm-hero-grid');

  // ── Solo en homepage ──
  if (heroGrid) {
    cargarPosts(posts => {
      // Hero con los primeros 5
      renderHero(posts.slice(0, CFG.maxHero));
      // Ticker con los primeros 8
      renderTicker(posts.slice(0, CFG.maxTicker));
      // Noticias recientes con los primeros 9
      renderGridNoticias(posts.slice(0, CFG.maxRecientes), 'dm-noticias-recientes');
      // Sidebar con los primeros 5
      renderSidebar(posts.slice(0, CFG.maxSidebar), 'dm-populares');
    });
  }

  // ── Sidebar en post individual ──
  if ($('dm-populares-post')) {
    fetchBlogger(CFG.maxSidebar, null, posts => renderSidebar(posts, 'dm-populares-post'));
  }

  // ── Ticker en otras páginas (etiqueta/búsqueda) ──
  const ticker = $('ticker-pista');
  if (ticker && !ticker.querySelector('a')) {
    fetchBlogger(CFG.maxTicker, null, posts => renderTicker(posts));
  }

  // Scroll suave anclas
  document.addEventListener('click', function(e){
    const a=e.target.closest('a[href^="#"]'); if(!a) return;
    const id=a.getAttribute('href').slice(1); if(!id) return;
    const dest=document.getElementById(id); if(!dest) return;
    e.preventDefault();
    window.scrollTo({top:dest.getBoundingClientRect().top+window.scrollY-85,behavior:'smooth'});
  });

});
