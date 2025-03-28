# Базовый образ с Python
FROM python:3.11

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY .. .

# Открываем порт для Uvicorn
EXPOSE 8000

# Команда для запуска сервера
CMD ["uvicorn", "djgram.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--reload"]
