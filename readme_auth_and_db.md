# Authentication and Database Relationship Guide

This guide provides instructions on setting up user authentication and establishing relationships between users and blog posts in a Go web application using the Gin framework and GORM for database interactions.

## Authentication Setup

### Create new Controller: `AuthController.go`

1. Create a new file named `AuthController.go` in the `controllers` directory.
2. Create simple functions for user register (signup) and login.

   ### Login Function

   Login flow:

   - Accepts email and password.
   - Verifies user credentials.
   - Return JWT token on successful authentication.

   ```go
    func Login(c *gin.Context) {
        var body struct {
            Email    string `json:"email " binding:"required,email"`
            Password string `json:"password" binding:"required"`
        }

        if err := c.BindJSON(&body); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
            return
        }

        // do database query to find user by email
        var user models.User
        if result := initializers.DB.First(&user, "email = ?", body.Email); result.Error != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
            return
        }

        // use bcrypt to compare password
        if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
            return
        }

        // create jwt
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
            "sub": strconv.FormatUint(uint64(user.ID), 10),
            // 5 seconds
            "exp": time.Now().Add(5 * time.Second).Unix(),
            // "exp": time.Now().Add(5 * time.Hour).Unix(), // 5 hours
            // "exp": time.Now().Add(5 * time.Minute).Unix(), // 5 minutes
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
   ```

   Basically, the login function verifies user credentials and generates a JWT token upon successful authentication. The JWT token can be sent to the client and stored in a cookie for subsequent requests or used in the Authorization header for every request that need authentication access.

   ### Register (Signup) Function

   Signup flow:

   - Accepts name, email, and password.
   - Hashes the password.
   - Stores user in the database.
   - Returns success message or error.

   ```go
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

        // hash password
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
            return
        }


        user := models.User{Name: body.Name, Email: body.Email, Password: string(hashedPassword)}

        // insert user to database
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
   ```

   Functionally, the register function handles user registration by validating input, hashing the password, and storing the new user in the database. It returns the created user object.

3. Create Login and Register routes in `main.go`:

   ```go
    router.POST("/signup", controllers.Register)
    router.POST("/signin", controllers.Login)
   ```

4. Now try to register and login using Postman or any API testing tool.

## Middleware for Authentication

Suppose we want to protect certain routes so that only authenticated users can access them. We can create an authentication middleware. Middleware basically intercepts requests before they reach the route handlers.

1. Create a new file named `AuthMiddleware.go` in the `middleware` directory.
2. Create the authentication middleware function:

   ```go
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

        // get jwt secret from env this is used to verify the token
        secret := os.Getenv("JWT_SECRET")

        // parse and verify token
        token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrSignatureInvalid
            }
            return []byte(secret), nil
        })

        // check for parsing errors or invalid token
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

        // set user in context for use in handlers so that we can access the authenticated user
        c.Set("user", user)

        // proceed to next handler
        c.Next()
   }

   ```

   This middleware firstly check for the JWT token in the cookie named "token". If the token is missing or invalid, it aborts the request with a 401 Unauthorized status. It then parses the token, retrieves the user ID from the token claims, and fetches the corresponding user from the database. If the user is found, it sets the user in the context for use in subsequent handlers.

3. Create function to get UserProfile that will use the authenticated user from context. Create this function in `AuthController.go`:

   ```go
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
   ```

   This function retrieves the authenticated user from the context that was set by the `AuthMiddleware`. It checks if the user exists in the context, and if so, it returns the user information in the response. In real applications, you might want to just use user ID to fetch fresh data from the database instead of relying on the context data.

4. Create Profile route in `main.go`, and apply the `AuthMiddleware` to protect the route:

   ```go
    protected := router.Group("/")
    protected.Use(middleware.AuthMiddleware)
    {
        protected.GET("/profile", controllers.Profile)
    }
    // or u can do like this also (dont change the parameter order)
    // router.GET("/profile", middleware.AuthMiddleware, controllers.Profile)
   ```

   So when we defining middleware in the route, it will ensure that only authenticated users can access the `/profile` endpoint. The `AuthMiddleware` will run before the `Profile` handler, checking for a valid JWT token and setting the user in the context if authentication is successful (make sure to set the parameter correctly). So if you try to access `/profile` without a valid token, you will get a 401 Unauthorized response.

5. Now reload the server and try to access the `/profile` route with and without a valid JWT token to see the authentication in action.
