package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	UserOperationsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "user_operations_total",
			Help: "Total number of user service operations",
		},
		[]string{"operation", "status"},
	)

	UserOperationDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "user_operation_duration_seconds",
			Help: "Duration of user service operations in seconds",
		},
		[]string{"operation"},
	)

	WorkspaceOperationsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "workspace_operations_total",
			Help: "Total number of workspace service operations",
		},
		[]string{"operation", "status"},
	)

	WorkspaceOperationDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "workspace_operation_duration_seconds",
			Help: "Duration of workspace service operations in seconds",
		},
		[]string{"operation"},
	)
)
