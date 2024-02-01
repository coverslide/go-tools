package main

import (
	"flag"
	"fmt"

	"tools/internal/config"
	"tools/internal/server"
)

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
