FROM maven:3.9.9-eclipse-temurin-17 AS build
ARG SERVICE=summary-service
WORKDIR /build
COPY backend/${SERVICE}/pom.xml ./pom.xml
RUN mvn -B -ntp dependency:go-offline
COPY backend/${SERVICE}/src ./src
RUN mvn -B -ntp package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S api && adduser -S api -G api
COPY --from=build --chown=api:api /build/target/*.jar /app/app.jar
USER api
EXPOSE 8081 8082 8083 8084 8085 8086 8087
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
