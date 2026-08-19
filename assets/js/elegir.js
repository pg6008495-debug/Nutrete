/* ═══════════════════════════════════════════════════════════════
   NUTRETE — Portal "Elegí tu semana"
   ═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://tnbzbxmseyksbappymmz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qXlC4HGj_ZVbQMKlWCvLEA_IAa12hy9';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const MESES = ['enero','febrero','marzo','abril','mayo','junio',
               'julio','agosto','setiembre','octubre','noviembre','diciembre'];

/* ─── Estado ──────────────────────────────────────────────── */
const estado = {
  codigo:  '',
  empresa: '',
  nombre:  '',
  email:   '',
  elegido: {}          /* { 'Lunes': 'Bowl de pollo...', ... } */
};

/* ─── Semana: el próximo lunes ────────────────────────────── */
function proximoLunes(){
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const lun = new Date(hoy);
  lun.setDate(hoy.getDate() + ((8 - hoy.getDay()) % 7 || 7));
  return lun;
}
const LUNES = proximoLunes();

function fechaISO(d){
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + dd;
}
function fechaCorta(d){
  return d.getDate() + ' de ' + MESES[d.getMonth()];
}

/* ─── Llamadas a Supabase ─────────────────────────────────── */
async function rpc(fn, params){
  const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!r.ok){
    let detalle = '';
    try { detalle = (await r.json()).message || ''; } catch(e){}
    throw new Error(detalle || ('Error ' + r.status));
  }
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}

/* ─── Utilidades ──────────────────────────────────────────── */
function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function mostrar(id){
  $$('.paso').forEach(s => s.classList.toggle('is-on', s.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function error(sel, msg){
  const box = $(sel);
  if (!msg){ box.hidden = true; return; }
  box.textContent = msg;
  box.hidden = false;
}

/* ═══ PASO 1 — Acceso ═════════════════════════════════════ */
$('#formAcceso').addEventListener('submit', async e => {
  e.preventDefault();
  error('#errAcceso', '');

  const codigo = $('#inCodigo').value.trim();
  const nombre = $('#inNombre').value.trim();
  const email  = $('#inEmail').value.trim();

  if (!codigo || !nombre || !email){
    error('#errAcceso', 'Completá los tres campos para continuar.');
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
    error('#errAcceso', 'Revisá el email: falta el @ o el dominio.');
    return;
  }

  const btn = $('#btnAcceso');
  btn.classList.add('is-busy');
  btn.textContent = 'Verificando…';

  try {
    const empresa = await rpc('validar_empresa', { p_codigo: codigo });

    if (!empresa){
      error('#errAcceso', 'Ese código no corresponde a ninguna empresa. Pedíselo a RR.HH.');
      return;
    }

    estado.codigo  = codigo;
    estado.nombre  = nombre;
    estado.email   = email;
    estado.empresa = empresa;

    try {
      localStorage.setItem('nutrete_user', JSON.stringify({ codigo, nombre, email }));
    } catch(e){}

    $('#labelEmpresa').textContent = empresa;
    $('#navTag').textContent = empresa;
    pintarMenu();
    mostrar('pasoMenu');

  } catch (err){
    error('#errAcceso', 'No pudimos conectarnos. Revisá tu internet y probá de nuevo.');
    console.error(err);
  } finally {
    btn.classList.remove('is-busy');
    btn.textContent = 'Continuar';
  }
});

/* Recordar al usuario entre visitas */
(function recordar(){
  try {
    const g = JSON.parse(localStorage.getItem('nutrete_user') || 'null');
    if (!g) return;
    $('#inCodigo').value = g.codigo || '';
    $('#inNombre').value = g.nombre || '';
    $('#inEmail').value  = g.email  || '';
  } catch(e){}
})();

/* ═══ PASO 2 — Menú ═══════════════════════════════════════ */
function pintarMenu(){
  const menu = (window.NUTRETE && window.NUTRETE.menu) || [];
  const vie = new Date(LUNES);
  vie.setDate(LUNES.getDate() + 4);
  $('#labelSemana').textContent = fechaCorta(LUNES) + ' al ' + fechaCorta(vie);

  $('#dias').innerHTML = menu.map((d, i) => {
    const fecha = new Date(LUNES);
    fecha.setDate(LUNES.getDate() + i);

    const opts = d.platos.map(p => {
      const tags = (p.etiquetas || []).map(t => '<span>' + esc(t) + '</span>').join('');
      return '<button class="opt" type="button" aria-pressed="false"' +
             ' data-dia="' + esc(d.dia) + '" data-plato="' + esc(p.nombre) + '">' +
             '<span class="opt__tipo">' + esc(p.tipo) + '</span>' +
             '<span class="opt__nom">' + esc(p.nombre) + '</span>' +
             '<span class="opt__det">' + esc(p.detalle) + '</span>' +
             '<span class="opt__tags">' + tags + '</span>' +
             '</button>';
    }).join('');

    return '<article class="dia" data-dia="' + esc(d.dia) + '">' +
             '<div class="dia__head">' +
               '<h2 class="dia__nom">' + esc(d.dia) + '</h2>' +
               '<span class="dia__fecha">' + fechaCorta(fecha) + '</span>' +
               '<span class="dia__ok">Elegido</span>' +
             '</div>' +
             '<div class="opciones">' + opts + '</div>' +
           '</article>';
  }).join('');

  $$('.opt').forEach(b => b.addEventListener('click', () => elegir(b)));
  progreso();
}

function elegir(btn){
  const dia    = btn.dataset.dia;
  const plato  = btn.dataset.plato;
  const bloque = btn.closest('.dia');
  const yaEstaba = estado.elegido[dia] === plato;

  $$('.opt', bloque).forEach(o => o.setAttribute('aria-pressed', 'false'));

  if (yaEstaba){
    delete estado.elegido[dia];
    bloque.classList.remove('is-done');
  } else {
    btn.setAttribute('aria-pressed', 'true');
    estado.elegido[dia] = plato;
    bloque.classList.add('is-done');
  }
  progreso();
}

function progreso(){
  const menu  = (window.NUTRETE && window.NUTRETE.menu) || [];
  const total = menu.length || 5;
  const n     = Object.keys(estado.elegido).length;
  $('#progTxt').textContent = n + ' de ' + total + ' días';
  $('#progBar').style.width = ((n / total) * 100) + '%';
  $('#btnGuardar').disabled = n === 0;
}

/* ═══ Guardar ═════════════════════════════════════════════ */
$('#btnGuardar').addEventListener('click', async () => {
  error('#errMenu', '');
  const btn = $('#btnGuardar');
  btn.classList.add('is-busy');
  btn.textContent = 'Guardando…';

  const elecciones = Object.keys(estado.elegido)
    .map(dia => ({ dia: dia, plato: estado.elegido[dia] }));

  try {
    await rpc('guardar_pedido', {
      p_codigo:     estado.codigo,
      p_nombre:     estado.nombre,
      p_email:      estado.email,
      p_semana:     fechaISO(LUNES),
      p_elecciones: elecciones
    });

    $('#okNombre').textContent = estado.nombre.split(' ')[0];
    $('#okResumen').innerHTML = elecciones
      .map(e => '<li><b>' + esc(e.dia) + '</b><span>' + esc(e.plato) + '</span></li>')
      .join('');
    mostrar('pasoListo');

  } catch (err){
    error('#errMenu', 'No pudimos guardar tu elección. Probá de nuevo en unos segundos.');
    console.error(err);
  } finally {
    btn.classList.remove('is-busy');
    btn.textContent = 'Confirmar mi semana';
  }
});

$('#btnVolver').addEventListener('click', () => mostrar('pasoMenu'));

$('#year').textContent = new Date().getFullYear();
