package controllers

import (
	"net/http"
	"strconv"

	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/initializers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/models"
	"github.com/gin-gonic/gin"
)

func CreateClass(c *gin.Context) {
	// parse request body
	var body struct {
		ClassName string `json:"class_name" binding:"required"`
		ClassCode string `json:"class_code" binding:"required"`
		UserIDs   []uint `json:"user_ids" binding:"required"`
	}
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	class := models.Class{
		ClassName: body.ClassName,
		ClassCode: body.ClassCode,
	}

	// fetch users based on provided IDs using for
	var users []*models.User
	for _, id := range body.UserIDs {
		var user models.User
		if result := initializers.DB.First(&user, id); result.Error != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found with ID: " + strconv.Itoa(int(id))})
			return
		}
		users = append(users, &user)
	}

	class.Users = users

	if result := initializers.DB.Create(&class); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"class": class})
}

func GetClassParticipants(c *gin.Context) {
	classID := c.Param("id")
	var class models.Class
	if result := initializers.DB.Preload("Users").First(&class, classID); result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Class not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": class.Users})
}

func GetClassesUserEnrolled(c *gin.Context) {
	userID := c.Param("id")
	var user models.User
	if result := initializers.DB.Preload("Classes").First(&user, userID); result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"classes": user.Classes})
}
