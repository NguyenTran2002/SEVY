# Development Dockerfile for frontend-2 (Vite + React + TypeScript)
# For local development with docker-compose

FROM node:20-alpine

WORKDIR /app

# Install tooling for asset optimization
RUN apk add --no-cache imagemagick

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Optimize branding assets (reduce dimensions & strip metadata)
RUN magick "public/branding/LOGO RECTANGLE.png" -strip -resize 640x -quality 92 "public/branding/LOGO RECTANGLE.png" && \
    magick "public/branding/LOGO SQUARE.png" -strip -resize 256x256 -quality 92 "public/branding/LOGO SQUARE.png"

# Expose Vite dev server port
EXPOSE 3000

# Start Vite development server
# --host 0.0.0.0 makes it accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
