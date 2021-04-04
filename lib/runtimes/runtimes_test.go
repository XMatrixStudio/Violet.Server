package runtimes_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	. "github.com/xmatrixstudio/violet.server/lib/runtimes"
)

func testFn1()           {}
func testFn2(data int64) {}
func testFn3() error     { return nil }

func TestGetFuncFullName(t *testing.T) {
	v := assert.New(t)
	v.Equal("github.com/xmatrixstudio/violet.server/lib/runtimes_test.testFn1", GetFuncFullName(testFn1))
	v.Equal("github.com/xmatrixstudio/violet.server/lib/runtimes_test.testFn2", GetFuncFullName(testFn2))
	v.Equal("github.com/xmatrixstudio/violet.server/lib/runtimes_test.testFn3", GetFuncFullName(testFn3))
}

func TestGetFuncShortName(t *testing.T) {
	v := assert.New(t)
	v.Equal("testFn1", GetFuncShortName(testFn1))
	v.Equal("testFn2", GetFuncShortName(testFn2))
	v.Equal("testFn3", GetFuncShortName(testFn3))
}
