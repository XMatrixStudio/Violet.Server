package main

import (
	"fmt"

	"github.com/xmatrixstudio/violet.server/app"
	"github.com/xmatrixstudio/violet.server/app/config"
)

func main() {
	parseFlag()
	cfg, err := config.ReadConfigFromFile(getConfigFilename())
	if err != nil {
		panic(err)
	}

	r := app.NewEngine(cfg)
	err = r.Run(fmt.Sprintf(":%d", cfg.App.Port))
	if err != nil {
		panic(err)
	}
}
