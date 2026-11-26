# build stage

FROM maven:3.10-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY pom.xml .

RUN mvn -B dependency:go-offline

COPY src ./src

RUN mvn -B package -DskipTests

# final stage

FROM eclipse-temurin:21-jre-alpine AS final

WORKDIR /app

COPY --from=build /app/target/task-manager-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
