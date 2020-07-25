package main

import (
	"flag"
	"fmt"
	"os"
)

const (
	version = "4.0.0-alpha"
)

func parseFlag() string {
	var h, v bool
	var filename string

	flag.BoolVar(&h, "h", false, "list help")
	flag.BoolVar(&v, "v", false, "print violet version")
	flag.StringVar(&filename, "c", "", "set configuration `file`")
	flag.Parse()

	if h {
		printUsage()
		os.Exit(0)
	} else if v {
		printVersion()
		os.Exit(0)
	}
	return filename
}

func printUsage() {
	printVersion()
	_, _ = fmt.Fprintf(flag.CommandLine.Output(), "Usage: violet [-hv] [-c filename]\n\nOptions:\n")
	flag.PrintDefaults()
}

func printVersion() {
	_, _ = fmt.Fprintf(flag.CommandLine.Output(), "Version: Violet/%s, powered by XMatrixStudio\n", version)
}
