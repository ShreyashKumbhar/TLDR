FROM eclipse-temurin:17-jdk-alpine AS builder

RUN apk add --no-cache nodejs npm maven

WORKDIR /app

# Copy dependency files
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY backend/user-service/pom.xml ./backend/user-service/
COPY backend/summary-service/pom.xml ./backend/summary-service/
COPY backend/vote-service/pom.xml ./backend/vote-service/
COPY backend/comment-service/pom.xml ./backend/comment-service/
COPY backend/saved-service/pom.xml ./backend/saved-service/
COPY backend/recommendation-service/pom.xml ./backend/recommendation-service/
COPY backend/circle-service/pom.xml ./backend/circle-service/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Install backend dependencies
WORKDIR /app
RUN sh -c 'for service in user summary vote comment saved recommendation circle; do cd backend/${service}-service && mvn dependency:go-offline -B; cd ../..; done'

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY scripts/ ./scripts/

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Build backend services
WORKDIR /app
RUN sh -c 'for service in user summary vote comment saved recommendation circle; do cd backend/${service}-service && mvn clean package -DskipTests -B; cd ../..; done'

FROM eclipse-temurin:17-jre-alpine

RUN apk add --no-cache supervisor nginx

WORKDIR /app

# Clean up
RUN mkdir -p /var/log/supervisor /var/run && \
    mkdir -p /app/backend/user-service/target /app/backend/summary-service/target /app/backend/vote-service/target /app/backend/comment-service/target /app/backend/saved-service/target /app/backend/recommendation-service/target /app/backend/circle-service/target

COPY --from=builder /app/backend/user-service/target/*.jar ./backend/user-service/target/
COPY --from=builder /app/backend/summary-service/target/*.jar ./backend/summary-service/target/
COPY --from=builder /app/backend/vote-service/target/*.jar ./backend/vote-service/target/
COPY --from=builder /app/backend/comment-service/target/*.jar ./backend/comment-service/target/
COPY --from=builder /app/backend/saved-service/target/*.jar ./backend/saved-service/target/
COPY --from=builder /app/backend/recommendation-service/target/*.jar ./backend/recommendation-service/target/
COPY --from=builder /app/backend/circle-service/target/*.jar ./backend/circle-service/target/

COPY --from=builder /app/frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

COPY supervisord.conf /etc/supervisord.conf
RUN chmod 777 /etc/supervisord.conf

EXPOSE 8081 8082 8083 8084 8085 8086 8087 3000

ENTRYPOINT ["/usr/bin/supervisord"]
