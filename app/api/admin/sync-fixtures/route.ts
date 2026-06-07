import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const userId = request.headers
    .get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("user_id="))
    ?.split("=")[1];

  if (!userId) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/login" },
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/dashboard" },
    });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return new Response("API_FOOTBALL_KEY ontbreekt.", { status: 500 });
  }

  const apiResponse = await fetch(
    "https://v3.football.api-sports.io/fixtures?league=1&season=2026",
    {
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    }
  );

  const apiData = await apiResponse.json();
  const fixtures = apiData.response || [];

  const { data: matches } = await supabase
    .from("matches")
    .select("id, match_date, home_team, away_team");

  const { data: teams } = await supabase
    .from("teams")
    .select("name, api_name");

  const apiNameByDutchName = new Map(
    (teams || []).map((team) => [team.name, team.api_name || team.name])
  );

  let updated = 0;

  for (const match of matches || []) {
    const homeApiName = apiNameByDutchName.get(match.home_team);
    const awayApiName = apiNameByDutchName.get(match.away_team);

    let fixture = fixtures.find((fixture: any) => {
      const apiHome = fixture.teams?.home?.name;
      const apiAway = fixture.teams?.away?.name;
      const apiDate = fixture.fixture?.date?.slice(0, 10);

      return (
        apiHome === homeApiName &&
        apiAway === awayApiName &&
        apiDate === match.match_date
      );
    });

    if (!fixture) {
      fixture = fixtures.find((fixture: any) => {
        const apiHome = fixture.teams?.home?.name;
        const apiAway = fixture.teams?.away?.name;

        return apiHome === homeApiName && apiAway === awayApiName;
      });
    }

    if (fixture?.fixture?.id) {
      await supabase
        .from("matches")
        .update({ fixture_id: fixture.fixture.id })
        .eq("id", match.id);

      updated++;
    }
  }

  return new Response(null, {
    status: 303,
    headers: { Location: `/admin?fixtures_synced=${updated}` },
  });
}