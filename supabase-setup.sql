-- ═══════════════════════════════════════════════════════════════
-- NUTRETE — Configuración de la base de datos para el portal
-- Pegá TODO esto en Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Evitar duplicados ────────────────────────────────────
-- Un empleado por email dentro de cada empresa
alter table empleados drop constraint if exists empleados_unico;
alter table empleados add constraint empleados_unico unique (empresa_id, email);

-- Un solo plato por persona, por día, por semana
alter table ordenes drop constraint if exists ordenes_unico;
alter table ordenes add constraint ordenes_unico unique (empleado_id, semana, dia);


-- ─── 2. Cerrar la lectura pública de datos personales ────────
-- Nadie puede leer nombres, emails ni pedidos con la clave pública.
drop policy if exists "Enable read access for all users" on empleados;
drop policy if exists "Enable read access for all users" on ordenes;
drop policy if exists "Enable read access for all users" on empresas;


-- ─── 3. Validar el código de empresa ─────────────────────────
-- Devuelve SOLO el nombre. No expone emails ni teléfonos.
create or replace function validar_empresa(p_codigo text)
returns text
language sql
security definer
set search_path = public
as $$
  select nombre from empresas
  where upper(codigo_unico) = upper(trim(p_codigo))
  limit 1;
$$;


-- ─── 4. Guardar el pedido de la semana ───────────────────────
create or replace function guardar_pedido(
  p_codigo      text,
  p_nombre      text,
  p_email       text,
  p_semana      date,
  p_elecciones  jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id  uuid;
  v_empleado_id uuid;
  v_item        jsonb;
begin
  select id into v_empresa_id
  from empresas
  where upper(codigo_unico) = upper(trim(p_codigo));

  if v_empresa_id is null then
    raise exception 'Codigo de empresa invalido';
  end if;

  insert into empleados (empresa_id, nombre, email)
  values (v_empresa_id, trim(p_nombre), lower(trim(p_email)))
  on conflict (empresa_id, email)
    do update set nombre = excluded.nombre
  returning id into v_empleado_id;

  for v_item in select * from jsonb_array_elements(p_elecciones)
  loop
    insert into ordenes (empleado_id, semana, dia, plato_elegido)
    values (v_empleado_id, p_semana, v_item->>'dia', v_item->>'plato')
    on conflict (empleado_id, semana, dia)
      do update set plato_elegido = excluded.plato_elegido;
  end loop;
end;
$$;


-- ─── 5. Permisos: solo estas dos funciones son públicas ──────
revoke all on function validar_empresa(text) from public, anon;
revoke all on function guardar_pedido(text, text, text, date, jsonb) from public, anon;
grant execute on function validar_empresa(text) to anon;
grant execute on function guardar_pedido(text, text, text, date, jsonb) to anon;


-- ─── 6. Empresa de prueba para que puedas probarlo ───────────
insert into empresas (nombre, codigo_unico, email_contacto)
values ('Empresa Demo', 'DEMO2026', 'demo@ejemplo.com')
on conflict (codigo_unico) do nothing;
