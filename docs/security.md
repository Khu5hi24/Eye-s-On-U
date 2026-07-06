# Security Architecture Guide

This document describes the security protocols, cryptography, session defenses, and role-based policies implemented in **Eye's On U**.

---

## Network & API Security Middleware

### 1. HTTP Security Headers (Helmet)
The Express app mounts the **Helmet** middleware globally in [app.ts](../backend/src/app.ts):
```typescript
app.use(helmet());
```
This automatically sets headers to defend against common browser-side vulnerabilities:
* `Content-Security-Policy`: Restricts resource sources.
* `X-Frame-Options`: Prevents Clickjacking attacks.
* `X-Content-Type-Options`: Enforces MIME sniffing protection.
* `Strict-Transport-Security`: Forces HTTP over SSL/TLS.

### 2. Request Rate Limiting
To defend against brute-force and Denial-of-Service (DoS) attacks, the API applies an rate-limiter:
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per client IP per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
```

### 3. CORS Controls
The API restricts cross-origin resource access. The configuration is locked to the specified frontend URL:
```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## Authentication & Cryptography

### 1. Bcrypt Password Hashing
Raw passwords are never stored in the database. During registration or reset flows, the system hashes passwords using the **Bcrypt** algorithm.
* Salt creation and matching are handled in [hashPassword.ts](../backend/src/utils/hashPassword.ts).

### 2. Stateless JWT Authorization
Once authenticated, the server issues a JSON Web Token (JWT) signed using the `JWT_SECRET` key.
* The access token is attached to headers as `Bearer <token>`.
* The [protect middleware](../backend/src/middlewares/auth.middleware.ts) decodes and verifies the token on protected routes. If the verification fails or the token expires, the backend immediately rejects the call with a `401 Unauthorized` response.

---

## Role-Based Access Control (RBAC)

The system restricts routes based on the caller's role (`admin` vs `employee` / `user`), which is verified directly against the MongoDB user document:

```text
               +--------------------------------------+
               |          Incoming Request            |
               +--------------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |  auth.middleware.ts (protect)  |
                  +--------------------------------+
                                  |
                                  | Token Valid?
                                  v
                               /     \
                             No       Yes
                            /           \
                           v             v
                    [401 Reject]    [Route Controller]
                                         |
                                         | Admin Check Required?
                                         v
                                      /     \
                                    No       Yes
                                   /           \
                                  v             v
                           [Allow Access]    [User.role === 'admin'?]
                                                 /             \
                                               No               Yes
                                              /                   \
                                             v                     v
                                      [403 Forbidden]        [Allow Access]
```

### 1. Task Operations
* **Creation, Deletion, and General Updates**: Restructured as admin-only operations. Non-admins receive `403 Forbidden` ("Admin access required.").
* **Viewing Tasks**: Employees only receive tasks assigned to them (`assignedTo: req.user._id`), while admins can view all tasks.
* **Status Updates**: Employees can only update the status of tasks assigned to them. The backend enforces this check:
  ```typescript
  isAdmin(req) ? { _id: req.params.id } : { _id: req.params.id, assignedTo: req.user._id }
  ```

### 2. Team Member Management
* Editing team roles and role-specific specializations requires admin credentials.

---

## OTP Life Cycle Security

* **OTP Expiration**: The database OTP document enforces a 10-minute expiry time (`expiresAt` set to 10 minutes from creation).
* **Disposable OTPs**: Once validated, the database record is immediately deleted to prevent replay attacks.
* **Strict Email Format validation**: Validates domain label configurations to prevent invalid mail registrations.

---

## Cross-References
* See [Authentication Guide](./authentication.md) for sequence details.
* See [Database Schema](./database.md) for document properties.
* See [Validation rules](./validation.md) for input validation details.
