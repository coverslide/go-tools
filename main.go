package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"

	"tools/web"
)

type Config struct {
	ServerAddr string `json:"serverAddr"`
}

var DefaultConfig = Config{
	ServerAddr: ":8080",
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

func readConfig(configFilePath string) (conf Config, err error) {
	configFile, err := os.Open(configFilePath)
	if err != nil {
		if !os.IsNotExist(err) {
			return conf, fmt.Errorf("error opening config file %q: %w", configFilePath, err)
		}
		return DefaultConfig, nil
	}
	defer configFile.Close()
	err = json.NewDecoder(configFile).Decode(&conf)
	return conf, nil
}

func main() {
	configFlag := flag.String("config", "config.json", "path to config file")
	conf, err := readConfig(*configFlag)
	if err != nil {
		panic(err)
	}

	mux := http.NewServeMux()
	mux.Handle("/", rootPath("dist", http.FileServer(http.FS(web.FS))))

	server := http.Server{
		Addr:    conf.ServerAddr,
		Handler: mux,
	}

	err = server.ListenAndServe()
	if err != nil {
		panic(fmt.Errorf("error starting service: %w", err))
	}
}
