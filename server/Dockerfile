FROM python:3.10-slim

WORKDIR /app

# Copy requirements file (without the "server/" prefix)
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code (again, no "server/" prefix)
COPY . .

ENV FLASK_APP=app
ENV FLASK_ENV=development

CMD ["flask", "run", "--host=0.0.0.0"]
