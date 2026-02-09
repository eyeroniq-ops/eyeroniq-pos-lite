#!/bin/bash

# Get local IP address (try en0 first - usually WiFi on Mac)
IP=$(ipconfig getifaddr en0)

if [ -z "$IP" ]; then
    IP=$(ipconfig getifaddr en1)
fi

if [ -z "$IP" ]; then
    echo "Could not find local IP address. Defaulting to 127.0.0.1"
    IP="127.0.0.1"
else
    echo "Detected Local IP: $IP"
fi

# Directory for certs
CERT_DIR="certificates"
mkdir -p $CERT_DIR

# 1. Generate Root CA
echo "Generating Root CA..."
openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 \
  -keyout $CERT_DIR/RootCA.key \
  -out $CERT_DIR/RootCA.pem \
  -subj "/C=US/CN=Eyeroniq-Local-Root-CA"

echo "✅ Root CA generated: $CERT_DIR/RootCA.pem (INSTALL THIS ON MOBILE)"

# 2. Generate config for Leaf Cert
cat > $CERT_DIR/openssl.cnf <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = US
ST = State
L = City
O = Eyeroniq
OU = Dev
CN = $IP

[req_ext]
subjectAltName = @alt_names

[alt_names]
IP.1 = $IP
IP.2 = 127.0.0.1
DNS.1 = localhost
EOF

# 3. Create CSR
openssl req -new -nodes -newkey rsa:2048 \
  -keyout $CERT_DIR/localhost-key.pem \
  -out $CERT_DIR/localhost.csr \
  -config $CERT_DIR/openssl.cnf

# 4. Sign CSR with Root CA
openssl x509 -req -in $CERT_DIR/localhost.csr \
  -CA $CERT_DIR/RootCA.pem \
  -CAkey $CERT_DIR/RootCA.key \
  -CAcreateserial \
  -out $CERT_DIR/localhost.pem \
  -days 365 \
  -sha256 \
  -extfile $CERT_DIR/openssl.cnf \
  -extensions req_ext

echo "✅ Server Certificate Signed by Root CA"
echo "Path: $CERT_DIR/localhost.pem"
echo "Key: $CERT_DIR/localhost-key.pem"
