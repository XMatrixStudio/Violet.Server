package cryptos

import (
	"crypto/md5"
	"crypto/sha512"
	"encoding/hex"
)

func MD5(data string) string {
	sum := md5.Sum([]byte(data))
	return hex.EncodeToString(sum[:])
}

func Sha512(data string) string {
	sum := sha512.Sum512([]byte(data))
	return hex.EncodeToString(sum[:])
}
