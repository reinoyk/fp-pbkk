package controllers

import (
	"net/http"
	"strconv"

	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/initializers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/models"
	"github.com/gin-gonic/gin"
)

// Capitalized (Exported) so routes can see it
func CreateNovel(c *gin.Context) {
	var body struct {
		Title         string  `json:"title" binding:"required"`
		Author        string  `json:"author" binding:"required"`
		Rating        float64 `json:"rating" binding:"required"`
		Language      string  `json:"language" binding:"required"`
		YearPublished int     `json:"year_published" binding:"required"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	novel := models.Novel{
		Title:         body.Title,
		Author:        body.Author,
		Rating:        body.Rating,
		Language:      body.Language,
		YearPublished: body.YearPublished,
	}

	if result := initializers.DB.Create(&novel); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"novel": novel}) // Use 201 Created for new items
}

func GetAllNovels(c *gin.Context) {
	var novels []models.Novel
	query := initializers.DB.Model(&models.Novel{})

	// Filtering
	if title := c.Query("title"); title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}
	if author := c.Query("author"); author != "" {
		query = query.Where("author LIKE ?", "%"+author+"%")
	}
	if language := c.Query("language"); language != "" {
		query = query.Where("language = ?", language)
	}
	if year := c.Query("year_published"); year != "" {
		if yearInt, err := strconv.Atoi(year); err == nil {
			query = query.Where("year_published = ?", yearInt)
		}
	}

	if err := query.Find(&novels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"novels": novels})
}

func GetNovelByID(c *gin.Context) {
	id := c.Param("id")
	var novel models.Novel

	if err := initializers.DB.First(&novel, id).Error; err != nil {
		// Use 404 for Not Found
		c.JSON(http.StatusNotFound, gin.H{"error": "Novel not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"novel": novel})
}

func UpdateNovel(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Title         string   `json:"title"`
		Author        string   `json:"author"`
		Rating        *float64 `json:"rating"` // Pointer to handle 0 values
		Language      string   `json:"language"`
		YearPublished *int     `json:"year_published"` // Pointer to handle 0 values
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var novel models.Novel
	if result := initializers.DB.First(&novel, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Novel not found"})
		return
	}

	updates := make(map[string]interface{})

	if body.Title != "" {
		updates["title"] = body.Title
	}
	if body.Author != "" {
		updates["author"] = body.Author
	}
	// Check if pointer is not nil (meaning user explicitly sent a value)
	if body.Rating != nil {
		updates["rating"] = *body.Rating
	}
	if body.Language != "" {
		updates["language"] = body.Language
	}
	if body.YearPublished != nil {
		updates["year_published"] = *body.YearPublished
	}

	if result := initializers.DB.Model(&novel).Updates(updates); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"novel": novel})
}

func RemoveNovel(c *gin.Context) {
	id := c.Param("id")
	var novel models.Novel
	if result := initializers.DB.First(&novel, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Novel not found"})
		return
	}
	if result := initializers.DB.Delete(&novel); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Novel deleted successfully"})
}
