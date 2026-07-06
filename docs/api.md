# API Reference Guide

This document provides detailed API specifications for all routes, endpoints, request formats, response payloads, validation requirements, and expected errors.

---

## Authentication Endpoints

### 1. Register / Signup Account
* **Method**: `POST`
* **Endpoints**: `/api/auth/register` and `/api/auth/signup`
* **Description**: Submits registration parameters, stores temporary records in the database, generates a 6-digit OTP code, and emails it.
* **Authentication Required**: No
* **Request Body** (Multipart Form Data):
  * `name` (string, required): Full name.
  * `email` (string, required): Email address (lowercase, trimmed).
  * `password` (string, required): Secure password.
  * `role` (string, optional): Role (`employee` or `admin`). Defaults to `employee`.
  * `profilePicture` or `avatar` (file, optional): File stream (`image/jpeg`, `image/png`, or `image/svg+xml`).
* **Success Response** (201 Created):
  ```json
  {
    "success": true,
    "requiresVerification": true,
    "message": "User registered successfully. OTP sent to email.",
    "data": { "email": "user@example.com" }
  }
  ```
* **Validation Rules**:
  * Name must start with an alphabet, contain only alphabets and single spaces, and contain no consecutive spaces.
  * Email must be lowercase, contain exactly one `@`, pass TLD/label validation, and be unique in the active user collections.
  * Password must be present.
* **Expected Errors**:
  * `400 Bad Request`: "Name, email and password are required.", "Name can only contain alphabets and single spaces.", "Email already in use.", or "Please enter a valid email address."

### 2. Verify Signup OTP
* **Method**: `POST`
* **Endpoint**: `/api/auth/verify-otp`
* **Description**: Verifies a registration OTP. If valid, the new account is created.
* **Authentication Required**: No
* **Request Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Account verified successfully."
  }
  ```
* **Expected Errors**:
  * `400 Bad Request`: "Invalid or expired OTP." or "No registration data found for this email." or "Email already registered."

### 3. User Login
* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Description**: Verifies credentials and yields JWT access and refresh tokens.
* **Authentication Required**: No
* **Request Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
  ```
* **Expected Errors**:
  * `400 Bad Request`: "Please enter a valid email address."
  * `401 Unauthorized`: "User not found" or "Invalid password"
  * `403 Forbidden`: "Account not verified"

### 4. Request Password Reset OTP
* **Method**: `POST`
* **Endpoint**: `/api/auth/forgot-password`
* **Description**: Sends a 6-digit OTP code to the requested email to start the recovery flow.
* **Authentication Required**: No
* **Request Body** (JSON):
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "OTP sent to your email."
  }
  ```
* **Expected Errors**:
  * `404 Not Found`: "User not found."

### 5. Verify Password Reset OTP
* **Method**: `POST`
* **Endpoint**: `/api/auth/verify-forgot-otp`
* **Description**: Validates that a recovery OTP is correct and unexpired.
* **Authentication Required**: No
* **Request Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "OTP verified successfully."
  }
  ```
* **Expected Errors**:
  * `400 Bad Request`: "Invalid or expired OTP."

### 6. Reset Password
* **Method**: `POST`
* **Endpoint**: `/api/auth/reset-password`
* **Description**: Completes the recovery workflow by writing the new password.
* **Authentication Required**: No
* **Request Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "NewPassword123!"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Password reset successfully."
  }
  ```
* **Expected Errors**:
  * `404 Not Found`: "User not found."

### 7. Resend OTP
* **Method**: `POST`
* **Endpoint**: `/api/auth/resend-otp`
* **Description**: Generates and mails a new OTP code.
* **Authentication Required**: No
* **Request Body** (JSON):
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "OTP resent successfully."
  }
  ```
* **Expected Errors**:
  * `404 Not Found`: "User not found."

### 8. Logout
* **Method**: `POST`
* **Endpoint**: `/api/auth/logout`
* **Description**: Ends the current session.
* **Authentication Required**: No
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

---

## User Endpoints

### 1. Get Profile
* **Method**: `GET`
* **Endpoint**: `/api/user/profile`
* **Description**: Returns the active user's details (password is omitted).
* **Authentication Required**: Yes (Bearer JWT)
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d0fe...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "employee",
      "avatar": "https://res.cloudinary.com/...",
      "bio": "Developer",
      "specialization": "Frontend",
      "phone": "+123456789",
      "gender": "female",
      "isVerified": true
    }
  }
  ```
* **Expected Errors**:
  * `401 Unauthorized`: "Not authorized"
  * `404 Not Found`: "User not found."

### 2. Update Profile
* **Method**: `PUT`
* **Endpoint**: `/api/user/profile`
* **Description**: Modifies the caller's metadata. Non-admin users cannot change roles or specialization.
* **Authentication Required**: Yes (Bearer JWT)
* **Request Body** (JSON):
  * `name` (string, optional)
  * `email` (string, optional)
  * `bio` (string, optional)
  * `specialization` (string, optional) — Admin only.
  * `phone` (string, optional)
  * `gender` (string, optional)
  * `avatar` (string, optional)
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Expected Errors**:
  * `400 Bad Request`: "Email address is already in use."
  * `401 Unauthorized`: "Not authorized"

### 3. Get Team Members
* **Method**: `GET`
* **Endpoint**: `/api/user/team`
* **Description**: Compiles all team records alongside completed task counts and workload metrics.
* **Authentication Required**: Yes (Bearer JWT)
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "60d0fe...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "employee",
        "avatar": "",
        "bio": "",
        "specialization": "Backend Development",
        "phone": "",
        "gender": "",
        "tasksAssigned": 4,
        "completionRate": 75,
        "status": "active"
      }
    ]
  }
  ```

### 4. Update Team Member Role & Specialization
* **Method**: `PUT`
* **Endpoint**: `/api/user/member/:id`
* **Description**: Allows admins to modify the role or specialization of a specific user.
* **Authentication Required**: Yes (Bearer JWT, Admin check)
* **Request Body** (JSON):
  ```json
  {
    "role": "admin",
    "specialization": "Project Management"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Expected Errors**:
  * `401 Unauthorized`: "Not authorized"
  * `403 Forbidden`: "Admin access required."
  * `404 Not Found`: "User not found."

### 5. Upload Profile Avatar
* **Method**: `PUT`
* **Endpoint**: `/api/user/avatar`
* **Description**: Submits an avatar file to Cloudinary and updates the profile image URL.
* **Authentication Required**: Yes (Bearer JWT)
* **Request Body** (Multipart Form Data):
  * `profilePicture` or `avatar` (file, required): Image file.
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Expected Errors**:
  * `400 Bad Request`: "Profile picture is required."
  * `500 Internal Server Error`: "Failed to upload profile picture."

### 6. Delete Account
* **Method**: `DELETE`
* **Endpoint**: `/api/user/delete-account`
* **Description**: Removes the caller's user record from the database.
* **Authentication Required**: Yes (Bearer JWT)
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Account deleted successfully."
  }
  ```

---

## Task Endpoints

### 1. Create Task
* **Method**: `POST`
* **Endpoint**: `/api/tasks/create`
* **Description**: Registers a new task.
* **Authentication Required**: Yes (Bearer JWT, Admin check)
* **Request Body** (JSON):
  ```json
  {
    "title": "Build API routes",
    "description": "Create all documentation endpoints",
    "priority": "high",
    "status": "pending",
    "dueDate": "2026-07-20T00:00:00.000Z",
    "assignedTo": "60d0fe..."
  }
  ```
* **Success Response** (201 Created):
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Expected Errors**:
  * `403 Forbidden`: "Admin access required."

### 2. Get All Tasks
* **Method**: `GET`
* **Endpoint**: `/api/tasks`
* **Description**: Fetches tasks. Admins receive all tasks; non-admins receive only tasks assigned to them.
* **Authentication Required**: Yes (Bearer JWT)
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [ ... ]
  }
  ```

### 3. Get Single Task
* **Method**: `GET`
* **Endpoint**: `/api/tasks/:id`
* **Description**: Fetches details for a specific task.
* **Authentication Required**: Yes (Bearer JWT)
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Expected Errors**:
  * `404 Not Found`: "Task not found."

### 4. Update Task Fields
* **Method**: `PUT`
* **Endpoint**: `/api/tasks/:id`
* **Description**: Modifies any parameter of a task.
* **Authentication Required**: Yes (Bearer JWT, Admin check)
* **Request Body** (JSON): Any subset of Task schema fields.
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Expected Errors**:
  * `403 Forbidden`: "Admin access required."
  * `404 Not Found`: "Task not found."

### 5. Update Task Status
* **Method**: `PATCH`
* **Endpoint**: `/api/tasks/:id/status`
* **Description**: Allows assignees or admins to change a task's status.
* **Authentication Required**: Yes (Bearer JWT)
* **Request Body** (JSON):
  ```json
  {
    "status": "completed"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Expected Errors**:
  * `404 Not Found`: "Task not found." (Also occurs if a non-admin attempts to update a status for a task not assigned to them).

### 6. Delete Task
* **Method**: `DELETE`
* **Endpoint**: `/api/tasks/:id`
* **Description**: Permanently removes a task.
* **Authentication Required**: Yes (Bearer JWT, Admin check)
* **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Task deleted successfully."
  }
  ```
* **Expected Errors**:
  * `403 Forbidden`: "Admin access required."
  * `404 Not Found`: "Task not found."

---

## Cross-References
* See [Authentication Guide](./authentication.md) to understand JWT structure.
* See [Database Schema](./database.md) to inspect task references.
* See [Workflow Guide](./workflow.md) to inspect endpoints lifecycle.
