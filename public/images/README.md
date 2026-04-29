# Imágenes del sitio público (RIVISIG)

Esta carpeta contiene los assets gráficos del área pública (`app/(public)`).
Mientras no existan los archivos, el componente `ImageSlot` muestra un
placeholder con la ruta esperada — así sabes exactamente qué imagen va en
cada lugar.

## Recomendaciones generales

- Formato: **JPG** para fotos, **PNG** con fondo transparente para logos.
- Peso objetivo: **< 250 KB** por imagen (usar TinyPNG / Squoosh).
- Tamaño mínimo lado mayor: **1200 px** para heros y secciones grandes.
- Todas las fotos deben tener **personas vestidas de forma profesional**,
  con iluminación clara y colores sobrios. Evitar stock genérico muy usado.

---

## Archivos esperados

### Marca

| Ruta | Descripción | Tamaño sugerido |
| --- | --- | --- |
| `logo.png` | Logo principal (navbar y footer). Fondo transparente. | 320 × 80 px |
| `logo-white.png` | Logo monocromo blanco para fondos oscuros. | 320 × 80 px |

### Home — `app/(public)/page.tsx`

| Ruta | Descripción | Ratio |
| --- | --- | --- |
| `hero.jpg` | Hero principal. Equipo consultor, auditoría o capacitación. | 4:5 / 4:3 |
| `clients/cliente-1.png` … `cliente-6.png` | Logos de empresas cliente (monocromo / gris). | 3:1 |
| `testimonios/testimonio-1.jpg` … `testimonio-3.jpg` | Avatares de personas que dan el testimonio. | 1:1 |
| `cta-bg.jpg` | Fondo decorativo de la sección CTA final (se oscurece con overlay). | 16:9 |

### Nosotros — `app/(public)/about/page.tsx`

| Ruta | Descripción | Ratio |
| --- | --- | --- |
| `about/equipo.jpg` | Foto del equipo consultor o en oficina. | 4:3 |
| `about/auditoria.jpg` | Consultor en auditoría de campo o revisión en planta. | 4:3 |

### Servicios — `app/(public)/servicios/page.tsx`

| Ruta | Descripción | Ratio |
| --- | --- | --- |
| `servicios/banner.jpg` | Banner superior de la página. | 4:3 |
| `servicios/homologaciones.jpg` | Imagen servicio homologaciones. | 16:9 |
| `servicios/sst.jpg` | Imagen servicio SST (Ley 29783). | 16:9 |
| `servicios/auditorias.jpg` | Imagen servicio auditorías técnicas. | 16:9 |

### Metodología — `app/(public)/metodologia/page.tsx`

| Ruta | Descripción | Ratio |
| --- | --- | --- |
| `metodologia/proceso.jpg` | Proceso metodológico: pizarra, diagrama o consultor explicando. | 4:3 |
| `metodologia/certificacion.jpg` | Entrega de certificación / hito de cierre. | 4:5 |

---

## Cómo reemplazar un placeholder

1. Coloca el archivo en la ruta indicada dentro de `public/images/`.
2. Recarga la página — `next/image` detecta el archivo y lo sirve optimizado.
3. Si la imagen no aparece, revisa:
   - Nombre exacto (case-sensitive).
   - Extensión (`.jpg` vs `.png`).
   - Que el archivo esté dentro de `public/` (no `app/` ni otras carpetas).
