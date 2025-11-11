package controllers

import (
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/initializers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {

	// add binding tags for validation then use c.BindJSON
	var body struct {
		Name     string `json:"name" binding:"required,min=2"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// basic validation
	// if body.Email == "" || body.Password == "" {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
	// 	return
	// }

	// hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	user := models.User{Name: body.Name, Email: body.Email, Password: string(hashedPassword)}

	if result := initializers.DB.Create(&user); result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error.Error()})
		return
	}

	// avoid returning password
	user.Password = ""

	// or you can create new response struct without password field
	// userResponse := struct {
	// 	ID    uint   `json:"id"`
	// 	Name  string `json:"name"`
	// 	Email string `json:"email"`
	// }{
	// 	ID:    user.ID,
	// 	Name:  user.Name,
	// 	Email: user.Email,
	// }

	c.JSON(http.StatusOK, gin.H{"user": user})
	// c.JSON(http.StatusOK, gin.H{"user": userResponse})
}

func Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if result := initializers.DB.First(&user, "email = ?", body.Email); result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// create jwt
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": strconv.FormatUint(uint64(user.ID), 10),
		// 5 seconds
		// "exp": time.Now().Add(5 * time.Second).Unix(),
		// "exp": time.Now().Add(5 * time.Hour).Unix(),
		"exp": time.Now().Add(5 * time.Minute).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create token"})
		return
	}
	// set cookie named "token" with HttpOnly and a 24 hour expiryd
	maxAge := 24 * 60 * 60 // seconds
	// 5 seconds
	// maxAge := 5
	secure := os.Getenv("ENV") == "production"
	c.SetCookie("token", tokenString, maxAge, "/", "", secure, true)

	// return token in body for backward compatibility
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

func Profile(c *gin.Context) {
	u, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// log.Printf("Context info: %v", u)

	user, ok := u.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not read user from context"})
		return
	}

	user.Password = ""
	c.JSON(http.StatusOK, gin.H{"user": user})
}
