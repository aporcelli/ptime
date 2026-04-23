// lib/sheets/master-edge.ts
// Edge-compatible: usa fetch() directo a Google Sheets API REST.
// Para uso desde auth.ts (que corre en Node runtime, pero evita dependencias pesadas).

interface JWTHeader {
  alg: "RS256";
  typ: "JWT";
}

interface JWTClaim {
  iss: string;
  scope: string;
  aud: string;
  exp: number;
  iat: number;
}

/**
 * Genera un JWT firmado RS256 manualmente (Service Account → access_token de Google).
 * Edge-compatible vía Web Crypto API.
 */
async function getServiceAccountAccessToken(
  serviceAccountEmail: string,
  privateKey: string
): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header: JWTHeader = { alg: "RS256", typ: "JWT" };
    const claim: JWTClaim = {
      iss: serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const enc = (obj: object) =>
      btoa(JSON.stringify(obj))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const headerB64 = enc(header);
    const claimB64 = enc(claim);
    const signingInput = `${headerB64}.${claimB64}`;

    // Importar private key (PEM → CryptoKey)
    const pemContents = privateKey
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, "");

    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(signingInput)
    );

    const sigBytes = new Uint8Array(signature);
    let sigStr = "";
    for (let i = 0; i < sigBytes.length; i++) sigStr += String.fromCharCode(sigBytes[i]);
    const sigB64 = btoa(sigStr)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${signingInput}.${sigB64}`;

    // Intercambiar JWT por access_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      console.error("[master-edge] Token exchange failed:", await tokenRes.text());
      return null;
    }

    const data = await tokenRes.json();
    return data.access_token ?? null;
  } catch (err) {
    console.error("[master-edge] Error generating service account token:", err);
    return null;
  }
}

/**
 * Busca el sheetId asociado a un email en el MASTER_SHEET (Workspace_Members).
 * Edge-compatible.
 */
export async function findSharedSheetForEmailEdge(email: string): Promise<string | null> {
  const masterSheetId = process.env.MASTER_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!masterSheetId || !serviceAccountEmail || !privateKey) return null;

  const accessToken = await getServiceAccountAccessToken(serviceAccountEmail, privateKey);
  if (!accessToken) return null;

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${masterSheetId}/values/Workspace_Members!A:B`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      console.error("[master-edge] Sheets API error:", await res.text());
      return null;
    }

    const data = await res.json();
    const rows: string[][] = data.values ?? [];

    // Buscar de abajo hacia arriba para tomar la entrada más reciente
    for (let i = rows.length - 1; i >= 1; i--) {
      const row = rows[i];
      if (row[0]?.toString().trim().toLowerCase() === email.toLowerCase()) {
        if (row[1]) return row[1].toString().trim();
      }
    }
  } catch (err) {
    console.error("[master-edge] Error querying master sheet:", err);
  }

  return null;
}
