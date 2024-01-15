# Build stage
FROM node:20.11-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN apk add --no-cache yarn libc6-compat
RUN yarn --frozen-lockfile
COPY . .
RUN yarn build

# Production stage
FROM node:20.11-alpine AS production
WORKDIR /app
COPY --from=build /app ./
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002

# Create a non-root user for running the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
RUN chown -R expressjs:nodejs /app/dist
RUN chmod -R 755 /app/dist

USER expressjs
CMD yarn start
