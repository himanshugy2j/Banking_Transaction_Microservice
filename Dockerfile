# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# ---------- Stage 2: Run ----------
FROM node:18-alpine

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app /app

# Expose the port your app runs on
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]
