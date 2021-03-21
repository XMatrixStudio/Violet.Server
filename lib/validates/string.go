package validates

import (
	"regexp"

	"github.com/xmatrixstudio/violet.server/lib/slices"
)

var (
	emailRegexString = "^(?:(?:(?:(?:[a-zA-Z]|\\d|[!#\\$%&'\\*\\+\\-\\/=\\?\\^_`{\\|}~]|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])+(?:\\.([a-zA-Z]|\\d|[!#\\$%&'\\*\\+\\-\\/=\\?\\^_`{\\|}~]|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])+)*)|(?:(?:\\x22)(?:(?:(?:(?:\\x20|\\x09)*(?:\\x0d\\x0a))?(?:\\x20|\\x09)+)?(?:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f]|\\x21|[\\x23-\\x5b]|[\\x5d-\\x7e]|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])|(?:(?:[\\x01-\\x09\\x0b\\x0c\\x0d-\\x7f]|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}]))))*(?:(?:(?:\\x20|\\x09)*(?:\\x0d\\x0a))?(\\x20|\\x09)+)?(?:\\x22))))@(?:(?:(?:[a-zA-Z]|\\d|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])|(?:(?:[a-zA-Z]|\\d|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])(?:[a-zA-Z]|\\d|-|\\.|~|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])*(?:[a-zA-Z]|\\d|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])))\\.)+(?:(?:[a-zA-Z]|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])|(?:(?:[a-zA-Z]|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])(?:[a-zA-Z]|\\d|-|\\.|~|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])*(?:[a-zA-Z]|[\\x{00A0}-\\x{D7FF}\\x{F900}-\\x{FDCF}\\x{FDF0}-\\x{FFEF}])))\\.?$"
	hexRegexString   = "^(0[xX])?[0-9a-fA-F]+$"
)

var (
	emailRegex = regexp.MustCompile(emailRegexString)
	hexRegex   = regexp.MustCompile(hexRegexString)
)

type StringValidator struct {
	val string
	res bool
}

func NewStringValidator(val string) *StringValidator {
	return &StringValidator{val: val, res: true}
}

func (v *StringValidator) Result() bool {
	return v.res
}

func (v *StringValidator) MustEmail() *StringValidator {
	v.res = v.res && emailRegex.MatchString(v.val)
	return v
}

func (v *StringValidator) MustHex() *StringValidator {
	v.res = v.res && hexRegex.MatchString(v.val)
	return v
}

func (v *StringValidator) MustIn(enums []string) *StringValidator {
	v.res = v.res && slices.StringIn(v.val, enums)
	return v
}

func (v *StringValidator) MustLen(min, max int) *StringValidator {
	v.res = v.res && len(v.val) >= min && len(v.val) <= max
	return v
}

func (v *StringValidator) MustMatch(pattern string) *StringValidator {
	v.res = v.res && regexp.MustCompile(pattern).MatchString(v.val)
	return v
}

func (v *StringValidator) MustNotEmpty() *StringValidator {
	v.res = v.res && v.val != ""
	return v
}
