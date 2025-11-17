package models

// User struct represents the user entity
type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"size:255" json:"name"`
	Email    string `gorm:"unique" json:"email"`
	Password string `gorm:"size:255" json:"-"`
	// add this line to establish relationship with Blog model
	BookmarkedNovels []*Novel `gorm:"many2many:user_bookmarks;" json:"bookmarked_novels"`
}
