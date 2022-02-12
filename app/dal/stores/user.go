package stores

import (
	"context"
	"fmt"
	"time"

	"github.com/xmatrixstudio/violet.server/app/configs"
	"github.com/xmatrixstudio/violet.server/app/dal/entity"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type userMySQLStore struct {
	db      *gorm.DB
	timeout time.Duration
}

func newUserMySQLStore(cfg configs.MySQLConfig) (*userMySQLStore, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&loc=Local", cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.DBName)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	err = db.AutoMigrate(&entity.User{})
	if err != nil {
		return nil, err
	}

	return &userMySQLStore{
		db:      db,
		timeout: 200 * time.Millisecond,
	}, nil
}

func (s *userMySQLStore) FindOne(ctx context.Context, user entity.User) (*entity.User, error) {
	newCtx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()
	var newUser entity.User
	result := s.db.WithContext(newCtx).Where(&user).First(&newUser)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &newUser, nil
}

func (s *userMySQLStore) Save(ctx context.Context, user *entity.User) error {
	newCtx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()
	result := s.db.WithContext(newCtx).Save(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
