package handler

// func SetupUserRoutes(router *gin.RouterGroup, handler *UserHandler) {
// 	users := router.Group("/users")
// 	{
// 		users.POST("", middleware.RequireRole(repo.RoleAdmin), handler.Create)
// 		users.GET("", middleware.RequireRole(repo.RoleAdmin), handler.List)
// 		users.GET("/me", handler.GetMe)
// 		users.PUT("/me", handler.UpdateMe)
// 		users.GET("/:id", handler.Get)
// 		users.PUT("/:id", handler.Update)
// 		users.DELETE("/:id", middleware.RequireRole(repo.RoleAdmin), handler.Delete)
// 	}
// }
