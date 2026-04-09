FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source
COPY src ./src

# Build
RUN mvn clean package -DskipTests

# Runtime image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

ENV JAVA_OPTS="-Xms128m -Xmx256m"

COPY --from=build /workspace/target/*.jar /app/app.jar

EXPOSE 8082

CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
