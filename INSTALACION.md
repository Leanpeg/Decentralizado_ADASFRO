# 🗺️ Descentralizando — Guía de Instalación v3.0
## ADASFRO · Cédula 3-002-860094

---

## 📦 Archivos del paquete

| Archivo | Destino | Qué hace |
|---------|---------|----------|
| `descentralizando-styles.css` | GitHub Pages | Estilos dark-editorial completos |
| `descentralizando-script.js` | GitHub Pages | JS: API Blogger + interactividad |
| `descentralizando-blogger-theme.xml` | Blogger | Tema completo para instalar |

---

## PASO 1 — Subir CSS y JS a GitHub Pages

**Tu repositorio:** `https://github.com/Leanpeg/Decentralizado_ADASFRO`
**URL pública:**    `https://leanpeg.github.io/Decentralizado_ADASFRO/`

### Pasos:
1. Ir a `https://github.com/Leanpeg/Decentralizado_ADASFRO`
2. Clic en `descentralizando-styles.css` → icono lápiz ✏️ → borrar todo → pegar el nuevo CSS → **Commit changes**
3. Repetir con `descentralizando-script.js`
4. Esperar ~2 minutos para que GitHub Pages publique

### Verificar que funcionan:
- `https://leanpeg.github.io/Decentralizado_ADASFRO/descentralizando-styles.css`
- `https://leanpeg.github.io/Decentralizado_ADASFRO/descentralizando-script.js`

> ⚠️ El repositorio debe ser **público** para que GitHub Pages sirva los archivos.

---

## PASO 2 — Instalar el tema en Blogger

1. Ir a **https://www.blogger.com** → seleccionar tu blog
2. Menú izquierdo → **Tema**
3. Clic en **⋮ (tres puntos)** → **Hacer copia de seguridad** (guarda el actual primero)
4. Clic en **⋮** → **Editar HTML**
5. **Ctrl+A** (seleccionar todo) → **Suprimir** (borrar)
6. Pegar todo el contenido de `descentralizando-blogger-theme.xml`
7. Clic en 💾 **Guardar tema**

---

## PASO 3 — Etiquetas para las entradas

Al crear o editar cada entrada en Blogger, agregar etiquetas **exactamente** así:

| Etiqueta | Sección en el menú |
|----------|--------------------|
| `Política` | Sección Política |
| `Social` | Sección Social |
| `Tecnología` | Sección Tecnología |
| `Economía` | Sección Economía 4.0 |
| `Turismo` | Sección Turismo |
| `Blockchain` | Sección Blockchain |
| `Descentralización` | Badge azul |
| `Inclusión` | Badge morado |
| `Gobernanza` | Badge azul oscuro |

> ✅ Una entrada puede tener múltiples etiquetas. La primera etiqueta = color del badge en la tarjeta.

---

## PASO 4 — Imagen destacada

Para que las tarjetas de noticias muestren imagen:
1. Al crear/editar entrada → panel derecho → **"Imagen de entrada"**
2. Subir la imagen (recomendado: **1200 × 800 px**)
3. Esta imagen aparece automáticamente en el grid hero y en las tarjetas

---

## PASO 5 — Dominio personalizado

Si `www.decentralizando.org` no está conectado:
1. Blogger → Configuración → Dominio personalizado
2. Ingresar `www.decentralizando.org`
3. Seguir instrucciones DNS (agregar registros CNAME en tu proveedor)

---

## PASO 6 — Personalizar redes sociales

En el XML, buscar y reemplazar las URLs de redes sociales:
```
https://facebook.com/descentralizando
https://instagram.com/descentralizando
https://twitter.com/descentralizando
https://youtube.com/@adasfro
```

---

## 🎨 Diseño del tema

- **Paleta:** Negro profundo `#080c10` + Esmeralda `#00c896` + Dorado `#e8b84b`
- **Fuentes:** DM Serif Display (títulos) + IBM Plex Sans (cuerpo) + Oswald (UI)
- **Estilo:** Revista digital dark-editorial premium

---

## 🐛 Solución de problemas

### El CSS/JS no carga
- Verificar que el repo es público en GitHub
- GitHub Pages tarda 5-10 minutos en publicar
- Probar URL en incógnito para evitar caché

### El hero grid no muestra entradas
- La API JSON de Blogger puede tardar. Recargar.
- Verificar abriendo: `https://www.decentralizando.org/feeds/posts/default?alt=json&max-results=5`
- Si el blog está en privado, la API no responde → hacer público el blog

### Error al guardar el tema
- El XML es estricto: los `&` deben ser `&amp;` (ya corregido en este archivo)
- No puede haber tags sin cerrar

### Las fuentes no cargan
- Google Fonts requiere conexión a internet
- Verificar que el `<link>` de Google Fonts está en el `<head>` ✅

---

## 📞 Soporte ADASFRO

- **Correo:** descentralizando@adasfro.org  
- **Blog:** https://www.decentralizando.org  
- **GitHub:** https://github.com/Leanpeg/Decentralizado_ADASFRO

---

*© 2026 ADASFRO — Descentralizando. Todos los derechos reservados.*
