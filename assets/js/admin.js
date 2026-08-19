/* ═══════════════════════════════════════════════════════════════
   NUTRETE — Panel interno
   ═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://tnbzbxmseyksbappymmz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qXlC4HGj_ZVbQMKlWCvLEA_IAa12hy9';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const MESES = ['enero','febrero','marzo','abril','mayo','junio',
               'julio','agosto','setiembre','octubre','noviembre','diciembre'];

let token   = null;
let semana  = null;   /* Date del lunes que se está mirando */
let vista   = 'pedidos';

/* ─── Fechas ──────────────────────────────────────────────── */
function proximoLunes(){
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const lun = new Date(hoy);
  lun.setDate(hoy.getDate() + ((8 - hoy.getDay()) % 7 || 7));
  return lun;
}
function fechaISO(d){
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + dd;
}
function fechaCorta(d){
  return d.getDate() + ' de ' + MESES[d.getMonth()];
}

function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function error(sel, msg){
  const box = $(sel);
  if (!msg){ box.hidden = true; return; }
  box.textContent = msg;
  box.hidden = false;
}

/* ─── Llamadas ────────────────────────────────────────────── */
async function rpc(fn, params){
  const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + (token || SUPABASE_KEY),
      'Content-Type':  'application/json'
    },
    body: JSON.stringify(params || {})
  });

  if (r.status === 401 || r.status === 403){
    salir();
    throw new Error('Sesión vencida');
  }
  if (!r.ok){
    let m = '';
    try { m = (await r.json()).message || ''; } catch(e){}
    throw new Error(m || ('Error ' + r.status));
  }
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

/* ═══ Login ═══════════════════════════════════════════════ */
$('#formLogin').addEventListener('submit', async e => {
  e.preventDefault();
  error('#errLogin', '');

  const email = $('#inEmail').value.trim();
  const pass  = $('#inPass').value;
  if (!email || !pass){
    error('#errLogin', 'Completá email y contraseña.');
    return;
  }

  const btn = $('#btnLogin');
  btn.classList.add('is-busy');
  btn.textContent = 'Entrando…';

  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    });
    const data = await r.json();

    if (!r.ok || !data.access_token){
      error('#errLogin', 'Email o contraseña incorrectos.');
      return;
    }

    token = data.access_token;
    try { sessionStorage.setItem('nutrete_admin', token); } catch(e){}

    $('#navUser').textContent = email;
    $('#navUser').hidden = false;
    $('#btnSalir').hidden = false;

    semana = proximoLunes();
    abrirPanel();

  } catch (err){
    error('#errLogin', 'No pudimos conectarnos. Revisá tu internet.');
    console.error(err);
  } finally {
    btn.classList.remove('is-busy');
    btn.textContent = 'Entrar';
    $('#inPass').value = '';
  }
});

function salir(){
  token = null;
  try { sessionStorage.removeItem('nutrete_admin'); } catch(e){}
  $('#navUser').hidden = true;
  $('#btnSalir').hidden = true;
  $('#vLogin').classList.add('is-on');
  $('#vPanel').classList.remove('is-on');
}
$('#btnSalir').addEventListener('click', salir);

/* Retomar sesión si la pestaña sigue abierta */
(function retomar(){
  let t = null;
  try { t = sessionStorage.getItem('nutrete_admin'); } catch(e){}
  if (!t) return;
  token  = t;
  semana = proximoLunes();
  $('#btnSalir').hidden = false;
  abrirPanel();
})();

function abrirPanel(){
  $('#vLogin').classList.remove('is-on');
  $('#vPanel').classList.add('is-on');
  cargar();
}

/* ═══ Semana ══════════════════════════════════════════════ */
function moverSemana(dias){
  semana = new Date(semana);
  semana.setDate(semana.getDate() + dias);
  cargar();
}
$('#semAnt').addEventListener('click', () => moverSemana(-7));
$('#semSig').addEventListener('click', () => moverSemana(7));
$('#semHoy').addEventListener('click', () => { semana = proximoLunes(); cargar(); });

function pintarSemana(){
  const vie = new Date(semana);
  vie.setDate(semana.getDate() + 4);
  $('#semLabel').textContent = fechaCorta(semana) + ' al ' + fechaCorta(vie);
}

/* ═══ Pestañas ════════════════════════════════════════════ */
$$('.atab').forEach(b => b.addEventListener('click', () => {
  vista = b.dataset.vista;
  $$('.atab').forEach(x => x.classList.toggle('is-on', x === b));
  $('#vwPedidos').classList.toggle('is-on',  vista === 'pedidos');
  $('#vwCocina').classList.toggle('is-on',   vista === 'cocina');
  $('#vwEmpresas').classList.toggle('is-on', vista === 'empresas');
  $('.asemana').style.display = vista === 'empresas' ? 'none' : '';
  cargar();
}));

/* ═══ Carga ═══════════════════════════════════════════════ */
async function cargar(){
  error('#errPanel', '');
  pintarSemana();
  try {
    if (vista === 'pedidos')  await verPedidos();
    if (vista === 'cocina')   await verCocina();
    if (vista === 'empresas') await verEmpresas();
  } catch (err){
    if (String(err.message).includes('Sin permiso')){
      error('#errPanel', 'Tu cuenta no figura como administradora. Agregá tu email a la tabla admins.');
    } else {
      error('#errPanel', 'No pudimos cargar los datos: ' + err.message);
    }
    console.error(err);
  }
}

/* ─── Pedidos por empresa ─────────────────────────────────── */
async function verPedidos(){
  const filas = await rpc('admin_pedidos', { p_semana: fechaISO(semana) }) || [];

  const empresas = {};
  filas.forEach(f => {
    if (!empresas[f.empresa]) empresas[f.empresa] = {};
    if (!empresas[f.empresa][f.empleado]) empresas[f.empresa][f.empleado] = [];
    empresas[f.empresa][f.empleado].push(f);
  });

  const nEmpresas = Object.keys(empresas).length;
  const nPersonas = new Set(filas.map(f => f.empresa + '|' + f.email)).size;

  $('#stats').innerHTML =
    stat(filas.length, 'Viandas') +
    stat(nPersonas,   'Personas') +
    stat(nEmpresas,   nEmpresas === 1 ? 'Empresa' : 'Empresas');

  if (!filas.length){
    $('#listaPedidos').innerHTML =
      '<div class="acard"><p class="avacio">Todavía nadie eligió para esta semana.</p></div>';
    return;
  }

  $('#listaPedidos').innerHTML = Object.keys(empresas).map(emp => {
    const gente = empresas[emp];
    const filasHtml = Object.keys(gente).map(per => {
      const pedidos = gente[per];
      return pedidos.map((p, i) =>
        '<tr>' +
          (i === 0
            ? '<td rowspan="' + pedidos.length + '"><b>' + esc(per) + '</b><br>' +
              '<span class="dia-td">' + esc(p.email) + '</span></td>'
            : '') +
          '<td class="dia-td">' + esc(p.dia) + '</td>' +
          '<td>' + esc(p.plato) + '</td>' +
        '</tr>').join('');
    }).join('');

    return '<div class="acard">' +
             '<div class="acard__head">' +
               '<h3>' + esc(emp) + '</h3>' +
               '<span class="chip">' + Object.keys(gente).length + ' personas</span>' +
             '</div>' +
             '<div class="tw"><table class="at">' +
               '<thead><tr><th>Persona</th><th>Día</th><th>Plato</th></tr></thead>' +
               '<tbody>' + filasHtml + '</tbody>' +
             '</table></div>' +
           '</div>';
  }).join('');
}

function stat(n, label){
  return '<div class="stat"><b>' + n + '</b><span>' + esc(label) + '</span></div>';
}

/* ─── Qué cocinar ─────────────────────────────────────────── */
async function verCocina(){
  const filas = await rpc('admin_resumen', { p_semana: fechaISO(semana) }) || [];

  if (!filas.length){
    $('#listaCocina').innerHTML =
      '<div class="acard"><p class="avacio">No hay pedidos para esta semana.</p></div>';
    return;
  }

  const porDia = {};
  filas.forEach(f => {
    if (!porDia[f.dia]) porDia[f.dia] = [];
    porDia[f.dia].push(f);
  });

  $('#listaCocina').innerHTML = Object.keys(porDia).map(dia => {
    const items = porDia[dia];
    const total = items.reduce((s, i) => s + Number(i.cantidad), 0);
    return '<div class="acard">' +
             '<div class="acard__head">' +
               '<h3>' + esc(dia) + '</h3>' +
               '<span class="chip">' + total + ' viandas</span>' +
             '</div>' +
             '<div class="tw"><table class="at">' +
               '<thead><tr><th>Plato</th><th style="text-align:right">Cantidad</th></tr></thead>' +
               '<tbody>' + items.map(i =>
                 '<tr><td>' + esc(i.plato) + '</td>' +
                 '<td class="num"><span class="cant">' + i.cantidad + '</span></td></tr>').join('') +
               '</tbody>' +
             '</table></div>' +
           '</div>';
  }).join('');
}

/* ─── Empresas ────────────────────────────────────────────── */
async function verEmpresas(){
  const filas = await rpc('admin_empresas') || [];

  if (!filas.length){
    $('#listaEmpresas').innerHTML =
      '<div class="acard"><p class="avacio">Todavía no hay empresas cargadas.</p></div>';
    return;
  }

  $('#listaEmpresas').innerHTML = filas.map(e =>
    '<div class="acard" data-empresa="' + esc(e.id) + '">' +
      '<div class="acard__head">' +
        '<h3>' + esc(e.nombre) + '</h3>' +
        '<span class="chip chip--code">' + esc(e.codigo) + '</span>' +
        '<span class="chip">' + e.empleados + (Number(e.empleados) === 1 ? ' persona' : ' personas') + '</span>' +
        '<span class="acts">' +
          '<button class="btn btn--line btn--xs js-ver" data-id="' + esc(e.id) + '">Ver personas</button>' +
          '<button class="btn btn--line btn--xs btn--danger js-del" data-id="' + esc(e.id) +
            '" data-nom="' + esc(e.nombre) + '">Borrar</button>' +
        '</span>' +
      '</div>' +
      (e.email_contacto ? '<p class="dia-td">Contacto: ' + esc(e.email_contacto) + '</p>' : '') +
      '<div class="emps" hidden></div>' +
    '</div>').join('');

  $$('.js-ver').forEach(b => b.addEventListener('click', () => verEmpleados(b)));
  $$('.js-del').forEach(b => b.addEventListener('click', () => borrarEmpresa(b)));
}

async function verEmpleados(btn){
  const caja = $('.emps', btn.closest('.acard'));
  if (!caja.hidden){
    caja.hidden = true;
    btn.textContent = 'Ver personas';
    return;
  }

  btn.textContent = 'Cargando…';
  const filas = await rpc('admin_empleados', { p_empresa_id: btn.dataset.id }) || [];
  btn.textContent = 'Ocultar';

  caja.innerHTML = filas.length
    ? '<div class="tw"><table class="at">' +
        '<thead><tr><th>Nombre</th><th>Email</th><th></th></tr></thead><tbody>' +
        filas.map(p =>
          '<tr><td>' + esc(p.nombre) + '</td><td class="dia-td">' + esc(p.email) + '</td>' +
          '<td class="num"><button class="btn btn--line btn--xs btn--danger js-delp" ' +
            'data-id="' + esc(p.id) + '" data-nom="' + esc(p.nombre) + '">Borrar</button></td></tr>').join('') +
        '</tbody></table></div>'
    : '<p class="avacio">Nadie de esta empresa entró al portal todavía.</p>';

  caja.hidden = false;
  $$('.js-delp', caja).forEach(b => b.addEventListener('click', () => borrarEmpleado(b)));
}

async function borrarEmpresa(btn){
  const nom = btn.dataset.nom;
  if (!confirm('¿Borrar "' + nom + '"?\n\nSe borran también todas sus personas y todos sus pedidos. No se puede deshacer.')) return;
  btn.textContent = 'Borrando…';
  try {
    await rpc('admin_borrar_empresa', { p_id: btn.dataset.id });
    await verEmpresas();
  } catch (err){
    error('#errPanel', 'No se pudo borrar: ' + err.message);
    btn.textContent = 'Borrar';
  }
}

async function borrarEmpleado(btn){
  const nom = btn.dataset.nom;
  if (!confirm('¿Borrar a ' + nom + ' y sus pedidos?')) return;
  btn.textContent = 'Borrando…';
  try {
    await rpc('admin_borrar_empleado', { p_id: btn.dataset.id });
    await verEmpresas();
  } catch (err){
    error('#errPanel', 'No se pudo borrar: ' + err.message);
    btn.textContent = 'Borrar';
  }
}

/* ─── Alta de empresa ─────────────────────────────────────── */
$('#formEmpresa').addEventListener('submit', async e => {
  e.preventDefault();
  error('#errEmpresa', '');
  $('#okEmpresa').hidden = true;

  const nombre = $('#emNombre').value.trim();
  const codigo = $('#emCodigo').value.trim();
  const email  = $('#emEmail').value.trim();

  if (!nombre || !codigo){
    error('#errEmpresa', 'El nombre y el código son obligatorios.');
    return;
  }

  const btn = $('#btnCrear');
  btn.classList.add('is-busy');
  btn.textContent = 'Creando…';

  try {
    await rpc('admin_crear_empresa', {
      p_nombre: nombre, p_codigo: codigo, p_email: email
    });
    $('#okEmpresa').textContent =
      'Listo. Pasale a ' + nombre + ' el código ' + codigo.toUpperCase() +
      ' y el link del portal.';
    $('#okEmpresa').hidden = false;
    $('#emNombre').value = ''; $('#emCodigo').value = ''; $('#emEmail').value = '';
    await verEmpresas();
  } catch (err){
    error('#errEmpresa', err.message);
  } finally {
    btn.classList.remove('is-busy');
    btn.textContent = 'Crear empresa';
  }
});
