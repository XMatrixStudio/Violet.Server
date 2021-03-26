package store

import (
	"github.com/xmatrixstudio/violet.server/app/config"
	"go.uber.org/zap"
)

var (
	UserStore IUserStore
)

func InitStores(cfg config.Config) {
	var err error
	UserStore, err = newUserMySQLStore(cfg.MySQL)
	if err != nil {
		zap.L().Fatal("newUserMySqlStore fail", zap.Error(err))
	}
}
