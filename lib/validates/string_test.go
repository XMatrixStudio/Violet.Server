package validates_test

import (
	"testing"

	"github.com/stretchr/testify/suite"
	. "github.com/xmatrixstudio/violet.server/lib/validates"
)

func TestStringValidator(t *testing.T) {
	suite.Run(t, new(StringValidatorSuite))
}

type StringValidatorSuite struct {
	suite.Suite
}

func (suite *StringValidatorSuite) TestMustEmail() {
	var testCases = []struct {
		input    string
		expected bool
	}{
		{input: "a@xmatrix.studio", expected: true},
		{input: "1@xmatrix.studio", expected: true},
		{input: "a@xmatrix", expected: false},
		{input: "a@a@xmatrix.studio", expected: false},
		{input: "xmatrix.studio", expected: false},
	}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, NewStringValidator(testCase.input).MustEmail().Result(), testCase)
	}
}

func (suite *StringValidatorSuite) TestMustEmpty() {
	var testCases = []struct {
		input    string
		expected bool
	}{
		{input: "a", expected: false},
		{input: "", expected: true},
	}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, NewStringValidator(testCase.input).MustEmpty().Result(), testCase)
	}
}

func (suite *StringValidatorSuite) TestMustEqual() {
	var testCases = []struct {
		input, val string
		expected   bool
	}{
		{input: "a", val: "a", expected: true},
		{input: "", val: "", expected: true},
		{input: "a", val: "A", expected: false},
	}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, NewStringValidator(testCase.input).MustEqual(testCase.val).Result(), testCase)
	}
}

func (suite *StringValidatorSuite) TestMustHex() {
	var testCases = []struct {
		input    string
		expected bool
	}{
		{input: "1234567890abcdefABCDEF", expected: true},
		{input: "xmatrixstudio", expected: false},
		{input: "xmatrix.studio", expected: false},
	}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, NewStringValidator(testCase.input).MustHex().Result(), testCase)
	}
}

func (suite *StringValidatorSuite) TestMustIn() {
	var testCases = []struct {
		input    string
		expected bool
	}{
		{input: "xmatrix", expected: true},
		{input: "studio", expected: true},
		{input: "violet", expected: true},
		{input: "xmatrixstudio", expected: false},
		{input: "xm", expected: false},
	}
	var enums = []string{"xmatrix", "studio", "violet"}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, NewStringValidator(testCase.input).MustIn(enums).Result(), testCase)
	}
}

func (suite *StringValidatorSuite) TestMustLen() {
	var testCases = []struct {
		input          string
		minLen, maxLen int
		expected       bool
	}{
		{input: "xmatrix", minLen: 7, maxLen: 7, expected: true},
		{input: "xmatrix", minLen: 6, maxLen: 7, expected: true},
		{input: "xmatrix", minLen: 6, maxLen: 8, expected: true},
		{input: "xmatrix", minLen: 4, maxLen: 5, expected: false},
		{input: "studio", minLen: 6, maxLen: 6, expected: true},
		{input: "studio", minLen: 5, maxLen: 5, expected: false},
	}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, NewStringValidator(testCase.input).MustLen(testCase.minLen, testCase.maxLen).Result(), testCase)
	}
}

func (suite *StringValidatorSuite) TestMustMatch() {
	var testCases = []struct {
		input, pattern string
		expected       bool
	}{
		{input: "xmatrix", pattern: "xmatrix", expected: true},
		{input: "xmatrix", pattern: "matrix", expected: true},
		{input: "xmatrix", pattern: "studio", expected: false},
	}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, NewStringValidator(testCase.input).MustMatch(testCase.pattern).Result(), testCase)
	}
}

func (suite *StringValidatorSuite) TestMustNotEmpty() {
	var testCases = []struct {
		input    string
		expected bool
	}{
		{input: "a", expected: true},
		{input: "", expected: false},
	}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, NewStringValidator(testCase.input).MustNotEmpty().Result(), testCase)
	}
}

func (suite *StringValidatorSuite) TestOr() {
	var testCases = []struct {
		input    *StringValidator
		expected bool
		desc     string
	}{
		{input: NewStringValidator("xmatrix").MustNotEmpty().Or().MustEqual("xmatrix"), expected: true, desc: "true or true"},
		{input: NewStringValidator("xmatrix").MustNotEmpty().Or().MustEqual("violet"), expected: true, desc: "true or false"},
		{input: NewStringValidator("xmatrix").MustEmpty().Or().MustEqual("xmatrix"), expected: true, desc: "false or true"},
		{input: NewStringValidator("xmatrix").MustEmpty().Or().MustEqual("violet"), expected: false, desc: "false or false"},
		{input: NewStringValidator("xmatrix").MustNotEmpty().Or().MustEqual("xmatrix").Or().MustLen(7, 7),
			expected: true, desc: "true or true or true"},
		{input: NewStringValidator("xmatrix").MustEmpty().Or().MustEqual("xmatrix").Or().MustLen(6, 6),
			expected: true, desc: "false or true or false"},
		{input: NewStringValidator("xmatrix").MustEmpty().Or().MustEqual("violet").Or().MustLen(6, 6),
			expected: false, desc: "false or false or false"},
	}

	for _, testCase := range testCases {
		suite.Equal(testCase.expected, testCase.input.Result(), testCase.desc)
	}
}
