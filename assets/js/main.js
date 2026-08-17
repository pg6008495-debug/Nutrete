/* ═══════════════════════════════════════════
   NUTRETE — comportamiento del sitio
   ═══════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── 1. Secuencia cinematográfica del hero ─────────────── */
(function film(){
  const shots = $$('.film__shot');
  if (shots.length < 2 || reduced) return;
  let i = 0;
  const HOLD = 5200;              // ms visible antes del siguiente corte

  // Precarga para que los cortes no parpadeen.
  shots.forEach(s => {
    const m = /url\(["']?(.+?)["']?\)/.exec(getComputedStyle(s).backgroundImage);
    if (m) new Image().src = m[1];
  });

  setInterval(() => {
    shots[i].classList.remove('is-active');
    i = (i + 1) % shots.length;
    const next = shots[i];
    next.style.animation = 'none';   // reinicia el Ken Burns
    void next.offsetWidth;
    next.style.animation = '';
    next.classList.add('is-active');
  }, HOLD);
})();

/* ─── 2. Partículas de polvo en suspensión ──────────────── */
(function dust(){
  const cv = $('#dust');
  if (!cv || reduced) return;
  const ctx = cv.getContext('2d');
  let w, h, parts = [], raf;

  const build = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(w, 1600) / 26);
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.7 + .4,
      vx: (Math.random() - .5) * .16,
      vy: -(Math.random() * .22 + .05),
      a: Math.random() * .35 + .08,
      p: Math.random() * Math.PI * 2
    }));
  };

  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const d of parts) {
      d.p += .014;
      d.x += d.vx + Math.sin(d.p) * .16;
      d.y += d.vy;
      if (d.y < -12) { d.y = h + 12; d.x = Math.random() * w; }
      if (d.x < -12) d.x = w + 12;
      if (d.x > w + 12) d.x = -12;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, 6.284);
      ctx.fillStyle = `rgba(244,242,233,${d.a * (.65 + Math.sin(d.p) * .35)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };

  build(); tick();
  addEventListener('resize', build, { passive: true });

  // Pausa fuera de pantalla para no gastar batería.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) tick(); }
    else { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0 }).observe(cv);
})();

/* ─── 3. Nav: fondo al scrollear + menú móvil ───────────── */
(function nav(){
  const bar = $('#nav'), burger = $('#burger'), drawer = $('#drawer'), wa = $('.wa');
  const onScroll = () => {
    const y = scrollY;
    bar.classList.toggle('is-stuck', y > 60);
    wa && wa.classList.toggle('on', y > innerHeight * .7);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggle(drawer.hidden));
  drawer.addEventListener('click', e => { if (e.target.tagName === 'A') toggle(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) toggle(false); });
})();

/* ─── 4. Reveal al entrar en viewport ───────────────────── */
(function reveal(){
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, idx) => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = `${Math.min(idx * 70, 280)}ms`;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
})();

/* ─── 5. Menú semanal interactivo ───────────────────────── */
(function weekly(){
  if (!window.NUTRETE || !window.NUTRETE.menu) {
    console.error('Falta cargar contenido.js o NUTRETE.menu');
    return;
  }
  const DAYS = window.NUTRETE.menu.map((d, i) => ({
    key: ['lun','mar','mie','jue','vie'][i],
    name: d.dia,
    dishes: d.platos.map(p => ({
      tag: p.tipo, name: p.nombre, desc: p.detalle, marks: p.etiquetas
    }))
  }));

  const daysEl = $('#menuDays'), panelEl = $('#menuPanel');
  if (!daysEl) return;
  const barEl = $('#progressBar'), txtEl = $('#progressText'),
        sumEl = $('#menuSummary'), okBtn = $('#confirmBtn');

  const picks = {};
  let active = 0;

  /* Etiqueta de la semana: próximo lunes a viernes */
  (function weekLabel(){
    const MES = ['ene','feb','mar','abr','may','jun','jul','ago','set','oct','nov','dic'];
    const t = new Date();
    const mon = new Date(t);
    mon.setDate(t.getDate() + ((8 - t.getDay()) % 7 || 7));   // próximo lunes
    const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    $('#weekLabel').textContent =
      `${mon.getDate()} de ${MES[mon.getMonth()]} — ${fri.getDate()} de ${MES[fri.getMonth()]}`;
    DAYS.forEach((d, i) => {
      const dt = new Date(mon); dt.setDate(mon.getDate() + i);
      d.date = `${dt.getDate()}/${dt.getMonth() + 1}`;
    });
  })();

  /* Pestañas de días */
  daysEl.innerHTML = DAYS.map((d, i) => `
    <button class="day${i === 0 ? ' is-on' : ''}" role="tab" data-i="${i}"
            aria-selected="${i === 0}" aria-controls="menuPanel">
      <span class="tick">✓</span><b>${d.name}</b><small>${d.date}</small>
    </button>`).join('');

  const renderPanel = () => {
    const d = DAYS[active];
    panelEl.innerHTML = `<div class="dishes">${d.dishes.map((p, j) => `
      <button class="dish${picks[d.key] === j ? ' is-picked' : ''}" data-j="${j}">
        <span class="dish__tag">${p.tag}</span>
        <span class="dish__name">${p.name}</span>
        <span class="dish__desc">${p.desc}</span>
        <span class="dish__marks">${p.marks.map(m => `<em>${m}</em>`).join('')}</span>
      </button>`).join('')}</div>`;
  };

  const renderState = () => {
    const n = Object.keys(picks).length;
    barEl.style.width = `${n / DAYS.length * 100}%`;
    txtEl.textContent = `${n} de ${DAYS.length} días elegidos`;
    okBtn.disabled = n === 0;

    $$('.day', daysEl).forEach((b, i) => {
      b.classList.toggle('has-pick', picks[DAYS[i].key] !== undefined);
      b.classList.toggle('is-on', i === active);
      b.setAttribute('aria-selected', String(i === active));
    });

    sumEl.innerHTML = n === 0
      ? 'Elegí un plato para cada día. Podés cambiarlo hasta el domingo a las 20:00.'
      : DAYS.filter(d => picks[d.key] !== undefined)
            .map(d => `<b>${d.name.slice(0, 3)}:</b> ${d.dishes[picks[d.key]].name}`)
            .join(' · ');
  };

  daysEl.addEventListener('click', e => {
    const b = e.target.closest('.day'); if (!b) return;
    active = +b.dataset.i;
    renderPanel(); renderState();
  });

  panelEl.addEventListener('click', e => {
    const b = e.target.closest('.dish'); if (!b) return;
    const key = DAYS[active].key, j = +b.dataset.j;
    if (picks[key] === j) delete picks[key]; else picks[key] = j;

    renderPanel(); renderState();

    // Avanza solo al día siguiente si todavía queda alguno sin elegir.
    if (picks[key] !== undefined && active < DAYS.length - 1) {
      setTimeout(() => {
        active++;
        renderPanel(); renderState();
      }, 420);
    }
  });

  okBtn.addEventListener('click', () => {
    const lines = DAYS.filter(d => picks[d.key] !== undefined)
                      .map(d => `${d.name} ${d.date}: ${d.dishes[picks[d.key]].name}`);
    const msg = `Hola Nutrete! Esta es mi selección de la semana:\n\n${lines.join('\n')}\n\n(enviado desde la web)`;
    const wa = window.NUTRETE?.whatsapp || '59898741984';
    open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  renderPanel(); renderState();
})();

/* ─── 6. FAQ: un acordeón abierto por vez ───────────────── */
$$('.faq details').forEach(d => {
  d.addEventListener('toggle', () => {
    if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
  });
});

/* ─── 7. Formulario → WhatsApp ──────────────────────────── */
(function form(){
  const f = $('#form'); if (!f) return;

  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    let bad = false;

    ['empresa', 'nombre', 'email'].forEach(k => {
      const el = f.elements[k];
      const empty = !String(d[k] || '').trim();
      const badMail = k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '');
      el.classList.toggle('err', empty || badMail);
      if (empty || badMail) bad = true;
    });
    if (bad) { f.querySelector('.err').focus(); return; }

    const msg =
`Hola Nutrete! Quiero una propuesta para empresas.

Empresa: ${d.empresa}
Contacto: ${d.nombre}
Email: ${d.email}
Teléfono: ${d.tel || '—'}
Empleados: ${d.empleados}
Días por semana: ${d.dias}

${String(d.mensaje || '').trim() || '—'}`;

    const wa = window.NUTRETE?.whatsapp || '59898741984';
    open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');

    if (!f.querySelector('.form__ok')) {
      const ok = document.createElement('p');
      ok.className = 'form__ok';
      const wa = window.NUTRETE?.whatsapp || '59898741984';
      ok.textContent = `Listo — se abrió WhatsApp con tu consulta. Si no se abrió, escribinos al +${wa.slice(0,3)} ${wa.slice(3,5)} ${wa.slice(5,8)} ${wa.slice(8)}.`;
      f.insertBefore(ok, f.querySelector('.form__hint'));
    }
  });

  f.addEventListener('input', e => e.target.classList.remove('err'));
})();

/* ─── 8. Año en el pie ──────────────────────────────────── */
$('#year').textContent = new Date().getFullYear();

})();
