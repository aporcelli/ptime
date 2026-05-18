import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const accessToken = session?.user?.accessToken;
    if (!accessToken) {
      return new Response("unauthorized", { status: 401 });
    }

    const userInfoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!userInfoRes.ok) {
      return new Response("userinfo_failed", { status: 502 });
    }

    const userInfo = (await userInfoRes.json()) as { picture?: string };
    const pictureUrl = userInfo.picture;
    if (!pictureUrl) {
      return new Response("no_picture", { status: 404 });
    }

    const imgRes = await fetch(pictureUrl, { cache: "no-store" });
    if (!imgRes.ok) {
      return new Response("image_fetch_failed", { status: 502 });
    }

    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imgRes.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=600, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new Response("avatar_error", { status: 500 });
  }
}
