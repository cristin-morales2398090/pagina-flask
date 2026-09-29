import json
import re
from datetime import date
from pathlib import Path

from flask import Flask, abort, render_template

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
WHATSAPP = "573168869259"

# Categorías que se muestran en la página. "activa": False = "Próximamente".
CATEGORIAS = {
    "portatiles": {
        "titulo": "Portátiles",
        "descripcion": "Equipos corporativos, educativos y gamer con garantía y soporte especializado.",
        "imagen": "img/categorias/portatiles.jpg",
        "icono": "fa-laptop",
        "activa": True,
    },
    "impresoras": {
        "titulo": "Impresoras",
        "descripcion": "Impresoras de tanque de tinta Epson, HP y Brother para hogar y oficina.",
        "imagen": "img/categorias/impresoras.jpg",
        "icono": "fa-print",
        "activa": True,
    },
    "computadores": {
        "titulo": "Computadores",
        "descripcion": "Equipos de escritorio con procesadores de última generación.",
        "imagen": "img/categorias/computadores.jpg",
        "icono": "fa-desktop",
        "activa": False,
    },
    "accesorios": {
        "titulo": "Accesorios",
        "descripcion": "Teclados, mouse, diademas y webcams.",
        "imagen": "img/categorias/accesorios.jpg",
        "icono": "fa-keyboard",
        "activa": False,
    },
}


# ---------------------------------------------------------------------------
# Datos
# ---------------------------------------------------------------------------

def _slug(texto):
    texto = texto.lower()
    texto = re.sub(r"[^a-z0-9]+", "-", texto)
    return texto.strip("-")


def _nivel_cpu(cpu):
    """1 = básico, 2 = medio, 3 = alto, 4 = tope. Sirve para ordenar y recomendar."""
    c = cpu.upper()
    if re.search(r"RYZEN\s*9|I9\b|CORE\s*9", c):
        return 4
    if re.search(r"RYZEN\s*7|I7\b|I7\s|CORE\s*7", c):
        return 3
    if re.search(r"RYZEN\s*5|I5\b|I5\s|CORE\s*5", c):
        return 2
    return 1


def _specs_portatil(descripcion):
    """Saca procesador, RAM, disco, pantalla y gráfica del texto de la descripción."""
    partes = [p.strip(" .") for p in re.split(r"[,•]", descripcion) if p.strip(" .")]
    specs = {"cpu": "", "ram": "", "disco": "", "pantalla": "", "grafica": ""}

    for p in partes:
        up = p.upper()
        if not specs["cpu"] and re.search(r"RYZEN|CORE|INTEL", up):
            # Algunas descripciones traen CPU y RAM juntas: "RYZEN 5 7530U DDR4 8GB"
            m = re.search(r"(L?P?DDR\d.*)", p, re.I)
            if m and "GB" in m.group(1).upper():
                specs["cpu"] = p[: m.start()].strip()
                specs["ram"] = m.group(1).strip()
            else:
                specs["cpu"] = p
        elif not specs["ram"] and re.search(r"\d+\s*GB", up) and not re.search(r"SSD|RTX|GEFORCE|T\.V", up):
            specs["ram"] = p
        elif not specs["disco"] and "SSD" in up:
            specs["disco"] = p
        elif not specs["grafica"] and "RTX" in up:
            specs["grafica"] = re.sub(r"^(NVIDIA\s+|TARJETA DE VIDEO\s+|T\.V\s+)", "", p, flags=re.I)
        elif not specs["pantalla"] and re.search(r"PANTALLA|PULGADAS|FHD|WUXGA|\d{2}([.,]\d)?\s*[\"”]|^1[4-6]([.,]\d)?\b", up):
            specs["pantalla"] = re.sub(r"^PANTALLA\s+", "", p, flags=re.I)

    ram_gb = re.search(r"(\d+)\s*GB", specs["ram"].upper())
    pulgadas = re.search(r"(1[3-7](?:[.,]\d)?)", specs["pantalla"])
    specs["ram_gb"] = int(ram_gb.group(1)) if ram_gb else 0
    specs["pulgadas"] = float(pulgadas.group(1).replace(",", ".")) if pulgadas else 0
    specs["nivel_cpu"] = _nivel_cpu(specs["cpu"])
    specs["tiene_grafica"] = bool(specs["grafica"])

    # Versiones cortas para mostrar en las tarjetas
    tipo_ram = re.search(r"LPDDR\d|DDR\d", specs["ram"].upper())
    specs["ram_corta"] = f"{specs['ram_gb']}GB {tipo_ram.group(0) if tipo_ram else ''}".strip() if specs["ram_gb"] else ""
    disco = re.search(r"(\d+)\s*(GB|TB)", specs["disco"].upper())
    specs["disco_corto"] = f"SSD {disco.group(1)}{disco.group(2)}" if disco else ""
    extras = [x for x in ("FHD", "WUXGA", "144HZ") if x in specs["pantalla"].upper().replace("FULL HD", "FHD")]
    pulg = f'{specs["pulgadas"]:g}"' if specs["pulgadas"] else ""
    specs["pantalla_corta"] = " ".join([pulg] + [e.replace("144HZ", "144Hz") for e in extras]).strip()
    gpu = re.search(r"RTX\s*\d{4}(\s*\d+\s*GB)?", specs["grafica"].upper())
    specs["grafica_corta"] = re.sub(r"\s+", " ", gpu.group(0)).replace("GB", "GB") if gpu else ""
    specs["cpu"] = specs["cpu"].strip(" .")
    return specs


def _funciones_impresora(descripcion):
    up = descripcion.upper()
    funciones = []
    reglas = [
        (r"WI-?FI|INALAMBRICA", "WiFi"),
        (r"IMPRIME|IMPRESI", "Imprime"),
        (r"COPIA", "Copia"),
        (r"ESCAN|SCANER|SCANNER", "Escanea"),
        (r"DUPLEX", "Dúplex"),
        (r"\bFAX\b", "Fax"),
        (r"MONOCROM", "Monocromática"),
        (r"\bADF\b", "Alimentador ADF"),
    ]
    for patron, nombre in reglas:
        if re.search(patron, up) and nombre not in funciones:
            funciones.append(nombre)
    return funciones


def cargar_productos():
    with open(BASE_DIR / "data" / "productos.json", encoding="utf-8") as f:
        crudo = json.load(f)

    catalogo = {}
    for categoria, items in crudo.items():
        lista = []
        for i, p in enumerate(items):
            producto = dict(p)
            producto["id"] = f"{categoria}-{i + 1}-{_slug(p['nombre'])}"
            producto["categoria"] = categoria
            producto.setdefault("precio", "")
            producto.setdefault("destacado", False)
            if categoria == "portatiles":
                producto["specs"] = _specs_portatil(p["descripcion"])
            elif categoria == "impresoras":
                producto["funciones"] = _funciones_impresora(p["descripcion"])
            lista.append(producto)
        catalogo[categoria] = lista
    return catalogo


productos = cargar_productos()


def todos_los_productos():
    return [p for lista in productos.values() for p in lista]


# ---------------------------------------------------------------------------
# Rutas
# ---------------------------------------------------------------------------

@app.context_processor
def datos_globales():
    return {
        "whatsapp": WHATSAPP,
        "anio": date.today().year,
        "categorias_menu": CATEGORIAS,
        "catalogo_js": todos_los_productos(),
    }


@app.route("/")
def inicio():
    todos = todos_los_productos()
    conteo = {clave: len(productos.get(clave, [])) for clave in CATEGORIAS}
    return render_template(
        "index.html",
        productos=todos,
        destacados=[p for p in todos if p["destacado"]],
        conteo=conteo,
        categorias=CATEGORIAS,
    )


@app.route("/categoria/<nombre>")
def categoria(nombre):
    if nombre not in CATEGORIAS:
        abort(404)

    info = CATEGORIAS[nombre]
    lista_productos = productos.get(nombre, [])
    marcas = sorted({p["marca"] for p in lista_productos})
    tipos = sorted({p["tipo"] for p in lista_productos})

    return render_template(
        "categoria.html",
        slug=nombre,
        categoria=info["titulo"],
        info=info,
        productos=lista_productos,
        marcas=marcas,
        tipos=tipos,
    )


@app.errorhandler(404)
def no_encontrado(error):
    return render_template("404.html"), 404


if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)