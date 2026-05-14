/**
 * Voces por la Dignidad — Lenin Pérez Guzmán
 * main.js — v2.0
 * - Carga posts reales desde el feed de Blogger
 * - Menú hamburguesa accesible
 * - Sin tracking ni scripts de analítica
 */

(function () {
  'use strict';

  /* ============================================================
     1. AÑO EN FOOTER
  ============================================================ */
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============================================================
     2. MENÚ RESPONSIVE (hamburguesa)
  ============================================================ */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    function openMenu() {
      navLinks.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      navLinks.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function toggleMenu() {
      toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    }

    toggle.addEventListener('click', toggleMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('nav-open')) {
        closeMenu(); toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('nav-open') &&
          !navLinks.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeMenu();
    });

    // Trampa de foco
    navLinks.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !navLinks.classList.contains('nav-open')) return;
      const focusable = navLinks.querySelectorAll('a');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); toggle.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); toggle.focus();
      }
    });
  }

  /* ============================================================
     3. CARGAR POSTS DESDE FEED DE BLOGGER
     Usa la API JSON de Blogger (no requiere clave API)
  ============================================================ */
  var BLOGGER_URL = 'https://voces-por-la-dignidad.blogspot.com';
  var FEED_URL    = BLOGGER_URL + '/feeds/posts/default?alt=json&max-results=3&orderby=published';

  function loadBloggerPosts() {
    var container = document.getElementById('recent-posts');
    if (!container) return;

    var script = document.createElement('script');
    script.src = FEED_URL + '&callback=renderPosts';
    script.onerror = function () { showPostError(container); };
    document.head.appendChild(script);
  }

  // Callback global que Blogger llama con el JSON
  window.renderPosts = function (data) {
    var container = document.getElementById('recent-posts');
    if (!container) return;

    var entries = (data.feed && data.feed.entry) ? data.feed.entry : [];

    if (entries.length === 0) {
      container.innerHTML =
        '<p class="no-posts-msg">Aún no hay artículos publicados. ' +
        '<a href="' + BLOGGER_URL + '" target="_blank" rel="noopener">Visitar el blog</a></p>';
      return;
    }

    var html = '';
    entries.forEach(function (entry, i) {
      var title   = entry.title ? entry.title.$t : 'Sin título';
      var summary = entry.summary ? entry.summary.$t : '';
      if (summary.length > 160) summary = summary.substring(0, 157) + '…';

      // Fecha
      var dateStr = '';
      if (entry.published) {
        var d = new Date(entry.published.$t);
        dateStr = d.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
      }

      // URL del post
      var postUrl = BLOGGER_URL;
      if (entry.link) {
        var altLink = entry.link.find(function (l) { return l.rel === 'alternate'; });
        if (altLink) postUrl = altLink.href;
      }

      // Etiqueta/categoría
      var tag = '';
      if (entry.category && entry.category.length > 0) {
        tag = '<a class="post-tag" href="' + BLOGGER_URL + '/search/label/' +
              encodeURIComponent(entry.category[0].term) + '" target="_blank" rel="noopener">' +
              entry.category[0].term + '</a>';
      }

      // Imagen del post (si tiene)
      var imgHtml = '';
      if (entry['media$thumbnail']) {
        var imgSrc = entry['media$thumbnail'].url.replace('/s72-c/', '/s400-c/');
        imgHtml = '<div class="post-card__image"><img src="' + imgSrc + '" alt="" loading="lazy"/></div>';
      }

      var featured = i === 0 ? ' post-card--featured' : '';
      html +=
        '<article class="post-card' + featured + '">' +
          imgHtml +
          '<div class="post-card__meta">' +
            '<time>' + dateStr + '</time>' +
            tag +
          '</div>' +
          '<h3 class="post-card__title"><a href="' + postUrl + '" target="_blank" rel="noopener">' + title + '</a></h3>' +
          '<p class="post-card__excerpt">' + summary + '</p>' +
          '<a href="' + postUrl + '" class="post-read-more" target="_blank" rel="noopener" ' +
            'aria-label="Leer artículo: ' + title + '">Leer más →</a>' +
        '</article>';
    });

    container.innerHTML = html;
  };

  function showPostError(container) {
    container.innerHTML =
      '<p class="no-posts-msg">No se pudieron cargar los artículos. ' +
      '<a href="' + BLOGGER_URL + '" target="_blank" rel="noopener">Ver el blog directamente →</a></p>';
  }

  /* ============================================================
     4. ACCESIBILIDAD
  ============================================================ */
  function initAccessibility() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
    });
    document.addEventListener('mousedown', function () {
      document.body.classList.remove('keyboard-nav');
    });

    var skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function (e) {
        var target = document.getElementById('main-content');
        if (target) {
          e.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.addEventListener('blur', function () {
            target.removeAttribute('tabindex');
          }, { once: true });
        }
      });
    }
  }

  /* ============================================================
     5. SMOOTH SCROLL
  ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = anchor.getAttribute('href').slice(1);
        if (!targetId) return;
        var target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        var headerH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h') || '68', 10);
        var top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', function () {
          target.removeAttribute('tabindex');
        }, { once: true });
      });
    });
  }

  /* ============================================================
     6. MARCAR NAV ACTIVO
  ============================================================ */
  function markActiveNav() {
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPath) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    setYear();
    initNav();
    initAccessibility();
    initSmoothScroll();
    markActiveNav();
    loadBloggerPosts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
