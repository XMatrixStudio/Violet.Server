package stores

import (
	"github.com/xmatrixstudio/violet.server/app/configs"
	"go.uber.org/zap"
)

var (
	UserMySQLStore *userMySQLStore
)

func InitStores(cfg configs.Config) {
	var err error
	UserMySQLStore, err = newUserMySQLStore(cfg.MySQL)
	if err != nil {
		zap.L().Fatal("newUserMySqlStore fail", zap.Error(err))
	}
}
