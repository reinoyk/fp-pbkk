package controllers

import (
	"net/http"

	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/initializers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/models"
	"github.com/gin-gonic/gin"
)

// func Testing (c *gin.Context) {
// 		c.JSON(200, gin.H{
// 			"message": "png",
// 		})
// 	}

func CreateBlog(c *gin.Context) {
	var body struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the authenticated user from context
	u, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, ok := u.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not read user from context"})
		return
	}

	blog := models.Blog{
		Title:   body.Title,
		Content: body.Content,
		UserID:  user.ID, // Associate blog post with the authenticated user
	}

	if result := initializers.DB.Create(&blog); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"blog": blog})
}

func BlogGetAll(c *gin.Context) {
	//get all blogs
	var blogs []models.Blog
	result := initializers.DB.Preload("User").Find(&blogs)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	//return them
	c.JSON(http.StatusOK, gin.H{
		"blogs": blogs,
	})
}

func BlogGetByID(c *gin.Context) {
	//get id from url
	id := c.Param("id")

	//find the blog with the id
	var blog models.Blog

	//get the blog
	result := initializers.DB.First(&blog, id)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	//return it
	c.JSON(http.StatusOK, gin.H{
		"blog": blog,
	})
}

func BlogUpdate(c *gin.Context) {
	//get id from url
	id := c.Param("id")

	//get request body
	var body struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	//find the blog we want to update
	var blog models.Blog
	result := initializers.DB.First(&blog, id)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	//update the blog
	initializers.DB.Model(&blog).Updates(models.Blog{Title: body.Title, Content: body.Content})

	//return it
	c.JSON(http.StatusOK, gin.H{
		"blog": blog,
	})
}

func BlogSoftDelete(c *gin.Context) {
	//get id from url
	id := c.Param("id")

	//check if it exists
	var blog models.Blog
	resultCheck := initializers.DB.First(&blog, id)
	if resultCheck.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": resultCheck.Error.Error(),
		})
		return
	}

	//delete by id
	result := initializers.DB.Delete(&models.Blog{}, id)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	//return response
	c.JSON(http.StatusOK, gin.H{
		"message": "Blog deleted successfully",
	})
}

func BlogHardDelete(c *gin.Context) {
	//get id from url
	id := c.Param("id")

	//check if it exists
	var blog models.Blog
	resultCheck := initializers.DB.Unscoped().First(&blog, id)
	if resultCheck.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": resultCheck.Error.Error(),
		})
		return
	}

	//delete by id
	result := initializers.DB.Unscoped().Delete(&models.Blog{}, id)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	//return response
	c.JSON(http.StatusOK, gin.H{
		"message": "Blog deleted successfully",
	})
}
