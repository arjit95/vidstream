package services

import (
	"net/http"

	"github.com/gorilla/mux"
	"google.golang.org/grpc"

	"frontend/services/hello"
	"frontend/services/stream"
	"frontend/services/upload"
)

// FrontendServer contains all the connection details for various grpc servers
type FrontendServer struct {
	HelloAddr    string
	HelloSvcConn *grpc.ClientConn

	UploadAddr    string
	UploadSvcConn http.Client

	StreamAddr    string
	StreamSvcConn http.Client
}

// AddEndpoints for all the services
func (fs *FrontendServer) AddEndpoints(router *mux.Router) {
	hello.AddHelloRoutes(router, fs.HelloSvcConn)
	upload.AddUploadRoutes(router, fs.UploadSvcConn, fs.UploadAddr)
	stream.AddStreamRoutes(router, fs.StreamSvcConn, fs.StreamAddr)
}
