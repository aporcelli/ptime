// app/actions/drive.ts
"use server";

import { auth } from "@/auth";

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export async function listUserSpreadsheets(): Promise<{
  files: DriveFile[];
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.accessToken) {
    return { files: [], error: "Not authenticated." };
  }

  try {
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,modifiedTime)",
      {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return { files: [], error: `Drive API ${res.status}: ${text}` };
    }

    const data = (await res.json()) as { files: DriveFile[] };
    return { files: data.files ?? [] };
  } catch (e: any) {
    return { files: [], error: e?.message ?? "Failed to list files." };
  }
}

export async function createPtimeSpreadsheet(): Promise<{
  fileId?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.accessToken) {
    return { error: "Not authenticated." };
  }

  try {
    const res = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Ptime — Time Tracking",
        mimeType: "application/vnd.google-apps.spreadsheet",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: `Drive API ${res.status}: ${text}` };
    }

    const data = (await res.json()) as { id: string };
    return { fileId: data.id };
  } catch (e: any) {
    return { error: e?.message ?? "Failed to create sheet." };
  }
}
