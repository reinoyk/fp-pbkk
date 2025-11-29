package main

import (
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/controllers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/initializers"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/middleware"
	"github.com/Algoritma-dan-Pemrograman-ITS/Framework-Programming-GIN-GORM/models"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
	initializers.DB.AutoMigrate(&models.User{}, &models.Novel{}, models.Review{})
}

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"}, 
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))

	//Use Raw JSON POST with param: "name", "email", "password"
	router.POST("/register", controllers.Register)
	//Use Raw JSON POST with param: "email", "password"
	router.POST("/login", controllers.Login)

	//Example: localhost:8001/novels
	router.GET("/novels", controllers.GetAllNovels)
	//Example: localhost:8001/novels/1
	router.GET("/novels/:id", controllers.GetNovelByID)
	// Reviews routes
	router.GET("/novels/:id/reviews", controllers.GetReviewsByNovel)

	//In postman: Login then enter auth code in "Authorization" with type "Bearer Token"
	// Admin only routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware)
	{
		admin := protected.Group("/")
		admin.Use(middleware.AdminOnly)
		{
			admin.POST("/novels", controllers.CreateNovel)
			admin.PUT("/novels/:id", controllers.UpdateNovel)
			admin.DELETE("/novels/:id", controllers.RemoveNovel)
			admin.DELETE("/users/:id", controllers.DeleteUser)
		}

		//localhost:8001/profile/
		protected.GET("/profile", controllers.Profile) // <-- profile includes: id, name, and email
		//localhost:8001/bookmarks
		protected.GET("/bookmarks", controllers.GetBookmarkedNovels)         // <-- get all bookmark
		protected.POST("/bookmarks/:novel_id", controllers.BookmarkNovel)    // <-- add a novel to bookmark
		protected.DELETE("/bookmarks/:novel_id", controllers.RemoveBookmark) // <-- remove novel from bookmark
		// Reviews routes
		protected.POST("/novels/:novelID/reviews", controllers.CreateReview)
		protected.GET("/reviews/:reviewID", controllers.GetReviewByID)
		protected.PUT("/reviews/:reviewID", controllers.UpdateReview)
		protected.DELETE("/reviews/:reviewID", controllers.DeleteReview)
	}



	router.Run()
}
