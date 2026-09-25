package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/HadeedTariq/dev-trail/internal/adapters/postgresql"
	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	sqlc "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/config"
	"github.com/HadeedTariq/dev-trail/internal/handler"
	"github.com/HadeedTariq/dev-trail/internal/mailer"
	"github.com/HadeedTariq/dev-trail/internal/middleware"
	"github.com/HadeedTariq/dev-trail/internal/repository"
	"github.com/HadeedTariq/dev-trail/internal/service"
	"github.com/HadeedTariq/dev-trail/internal/tracer"
	"github.com/HadeedTariq/dev-trail/internal/utils"
	validator "github.com/HadeedTariq/dev-trail/internal/validators"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	if err := utils.InitLogger(&cfg.Logging); err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}

	// 1. Initialize OpenTelemetry Tracer
	tempoEndpoint := os.Getenv("TEMPO_ENDPOINT")
	if tempoEndpoint == "" {
		tempoEndpoint = "tempo:4317"
	}

	tp, err := tracer.InitTracer(context.Background(), "gocrm-backend", tempoEndpoint)
	if err != nil {
		log.Fatalf("Failed to initialize OpenTelemetry tracer: %v", err)
	}
	defer func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := tp.Shutdown(shutdownCtx); err != nil {
			log.Printf("Error shutting down TracerProvider: %v", err)
		}
	}()

	// 2. Initialize PostgreSQL Pool and run Goose Migrations
	dbPool, err := postgresql.InitDatabase(context.Background(), &cfg.Database)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	defer dbPool.Close() // Ensure connection pool drains on shutdown

	queries := repo.New(dbPool)

	// One-time global wiring for utils.ExecTx
	utils.InitTx(dbPool, queries)
	// 3. Setup Router with DB Pool dependency
	router := setupRouter(cfg, dbPool)

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Server.Port),
		Handler: router,
	}

	go func() {
		utils.Logger.Infof("Starting server on port %d", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	utils.Logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	utils.Logger.Info("Server exiting")
}

func setupRouter(cfg *config.Config, dbPool *pgxpool.Pool) *gin.Engine {
	// data, err := dbPool.Exec(
	// 	context.Background(),
	// 	"select * from workspace_members",
	// )

	// if err != nil {
	// 	log.Fatal("User cleanup failed")
	// } else {
	// 	log.Print(data)
	// 	log.Print("User cleanup succeeded")
	// }
	if cfg.Server.Mode == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	validator.RegisterCustomValidations()

	if err := router.SetTrustedProxies(cfg.Server.TrustedProxies); err != nil {
		log.Fatalf("Failed to set trusted proxies: %v", err)
	}

	router.Use(otelgin.Middleware("gocrm-backend"))
	router.Use(middleware.CORS(cfg.Server.CORSExtraOrigins...))
	router.Use(middleware.RequestID())
	router.Use(middleware.Logger())
	router.Use(middleware.Metrics())
	router.Use(middleware.Recovery())
	router.Use(middleware.ErrorHandler())

	router.GET("/health", func(c *gin.Context) {
		utils.RespondSuccess(c, http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().UTC(),
		})
	})
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	api := router.Group(cfg.API.Prefix)
	{
		setupDependencies(api, cfg, dbPool)
	}

	return router
}

func setupDependencies(router *gin.RouterGroup, cfg *config.Config, dbPool *pgxpool.Pool) {
	// Initialize sqlc queries engine wrapper
	queries := sqlc.New(dbPool)

	// Pass pool and sqlc queries to repositories
	userRepo := repository.NewUserRepository(dbPool, queries)
	workspaceRepo := repository.NewWorkspaceRepository(dbPool, queries)

	appMailer := mailer.NewFromConfig(cfg.SMTP)

	userService := service.NewUserService(userRepo, appMailer)
	tokenService := service.NewTokenService(cfg.JWT, userRepo)
	workspaceService := service.NewWorkspaceService(workspaceRepo, userRepo)
	cloudinaryClient, err := utils.NewCloudinary(cfg.Cloudinary)
	if err != nil {
		log.Fatalf("Failed to initialize Cloudinary: %v", err)
	}
	imageService := service.NewImageService(cloudinaryClient)

	authHandler := handler.NewAuthHandler(userService, tokenService, cfg.JWT)
	workspaceHandler := handler.NewWorkspaceHandler(workspaceService, imageService)

	// Routes
	public := router.Group("")
	{
		authRoutes := public.Group("/auth")
		// authRoutes.Use(middleware.RateLimitStrict())
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/otp-email-checker", authHandler.OtpEmailChecker)
			authRoutes.POST("/authenticate-with-credentials", authHandler.AuthenticateWithCredentials)
			authRoutes.POST("/refreshAccessToken", authHandler.AuthenticateWithRefreshToken)
		}
		authRoutes.Use(middleware.CheckAuth(tokenService))
		{
			authRoutes.GET("/", authHandler.AuthenticateUser)
		}
	}
	protected := router.Group("")
	protected.Use(middleware.CheckAuth(tokenService))
	{
		handler.SetupWorkspaceRoutes(protected, workspaceHandler)
	}
}
