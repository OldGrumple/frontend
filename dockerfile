# Use Node.js as the base image
FROM node:18-alpine
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json (if available)
COPY package*.json ./
# Install dependencies
RUN npm ci
# Copy the rest of your app's source code
COPY . .
# Build the app
RUN npm run build
# Expose the port the app runs on
EXPOSE 3000
# Start the app
CMD ["node", "build"]