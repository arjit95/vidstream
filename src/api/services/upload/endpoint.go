package upload

import (
	"net/http"

	"frontend/helpers"

	"github.com/gorilla/mux"
)

// AddUploadRoutes add routes for upload service
func AddUploadRoutes(route *mux.Router, client http.Client, addr string) {
	instance := &uploadRestService{
		client: client,
		addr:   addr,
	}

	route.HandleFunc("/upload/file", instance.upload).Methods("POST")
	route.HandleFunc("/upload/echo", helpers.GenericRequestForward(addr)).Methods("GET")
}
