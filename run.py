"""
Punto de entrada principal de la aplicación
Equivalente al main() en Spring Boot
"""
from backend.app import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )
