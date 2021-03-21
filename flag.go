package main

import (
	"flag"
	"fmt"
	"os"
)

const (
	version = "4.0.0-alpha"
)

var (
	cfgFilename string
)

func getConfigFilename() string {
	return cfgFilename
}

func parseFlag() {
	var h, v bool

	flag.BoolVar(&h, "h", false, "list help")
	flag.BoolVar(&v, "v", false, "print violet version")
	flag.StringVar(&cfgFilename, "c", "", "set configuration `file`")
	flag.Parse()

	if h {
		printUsage()
		os.Exit(0)
	} else if v {
		printVersion()
		os.Exit(0)
	}
}

func printUsage() {
	printVersion()
	_, _ = fmt.Fprintf(flag.CommandLine.Output(), "Usage: violet [-hv] [-c filename]\n\nOptions:\n")
	flag.PrintDefaults()
}

func printVersion() {
	_, _ = fmt.Fprintf(flag.CommandLine.Output(), "Version: XMatrix Violet/%s, powered by XMatrixStudio\n", version)
}
