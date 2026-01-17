FROM node:18-alpine

# Create app directory inside container
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
