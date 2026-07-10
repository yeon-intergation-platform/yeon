# syntax=docker/dockerfile:1.7

FROM eclipse-temurin:25-jdk-alpine AS builder

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

FROM eclipse-temurin:25-jre-alpine AS runner

ENV SPRING_PROFILES_ACTIVE=prod

WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup -S -g 1001 spring \
    && adduser -S -u 1001 -G spring spring

COPY --from=builder /app/build/libs/*.jar /app/app.jar
COPY --chmod=755 scripts/runtime/runtime-secret-entrypoint.sh /app/runtime-secret-entrypoint.sh

USER spring

EXPOSE 8081

ENTRYPOINT ["/app/runtime-secret-entrypoint.sh"]
CMD ["java", "-jar", "/app/app.jar"]
