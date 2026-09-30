# Build Stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compile and package without running unit tests during Docker build
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/portfolio-pro-backend-1.0.0.jar app.jar
RUN mkdir -p /app/data

ENV PORT=8085
EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
