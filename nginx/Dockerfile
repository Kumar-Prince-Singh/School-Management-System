FROM nginx:1.25-alpine

RUN apk add --no-cache openssl curl

# Create SSL directory and self-signed certificate for local demonstration
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=IN/ST=Delhi/L=NewDelhi/O=AlgionsAILabs/OU=DevOpsAssessment/CN=localhost"

# Copy reverse proxy configuration
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

