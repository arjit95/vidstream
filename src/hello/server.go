package main

import (
	"fmt"
	"net"
	"os"
	"time"

	"hello/proto"

	"github.com/sirupsen/logrus"
	"go.opencensus.io/plugin/ocgrpc"
	"google.golang.org/grpc"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
)

var (
	log  *logrus.Logger
	port = "8080"
)

func main() {
	log = logrus.New()
	log.Formatter = &logrus.JSONFormatter{
		FieldMap: logrus.FieldMap{
			logrus.FieldKeyTime:  "timestamp",
			logrus.FieldKeyLevel: "severity",
			logrus.FieldKeyMsg:   "message",
		},
		TimestampFormat: time.RFC3339Nano,
	}

	log.Out = os.Stdout

	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}

	log.Infof("starting grpc server at :%s", port)
	log.Infof("gRPC server address: %s", run(port))

	select {}
}

func run(port string) string {
	l, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatal(err)
	}

	var srv *grpc.Server

	if os.Getenv("DISABLE_STATS") == "" {
		log.Info("Stats enabled.")
		srv = grpc.NewServer(grpc.StatsHandler(&ocgrpc.ServerHandler{}))
	} else {
		log.Info("Stats disabled.")
		srv = grpc.NewServer()
	}

	svc := &rpcService{}
	proto.RegisterHelloServiceServer(srv, svc)
	healthpb.RegisterHealthServer(srv, svc)

	go srv.Serve(l)
	return l.Addr().String()
}
