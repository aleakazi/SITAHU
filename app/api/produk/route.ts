const GAS_URL = process.env.GAS_WEB_APP_URL;

export async function GET() {
    const res = await fetch(`${GAS_URL}?sheet=all`);
    const json = await res.json();
    return Response.json(json.data);
}