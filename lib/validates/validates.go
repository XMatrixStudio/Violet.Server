package validates

const (
	NotNil = 1 << iota
	NotZeroValue

	Nothing = 0
)

type Validator interface {
	Validate() bool
}
