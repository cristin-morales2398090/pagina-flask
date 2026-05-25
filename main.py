from flask import Flask, render_template

app = Flask(__name__)

productos = {

    "portatiles": [

        {
            "nombre":"HP 15s",
            "descripcion":"Core i5 • 16GB RAM • SSD 512GB",
            "precio":"$2.500.000",
            "imagen":"img/laptop1.jpg"
        },

        {
            "nombre":"Lenovo IdeaPad",
            "descripcion":"Ryzen 7 • 16GB RAM",
            "precio":"$3.200.000",
            "imagen":"img/laptop2.jpg"
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

if __name__ == "__main__":
    app.run(debug=True)