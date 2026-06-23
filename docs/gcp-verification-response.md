Subject: Re: Verification Update for project 878309056527 — All Issues Resolved

Hello Google Developer Team,

Thank you for your thorough review and for the recommendation to use the
drive.file scope. We carefully evaluated it, and here's what we found:

---

## Scope Decision — Unable to use drive.file

We migrated our application to the drive.file scope and integrated the
Google Picker API for file selection. Unfortunately, after extensive
testing we determined that the Google Picker's RPC mechanism is
incompatible with our stack (Next.js 14 App Router + React 18 with
Content Security Policy headers in production). The Picker callback
never fires when deployed, making the drive.file scope non-functional
for our use case.

We have reverted to the **https://www.googleapis.com/auth/spreadsheets**
scope. This is the minimum required scope for our application, which
uses the Google Sheets API (v4) — not the Drive API — to read and write
data in a single spreadsheet the user explicitly configures. Ptime does
not list, browse, or access other files in the user's Drive.

---

## Issues Addressed

### 1. ✅ Homepage is no longer behind a login page
Our root URL https://ptime.tucloud.pro now serves a fully public landing
page that anyone can visit without authentication. It explains:
- What Ptime is (professional time-tracking and invoicing)
- How it works (sign in → connect a sheet → start tracking)
- Key features (data control, tiered billing, live reports, etc.)
- Links to Privacy Policy and Terms of Service

### 2. ✅ Homepage clearly explains the application's purpose
The landing page includes a hero section, feature cards, and a
step-by-step "How it works" section. Available in English (default)
and Spanish.

### 3. ✅ Privacy Policy updated (English)
https://ptime.tucloud.pro/privacy now includes:
- Data we collect (Section 1)
- How we use your data (Section 2)
- Storage and retention (Section 3)
- Limited use of Google API data (Section 4)
- **Data protection and security (Section 5)** — NEW
  - Encryption in transit (HTTPS/TLS 1.2+)
  - Secure token storage (JWT in httpOnly, secure, sameSite cookies)
  - Data at rest in Google Sheets (protected by Google Workspace)
  - Minimal access (only the user-configured spreadsheet)
  - Immediate revocation via myaccount.google.com/permissions
  - No sheet data stored on Ptime servers
- Third parties (Section 6)
- User rights (Section 7)
- Contact: info@tucloud.pro (Section 9)

### 4. ✅ Terms of Service updated (English)
https://ptime.tucloud.pro/terms

---

## Project Details
- Project ID: ai-agentic-01 (878309056527)
- Application: Ptime — Professional time tracking & invoicing
- Scope requested: https://www.googleapis.com/auth/spreadsheets (sensitive)
- Operator: TuCloud.pro
- Support email: info@tucloud.pro

---

Please continue with the verification process. We are available to
provide a demo video or answer any additional questions.

Thank you for your time and patience.

Best regards,
Adrian Porcelli
TuCloud.pro
