package algorithms

import (
	"errors"

	"github.com/xmatrixstudio/violet.server/lib/cryptos"
)

type SignV1Processor struct{}

func (p *SignV1Processor) Sign(param *SignParam) (string, error) {
	if param.Salt != "" && len(param.Salt) != 64 {
		return "", errors.New("length of salt is not 64")
	}

	// 如果不存在盐，则随机生成盐
	if param.Salt == "" {
		param.Salt = cryptos.RandString(64)
	}

	signData := cryptos.Sha512(cryptos.Sha512(param.RawData) + param.Salt)
	return signData, nil
}

func (p *SignV1Processor) Valid(param *SignParam) (bool, error) {
	if len(param.Salt) != 64 {
		return false, errors.New("length of salt is not 64")
	}
	data := cryptos.Sha512(cryptos.Sha512(param.RawData) + param.Salt)
	return data == param.SignData, nil
}
