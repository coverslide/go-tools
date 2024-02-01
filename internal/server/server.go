package server

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"time"
	"tools/internal/config"
	"tools/web"

	"github.com/gorilla/websocket"
)

type AppServer struct {
	config     config.Config
	httpServer *http.Server
	upgrader   websocket.Upgrader
}

func NewAppServer(conf config.Config) *AppServer {
	a := &AppServer{
		config: conf,
	}
	a.upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     a.CheckOrigin,
	}
	return a
}

func (a *AppServer) CheckOrigin(r *http.Request) bool {
	// TODO
	return true
}

type NullType struct{}

func (n *NullType) UnmarshalJSON(ignored []byte) error {
	*n = NullType{}
	return nil
}

type requestWrapper[K any] struct {
	payload K
	w       http.ResponseWriter
	r       *http.Request
}

type GenericResponse struct {
	Success bool `json:"success"`
}

type ErrorResponse struct {
	Success      bool   `json:"success"`
	ErrorMessage string `json:"errorMessage"`
}

type PortScanRequest struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

type PortScanResponse struct {
	Success    bool   `json:"success"`
	PortStatus string `json:"portStatus"`
}

func JsonMethod[Req any, Res any](handler func(requestWrapper[Req]) (Res, error)) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var req Req
		if r.Method != "GET" {
			err := json.NewDecoder(r.Body).Decode(&req)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(ErrorResponse{ErrorMessage: err.Error()})
				return
			}
		}
		res, err := handler(requestWrapper[Req]{req, w, r})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{ErrorMessage: err.Error()})
			return
		}
		err = json.NewEncoder(w).Encode(res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{ErrorMessage: err.Error()})
			return
		}
	}
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

func (a *AppServer) ListenAndServe() error {
	return a.httpServer.ListenAndServe()
}

type ApiRoutes map[string]struct{}

func (a ApiRoutes) AddRoute(route string) {
	a[route] = struct{}{}
}

type StaticRoutes map[string]bool

func (a StaticRoutes) StaticRoutes(route string, valid bool) {
	a[route] = valid
}

type AppMux struct {
	baseFs       http.FileSystem
	httpFs       http.Handler
	staticRoot   string
	apiMux       *http.ServeMux
	apiRoutes    ApiRoutes
	staticRoutes StaticRoutes
}

func NewAppMux(staticRoot string, staticFs fs.FS) *AppMux {
	return &AppMux{
		baseFs:       http.FS(staticFs),
		httpFs:       http.FileServer(http.FS(staticFs)),
		staticRoot:   staticRoot,
		apiRoutes:    make(ApiRoutes),
		staticRoutes: make(StaticRoutes),
		apiMux:       http.NewServeMux(),
	}
}

func (a *AppMux) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if _, ok := a.apiRoutes[r.URL.Path]; ok {
		a.apiMux.ServeHTTP(w, r)
		return
	}

	staticPath := fmt.Sprintf("%s%s", a.staticRoot, r.URL.Path)

	// default to index.html
	// basic check if we can see the file
	valid, ok := a.staticRoutes[staticPath]
	if !ok {
		f, err := a.baseFs.Open(staticPath)
		valid = err == nil
		a.staticRoutes[staticPath] = valid
		if valid {
			f.Close()
		}
	}

	if !valid {
		staticPath = fmt.Sprintf("/%s/", a.staticRoot)
	}
	r.URL.Path = staticPath
	a.httpFs.ServeHTTP(w, r)
}

func (a *AppMux) Handle(route string, handler http.Handler) {
	a.apiRoutes.AddRoute(route)
	a.apiMux.Handle(route, handler)
}

func (a *AppMux) HandleFunc(route string, handleFunc func(w http.ResponseWriter, r *http.Request)) {
	a.apiRoutes.AddRoute(route)
	a.apiMux.HandleFunc(route, handleFunc)
}

func NewServer(conf config.Config) *AppServer {
	appServer := NewAppServer(conf)
	appMux := NewAppMux("dist", web.FS)

	appMux.HandleFunc("/api/healthcheck", JsonMethod(appServer.HealthCheck))
	appMux.HandleFunc("/api/portscan", JsonMethod(appServer.PortScan))

	httpServer := &http.Server{
		Handler: appMux,
		Addr:    ":8080",
	}

	appServer.httpServer = httpServer

	return appServer
}
