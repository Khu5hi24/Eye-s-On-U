# 🔐 Forgot Password — Poora Flow Samjho (Easy Language mein)

> **Project: Eye-s-On-U** | Tumhare sir ke task ka complete jawab

---

## 🗺️ Simple Flow Diagram (Pehle Bada Picture Dekho)

```
USER                    FRONTEND                  BACKEND                   DATABASE (MongoDB)
 |                          |                          |                           |
 |-- "Forgot Password" -->  |                          |                           |
 |                          |                          |                           |
 |  [Step 1: Email Enter]   |                          |                           |
 |-- Enter Email -------->  |                          |                           |
 |                          |-- POST /forgot-password->|                           |
 |                          |                          |-- User.findOne(email) --> |
 |                          |                          |<-- User milgaya ----------|
 |                          |                          |-- generateOTP() --------> |
 |                          |                          |-- OTP save (10 min) ----> |
 |                          |                          |-- Email bhejna (SMTP) --> 📧
 |                          |<-- { success: true } ----|                           |
 |<-- "OTP Sent!" toast --  |                          |                           |
 |                          |                          |                           |
 |  [Step 2: OTP + New Password Enter]                 |                           |
 |-- OTP + Password ------>  |                         |                           |
 |                          |-- POST /verify-forgot-otp>|                          |
 |                          |                          |-- OTP.findOne(email,otp)->|
 |                          |                          |<-- Match mila! -----------|
 |                          |                          |-- OTP delete karo ------> |
 |                          |<-- { success: true } ----|                           |
 |                          |                          |                           |
 |                          |-- POST /reset-password ->|                           |
 |                          |                          |-- User.findOne(email) --> |
 |                          |                          |-- bcrypt hash password    |
 |                          |                          |-- user.save() ----------> |
 |                          |<-- { success: true } ----|                           |
 |<-- Redirect to /login -- |                          |                           |
```

---

## 📁 File Structure — Kaun Kya Karta Hai?

```
Eye-s-On-U/
├── FRONTEND (Next.js)
│   ├── src/app/(auth)/forgot-password/page.tsx   ← UI (jo user dekhta hai)
│   ├── src/store/auth.store.ts                   ← State management (Zustand)
│   ├── src/services/auth.service.ts              ← API calls (axios)
│   └── src/hooks/useAuth.ts                      ← Store ka shortcut
│
└── BACKEND (Node.js + Express)
    ├── src/routes/auth.routes.ts                 ← URL paths define karta hai
    ├── src/controllers/auth.controller.ts        ← Business logic (main brain)
    ├── src/services/otp.service.ts               ← OTP save/verify logic
    ├── src/services/mail.service.ts              ← Email bhejta hai
    ├── src/utils/generateOTP.ts                  ← 6-digit OTP banata hai
    ├── src/utils/hashPassword.ts                 ← Password encrypt karta hai
    └── src/models/
        ├── OTP.model.ts                          ← OTP ka database schema
        └── User.model.ts                         ← User ka database schema
```

---

## 🎯 3 API Routes (Backend ke Doors)

| Route | Method | Kya karta hai |
|-------|--------|---------------|
| `/auth/forgot-password` | POST | Email se OTP bhejta hai |
| `/auth/verify-forgot-otp` | POST | OTP check karta hai |
| `/auth/reset-password` | POST | Password badal deta hai |

---

## 📖 Step-by-Step Detailed Explanation

### 🟡 STEP 1 — User Email Enter Karta Hai

**Frontend (UI) — `page.tsx`**
```
User email dalke "Send OTP" click karta hai
   ↓
Zod validation (email valid hai?) check hota hai
   ↓
handleEmailSubmit() function call hota hai
   ↓
forgotPassword(email) function call hota hai (auth store se)
```

**Auth Store — `auth.store.ts` (Line 204-217)**
```typescript
forgotPassword: async (email) => {
    set({ loading: true });           // Button disabled ho jata hai
    await authService.forgotPassword({ email });  // API call
    return true;                      // Success!
}
```

**Auth Service — `auth.service.ts` (Line 26)**
```typescript
forgotPassword: (payload) => api.post('/auth/forgot-password', payload)
// Yeh axios se HTTP POST request bhejta hai backend ko
```

---

**Backend Controller — `auth.controller.ts` (Line 156-172)**
```typescript
export const forgotPassword = async (req, res) => {
  const email = req.body.email;              // 1. Email lo request se
  const user = await User.findOne({ email }); // 2. Database mein dhundho
  
  if (!user) return res.status(404)...;      // 3. Nahi mila? Error do
  
  const otp = generateOTP();                 // 4. 6-digit OTP banao
  await saveOTP(email, otp);                 // 5. Database mein save karo (10 min)
  await sendOTPEmail(email, otp, ...);       // 6. Email bhejo
  
  res.status(200).json({ success: true });   // 7. Frontend ko batao
};
```

**OTP Generator — `generateOTP.ts`**
```typescript
Math.floor(100000 + Math.random() * 900000).toString()
// Random 6-digit number: jaise 847293
```

**OTP Save — `otp.service.ts` (saveOTP)**
```typescript
const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minute baad expire
await OTP.deleteMany({ email });    // Purana OTP delete karo
await OTP.create({ email, otp, expiresAt }); // Naya OTP save karo
```

**OTP Database Schema — `OTP.model.ts`**
```
{
  email: "user@example.com",
  otp: "847293",
  expiresAt: "2026-07-04 12:10:00",   ← 10 minute ka timer
  tempUserData: null                   ← (Registration ke liye use hota, yahan null)
}
```

**Mail Service — `mail.service.ts`**
```typescript
// Nodemailer se email bhejta hai SMTP ke through
// Subject: "Reset Your Password"
// Body: "Use the OTP to reset your password. OTP: 847293"
```

---

### 🟡 STEP 2 — User OTP Aur New Password Enter Karta Hai

**Frontend (UI) — `page.tsx`**
```
User 3 cheezein enter karta hai:
  1. OTP (6 digits)
  2. New Password
  3. Confirm Password
   ↓
Pehle OTP verify hota hai
   ↓
Phir password reset hota hai
```

**handleResetSubmit() — `page.tsx` (Line 122-136)**
```typescript
// 1. Pehle OTP verify karo
const otpSuccess = await verifyForgotOtp(email, data.otp);
if (!otpSuccess) { // OTP galat hai? Rok do
  setBackendError('OTP verification failed...');
  return;
}

// 2. OTP sahi tha? Ab password reset karo
const resetSuccess = await resetPassword(email, data.password, data.confirmPassword);
if (resetSuccess) {
  showToast('Password reset successfully!', 'success');
  router.push('/login'); // Login page pe bhejo
}
```

---

**Backend — Verify OTP — `auth.controller.ts` (Line 174-188)**
```typescript
export const verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;
  const valid = await verifyOTP(email, otp); // Database mein check karo
  
  if (!valid) return res.status(400).json({ message: 'Invalid or expired OTP.' });
  
  res.status(200).json({ success: true }); // OTP sahi hai!
};
```

**OTP Verify Logic — `otp.service.ts` (verifyOTP)**
```typescript
const record = await OTP.findOne({ email, otp }); // Email + OTP match?
if (!record) return null;                          // Nahi mila? Galat OTP

if (record.expiresAt < new Date()) {               // 10 min se zyada ho gaya?
  await OTP.deleteOne({ _id: record._id });        // OTP delete karo
  return null;                                     // Expire! Error do
}

await OTP.deleteOne({ _id: record._id }); // Use hone ke baad OTP delete (one-time use!)
return record;                            // Valid hai!
```

---

**Backend — Reset Password — `auth.controller.ts` (Line 190-206)**
```typescript
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }); // User dhundho
  
  user.password = await hashPassword(password); // bcrypt se encrypt karo
  await user.save();                            // Database mein save karo
  
  res.status(200).json({ success: true, message: 'Password reset successfully.' });
};
```

**Password Hashing — `hashPassword.ts`**
```typescript
// bcrypt use hota hai — password ko salted hash mein convert karta hai
// Salt Rounds = 10 → matlab 2^10 = 1024 baar hash hota hai (secure!)
bcrypt.hash(password, 10)
// "MyPass@123" → "$2b$10$xyz..." (irreversible encrypted string)
```

---

## 🧠 Key Concepts — Easy mein

### OTP Kya Hai?
- **One Time Password** — sirf ek baar use hota hai
- **6 digit random number** — jaise 847293
- **10 minutes** mein expire ho jata hai
- Use hone ke baad **turant delete** ho jata hai DB se

### Kyun OTP Use Kiya?
- Verify karna ki **real email owner** hi password reset kar raha hai
- Hacker ne email guess karli? OTP nahi hai uske paas!

### Password Hashing Kya Hai?
- Original password **kabhi database mein save nahi hota**
- bcrypt ek **one-way encryption** karta hai
- Agar database hack ho bhi jaye, password safe rahega

### Security Points:
| Point | Detail |
|-------|--------|
| OTP Expiry | 10 minutes ke baad automatically delete |
| OTP One-Time | Verify hone ke baad turant delete |
| Old OTP | Naya OTP aane pe purana automatically delete |
| Password | bcrypt se hashed (10 salt rounds) |
| Email | Lowercase + trim kiya jaata hai (case issues se bachne ke liye) |

---

## 🔄 Complete Flow Summary (Ek Line mein)

```
Email Enter → OTP Email aaya → OTP + New Password Enter → 
OTP Check (valid? + 10 min?) → Password bcrypt hash → DB Save → Login Page
```

---

## 📊 Database Changes During Flow

| Step | OTP Collection | User Collection |
|------|---------------|-----------------|
| Forgot Password request | OTP record create (email, otp, expiresAt) | Koi change nahi |
| Verify OTP (success) | OTP record **delete** ho jata hai | Koi change nahi |
| Reset Password | Koi change nahi | password field **update** |

---

## 🗂️ Relevant Files (Click to Open)

- [forgot-password/page.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/(auth)/forgot-password/page.tsx) — UI Page
- [auth.store.ts](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/store/auth.store.ts) — State Management
- [auth.service.ts](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/services/auth.service.ts) — API Calls
- [auth.controller.ts](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/backend/src/controllers/auth.controller.ts) — Backend Logic
- [auth.routes.ts](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/backend/src/routes/auth.routes.ts) — Routes
- [otp.service.ts](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/backend/src/services/otp.service.ts) — OTP Logic
- [mail.service.ts](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/backend/src/services/mail.service.ts) — Email
- [OTP.model.ts](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/backend/src/models/OTP.model.ts) — OTP Schema
- [User.model.ts](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/backend/src/models/User.model.ts) — User Schema
