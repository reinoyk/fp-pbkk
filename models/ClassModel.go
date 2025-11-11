package models

type Class struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ClassName string `gorm:"size:255" json:"class_name"`
	ClassCode string `gorm:"size:100;unique" json:"class_code"`
	Users      []*User `gorm:"many2many:user_classes;" json:"users"`
}
