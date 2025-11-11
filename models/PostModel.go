package models

import (
	"gorm.io/gorm"
)

type Blog struct {
	gorm.Model
	Title   string
	Content string
	UserID  uint
	// add this line to establish relationship with User model
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
