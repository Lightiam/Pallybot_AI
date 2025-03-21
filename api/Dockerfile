FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir couchdb

COPY . .

CMD ["python", "-m", "rasa", "run", "--enable-api", "--cors", "*"]
