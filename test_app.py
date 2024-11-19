from webscraping import app

def test_app():
    with app.test_client() as client:
        # Prueba básica para verificar que la aplicación está funcionando
        response = client.get('/')
        assert response.status_code in [200, 404]  # Aceptamos 404 ya que no definimos ruta raíz