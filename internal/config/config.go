package config

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	ServerAddr string `json:"serverAddr"`
}

var DefaultConfig = Config{
	ServerAddr: ":8080",
}

func ReadConfig(configFilePath string) (conf Config, err error) {
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
