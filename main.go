package main

import "github.com/xmatrixstudio/violet.server/app/router"

func main() {
	r := router.New()
	_ = r.Run(":80")
}
