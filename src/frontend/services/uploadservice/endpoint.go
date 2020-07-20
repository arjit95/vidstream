package uploadservice

import (
	"net/http"

	"github.com/gorilla/mux"
)

// AddUploadRoutes add routes for upload service
func AddUploadRoutes(route *mux.Router, client http.Client, addr string) {
	instance := &uploadRestService{
		client: client,
		addr:   addr,
	}

	route.HandleFunc("/upload/file", instance.upload).Methods("POST")
	route.HandleFunc("/upload/echo", instance.echo).Methods("GET")
}
