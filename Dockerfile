# Imagen base de Python
FROM python:3.11-slim

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de requisitos
COPY requirements.txt .

# Instalar dependencias del sistema para MySQL
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Exponer puerto (Railway usa variable PORT dinámica)
EXPOSE 8080

# Comando para ejecutar la aplicación
# Railway inyecta automáticamente la variable PORT
CMD gunicorn run:app --workers 4 --timeout 120 --bind 0.0.0.0:$PORT
