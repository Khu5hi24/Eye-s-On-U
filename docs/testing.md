# Testing & Verification Guide

This document maps the testing methodologies, compilation check procedures, and manual verification checklists utilized to assert the stability and correctness of **Eye's On U**.

---

## Automated Compilation Verifications

There are no unit or integration testing frameworks configured in the dependency manifests (such as Jest or Vitest). Verification is achieved using static compiler verification, type checks, and lint configurations.

### 1. Build Verification
* **Frontend Verification**: Checks that Next.js components compile correctly, TypeScript types align, and routes bundle.
  ```bash
  cd frontend
  npm run build
  ```
* **Backend Verification**: Compiles backend TypeScript modules to verify syntax and type declarations.
  ```bash
  cd backend
  npm run build
  ```

### 2. Lint and Quality Checks
* **Frontend Code Style**: Analyzes frontend source files for syntax errors and deprecated code styles:
  ```bash
  cd frontend
  npm run lint
  ```

---

## Manual Verification Checklist

Since the application depends on browser tokens, email notifications, and database writes, use this checklist to manually verify features.

### 1. Registration and Recovery Verification
- [ ] **Account Signup**: Enter credentials on `/signup`. Verify name regex rejects invalid characters or consecutive spaces.
- [ ] **OTP Delivery**: Verify an email arrives containing a 6-digit numeric OTP.
- [ ] **OTP Expiration**: Wait 10 minutes and attempt to enter the code. Confirm validation fails.
- [ ] **Code Verification**: Enter a valid OTP code. Verify client routes to login. Check that the `User` record exists in MongoDB.
- [ ] **Password Recovery**: Click forgot password, input email, receive OTP, verify OTP, and reset the password. Assert the new password works.

### 2. Task Management Verification
- [ ] **Admin Task Creation**: Sign in as admin, navigate to `/tasks/new`, fill in fields, and upload a file. Verify title field requires input and attachment does not exceed 5MB.
- [ ] **Employee Assignment**: Confirm that only tasks assigned to the employee appear on their dashboard.
- [ ] **Status Upgrades**: Log in as the assignee, change status to `completed`, and confirm it updates. Verify other users cannot edit the status of tasks assigned to someone else.

### 3. Dashboard Visualization Verification
- [ ] **Streaks Tracker**: Complete tasks over consecutive days. Confirm the current/longest streak metrics increment.
- [ ] **Productivity Heatmap**: Confirm completed tasks appear as shaded cells in the 63-day grid.
- [ ] **Leaderboard Rank**: Confirm top performers list correctly orders users based on task completion.

---

## Cross-References
* See [Deployment Guide](./deployment.md) for environment details.
* See [Validation rules](./validation.md) for input regex.
