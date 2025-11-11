package models

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"size:255" json:"name"`
	Email    string `gorm:"unique" json:"email"`
	Password string `gorm:"size:255" json:"-"`
	// add this line to establish relationship with Blog model
	Blogs   []Blog   `gorm:"foreignKey:UserID" json:"blogs"`
	Classes []*Class `gorm:"many2many:user_classes;" json:"classes"`
}
