package config

import (
	"io/ioutil"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Redis *RedisConfig `yaml:"redis"`
}

type RedisConfig struct {
	Host     string `yaml:"host"`
	Port     string `yaml:"port"`
	Password string `yaml:"password"`
	DB       int    `yaml:"db"`
}

func NewConfig(path string) *Config {
	if path == "" {
		return newDefaultConfig()
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
		Redis: &RedisConfig{Host: "127.0.0.1", Port: "6379", Password: "", DB: 0},
	}
}
