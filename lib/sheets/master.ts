import { google } from "googleapis";

export async function findSharedSheetForEmail(email: string): Promise<string | null> {
  const masterSheetId = process.env.MASTER_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!masterSheetId || !serviceAccountEmail || !privateKey) return null;

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: "Workspace_Members!A:B",
    });
    const rows = res.data.values ?? [];
    
    // We search from bottom to top to get the latest invitation
    for (let i = rows.length - 1; i >= 1; i--) {
      const row = rows[i];
      if (row[0]?.toString().trim().toLowerCase() === email.toLowerCase()) {
        if (row[1]) return row[1].toString().trim();
      }
    }
  } catch (err) {
    console.error("[Setup] Error querying master sheet:", err);
  }
  return null;
}
