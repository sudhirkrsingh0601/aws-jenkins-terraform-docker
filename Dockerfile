# Dockerfile for the Node.js Express app
# Build a lightweight image and expose port 3000.

FROM node:20-alpine
WORKDIR /usr/src/app

# Copy package files first for faster rebuilds
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application source code
COPY app ./app

# Expose internal app port
EXPOSE 3000

# Start the app
CMD ["node", "app/server.js"]
