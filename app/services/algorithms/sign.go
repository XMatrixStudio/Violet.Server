package algorithms

type SignProcessor interface {
	Sign(param *SignParam) (string, error)
	Valid(param *SignParam) (bool, error)
}

type SignParam struct {
	RawData  string // 原始数据
	SignData string // 签名数据，用于校验
	Salt     string // 哈希盐，v1 使用
}

func NewSignProcessor(name string) SignProcessor {
	switch name {
	case "v1":
		return &SignV1Processor{}
	}
	return nil
}
