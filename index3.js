/* ============================================================
   PORSCHE | LUXURY REDEFINED — JAVASCRIPT GLOBAL
   Contiene: Navbar, Slider, Carrusel, Stats Counter,
             Carrito, Modal, Formulario, Auto 3D Mouse
   ============================================================ */

'use strict';

// ============================================================
// UTILIDADES GLOBALES
// ============================================================

/** Muestra una notificación toast en pantalla */
function showToast(message, type = 'default') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// ============================================================
// CARRITO DE COMPRAS — Persistencia en sessionStorage
// ============================================================
const Cart = {
  _key: 'porsche_cart',

  getItems() {
    try {
      return JSON.parse(sessionStorage.getItem(this._key)) || [];
    } catch { return []; }
  },

  saveItems(items) {
    sessionStorage.setItem(this._key, JSON.stringify(items));
    this.updateCount();
  },

  addItem(item) {
    const items = this.getItems();
    // Evitar duplicados exactos
    const exists = items.find(i => i.name === item.name);
    if (exists) {
      showToast(`"${item.name}" ya está en tu carrito`, 'error');
      return false;
    }
    items.push(item);
    this.saveItems(items);
    showToast(`✓ ${item.name} agregado al carrito`, 'success');
    return true;
  },

  removeItem(name) {
    let items = this.getItems().filter(i => i.name !== name);
    this.saveItems(items);
    showToast(`Eliminado del carrito`, 'default');
    return items;
  },

  updateCount() {
    const count = this.getItems().length;
    document.querySelectorAll('#cartCount').forEach(el => {
      el.textContent = count;
    });
  },

  getTotal() {
    return this.getItems().reduce((sum, item) => {
      const num = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }
};

// ============================================================
// NAVBAR — Scroll + Porsche
// ============================================================
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const porsche = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar) return;

  // Efecto scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // porsche mobile
  if (porsche && navLinks) {
    porsche.addEventListener('click', () => {
      porsche.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Cerrar al hacer clic en un link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        porsche.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Actualizar contador del carrito al cargar
  Cart.updateCount();
}

// ============================================================
// SLIDER MANUAL (index.html) — Carrusel de colecciones
// ============================================================
function initSlider() {
  const track    = document.getElementById('sliderTrack');
  const btnPrev  = document.getElementById('sliderPrev');
  const btnNext  = document.getElementById('sliderNext');
  const dotsBox  = document.getElementById('sliderDots');

  if (!track) return;

  const slides     = track.querySelectorAll('.slide');
  const total      = slides.length;
  let current      = 0;
  let autoInterval = null;

  // Crear dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(dot);
  });

  function getSlideWidth() {
    const slide = slides[0];
    return slide.offsetWidth + parseInt(getComputedStyle(track).gap || '24');
  }

  function goTo(index) {
    current = (index + total) % total;
    const offset = current * getSlideWidth();
    track.style.transform = `translateX(-${offset}px)`;
    dotsBox.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  btnNext?.addEventListener('click', () => { next(); resetAuto(); });
  btnPrev?.addEventListener('click', () => { prev(); resetAuto(); });

  // Touch / swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    resetAuto();
  });

  // Auto play
  function startAuto() {
    autoInterval = setInterval(next, 4500);
  }

  function resetAuto() {
    clearInterval(autoInterval);
    startAuto();
  }

  startAuto();

  // Reajuste en resize
  window.addEventListener('resize', () => goTo(current), { passive: true });
}

// ============================================================
// CARRUSEL DE PRODUCTOS (index3.coleccion.html) — Auto + manual
// ============================================================
function initProductCarousel() {
  const track = document.getElementById('caruselTrack');
  if (!track) return;

  const slides  = track.querySelectorAll('.carusel-slide');
  const total   = slides.length;
  let current   = 0;
  let interval  = null;

  const prevBtn = document.getElementById('caruselPrev');
  const nextBtn = document.getElementById('caruselNext');
  const dots    = document.querySelectorAll('.carusel-dot');

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); reset(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); reset(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); reset(); }));

  function start() { interval = setInterval(() => goTo(current + 1), 5000); }
  function reset() { clearInterval(interval); start(); }

  start();
}

// ============================================================
// ANIMACIÓN CONTADORES — Stats section
// ============================================================
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const dur    = 2200;
      const step   = 16;
      const steps  = Math.round(dur / step);
      let count    = 0;

      const timer = setInterval(() => {
        count++;
        const progress = count / steps;
        const eased = 1 - Math.pow(1 - progress, 3); // easeOut cubic
        el.textContent = Math.round(eased * target).toLocaleString('es-DO');
        if (count >= steps) {
          el.textContent = target.toLocaleString('es-DO');
          clearInterval(timer);
        }
      }, step);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ============================================================
// AUTO 3D — Seguimiento del mouse
// ============================================================
function initCar3D() {
  const scene = document.querySelector('.hero-3d-scene');
  const car   = document.getElementById('car3D');
  if (!scene || !car) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const rx = ((e.clientY - cy) / cy) * 12;   // inclinación vertical
    const ry = ((e.clientX - cx) / cx) * -15;  // rotación horizontal
    // Combinar con la animación continua — solo ajuste de tilt
    car.style.setProperty('--mouse-x', `${ry}deg`);
    car.style.setProperty('--mouse-y', `${rx}deg`);
  });
}

// ============================================================
// TABS DE NOSOTROS — Misión / Visión / Valores
// ============================================================
function initNosotrosTabs() {
  const tabs     = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.nosotros-section');
  if (!tabs.length) return;

  function activateTab(id) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    sections.forEach(s => s.classList.toggle('active', s.id === id));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  // Si hay hash en URL, activar esa pestaña
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    activateTab(hash);
  } else if (tabs.length) {
    activateTab(tabs[0].dataset.tab);
  }
}

// ============================================================
// BÚSQUEDA DE PRODUCTOS — Filtrado en tiempo real
// ============================================================
function initProductSearch() {
  const searchInput = document.getElementById('productSearch');
  const grid        = document.getElementById('productsGrid');
  if (!searchInput || !grid) return;

  searchInput.addEventListener('input', () => {
    const q     = searchInput.value.toLowerCase().trim();
    const cards = grid.querySelectorAll('.product-card');
    let visible = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const show = !q || text.includes(q);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Mensaje de sin resultados
    let noRes = grid.querySelector('.no-results');
    if (visible === 0) {
      if (!noRes) {
        noRes = document.createElement('p');
        noRes.className = 'no-results';
        noRes.textContent = `No encontramos modelos con "${q}". Intenta con otro nombre.`;
        grid.appendChild(noRes);
      }
    } else {
      noRes?.remove();
    }
  });
}

// ============================================================
// BOTONES "AGREGAR AL CARRITO"
// ============================================================
function initCartButtons() {
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.product-card');
      const name  = card?.querySelector('h3')?.textContent?.trim();
      const price = card?.querySelector('.card-price')?.textContent?.trim();

      if (!name || !price) return;

      // Verificar si usuario está "registrado" en session
      const user = sessionStorage.getItem('porsche_user');
      if (!user) {
        openModal('register', { name, price });
        return;
      }

      Cart.addItem({ name, price });
    });
  });
}

// ============================================================
// MODAL DE REGISTRO / LOGIN
// ============================================================
let _pendingCartItem = null;

function openModal(type = 'register', pendingItem = null) {
  _pendingCartItem = pendingItem;
  const overlay = document.getElementById('authModal');
  if (overlay) overlay.classList.add('active');
}

function closeModal() {
  const overlay = document.getElementById('authModal');
  if (overlay) overlay.classList.remove('active');
  _pendingCartItem = null;
}

function initModal() {
  const overlay    = document.getElementById('authModal');
  const closeBtn   = document.getElementById('modalClose');
  const registerForm = document.getElementById('registerForm');
  if (!overlay) return;

  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  registerForm?.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('regName')?.value?.trim();
    const email = document.getElementById('regEmail')?.value?.trim();
    if (!name || !email) return;

    // Guardar usuario
    sessionStorage.setItem('porsche_user', JSON.stringify({ name, email }));
    closeModal();
    showToast(`¡Bienvenido, ${name}!`, 'success');

    // Agregar item pendiente
    if (_pendingCartItem) {
      setTimeout(() => Cart.addItem(_pendingCartItem), 400);
    }
  });
}

// ============================================================
// CARRITO EN PÁGINA CONTACTO — Renderizar items
// ============================================================
function initCartDisplay() {
  const cartList  = document.getElementById('cartItemsList');
  const cartTotal = document.getElementById('cartTotal');
  const cartEmpty = document.getElementById('cartEmpty');
  if (!cartList) return;

  function render() {
    const items = Cart.getItems();
    cartList.innerHTML = '';
    cartEmpty.style.display = items.length ? 'none' : 'block';

    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-price">${item.price}</span>
        <button class="btn-remove-cart" data-name="${item.name}" title="Eliminar">✕</button>
      `;
      li.querySelector('.btn-remove-cart').addEventListener('click', function() {
        Cart.removeItem(this.dataset.name);
        render();
      });
      cartList.appendChild(li);
    });

    if (cartTotal) {
      const total = Cart.getTotal();
      cartTotal.textContent = total > 0
        ? `RD$ ${total.toLocaleString('es-DO')}`
        : '—';
    }
  }

  render();
}

// ============================================================
// FORMULARIO DE CONTACTO — Validación y envío simulado
// ============================================================
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Validación básica
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(220,50,50,0.6)';
        field.addEventListener('input', () => field.style.borderColor = '', { once: true });
        valid = false;
      }
    });

    if (!valid) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Simular envío
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      if (success) success.style.display = 'block';

      // Vaciar carrito al confirmar
      sessionStorage.removeItem('porsche_cart');
      Cart.updateCount();
    }, 1800);
  });
}

// ============================================================
// ANIMACIONES DE ENTRADA — Intersection Observer
// ============================================================
function initScrollAnimations() {
  const elements = document.querySelectorAll(
    '.slide, .product-card, .stat-item, .valor-card, .contact-detail, .nosotros-text, .nosotros-visual'
  );

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${i * 0.08}s`;
        entry.target.style.animation = 'fadeUp 0.7s ease forwards';
        entry.target.style.opacity   = '0';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ============================================================
// ESTRELLAS INTERACTIVAS EN CARDS
// ============================================================
function initStarRating() {
  document.querySelectorAll('.card-stars[data-rating]').forEach(starsEl => {
    const rating   = parseFloat(starsEl.dataset.rating) || 0;
    const maxStars = 5;
    starsEl.innerHTML = '';

    for (let i = 1; i <= maxStars; i++) {
      const star = document.createElement('span');
      star.className = 'star ' + (i <= Math.round(rating) ? 'filled' : '');
      star.textContent = '★';
      starsEl.appendChild(star);
    }

    const label = document.createElement('span');
    label.textContent = `(${rating})`;
    starsEl.appendChild(label);
  });
}

// ============================================================
// PARALLAX SUAVE EN HERO
// ============================================================
function initParallax() {
  const hero    = document.querySelector('.hero');
  const content = document.querySelector('.hero-content');
  if (!hero || !content) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      content.style.transform = `translateY(${scrollY * 0.25}px)`;
      content.style.opacity   = `${1 - scrollY / 600}`;
    }
  }, { passive: true });
}

// ============================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSlider();
  initProductCarousel();
  initCounters();
  initCar3D();
  initNosotrosTabs();
  initProductSearch();
  initCartButtons();
  initModal();
  initCartDisplay();
  initContactForm();
  initScrollAnimations();
  initStarRating();
  initParallax();
});