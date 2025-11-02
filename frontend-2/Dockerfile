# Development Dockerfile for frontend-2 (Vite + React + TypeScript)
# For local development with docker-compose

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Start Vite development server
# --host 0.0.0.0 makes it accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
