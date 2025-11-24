package controllers

import (
	"net/http"

	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/initializers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Helper function to get the current user from context
func getUserFromContext(c *gin.Context) (*models.User, bool) {
	u, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return nil, false
	}

	user, ok := u.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not read user from context"})
		return nil, false
	}
	return &user, true
}

// BookmarkNovel adds a novel to the current user's bookmarks
func BookmarkNovel(c *gin.Context) {
	novelID := c.Param("novel_id")
	user, ok := getUserFromContext(c)
	if !ok {
		return
	}

	var novel models.Novel
	if result := initializers.DB.First(&novel, novelID); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Novel not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Add the association
	if err := initializers.DB.Model(user).Association("BookmarkedNovels").Append(&novel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not add bookmark"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Novel bookmarked successfully"})
}

// RemoveBookmark removes a novel from the current user's bookmarks
func RemoveBookmark(c *gin.Context) {
	novelID := c.Param("novel_id")
	user, ok := getUserFromContext(c)
	if !ok {
		return
	}

	var novel models.Novel
	if result := initializers.DB.First(&novel, novelID); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Novel not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Remove the association
	if err := initializers.DB.Model(user).Association("BookmarkedNovels").Delete(&novel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not remove bookmark"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bookmark removed successfully"})
}

// GetBookmarkedNovels retrieves all novels bookmarked by the current user
func GetBookmarkedNovels(c *gin.Context) {
	user, ok := getUserFromContext(c)
	if !ok {
		return
	}

	// Eager load the bookmarked novels for the user
	if err := initializers.DB.Preload("BookmarkedNovels").First(user, user.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch bookmarks"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookmarked_novels": user.BookmarkedNovels})
}
