#!/bin/sh
# Generate local development self-signed SSL certificates for HTTPS demonstration
# Note: This certificate is strictly for local development/testing demonstration.
# It is NOT a trusted production CA certificate.

set -e

SSL_DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_FILE="${SSL_DIR}/cert.pem"
KEY_FILE="${SSL_DIR}/key.pem"

echo "==> Generating local self-signed SSL certificate for school-platform..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "${KEY_FILE}" \
  -out "${CERT_FILE}" \
  -subj "/C=IN/ST=Delhi/L=NewDelhi/O=AlgionsAILabs/OU=DevOpsAssessment/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

chmod 600 "${KEY_FILE}"
chmod 644 "${CERT_FILE}"

echo "==> Successfully generated development certificate:"
echo "    Certificate: ${CERT_FILE}"
echo "    Private Key: ${KEY_FILE}"
