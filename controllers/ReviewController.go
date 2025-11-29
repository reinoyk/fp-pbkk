package controllers

import (
	"net/http"

	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/initializers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/models"
	"github.com/gin-gonic/gin"
)

// To Create Review Handles
func CreateReview(c *gin.Context) {
	var body struct {
		Rating  float64 `json:"rating" binding:"required"`
		Comment string  `json:"comment" binding:"required"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	} 
	
	// Get Novel ID from URL parameter
	novelID := c.Param("novelID")
	var novel models.Novel
	if result := initializers.DB.First(&novel, novelID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Novel not found"})
		return
	}

	// Get User from context
	userCtx, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := userCtx.(models.User)

	review := models.Review{
		Rating:  body.Rating,
		Comment: body.Comment,
		NovelID: novel.ID,
		UserID:  user.ID,
	}
	if result := initializers.DB.Create(&review); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"review": review})
}

// To Get All Reviews for a Novel
func GetReviewsByNovel(c *gin.Context) {
	novelID := c.Param("novelID")
	var reviews []models.Review

	if result := initializers.DB.Where("novel_id = ?", novelID).Preload("User").Find(&reviews); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

// To Get a Specific Review by ID
func GetReviewByID(c *gin.Context) {
	reviewID := c.Param("reviewID")
	var review models.Review

	if result := initializers.DB.First(&review, reviewID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"review": review})
}

func UpdateReview(c *gin.Context) {
	reviewID := c.Param("reviewID")
	var body struct {
		Rating  float64 `json:"rating"`
		Comment string  `json:"comment"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var review models.Review
	if result := initializers.DB.First(&review, reviewID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	// Check user authorization
	userCtx, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser := userCtx.(models.User)

	// Only the author of the review or an admin can update the review
	if review.UserID != currentUser.ID && currentUser.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to update this review"})
		return
	}

	// Update fields
	review.Rating = body.Rating
	review.Comment = body.Comment

	if result := initializers.DB.Model(&review).Updates(review); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"review": review})
}

// To Delete a Review by ID
func DeleteReview(c *gin.Context) {
	reviewID := c.Param("reviewID")

	// Check if review exists
	var review models.Review
	if result := initializers.DB.First(&review, reviewID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	
	// Check user authorization
	userCtx, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	currentUser := userCtx.(models.User)

	// Only the author of the review or an admin can update the review
	if review.UserID != currentUser.ID && currentUser.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to update this review"})
		return
	}

	if result := initializers.DB.Delete(&review); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}	

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}