package middleware

import (
	"net/http"
	"os"
	"strconv"

	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/initializers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func AuthMiddleware(c *gin.Context) {
	// Prefer token in cookie named "token". If missing, fall back to Authorization header.
	tokenString, err := c.Cookie("token")
	if err != nil || tokenString == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization cookie required"})
		return
	}

	//using bearer token from header u can use this also by uncommenting below code
	// authHeader := c.GetHeader("Authorization")
	// if authHeader == "" {
	// 	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
	// 	return
	// }

	// if !strings.Contains(authHeader, "Bearer ") {
	// 	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header format"})
	// 	return
	// }

	// //split the bearer and token
	// tokenString := strings.Split(authHeader, "Bearer ")[1]
	// if tokenString == "" {
	// 	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
	// 	return
	// }

	secret := os.Getenv("JWT_SECRET")

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	sub, ok := claims["sub"]
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token subject"})
		return
	}

	// sub is numeric (float64) or string; handle both
	var id uint64
	parsed, err := strconv.ParseUint(sub.(string), 10, 64)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token subject"})
		return
	}
	id = parsed

	var user models.User
	if result := initializers.DB.First(&user, id); result.Error != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	c.Set("user", user)
	c.Next()
}

func AuthMiddleware2(c *gin.Context) {
	// Prefer token in cookie named "token". If missing, fall back to Authorization header.
	tokenString, err := c.Cookie("token")
	if err != nil || tokenString == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization cookie required"})
		return
	}

	secret := os.Getenv("JWT_SECRET")

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	sub, ok := claims["sub"]
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token subject"})
		return
	}

	// sub is numeric (float64) or string; handle both
	var id uint64
	parsed, err := strconv.ParseUint(sub.(string), 10, 64)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token subject"})
		return
	}
	id = parsed

	var user models.User
	if result := initializers.DB.First(&user, id); result.Error != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	c.Set("user", user)
	c.Next()
}

func AdminOnly(c *gin.Context) {
	u, exists := c.Get("user")
	if !exists {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, ok := u.(models.User)
	if !ok {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "User context error"})
		return
	}

	if user.Role != "admin" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access forbidden: Admins only"})
		return
	}

	c.Next()
}
