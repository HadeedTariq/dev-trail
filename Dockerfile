FROM golang:1.26 AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /out/gophercrm \
    ./cmd

FROM alpine:3.20

WORKDIR /app

COPY --from=build /out/gophercrm ./gophercrm

EXPOSE 8080

CMD ["./gophercrm"]