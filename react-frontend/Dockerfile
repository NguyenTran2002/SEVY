# Stage 1: Build the React application
FROM node:16 AS react-build

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

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/conf.d/configfile.template

# Copy built files from stage 1
COPY --from=react-build /app/build /usr/share/nginx/html

# Set environment variables for Cloud Run
ENV PORT 8080
ENV HOST 0.0.0.0

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start Nginx with dynamic PORT substitution
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
