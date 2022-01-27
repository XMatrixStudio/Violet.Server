package main

import (
	"text/template"
	"unicode"

	"github.com/xmatrixstudio/violet.server/lib/runtimes"
)

func TemplateFuncMap() template.FuncMap {
	funcMap := make(template.FuncMap)
	funcList := []interface{}{
		ExternalName,
		InternalName,
		IsEmptyType,
	}
	for _, fn := range funcList {
		funcMap[runtimes.GetFuncShortName(fn)] = fn
	}
	return funcMap
}

// ExternalName 导出标识符
func ExternalName(name string) string {
	if name == "" {
		return ""
	}
	return string(unicode.ToUpper(rune(name[0]))) + name[1:]
}

// InternalName 包内标识符
func InternalName(name string) string {
	if name == "" {
		return ""
	}
	return string(unicode.ToLower(rune(name[0]))) + name[1:]
}

// IsEmptyType 是否 Protobuf 预设的空类型
func IsEmptyType(path, name string) bool {
	return path == "google.golang.org/protobuf/types/known/emptypb" && name == "Empty"
}
