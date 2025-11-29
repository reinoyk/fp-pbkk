package models

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	Rating  float64    `json:"rating"`
	Comment string `json:"comment"`

	// Foreign Keys
	UserID  uint `json:"user_id"`
	NovelID uint `json:"novel_id"`

	// Associations (Agar bisa preload data User dan Novel)
	User  User  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user"`
	Novel Novel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}