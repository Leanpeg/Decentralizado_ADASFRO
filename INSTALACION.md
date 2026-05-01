# 🗺️ Descentralizando — Guía de Instalación Completa
## ADASFRO · Cédula 3-002-860094

---

## 📦 Archivos incluidos en este paquete

| Archivo | Destino | Descripción |
|--------|---------|-------------|
| `descentralizando-blogger-theme.xml` | Blogger | Tema completo listo para instalar |
| `descentralizando-styles.css` | GitHub Pages | Estilos principales |
| `descentralizando-script.js` | GitHub Pages | JavaScript de funcionalidades |
| `INSTALACION.md` | — | Este archivo |

---

## 🚀 PASO 1: Subir CSS y JS a GitHub Pages

Tu repositorio ya está en: `https://leanpeg.github.io/Decentralizado_ADASFRO/`

### Archivos que deben estar en ese repositorio:
```
Decentralizado_ADASFRO/
├── descentralizando-styles.css   ← Ya existe, actualizar
├── descentralizando-script.js    ← Ya existe, actualizar  
└── (otros archivos si los hay)
```

### Cómo actualizar:
1. Ir a https://github.com/leanpeg/Decentralizado_ADASFRO
2. Clic en cada archivo → "Edit" (lápiz) o "Upload files"
3. Pegar el contenido nuevo del CSS y JS
4. Clic en "Commit changes"
5. Esperar ~2 minutos para que GitHub Pages actualice

---

## 🎨 PASO 2: Instalar el tema en Blogger

1. Ir a **https://www.blogger.com**
2. Seleccionar tu blog **decentralizando.org**
3. En el menú lateral: **Tema → Personalizar → ⋮ → Editar HTML**
   - O bien: **Tema → Hacer copia de seguridad** (primero guarda el actual)
4. **Seleccionar todo** el código que hay (Ctrl+A)
5. **Borrar** todo
6. **Pegar** el contenido de `descentralizando-blogger-theme.xml`
7. Clic en **💾 Guardar tema**
8. Ver el blog para verificar

---

## 🏷️ PASO 3: Configurar etiquetas en tus entradas

El diseño usa etiquetas (labels) de Blogger para las categorías. 
**Usa EXACTAMENTE** estos nombres al etiquetar tus entradas:

| Etiqueta | URL generada automáticamente |
|----------|------------------------------|
| `Política` | /search/label/Política |
| `Social` | /search/label/Social |
| `Tecnología` | /search/label/Tecnología |
| `Economía` | /search/label/Economía |
| `Turismo` | /search/label/Turismo |
| `Descentralización` | /search/label/Descentralización |
| `Blockchain` | /search/label/Blockchain |
| `Inclusión` | /search/label/Inclusión |

**Importante:** Cada entrada puede tener varias etiquetas. La primera etiqueta aparece como badge de categoría en las tarjetas.

---

## 🖼️ PASO 4: Imágenes destacadas en entradas

Para que las tarjetas muestren imagen:
1. Al crear/editar una entrada en Blogger
2. En el panel derecho: **"Imagen de entrada"** → subir foto
3. Esta imagen aparecerá automáticamente en la tarjeta de la cuadrícula

**Tamaño recomendado:** 1200 × 800 px (ratio 3:2)

---

## ⚙️ PASO 5: Personalizar el menú de navegación

En el XML del tema, busca esta sección y edita los links:

```xml
<nav class='dm-nav' id='dm-nav'>
  <a expr:href='data:blog.homepageUrl'>Inicio</a>
  <a expr:href='data:blog.homepageUrl + "search/label/Política"'>Política</a>
  <!-- Agrega o cambia categorías aquí -->
</nav>
```

---

## 📱 PASO 6: Configurar redes sociales

Busca en el XML estas líneas y reemplaza con tus URLs reales:

```xml
<a href='https://facebook.com' ...>f</a>
<a href='https://instagram.com' ...>ig</a>
<a href='https://twitter.com' ...>𝕏</a>
<a href='https://youtube.com' ...>▶</a>
```

---

## 🔧 PASO 7: Configurar dominio personalizado

Si tu dominio `www.decentralizando.org` no está configurado aún:
1. Blogger → Configuración → Dominio personalizado
2. Ingresar: `www.decentralizando.org`
3. Seguir las instrucciones DNS de Blogger

---

## 🐛 Solución de problemas comunes

### El CSS no carga
- Verificar que los archivos están en `https://leanpeg.github.io/Decentralizado_ADASFRO/`
- GitHub Pages puede tardar hasta 10 minutos en actualizar
- Verificar que el repositorio es **público**

### Las entradas no aparecen en el grid
- La API JSON de Blogger puede tardar en responder
- Verificar que el blog no está en modo "privado"
- Probar abriendo: `https://www.decentralizando.org/feeds/posts/default?alt=json&max-results=6`

### El diseño se ve mal en móvil
- Asegurarse de que el `<meta viewport>` está en el `<head>` ✅ (ya incluido)

### Error al guardar el tema en Blogger
- Blogger es estricto con XML: no puede haber `&` sueltos (debe ser `&amp;`)
- No puede haber tags sin cerrar
- El XML de este paquete ya está validado ✅

---

## 📞 Soporte

- **Correo:** descentralizando@adasfro.org
- **Blog:** https://www.decentralizando.org
- **GitHub:** https://github.com/leanpeg/Decentralizado_ADASFRO

---

*© 2026 ADASFRO · Descentralizando — Todos los derechos reservados*
*Ley N.º 218 · Constitución Política Art. 28, 29, 46 · Código Electoral Art. 139*
