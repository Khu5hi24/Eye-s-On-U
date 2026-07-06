# Input Validation Rules

This document catalogs all parameters, validation rules, length checks, and patterns enforced on both the client (Zod schema validations) and server (Express controllers/validators).

---

## User Registration & Profile Schema

These rules are enforced in `signup/page.tsx` (using Zod) and `auth.controller.ts` (using custom validators).

### 1. Name Field
* **Data Type**: String
* **Minimum Length**: 2 characters (Zod)
* **Maximum Length**: 100 characters (Zod)
* **Format Restrictions**:
  * Must start with an alphabetical character. Regex: `/^[a-zA-Z]/`
  * Cannot contain multiple consecutive spaces. Regex check: `/\s{2,}/`
  * Allowed characters: alphabets and single spaces only. Regex: `/^[a-zA-Z]+( [a-zA-Z]+)*$/`

### 2. Email Field
* **Data Type**: String
* **Minimum Length**: 1 character (Zod)
* **Maximum Length**: 254 characters (Zod & Server validator)
* **Format Restrictions**:
  * Must contain exactly one `@` character.
  * Cannot contain uppercase letters. Regex check: `/[A-Z]/`
  * Must pass the strict `isValidEmail` utility check (matching domain labels, DNS syntax rules, and at least a 2-character TLD).
  * Local-part maximum length: 64 characters.
  * Domain maximum length: 253 characters.
  * Domain labels cannot start or end with a hyphen (`-`).

### 3. Password Field
* **Data Type**: String
* **Minimum Length**: 8 characters (Zod)
* **Maximum Length**: 128 characters (Zod)
* **Reset Password Regex Complexity**: During password resets (under `forgot-password/page.tsx`), the password must satisfy additional criteria:
  * Minimum 8 and maximum 30 characters.
  * Must contain at least one lowercase letter, one uppercase letter, one number, and one special character.
  * Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,30}$/`

### 4. confirmPassword Field
* **Data Type**: String
* **Rule**: Must match `password` exactly.

### 5. Role Field
* **Data Type**: String
* **Values**: Enum `['admin', 'employee', 'user']`. Defaults to `employee`.

### 6. Profile Picture / Avatar
* **Data Type**: File stream / buffer
* **Size Limit**: Enforced to 5MB max size on the client-side.
* **MIME Types**: Enforced in Multer upload middleware: `image/jpeg`, `image/png`, and `image/svg+xml`.

---

## Task Schema

Rules enforced in `TaskForm.tsx` and `Task.model.ts` on the backend.

### 1. Title Field
* **Data Type**: String
* **Required**: Yes (HTML5 validation required on form input). Trimmed.

### 2. Description Field
* **Data Type**: String
* **Required**: No. Defaults to `""`.

### 3. Priority Field
* **Data Type**: String
* **Values**: Enum `['low', 'medium', 'high', 'critical']`.

### 4. Status Field
* **Data Type**: String
* **Values**: Enum `['pending', 'in-progress', 'completed', 'overdue']`. Defaults to `pending`.

### 5. Due Date Field
* **Data Type**: Date
* **Required**: Yes. Defaults to today's date during creation.

### 6. Assignee / Creator References
* **Data Type**: MongoDB ObjectId
* **Required**: Yes. References the `User` collection.

---

## Summary Validation Matrix

| Field | Client Validator | Server Validator | Length Constraints | Format Constraints |
|---|---|---|---|---|
| **Name** | Zod + Regex | Controller Custom Regex | 2 to 100 chars | Alphabet start, single spaces |
| **Email** | Zod + `isValidEmail` | Controller `isValidEmail` | 1 to 254 chars | Lowcase, single `@`, TLD check |
| **Password** | Zod | Controller | 8 to 128 chars | Checked at signup |
| **Password Reset** | Zod + Regex | Controller | 8 to 30 chars | Lower, upper, digit, special |
| **OTP Code** | Zod | DB Lookup | 6 characters | Numeric |
| **Task Title** | Required tag | Mongoose Validator | 1+ characters | Trimmed |
| **Task Status** | State dropdown | Mongoose Enum | enum match | `pending`, `in-progress`, `completed`, `overdue` |
| **Task Priority**| State dropdown | Mongoose Enum | enum match | `low`, `medium`, `high`, `critical` |
| **Avatar File** | Size checker | Multer FileFilter | Max 5MB | `jpeg`, `png`, `svg` |

---

## Cross-References
* See [Database Schema](./database.md) to inspect model structures.
* See [API Reference](./api.md) for endpoint payloads.
