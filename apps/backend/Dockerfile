# syntax=docker/dockerfile:1.7

FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

COPY apps/backend/gradlew ./gradlew
COPY apps/backend/gradle ./gradle
COPY apps/backend/build.gradle ./build.gradle
COPY apps/backend/settings.gradle ./settings.gradle

RUN chmod +x ./gradlew

RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew --no-daemon dependencies >/dev/null

COPY apps/backend/src ./src

RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew --no-daemon bootJar

FROM eclipse-temurin:21-jre-jammy AS runner

ENV SPRING_PROFILES_ACTIVE=prod

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 spring \
    && useradd --system --uid 1001 --gid spring spring

COPY --from=builder /app/build/libs/*.jar /app/app.jar

USER spring

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
