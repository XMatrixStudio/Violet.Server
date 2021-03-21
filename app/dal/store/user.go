package store

import (
	"context"
	"fmt"
	"time"

	"github.com/xmatrixstudio/violet.server/app/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type IUserStore interface {
	Create(ctx context.Context, user *User) error
	Delete(ctx context.Context, id int64) error
	FindOne(ctx context.Context, user User) (*User, error)
	Update(ctx context.Context, user *User) error
}

type User struct {
	ID         int64 `gorm:"primaryKey"`
	CreateTime int64 `gorm:"autoCreateTime"`
	UpdateTime int64 `gorm:"autoUpdateTime"`
	DeleteTime gorm.DeletedAt

	Email        string `gorm:"index;unique"`
	Password     string
	PasswordSalt string
}

type userMySQLStore struct {
	db      *gorm.DB
	timeout time.Duration
}

func newUserMySQLStore(cfg config.MySQLConfig) (IUserStore, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&loc=Local", cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.DBName)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	err = db.AutoMigrate(&User{})
	if err != nil {
		return nil, err
	}

	return &userMySQLStore{
		db:      db,
		timeout: 200 * time.Millisecond,
	}, nil
}

func (store *userMySQLStore) Create(ctx context.Context, user *User) error {
	newCtx, cancel := context.WithTimeout(ctx, store.timeout)
	defer cancel()
	result := store.db.WithContext(newCtx).Create(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (store *userMySQLStore) Delete(ctx context.Context, id int64) error {
	newCtx, cancel := context.WithTimeout(ctx, store.timeout)
	defer cancel()
	result := store.db.WithContext(newCtx).Delete(&User{}, id)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (store *userMySQLStore) FindOne(ctx context.Context, user User) (*User, error) {
	newCtx, cancel := context.WithTimeout(ctx, store.timeout)
	defer cancel()
	var newUser User
	result := store.db.WithContext(newCtx).Where(&user).First(&newUser)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return &newUser, result.Error
	}
	return &newUser, nil
}

func (store *userMySQLStore) Update(ctx context.Context, user *User) error {
	newCtx, cancel := context.WithTimeout(ctx, store.timeout)
	defer cancel()
	result := store.db.WithContext(newCtx).Save(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
