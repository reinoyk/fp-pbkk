package models

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"size:255" json:"name"`
	Email    string `gorm:"unique" json:"email"`
	Password string `gorm:"size:255" json:"-"`
	Role     string `gorm:"default:'user'" json:"role"`

	// add this line to establish relationship with Novel model
	BookmarkedNovels []*Novel `gorm:"many2many:user_bookmarks;" json:"bookmarked_novels"`
	Reviews          []Review `json:"reviews,omitempty"`
}
