package models

type Novel struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	Title         string  `gorm:"size:255" json:"title"`
	Author        string  `gorm:"unique" json:"author"`
	Rating        float64 `gorm:"size:255" json:"rating"`
	Language      string  `gorm:"size:255" json:"language"`
	YearPublished int     `gorm:"size:255" json:"year_published"`
	// add this line to establish relationship with User model

	BookmarkedBy []*User `gorm:"many2many:user_bookmarks;" json:"-"`
}
