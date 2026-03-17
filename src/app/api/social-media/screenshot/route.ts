import { NextResponse } from "next/server";

const MIRROR_SERVER = "http://127.0.0.1:4780";

export async function GET() {
  try {
    const res = await fetch(`${MIRROR_SERVER}/screenshot`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Mirror server error" },
        { status: 503 }
      );
    }

    const data = await res.json();

    if (!data.image) {
      return NextResponse.json(
        { error: "No image data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: `data:image/png;base64,${data.image}`,
      timestamp: Date.now(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Check if mirror server is running
    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      return NextResponse.json(
        {
          error:
            "Mirror server not running. Start it: cd tools/social-media-manager && node mirror-server.js",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
