package uploadservice

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"

	"github.com/sirupsen/logrus"

	"frontend/helpers"
)

type uploadRestService struct {
	client http.Client
	addr   string
}

func (re *uploadRestService) forwardUpload(file multipart.File, fileHeader *multipart.FileHeader) (bool, error) {
	// start building our request to forward the file
	var resp *http.Response
	defer func() {
		if resp != nil {
			resp.Body.Close()
		}
	}()

	// build a form body
	body := &bytes.Buffer{}
	bodyWriter := multipart.NewWriter(body)

	bodyWriter.WriteField("userID", "Random") // TODO: Update to user id

	// add a form file to the body
	fileWriter, err := bodyWriter.CreateFormFile("fileUpload", fileHeader.Filename)
	if err != nil {
		return false, err
	}
	// copy the file into the fileWriter
	_, err = io.Copy(fileWriter, file)
	if err != nil {
		return false, err
	}

	// Close the body writer
	bodyWriter.Close()

	// build request url
	apiURL := fmt.Sprintf("%s/api/upload", re.addr)

	// send request
	req, err := http.NewRequest("POST", apiURL, body)
	req.Header.Set("Content-Type", bodyWriter.FormDataContentType())

	resp, err = re.client.Do(req)

	if err != nil {
		return false, err
	}

	defer resp.Body.Close()

	return true, nil
}

func (re *uploadRestService) upload(response http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	logger := ctx.Value(helpers.CtxKeyLog).(logrus.FieldLogger)
	requestID := ctx.Value(helpers.CtxKeyRequestID).(string)

	const maxFileSize = 1 * 1024 * 1024
	req.ParseMultipartForm(maxFileSize)

	file, fileHeader, err := req.FormFile("fileUpload")
	if err != nil {
		return
	}

	defer file.Close()

	success, err := re.forwardUpload(file, fileHeader)
	if success {
		http.Redirect(response, req, "/?uploaded=true", 302)
	} else {
		logger.Errorf("Cannot upload file with request id: %s", requestID)
		logger.Error(err.Error())
		fmt.Fprintf(response, "Cannot upload your file")
	}
}

func (re *uploadRestService) echo(res http.ResponseWriter, req *http.Request) {
	apiURL := fmt.Sprintf("%s/api/echo", re.addr)

	logger := req.Context().Value(helpers.CtxKeyLog).(logrus.FieldLogger)
	requestID := req.Context().Value(helpers.CtxKeyRequestID).(string)

	req, err := http.NewRequest("GET", apiURL, nil)
	resp, err := re.client.Do(req)

	if err != nil {
		logger.Errorf("Cannot echo for: %s", requestID)
		logger.Error(err.Error())
		res.WriteHeader(403)
		fmt.Fprintf(res, err.Error())
		return
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logger.Errorf("Cannot echo for: %s", requestID)
		logger.Error(err.Error())
		res.WriteHeader(403)
		fmt.Fprintf(res, err.Error())
		return
	}

	defer resp.Body.Close()

	res.WriteHeader(200)
	res.Write(body)
}

type encodeReq struct {
	name string
}

func (re *uploadRestService) encode(res http.ResponseWriter, req *http.Request) {
	apiURL := fmt.Sprintf("%s/api/encode", re.addr)

	req, err := http.NewRequest("POST", apiURL, req.Body)
	resp, err := re.client.Do(req)

	if err != nil {
		res.WriteHeader(500)
	} else {
		res.WriteHeader(200)
	}

	defer resp.Body.Close()
}
