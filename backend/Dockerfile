# ==============================================================================
# Multi-Stage Dockerfile for Elite Athletic Club Backend
# ==============================================================================

# Stage 1: Build Stage
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy project descriptor and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile production JAR (skipping unit tests)
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Ensure uploads directory structure exists for evidence and CMS media
RUN mkdir -p uploads/evidence

# Copy compiled JAR artifact from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose backend application port
EXPOSE 8080

# Environment defaults
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

# Launch application
ENTRYPOINT ["java", "-jar", "app.jar"]