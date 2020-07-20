############################
# STEP 1 build executable binary
############################
# golang debian buster 1.14.1 linux/amd64
# https://github.com/docker-library/golang/blob/master/1.14/buster/Dockerfile
FROM golang@sha256:1e9c36b3fd7d7f9ab95835fb1ed898293ec0917e44c7e7d2766b4a2d9aa43da6 as builder

# Ensure ca-certficates are up to date
RUN update-ca-certificates

WORKDIR .

ENV GOPATH=

# use modules
COPY go.mod .

ENV GO111MODULE=on
RUN go mod download
RUN go mod verify

COPY . .

# Build the static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
      -ldflags='-w -s -extldflags "-static"' -a \
      -o /go/bin/app .

############################
# STEP 2 build a small image
############################
FROM alpine:3.12

RUN GRPC_HEALTH_PROBE_VERSION=v0.2.0 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

# Copy our static executable
COPY --from=builder /go/bin/app /go/bin/app

# Run the app binary.
ENTRYPOINT ["/go/bin/app"]
