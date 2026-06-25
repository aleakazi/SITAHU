import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sheet: string }> }
) {
  try {
    const { sheet } = await params;
    if (!sheet) {
      return Response.json(
        { error: "Sheet parameter is required" },
        { status: 400 }
      );
    }

    const gasUrl = process.env.GAS_WEB_APP_URL;
    if (!gasUrl) {
      return Response.json(
        { error: "GAS_WEB_APP_URL is not configured in environment variables" },
        { status: 500 }
      );
    }

    // Forward request to Google Apps Script Web App
    const targetUrl = `${gasUrl}?sheet=${encodeURIComponent(sheet)}`;
    
    // We add cache: 'no-store' or next: { revalidate: 0 } to ensure fresh data.
    const res = await fetch(targetUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { error: `Google Apps Script returned status ${res.status}` },
        { status: res.status || 500 }
      );
    }

    const json = await res.json();
    if (json.status !== "success") {
      return Response.json(
        { error: json.message || "Failed to fetch data from Google Sheets" },
        { status: 400 }
      );
    }

    // Return the sheet data (can be dictionary for 'all' or list of records for specific sheet)
    return Response.json(json.data);
  } catch (error: any) {
    console.error("Error in sheets proxy route:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
