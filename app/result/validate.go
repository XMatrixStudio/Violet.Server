package result

import "github.com/xmatrixstudio/violet.server/lib/validates"

type AssertItem struct {
	Validator validates.Validator
	Err       error
}

func Assert(items ...AssertItem) error {
	for _, item := range items {
		if !item.Validator.Validate() {
			return item.Err
		}
	}
	return nil
}
