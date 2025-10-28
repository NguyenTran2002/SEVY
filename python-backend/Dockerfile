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

# Declare build arguments for environment variables
ARG openai_api_key
ARG username
ARG password
ARG server_address

# Set environment variables from build arguments
ENV openai_api_key=${openai_api_key}
ENV username=${username}
ENV password=${password}
ENV server_address=${server_address}

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["python", "app.py"]