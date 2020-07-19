package inject

import (
	"fmt"
	"reflect"
)

func New() *Injector {
	return &Injector{
		objs: make(map[string]reflect.Value),
	}
}

type Injector struct {
	objs map[string]reflect.Value
}

func (ij *Injector) Inject(obj interface{}) interface{} {
	return ij.inject(reflect.ValueOf(obj)).Interface()
}

func (ij *Injector) Register(obj interface{}) {
	value := reflect.ValueOf(obj)
	name := value.Type().String()
	if _, ok := ij.objs[name]; ok {
		panic(fmt.Sprintf("inject.Injector.Register: name '%s' already exist", name))
	}
	ij.objs[name] = value
}

func (ij *Injector) inject(value reflect.Value) reflect.Value {
	isPtr := false
	if value.Kind() == reflect.Ptr {
		value = value.Elem()
		isPtr = true
	}
	for i := 0; i < value.NumField(); i++ {
		if _, ok := value.Type().Field(i).Tag.Lookup("inject"); ok {
			field := value.Field(i)
			if field.CanSet() {
				if obj, ok := ij.objs[field.Type().String()]; ok {
					field.Set(obj)
				} else {
					if field.Kind() == reflect.Ptr {
						field.Set(ij.inject(reflect.New(field.Type().Elem())))
					} else {
						field.Set(ij.inject(field))
					}
				}
			}
		}
	}
	if isPtr {
		return value.Addr()
	} else {
		return value
	}
}
