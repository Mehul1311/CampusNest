# Campus OLX Backend - Node.js API
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY src ./src

# Create uploads directory for item images (writable at runtime)
RUN mkdir -p uploads && chown -R node:node uploads

# Non-root user
USER node

EXPOSE 5000

ENV NODE_ENV=production
CMD ["node", "src/server.js"]
