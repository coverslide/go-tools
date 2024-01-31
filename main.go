package main

import (
	"flag"
	"fmt"
	"net/http"
	"strings"

	"tools/internal/config"
	"tools/internal/server"
)

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

func main() {
	configFlag := flag.String("config", "config.json", "path to config file")

	conf, err := config.ReadConfig(*configFlag)
	if err != nil {
		panic(err)
	}

	server := server.NewServer(conf)

	err = server.ListenAndServe()
	if err != nil {
		panic(fmt.Errorf("error starting service: %w", err))
	}
}
