package validates

type Validator interface {
	Result() bool
}

type I struct {
	V Validator
	E error
}

func Assert(items ...I) error {
	for _, item := range items {
		if !item.V.Result() {
			return item.E
		}
	}
	return nil
}
