-- ═══════════════════════════════════════════════════════════════
-- NUTRETE — Panel de administración
-- Pegá TODO esto en Supabase → SQL Editor → New query → Run
-- (Correlo DESPUÉS de supabase-setup.sql)
-- ═══════════════════════════════════════════════════════════════


-- ─── 1. Quién es administrador ───────────────────────────────
create table if not exists admins (
  email  text primary key,
  creado timestamptz default now()
);
alter table admins enable row level security;
-- Sin políticas: nadie puede leer esta tabla desde afuera.

-- ⚠️ CAMBIÁ ESTE EMAIL por el tuyo antes de ejecutar
insert into admins (email) values ('pg6008495@gmail.com')
on conflict (email) do nothing;


-- ─── 2. Verificar si quien llama es admin ────────────────────
create or replace function es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;


-- ─── 3. Orden correcto de los días ───────────────────────────
create or replace function orden_dia(p_dia text)
returns int
language sql immutable
as $$
  select coalesce(
    array_position(
      array['Lunes','Martes','Miércoles','Jueves','Viernes'],
      p_dia
    ), 99);
$$;


-- ─── 4. Pedidos de una semana ────────────────────────────────
create or replace function admin_pedidos(p_semana date)
returns table (
  empresa  text,
  empleado text,
  email    text,
  dia      text,
  plato    text
)
language plpgsql security definer set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'Sin permiso';
  end if;

  return query
    select e.nombre, p.nombre, p.email, o.dia, o.plato_elegido
    from ordenes o
    join empleados p on p.id = o.empleado_id
    join empresas  e on e.id = p.empresa_id
    where o.semana = p_semana
    order by e.nombre, p.nombre, orden_dia(o.dia);
end;
$$;


-- ─── 5. Cuánto cocinar de cada plato ─────────────────────────
create or replace function admin_resumen(p_semana date)
returns table (
  dia      text,
  plato    text,
  cantidad bigint
)
language plpgsql security definer set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'Sin permiso';
  end if;

  return query
    select o.dia, o.plato_elegido, count(*)
    from ordenes o
    where o.semana = p_semana
    group by o.dia, o.plato_elegido
    order by orden_dia(o.dia), count(*) desc;
end;
$$;


-- ─── 6. Listado de empresas ──────────────────────────────────
create or replace function admin_empresas()
returns table (
  id            uuid,
  nombre        text,
  codigo        text,
  email_contacto text,
  empleados     bigint
)
language plpgsql security definer set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'Sin permiso';
  end if;

  return query
    select e.id, e.nombre, e.codigo_unico, e.email_contacto,
           (select count(*) from empleados p where p.empresa_id = e.id)
    from empresas e
    order by e.nombre;
end;
$$;


-- ─── 7. Empleados de una empresa ─────────────────────────────
create or replace function admin_empleados(p_empresa_id uuid)
returns table (
  id     uuid,
  nombre text,
  email  text,
  alta   timestamp
)
language plpgsql security definer set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'Sin permiso';
  end if;

  return query
    select p.id, p.nombre, p.email, p.created_at
    from empleados p
    where p.empresa_id = p_empresa_id
    order by p.nombre;
end;
$$;


-- ─── 8. Crear una empresa ────────────────────────────────────
create or replace function admin_crear_empresa(
  p_nombre text,
  p_codigo text,
  p_email  text
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'Sin permiso';
  end if;

  if length(trim(p_nombre)) < 2 then
    raise exception 'El nombre de la empresa es muy corto';
  end if;
  if length(trim(p_codigo)) < 4 then
    raise exception 'El codigo tiene que tener al menos 4 caracteres';
  end if;

  insert into empresas (nombre, codigo_unico, email_contacto)
  values (trim(p_nombre), upper(trim(p_codigo)), nullif(trim(p_email), ''));
exception
  when unique_violation then
    raise exception 'Ya existe una empresa con ese codigo';
end;
$$;


-- ─── 9. Borrar una empresa (y todos sus datos) ───────────────
create or replace function admin_borrar_empresa(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'Sin permiso';
  end if;
  delete from empresas where id = p_id;
end;
$$;


-- ─── 10. Borrar un empleado (y sus pedidos) ──────────────────
create or replace function admin_borrar_empleado(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'Sin permiso';
  end if;
  delete from empleados where id = p_id;
end;
$$;


-- ─── 11. Permisos: solo usuarios logueados ───────────────────
-- 'authenticated' = alguien que inició sesión.
-- Cada función igual verifica que además esté en la tabla admins.
grant execute on function admin_pedidos(date)          to authenticated;
grant execute on function admin_resumen(date)          to authenticated;
grant execute on function admin_empresas()             to authenticated;
grant execute on function admin_empleados(uuid)        to authenticated;
grant execute on function admin_crear_empresa(text, text, text) to authenticated;
grant execute on function admin_borrar_empresa(uuid)   to authenticated;
grant execute on function admin_borrar_empleado(uuid)  to authenticated;

-- El público anónimo no puede ejecutar ninguna de estas.
revoke all on function admin_pedidos(date)          from anon;
revoke all on function admin_resumen(date)          from anon;
revoke all on function admin_empresas()             from anon;
revoke all on function admin_empleados(uuid)        from anon;
revoke all on function admin_crear_empresa(text, text, text) from anon;
revoke all on function admin_borrar_empresa(uuid)   from anon;
revoke all on function admin_borrar_empleado(uuid)  from anon;
