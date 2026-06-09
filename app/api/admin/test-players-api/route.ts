export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return Response.json({ error: "API_FOOTBALL_KEY ontbreekt" }, { status: 500 });
  }

  const response = await fetch(
    "https://v3.football.api-sports.io/players/squads?team=2",
    {
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  return Response.json(data);
}