FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY backend/ .

ENV FLASK_APP=app
ENV FLASK_ENV=development

CMD ["flask", "run", "--host=0.0.0.0"]
