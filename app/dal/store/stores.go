package store

import (
	"context"

	"github.com/xmatrixstudio/violet.server/app/config"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

var (
	UserStore IUserStore
)

func InitStores(ctx context.Context, cfg config.Config) {
	var err error
	UserStore, err = newUserMySQLStore(cfg.MySQL)
	if err != nil {
		logs.Fatal(ctx, "newUserMySqlStore fail", zap.Error(err))
	}
}
