/* ═══════════════════════════════════════════════════════════════════════
   NUTRETE — CONTENIDO EDITABLE
   ═══════════════════════════════════════════════════════════════════════

   Este es el ÚNICO archivo que necesitás tocar para el día a día.
   Acá va el teléfono y el menú de la semana.

   ┌─ REGLAS PARA NO ROMPER NADA ─────────────────────────────────────┐
   │                                                                  │
   │  1. El texto va SIEMPRE entre comillas simples:  'así'           │
   │  2. Cada línea termina en coma:                  'así',          │
   │  3. Si tu texto lleva un apóstrofo, escribilo \'                 │
   │     Ejemplo:  'pan de campo\'s'  →  mejor evitá los apóstrofos.  │
   │  4. No borres las llaves { } ni los corchetes [ ]                │
   │  5. Ante la duda: copiá una línea que ya funciona y cambiale     │
   │     el texto de adentro.                                         │
   │                                                                  │
   │  Si algo se rompe, el menú de la web queda en blanco.            │
   │  Volvé atrás con Ctrl+Z y guardá de nuevo.                       │
   └──────────────────────────────────────────────────────────────────┘
*/

window.NUTRETE = {

  /* ─────────────────────────────────────────────────────────────────
     1. TELÉFONO
     Sin el signo +, sin espacios y sin guiones. Solo números.
     598 es Uruguay. Si cambia el número, cambialo también en
     index.html (buscá 59898741984 con Ctrl+F).
     ───────────────────────────────────────────────────────────────── */
  whatsapp: '59898741984',


  /* ─────────────────────────────────────────────────────────────────
     2. MENÚ DE LA SEMANA
     Cinco días, tres platos por día.

     Las FECHAS se calculan solas (siempre muestra la semana que viene),
     así que de eso no te tenés que ocupar.

     Cada plato tiene cuatro partes:

        tipo    → la etiqueta chiquita de arriba (Bowl, Caliente, Al horno...)
        nombre  → el nombre del plato, en grande
        detalle → la descripción, una línea
        etiquetas → los cartelitos de abajo (poné los que quieras, o dejá
                    solo uno). Sugeridas: 'Sin gluten', 'Veggie',
                    'Sin lácteos', 'Alta proteína', 'Sin frutos secos'

     Para cambiar el menú de la semana: pisá los textos y guardá.
     ───────────────────────────────────────────────────────────────── */
  menu: [

    /* ─── LUNES ─────────────────────────────────────────────────── */
    { dia: 'Lunes', platos: [
      { tipo: 'Bowl',
        nombre: 'Bowl de pollo y vegetales de estación',
        detalle: 'Pollo grillado, zanahoria, pepino, huevo y dip de vinagreta.',
        etiquetas: ['Sin gluten', 'Alta proteína'] },

      { tipo: 'Caliente',
        nombre: 'Milanesa de lentejas con puré rústico',
        detalle: 'Milanesa de legumbres al horno y puré de papa y calabaza.',
        etiquetas: ['Sin gluten', 'Veggie'] },

      { tipo: 'Al horno',
        nombre: 'Tarta de verdura y ricota',
        detalle: 'Masa propia de cúrcuma con espinaca, ricota y nuez moscada.',
        etiquetas: ['Sin gluten', 'Veggie'] }
    ]},

    /* ─── MARTES ────────────────────────────────────────────────── */
    { dia: 'Martes', platos: [
      { tipo: 'Bowl',
        nombre: 'Ensalada césar sin gluten',
        detalle: 'Hojas verdes, pollo, croutons de pan sin gluten y aderezo casero.',
        etiquetas: ['Sin gluten'] },

      { tipo: 'Clásico',
        nombre: 'Empanadas de carne vacuna (x3)',
        detalle: 'Masa con cúrcuma, relleno de carne cortada a cuchillo, con ensalada.',
        etiquetas: ['Sin gluten'] },

      { tipo: 'Wok',
        nombre: 'Wok de vegetales y arroz yamaní',
        detalle: 'Vegetales salteados, arroz integral y semillas tostadas.',
        etiquetas: ['Sin gluten', 'Veggie', 'Sin lácteos'] }
    ]},

    /* ─── MIÉRCOLES ─────────────────────────────────────────────── */
    { dia: 'Miércoles', platos: [
      { tipo: 'Del mar',
        nombre: 'Merluza al horno con calabaza asada',
        detalle: 'Filete al horno con hierbas y calabaza glaseada.',
        etiquetas: ['Sin gluten', 'Sin lácteos'] },

      { tipo: 'Bowl',
        nombre: 'Bowl mediterráneo de garbanzos',
        detalle: 'Garbanzos, tomate, pepino, aceitunas y hummus.',
        etiquetas: ['Sin gluten', 'Veggie'] },

      { tipo: 'Al horno',
        nombre: 'Quiche de zapallitos y queso',
        detalle: 'Zapallitos de estación, queso y huevo, en molde individual.',
        etiquetas: ['Sin gluten', 'Veggie'] }
    ]},

    /* ─── JUEVES ────────────────────────────────────────────────── */
    { dia: 'Jueves', platos: [
      { tipo: 'Caliente',
        nombre: 'Pollo al limón con quinoa',
        detalle: 'Suprema marinada en limón y tomillo sobre quinoa con verdeo.',
        etiquetas: ['Sin gluten', 'Alta proteína', 'Sin lácteos'] },

      { tipo: 'De olla',
        nombre: 'Guiso de lentejas',
        detalle: 'Lentejas, zapallo, morrón y papa. Cocción lenta.',
        etiquetas: ['Sin gluten', 'Veggie'] },

      { tipo: 'Fresco',
        nombre: 'Tortilla de papa con ensalada',
        detalle: 'Tortilla jugosa y ensalada de estación con vinagreta.',
        etiquetas: ['Sin gluten', 'Veggie'] }
    ]},

    /* ─── VIERNES ───────────────────────────────────────────────── */
    { dia: 'Viernes', platos: [
      { tipo: 'Hamburguesa',
        nombre: 'Burger de garbanzo en pan sin gluten',
        detalle: 'Medallón de garbanzo, lechuga, tomate y salsa de yogur.',
        etiquetas: ['Sin gluten', 'Veggie'] },

      { tipo: 'Al horno',
        nombre: 'Tarta de choclo',
        detalle: 'Choclo cremoso, cebolla y queso, en masa propia.',
        etiquetas: ['Sin gluten', 'Veggie'] },

      { tipo: 'Bowl',
        nombre: 'Bowl de atún y palta',
        detalle: 'Atún, palta, tomate, huevo y hojas verdes.',
        etiquetas: ['Sin gluten', 'Alta proteína', 'Sin lácteos'] }
    ]}

  ]
};
