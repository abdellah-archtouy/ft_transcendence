# JSON Web Token (JWT) Structure Documentation

## Overview

A JSON Web Token (JWT) is a compact, URL-safe means of representing claims between two parties. The token is composed of three parts separated by dots (`.`):

```
header.payload.signature
```

## 1. Header

The header typically consists of two parts:

- Token type (JWT)
- Signing algorithm (e.g., HMAC SHA256 or RSA)

### Example Header:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Encoding Process:

1. Take the header object
2. Convert to JSON string
3. Base64Url encode

```javascript
// Original header
const header = {
  alg: "HS256",
  typ: "JWT",
};

// Base64Url encoded
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

## 2. Payload

The payload contains the claims. Claims are statements about an entity (user) and additional data.

### Types of Claims:

1. **Registered Claims**: Predefined claims

   - `iss` (Issuer)
   - `sub` (Subject)
   - `exp` (Expiration Time)
   - `iat` (Issued At)
   - `aud` (Audience)

2. **Public Claims**: Defined at will
3. **Private Claims**: Custom claims for sharing information

### Example Payload:

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1516239022,
  "exp": 1516242622
}
```

### Encoding Process:

1. Take the payload object
2. Convert to JSON string
3. Base64Url encode

```javascript
// Original payload
const payload = {
  sub: "1234567890",
  name: "John Doe",
  admin: true,
  iat: 1516239022,
  exp: 1516242622,
};

// Base64Url encoded
// eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQyNjIyfQ
```

## 3. Signature

The signature is used to verify that the message wasn't changed along the way and, in the case of tokens signed with a private key, to verify that the sender of the JWT is who it says it is.

### Creation Process:

1. Take the encoded header
2. Add a period (.)
3. Take the encoded payload
4. Apply the algorithm specified in the header
5. Sign with the secret key

### Example Signature Creation:

```javascript
// Using HMAC SHA256
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret);

// Example secret: "your-256-bit-secret"
// Resulting signature:
// SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## Complete JWT Example

### Parts Combined:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQyNjIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Code Example - Creating a JWT:

```javascript
const jwt = require("jsonwebtoken");

const secret = "your-256-bit-secret";
const payload = {
  sub: "1234567890",
  name: "John Doe",
  admin: true,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
};

const token = jwt.sign(payload, secret, { algorithm: "HS256" });
```

### Code Example - Verifying a JWT:

```javascript
const jwt = require("jsonwebtoken");

try {
  const decoded = jwt.verify(token, secret);
  console.log(decoded);
} catch (err) {
  console.error("Invalid token:", err.message);
}
```

## Security Considerations

1. **Never store sensitive information** in the payload as it can be decoded
2. **Use HTTPS** to prevent token interception
3. **Set appropriate expiration** times using the `exp` claim
4. **Validate all claims** during the verification process
5. **Use strong secrets** for signing tokens
6. **Consider token size** as it's included in every request

## Best Practices

1. **Token Expiration**:

   - Short-lived access tokens (15-60 minutes)
   - Longer-lived refresh tokens (days/weeks) with secure storage

2. **Claim Usage**:

   - Include only necessary claims
   - Use standard claims when possible
   - Be consistent with claim naming

3. **Algorithm Selection**:

   - Use strong algorithms (HS256, RS256, ES256)
   - Avoid "none" algorithm
   - Consider asymmetric algorithms for distributed systems

4. **Token Storage**:
   - Client: HttpOnly cookies or local storage
   - Server: Consider blacklisting revoked tokens
   - Implement secure token rotation
