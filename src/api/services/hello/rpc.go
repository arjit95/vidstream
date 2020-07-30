package hello

import (
	"fmt"
	"net/http"

	proto "frontend/genproto"

	"github.com/gorilla/mux"
	"google.golang.org/grpc"
)

type helloRPCServer struct {
	conn *grpc.ClientConn
}

func (hr *helloRPCServer) sayHello(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	resp, err := proto.NewHelloServiceClient(hr.conn).Hello(r.Context(), &proto.HelloRequest{
		Name: vars["name"],
	})

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, err.Error())
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, resp.GetMessage())
}
