package main

import "github.com/xmatrixstudio/violet.server/app/router"

func main() {
	filename := parseFlag()
	r := router.New(filename)
	_ = r.Run(":80")
}
