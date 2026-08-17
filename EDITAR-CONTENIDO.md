# Nutrete — Editar el contenido sin Claude

Este documento es para que modifiques el sitio vos solo, cuando lo necesites.

---

## El único archivo que hay que tocar

**`assets/js/contenido.js`**

Todas las semanas editás este archivo, guardás, y el sitio se actualiza automáticamente.

---

## 1. Cambiar el teléfono de WhatsApp

Abrí `assets/js/contenido.js` y buscá esta línea (está arriba del todo):

```javascript
whatsapp: '59898741984',
```

Cambialo por tu teléfono, sin `+`, sin espacios, solo números:

```javascript
whatsapp: '59899123456',
```

Guardá. Listo.

---

## 2. Cambiar el menú semanal

Todo el menú está adentro de `contenido.js`, en la sección `menu:`.

### Estructura de un plato

Cada plato tiene **4 partes**, siempre en este orden:

```javascript
{ tipo: 'Bowl',
  nombre: 'Bowl de atún y palta',
  detalle: 'Atún, palta, tomate, huevo y hojas verdes.',
  etiquetas: ['Sin gluten', 'Alta proteína', 'Sin lácteos'] }
```

| Parte | Qué va | Ejemplo |
|-------|--------|---------|
| `tipo` | La etiqueta arriba (una palabra) | `'Bowl'`, `'Caliente'`, `'Del mar'` |
| `nombre` | El nombre del plato en grande | `'Bowl de atún y palta'` |
| `detalle` | Línea descriptiva | `'Atún, palta, tomate, huevo y hojas verdes.'` |
| `etiquetas` | Tags de propiedades (entre `[ ]`) | `['Sin gluten', 'Veggie']` — solo los que aplican |

### Las etiquetas sugeridas

Elige de esta lista o crea las tuyas:

- `'Sin gluten'` — siempre va, a menos que tenga gluten
- `'Veggie'` — sin carne ni pescado
- `'Sin lácteos'` — sin queso ni leche
- `'Alta proteína'` — proteína destacada
- `'Sin frutos secos'` — si es alérgeno

Si un plato no tiene ninguna restricción especial, **dejá la lista vacía**: `etiquetas: []`

### Ejemplo: cambiar un plato de lunes

**Antes:**
```javascript
{ tipo: 'Bowl',
  nombre: 'Bowl de pollo y vegetales de estación',
  detalle: 'Pollo grillado, zanahoria, pepino, huevo y dip de vinagreta.',
  etiquetas: ['Sin gluten', 'Alta proteína'] }
```

**Después** (nueva receta):
```javascript
{ tipo: 'Ensalada',
  nombre: 'Ensalada griega con feta',
  detalle: 'Tomate, pepino, cebolla, aceitunas y queso feta.',
  etiquetas: ['Sin gluten', 'Veggie'] }
```

---

## 3. Reglas para no romper nada

⚠️ **Si no seguís estas reglas, el menú se queda en blanco.**

1. **Cada texto va entre comillas simples:** `'así'` — NUNCA comillas dobles `"así"`
2. **Cada línea termina en coma:** `'Bowl',` — la última línea de cada plato termina en `}`
3. **Si tu texto tiene un apóstrofo,** escribilo como `\'`:
   - ❌ `'pan de campo's'`
   - ✅ `'pan de campo\'s'`
4. **No borres las llaves ni los corchetes:**
   - `{ }` = inicio y fin de un plato
   - `[ ]` = lista de etiquetas
5. **Ante la duda:** copiá una línea que ya funciona y cambiale solo el texto.

---

## 4. Pasos prácticos para editar

### Opción A: Con Notepad (lo más fácil)

1. Abrí **Notepad** o el editor de texto que uses
2. Arrastrá el archivo `contenido.js` al Notepad
3. Hace Ctrl+H (o Buscar → Reemplazar)
4. Buscá el plato que querés cambiar, por nombre
5. Copiá / pegá la estructura entera de un plato conocido
6. Cambiale el texto
7. Guardá con Ctrl+S
8. Refrescá la web (F5)

### Opción B: Con Visual Studio Code (si lo tenes)

1. Abrí VS Code
2. Abrir archivo (`Ctrl+O`), seleccioná `contenido.js`
3. Buscá el plato (`Ctrl+F`)
4. Editá
5. Guardá (`Ctrl+S`)
6. Refrescá la web

---

## 5. Ejemplos listos para copiar/pegar

Tenés 3 platos por día, cada uno es un bloque así:

```javascript
{ tipo: 'Nombre del tipo',
  nombre: 'Nombre del plato',
  detalle: 'Descripción de una línea.',
  etiquetas: ['Etiqueta1', 'Etiqueta2'] }
```

**Ejemplo completo para un lunes sin gluten:**

```javascript
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
```

---

## 6. Qué pasa si me equivoco

Si editás algo mal, el menú de la web se queda **en blanco**. La consola del navegador muestra por qué.

**Para arreglarlo:**

1. Ctrl+Z en Notepad / VS Code (deshacer)
2. Guardá de nuevo
3. Refrescá la web

---

## 7. Otros cambios (más complejos, escribime)

| Cambio | Dónde | Necesitás ayuda |
|--------|-------|-----------------|
| Cambiar el menú | `contenido.js` | ❌ No |
| Cambiar teléfono | `contenido.js` | ❌ No |
| Cambiar textos de secciones | `index.html` | ✅ Sí |
| Cambiar colores de marca | `assets/css/style.css` | ✅ Sí |
| Cambiar las fotos | `assets/img/` | ✅ Sí (necesitan recorte) |

---

## 8. Verificación rápida

Después de editar `contenido.js`, en la web debería aparecer:

- ✅ El nuevo menú (si editaste el menú)
- ✅ El número nuevo en todos los botones de WhatsApp (si cambiaste el teléfono)

Si no ves nada:
1. Abrí la consola del navegador (F12)
2. Buscá el error (debería decir qué línea)
3. Comprobá que hayas puesto comillas simples y comas en el lugar correcto
4. Grabá de nuevo y refrescá (F5)

---

## 9. Backup

Antes de hacer cambios grandes, **hacé una copia de `contenido.js`:**

- Click derecho en el archivo → Copiar
- Pega en otra carpeta con nombre `contenido-backup.js`

Así si algo falla podés volver atrás fácil.
