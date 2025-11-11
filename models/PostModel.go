package models

import (
	"gorm.io/gorm"
)

type Blog struct {
	gorm.Model
	Title   string
	Content string
	UserID  uint
	User    *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
