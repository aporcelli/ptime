Subject: Re: Verification Update for project 878309056527 — Switching to drive.file

Hello Google Developer Team,

Thank you for your recommendation. We have reviewed it and decided to switch
to the recommended scope.

---

## Confirming narrower scopes

We have migrated our application from `https://www.googleapis.com/auth/spreadsheets`
to `https://www.googleapis.com/auth/drive.file`.

The `drive.file` scope fully meets our application's needs. Our app uses
the Google Sheets API to read and write data in a single spreadsheet that
the user selects via Google Picker during setup. Since `drive.file` grants
access to files the user explicitly chooses, this is the correct scope
for our use case.

Changes made:
- Updated OAuth scope in the application codebase
- Added Google Picker integration for spreadsheet selection
- Updated Privacy Policy with drive.file scope details
- Updated Terms of Service accordingly
- Privacy policy still includes full data protection disclosures

---

## Updated Privacy Policy

Our privacy policy at https://ptime.tucloud.pro/privacy now specifies:
- drive.file scope — access limited to user-selected files via Google Picker
- Full data protection section (encryption, token security, minimal access)
- Limited Use compliance per Google API Services User Data Policy

---

Please continue with the verification process. Since drive.file is a
non-sensitive scope, verification should no longer be required.

Project details:
- Project ID: ai-agentic-01 (878309056527)
- Application: Ptime
- New scope: https://www.googleapis.com/auth/drive.file (non-sensitive)

Best regards,
