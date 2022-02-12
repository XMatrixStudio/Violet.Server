package configs

import (
	"os"

	"github.com/go-playground/validator/v10"
	"gopkg.in/yaml.v2"
)

type Config struct {
	App   AppConfig   `yaml:"app"`
	Email EmailConfig `yaml:"email"`
	MySQL MySQLConfig `yaml:"mysql"`
	Redis RedisConfig `yaml:"redis"`
}

type AppConfig struct {
	Env     string `yaml:"env"     validate:"oneof=dev prod test"`
	Port    uint16 `yaml:"port"    validate:"required"`
	LogPath string `yaml:"logPath" validate:"required"`
}

type EmailConfig struct {
	Host     string `yaml:"host"     validate:"hostname_rfc1123"`
	Port     uint16 `yaml:"port"     validate:"required"`
	User     string `yaml:"user"     validate:"email"`
	Password string `yaml:"password" validate:"required"`
	AuthUser string `yaml:"authUser" validate:"email"`
}

type MySQLConfig struct {
	Host     string `yaml:"host"     validate:"hostname_rfc1123"`
	Port     uint16 `yaml:"port"     validate:"required"`
	DBName   string `yaml:"dbName"   validate:"required"`
	User     string `yaml:"user"     validate:"required"`
	Password string `yaml:"password" validate:"required"`
}
type RedisConfig struct {
	Host          string `yaml:"host"          validate:"hostname_rfc1123"`
	Port          uint16 `yaml:"port"          validate:"required"`
	Password      string `yaml:"password"      validate:"required"`
	SessionSecret string `yaml:"sessionSecret" validate:"required"`
}

func ReadConfigFromFile(filepath string) (Config, error) {
	cfg := getDefaultConfig()
	if filepath != "" {
		bytes, err := os.ReadFile(filepath)
		if err != nil {
			return Config{}, err
		}
		if err = yaml.Unmarshal(bytes, &cfg); err != nil {
			return Config{}, err
		}
	}

	validate := validator.New()
	if err := validate.Struct(cfg); err != nil {
		return Config{}, err
	}

	return cfg, nil
}

func getDefaultConfig() Config {
	return Config{
		App:   AppConfig{Env: "prod", Port: 3000, LogPath: "./log"},
		Email: EmailConfig{Host: "127.0.0.1", Port: 25, User: "admin@example.com", Password: "my_password", AuthUser: "oauth@example.com"},
		MySQL: MySQLConfig{Host: "127.0.0.1", Port: 3306, DBName: "violet", User: "admin", Password: "my_password"},
		Redis: RedisConfig{Host: "127.0.0.1", Port: 6379, Password: "my_password", SessionSecret: "my_secret"},
	}
}
