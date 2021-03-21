package cryptos

import (
	"crypto/sha512"
	"encoding/hex"
)

func Sha512(data string) string {
	sum := sha512.Sum512([]byte(data))
	return hex.EncodeToString(sum[:])
}
