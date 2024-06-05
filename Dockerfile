# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments
ARG SENTRY_AUTH_TOKEN

# Set environment variables
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN apk add --no-cache libc6-compat
RUN npm ci

# Copy the application code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy built application from the build stage
COPY --from=build /app ./

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
  NODE_ENV=production \
  PORT=3001

# Expose port
EXPOSE 3001

# Create a non-root user for running the application
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 expressjs --ingroup nodejs && \
  chown -R expressjs:nodejs /app/dist && \
  chmod -R 755 /app/dist

# Switch to non-root user
USER expressjs

# Command to run application
CMD ["npm", "start"]
