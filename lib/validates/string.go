package validates

import (
	"regexp"

	"github.com/xmatrixstudio/violet.server/lib/slices"
)

type StringValidator struct {
	val  string
	flag int64

	enums   []string
	pattern string
}

func NewStringValidator(val string, flag int64) *StringValidator {
	return &StringValidator{val: val, flag: flag}
}

func (validator *StringValidator) Validate() bool {
	if validator.flag&NotZeroValue != 0 && validator.val == "" {
		return false
	}
	if validator.enums != nil && !slices.StringIn(validator.val, validator.enums) {
		return false
	}
	if validator.pattern != "" && !regexp.MustCompile(validator.pattern).MatchString(validator.val) {
		return false
	}
	return true
}

func (validator *StringValidator) WithEnums(enums []string) *StringValidator {
	validator.enums = enums
	return validator
}

func (validator *StringValidator) WithPattern(pattern string) *StringValidator {
	validator.pattern = pattern
	return validator
}
