package main

import (
	"flag"
	"fmt"

	"google.golang.org/protobuf/compiler/protogen"
	"google.golang.org/protobuf/types/pluginpb"
)

const (
	Version = "0.0.1"
)

type BaseParam struct {
	Version string
}

type Generator interface {
	Generate() error
}

func main() {
	var flags flag.FlagSet
	opts := protogen.Options{
		ParamFunc: flags.Set,
	}
	baseParam := BaseParam{
		Version: Version,
	}

	opts.Run(func(plugin *protogen.Plugin) error {
		plugin.SupportedFeatures = uint64(pluginpb.CodeGeneratorResponse_FEATURE_PROTO3_OPTIONAL)
		for _, file := range plugin.Files {
			if len(file.Services) == 0 {
				continue
			}

			gen, err := NewServiceGenerator(baseParam, plugin, file)
			if err != nil {
				return fmt.Errorf("new service generator error: %s", err.Error())
			}
			err = gen.Generate()
			if err != nil {
				return fmt.Errorf("generator Generate error: %s", err.Error())
			}
		}
		return nil
	})
}
