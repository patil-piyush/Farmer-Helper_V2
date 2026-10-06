const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add standard default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Create a custom histogram for request latency
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Create a counter for total requests
const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestsTotal);

// Middleware to track request latency and count
const metricsMiddleware = (req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        // Only track API routes to avoid spam
        if (req.path.startsWith('/api') || req.path === '/health') {
            const route = req.route ? req.route.path : req.path;
            httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
            end({ method: req.method, route: route, status_code: res.statusCode });
        }
    });
    next();
};

// Expose the metrics endpoint
const metricsRoute = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

module.exports = {
    metricsMiddleware,
    metricsRoute
};
