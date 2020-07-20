package hello

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"google.golang.org/grpc"
)

func echo(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "World")
}

// AddHelloRoutes for hello service
func AddHelloRoutes(route *mux.Router, conn *grpc.ClientConn) {
	rpc := &helloRPCServer{
		conn: conn,
	}

	route.HandleFunc("/hello", echo)
	route.HandleFunc("/hello/{name}", rpc.sayHello)
}
