package config

import (
	"io/ioutil"

	"gopkg.in/yaml.v3"
)

type Config struct {
	App   *AppConfig   `yaml:"app"`
	Redis *RedisConfig `yaml:"redis"`
}

type AppConfig struct {
	Env  string `yaml:"env"`
	Port int    `yaml:"port"`
}

type RedisConfig struct {
	Host          string `yaml:"host"`
	Port          string `yaml:"port"`
	Password      string `yaml:"password"`
	SessionSecret string `yaml:"sessionSecret"`
}

var defaultConfig = newDefaultConfig()

func NewConfig(path string) *Config {
	if path == "" {
		return defaultConfig
	}
	bytes, err := ioutil.ReadFile(path)
	if err != nil {
		panic(err)
	}
	config := &Config{}
	err = yaml.Unmarshal(bytes, config)
	if err != nil {
		panic(err)
	}
	return config
}

func newDefaultConfig() *Config {
	return &Config{
		App:   &AppConfig{Env: "prod", Port: 3000},
		Redis: &RedisConfig{Host: "127.0.0.1", Port: "6379", Password: ""},
	}
}
