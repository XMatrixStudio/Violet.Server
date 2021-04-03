package entity

import "gorm.io/gorm"

type User struct {
	ID         int64 `gorm:"primaryKey"`
	CreateTime int64 `gorm:"autoCreateTime"`
	UpdateTime int64 `gorm:"autoUpdateTime"`
	DeleteTime gorm.DeletedAt

	Email        string `gorm:"index;unique"`
	Password     string
	PasswordSalt string
	Role         UserRole
}

type UserRole int16

const (
	UserRoleBanned    UserRole = -1
	UserRoleGeneral   UserRole = 1
	UserRoleDeveloper UserRole = 2
	UserRoleAdmin     UserRole = 99
)
