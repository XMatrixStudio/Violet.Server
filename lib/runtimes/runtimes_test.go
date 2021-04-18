package runtimes_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	. "github.com/xmatrixstudio/violet.server/lib/runtimes"
)

func testFn1()       {}
func testFn2(int64)  {}
func testFn3() error { return nil }

func TestGetFuncFullName(t *testing.T) {
	var testCases = []struct {
		input    interface{}
		expected string
	}{
		{input: testFn1, expected: "github.com/xmatrixstudio/violet.server/lib/runtimes_test.testFn1"},
		{input: testFn2, expected: "github.com/xmatrixstudio/violet.server/lib/runtimes_test.testFn2"},
		{input: testFn3, expected: "github.com/xmatrixstudio/violet.server/lib/runtimes_test.testFn3"},
	}

	v := assert.New(t)
	for _, testCase := range testCases {
		v.Equal(testCase.expected, GetFuncFullName(testCase.input), testCase)
	}
}

func TestGetFuncShortName(t *testing.T) {
	var testCases = []struct {
		input    interface{}
		expected string
	}{
		{input: testFn1, expected: "testFn1"},
		{input: testFn2, expected: "testFn2"},
		{input: testFn3, expected: "testFn3"},
	}

	v := assert.New(t)
	for _, testCase := range testCases {
		v.Equal(testCase.expected, GetFuncShortName(testCase.input), testCase)
	}
}
