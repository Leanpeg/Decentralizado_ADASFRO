/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  DESCENTRALIZANDO — script.js                                ║
  ║  Funcionalidades interactivas del sitio                      ║
  ║                                                              ║
  ║  CÓMO ESTÁ ORGANIZADO:                                       ║
  ║  1. Navbar con sombra al scroll                              ║
  ║  2. Menú hamburguesa (móvil)                                 ║
  ║  3. Scroll suave a secciones                                 ║
  ║  4. Animaciones al hacer scroll                              ║
  ║  5. Slider de casos de éxito                                 ║
  ║  6. Filtros de noticias                                      ║
  ║  7. Conteo animado de estadísticas                           ║
  ║  8. Formulario de suscripción                                ║
  ║  9. Botón volver arriba                                      ║
  ║  10. Botones de accesibilidad (texto grande / contraste)     ║
  ╚══════════════════════════════════════════════════════════════╝
*/

'use strict'; // Modo estricto — ayuda a evitar errores

// ══════════════════════════════════════════════════════════
// 1. NAVBAR — Sombra al hacer scroll
// ══════════════════════════════════════════════════════════
(function iniciarNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Agrega sombra cuando el usuario baja en la página
  function actualizarNavbar() {
    if (window.scrollY > 30) {
      navbar.classList.add('con-sombra');
    } else {
      navbar.classList.remove('con-sombra');
    }
  }

  window.addEventListener('scroll', actualizarNavbar, { passive: true });
  actualizarNavbar(); // Ejecutar al cargar
})();


// ══════════════════════════════════════════════════════════
// 2. MENÚ HAMBURGUESA — Para pantallas móviles
// ══════════════════════════════════════════════════════════
(function iniciarMenuMovil() {
  const hamburguesa = document.getElementById('hamburguesa');
  const menuMovil   = document.getElementById('menu-movil');
  if (!hamburguesa || !menuMovil) return;

  // Al hacer clic en el ícono de hamburguesa
  hamburguesa.addEventListener('click', () => {
    const estaAbierto = hamburguesa.classList.toggle('abierto');
    menuMovil.classList.toggle('abierto', estaAbierto);
    hamburguesa.setAttribute('aria-expanded', estaAbierto.toString());
    menuMovil.setAttribute('aria-hidden', (!estaAbierto).toString());
  });

  // Cerrar menú al hacer clic en un enlace
  menuMovil.querySelectorAll('a').forEach(enlace => {
    enlace.addEventListener('click', () => {
      hamburguesa.classList.remove('abierto');
      menuMovil.classList.remove('abierto');
      hamburguesa.setAttribute('aria-expanded', 'false');
      menuMovil.setAttribute('aria-hidden', 'true');
    });
  });

  // Cerrar con la tecla Escape (accesibilidad)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburguesa.classList.contains('abierto')) {
      hamburguesa.classList.remove('abierto');
      menuMovil.classList.remove('abierto');
      hamburguesa.setAttribute('aria-expanded', 'false');
      menuMovil.setAttribute('aria-hidden', 'true');
      hamburguesa.focus(); // Devolver foco al botón
    }
  });
})();


// ══════════════════════════════════════════════════════════
// 3. SCROLL SUAVE — Navegación fluida entre secciones
// ══════════════════════════════════════════════════════════
(function iniciarScrollSuave() {
  const ALTURA_NAVBAR = 80; // Altura del navbar en píxeles

  document.querySelectorAll('a[href^="#"]').forEach(enlace => {
    enlace.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const destino = document.querySelector(href);
      if (!destino) return;

      e.preventDefault();

      // Calcular posición y hacer scroll
      const posY = destino.getBoundingClientRect().top + window.scrollY - ALTURA_NAVBAR;
      window.scrollTo({ top: posY, behavior: 'smooth' });

      // Actualizar URL sin recargar página
      history.pushState(null, '', href);

      // Mover foco al destino (accesibilidad)
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
      destino.addEventListener('blur', () => destino.removeAttribute('tabindex'), { once: true });
    });
  });
})();


// ══════════════════════════════════════════════════════════
// 4. ANIMACIONES AL SCROLL — Aparecen al ser visibles
// ══════════════════════════════════════════════════════════
(function iniciarAnimaciones() {
  const elementos = document.querySelectorAll('[data-animar]');
  if (!elementos.length) return;

  // Respetar preferencia del sistema de movimiento reducido
  const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefiereMenosMovimiento) {
    elementos.forEach(el => el.classList.add('animado'));
    return;
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;

      const el = entrada.target;
      const retraso = parseInt(el.getAttribute('data-retraso') || '0', 10);

      setTimeout(() => {
        el.classList.add('animado');
        // Si tiene animación de conteo, activarla
        if (el.querySelector('.estadistica-numero')) {
          activarConteo(el);
        }
      }, retraso);

      observer.unobserve(el); // Solo animar una vez
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  elementos.forEach(el => observer.observe(el));
})();


// ══════════════════════════════════════════════════════════
// 5. SLIDER DE CASOS DE ÉXITO — Carrusel interactivo
// ══════════════════════════════════════════════════════════
(function iniciarSlider() {
  const pista      = document.getElementById('slider-pista');
  const btnAnterior = document.getElementById('slider-anterior');
  const btnSiguiente = document.getElementById('slider-siguiente');
  const contenedor  = document.getElementById('slider-indicadores');

  if (!pista || !btnAnterior || !btnSiguiente) return;

  const tarjetas    = pista.querySelectorAll('.caso-card');
  const totalTarjetas = tarjetas.length;
  let indiceActual  = 0;
  let tarjetasPorVista = obtenerTarjetasPorVista();

  // Cuántas tarjetas mostrar según el ancho de pantalla
  function obtenerTarjetasPorVista() {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 1;
    return 3;
  }

  // Crear puntos indicadores
  function crearIndicadores() {
    if (!contenedor) return;
    contenedor.innerHTML = '';
    const totalIndicadores = Math.ceil(totalTarjetas / tarjetasPorVista);
    for (let i = 0; i < totalIndicadores; i++) {
      const btn = document.createElement('button');
      btn.className = 'indicador' + (i === 0 ? ' activo' : '');
      btn.setAttribute('aria-label', `Ir al grupo ${i + 1}`);
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => irA(i));
      contenedor.appendChild(btn);
    }
  }

  // Actualizar qué indicador está activo
  function actualizarIndicadores() {
    if (!contenedor) return;
    const puntos = contenedor.querySelectorAll('.indicador');
    const grupo = Math.floor(indiceActual / tarjetasPorVista);
    puntos.forEach((p, i) => p.classList.toggle('activo', i === grupo));
  }

  // Mover el slider al índice indicado
  function irA(grupoIndex) {
    const totalGrupos = Math.ceil(totalTarjetas / tarjetasPorVista);
    indiceActual = Math.min(grupoIndex * tarjetasPorVista, totalTarjetas - tarjetasPorVista);
    const anchoTarjeta = tarjetas[0].offsetWidth + 24; // 24px = gap
    pista.style.transform = `translateX(-${indiceActual * anchoTarjeta}px)`;
    actualizarIndicadores();
  }

  // Siguiente
  function siguiente() {
    const maxIndice = totalTarjetas - tarjetasPorVista;
    indiceActual = indiceActual >= maxIndice ? 0 : indiceActual + tarjetasPorVista;
    irA(Math.floor(indiceActual / tarjetasPorVista));
  }

  // Anterior
  function anterior() {
    const maxIndice = totalTarjetas - tarjetasPorVista;
    indiceActual = indiceActual <= 0 ? maxIndice : indiceActual - tarjetasPorVista;
    irA(Math.floor(indiceActual / tarjetasPorVista));
  }

  // Eventos de botones
  btnSiguiente.addEventListener('click', siguiente);
  btnAnterior.addEventListener('click', anterior);

  // Avance automático cada 5 segundos
  let autoAvance = setInterval(siguiente, 5000);

  // Pausar auto-avance al interactuar
  [btnAnterior, btnSiguiente].forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(autoAvance);
      autoAvance = setInterval(siguiente, 6000);
    });
  });

  // Soporte para swipe táctil
  let inicioX = 0;
  pista.addEventListener('touchstart', e => { inicioX = e.touches[0].clientX; }, { passive: true });
  pista.addEventListener('touchend', e => {
    const diff = inicioX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? siguiente() : anterior();
    }
  });

  // Recalcular al cambiar tamaño de ventana
  window.addEventListener('resize', () => {
    tarjetasPorVista = obtenerTarjetasPorVista();
    indiceActual = 0;
    crearIndicadores();
    irA(0);
  });

  // Iniciar
  crearIndicadores();
})();


// ══════════════════════════════════════════════════════════
// 6. FILTROS DE NOTICIAS — Mostrar/ocultar por categoría
// ══════════════════════════════════════════════════════════
(function iniciarFiltros() {
  const botonesFiltro = document.querySelectorAll('.filtro');
  const tarjetasNoticia = document.querySelectorAll('.tarjeta-noticia');
  if (!botonesFiltro.length || !tarjetasNoticia.length) return;

  botonesFiltro.forEach(btn => {
    btn.addEventListener('click', () => {
      const filtro = btn.getAttribute('data-filtro');

      // Actualizar botón activo
      botonesFiltro.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      // Mostrar u ocultar tarjetas
      tarjetasNoticia.forEach(tarjeta => {
        const categoria = tarjeta.getAttribute('data-categoria');
        if (filtro === 'todos' || categoria === filtro) {
          tarjeta.classList.remove('oculto');
        } else {
          tarjeta.classList.add('oculto');
        }
      });

      // Ajustar el layout según cuántas tarjetas quedan visibles
      const visibles = document.querySelectorAll('.tarjeta-noticia:not(.oculto)');
      const grilla = document.getElementById('grilla-noticias');
      if (grilla) {
        if (visibles.length === 1) {
          grilla.style.gridTemplateColumns = '1fr';
        } else if (visibles.length === 2) {
          grilla.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
          grilla.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
      }
    });
  });
})();


// ══════════════════════════════════════════════════════════
// 7. CONTEO ANIMADO DE ESTADÍSTICAS
// ══════════════════════════════════════════════════════════

// Esta función anima el número de una estadística desde 0 hasta su valor final
function activarConteo(tarjeta) {
  const numEl = tarjeta.querySelector('.estadistica-numero[data-meta]');
  if (!numEl || numEl.hasAttribute('data-contado')) return;
  numEl.setAttribute('data-contado', 'true');

  const meta    = parseInt(numEl.getAttribute('data-meta'), 10);
  const sufijo  = numEl.getAttribute('data-sufijo') || '';
  const duracion = 1800; // milisegundos de la animación
  const inicio  = performance.now();

  // Función de aceleración (ease-out)
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animar(ahora) {
    const transcurrido = ahora - inicio;
    const progreso = Math.min(transcurrido / duracion, 1);
    const valorActual = Math.round(easeOut(progreso) * meta);
    numEl.textContent = valorActual + sufijo;
    if (progreso < 1) requestAnimationFrame(animar);
  }

  requestAnimationFrame(animar);
}

// Observar tarjetas de estadísticas para activar el conteo al hacerse visibles
(function iniciarConteoEstadisticas() {
  const tarjetas = document.querySelectorAll('.tarjeta-estadistica');
  if (!tarjetas.length) return;

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        activarConteo(entrada.target);
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.3 });

  tarjetas.forEach(t => observer.observe(t));
})();


// ══════════════════════════════════════════════════════════
// 8. FORMULARIO DE SUSCRIPCIÓN — Validación y feedback
// ══════════════════════════════════════════════════════════
(function iniciarFormulario() {
  const formulario = document.getElementById('formulario-suscripcion');
  if (!formulario) return;

  const mensajeExito = document.getElementById('formulario-exito');

  // Validar formato de correo
  function esEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Marcar campo como válido o inválido
  function marcarCampo(input, conError) {
    if (conError) {
      input.classList.add('con-error');
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.classList.remove('con-error');
      input.removeAttribute('aria-invalid');
    }
  }

  // Limpiar errores al escribir
  formulario.querySelectorAll('input, textarea').forEach(campo => {
    campo.addEventListener('input', () => marcarCampo(campo, false));
  });

  // Al enviar el formulario
  formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    let valido = true;

    const nombre = formulario.querySelector('#nombre-suscripcion');
    const email  = formulario.querySelector('#email-suscripcion');

    // Validar nombre
    if (!nombre.value.trim()) {
      marcarCampo(nombre, true);
      valido = false;
    } else {
      marcarCampo(nombre, false);
    }

    // Validar email
    if (!esEmailValido(email.value.trim())) {
      marcarCampo(email, true);
      valido = false;
    } else {
      marcarCampo(email, false);
    }

    // Si hay errores, enfocar el primero
    if (!valido) {
      const primerError = formulario.querySelector('.con-error');
      if (primerError) primerError.focus();
      return;
    }

    // Simular envío
    // ✏️ NOTA: Para que el formulario envíe emails reales,
    // reemplaza esta simulación con una llamada a Formspree o Web3Forms:
    // fetch('https://formspree.io/f/TU_ID', { method: 'POST', body: new FormData(formulario) })
    const btnEnviar = formulario.querySelector('button[type="submit"]');
    btnEnviar.disabled = true;
    btnEnviar.textContent = '⏳ Enviando...';

    setTimeout(() => {
      formulario.reset();
      btnEnviar.disabled = false;
      btnEnviar.textContent = '📩 Enviar y suscribirme';

      if (mensajeExito) {
        mensajeExito.textContent = '✅ ¡Listo! Te has suscrito exitosamente a Descentralizando.';
        mensajeExito.classList.add('visible');
        // Ocultar mensaje después de 6 segundos
        setTimeout(() => {
          mensajeExito.classList.remove('visible');
          mensajeExito.textContent = '';
        }, 6000);
      }
    }, 1400);
  });
})();


// ══════════════════════════════════════════════════════════
// 9. BOTÓN VOLVER ARRIBA
// ══════════════════════════════════════════════════════════
(function iniciarVolverArriba() {
  const boton = document.getElementById('volver-arriba');
  if (!boton) return;

  // Mostrar/ocultar según posición de scroll
  function actualizarBoton() {
    boton.classList.toggle('visible', window.scrollY > 500);
  }

  window.addEventListener('scroll', actualizarBoton, { passive: true });

  // Al hacer clic, volver al inicio
  boton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Mover foco al inicio de la página (accesibilidad)
    const saltarContenido = document.querySelector('.saltar-contenido');
    if (saltarContenido) saltarContenido.focus();
  });

  actualizarBoton();
})();


// ══════════════════════════════════════════════════════════
// 10. BOTONES DE ACCESIBILIDAD
//     - Texto más grande
//     - Texto normal
//     - Alto contraste
// ══════════════════════════════════════════════════════════
(function iniciarAccesibilidad() {

  // Botón: Texto grande
  const btnGrande = document.getElementById('btn-texto-grande');
  if (btnGrande) {
    btnGrande.addEventListener('click', () => {
      document.body.classList.add('texto-grande');
      // Guardar preferencia (si el navegador lo permite)
      try { localStorage.setItem('textoGrande', 'si'); } catch(e) {}
    });
  }

  // Botón: Texto normal
  const btnNormal = document.getElementById('btn-texto-normal');
  if (btnNormal) {
    btnNormal.addEventListener('click', () => {
      document.body.classList.remove('texto-grande');
      try { localStorage.setItem('textoGrande', 'no'); } catch(e) {}
    });
  }

  // Botón: Alto contraste
  const btnContraste = document.getElementById('btn-alto-contraste');
  if (btnContraste) {
    btnContraste.addEventListener('click', () => {
      const activo = document.body.classList.toggle('alto-contraste');
      btnContraste.setAttribute('aria-pressed', activo.toString());
      try { localStorage.setItem('altoContraste', activo ? 'si' : 'no'); } catch(e) {}
    });
  }

  // Restaurar preferencias guardadas al cargar la página
  try {
    if (localStorage.getItem('textoGrande') === 'si') {
      document.body.classList.add('texto-grande');
    }
    if (localStorage.getItem('altoContraste') === 'si') {
      document.body.classList.add('alto-contraste');
      if (btnContraste) btnContraste.setAttribute('aria-pressed', 'true');
    }
  } catch(e) {}
})();


// ══════════════════════════════════════════════════════════
// 11. ENLACE ACTIVO EN NAVBAR al hacer scroll
// ══════════════════════════════════════════════════════════
(function iniciarEnlaceActivo() {
  const secciones  = document.querySelectorAll('section[id]');
  const enlacesNav = document.querySelectorAll('.nav-menu a[href^="#"]');
  if (!secciones.length || !enlacesNav.length) return;

  const OFFSET = 120;

  function actualizarEnlaceActivo() {
    let actual = '';
    secciones.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= OFFSET) actual = sec.id;
    });

    enlacesNav.forEach(enlace => {
      const href = enlace.getAttribute('href').slice(1);
      enlace.classList.toggle('activo', href === actual);
    });
  }

  window.addEventListener('scroll', actualizarEnlaceActivo, { passive: true });
  actualizarEnlaceActivo();
})();


// ══════════════════════════════════════════════════════════
// 12. TICKER DE NOTICIAS — Pausa al pasar el mouse
// ══════════════════════════════════════════════════════════
(function iniciarTicker() {
  const pista = document.getElementById('ticker-pista');
  if (!pista) return;

  // Pausar animación al pasar el cursor (para leer mejor)
  pista.addEventListener('mouseenter', () => {
    pista.style.animationPlayState = 'paused';
  });
  pista.addEventListener('mouseleave', () => {
    pista.style.animationPlayState = 'running';
  });
})();


// ══════════════════════════════════════════════════════════
// 13. INICIALIZACIÓN GENERAL
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Mensaje en la consola del navegador (solo para desarrolladores)
  console.log(
    '%c🗺️ Descentralizando — por ADASFRO\n%cDesarrollo Accesible Sin Fronteras · Costa Rica',
    'color: #2d6a4f; font-size: 16px; font-weight: bold;',
    'color: #40916c; font-size: 12px;'
  );

  // Activar animaciones de elementos ya visibles al cargar
  setTimeout(() => {
    document.querySelectorAll('[data-animar]:not(.animado)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        const retraso = parseInt(el.getAttribute('data-retraso') || '0', 10);
        setTimeout(() => {
          el.classList.add('animado');
          if (el.querySelector('.estadistica-numero')) activarConteo(el);
        }, retraso);
      }
    });
  }, 150);

});
