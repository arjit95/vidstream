package main

import (
	"context"
	// "crypto/tls"
	"fmt"
	// "net"
	"net/http"
	"os"
	"time"

	"contrib.go.opencensus.io/exporter/jaeger"
	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/plugin/ochttp/propagation/b3"
	"go.opencensus.io/trace"
	// "golang.org/x/net/http2"
	"google.golang.org/grpc"

	"frontend/services"
)

const (
	port = "8080"

	cookieMaxAge    = 60 * 60 * 48
	cookiePrefix    = "user_"
	cookieSessionID = cookiePrefix + "session-id"
	healthEndpoint  = "/_healthz"
)

func main() {
	ctx := context.Background()
	log := logrus.New()
	log.Level = logrus.InfoLevel
	log.Formatter = &logrus.JSONFormatter{
		FieldMap: logrus.FieldMap{
			logrus.FieldKeyTime:  "timestamp",
			logrus.FieldKeyLevel: "severity",
			logrus.FieldKeyMsg:   "message",
		},
		TimestampFormat: time.RFC3339Nano,
	}

	log.Out = os.Stdout
	if os.Getenv("DISABLE_TRACING") == "" {
		log.Info("Tracing enabled.")
		go initTracing(log)
	} else {
		log.Info("Tracing disabled.")
	}

	r := mux.NewRouter()

	srvPort := port
	if os.Getenv("PORT") != "" {
		srvPort = os.Getenv("PORT")
	}

	svc := new(services.FrontendServer)
	mustMapEnv(&svc.HelloAddr, "HELLO_SERVICE_ADDR")
	mustMapEnv(&svc.UploadAddr, "UPLOAD_SERVICE_ADDR")

	mustConnGRPC(ctx, &svc.HelloSvcConn, svc.HelloAddr)
	svc.UploadSvcConn = mustConnHTTP()

	apiRoutes := r.PathPrefix("/api").Subrouter()
	svc.AddEndpoints(apiRoutes)
	r.HandleFunc(healthEndpoint, func(w http.ResponseWriter, _ *http.Request) { fmt.Fprint(w, "ok") })
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/")))

	var handler http.Handler = r
	handler = &ochttp.Handler{ // add opencensus instrumentation
		Handler:     handler,
		Propagation: &b3.HTTPFormat{},
		IsHealthEndpoint: func(req *http.Request) bool {
			return req.URL.Path == healthEndpoint
		},
	}

	handler = &logHandler{log: log, next: handler} // add logging

	log.Infof("starting server on port :" + srvPort)
	log.Fatal(http.ListenAndServe(":"+srvPort, handler))
}

func mustMapEnv(target *string, envKey string) {
	v := os.Getenv(envKey)
	if v == "" {
		panic(fmt.Sprintf("environment variable %q not set", envKey))
	}

	*target = v
}

func mustConnHTTP() http.Client {
	client := http.Client{}
	return client
}

// func mustConnHTTP2() http.Client {
// 	client := http.Client{
// 		Transport: &http2.Transport{
// 			AllowHTTP: true,
// 			DialTLS: func(network, addr string, cfg *tls.Config) (net.Conn, error) {
// 				return net.Dial(network, addr)
// 			},
// 		},
// 	}

// 	return client
// }

func mustConnGRPC(ctx context.Context, conn **grpc.ClientConn, addr string) {
	var err error
	*conn, err = grpc.DialContext(ctx, addr,
		grpc.WithInsecure(),
		grpc.WithTimeout(time.Minute*3),
		grpc.WithStatsHandler(&ocgrpc.ClientHandler{}))
	if err != nil {
		panic(errors.Wrapf(err, "grpc: failed to connect %s", addr))
	}
}

func initTracing(log logrus.FieldLogger) {
	// This is a demo app with low QPS. trace.AlwaysSample() is used here
	// to make sure traces are available for observation and analysis.
	// In a production environment or high QPS setup please use
	// trace.ProbabilitySampler set at the desired probability.
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	initJaegerTracing(log)
}

func initJaegerTracing(log logrus.FieldLogger) {

	svcAddr := os.Getenv("JAEGER_SERVICE_ADDR")
	if svcAddr == "" {
		log.Info("jaeger initialization disabled.")
		return
	}

	// Register the Jaeger exporter to be able to retrieve
	// the collected spans.
	exporter, err := jaeger.NewExporter(jaeger.Options{
		CollectorEndpoint: fmt.Sprintf("http://%s", svcAddr),
		Process: jaeger.Process{
			ServiceName: "frontend",
		},
	})

	if err != nil {
		log.Fatal(err)
	}

	trace.RegisterExporter(exporter)
	log.Info("jaeger initialization completed.")
}
