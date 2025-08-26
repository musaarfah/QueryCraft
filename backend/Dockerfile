# Use full Python (not slim) so wheels install instead of compiling
FROM python:3.11

# Set working directory
WORKDIR /app

# Install system dependencies for common scientific libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ make cmake \
    libxml2-dev libxslt1-dev zlib1g-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip, setuptools, wheel
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install PyTorch first (using official wheel index so it doesn’t compile)
RUN pip install --no-cache-dir torch==2.8.0 --index-url https://download.pytorch.org/whl/cpu

# Copy requirements
COPY requirements.txt .

# Install the rest of the dependencies (torch already installed, so pip skips it)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your code
COPY . .

# Expose backend port
EXPOSE 8000

# Run your app
CMD ["python", "app.py"]
