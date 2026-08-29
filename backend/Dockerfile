# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and package JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a dedicated non-root user and group
RUN addgroup -S elitegym && adduser -S elitegym -G elitegym

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership of the runtime directory
RUN chown -R elitegym:elitegym /app

# Switch to non-root user
USER elitegym

# Expose Spring Boot default port
EXPOSE 8080

# Configure JVM memory settings and container-aware flags
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]