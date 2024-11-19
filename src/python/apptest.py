from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/scrape', methods=['POST'])
def scrape():
    print("¡Solicitud recibida!")
    return jsonify({
        "status": "success",
        "message": "Conexión exitosa"
    })

@app.route('/', methods=['GET'])
def home():
    return "Servidor funcionando"

if __name__ == '__main__':
    print("Iniciando servidor...")
    # Modificación importante aquí: host='0.0.0.0'
    app.run(debug=True, host='0.0.0.0', port=5000)
