# ── Etapa 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copia o pom.xml primeiro para cachear as dependências do Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código-fonte e compila o JAR
COPY src ./src
RUN mvn package -DskipTests -B

# ── Etapa 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copia apenas o JAR gerado (imagem final bem menor)
COPY --from=builder /app/target/*.jar app.jar

# Porta exposta pela API
EXPOSE 8080

# Comando de inicialização
ENTRYPOINT ["java", "-jar", "app.jar"]
