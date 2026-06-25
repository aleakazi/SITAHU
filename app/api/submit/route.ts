import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Log the incoming payload in the server terminal
    console.log("\n--- [POST Submit Proxy] Received Payload ---");
    console.log(`Action: ${payload.action}`);
    console.log("Data:", JSON.stringify(payload.data, null, 2));
    console.log("-------------------------------------------\n");
    
    // Validate payload structure
    if (!payload.action || !payload.data) {
      return Response.json(
        { error: "Payload must contain 'action' and 'data' properties" },
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

    // Forward the POST request to Google Apps Script Web App
    const res = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
        { error: json.message || "Failed to submit data to Google Sheets" },
        { status: 400 }
      );
    }

    return Response.json(json);
  } catch (error: any) {
    console.error("Error in submit proxy route:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
