package validates

import (
	"errors"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Item struct {
	value interface{}
	err   error
	rules []validation.Rule
}

func Assert(items ...Item) error {
	for _, item := range items {
		if item.err == nil {
			return errors.New("assert item err is nil")
		}

		err := validation.Validate(item.value, item.rules...)
		if err != nil {
			return item.err
		}
	}
	return nil
}

func MakeItem(value interface{}, err error, rules ...validation.Rule) Item {
	return Item{value: value, err: err, rules: rules}
}
