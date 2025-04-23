# STAGE 1: Build the React app
FROM node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for npm install
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the React app
RUN npm run build

# STAGE 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy the build files from the build stage to the Nginx HTML folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (default for Nginx)
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
