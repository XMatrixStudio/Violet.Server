package main

import (
	"fmt"

	"github.com/xmatrixstudio/violet.server/app/config"
	"github.com/xmatrixstudio/violet.server/app/router"
)

func main() {
	filename := parseFlag()
	c := config.NewConfig(filename)
	r := router.New(c)
	_ = r.Run(fmt.Sprintf(":%v", c.App.Port))
}
