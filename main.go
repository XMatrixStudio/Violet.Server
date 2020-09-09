package main

import (
	"fmt"

	"github.com/xmatrixstudio/violet.server/app"
	"github.com/xmatrixstudio/violet.server/app/config"
)

func main() {
	filename := parseFlag()
	c := config.NewConfig(filename)
	r := app.New(c)
	_ = r.Run(fmt.Sprintf(":%v", c.App.Port))
}
