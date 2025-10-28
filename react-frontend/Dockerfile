# Use an official node image as the base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Declare build arguments for environment variables
ARG REACT_APP_IPINFO_TOKEN
ARG REACT_APP_BACKEND_URL

# Set environment variables from build arguments (must be set before npm run build)
ENV REACT_APP_IPINFO_TOKEN=${REACT_APP_IPINFO_TOKEN}
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]