package main

import (
	_ "embed"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"text/template"
	"unicode"

	"github.com/xmatrixstudio/violet.server/app/http_gen/baseapi"
	"github.com/xmatrixstudio/violet.server/lib/slices"
	"google.golang.org/protobuf/compiler/protogen"
	"google.golang.org/protobuf/proto"
)

//go:embed gen.service.go.tpl
var serviceTplText string

var serviceDefaultImports = []string{
	"github.com/gin-gonic/gin",
	"github.com/xmatrixstudio/violet.server/app/api",
}

var serviceExcludeImports = []string{
	"google.golang.org/protobuf/types/known/emptypb",
}

// ServiceGenerator 服务生成器
type ServiceGenerator struct {
	Plugin  *protogen.Plugin   // 相关插件
	File    *protogen.File     // 相关文件
	Service *protogen.Service  // 相关服务
	Methods []*protogen.Method // 相关方法

	Template *template.Template // 代码生成模板
	Param    *ServiceParam      // 代码生成参数
}

type ServiceParam struct {
	BaseParam      BaseParam     // 通参
	PackageName    string        // 包名
	PackagePath    string        // 包路径
	PackageImports []string      // 包依赖
	ServiceName    string        //服务名
	ServiceMethods []MethodParam // 服务方法列表
}

type MethodParam struct {
	Name            string // 方法名
	Method          string // 方法类型
	URL             string // 方法路径
	Description     string // 方法描述
	RequestName     string // 请求数据结构名
	RequestPackage  string // 请求数据结构包名
	RequestPath     string // 请求数据结构包路径
	ResponseName    string // 响应数据结构名
	ResponsePackage string // 响应数据结构包名
	ResponsePath    string // 响应数据结构包路径
}

func NewServiceGenerator(baseParam BaseParam, plugin *protogen.Plugin, file *protogen.File) (*ServiceGenerator, error) {
	// 校验参数
	if len(file.Services) == 0 {
		return nil, fmt.Errorf("file %s has no service", file.Desc.Path())
	} else if len(file.Services) > 1 {
		return nil, fmt.Errorf("file %s has more than one servicec", file.Desc.Path())
	}

	// 构建模板
	serviceTemplate, err := template.New("service").Funcs(TemplateFuncMap()).Parse(serviceTplText)
	if err != nil {
		return nil, fmt.Errorf("parse service template fail: %s", err.Error())
	}

	gen := &ServiceGenerator{
		Plugin:   plugin,
		File:     file,
		Service:  file.Services[0],
		Methods:  file.Services[0].Methods,
		Template: serviceTemplate,
		Param: &ServiceParam{
			BaseParam: baseParam,
		},
	}
	return gen, nil
}

func (gen *ServiceGenerator) Generate() error {
	var err error

	// 准备数据
	if err = gen.makeParam(); err != nil {
		return err
	}

	// 生成数据
	filename := fmt.Sprintf("%s/service.gin.go", string(gen.Param.PackagePath[strings.LastIndexByte(gen.Param.PackagePath, '/')+1:]))
	g := gen.Plugin.NewGeneratedFile(filename, protogen.GoImportPath(gen.Param.PackagePath))
	if err = gen.Template.Execute(g, gen.Param); err != nil {
		return err
	}

	return nil
}

func (gen *ServiceGenerator) makeParam() error {
	file := gen.File
	service := gen.Service
	methods := gen.Methods
	param := gen.Param

	// ServiceName: 服务名
	// 1. 如果服务名以 Service 结尾，则去除 Service 字符，仅保留前缀
	// 2. 服务名不得为空或为 Service
	// 3. 服务名首字母为大写
	if strings.HasSuffix(service.GoName, "Service") {
		param.ServiceName = service.GoName[:len(service.GoName)-len("Service")]
	} else {
		param.ServiceName = service.GoName
	}
	if param.ServiceName == "" {
		return errors.New("service can not be named 'Service' or empty")
	} else if !unicode.IsUpper(rune(param.ServiceName[0])) {
		return fmt.Errorf("service first letter must be upper: %s", service.GoName)
	}

	// ServiceMethods: 服务方法
	// 1. 方法必须指定 HttpRule
	// 2. 如果方法的 input 和 output 为 proto 的 empty，则不导出该变量信息
	// 3. 方法列表按 Name 的字典序排序
	for _, method := range methods {
		// 获取 HttpRule
		rule, ok := proto.GetExtension(method.Desc.Options(), baseapi.E_Http).(*baseapi.HttpRule)
		if !ok || rule == nil {
			return fmt.Errorf("method %s doesn't define http rule info", method.GoName)
		}
		param.ServiceMethods = append(param.ServiceMethods, gen.getMethodParam(method, rule))
	}
	sort.SliceStable(param.ServiceMethods, func(i, j int) bool {
		return param.ServiceMethods[i].Name < param.ServiceMethods[j].Name
	})

	// PackageName: 包名
	param.PackageName = string(file.GoPackageName)

	// PackagePath: 包路径
	param.PackagePath = string(file.GoImportPath)

	// PackageImports: 包依赖
	for _, method := range param.ServiceMethods {
		param.PackageImports = append(param.PackageImports, method.RequestPath)
		param.PackageImports = append(param.PackageImports, method.ResponsePath)
	}
	param.PackageImports = append(param.PackageImports, serviceDefaultImports...)
	param.PackageImports = slices.DistinctString(param.PackageImports)
	for _, excludeImport := range append([]string{param.PackagePath}, serviceExcludeImports...) {
		param.PackageImports = slices.ExcludeString(param.PackageImports, excludeImport)
	}
	sort.Strings(param.PackageImports)

	return nil
}

func (gen *ServiceGenerator) getMethodParam(method *protogen.Method, rule *baseapi.HttpRule) MethodParam {
	// 获取方法基本信息
	param := MethodParam{
		Name:        method.GoName,
		Description: rule.Description,
	}

	switch pattern := rule.Pattern.(type) {
	case *baseapi.HttpRule_Get:
		param.Method = http.MethodGet
		param.URL = pattern.Get
	case *baseapi.HttpRule_Post:
		param.Method = http.MethodPost
		param.URL = pattern.Post
	case *baseapi.HttpRule_Put:
		param.Method = http.MethodPut
		param.URL = pattern.Put
	case *baseapi.HttpRule_Patch:
		param.Method = http.MethodPatch
		param.URL = pattern.Patch
	case *baseapi.HttpRule_Delete:
		param.Method = http.MethodDelete
		param.URL = pattern.Delete
	case *baseapi.HttpRule_Custom:
		param.Method = pattern.Custom.Method
		param.URL = pattern.Custom.Path
	}

	// 获取方法输入输出信息
	param.RequestName = method.Input.GoIdent.GoName
	param.RequestPath = string(method.Input.GoIdent.GoImportPath)
	param.RequestPackage = param.RequestPath[strings.LastIndexByte(param.RequestPath, '/')+1:]

	param.ResponseName = method.Output.GoIdent.GoName
	param.ResponsePath = string(method.Output.GoIdent.GoImportPath)
	param.ResponsePackage = param.ResponsePath[strings.LastIndexByte(param.ResponsePath, '/')+1:]

	return param
}
