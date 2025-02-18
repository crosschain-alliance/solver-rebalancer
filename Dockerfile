FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./


# Install system dependencies for node-gyp (Python, g++, make)
RUN apk update && apk add --no-cache python3 g++ make


# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build


# Command to run the app
CMD ["node", "dist/index.js"]