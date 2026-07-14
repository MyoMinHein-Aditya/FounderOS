# Use a lightweight official Python runtime
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install system dependencies needed for psycopg2 (PostgreSQL adapter)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Expose port 7860 (Hugging Face default) or bind to dynamic PORT
EXPOSE 7860

# Start the application, using port 7860 by default (customizable via ENV PORT on other platforms)
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860}"]
