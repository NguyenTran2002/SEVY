# Use an official Python runtime as the base image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["python", "app.py"]