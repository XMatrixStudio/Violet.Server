package repos

import (
	"context"

	"github.com/xmatrixstudio/violet.server/app/dal/entity"
	"github.com/xmatrixstudio/violet.server/app/dal/stores"
)

type UserRepository interface {
	FindOne(ctx context.Context, user entity.User) (*entity.User, error)
	Save(ctx context.Context, user *entity.User) error
}

func NewUserRepository() UserRepository {
	return stores.UserMySQLStore
}
