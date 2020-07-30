package helpers

import (
	"io"
	"net/http"
	"strings"

	"github.com/sirupsen/logrus"
)

type key string

// CtxKeyRequestID can be used to fetch request id from context
const CtxKeyRequestID key = "requestIDKey"

// CtxKeyLog can be used to fetch logger instance
const CtxKeyLog key = "CtxLogKey"

// GenericRequestForward method proxy forwards a request to specific service
func GenericRequestForward(baseAddr string) func(http.ResponseWriter, *http.Request) {
	if strings.Index(baseAddr, "http://") == 0 {
		baseAddr = strings.Replace(baseAddr, "http://", "", 1)
	}

	return func(w http.ResponseWriter, req *http.Request) {
		ctx := req.Context()
		logger := ctx.Value(CtxKeyLog).(logrus.FieldLogger)
		requestID := ctx.Value(CtxKeyRequestID).(string)

		url := req.URL

		url.Host = baseAddr
		url.Scheme = "http"

		logger.Infof("Forwarding request with id %s to %s", requestID, url.String())

		proxyReq, err := http.NewRequest(req.Method, url.String(), req.Body)
		if err != nil {
			// handle error
		}

		proxyReq.Header.Set("Host", req.Host)
		proxyReq.Header.Set("X-Forwarded-For", req.RemoteAddr)

		copyHeader(proxyReq.Header, req.Header)

		client := &http.Client{}
		proxyRes, err := client.Do(proxyReq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		defer proxyRes.Body.Close()
		copyHeader(w.Header(), proxyRes.Header)
		io.Copy(w, proxyRes.Body)
	}
}

func copyHeader(target http.Header, source http.Header) {
	for header, values := range source {
		for _, value := range values {
			target.Add(header, value)
		}
	}
}
