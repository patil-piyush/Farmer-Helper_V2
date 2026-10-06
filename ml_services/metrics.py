import time
from flask import request, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# Define metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'route', 'status_code']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'Duration of HTTP requests in seconds',
    ['method', 'route', 'status_code'],
    buckets=(0.1, 0.3, 0.5, 0.7, 1.0, 3.0, 5.0, 7.0, 10.0)
)

def setup_metrics(app):
    @app.before_request
    def before_request():
        request.start_time = time.time()

    @app.after_request
    def after_request(response):
        if request.path.startswith('/api') or request.path == '/health':
            latency = time.time() - getattr(request, 'start_time', time.time())
            # Group rules like /api/crop to avoid huge cardinality
            route = request.url_rule.rule if request.url_rule else request.path
            
            http_requests_total.labels(
                method=request.method,
                route=route,
                status_code=response.status_code
            ).inc()
            
            http_request_duration_seconds.labels(
                method=request.method,
                route=route,
                status_code=response.status_code
            ).observe(latency)
            
        return response

    @app.route('/metrics')
    def metrics():
        return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)
