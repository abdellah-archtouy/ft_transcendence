# # Stage 1: Build the React app
# FROM node:18-alpine AS builder

# # Set the working directory
# WORKDIR /app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy the rest of the app's source code
# COPY . .

# EXPOSE 80

# # Build the React app for production
# CMD ["npm", "run", "build"]

# Stage 1: Build the React app
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the build with a lightweight server
FROM node:18-alpine

WORKDIR /app

# Copy only the build folder and necessary files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install -g serve

# Expose the port
EXPOSE 80

# Command to serve the build
CMD ["serve", "-s", "build", "-l", "80"]