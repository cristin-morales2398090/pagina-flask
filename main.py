from flask import Flask, render_template

app = Flask(__name__)

productos = {

    "portatiles":[

    {
        "nombre":"HP 15-FD0130LA",
        "marca":"HP",
        "tipo":"Corporativo",
        "descripcion":"Core i3 • DDR4 8GB RAM • SSD 512GB • 15.6 pulgadas",
        "imagen":"img/productos/laptop1.jpg"
    },

     {
        "nombre":"HP 245 G10",
        "marca":"HP",
        "tipo":"Corporativo",
        "descripcion":"RYZEN 5 7530U DDR4 8GB (1 SLOT * 8GB + 1 DISPONIBLE AMPLIACION), SSD 512GB , 14 PULGADAS, LINUX, GRIS OSCURO.",
        "imagen":"img/productos/laptop2.jpg"
    },

     {
        "nombre":"HP 15-FC0256LA",
        "marca":"HP",
        "tipo":"Corporativo",
        "descripcion":"RYZEN 5 7520U, 16GB, SSD 512GB, 15.6 1920*1080, RADEON GRAPHICS, AZUL. LINUX",
        "imagen":"img/productos/laptop3.jpg"
    },

     {
        "nombre":"HP 15-FD0158LA",
        "marca":"HP",
        "tipo":"Corporativo",
        "descripcion":"INTEL CORE I5 1235U, DDR4 8GB, SSD 512GB, PANTALLA 15.6\" FHD, LINUX, PLATA.",
        "imagen":"img/productos/laptop4.jpg"
    },

    {
        "nombre":"HP 15-FD0158LA",
        "marca":"HP",
        "tipo":"Corporativo",
        "descripcion":" INTEL CORE I5 1235U, DDR4 24GB (8GB + 16GB ADATA) , SSD 512GB, PANTALLA 15.6 FHD, LINUX, PLATA.",
        "imagen":"img/productos/laptop5.jpg"
    },

    {
        "nombre":"HP 15-FB3019LA VICTUS ",
        "marca":"HP",
        "tipo":"Gamer",
        "descripcion":"AMD RYZEN 7 7445HS, 8GB, SSD 512GB SSD, NVIDIA GEFORCE RTX 3050 6GB, PANTALLA 15.6 FULL HD, 144HZ. LINUX, NEGRO.",
        "imagen":"img/productos/laptop6.jpg"
    },


    {
        "nombre":"LENOVO IDEAPAD SLIM 3",
        "marca":"Lenovo",
        "tipo":"Corporativo",
        "descripcion":" INTEL CORE I3 1315U, LPDDR5 8GB, SSD 512GB, PANTALLA 15.6 FHD, LINUX, COLOR GRIS",
        "imagen":"img/productos/lenovo1.jpg"
    },

    {
        "nombre":"LENOVO V14 G4 ",
        "marca":"Lenovo",
        "tipo":"Corporativo",
        "descripcion":"AMD RYZEN 3 7320U LPDDR5 16GB, SSD 256GB, 14 FHD, LINUX, GRIS OSCURO.",
        "imagen":"img/productos/lenovo2.jpg"
    },

      {
        "nombre":"LENOVO V14 G5 ",
        "marca":"Lenovo",
        "tipo":"Corporativo",
        "descripcion":"INTEL CORE i5 13420H, DDR5 8GB (8GB ON BOARD + 1 SLOT DISPONIBLE), SSD 512GB, 14\" FHD, LINUX, GRIS OSCURO.",
        "imagen":"img/productos/lenovo3.jpg"
    },

      {
        "nombre":"LENOVO V14 G4 ",
        "marca":"Lenovo",
        "tipo":"Corporativo",
        "descripcion":" RYZEN 5 7520U, LPDDR5 16GB, SSD 512GB M.2 NVME, 14 FHD, GRIS ARTICO. LINUX",
        "imagen":"img/productos/lenovo2.jpg"
    },

      {
        "nombre":"LENOVO IDEAPAD SLIM 15AMN8",
        "marca":"Lenovo",
        "tipo":"Corporativo",
        "descripcion":" RYZEN 5 7520U, LPDDR5 16GB, SSD 512GB, PANTALLA 15.6\" FHD, LINUX, AZUL.",
        "imagen":"img/productos/lenovo5.jpg"
    },

    {
        "nombre":"ASUS Vivobook",
        "marca":"ASUS",
        "tipo":"CORPORATIVO",
        "descripcion":" INTEL CORE I3 1215U, DDR4 8GB, SSD 512 GB, 15.6”, LINUX, COOL SILVER.",
        "imagen":"img/productos/asus1.jpg"
    },
    {
        "nombre":"ASUS Vivobook",
        "marca":"ASUS",
        "tipo":"CORPORATIVO",
        "descripcion":" INTEL CORE I3 1315U, DDR4 12GB, SSD 512GB M.2 NVMe PCIE 3.0, 15,6 FHD (1920*1080), LINUX..",
        "imagen":"img/productos/asus1.jpg"
    },
    {
        "nombre":"ASUS ExpertBook",
        "marca":"ASUS",
        "tipo":"CORPORATIVO",
        "descripcion":" RYZEN 5 7535HS, DDR5 8GB ( 1 SLOT *8 + 1 DISPONIBLE AMPLIACION), SSD 512GB ( 1 SLOT DISPONIBLE AMPLIACION), PANTALLA 15.6 FULL HD, LINUX, GENTLE GREY.",
        "imagen":"img/productos/asus3.jpg"
    },
{
        "nombre":"ASUS Vivobook",
        "marca":"ASUS",
        "tipo":"CORPORATIVO",
        "descripcion":"INTEL CORE I5 1334U, DDR4 12GB, SSD 512GB PCIE, 15.6 FHD 1920*1080, COOL SILVER.",
        "imagen":"img/productos/asus4.jpg"
    },
{
        "nombre":"ASUS Vivobook",
        "marca":"ASUS",
        "tipo":"CORPORATIVO",
        "descripcion":" INTEL CORE I7 13620H, DDR4 16GB, SSD 512GB, PANTALLA 15.6\" WUXGA, LINUX, MILITARY GRADE US MIL-STD 810H, QUIET BLUE.",
        "imagen":"img/productos/asus5.jpg"
    },
{
        "nombre":"ASUS Vivobook",
        "marca":"ASUS",
        "tipo":"CORPORATIVO",
        "descripcion":" AMD RYZEN 9 270, DDR5 16GB, SSD 512GB, PANTALLA 16 WUXGA, LINUX, PLATEADO",
        "imagen":"img/productos/asus6.jpg"
    },
{
        "nombre":"ASUS TUF A506NC-HN006",
        "marca":"ASUS",
        "tipo":"Gamer",
        "descripcion":"AMD RYZEN 5 7535HS, DDR5 8GB, SSD 512GB, PANTALLA 15.6 FHD 144Hz, NVIDIA GEFORCE RTX 3050 4GB DDR6",
        "imagen":"img/productos/asus7.jpg"
    },

    {
        "nombre":"ASUS TUF A506NC-HN006",
        "marca":"ASUS",
        "tipo":"Gamer",
        "descripcion":"CORE I5 210H, DDR4 16GB, SSD 512GB PCIE 4.0 NVME, NVIDIA GEFORCE RTX 3050 6GB DDR6, 16 FHD 144Hz, LINUX, MECHA GRAY.",
        "imagen":"img/productos/asus8.jpg"
    },
     {
        "nombre":"ASUS TUF A506NC-HN006",
        "marca":"ASUS",
        "tipo":"Gamer",
        "descripcion":" AMD RYZEN 7 7445HS, DDR5 8GB SSD 512GB, PANTALLA 15.6 FHD 144Hz, NVIDIA GEFORCE RTX 3050 4GB DDR6,",
        "imagen":"img/productos/asus7.jpg"
    },

    {
        "nombre":"MSI Katana",
        "marca":"MSI",
        "tipo":"Gamer",
        "descripcion":"Core i7 • RTX 4050",
        "precio":"$6.800.000",
        "imagen":"img/productos/msi.jpg"
    }

],

    "impresoras": [

        {
            "nombre":"Epson L3250",
            "descripcion":"Multifuncional WiFi",
            "precio":"$850.000",
            "imagen":"img/epson.jpg"
        }

    ],

    "redes": [

        {
            "nombre":"Router TP-Link",
            "descripcion":"Doble Banda AC1200",
            "precio":"$220.000",
            "imagen":"img/router.jpg"
        }

    ]

}

@app.route("/")
def inicio():

    return render_template("index.html")

@app.route("/categoria/<nombre>")
def categoria(nombre):

    lista_productos = productos.get(nombre, [])

    return render_template(
        "categoria.html",
        categoria=nombre.capitalize(),
        productos=lista_productos
    )

# ✅ IMPORTANTE PARA RENDER
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)