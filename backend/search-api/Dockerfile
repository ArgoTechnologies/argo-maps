FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /search-api .

FROM alpine:3.20
COPY --from=builder /search-api /search-api
EXPOSE 4000
CMD ["/search-api"]
