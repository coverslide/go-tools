package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"tools/internal/config"
	"tools/web"
)

type AppServer struct {
	httpServer *http.Server
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

func (a *AppServer) Heartbeat(req requestWrapper[NullType]) (g GenericResponse, err error) {
	g.Success = true
	return g, err
}

func (a *AppServer) ListenAndServe() error {
	return a.httpServer.ListenAndServe()
}

func rootPath(staticDir string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			r.URL.Path = fmt.Sprintf("/%s/", staticDir)
		} else {
			b := strings.Split(r.URL.Path, "/")[0]
			if b != staticDir {
				r.URL.Path = fmt.Sprintf("/%s%s", staticDir, r.URL.Path)
			}
		}
		h.ServeHTTP(w, r)
	})
}

func NewServer(conf config.Config) *AppServer {

	appServer := &AppServer{}

	mux := http.NewServeMux()
	mux.Handle("/", rootPath("dist", http.FileServer(http.FS(web.FS))))

	mux.HandleFunc("/api/heartbeat", JsonMethod(appServer.Heartbeat))

	httpServer := &http.Server{
		Handler: mux,
		Addr:    ":8080",
	}
	appServer.httpServer = httpServer

	return appServer
}
