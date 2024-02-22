package server

import (
	"bytes"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"time"
)

type GenericResponse struct {
	Success bool `json:"success"`
}

type PortScanRequest struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

type PortScanResponse struct {
	Success    bool   `json:"success"`
	PortStatus string `json:"portStatus"`
}

type HttpRequestRequest struct {
	Method  string              `json:"method"`
	Url     string              `json:"url"`
	Headers map[string][]string `json:"headers"`
	Body    []byte              `json:"body"`
}

type HttpRequestResponse struct {
	Success    bool                `json:"success"`
	StatusCode int                 `json:"statusCode"`
	Headers    map[string][]string `json:"headers"`
	Body       []byte              `json:"body"`
}

func (a *AppServer) HealthCheck(req requestWrapper[NullType]) (g GenericResponse, err error) {
	g.Success = true
	return g, err
}

func (a *AppServer) PortScan(req requestWrapper[PortScanRequest]) (r PortScanResponse, err error) {
	waitChan := time.After(time.Second * 1)
	errChan := make(chan error, 1)
	okChan := make(chan struct{}, 1)

	addr := fmt.Sprintf("%s:%d", req.payload.Host, req.payload.Port)

	go func() {
		_, err := net.Dial("tcp", addr)
		if err != nil {
			errChan <- err
			return
		}
		okChan <- struct{}{}
	}()

	select {
	case <-waitChan:
		return r, fmt.Errorf("timed out")
	case err := <-errChan:
		return r, fmt.Errorf("net error: %w", err)
	case <-okChan:
		r.PortStatus = "OK"
		r.Success = true
		return r, err
	}
}

func (a *AppServer) HttpRequest(req requestWrapper[HttpRequestRequest]) (r HttpRequestResponse, err error) {
	client := &http.Client{}

	reqUrl, err := url.Parse(req.payload.Url)
	if err != nil {
		return r, err
	}

	request := &http.Request{
		Method: req.payload.Method,
		URL:    reqUrl,
		Header: req.payload.Headers,
		Body:   io.NopCloser(bytes.NewBuffer(req.payload.Body)),
	}
	response, err := client.Do(request)
	if err != nil {
		return r, err
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return r, err
	}
	return HttpRequestResponse{
		Success:    true,
		StatusCode: response.StatusCode,
		Headers:    response.Header,
		Body:       body,
	}, nil
}
