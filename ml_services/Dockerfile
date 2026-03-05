FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0

COPY requirements_inference.txt .

RUN pip install --upgrade pip

RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements_inference.txt

COPY . .

EXPOSE 5001

CMD ["python", "app.py"]