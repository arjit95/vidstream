package hello

import (
	"github.com/gorilla/mux"
	"google.golang.org/grpc"
)

// AddHelloRoutes for hello service
func AddHelloRoutes(route *mux.Router, conn *grpc.ClientConn) {
	rpc := &helloRPCServer{
		conn: conn,
	}

	route.HandleFunc("/hello/{name}", rpc.sayHello)
}
