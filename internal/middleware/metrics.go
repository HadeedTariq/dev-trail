package middleware

import (
	"strconv"
	"time"

	"github.com/HadeedTariq/dev-trail/internal/metrics"
	"github.com/gin-gonic/gin"
)

func Metrics() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/metrics" {
			c.Next()
			return
		}

		start := time.Now()

		c.Next()

		duration := time.Since(start).Seconds()

		method := c.Request.Method
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}

		statusCode := c.Writer.Status()

		metrics.HTTPRequestDuration.
			WithLabelValues(method, path).
			Observe(duration)

		metrics.HTTPRequestsTotal.
			WithLabelValues(
				method,
				path,
				strconv.Itoa(statusCode),
			).
			Inc()
	}
}
