# syntax=docker/dockerfile:1

FROM ghcr.io/cirruslabs/flutter:3.41.6 AS builder

WORKDIR /app

COPY . .

RUN flutter config --no-analytics && \
    flutter pub get && \
    flutter build apk --release

FROM alpine:3.20 AS output

RUN apk add --no-cache bash

WORKDIR /artifacts

COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk /artifacts/app-release.apk

CMD ["ls", "-lh", "/artifacts"]
