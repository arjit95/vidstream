package stream

import (
	"net/http"

	"frontend/helpers"

	"github.com/gorilla/mux"
)

// AddStreamRoutes add routes for stream service
func AddStreamRoutes(route *mux.Router, client http.Client, addr string) {
	route.HandleFunc("/stream/raw", helpers.GenericRequestForward(addr)).Methods("GET", "HEAD", "OPTIONS")
}
