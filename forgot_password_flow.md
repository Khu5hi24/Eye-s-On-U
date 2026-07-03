# 🔐 Forgot Password — Complete Flow Explanation

## Eye's On U — Task Manager App

---

## 📁 Folder Structure (Related Files)

```
Eye-s-On-U/
│
├── backend/src/
│   ├── models/
│   │   ├── OTP.model.ts         ← OTP data MongoDB schema
│   │   └── User.model.ts        ← User schema with password field
│   │
│   ├── services/
│   │   ├── otp.service.ts       ← Save OTP & Verify OTP logic
│   │   └── mail.service.ts      ← Send email via Nodemailer
│   │
│   ├── utils/
│   │   ├── generateOTP.ts       ← Random 6-digit OTP generator
│   │   └── hashPassword.ts      ← bcrypt hash & compare
│   │
│   ├── controllers/
│   │   └── auth.controller.ts   ← Core logic: forgotPassword, verifyForgotOtp, resetPassword
│   │
│   └── routes/
│       └── auth.routes.ts       ← API endpoints mapping
│
└── frontend/src/
    ├── app/(auth)/
    │   └── forgot-password/
    │       └── page.tsx         ← UI: Email form → OTP + New Password form
    │
    ├── services/
    │   └── auth.service.ts      ← API call functions (Axios)
    │
    └── hooks/
        └── useAuth.ts           ← State & logic hook used in pages
```

---

## 🔄 API Flow — Step by Step

### **Step 1: User enters email → Forgot Password**

**Frontend** → `forgot-password/page.tsx`
- User fills email in a form (Step 1 UI)
- Form validated by **Zod schema** (email format check, no uppercase, proper format)
- On submit → calls `forgotPassword(email)` from `useAuth` hook

**Service call:**
```ts
// auth.service.ts
forgotPassword: (payload: { email: string }) => api.post('/auth/forgot-password', payload)
```

**API endpoint:**
```
POST /api/auth/forgot-password
Body: { email: "user@example.com" }
```

---

**Backend** → `auth.controller.ts → forgotPassword()`

```ts
export const forgotPassword = async (req, res, next) => {
  const email = req.body.email.toLowerCase().trim();

  // 1. Check if user exists in DB
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  // 2. Generate 6-digit OTP
  const otp = generateOTP();   // e.g. "483921"

  // 3. Save OTP to MongoDB (expires in 10 minutes)
  await saveOTP(email, otp);

  // 4. Send OTP to email using Nodemailer
  await sendOTPEmail(email, otp, 'Reset Your Password', '...');

  res.status(200).json({ success: true, message: 'OTP sent to your email.' });
};
```

---

### **Step 2: OTP saved to MongoDB**

**`otp.service.ts → saveOTP()`**

```ts
export const saveOTP = async (email, otp, tempUserData?) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

  // Delete any old OTP for this email (upsert-like behavior)
  await OTP.deleteMany({ email });

  // Save fresh OTP
  await OTP.create({ email, otp, expiresAt });
};
```

**MongoDB OTP Document looks like:**
```json
{
  "_id": "...",
  "email": "user@example.com",
  "otp": "483921",
  "expiresAt": "2026-07-03T14:00:00Z",
  "createdAt": "2026-07-03T13:50:00Z"
}
```

---

### **Step 3: Email sent via Nodemailer**

**`mail.service.ts → sendOTPEmail()`**

```ts
export const sendOTPEmail = async (email, otp, subject, message) => {
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: 'Reset Your Password',
    html: `<p>Use the OTP to reset your password</p><p><strong>OTP:</strong> 483921</p>`,
  };

  const transport = await getTransport(); // SMTP config (Gmail/Mailtrap)
  await transport.sendMail(mailOptions);
};
```

User ko email milti hai OTP ke saath. ✅

---

### **Step 4: User enters OTP + New Password**

**Frontend** (same page, step 2 UI)
- Page switches to second form (OTP + new password + confirm password)
- Calls `verifyForgotOtp(email, otp)` first, then `resetPassword(email, password)`

**Service calls:**
```ts
verifyForgotOtp: (payload) => api.post('/auth/verify-forgot-otp', payload)
resetPassword:   (payload) => api.post('/auth/reset-password', payload)
```

---

### **Step 5: OTP Verification**

**API endpoint:**
```
POST /api/auth/verify-forgot-otp
Body: { email: "user@example.com", otp: "483921" }
```

**Backend → `verifyForgotOtp()`**

```ts
export const verifyForgotOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  const valid = await verifyOTP(email, otp);

  if (!valid) return res.status(400).json({ message: 'Invalid or expired OTP.' });

  res.status(200).json({ success: true, message: 'OTP verified successfully.' });
};
```

**`otp.service.ts → verifyOTP()`**

```ts
export const verifyOTP = async (email, otp) => {
  const record = await OTP.findOne({ email, otp });

  if (!record) return null;                          // OTP not found → invalid
  if (record.expiresAt < new Date()) {              // OTP expired?
    await OTP.deleteOne({ _id: record._id });
    return null;
  }

  await OTP.deleteOne({ _id: record._id });          // Delete used OTP (one-time use)
  return record;
};
```

---

### **Step 6: Password Reset**

**API endpoint:**
```
POST /api/auth/reset-password
Body: { email: "user@example.com", password: "NewPass@123" }
```

**Backend → `resetPassword()`**

```ts
export const resetPassword = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  // Hash new password using bcrypt
  user.password = await hashPassword(password);
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully.' });
};
```

**`hashPassword.ts`**
```ts
import bcrypt from 'bcrypt';
export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
```

**After success → Frontend redirects to `/login` ✅**

---

## 🗺️ Visual Flow Diagram

```
User                  Frontend                  Backend                   MongoDB
  │                      │                          │                        │
  │── Enter Email ──────►│                          │                        │
  │                      │── POST /forgot-password ►│                        │
  │                      │                          │── Find User ──────────►│
  │                      │                          │◄── User found ─────────│
  │                      │                          │── generateOTP() "483921"
  │                      │                          │── saveOTP() ──────────►│ (expires 10min)
  │                      │                          │── sendEmail() ─────────┼─► Gmail/SMTP
  │◄── OTP Email ────────┼──────────────────────────┼────────────────────────│
  │                      │◄── {success: true} ───────│                        │
  │                      │                          │                        │
  │── Enter OTP + ───────►│                          │                        │
  │   New Password       │── POST /verify-forgot-otp►│                        │
  │                      │                          │── verifyOTP() ────────►│
  │                      │                          │◄── OTP valid, deleted ──│
  │                      │◄── {success: true} ───────│                        │
  │                      │── POST /reset-password ──►│                        │
  │                      │                          │── bcrypt.hash(password)
  │                      │                          │── user.save() ─────────►│
  │                      │◄── {success: true} ───────│                        │
  │◄── Redirect /login ──│                          │                        │
```

---

## 🔑 Key Security Features

| Feature | How it's implemented |
|---|---|
| **OTP Expiry** | `expiresAt = Date.now() + 10 min` — auto expires |
| **One-time use** | OTP deleted from DB after successful verify |
| **Old OTP cleanup** | `deleteMany({email})` before saving new OTP |
| **Password Hashing** | bcrypt with salt rounds = 10 |
| **Email Validation** | Zod schema + custom `isValidEmail()` util |
| **Password Strength** | Zod regex: uppercase + lowercase + number + special char |
| **No plaintext OTP storage** | OTP stored as plain string but deleted after use |

---

## 📦 All API Endpoints (Auth)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register (stores temp data, sends OTP) |
| POST | `/auth/verify-otp` | Verify registration OTP, create user |
| POST | `/auth/login` | Login with email + password |
| POST | `/auth/forgot-password` | Send reset OTP to email |
| POST | `/auth/verify-forgot-otp` | Verify OTP for password reset |
| POST | `/auth/reset-password` | Set new password after OTP verified |
| POST | `/auth/resend-otp` | Resend OTP to same email |
| POST | `/auth/logout` | Logout (clears session) |
