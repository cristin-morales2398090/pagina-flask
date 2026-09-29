# Cambios — versión interactiva

## Cómo correrla
```
pip install -r requirements.txt
python main.py
```
Abre http://127.0.0.1:5000

## Archivos
- `main.py` — lee los productos de `data/productos.json`, saca las specs (procesador, RAM, disco, pantalla, gráfica) de la descripción y maneja la página 404.
- `data/productos.json` — **aquí se agregan o editan productos** (ya no dentro de main.py). Para mostrar un producto en "Destacados" ponle `"destacado": true`. Para mostrar precio agrega `"precio": "$1.999.000"`.
- `templates/base.html` — menú, footer, panel de cotización, vista rápida y comparador (compartido por todas las páginas).
- `templates/_producto.html` — la tarjeta de producto (una sola, se usa en todas partes).
- `templates/index.html`, `templates/categoria.html`, `templates/404.html`.
- `static/js/app.js` — toda la interactividad.
- `static/css/style.css` — tu CSS original intacto; lo nuevo está al final, después de "VERSIÓN INTERACTIVA".

## Categorías "Próximamente"
En `main.py`, en `CATEGORIAS`, cambia `"activa": False` a `True` cuando agregues productos de computadores o accesorios al JSON.
